/**
 * @jest-environment node
 */

import axios from 'axios';

test('200 Response', async () => {
  // Arrange
  const url = process.env.SERVICE_URL ?? 'No SERVICE_URL in env';
  console.log('url ->', url);

  // Act
  const response = await axios.get(url);

  // Assert
  expect(response.status).toEqual(200);
});
