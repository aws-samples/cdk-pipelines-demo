import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import * as cp from '@aws-cdk/aws-codepipeline';
import * as cpa from '@aws-cdk/aws-codepipeline-actions';
import * as pipelines from '@aws-cdk/pipelines';
import { WebServiceStage } from './webservice_stage';

export class PipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new cp.Artifact();
        const cloudAssemblyArtifact = new cp.Artifact();

        const sourceAction = new cpa.GitHubSourceAction({
            actionName: 'GitHub',
            output: sourceArtifact,
            branch: 'typescript',
            oauthToken: SecretValue.secretsManager('github-token'),
            owner: 'flochaz',
            repo: 'cdk-pipelines-demo',
        });

        const synthAction = pipelines.SimpleSynthAction.standardNpmSynth({
            sourceArtifact,
            cloudAssemblyArtifact,
            buildCommand: 'npm run build && npm test'
        });

        const pipeline = new pipelines.CdkPipeline(this, 'Pipeline', {
            cloudAssemblyArtifact,
            sourceAction,
            synthAction,
            selfMutating: false
        });

        // Pre-prod
        //
        const preProdApp = new WebServiceStage(this, 'Pre-Prod');
        const preProdStage = pipeline.addApplicationStage(preProdApp);
        const serviceUrl = pipeline.stackOutput(preProdApp.urlOutput);

        preProdStage.addActions(new pipelines.ShellScriptAction({
            actionName: 'IntegrationTests',
            runOrder: preProdStage.nextSequentialRunOrder(),
            additionalArtifacts: [
                sourceArtifact
            ],
            commands: [
                'npm install',
                'npm run build',
                'npm run integration'
            ],
            useOutputs: {
                SERVICE_URL: serviceUrl
            }
        }));

        // Prod
        //
        const prodApp = new WebServiceStage(this, 'Prod');
        const prodStage = pipeline.addApplicationStage(prodApp);
    }
}
