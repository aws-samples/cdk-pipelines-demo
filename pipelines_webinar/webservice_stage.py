from aws_cdk import core

from .pipelines_webinar_stack import PipelinesWebinarStack

class WebServiceStage(core.Stage):
  def __init__(self, scope: core.Construct, id: str, **kwargs):
    super().__init__(scope, id, **kwargs)

    service = PipelinesWebinarStack(self, 'WebService')

    self.url_output = service.url_output

