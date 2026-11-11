import { AdminGetUserCommand, CognitoIdentityProviderClient, ConfirmForgotPasswordCommand, ConfirmSignUpCommand, ForgotPasswordCommand, InitiateAuthCommand, ResendConfirmationCodeCommand, SignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { type AuthGatewayInterface } from '../../domain/entities/adapters/auth/authGateway.js';
import { type AccessPayloadInterface, type ChangePasswordInterface, type ConfirmAccountInterface, type SignInInterface, type SignUpInterface, type UserAttributesDomainInterface, type UserAttributesPersistenceInterface } from '../../domain/entities/adapters/auth/auth.js';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'authGateway' });

export class CognitoGateway implements AuthGatewayInterface {
  
  private cognitoClient: CognitoIdentityProviderClient;
  private poolId: string | undefined;
  private clientId: string | undefined;

  constructor() {
    this.cognitoClient = new CognitoIdentityProviderClient();
    this.clientId = process.env.COGNITO_CLIENT_ID;
    this.poolId = process.env.COGNITO_POOL_ID;
  }

  async signUp(signUpData: SignUpInterface): Promise<{ userId: string | undefined }> {
    const { email, password, fullName } = signUpData;
    
    logger.debug({ message: 'Sending SignUp command to Cognito', email });
    const command = new SignUpCommand({
      ClientId: this.clientId,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'given_name',
          Value: fullName
        }]
    });

    const { UserSub } = await this.cognitoClient.send(command);
    
    logger.info({ message: 'User registered successfully', userId: UserSub, email });
    return { userId: UserSub };
  }

  async signIn(signInData: SignInInterface): Promise<AccessPayloadInterface | undefined> {
    const { email, password } = signInData;
    const command = new InitiateAuthCommand({
      ClientId: this.clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      }
    });
    
    const { AuthenticationResult } = await this.cognitoClient.send(command);
    
    if (!AuthenticationResult) {
      logger.error({ message: 'Authentication failed: No authentication result returned', email });
      return undefined;
    }
    
    return {
      accessToken: AuthenticationResult.AccessToken || '',
      refreshToken: AuthenticationResult.RefreshToken || ''
    };
  }

  async refreshToken(refreshToken: string): Promise<AccessPayloadInterface | undefined> {
    logger.debug({ message: 'Sending InitiateAuth command to Cognito', refreshToken });
    const command = new InitiateAuthCommand({
      ClientId: this.clientId,
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    });
    
    const { AuthenticationResult } = await this.cognitoClient.send(command);
    if (!AuthenticationResult) {
      logger.error({ message: 'Refresh token is invalid or has expired', refreshToken });
      return undefined;
    }

    return {
      accessToken: AuthenticationResult.AccessToken || '',
      refreshToken: AuthenticationResult.RefreshToken || ''
    };
  }

  async changePassword(changePasswordData: ChangePasswordInterface): Promise<void> {
    const { email, confirmationCode, newPassword } = changePasswordData;

    logger.debug({ message: 'Sending ConfirmForgotPassword command to Cognito', email });
    const command = new ConfirmForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword
    });

    await this.cognitoClient.send(command);
  }

    
  async changePasswordConfirmationCode(email: string): Promise<void> {
    logger.debug({ message: 'Sending ForgotPassword command to Cognito', email });
    const command = new ForgotPasswordCommand({
      ClientId: this.clientId,
      Username: email,
    });
    
    await this.cognitoClient.send(command);
  }

  async confirmAccount(confirmAccountData: ConfirmAccountInterface): Promise<void> {
    const { email, confirmationCode } = confirmAccountData;

    logger.debug({ message: 'Sending ConfirmSignUp command to Cognito', email });
    const command = new ConfirmSignUpCommand({
      ClientId: this.clientId,
      Username: email,
      ConfirmationCode: confirmationCode
    });
    
    await this.cognitoClient.send(command);
  }

  async resendConfirmationCode(email: string): Promise<void> {
    logger.debug({ message: 'Sending ResendConfirmationCode command to Cognito', email });
    const command = new ResendConfirmationCodeCommand({
      ClientId: this.clientId,
      Username: email,
    });
    
    await this.cognitoClient.send(command);
  }

  async getUserInfos(userId: string): Promise< UserAttributesDomainInterface | undefined > {

    const command = new AdminGetUserCommand({
      Username: userId,
      UserPoolId: this.poolId,
    });
    
    const { UserAttributes } = await this.cognitoClient.send(command);
    
    if (!UserAttributes) {
      logger.error({ message: 'Failed to retrieve user attributes: No attributes returned', userId });
      throw new Error('Failed to retrieve user attributes');
    }

    const attributes = UserAttributes
      .reduce((acc, post) => {
        const { Name, Value } = post;
        if (!Name || !Value) return acc;
        return {...acc, [Name]: Value};
      }, {});
    
    const persistenceAttributes = attributes as UserAttributesPersistenceInterface;

    const userAttributes: UserAttributesDomainInterface = {
      email: persistenceAttributes.email || '',
      fullName: persistenceAttributes.given_name || '',
      userId: persistenceAttributes.sub || ''
    };
    
    return userAttributes;
  }

}