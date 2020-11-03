const AWS = require('aws-sdk');

exports.startCanary = async () => {
    const synthteticsClient = new AWS.Synthetics();
    return await synthteticsClient.startCanary({
        Name: process.env.CANARY_NAME
    }).promise();
};

exports.stopCanary = async () => {
    const synthteticsClient = new AWS.Synthetics();
    return await synthteticsClient.stopCanary({
        Name: process.env.CANARY_NAME
    }).promise();
};