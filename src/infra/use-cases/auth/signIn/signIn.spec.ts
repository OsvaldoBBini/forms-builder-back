import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handler } from './signIn.js';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';


describe('signIn', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient);

  const mockTokens = {
    AccessToken: 'mock-access-token-123',
    RefreshToken: 'mock-refresh-token-456',
  };

  const event = {
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'ValidPassword1!',
    }),
  } as APIGatewayProxyEventV2;

  beforeEach(() => {
    cognitoMock.reset();
    vi.resetModules();

    process.env = {
      COGNITO_CLIENT_ID: 'test-client-id-123',
    };
  });

  afterEach(() => { 
    vi.clearAllMocks();
  });

  it('should sing in the user', async () => {

    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: mockTokens,
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      data: {
        accessToken: mockTokens.AccessToken,
        refreshToken: mockTokens.RefreshToken,
      }
    });
  });

  it('should return a 401 with an error message indicating invalid credentials', async () => {

    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: undefined,
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'Invalid Credentials.' }
    });
  });

  it('should return a 422 with an error message indicating invalid input data', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: undefined,
    });

    const emptyBodyEvent = { body: JSON.stringify({}) } as APIGatewayProxyEventV2;
    const response = await handler(emptyBodyEvent);

    expect(response.statusCode).toBe(422);
    expect(JSON.parse(response.body)).toEqual({
      data: {
        message: {
          'errors':  [],
          'properties':  {
            'email':  {
              'errors':  [
                'Invalid email format.',
              ],
            },
            'password':  {
              'errors':  [
                'Invalid password',
              ],
            },
          },
        },
      }
    });
  });

  it('should return a 500 with a generic error message ', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: undefined,
    });

    const mockError = new Error('Cognito service is down');
    cognitoMock.on(InitiateAuthCommand).rejects(mockError);

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'Something went wrong' },
    });
  });

});