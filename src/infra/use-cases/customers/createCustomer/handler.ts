import z from 'zod';
import { CustomerRepository } from '../repository/customerRepository.js';
import { CreateCustomerUseCase } from './use-case/index.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { databaseGateway } from '../../../adapters/database/index.js';

const createCustomerSchema = z.object({
  email: z.email({message: 'Invalid email format.'}).nullable(),
  cpf: z.string().regex(/^\d{11}$/, { message: 'CPF must be 11 digits long.' }),
  phoneNumber: z.string().regex(/^[1-9]{2}9\d{8}$/, { message: 'Phone number must be 11 digits long.' }),
  fullName: z.string().min(2,{message: 'Full name must be at least 2 characters long.'}).max(50,{message: 'Full name must be at most 50 characters long.'}),
});

export const handler = functionWrapper('createCustomer', async ({ event, logger }) => {
  const { companyId } = event.pathParameters || {};
  const customerRepository = new CustomerRepository(databaseGateway);
  const createCustomerUseCase = new CreateCustomerUseCase(customerRepository);

  const {
    email,
    cpf,
    phoneNumber,
    fullName,
  } = createCustomerSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', email, fullName, cpf, phoneNumber });

  const customer = await createCustomerUseCase.execute({ companyId: companyId!, email, cpf, phoneNumber, fullName });

  return {
    statusCode: 201,
    body: JSON.stringify({
      data: { customer }
    }),
  };
});