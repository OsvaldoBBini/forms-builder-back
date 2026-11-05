import { formsRepository } from '../repository/formsRepository';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage';
import { functionWrapper } from '../../../utils/functionWrapper';

export const handler = functionWrapper('getForms', async ({ event, logger }) => {
  const { companyId } = event.pathParameters || {};

  if (!companyId) {
    return missingCompanyIdMessage;
  }

  logger.info({ message: 'Fetching forms for company', companyId });

  const forms = await formsRepository.getForms(companyId);  
  return {
    statusCode: 200,
    body: JSON.stringify(
      { 
        data: { items: forms || [] }
      }
    ),
  };
});