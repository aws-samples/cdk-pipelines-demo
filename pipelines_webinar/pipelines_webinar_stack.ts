import path = require('path');
import { CfnOutput, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { AssetCode, Runtime, Function, Alias } from '@aws-cdk/aws-lambda'
import { LambdaRestApi } from '@aws-cdk/aws-apigateway'
import { LambdaDeploymentGroup, LambdaDeploymentConfig } from '@aws-cdk/aws-codedeploy'
import { Metric, Alarm } from '@aws-cdk/aws-cloudwatch';
import { Cors } from '@aws-cdk/aws-apigateway';

export class PipelinesWebinarStack extends Stack {
  urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const handler = new Function(this, 'Handler', {
      code: new AssetCode(path.resolve(__dirname, 'lambda')),
      handler: 'handler.handler',
      runtime: Runtime.NODEJS_10_X,
    });

    const alias = new Alias(this, 'x', {
      aliasName: 'Current',
      version: handler.currentVersion
    });

    const api = new LambdaRestApi(this, 'Gateway', {
      description: 'Endpoint for a simple Lambda-powered web service',
      handler: alias,
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS
      }
    });

    const apiGateway5xx = new Metric({
      metricName: '5XXError',
      namespace: 'AWS/ApiGateway',
      dimensions: {
        ApiName: 'Gateway'
      },
      statistic: 'Sum',
      period: Duration.minutes(1)
    });
    const failureAlarm = new Alarm(this, 'RollbackAlarm', {
      metric: apiGateway5xx,
      threshold: 1,
      evaluationPeriods: 1,
    });

    new LambdaDeploymentGroup(this, 'DeploymentGroup ', {
      alias,
      deploymentConfig: LambdaDeploymentConfig.CANARY_10PERCENT_10MINUTES,
      alarms: [
        failureAlarm
      ]
    });

    this.urlOutput = new CfnOutput(this, 'url', { value: api.url });
  }
}
