import { Construct } from 'constructs';
import { CfnOutput, StackProps, Stage } from 'aws-cdk-lib';
import { PipelinesWebinarStack } from './pipelines_webinar_stack';

export enum ENV {
  SDLC,
  PROD
}

export interface WebServiceStageProps {
  environment: ENV
}

export class WebServiceStage extends Stage {
  urlOutput: CfnOutput;

  constructor(scope: Construct, id: string, props: WebServiceStageProps) {
    super(scope, id);

    const service = new PipelinesWebinarStack(this, 'WebService', {
      tags: {
        Application: 'WebService',
        Environment: id
      },
      environment: props.environment
    });

    this.urlOutput = service.urlOutput
  }
}
