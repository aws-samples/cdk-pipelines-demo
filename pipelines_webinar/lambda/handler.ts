const AWS = require('aws-sdk');

export const handler = async (event: any = {}): Promise<any> => {
    return {
        body: 'v3 KO',
        statusCode: 500,
    };
};
