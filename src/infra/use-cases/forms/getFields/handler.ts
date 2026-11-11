import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { GetFormFieldsUseCase } from './use-case/index.js';
import { fileStoreGateway } from '../../../adapters/fileStore/index.js';

export const handler = functionWrapper('getFields', async ({ event, logger }) => {
  const { companyId, formId } = event.pathParameters || {};

  if (!companyId) {
    return missingCompanyIdMessage;
  }

  if (!formId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Missing formId in path parameters',
      }),
    };
  }

  const getFormFieldsUseCase = new GetFormFieldsUseCase(fileStoreGateway);

  logger.info({ message: 'Fetching form fields for company', companyId, formId });

  const fields = await getFormFieldsUseCase.execute({ companyId, formId });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: {
        fields: fields || []
      }
    }),
  };
});
