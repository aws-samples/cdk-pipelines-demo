const AWS = require('aws-sdk');

export const handler = async (event: any = {}): Promise<any> => {
    return {
        body: 'KO',
        statusCode: 500,
    };
};
