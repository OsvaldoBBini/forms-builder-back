import { CustomerRepository } from '../repository/customerRepository.js';
import { GetCustomersUseCase } from './use-case/index.js';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { databaseGateway } from '../../../adapters/database/index.js';

export const handler = functionWrapper('getCustomers', async ({ event, logger }) => {
  const { companyId } = event.pathParameters || {};

  if (!companyId) {
    return missingCompanyIdMessage;
  }

  const customerRepository = new CustomerRepository(databaseGateway);
  const getCustomersUseCase = new GetCustomersUseCase(customerRepository);

  logger.info({ message: 'Fetching customers for company', companyId });

  const customers = await getCustomersUseCase.execute({ companyId });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        items: customers || []
      }
    }),
  };
});