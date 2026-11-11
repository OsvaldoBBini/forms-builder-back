import z from 'zod';
import { authGateway } from '../../../adapters/auth/index.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';

const changePasswordSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  confirmationCode: z.string().max(6, {message: 'Confirmation code must be at most 6 characters long.'}),
  newPassword: z.string()
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
});

export const handler = functionWrapper('changePassword', async ({ event, logger }) => {
  logger.info('Change password process started');
  const { email, confirmationCode, newPassword } = changePasswordSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', email });
  await authGateway.changePassword({ email, confirmationCode, newPassword });

  logger.info({ message: 'Password changed successfully', email });
  return {
    statusCode: 201,
    body: JSON.stringify({ data: { user: { email } } })
  };
});