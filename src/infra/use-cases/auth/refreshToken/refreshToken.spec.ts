import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handler } from './refreshToken.js';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';


describe('refreshToken', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient);

  const mockTokens = {
    AccessToken: 'mock-new-access-token-789',
    RefreshToken: 'mock-new-refresh-token-012',
  };

  const event = {
    body: JSON.stringify({
      refreshToken: 'valid-refresh-token-abc123',
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

  it('should refresh the access token successfully', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: mockTokens,
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      data: {
        accessToken: mockTokens.AccessToken
      }
    });
  });

  it('should return a 401 when refresh token is invalid or expired', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: undefined,
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'Invalid refresh token.' }
    });
  });

  it('should return a 422 when refresh token is missing', async () => {
    const emptyBodyEvent = { body: JSON.stringify({}) } as APIGatewayProxyEventV2;
    const response = await handler(emptyBodyEvent);

    expect(response.statusCode).toBe(422);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.data.message.properties.refreshToken).toBeDefined();
  });

  it('should return a 500 when Cognito service fails', async () => {
    const mockError = new Error('Cognito service is down');
    cognitoMock.on(InitiateAuthCommand).rejects(mockError);

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'Something went wrong' },
    });
  });

  it('should verify that InitiateAuth is called with REFRESH_TOKEN_AUTH flow', async () => {
    cognitoMock.on(InitiateAuthCommand).resolves({
      AuthenticationResult: mockTokens,
    });

    await handler(event);

    expect(cognitoMock.call(0).args[0].input).toMatchObject({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: 'valid-refresh-token-abc123',
      },
    });
  });

});
