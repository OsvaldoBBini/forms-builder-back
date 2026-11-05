import { authGateway } from '../../../adapters/auth';
import { functionWrapper } from '../../../utils/functionWrapper';

export const handler = functionWrapper('getProfile', async ({ event, logger }) => {
  logger.info({ message: 'Get request context', requestContext: event.requestContext });
  const userId = event.requestContext.authorizer?.jwt.claims.sub;

  const attributes = await authGateway.getUserInfos(userId);
  logger.info({ message: 'Get attributes', attributes });

  return {
    statusCode: 200,
    body: JSON.stringify({ data: attributes }),
  };
});