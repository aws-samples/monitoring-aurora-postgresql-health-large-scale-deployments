import * as cdk from 'aws-cdk-lib';
import { Distribution, ViewerProtocolPolicy } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from 'constructs';

const path = '../web/dist'

export default class WebStack extends cdk.Stack {
    constructor(app: Construct, id: string, props?: cdk.StackProps) {
        super(app, id);
    }

    hostingBucket = new Bucket(this, 'WebBucket', {
        autoDeleteObjects: true,
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        enforceSSL: true
    })

    distribution = new Distribution(this, 'CloudfrontDistribution', {
        defaultBehavior: {
            origin: new S3Origin(this.hostingBucket),
            viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        },
        defaultRootObject: 'index.html',
        enableLogging: true,
        errorResponses: [
            {
                httpStatus: 404,
                responseHttpStatus: 200,
                responsePagePath: '/index.html',
            },
        ],
    })

    bucketDeployment = new BucketDeployment(this, 'WebBucket', {
        sources: [Source.asset(path)],
        destinationBucket: this.hostingBucket,
        distribution: this.distribution,
        distributionPaths: ['/*'],
    })



    CloudFrontURL = new cdk.CfnOutput(this, 'CloudFrontURL', {
        value: this.distribution.domainName,
        description: 'The distribution URL',
        exportName: 'CloudfrontURL',
    })

    BucketName = new cdk.CfnOutput(this, 'BucketName', {
        value: this.hostingBucket.bucketName,
        description: 'The name of the S3 bucket',
        exportName: 'BucketName',
    })
}