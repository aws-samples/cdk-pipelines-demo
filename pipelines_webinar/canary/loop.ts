const AWS = require('aws-sdk');

exports.startCanary = async () => {
    const synthteticsClient = new AWS.Synthetics();
    console.log(`starting canary ${process.env.CANARY_NAME}`);
    const result =  await synthteticsClient.startCanary({
        Name: process.env.CANARY_NAME
    }).promise();
    console.log(`canary ${process.env.CANARY_NAME} started: ${JSON.stringify(result)}`);

};

exports.stopCanary = async () => {
    const synthteticsClient = new AWS.Synthetics();
    console.log(`stoping canary ${process.env.CANARY_NAME}`);
    const result =  await synthteticsClient.stopCanary({
        Name: process.env.CANARY_NAME
    }).promise();
    console.log(`canary ${process.env.CANARY_NAME} stopped: ${JSON.stringify(result)}`);
};