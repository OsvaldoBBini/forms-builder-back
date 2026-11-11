/* eslint-disable @typescript-eslint/no-empty-object-type */
import { 
  type SignInInterface, 
  type AccessPayloadInterface, 
  type SignUpInterface, 
  type ChangePasswordInterface, 
  type ConfirmAccountInterface 
} from './auth.js';


export interface AuthGatewayInterface {
  signUp(signUpData: SignUpInterface): Promise<{ userId: string | undefined }>;
  signIn(signInData: SignInInterface): Promise<AccessPayloadInterface | undefined>;
  refreshToken(refreshToken: string): Promise<AccessPayloadInterface | undefined>;
  changePassword(changePasswordData: ChangePasswordInterface): Promise<void>;
  changePasswordConfirmationCode(email: string): Promise<void>;
  confirmAccount(confirmAccountData: ConfirmAccountInterface): Promise<void>;
  resendConfirmationCode(email: string): Promise<void>;
  getUserInfos(userId: string): Promise< {} | undefined >;
}