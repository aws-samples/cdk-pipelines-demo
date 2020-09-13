import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { AssetCode, Runtime, Function } from '@aws-cdk/aws-lambda'
import { LambdaRestApi } from '@aws-cdk/aws-apigateway'
import { CfnOutput, SecretValue } from '@aws-cdk/core';
import { Artifact } from '@aws-cdk/aws-codepipeline';
import { GitHubSourceAction, GitHubTrigger } from '@aws-cdk/aws-codepipeline-actions';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';
import path = require('path');

export class PipelinesStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new Artifact();
        const cloudAssemblyArtifact = new Artifact();
        const oauthToken = new SecretValue('cdk-pipeline-pat');
        const sourceAction = new GitHubSourceAction({
            actionName: 'GitHub',
            owner: 'stephen-cloud',
            repo: 'cdk-pipelines-demo',
            output: sourceArtifact,
            oauthToken: oauthToken,
            trigger: GitHubTrigger.WEBHOOK
        })
        const synthAction = new SimpleSynthAction({
            sourceArtifact,
            cloudAssemblyArtifact,
            installCommands: [
                'npm install -g aws-cli',
                'npm install'
            ],
            synthCommand: 'cdk synth'
        })

        new CdkPipeline(this, 'Pipeline', {
            cloudAssemblyArtifact,
            sourceAction,
            synthAction
        })
    }
}

