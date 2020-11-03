import path = require('path');
import { CfnOutput, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
import * as iam from '@aws-cdk/aws-iam'
import * as apigw from '@aws-cdk/aws-apigateway'
import * as codedeploy from '@aws-cdk/aws-codedeploy'
import * as cloudwatch from '@aws-cdk/aws-cloudwatch';
import * as synthetics from '@aws-cdk/aws-synthetics';

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
      version: handler.currentVersion
    });

    const api = new apigw.LambdaRestApi(this, 'Gateway', {
      description: 'Endpoint for a simple Lambda-powered web service',
      handler: alias,
    });

    // const apiGateway5xx = new cloudwatch.Metric({
    //   metricName: '5XXError',
    //   namespace: 'AWS/ApiGateway',
    //   dimensions: {
    //     ApiName: 'Gateway'
    //   },
    //   statistic: 'Sum',
    //   period: Duration.minutes(1)
    // });

    // const failureAlarm = new cloudwatch.Alarm(this, 'RollbackAlarm', {
    //   metric: apiGateway5xx,
    //   threshold: 1,
    //   evaluationPeriods: 1,
    // });

    const canary = new synthetics.Canary(this, 'RegressionTesting', {
      schedule: synthetics.Schedule.once(),
      test: synthetics.Test.custom({
        code: synthetics.Code.fromAsset(path.join(__dirname, 'canary')),
        handler: 'apiCall.handler',
      }),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_2_0,
    });
    // canary.node.addDependency(api);

    const failureAlarm = new cloudwatch.Alarm(this, 'CanaryAlarm', {
      metric: canary.metricSuccessPercent({
        period: Duration.minutes(1),
        statistic: cloudwatch.Statistic.AVERAGE
      }),
      evaluationPeriods: 1,
      threshold: 90,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
    });

    // TODO: Add stage to function name to avoid collision with stages
    const preHookLambda = new lambda.Function(this, 'startCanary', {
      functionName: 'CodeDeployHook_PreHookLambda',
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'loop.startCanary',
      code: lambda.Code.fromAsset(path.join(__dirname, 'canary')),
      environment: {
        CANARY_NAME: canary.canaryName

      }
    });

    const postHookLambda = new lambda.Function(this, 'stopCanary', {
      functionName: 'CodeDeployHook_PostHookLambda',
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'loop.stopCanary',
      code: lambda.Code.fromAsset(path.join(__dirname, 'canary')),
      environment: {
        CANARY_NAME: canary.canaryName
      }
    });

    preHookLambda.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        'synthetics:StartCanary', 
        'synthetics:StopCanary'
    ],
    }));

    postHookLambda.addToRolePolicy(new iam.PolicyStatement({
      resources: ['*'],
      actions: [
        'synthetics:StartCanary', 
        'synthetics:StopCanary'
    ],
    }));
    
    const lambdaDeploymentGroup = new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_5MINUTES,
      alarms: [
        failureAlarm
      ],
      preHook: preHookLambda,
      postHook: postHookLambda
    });    

    this.urlOutput = new CfnOutput(this, 'url', { value: api.url });
  }
}
