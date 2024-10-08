import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as Backend from '../lib/backend-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/backend-stack.ts
test('VPC is created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::EC2::VPC', {
        CidrBlock: '10.0.0.0/16'
    });
});

//test to validate if 2 subnets are created in the VPC
test('4 subnets are created in the VPC', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::Subnet', 4);
})


//test to validate that all 4 subnets are created in different AZ
test('4 subnets are created in different AZ', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::EC2::Subnet', {
        AvailabilityZone: {
            'Fn::Select': [
                0,
                {
                    'Fn::GetAZs': ''
                }
            ]
        }
    });
});

//Test to validate lambda has rds:DescribeDBClusters permissions
test('lambda has rds:DescribeDBClusters permissions', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
            Statement: [
                {
                    Action: 'rds:DescribeDBClusters',
                    Effect: 'Allow',
                    Resource: '*'
                }
            ],
            Version: '2012-10-17'
        }
    });
});

test('lambda has cloudwatch:GetMetricStatistics permissions', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
            Statement: [
                {
                    Action: 'cloudwatch:GetMetricStatistics',
                    Effect: 'Allow',
                    Resource: '*'
                }
            ],
            Version: '2012-10-17'
        }
    });
});

//test to make sure lambda has permissions to write to dynamodb to specific table CacheHitRatioMetrics
test('lambda has permissions to write to dynamodb to CacheHitRatioMetrics', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::IAM::Policy', {
        PolicyDocument: {
            Statement: [
                {
                    Action: 'dynamodb:*',
                    Effect: 'Allow',
                    Resource: {
                        'Fn::GetAtt': [
                            'CacheHitRatioMetrics',
                            'Arn'
                        ]
                    }
                }
            ],
            Version: '2012-10-17'
        }
    });
});


//Write a test for createLambda lambda
test('lambda is created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function',
        { FunctionName: 'BufferCacheLambda' }
    );
});


//Write a test for 3 Aurora Postgres created and validate number of instances created
test('3 Aurora Postgres is created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::RDS::DBCluster', 3);
});

test('Dynamodb is created', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Backend.BackendStack(app, 'MyTestStack');
    // THEN
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::DynamoDB::Table', {
        TableName: 'CacheHitRatioMetrics',
        KeySchema: [
            {
                'AttributeName': 'InstanceId',
                'KeyType': 'HASH'
            },
            {
                'AttributeName': 'DateHourTimeZone',
                'KeyType': 'RANGE'
            }
        ],
        AttributeDefinitions: [
            {
                'AttributeName': 'InstanceId',
                'AttributeType': 'S'
            },
            {
                'AttributeName': 'DateHourTimeZone',
                'AttributeType': 'S'
            }
        ],
        ProvisionedThroughput: {
            'ReadCapacityUnits': 5,
            'WriteCapacityUnits': 5
        }
    })
})