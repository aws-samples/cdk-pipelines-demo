import axios from 'axios';

test('200 Response', async () => {
    console.log('env ->', process.env);

    const url = process.env.SERVICE_URL ?? 'No SERVICE_URL in env'
    console.log('url ->', url);

    await axios.request({
        url
    }).then(response => {
        console.log('response ->', response);

        expect(response.status).toEqual(200);
    }).catch(error => {
        console.log('error ->', error);

        fail(error);
    });
});
