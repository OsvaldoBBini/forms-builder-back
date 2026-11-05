import z from 'zod';
import { authGateway } from '../../../adapters/auth';
import { functionWrapper } from '../../../utils/functionWrapper';

const resendConfirmationCodeSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
});

export const handler = functionWrapper('resendConfirmationCode', async ({ event, logger }) => {
  logger.info('Resend confirmation code process started');
  const {
    email
  } = resendConfirmationCodeSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', email });
  await authGateway.resendConfirmationCode(email);

  logger.info({ message: 'Confirmation code resent successfully', email });
  return {
    statusCode: 200,
    body: JSON.stringify({ data: { message: 'Confirmation code sent to email' } })
  };
});
