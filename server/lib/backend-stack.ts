import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    //Create VPC with CIDR 10.0.0.0/16 and 4 subnets, two public and two private
    const vpc = this.createVpc();
    //Create 3 RDS Aurora Postgres clusters with version 15.2 using the vpc and each with 2 reader instances
    //and 1 writer instance
    this.createRdsClusters(vpc);
    this.createDynamoDb();
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
    dynamoDb.addGlobalSecondaryIndex({
      indexName: 'MetricValueIndex',
      partitionKey: { name: 'MetricValueAverage', type: cdk.aws_dynamodb.AttributeType.NUMBER },
      readCapacity: 5,
      writeCapacity: 5,
    });
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
