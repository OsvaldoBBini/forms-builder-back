import { companyRepository } from '../repository/companyRepository';
import { functionWrapper } from '../../../utils/functionWrapper';

export const handler = functionWrapper('getCompanies', async ({ event, logger }) => {
  const userId = event.requestContext.authorizer?.jwt.claims.sub;

  logger.info({ message: 'Fetching companies for user', userId });

  const companies = await companyRepository.getCompanies(userId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        items: companies || []
      }
    }),
  };
});