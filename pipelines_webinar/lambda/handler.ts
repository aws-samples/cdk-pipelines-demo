const AWS = require('aws-sdk');

export const handler = async (event: any = {}): Promise<any> => {
    return {
        body: 'OK its all good now',
        statusCode: 200,
    };
};
