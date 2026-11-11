import { FormsRepository } from '../repository/formsRepository.js';
import { GetFormsUseCase } from './use-case/index.js';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { databaseGateway } from '../../../adapters/database/index.js';

export const handler = functionWrapper('getForms', async ({ event, logger }) => {
  const { companyId } = event.pathParameters || {};

  if (!companyId) {
    return missingCompanyIdMessage;
  }

  const formsRepository = new FormsRepository(databaseGateway);
  const getFormsUseCase = new GetFormsUseCase(formsRepository);

  logger.info({ message: 'Fetching forms for company', companyId });

  const forms = await getFormsUseCase.execute({ companyId });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        items: forms || []
      }
    }),
  };
});
