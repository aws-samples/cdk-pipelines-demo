const AWS = require('aws-sdk');
const synthteticsClient = new AWS.Synthetics();
const codedeploy = new AWS.CodeDeploy({apiVersion: '2014-10-06'});

exports.startCanary = async (event: any) => {
    let result = 'pending';
    try {
        console.log(`starting canary ${process.env.CANARY_NAME}`);
        await synthteticsClient.startCanary({
            Name: process.env.CANARY_NAME
        }).promise();
        console.log(`canary ${process.env.CANARY_NAME} started`);
        result = 'Succeeded';
    } catch (error) {
        result = 'Failed';
    }


    const params = {
        deploymentId: event.DeploymentId,
        lifecycleEventHookExecutionId: event.LifecycleEventHookExecutionId,
        status: result // status can be 'Succeeded' or 'Failed'
    };
    try {
        await codedeploy.putLifecycleEventHookExecutionStatus(params).promise();
    } catch ( error ) {
        console.error(error);
        throw error;
    }
};

exports.stopCanary = async (event: any) => {
    let result = 'pending';
    try {
        console.log(`stoping canary ${process.env.CANARY_NAME}`);
        await synthteticsClient.stopCanary({
            Name: process.env.CANARY_NAME
        }).promise();
        console.log(`canary ${process.env.CANARY_NAME} stopped`);
        result = 'Succeeded';
    } catch (error) {
        result = 'Failed';
    }


    const params = {
        deploymentId: event.DeploymentId,
        lifecycleEventHookExecutionId: event.LifecycleEventHookExecutionId,
        status: result // status can be 'Succeeded' or 'Failed'
    };
    try {
        await codedeploy.putLifecycleEventHookExecutionStatus(params).promise();
    } catch ( error ) {
        console.error(error);
        throw error;
    }};