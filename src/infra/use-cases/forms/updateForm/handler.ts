import z from 'zod';
import { FormsRepository } from '../repository/formsRepository.js';
import { UpdateFormUseCase } from './use-case/index.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { databaseGateway } from '../../../adapters/database/index.js';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage.js';

const updateFormSchema = z.object({
  formName: z.string()
    .min(2, { message: 'Form name must be at least 2 characters long.' })
    .max(20, { message: 'Form name must be at most 20 characters long.' }),
});

export const handler = functionWrapper('updateForm', async ({ event, logger }) => {
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

  const { formName } = updateFormSchema.parse(JSON.parse(event.body || ''));
  const formsRepository = new FormsRepository(databaseGateway);
  const updateFormUseCase = new UpdateFormUseCase(formsRepository);

  logger.info({ message: 'Input validation successful', companyId, formId, formName });

  await updateFormUseCase.execute({ companyId, formId, formName });

  return {
    statusCode: 200,
    body: JSON.stringify({
      data: { formId },
    }),
  };
});
