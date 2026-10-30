import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import { formsRepository } from '../repository/formsRepository';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage';

const logger = new Logger({ serviceName: 'getForms' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEvent) {
  try {   
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
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}