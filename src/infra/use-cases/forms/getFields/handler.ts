import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage';
import { functionWrapper } from '../../../utils/functionWrapper';
import { GetFormFieldsUseCase } from './use-case';
import { fileStoreGateway } from '../../../adapters/fileStore';

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
