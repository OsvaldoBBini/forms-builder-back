import z from 'zod';
import { formsRepository } from '../repository/formsRepository';
import { functionWrapper } from '../../../utils/functionWrapper';

const createFormSchema = z.object({
  formName: z.string()
    .min(2, {message: 'Form name must be at least 2 characters long.'})
    .max(20, {message: 'Form name must be at most 20 characters long.'}),
});

export const handler = functionWrapper('createForm', async ({ event, logger }) => {
  const { companyId } = event.pathParameters || {};
  const { formName } = createFormSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', formName });

  const formId = await formsRepository.storeForm({companyId: companyId!, formName });

  return {
    statusCode: 201,
    body: JSON.stringify({
      data: { form: { formId, formName, companyId } }
    }),
  };
});