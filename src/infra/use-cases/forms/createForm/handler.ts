import z from 'zod';
import { FormsRepository } from '../repository/formsRepository';
import { CreateFormUseCase } from './use-case';
import { functionWrapper } from '../../../utils/functionWrapper';
import { databaseGateway } from '../../../adapters/database';

const createFormSchema = z.object({
  formName: z.string()
    .min(2, { message: 'Form name must be at least 2 characters long.' })
    .max(20, { message: 'Form name must be at most 20 characters long.' }),
});

export const handler = functionWrapper('createForm', async ({ event, logger }) => {
  const { companyId } = event.pathParameters || {};
  const formsRepository = new FormsRepository(databaseGateway);
  const createFormUseCase = new CreateFormUseCase(formsRepository);

  const { formName } = createFormSchema.parse(JSON.parse(event.body || ''));

  logger.info({ message: 'Input validation successful', formName });

  const form = await createFormUseCase.execute({ companyId: companyId!, formName });

  return {
    statusCode: 201,
    body: JSON.stringify({
      data: { form }
    }),
  };
});
