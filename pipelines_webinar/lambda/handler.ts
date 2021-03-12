export const handler = async (event: any = {}): Promise<any> => {
  return {
    body: 'Hello from the Lambda',
    statusCode: 200,
  };
};
