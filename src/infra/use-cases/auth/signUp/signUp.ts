import { z } from 'zod';
import { authGateway } from '../../../adapters/auth/index.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';

const signUpSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  password: z.string()
    .min(8, {message: 'Password must be at least 8 characters long.'})
    .max(20, {message: 'Password must be at most 20 characters long.'})
    .regex(
      /(?=.*[A-Z])/, 
      { message: 'Password must contain at least one uppercase letter.' }
    )
    .regex(
      /(?=.*[0-9])/, 
      { message: 'Password must contain at least one number.' }
    )
    .regex(
      /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/, 
      { message: 'Password must contain at least one special character.' }
    ),
  fullName: z.string().min(2, {message: 'Full name must be at least 2 characters long.'}).max(50, {message: 'Full name must be at most 50 characters long.'}),
});

export const handler = functionWrapper('signUp', async ({ event, logger }) => {
  logger.info('Sign up process started');
  const {
    email,
    password,
    fullName
  } = signUpSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', email, fullName });
  const { userId } = await authGateway.signUp({ email, password, fullName });

  return {
    statusCode: 201,
    body: JSON.stringify({ data: { user: { id: userId } } }),
  };
});