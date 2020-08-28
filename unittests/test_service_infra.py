from aws_cdk import core
from pipelines_webinar.pipelines_webinar_stack import PipelinesWebinarStack

def test_lambda_handler():
  # GIVEN
  app = core.App()

  # WHEN
  PipelinesWebinarStack(app, 'Stack')

  # THEN
  template = app.synth().get_stack_by_name('Stack').template
  functions = [resource for resource in template['Resources'].values()
               if resource['Type'] == 'AWS::Lambda::Function']

  assert len(functions) == 1
  assert functions[0]['Properties']['Handler'] == 'handler.handler'