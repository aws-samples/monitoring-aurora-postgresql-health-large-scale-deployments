//Write a function that reads cloudwatch metric with  Namespace='AWS/RDS', MetricName='BufferCacheHitRatio', Dimensions=[{'Name': 'DBInstanceIdentifier', 'Value': db_instance_id}]
import { CloudWatch } from '@aws-sdk/client-cloudwatch';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { RDS } from '@aws-sdk/client-rds';

export const getCloudWatchMetric = async (cloudwatch: CloudWatch, db_instance_id: string, startTime: Date, endTime: Date) => {
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

    for (let day = 1; day <= 10; day++) {
        //Calculate number of days backwards from now until day
        const startTime = new Date();
        startTime.setDate(startTime.getDate() - day);
        const endTime = new Date();
        endTime.setDate(endTime.getDate() - day + 1);
        for (let hour = 0; hour < 24; hour++) {
            for (const instanceId of instanceIds) {
                const cloudwatch = new CloudWatch({ region: 'us-east-1' });
                const dataPoints = await getCloudWatchMetric(cloudwatch, instanceId, startTime, endTime);
                //Iterate dataPoints
                for (const dataPoint of dataPoints) {
                    //if datapoint average <= 99.9 create a report_item object with instanceId, datapoint average and starttime
                    if (dataPoint.Average && dataPoint.Average <= 99.9) {
                        //format datapoint.average as a string with 2 decimal places
                        const average = dataPoint.Average.toFixed(2);
                        //format startTime into Year-Month-Date Hour and Timezone format
                        const startTimeFormatted = startTime.toLocaleString('en-US', { timeZoneName: 'short' })
                        //insert ReportItem in dynamodb table named BufferCacheHitRatioMetrics
                        insertIntoDynamoDb(instanceId, average, startTimeFormatted);
                    }
                }
            }
        }
    }
}


export const insertIntoDynamoDb = async (instanceId: string, average: string, startTimeFormatted: string) => {
    const dynamodb = new DynamoDB();
    const putResult = dynamodb.putItem({
        TableName: 'BufferCacheHitRatioMetrics',
        Item: {
            'InstanceId': { S: instanceId },
            'MetricValueAverage': { N: average },
            'DateHourTimeZone': { S: startTimeFormatted }
        }
    });
    return true;
}
