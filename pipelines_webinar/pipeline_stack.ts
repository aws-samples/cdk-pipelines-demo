import {Construct} from 'constructs';
import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import * as pipelines from 'aws-cdk-lib/pipelines';
import { WebServiceStage } from './webservice_stage';

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const source = pipelines.CodePipelineSource.gitHub('jeromevdl/cdk-pipelines-demo', 'cdkv2', {
            authentication: SecretValue.secretsManager('GITHUB_TOKEN')
        });

        const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
            synth: new pipelines.ShellStep('Synth', {
                input: source,
                installCommands: [
                    'npm install'
                ],
                commands: [
                    'npm run build',
                    'npx cdk synth'
                ],
                env: {
                  NPM_CONFIG_UNSAFE_PERM: 'true'
                }
            }),
        });

        // Pre-prod
        //
        const preProdApp = new WebServiceStage(this, 'Pre-Prod');
        const preProdStage = pipeline.addStage(preProdApp);

        preProdStage.addPost(new pipelines.ShellStep('IntegrationTests', {
            input: source,
            commands: [
                'npm install',
                'npm run build',
                'npm run integration'
            ],
            envFromCfnOutputs: {
                SERVICE_URL: preProdApp.urlOutput
            }
        }));

        // Prod
        //
        const prodApp = new WebServiceStage(this, 'Prod');
        const prodStage = pipeline.addStage(prodApp);
    }
}
