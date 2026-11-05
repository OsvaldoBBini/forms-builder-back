import { z } from 'zod';
import { authGateway } from '../../../adapters/auth';
import { functionWrapper } from '../../../utils/functionWrapper';

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, {message: 'Refresh token is required.'})
});

export const handler = functionWrapper('refreshToken', async ({ event, logger }) => {
  logger.info('Refresh token process started');
  const { refreshToken } = refreshTokenSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', refreshToken });
  const authResult = await authGateway.refreshToken(refreshToken);

  if (!authResult) {
    return {
      statusCode: 401,
      body: JSON.stringify({ data: { message: 'Invalid refresh token.' } })
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        accessToken: authResult.accessToken
      }
    })
  };
});