import z from 'zod';
import { FormsRepository } from '../repository/formsRepository.js';
import { CreateFormUseCase } from './use-case/index.js';
import { functionWrapper } from '../../../utils/functionWrapper.js';
import { databaseGateway } from '../../../adapters/database/index.js';
import { fieldsSchema } from '../../../domain/entities/form/form.js';
import { fileStoreGateway } from '../../../adapters/fileStore/index.js';

const createFormSchema = z.object({
  formName: z.string()
    .min(2, { message: 'Form name must be at least 2 characters long.' })
    .max(20, { message: 'Form name must be at most 20 characters long.' }),
  fields: fieldsSchema
});

export const handler = functionWrapper('createForm', async ({ event, logger }) => {
  const { companyId } = event.pathParameters || {};
  const formsRepository = new FormsRepository(databaseGateway);
  const createFormUseCase = new CreateFormUseCase(formsRepository, fileStoreGateway);

  const { formName, fields } = createFormSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', formName });

  const form = await createFormUseCase.execute({ companyId: companyId!, formName, fields });

  return {
    statusCode: 201,
    body: JSON.stringify({
      data: { form }
    }),
  };
});
