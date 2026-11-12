import z from 'zod';
import { CompanyRepository } from '../repository/companyRepository.js';
import { UpdateCompanyUseCase } from './use-case/updateCompanyUseCase.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { databaseGateway } from '../../../adapters/database/index.js';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage.js';

const updateCompanySchema = z.object({
  companyName: z.string()
    .min(2, { message: 'Company name must be at least 2 characters long.' })
    .max(20, { message: 'Company name must be at most 20 characters long.' }),
  cnpj: z.string().regex(/^\d{14}$/, { message: 'Cnpj must be 14 digits long.' }),
  isDefault: z.boolean(),
});

export const handler = functionWrapper('updateCompany', async ({ event, logger }) => {
  const userId = event.requestContext.authorizer?.jwt.claims.sub;
  const { companyId } = event.pathParameters || {};

  if (!companyId) {
    return missingCompanyIdMessage;
  }

  const { companyName, cnpj, isDefault } = updateCompanySchema.parse(JSON.parse(event.body || ''));
  const companyRepository = new CompanyRepository(databaseGateway);
  const updateCompanyUseCase = new UpdateCompanyUseCase(companyRepository);

  logger.info({ message: 'Input validation successful', companyId });

  const company = await updateCompanyUseCase.execute({ userId, companyId, companyName, cnpj, isDefault });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: { company }
    }),
  };
});
