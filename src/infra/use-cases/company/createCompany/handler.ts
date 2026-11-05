import z from 'zod';
import { CompanyRepository } from '../repository/companyRepository';
import { CreateCompanyUseCase } from './use-case';
import { functionWrapper } from '../../../utils/functionWrapper';
import { databaseGateway } from '../../../adapters/database';

const createCompanySchema = z.object({
  companyName: z.string().min(2, {message: 'Company name must be at least 2 characters long.'}).max(20, {message: 'Company name must be at most 20 characters long.'}),
  cnpj: z.string().regex(/^\d{14}$/, { message: 'Cnpj must be 14 digits long.' }),
  isDefault: z.boolean().default(false)
});

export const handler = functionWrapper('createCompany', async ({ event, logger }) => {
  const userId = event.requestContext.authorizer?.jwt.claims.sub;
  const companyRepository = new CompanyRepository(databaseGateway);
  const createCompanyUseCase = new CreateCompanyUseCase(companyRepository);

  const { companyName, cnpj, isDefault } = createCompanySchema.parse(JSON.parse(event.body || ''));
  logger.info({ message: 'Input validation successful', companyName });

  const company = await createCompanyUseCase.execute({ userId, cnpj, companyName, isDefault, role: 'owner' });

  return {
    statusCode: 201,
    body: JSON.stringify({
      data: { company }
    }),
  };
});