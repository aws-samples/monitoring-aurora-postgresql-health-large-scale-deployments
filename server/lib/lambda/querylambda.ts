import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';
import { APIGatewayEvent } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';


// Create DynamoDB document client
const dynamodb = new DynamoDB.DocumentClient();

const scanTableAndExtractUniqueInstanceIds = async () => {
    const tableName = process.env.DYNAMODB_TABLE_NAME
    if (!tableName) {
        throw new Error('DynamoDB table name not specified');
    }
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: tableName,
        ProjectionExpression: 'InstanceId' // specify the field to project
    };

    const uniqueValues: Set<string> = new Set();

    try {
        // Scan DynamoDB table
        const scanResult = await dynamodb.scan(params).promise();

        // Extract and add unique values from scanned items
        scanResult.Items?.forEach((item) => {
            if (item.InstanceId) {
                uniqueValues.add(item.InstanceId as string);
            }
        });

        // If the result is paginated, continue scanning
        let lastEvaluatedKey = scanResult.LastEvaluatedKey;
        while (lastEvaluatedKey) {
            const paginatedParams: AWS.DynamoDB.DocumentClient.ScanInput = {
                ...params,
                ExclusiveStartKey: lastEvaluatedKey
            };

            const paginatedScanResult = await dynamodb.scan(paginatedParams).promise();
            paginatedScanResult.Items?.forEach((item) => {
                if (item.InstanceId) {
                    uniqueValues.add(item.InstanceId as string);
                }
            });

            lastEvaluatedKey = paginatedScanResult.LastEvaluatedKey;
        }

        return Array.from(uniqueValues);
    } catch (error) {
        console.error('Error scanning DynamoDB table:', error);
        throw error;
    }
};

//function to read querystring parameter instanceId and use it to query InstanceId field in dynamodb table CacheHitRatioMetrics and return matching results in json format
const queryTableByInstanceId = async (instanceId: string, startTimeEpoch: string, endTimeEpoch: string, metricName: string) => {
    console.log(instanceId, startTimeEpoch, endTimeEpoch);
    if (!instanceId || !process.env.DYNAMODB_TABLE_NAME || !startTimeEpoch || !endTimeEpoch) {
        return {
            statusCode: 400,
            body: 'InstanceId parameters or table name not specified'
        };
    }
    let keyConditionExpression = 'InstanceId = :instanceId AND DateHourTimeZone BETWEEN :startTimeEpoch AND :endTimeEpoch'
    let params: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: keyConditionExpression,
        ProjectionExpression: 'MetricValueAverage, DateHourTimeZone, InstanceId, MetricName',
        ExpressionAttributeValues: {
            ':instanceId': instanceId,
            ':startTimeEpoch': parseInt(startTimeEpoch),
            ':endTimeEpoch': parseInt(endTimeEpoch)
        }
    };
    if (metricName !== '') {
        params = {
            ...params,
            ExpressionAttributeValues: {
                ...params.ExpressionAttributeValues,
                ':metricName': metricName
            },
            FilterExpression: 'MetricName = :metricName',
            ProjectionExpression: 'InstanceId, MetricName, MetricValueAverage, DateHourTimeZone',
        }
    }
    const result = await dynamodb.query(params).promise();
    return result.Items
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
    console.log('Event:', event);
    try {
        switch (event.path) {
            case "/query-all-instances":
                const uniqueValues = await scanTableAndExtractUniqueInstanceIds();
                return sendSuccessResponse(JSON.stringify(uniqueValues));
                break;
            case "/query-all":
                const result = await queryTableByInstanceId(event.queryStringParameters?.instanceId || '', event.queryStringParameters?.startTimeEpoch || '', event.queryStringParameters?.endTimeEpoch || '', event.queryStringParameters?.metricName || '');
                return sendSuccessResponse(JSON.stringify(result));
                break;
            case "/metricslist":
                const client = new SSMClient();
                const command = new GetParameterCommand({ Name: process.env.METRICS_TRACKED });
                const ssmResponse = await client.send(command);
                const metricsTracked = JSON.parse(ssmResponse.Parameter?.Value || '');
                return sendSuccessResponse(JSON.stringify(metricsTracked));
            default:
                return {
                    statusCode: 404,
                    body: JSON.stringify({
                        message: 'Not found'
                    })
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



