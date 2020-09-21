import { CfnOutput, Construct, StackProps, Stage } from '@aws-cdk/core';
import { PipelinesWebinarStack } from './pipelines_webinar_stack';

export class WebServiceStage extends Stage {
  urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const service = new PipelinesWebinarStack(this, 'WebService', {
      tags: {
        Application: 'WebService',
        Environment: id
      }
    });

    this.urlOutput = service.urlOutput
  }
}
