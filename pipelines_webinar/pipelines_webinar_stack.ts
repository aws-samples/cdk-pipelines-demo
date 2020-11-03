import path = require('path');
import { CfnOutput, Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda'
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
      schedule: synthetics.Schedule.rate(Duration.minutes(1)),
      test: synthetics.Test.custom({
        code: synthetics.Code..fromInline(`
        var synthetics = require('Synthetics');
        const log = require('SyntheticsLogger');
        const https = require('https');
        const http = require('http');

        const apiCanaryBlueprint = async function () {
            const postData = "";

            const verifyRequest = async function (requestOption) {
              return new Promise((resolve, reject) => {
                log.info("Making request with options: " + JSON.stringify(requestOption));
                let req
                if (requestOption.port === 443) {
                  req = https.request(requestOption);
                } else {
                  req = http.request(requestOption);
                }
                req.on('response', (res) => {
                  log.info(\`Status Code: \${res.statusCode}\`)
                  log.info(\`Response Headers: \${JSON.stringify(res.headers)}\`)
                  //If the response status code is not a 2xx success code
                  if (res.statusCode < 200 || res.statusCode > 299) {
                    reject("Failed: " + requestOption.path);
                  }
                  res.on('data', (d) => {
                    log.info("Response: " + d);
                  });
                  res.on('end', () => {
                    resolve();
                  })
                });

                req.on('error', (error) => {
                  reject(error);
                });

                if (postData) {
                  req.write(postData);
                }
                req.end();
              });
            }

            const headers = {}
            headers['User-Agent'] = [synthetics.getCanaryUserAgentString(), headers['User-Agent']].join(' ');
            const requestOptions = {"hostname":"2gjukwbrp4.execute-api.eu-west-1.amazonaws.com","method":"GET","path":"/prod/","port":443}
            requestOptions['headers'] = headers;
            await verifyRequest(requestOptions);
        };

        exports.handler = async () => {
            return await apiCanaryBlueprint();
        };
        `),
        handler: 'apiCall.handler',
      }),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_2_0,
    });
    // canary.node.addDependency(api);

    const failureAlarm = new cloudwatch.Alarm(this, 'CanaryAlarm', {
      metric: canary.metricSuccessPercent(),
      evaluationPeriods: 2,
      threshold: 90,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
    });

    new codedeploy.LambdaDeploymentGroup(this, 'DeploymentGroup ', {
      alias,
      deploymentConfig: codedeploy.LambdaDeploymentConfig.CANARY_10PERCENT_10MINUTES,
      alarms: [
        failureAlarm
      ]
    });

    this.urlOutput = new CfnOutput(this, 'url', { value: api.url });
  }
}
