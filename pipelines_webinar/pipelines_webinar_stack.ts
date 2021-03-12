import path = require('path');
import {
  CfnOutput,
  Construct,
  Duration,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as codedeploy from '@aws-cdk/aws-codedeploy';
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';

export class PipelinesWebinarStack extends Stack {
  urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'Handler', {
      code: new lambda.AssetCode(path.resolve(__dirname, 'lambda')),
      handler: 'handler.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
    });

    const alias = new lambda.Alias(this, 'x', {
      aliasName: 'Current',
      version: handler.currentVersion,
    });

    const api = new apigw.LambdaRestApi(this, 'Gateway', {
      description: 'Endpoint for a simple Lambda-powered web service',
      handler: alias,
    });

    const apiGateway5xx = new cloudwatch.Metric({
      metricName: '5XXError',
      namespace: 'AWS/ApiGateway',
      dimensions: {
        ApiName: 'Gateway',
      },
      statistic: 'Sum',
      period: Duration.minutes(1),
    });
    const failureAlarm = new cloudwatch.Alarm(this, 'RollbackAlarm', {
      metric: apiGateway5xx,
      threshold: 1,
      evaluationPeriods: 1,
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup ', {
      alias,
      deploymentConfig:
        codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [failureAlarm],
    });

    this.urlOutput = new CfnOutput(this, 'url', { value: api.url });
  }
}
