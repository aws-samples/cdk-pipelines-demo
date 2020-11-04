const AWS = require('aws-sdk');

export const handler = async (event: any = {}): Promise<any> => {
    return {
        body: 'v1 OK',
        statusCode: 200,
    };
};
