import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { RDS } from '@aws-sdk/client-rds';
import { EventBridgeHandler, EventBridgeEvent, Context, Callback } from 'aws-lambda';

const getCloudWatchMetric = async (cloudwatch: CloudWatch, db_instance_id: string, startTime: Date, endTime: Date) => {
    //console.log(`Getting CloudWatch metric for ${db_instance_id}`);
    const data = await cloudwatch.getMetricStatistics({
        Namespace: 'AWS/RDS',
        MetricName: 'BufferCacheHitRatio',
        Dimensions: [
            {
                Name: 'DBInstanceIdentifier',
                Value: db_instance_id
            }
        ],
        StartTime: startTime,
        EndTime: endTime,
        Period: 3600,
        Statistics: ['Average'],
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

const iterateLogs = async () => {
    const instanceIds = await listAuroraPostgreSQLInstanceIds();
    const startTime = new Date();
    const endTime = new Date();
    for (let hour = 0; hour < 24; hour++) {
        //set startTime to hour and endtime to startime plus one hour
        startTime.setHours(hour, 0, 0, 0);
        endTime.setHours(hour + 1, 0, 0, 0);
        for (const instanceId of instanceIds) {
            console.log(`Calculating for ${instanceId} for ${startTime} and ${endTime}`);
            const cloudwatch = new CloudWatch({ region: 'us-east-1' });
            const dataPoints = await getCloudWatchMetric(cloudwatch, instanceId, startTime, endTime);
            console.log(dataPoints);
            //Iterate dataPoints
            for (const dataPoint of dataPoints) {
                //if datapoint average <= 99.9 create a report_item object with instanceId, datapoint average and starttime
                if (dataPoint.Average && dataPoint.Average <= 99.9) {
                    //format datapoint.average as a string with 2 decimal places
                    const average = dataPoint.Average.toFixed(2);
                    // Get timestamp in milliseconds
                    const startTimeMs = startTime.getTime();
                    // Convert to seconds 
                    const startTimeEpoch = Math.floor(startTimeMs / 1000);
                    //insert ReportItem in dynamodb table named CacheHitRatioMetrics
                    insertIntoDynamoDb(instanceId, average, startTimeEpoch);
                }
            }
        }
    }

}

const insertIntoDynamoDb = async (instanceId: string, average: string, startTimeEpoch: number) => {
    console.log(`Inserting into dynamodb ${instanceId} ${average} ${startTimeEpoch}`);
    const dynamodb = new DynamoDB();
    const putResult = dynamodb.putItem({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            'InstanceId': { S: instanceId },
            'MetricValueAverage': { N: average },
            'DateHourTimeZone': { N: startTimeEpoch.toString() }
        }
    });
    return true;
}

export const iterateLogsOnASchedule: EventBridgeHandler<"Dynamo Entry", any, void> = async (event: EventBridgeEvent<any, any>) => {
    console.log(event);
    await iterateLogs();
}
