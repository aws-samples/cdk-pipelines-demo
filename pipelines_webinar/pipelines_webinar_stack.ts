import path = require('path');
import { Construct } from 'constructs';
import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import * as codedeploy from 'aws-cdk-lib/aws-codedeploy'
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { ENV } from './webservice_stage';


export interface PipelinesWebinarStackProps extends StackProps{
  environment:ENV
}

export class PipelinesWebinarStack extends Stack {
  urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props: PipelinesWebinarStackProps) {
    super(scope, id, props);

    const handler = new lambda.Function(this, 'Handler', {
      code: new lambda.AssetCode(path.resolve(__dirname, 'lambda')),
      handler: 'handler.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
    });

    const alias = new lambda.Alias(this, 'x', {
      aliasName: 'Current',
      version: handler.currentVersion
    });

    const api = new apigw.LambdaRestApi(this, 'Gateway', {
      description: 'Endpoint for a simple Lambda-powered web service',
      handler: alias,
      defaultCorsPreflightOptions: {
        allowHeaders: [
          '*',
          'Authorization'
        ],
        allowMethods: ['OPTIONS', 'GET'],
        allowCredentials: true,
        allowOrigins: ['*'],
      }
    });

    const apiGateway5xx = new cloudwatch.Metric({
      metricName: '5XXError',
      namespace: 'AWS/ApiGateway',
      dimensionsMap: {
        ApiName: 'Gateway'
      },
      statistic: 'Sum',
      period: Duration.minutes(1)
    });
    const failureAlarm = new cloudwatch.Alarm(this, 'RollbackAlarm', {
      metric: apiGateway5xx,
      threshold: 1,
      evaluationPeriods: 1,
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup ', {
      alias,
      deploymentConfig: props.environment===ENV.PROD?codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_10MINUTES:codedeploy.LambdaDeploymentConfig.ALL_AT_ONCE,
      alarms: [
        failureAlarm
      ]
    });

    this.urlOutput = new CfnOutput(this, 'url', { value: api.url });
  }
}
