import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import z from 'zod';
import { formsRepository } from '../repository/formsRepository';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';

const logger = new Logger({ serviceName: 'createForm' });
const { errorHandler } = new ErrorManager(logger);

const createFormSchema = z.object({
  formName: z.string()
    .min(2, {message: 'Form name must be at least 2 characters long.'})
    .max(20, {message: 'Form name must be at most 20 characters long.'}),
});

export async function handler(event: APIGatewayProxyEvent) {
  try {   
    const { companyId } = event.pathParameters || {};
    const { formName } = createFormSchema.parse(JSON.parse(event.body || ''));

    logger.info({ message: 'Input validation successful', formName });

    const formId = await formsRepository.storeForm({companyId: companyId!, formName });
  
    return {
      statusCode: 201,
      body: JSON.stringify(
        { 
          data: { form: { formId, formName, companyId } }
        }
      ),
    };
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}