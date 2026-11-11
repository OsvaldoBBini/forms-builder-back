import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { handler } from './signUp.js';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  UsernameExistsException,
} from '@aws-sdk/client-cognito-identity-provider';


describe('signUp', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient);

  const mockUserSub = 'user-test-sub';

  const event = {
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'ValidPassword1!',
      fullName: 'TestFirstName'
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

  it('should sing up the new user', async () => {

    cognitoMock.on(SignUpCommand).resolves({
      UserSub: mockUserSub
    });

    const response = await handler(event);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      data: { user: { id: mockUserSub } }
    });
  });

  it('should return a 422 with an error message indicating invalid input data', async () => {
    cognitoMock.on(SignUpCommand).resolves({
      UserSub: mockUserSub
    });
  
    const emptyBodyEvent = { body: JSON.stringify({}) } as APIGatewayProxyEventV2;
    const response = await handler(emptyBodyEvent);
  
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
            'fullName': {
              'errors':  [
                'Invalid input: expected string, received undefined',
              ],
            },
            'password': {
              'errors':  [
                'Invalid input: expected string, received undefined',
              ],
            },
          },
        },
      }
    });
  });

  it('should return a 422 with an error message indicating invalid password', async () => {
    cognitoMock.on(SignUpCommand).resolves({
      UserSub: mockUserSub
    });

    const body = JSON.parse(event.body || '');
    const emptyBodyEvent = { body:  JSON.stringify({...body, password: ''}) } as APIGatewayProxyEventV2;
    const response = await handler(emptyBodyEvent);
  
    expect(response.statusCode).toBe(422);
    expect(JSON.parse(response.body)).toEqual({
      data: {
        message: {
          'errors': [],
          'properties': {
            'password': {
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

  it('should return a 409 with an error message indicating already in used e-mail', async () => {

    const mockError = new UsernameExistsException('');
    cognitoMock.on(SignUpCommand).rejects(mockError);

    const response = await handler(event);

    expect(response.statusCode).toBe(409);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'E-mail already in used' }
    });
  });

  it('should return a 500 with a generic error message ', async () => {
    const mockError = new Error('Cognito service is down');
    cognitoMock.on(SignUpCommand).rejects(mockError);
    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'Something went wrong' },
    });
  });

});