import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handler } from './resendConfirmationCode.js';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider';


describe('resendConfirmationCode', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient);

  const event = {
    body: JSON.stringify({
      email: 'test@example.com',
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

  it('should resend confirmation code successfully', async () => {

    cognitoMock.on(ResendConfirmationCodeCommand).resolves({});

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'Confirmation code sent to email' }
    });
  });

  it('should return a 400 with an error message indicating invalid email', async () => {
    cognitoMock.on(ResendConfirmationCodeCommand).resolves({});
  
    const invalidEmailEvent = { body: JSON.stringify({ email: 'invalid-email' }) } as APIGatewayProxyEventV2;
    const response = await handler(invalidEmailEvent);
  
    expect(response.statusCode).toBe(422);
    expect(JSON.parse(response.body)).toEqual({
      data: {
        message: {
          'errors': [],
          'properties': {
            'email': {
              'errors':  [
                'Invalid email format.',
              ],
            },
          },
        },
      },
    });
  });

  it('should return a 400 with an error message indicating missing email', async () => {
    cognitoMock.on(ResendConfirmationCodeCommand).resolves({});
  
    const emptyBodyEvent = { body: JSON.stringify({}) } as APIGatewayProxyEventV2;
    const response = await handler(emptyBodyEvent);
  
    expect(response.statusCode).toBe(422);
  });
});
