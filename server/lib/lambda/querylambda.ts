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
const queryTableByInstanceId = async (instanceId: string, startTimeEpoch: string, endTimeEpoch: string) => {
    console.log(instanceId, startTimeEpoch, endTimeEpoch);
    if (!instanceId || !process.env.DYNAMODB_TABLE_NAME || !startTimeEpoch || !endTimeEpoch) {
        return {
            statusCode: 400,
            body: 'InstanceId parameters or table name not specified'
        };
    }

    const params: AWS.DynamoDB.DocumentClient.QueryInput = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: 'InstanceId = :instanceId AND DateHourTimeZone BETWEEN :startTimeEpoch AND :endTimeEpoch',
        ExpressionAttributeValues: {
            ':instanceId': instanceId,
            ':startTimeEpoch': parseInt(startTimeEpoch),
            ':endTimeEpoch': parseInt(endTimeEpoch)
        }
    };
    const result = await dynamodb.query(params).promise();
    return result.Items
}


// Lambda handler function
export const handler = async (event: APIGatewayEvent) => {
    console.log(event);
    try {
        if (event.path === "/query-all-instances") {
            const uniqueValues = await scanTableAndExtractUniqueInstanceIds();
            // Further processing or actions with the unique values can be done here
            return {
                statusCode: 200,
                body: JSON.stringify(uniqueValues)
            };
        } else if (event.path === "/query-all") {
            const instanceId = event.queryStringParameters?.instanceId;
            const startTimeEpoch = event.queryStringParameters?.startTimeEpoch;
            const endTimeEpoch = event.queryStringParameters?.endTimeEpoch;

            const result = await queryTableByInstanceId(instanceId || '', startTimeEpoch || '', endTimeEpoch || '');
            return {
                statusCode: 200,
                body: JSON.stringify(result)
            };
        } else {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Not found'
                })
            };
        }

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: JSON.stringify(error)
            })
        };
    }
};
