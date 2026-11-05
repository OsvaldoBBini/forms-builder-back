import { customerRepository } from '../repository/customerRepository';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage';
import { functionWrapper } from '../../../utils/functionWrapper';

export const handler = functionWrapper('getCustomers', async ({ event, logger }) => {
  const { companyId } = event.pathParameters || {};

  if (!companyId) {
    return missingCompanyIdMessage;
  }

  logger.info({ message: 'Fetching customers for company', companyId });

  const customers = await customerRepository.getCustomers(companyId);

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        items: customers || []
      }
    }),
  };
});