import z from 'zod';
import { authGateway } from '../../../adapters/auth/index.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';

const accountConfirmationSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
  confirmationCode: z.string({message: 'Invalid confirmation code'}).max(6, {message: 'Confirmation code must be at most 6 characters long.'}),
});

export const handler = functionWrapper('accountConfirmation', async ({ event, logger }) => {
  logger.info('Account confirmation process started');
  const {
    email,
    confirmationCode
  } = accountConfirmationSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', email });
  await authGateway.confirmAccount({ email, confirmationCode });

  logger.info({ message: 'Account confirmed successfully', email });
  return {
    statusCode: 200,
    body: JSON.stringify({ data: { user: { email } } })
  };
});