import z from 'zod';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { fieldsSchema } from '../../../domain/entities/form/form.js';
import { fileStoreGateway } from '../../../adapters/fileStore/index.js';
import { UpdateFieldsUseCase } from './use-case/index.js';

const updateFieldsSchema = z.object({
  fields: fieldsSchema
});

export const handler = functionWrapper('updateField', async ({ event, logger }) => {
  const { companyId, formId } = event.pathParameters || {};

  const updateFieldsUseCase = new UpdateFieldsUseCase(fileStoreGateway);

  const { fields } = updateFieldsSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', fields });

  await updateFieldsUseCase.execute({ companyId: companyId!, formId: formId!, fields });

  return {
    statusCode: 201,
    body: JSON.stringify({
      data: { formId }
    }),
  };
});
