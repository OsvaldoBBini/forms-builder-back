import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { mockClient } from 'aws-sdk-client-mock';
import {
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';

describe('getProfile - me handler', () => {
  const cognitoMock = mockClient(CognitoIdentityProviderClient);

  const mockUserId = 'user-test-sub-123';
  const mockPoolId = 'test-pool-id-123';

  const mockUserAttributes = [
    { Name: 'sub', Value: mockUserId },
    { Name: 'email', Value: 'test@example.com' },
    { Name: 'email_verified', Value: 'true' },
    { Name: 'given_name', Value: 'Test' },
    { Name: 'family_name', Value: 'User' },
  ];

  const createEvent = (userId: string = mockUserId): APIGatewayProxyEventV2 => ({
    requestContext: {
      authorizer: {
        jwt: {
          claims: {
            sub: userId,
          },
        },
      },
    },
  } as unknown as APIGatewayProxyEventV2);

  beforeEach(() => {
    cognitoMock.reset();
    vi.resetModules();

    process.env = {
      COGNITO_POOL_ID: mockPoolId,
      COGNITO_CLIENT_ID: 'test-client-id',
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return user profile successfully', async () => {
    cognitoMock.on(AdminGetUserCommand).resolves({
      UserAttributes: mockUserAttributes,
    });

    const { handler } = await import('./me.js');
    const event = createEvent();
    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data).toEqual({
      email: 'test@example.com',
      fullName: 'Test',
      userId: 'user-test-sub-123',
    });
  });

  it('should handle empty user attributes', async () => {
    cognitoMock.on(AdminGetUserCommand).resolves({
      UserAttributes: [],
    });

    const { handler } = await import('./me.js');
    const event = createEvent();
    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.data).toEqual({
      email: '',
      fullName: '',
      userId: '',
    });
  });

  it('should extract userId from JWT claims correctly', async () => {
    cognitoMock.on(AdminGetUserCommand).resolves({
      UserAttributes: mockUserAttributes,
    });

    const { handler } = await import('./me.js');
    const customUserId = 'custom-user-id-456';
    const event = createEvent(customUserId);
    await handler(event);

    expect(cognitoMock.call(0).args[0].input).toEqual({
      Username: customUserId,
      UserPoolId: mockPoolId,
    });
  });
});
