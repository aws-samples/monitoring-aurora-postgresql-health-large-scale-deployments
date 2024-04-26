import { CloudWatch, StandardUnit, Statistic } from '@aws-sdk/client-cloudwatch';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { RDS } from '@aws-sdk/client-rds';
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm"
import { EventBridgeHandler, EventBridgeEvent, Context, Callback } from 'aws-lambda';

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
        Statistics: ['Maximum'],
        Unit: 'Percent'
    });
    return data.Datapoints ?? [];
}


async function listAuroraPostgreSQLInstanceIds(): Promise<string[]> {
    // Set up the RDS client
    const rdsClient = new RDS();
    try {
        // Get the list of RDS clusters
        const clusters = await rdsClient.describeDBClusters({});
        const instanceIds: string[] = [];
        clusters.DBClusters?.forEach(cluster => {
            instanceIds.push(cluster.DBClusterIdentifier!);
        }
        );
        return instanceIds;
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
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
                const dataPoints = await getCloudWatchMetric(instanceId, metric, startTime, endTime);
                console.log(dataPoints);
                for (const dataPoint of dataPoints) {
                    const expression = `${dataPoint.Average}${metric.thresholdOperator}${metric.threshold}`
                    console.log(expression);
                    if (dataPoint.Average && eval(`${dataPoint.Average}${metric.thresholdOperator}${metric.threshold}`)) {
                        const average = dataPoint.Average.toFixed(2);
                        const startTimeMs = startTime.getTime();
                        const startTimeEpoch = Math.floor(startTimeMs / 1000);
                        insertIntoDynamoDb(instanceId, metric.name, average, startTimeEpoch);
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
            'DateHourTimeZone': { N: startTimeEpoch.toString() }
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
