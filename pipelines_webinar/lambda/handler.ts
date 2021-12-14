const AWS = require('aws-sdk');

export const handler = async (event: any = {}): Promise<any> => {
    return {
        body: '{"msg": "Hello World"}',
        headers : {
            "Content-Type": "application/json",
            "Access-Control-Allow-Headers" : "Authorization, *",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET"
        },
        statusCode: 200,
    };
};
