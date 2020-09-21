# CDK Pipelines Demo -- TypeScript

This branch contains sample code used for the CDK Pipelines Webinar. The
TypeScript version was created from scratch by following the webinar below.

[Back to `main` branch](https://github.com/aws-samples/cdk-pipelines-demo)

## Webinar: Enhanced CI/CD with AWS CDK

[![Enhanced CI/CD with AWS CDK](http://img.youtube.com/vi/1ps0Wh19MHQ/0.jpg)](https://www.youtube.com/watch?v=1ps0Wh19MHQ)

## TypeScript Release Notes

The `.ts` files are mostly the same as the `.py` with a couple of inline resources
pulled out for clarity.

The use of multiple jest configs is probably the wrong approach.

The CORS config for the REST API does not allow the integration test to run as intended and I
did not debug that yet.

