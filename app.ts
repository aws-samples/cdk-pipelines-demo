#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { PipelinesWebinarStack } from './pipelines_webinar/pipelines_webinar_stack';
import { PipelinesStack } from './pipelines_webinar/pipeline_stack';

const app = new App();
new PipelinesWebinarStack(app, 'PipelinesWebinarStack');
new PipelinesStack(app, 'PipelineStack');

app.synth();
