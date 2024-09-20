import { CloudWatch, StandardUnit, Statistic } from '@aws-sdk/client-cloudwatch';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm"
import { EventBridgeHandler, EventBridgeEvent, Context, Callback } from 'aws-lambda';
import { listAuroraPostgreSQLInstanceIds } from './listAuroraPostgreSQLInstanceIds';
import { evaluate } from 'mathjs';

type MetricConfig = {
    name: string;
    threshold: number;
    statistics: string;
    unit: string;
}

const getCloudWatchMetric = async (db_instance_id: string, metricConfig: MetricConfig, startTime: Date, endTime: Date) => {
    
    const cloudwatch = new CloudWatch();
    const statisticsFunction = await getStatisticsFunction(metricConfig.statistics);
    const data = await cloudwatch.getMetricStatistics({
        Namespace: 'AWS/RDS',
        MetricName: metricConfig.name,
        Dimensions: [
            {
                Name: 'DBInstanceIdentifier',
                Value: db_instance_id
            }
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: [statisticsFunction],
        ...metricConfig.unit === 'Percent' && { Unit: 'Percent' }
    });
    return data.Datapoints ?? [];
}


const iterateLogs = async (numberOfHours: number, metricsTracked: MetricConfig[]) => {
    const instanceIds = await listAuroraPostgreSQLInstanceIds();
    const initialTime = new Date();
    for (let hour = numberOfHours; hour > 0; hour--) {
        const startTime = new Date();
        startTime.setHours(initialTime.getHours() - hour, 0, 0, 0);
        const endTime = new Date();
        endTime.setHours(startTime.getHours() + 1, 0, 0, 0);
        for (const instanceId of instanceIds) {
            for (const metric of metricsTracked) {
                console.log(`Calculating ${metric.name} for ${instanceId} for ${startTime} and ${endTime}`);
                const thresholdOperator = await getThresholdOperator(metric.statistics);
                const dataPoints = await getCloudWatchMetric(instanceId, metric, startTime, endTime);
                console.log(dataPoints);
                for (const dataPoint of dataPoints) {
                    const data = (await getData(dataPoint, metric)).toFixed(2);
                    const expression = `${data}${thresholdOperator}${metric.threshold}`
                    console.log(expression);
                    if (evaluate(expression)) {
                        const startTimeMs = startTime.getTime();
                        const startTimeEpoch = Math.floor(startTimeMs / 1000);
                        insertIntoDynamoDb(instanceId, metric.name, data, startTimeEpoch);
                    }
                }
            }

        }
    }

}

const getData = async (dataPoint: any, metric: MetricConfig) => {
    switch (metric.statistics) {
        case 'Maximum':
            return Number(dataPoint.Maximum);
        case 'Minimum':
            return Number(dataPoint.Minimum);
        default:
            throw new Error(`Unsupported statistics: ${metric.statistics}`);
    }
}

const getStatisticsFunction = async(statistics: string) => {
    switch (statistics) {
        case 'Maximum':
            return Statistic.Maximum;
        case 'Minimum':
            return Statistic.Minimum;
        default:
            throw new Error(`Unsupported statistics: ${statistics}`);
    }
}

const getThresholdOperator = async(statistics: string) => {
    switch (statistics) {
        case 'Maximum':
            return '>=';
        case 'Minimum':
            return '<=';
        default:
            throw new Error(`Unsupported statistics: ${statistics}`);
    }
}   

const insertIntoDynamoDb = async (instanceId: string, metric: string, value: string, startTimeEpoch: number) => {
    console.log(`Inserting into dynamodb ${instanceId} for ${metric} ${value} ${startTimeEpoch}`);
    const dynamodb = new DynamoDB();
    const putResult = dynamodb.putItem({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            'InstanceId': { S: instanceId },
            'MetricName': { S: metric },
            'MetricValue': { N: value },
            'DateHourTimeZone': { N: startTimeEpoch.toString() },
            'DateInstance': { S: `${instanceId}#${startTimeEpoch.toString()}` }
        }
    });
    return true;
}

export const iterateLogsOnASchedule: EventBridgeHandler<"Dynamo Entry", any, void> = async (event: EventBridgeEvent<any, any>) => {
    const numberOfHours: number = parseInt(process.env.NUMBER_OF_HOURS_TO_CAPTURE_DATA_FOR || '') || 1;
    //Get the metrics to be tracked from SSM Parameter, which is stored in enviroment METRICS_TRACKED
    const client = new SSMClient();
    const command = new GetParameterCommand({ Name: process.env.METRICS_TRACKED });
    const response = await client.send(command);
    const metricsTracked: MetricConfig[] = JSON.parse(response.Parameter?.Value || '');
    console.log(metricsTracked);
    await iterateLogs(numberOfHours, metricsTracked);
}
