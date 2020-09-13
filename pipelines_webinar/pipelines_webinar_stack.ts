import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { AssetCode, Runtime, Function } from '@aws-cdk/aws-lambda'
import { LambdaRestApi } from '@aws-cdk/aws-apigateway'
import { CfnOutput } from '@aws-cdk/core';
import path = require('path');

export class PipelinesWebinarStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const handler = new Function(this, 'hello', {
      code: new AssetCode(path.resolve(__dirname, 'lambda')),
      handler: 'handler.handler',
      runtime: Runtime.NODEJS_10_X
    });

    const api = new LambdaRestApi(this, 'Gateway', {
      handler
    });

    new CfnOutput(this, 'url', { value: api.url });
  }
}
