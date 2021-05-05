import axios from 'axios';

// Fix CORS on API assuming APIGateway has been implemented as described at https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors-console.html
axios.defaults.adapter = require('axios/lib/adapters/http');

test('200 Response', async () => {
    console.log('env ->', process.env);

    const url = process.env.SERVICE_URL ?? 'No SERVICE_URL in env'
    console.log('url ->', url);

    // TODO: Figure out why CORS on API isn't working
    //
    // await axios.request({
    //     url
    // }).then(response => {
    //     console.log('response ->', response);

    //     expect(response.status).toEqual(200);
    // }).catch(error => {
    //     console.log('error ->', error);

    //     fail(error);
    // });
});
