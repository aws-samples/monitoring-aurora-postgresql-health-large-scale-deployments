import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import path from 'path';
import { Cors } from 'aws-cdk-lib/aws-apigateway';
import { AnyPrincipal } from 'aws-cdk-lib/aws-iam';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

type MetricConfig = {
  name: string;
  threshold: number;
  thresholdOperator: string;
}

export class BackendStack extends cdk.Stack {
  private scheduleDuration = 1;
  private sourceIp = '';
  constructor(app: Construct, id: string, props?: cdk.StackProps) {
    super(app, id, props);
    let scheduleDuration: number = app.node.tryGetContext('scheduleDurationInHours');
    if (!scheduleDuration || scheduleDuration < 1) {
      scheduleDuration = 1
    }
    this.sourceIp = process.env.sourceIp ?? '';
    const trackedMetrics = app.node.tryGetContext('metricsTracked');
    const tableName = 'AuroraHealthMetrics';
    const localSecondaryIndexName = 'lsi_date';
    const table = this.createDynamoDb(tableName, localSecondaryIndexName);
    this.scheduleDuration = scheduleDuration;
    const metricsTracked = this.createMetricsTrackedParameter(trackedMetrics)
    const backendLambda = this.createBackendLambda(table, metricsTracked);
    this.createEventBridge(app, backendLambda);
    const queryLambda = this.createQueryLambda(table, localSecondaryIndexName, metricsTracked);
    this.createApiGateway(queryLambda);
  }

  //Upload the Metrics Tracked to Paramter store in AWS
  createMetricsTrackedParameter(metricsTracked: MetricConfig[]) {
    const parameter = new cdk.aws_ssm.StringParameter(this, 'MetricsTrackedParameter', {
      parameterName: 'MetricsTracked',
      stringValue: JSON.stringify(metricsTracked),
    });
    return parameter;
  }


  createEventBridge(app: Construct, backendLambda: NodejsFunction) {
    const rule = new cdk.aws_events.Rule(this, 'Rule', {
      schedule: cdk.aws_events.Schedule.rate(cdk.Duration.hours(this.scheduleDuration))
    });
    rule.addTarget(new cdk.aws_events_targets.LambdaFunction(backendLambda));
  }

  private createApiGateway(lambda: NodejsFunction) {
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
    const proxyResource2 = apiGateway.root.addResource('query-all');
    proxyResource2.addMethod('GET', proxyIntegration, { methodResponses: [{ statusCode: '200' }] });
    const proxyResource3 = apiGateway.root.addResource('metricslist');
    proxyResource3.addMethod('GET', proxyIntegration, { methodResponses: [{ statusCode: '200' }] });

    return apiGateway;
  }

  private createBackendLambda(table: cdk.aws_dynamodb.Table, metricsTracked: StringParameter) {

    const lambdaFunction = new NodejsFunction(this, 'LambdaFunction', {
      entry: path.join(__dirname, "lambda/index.ts"),
      handler: 'iterateLogsOnASchedule',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      functionName: "DataCollectionLambda",
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
        NUMBER_OF_HOURS_TO_CAPTURE_DATA_FOR: this.scheduleDuration.toString(),
        METRICS_TRACKED: metricsTracked.parameterName
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
    metricsTracked.grantRead(lambdaFunction);
    return lambdaFunction;
  }

  private createQueryLambda(table: cdk.aws_dynamodb.Table, localSecondaryIndexName: string, metricsTracked: StringParameter) {
    const lambdaFunction = new NodejsFunction(this, 'querylambdaFunction', {
      entry: path.join(__dirname, "lambda/querylambda.ts"),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(5),
      functionName: "querylambda",
      environment: {
        DYNAMODB_TABLE_NAME: table.tableName,
        DYNAMODB_INDEX_NAME: localSecondaryIndexName,
        METRICS_TRACKED: metricsTracked.parameterName
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
    lambdaFunction.addToRolePolicy(describeClustersPolicyStatement);
    table.grantReadData(lambdaFunction);
    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['dynamodb:Query'],
        resources: [`${table.tableArn}/index/*`],
      }),
    );    
    metricsTracked.grantRead(lambdaFunction);
    return lambdaFunction
  }

  private createDynamoDb(tableName: string, secondaryIndexName: string) {
    const dynamoDb = new cdk.aws_dynamodb.Table(this, tableName, {
      tableName: tableName,
      partitionKey: { name: 'MetricName', type: cdk.aws_dynamodb.AttributeType.STRING },
      sortKey: { name: 'DateInstance', type: cdk.aws_dynamodb.AttributeType.STRING },
      readCapacity: 5,
      writeCapacity: 5,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    // Add a local secondary index so that the query lambda can search data by date range
    dynamoDb.addLocalSecondaryIndex({
      indexName: secondaryIndexName,
      sortKey: {name: 'DateHourTimeZone', type: cdk.aws_dynamodb.AttributeType.NUMBER},
      projectionType: cdk.aws_dynamodb.ProjectionType.ALL
    });
    return dynamoDb;
  }
}
