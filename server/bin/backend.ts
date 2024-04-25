#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BackendStack } from '../lib/backend-stack';

const app = new cdk.App();
let scheduleDuration: number = app.node.tryGetContext('scheduleDurationInHours');
if (!scheduleDuration || scheduleDuration < 1) {
  scheduleDuration = 1
}
let sourceIp = app.node.tryGetContext('sourceIp');
if (!sourceIp) {
  throw new Error('sourceIp is required');
}
let metricsTracked = app.node.tryGetContext('metricsTracked');
if (!metricsTracked || metricsTracked.length <= 0) {
  throw new Error('At least one metricsTracked value should be present');
}
new BackendStack(app, 'Backend', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  scheduleDuration,
  sourceIp,
  metricsTracked
});