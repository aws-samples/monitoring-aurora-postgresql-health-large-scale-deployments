const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Initialize AWS SDK
const cloudformation = new AWS.CloudFormation({ region: 'us-east-1' }); // Update the region as needed

// Function to get stack outputs
const getStackOutputs = async (stackName) => {
    try {
        const result = await cloudformation.describeStacks({ StackName: stackName }).promise();
        const outputs = result.Stacks[0]?.Outputs || [];
        return outputs;
    } catch (error) {
        console.error('Error retrieving stack outputs:', error);
        throw error;
    }
};

// Function to write API Gateway URL to a file
const writeApiUrlToFile = (apiUrl) => {
    const outputFile = path.resolve(__dirname, 'api-url.json');
    fs.writeFileSync(outputFile, JSON.stringify({ apiGatewayUrl: apiUrl }, null, 2));
    console.log('API Gateway URL has been written to:', outputFile);
};

// Main function
const main = async () => {
    const stackName = 'ServerStack'; // Update with your actual stack name
    try {
        const outputs = await getStackOutputs(stackName);
        console.log('Stack Outputs:', outputs); // Log all outputs to inspect

        // Use regex to find the matching output key
        const regex = /^ProxyCacheAPIEndpoint/;
        let apiUrl;

        outputs.forEach(output => {
            if (output.OutputKey && output.OutputValue && regex.test(output.OutputKey)) {
                apiUrl = output.OutputValue;
            }
        });

        if (apiUrl) {
            writeApiUrlToFile(apiUrl);
        } else {
            console.error('API Gateway URL not found in stack outputs.');
            process.exit(1);
        }
    } catch (error) {
        console.error('Deployment script failed:', error);
        process.exit(1);
    }
};

// Execute main function
main();
