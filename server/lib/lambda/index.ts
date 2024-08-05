import { CloudWatch, StandardUnit, Statistic } from '@aws-sdk/client-cloudwatch';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm"
import { EventBridgeHandler, EventBridgeEvent, Context, Callback } from 'aws-lambda';
import { listAuroraPostgreSQLInstanceIds } from './listAuroraPostgreSQLInstanceIds';
import { evaluate } from 'mathjs';

type MetricConfig = {
    name: string;
    threshold: number;
    thresholdOperator: string;
}

const getCloudWatchMetric = async (db_instance_id: string, metricConfig: MetricConfig, startTime: Date, endTime: Date) => {
    
    const cloudwatch = new CloudWatch();
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
        Statistics: [Statistic.Maximum],
        ...metricConfig.name !== 'FreeableMemory' && { Unit: 'Percent' }
    });
    return data.Datapoints ?? [];
}


const iterateLogs = async (numberOfHours: number, metricsTracked: MetricConfig[]) => {
    const instanceIds = await listAuroraPostgreSQLInstanceIds();
    const initialTime = new Date();
    //TODO - failure only if 6 hours constantly failed
    for (let hour = numberOfHours; hour > 0; hour--) {
        const startTime = new Date();
        startTime.setHours(initialTime.getHours() - hour, 0, 0, 0);
        const endTime = new Date();
        endTime.setHours(startTime.getHours() + 1, 0, 0, 0);
        for (const instanceId of instanceIds) {
            for (const metric of metricsTracked) {
                console.log(`Calculating ${metric.name} for ${instanceId} for ${startTime} and ${endTime}`);
                const dataPoints = await getCloudWatchMetric(instanceId, metric, startTime, endTime);
                console.log(dataPoints);
                for (const dataPoint of dataPoints) {
                    const expression = `${dataPoint.Maximum}${metric.thresholdOperator}${metric.threshold}`
                    console.log(expression);
                    if (dataPoint.Maximum && evaluate(`${dataPoint.Maximum}${metric.thresholdOperator}${metric.threshold}`)) {
                        const Maximum = dataPoint.Maximum.toFixed(2);
                        const startTimeMs = startTime.getTime();
                        const startTimeEpoch = Math.floor(startTimeMs / 1000);
                        insertIntoDynamoDb(instanceId, metric.name, Maximum, startTimeEpoch);
                    }
                }
            }

        }
    }

}

const insertIntoDynamoDb = async (instanceId: string, metric: string, average: string, startTimeEpoch: number) => {
    console.log(`Inserting into dynamodb ${instanceId} for ${metric} ${average} ${startTimeEpoch}`);
    const dynamodb = new DynamoDB();
    const putResult = dynamodb.putItem({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            'InstanceId': { S: instanceId },
            'MetricName': { S: metric },
            'MetricValueAverage': { N: average },
            'DateHourTimeZone': { N: startTimeEpoch.toString() },
            'DateInstance': {S: `${metric}#${instanceId}`}
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
