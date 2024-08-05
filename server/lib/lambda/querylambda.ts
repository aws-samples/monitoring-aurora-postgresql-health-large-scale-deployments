import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { listAuroraPostgreSQLInstanceIds } from './listAuroraPostgreSQLInstanceIds';

// Create DynamoDB document client
const dynamodb = new DynamoDB.DocumentClient();

async function getMetricsTracked() {
    const client = new SSMClient();
    const command = new GetParameterCommand({ Name: process.env.METRICS_TRACKED });
    const ssmResponse = await client.send(command);
    const metricsTracked = JSON.parse(ssmResponse.Parameter?.Value || '');
    return metricsTracked;
}

const queryTableByMetricsName = async (metricName: string, startTimeEpoch: string, endTimeEpoch: string, count: boolean) => {
    console.log(metricName, startTimeEpoch, endTimeEpoch);
    if (!metricName || !process.env.DYNAMODB_TABLE_NAME || !startTimeEpoch || !endTimeEpoch || !process.env.DYNAMODB_INDEX_NAME) {
        throw new Error('Missing required parameters');
    }
    let keyConditionExpression = 'MetricName = :metricName AND DateHourTimeZone BETWEEN :startTimeEpoch AND :endTimeEpoch'
    let params: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        IndexName: process.env.DYNAMODB_INDEX_NAME,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: {
            ':metricName': metricName,
            ':startTimeEpoch': parseInt(startTimeEpoch),
            ':endTimeEpoch': parseInt(endTimeEpoch)
        },
        ProjectionExpression: 'InstanceId, MetricName, MetricValueAverage, DateHourTimeZone'
    };
    const result = await dynamodb.query(params).promise();
    return result;
}

const sendSuccessResponse = (response: string) => {
    return {
        statusCode: 200,
        body: response,
        headers: {
            "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
    };
}

// Lambda handler function
export const handler = async (event: APIGatewayEvent) => {
    try {
        switch (event.path) {
            case "/query-all":
                const result = await queryTableByMetricsName(event.queryStringParameters?.metricName || '', event.queryStringParameters?.startTimeEpoch || '', event.queryStringParameters?.endTimeEpoch || '', event.queryStringParameters?.count ? true : false);
                if (event.queryStringParameters?.count) {
                    const groupedItems = result.Items?.reduce((acc, item) => {
                        let { InstanceId, ...rest } = item;
                        if (!acc[InstanceId]) {
                            acc[InstanceId] = [];
                        }
                        acc[InstanceId].push(rest);
                        return acc;
                    }, {});
                    const totalInstances = (await listAuroraPostgreSQLInstanceIds()).length;
                    const failedInstance = Object.keys(groupedItems!).length;
                    return sendSuccessResponse(JSON.stringify({
                        metricName: event.queryStringParameters?.metricName,
                        UnhealthyInstances: failedInstance,
                        HealthyInstances: totalInstances - failedInstance
                    }));
                }
                return sendSuccessResponse(JSON.stringify(result.Items));
                break;
            case "/metricslist":
                const metricsTracked = await getMetricsTracked();
                return sendSuccessResponse(JSON.stringify(metricsTracked));
            default:
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Not found'
                    }),
                    headers: {
                        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Methods": "OPTIONS,GET"
                    }
                }
        }
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: JSON.stringify(error)
            }),
            headers: {
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,GET"
            },
        };
    }
};




