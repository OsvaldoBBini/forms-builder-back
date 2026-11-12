import { CompanyRepository } from '../repository/companyRepository.js';
import { UpdateDefaultCompanyUseCase } from './use-case/index.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { databaseGateway } from '../../../adapters/database/index.js';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage.js';


export const handler = functionWrapper('updateDefaultCompany', async ({ event, logger }) => {
  const userId = event.requestContext.authorizer?.jwt.claims.sub;
  const { companyId } = event.pathParameters || {};

  if (!companyId) {
    return missingCompanyIdMessage;
  }
  
  const companyRepository = new CompanyRepository(databaseGateway);
  const updateDefaultCompanyUseCase = new UpdateDefaultCompanyUseCase(companyRepository);

  logger.info({ message: 'Input validation successful', companyId });

  const company = await updateDefaultCompanyUseCase.execute({ userId, companyId: companyId });

  return {
    statusCode: 201,
    body: JSON.stringify({
      data: { company }
    }),
  };
});