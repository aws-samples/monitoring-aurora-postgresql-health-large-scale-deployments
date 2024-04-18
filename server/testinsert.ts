import * as fs from 'fs';
import { DynamoDB } from 'aws-sdk';




// Read JSON data from file
const jsonData = fs.readFileSync('testinsert.json', 'utf8'); // Replace 'data.json' with your JSON file path
const parsedData = JSON.parse(jsonData);

// Define the DynamoDB table name
const tableName = 'CacheHitRatioMetrics'; // Replace 'your-table-name' with your DynamoDB table name

// Function to insert data into DynamoDB
async function insertData() {
    try {
        // Iterate through each record in the parsed JSON data
        for (const item of parsedData) {
            console.log(item);
            // Create DynamoDB service object
            const dynamodb = new DynamoDB();
            const params = {
                TableName: tableName,
                Item: {
                    'InstanceId': { S: item.InstanceId },
                    'MetricValueAverage': { N: item.MetricValueAverage },
                    'DateHourTimeZone': { N: item.TimeStamp.toString() }
                }
            }
            const putResul1t = await dynamodb.putItem(params).promise();

            console.log(`Inserted record with InstanceId: ${item.InstanceId}`);
        }

        console.log('Data insertion completed successfully.');
    } catch (err) {
        console.error('Error inserting data:', err);
    }
}

// Call the insertData function
insertData();
