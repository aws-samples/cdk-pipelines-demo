import { App } from '@aws-cdk/core';
import { PipelinesWebinarStack } from '../pipelines_webinar/pipelines_webinar_stack';

test('Lambda Handler', () => {
  // GIVEN
  const app = new App();

  // WHEN
  new PipelinesWebinarStack(app, 'Stack');

  const template = app.synth().getStackByName('Stack').template['Resources'] as Map<String, any>
  const functions = Object.entries(template)
    .filter((resource) => resource[1]['Type'] === 'AWS::Lambda::Function');

  // THEN
  expect(functions.length).toEqual(3);
  expect(functions[0][1].Properties.Handler).toEqual('handler.handler');
});
