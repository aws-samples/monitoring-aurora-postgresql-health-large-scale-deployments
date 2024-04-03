import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');
import { IamResource } from 'aws-cdk-lib/aws-appsync';
import { Cors } from 'aws-cdk-lib/aws-apigateway';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //Create VPC with CIDR 10.0.0.0/16 and 4 subnets, two public and two private
    const vpc = this.createVpc();
    //Create 3 RDS Aurora Postgres clusters with version 15.2 using the vpc and each with 2 reader instances
    //and 1 writer instance
    this.createRdsClusters(vpc);
    const table = this.createDynamoDb();
    this.createLambda(table);
    this.createApiGateway(table);
  }

  //Function to create API Gateway with a GET method which integrates with Query of dynmodb table directly without Graphql
  private createApiGateway(table: cdk.aws_dynamodb.Table) {
    // API Gateway
    const apiGateway = new apigateway.RestApi(this, 'ProxyCacheAPI', {
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },

    });

    apiGateway.addUsagePlan('usage-plan', {
      name: 'dev-docs-plan',
      description: 'usage plan for dev',
      apiStages: [{
        api: apiGateway,
        stage: apiGateway.deploymentStage,
      }],
      throttle: {
        rateLimit: 100,
        burstLimit: 200
      },
    });
    const integrationRole = new iam.Role(this, 'DynamoDBIntegrationRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
    })
    // Integration with DynamoDB
    const integration = new apigateway.AwsIntegration({
      service: 'dynamodb',
      action: 'Scan',
      integrationHttpMethod: 'POST',
      options: {
        credentialsRole: integrationRole,
        requestTemplates: {
          'application/json': JSON.stringify({
            TableName: table.tableName,
          }),
        },
        passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
        requestParameters: {
          'integration.request.header.Content-Type': "'application/x-amz-json-1.0'",
        },
        integrationResponses: [
          {
            statusCode: '200',
            responseTemplates: {
              'application/json': JSON.stringify({
                items: '$input.path(\'$.Items\')',
              }),
            },
          },
        ],
      },
    });


    // add  dynamodb:Scan permission for tableName to integration
    table.grantReadData(integrationRole);

    //Add resource to api gateway name it query-all and integrate with integration
    const resource = apiGateway.root.addResource('query-all');
    resource.addMethod('GET', integration, {methodResponses: [{statusCode: '200'}]});
  }

  private createLambda(table: cdk.aws_dynamodb.Table) {

    const lambdaFunction = new NodejsFunction(this, 'LambdaFunction', {
      entry: path.join(__dirname, "lambda/index.ts"),
      handler: 'iterateLogsOnASchedule',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      functionName: "BufferCacheLambda",
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      }
    });

    const describeClustersPolicyStatement = new iam.PolicyStatement(
      {
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          'rds:DescribeDBClusters'
        ],
        resources: ['*']
      }
    )

    const cloudWatchPolicyStatement = new iam.PolicyStatement(
      {
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          'cloudwatch:GetMetricStatistics'
        ],
        resources: ['*']
      }
    )

    lambdaFunction.addToRolePolicy(describeClustersPolicyStatement);
    lambdaFunction.addToRolePolicy(cloudWatchPolicyStatement);
    table.grantFullAccess(lambdaFunction);
  }

  private createDynamoDb() {
    const dynamoDb = new cdk.aws_dynamodb.Table(this, 'BufferCacheHitRatioMetrics', {
      tableName: 'BufferCacheHitRatioMetrics',
      partitionKey: { name: 'InstanceId', type: cdk.aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'DateHourTimeZone', type: cdk.aws_dynamodb.AttributeType.STRING },
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // dynamoDb.addGlobalSecondaryIndex({
    //   indexName: 'MetricValueIndex',
    //   partitionKey: { name: 'MetricValueAverage', type: cdk.aws_dynamodb.AttributeType.NUMBER },
    //   readCapacity: 5,
    //   writeCapacity: 5,
    // });
    return dynamoDb;
  }

  private createRdsClusters(vpc: cdk.aws_ec2.Vpc) {
    const cluster02 = new rds.DatabaseCluster(this, 'AuroraCluster02', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_15_2 }),
      writer: rds.ClusterInstance.provisioned('writer', {
        publiclyAccessible: false,
      }),
      readers: [
        rds.ClusterInstance.provisioned('reader1', { promotionTier: 1 }),
        rds.ClusterInstance.serverlessV2('reader2'),
      ],
      defaultDatabaseName: 'mydb02',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      vpc,
    });
    const cluster01 = new rds.DatabaseCluster(this, 'AuroraCluster01', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_15_2 }),
      writer: rds.ClusterInstance.provisioned('writer', {
        publiclyAccessible: false,
      }),
      readers: [
        rds.ClusterInstance.provisioned('reader1', { promotionTier: 1 }),
        rds.ClusterInstance.serverlessV2('reader2'),
      ],
      defaultDatabaseName: 'mydb01',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      vpc,
    });
    const cluster03 = new rds.DatabaseCluster(this, 'AuroraCluster03', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({ version: rds.AuroraPostgresEngineVersion.VER_15_2 }),
      writer: rds.ClusterInstance.provisioned('writer', {
        publiclyAccessible: false,
      }),
      readers: [
        rds.ClusterInstance.provisioned('reader1', { promotionTier: 1 }),
        rds.ClusterInstance.serverlessV2('reader2'),
      ],
      defaultDatabaseName: 'mydb03',
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      vpc,
    });
  }

  private createVpc() {
    return new ec2.Vpc(this, 'Vpc', {
      ipAddresses: ec2.IpAddresses.cidr('10.0.0.0/16'),
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public01',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'private01',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });
  }
}
