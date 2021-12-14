#!/usr/bin/env node
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { PipelineStack } from './pipelines_webinar/pipeline_stack';

const app = new App();

new PipelineStack(app, 'PipelineStack');

app.synth();
