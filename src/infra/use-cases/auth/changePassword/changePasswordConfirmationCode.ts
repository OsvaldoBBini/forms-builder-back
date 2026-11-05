import z from 'zod';
import { authGateway } from '../../../adapters/auth';
import { functionWrapper } from '../../../utils/functionWrapper';

const changePasswordConfirmationCodeSchema = z.object({
  email: z.email({message: 'Invalid email format.'}),
});

export const handler = functionWrapper('changePasswordConfirmationCode', async ({ event, logger }) => {
  logger.info('Change password confirmation code process started');
  const { email } = changePasswordConfirmationCodeSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', email });
  await authGateway.changePasswordConfirmationCode(email);

  logger.info({ message: 'Password reset confirmation code sent successfully', email });
  return {
    statusCode: 200,
    body: JSON.stringify({ data: { user: { email } } })
  };
});