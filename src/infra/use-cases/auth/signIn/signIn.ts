import { z } from 'zod';
import { authGateway } from '../../../adapters/auth/index.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';

const signInSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  password: z.string({message: 'Invalid password'}).min(8, {message: 'Password must be at least 8 characters long.'}).max(20, {message: 'Password must be at most 20 characters long.'}),
});

export const handler = functionWrapper('signIn', async ({ event, logger }) => {
  logger.info('Sign in process started');
  const { email, password } = signInSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', email });
  const authResult = await authGateway.signIn({ email, password });

  if (!authResult) {
    return {
      statusCode: 401,
      body: JSON.stringify({ data: { message: 'Invalid Credentials.' } })
    };
  }

  logger.info({ message: 'User authenticated successfully', email });
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        accessToken: authResult.accessToken,
        refreshToken: authResult.refreshToken
      }
    })
  };
});