/**
 * @jest-environment node
 */

import axios from 'axios';

// Fix CORS on API assuming APIGateway has been implemented as described at https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors-console.html
axios.defaults.adapter = require('axios/lib/adapters/http');

test('200 Response', async () => {
  // Arrange
  const url = process.env.SERVICE_URL ?? 'No SERVICE_URL in env';
  console.log('url ->', url);

  // Act
  const response = await axios.get(url);

  // Assert
  expect(response.status).toEqual(200);
});
