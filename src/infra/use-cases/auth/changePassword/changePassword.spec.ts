import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handler } from './changePassword.js';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';


describe('changePassword', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient);

  const event = {
    body: JSON.stringify({
      email: 'test@example.com',
      newPassword: 'ValidPassword1!',
      confirmationCode: 'abcdef'
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

  it('should change the user password', async () => {

    cognitoMock.on(ConfirmForgotPasswordCommand).resolves({});

    const response = await handler(event);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      data: { user: { email: JSON.parse(event.body || '').email } }
    });
  });

  it('should return a 400 with an error message indicating invalid password', async () => {
    const body = JSON.parse(event.body || '');
    
    cognitoMock.on(ConfirmForgotPasswordCommand).resolves({});
  
    const emptyBodyEvent = { body: JSON.stringify({...body, newPassword: ''}) } as APIGatewayProxyEventV2;
    const response = await handler(emptyBodyEvent);
  
    expect(response.statusCode).toBe(422);
    expect(JSON.parse(response.body)).toEqual({
      data: {
        message: {
          'errors': [],
          'properties': {
            'newPassword': {
              'errors': [
                'Password must be at least 8 characters long.',
                'Password must contain at least one uppercase letter.',
                'Password must contain at least one number.',
                'Password must contain at least one special character.',
              ]
            }
          }
        }
      },
    });
  });

  it('should return a 500 with a generic error message ', async () => {
    const mockError = new Error('Cognito service is down');
    cognitoMock.on(ConfirmForgotPasswordCommand).rejects(mockError);
    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'Something went wrong' },
    });
  });

});