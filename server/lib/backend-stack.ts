import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path = require('path');
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { AnyPrincipal } from 'aws-cdk-lib/aws-iam';

interface MyStackProps extends cdk.StackProps {
  scheduleDuration: number;
  sourceIp: string;
}

export class BackendStack extends cdk.Stack {
  private scheduleDuration = 1;
  private sourceIp = '';
  constructor(app: Construct, id: string, props: MyStackProps) {
    super(app, id, props);
    const vpc = this.createVpc();
    this.createRdsClusters(vpc);
    const table = this.createDynamoDb();
    this.scheduleDuration = props.scheduleDuration;
    this.sourceIp = props.sourceIp;
    const backendLambda = this.createBackendLambda(table);
    this.createEventBridge(app, backendLambda);
    const queryLambda = this.createQueryLambda(table);
    this.createApiGateway(table, queryLambda);
  }

  createEventBridge(app: Construct, backendLambda: NodejsFunction) {
    const rule = new cdk.aws_events.Rule(this, 'Rule', {
      schedule: cdk.aws_events.Schedule.rate(cdk.Duration.hours(this.scheduleDuration))
    });
    rule.addTarget(new cdk.aws_events_targets.LambdaFunction(backendLambda));
  }

  private createApiGateway(table: cdk.aws_dynamodb.Table, lambda: NodejsFunction) {
    // API Gateway
    const explicitDenyExceptOne = new iam.PolicyStatement({
      effect: iam.Effect.DENY,
      actions: ['execute-api:Invoke'],
      resources: ['execute-api:/*/*/*'],
      principals: [new iam.AnyPrincipal()],
      conditions: {
        NotIpAddress: {
          'aws:SourceIp': [this.sourceIp]
        }
      }
    });

    const allowEverythingElse = new iam.PolicyStatement({
      actions: ['execute-api:Invoke'],
      principals: [new AnyPrincipal()],
      resources: ['execute-api:/*/*/*'],
    });

    const apiResourcePolicy = new iam.PolicyDocument({
      statements: [explicitDenyExceptOne, allowEverythingElse]
    });

    const apiGateway = new apigateway.RestApi(this, 'ProxyCacheAPI', {
      cloudWatchRole: true,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
      policy: apiResourcePolicy
    });

    apiGateway.addUsagePlan('usage-plan', {
      name: 'dev-docs-plan',
      description: 'usage plan for dev',
      apiStages: [{
        api: apiGateway,
        stage: apiGateway.deploymentStage,
      }],
      throttle: {
        rateLimit: 200,
        burstLimit: 300
      },
    });




    const proxyIntegration = new apigateway.LambdaIntegration(lambda);
    const proxyResource = apiGateway.root.addResource('query-all-instances');
    proxyResource.addMethod('GET', proxyIntegration, { methodResponses: [{ statusCode: '200' }] })
    const proxyResource2 = apiGateway.root.addResource('query-all');
    proxyResource2.addMethod('GET', proxyIntegration, { methodResponses: [{ statusCode: '200' }] });
  }

  private createBackendLambda(table: cdk.aws_dynamodb.Table) {

    const lambdaFunction = new NodejsFunction(this, 'LambdaFunction', {
      entry: path.join(__dirname, "lambda/index.ts"),
      handler: 'iterateLogsOnASchedule',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      functionName: "BufferCacheLambda",
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
        NUMBER_OF_HOURS_TO_CAPTURE_DATA_FOR: this.scheduleDuration.toString()
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
    return lambdaFunction;
  }

  private createQueryLambda(table: cdk.aws_dynamodb.Table) {
    const lambdaFunction = new NodejsFunction(this, 'querylambdaFunction', {
      entry: path.join(__dirname, "lambda/querylambda.ts"),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      functionName: "querylambda",
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
      }
    });
    table.grantReadData(lambdaFunction);
    return lambdaFunction
  }

  private createDynamoDb() {
    const dynamoDb = new cdk.aws_dynamodb.Table(this, 'CacheHitRatioMetrics', {
      tableName: 'CacheHitRatioMetrics',
      partitionKey: { name: 'InstanceId', type: cdk.aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'DateHourTimeZone', type: cdk.aws_dynamodb.AttributeType.NUMBER },
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
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
      storageEncrypted: true
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
      storageEncrypted: true
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
      storageEncrypted: true
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
