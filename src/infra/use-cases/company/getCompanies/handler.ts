import { CompanyRepository } from '../repository/companyRepository';
import { GetCompaniesUseCase } from './use-case';

import { functionWrapper } from '../../../utils/functionWrapper';
import { databaseGateway } from '../../../adapters/database';

export const handler = functionWrapper('getCompanies', async ({ event, logger }) => {
  const userId = event.requestContext.authorizer?.jwt.claims.sub;

  const companyRepository = new CompanyRepository(databaseGateway);
  const getCompaniesUseCase = new GetCompaniesUseCase(companyRepository);

  logger.info({ message: 'Fetching companies for user', userId });

  const companies = await getCompaniesUseCase.execute({ userId });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        items: companies || []
      }
    }),
  };
});