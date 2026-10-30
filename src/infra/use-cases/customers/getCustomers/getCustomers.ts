import { ErrorManager } from '../../../../errors/errorManager';
import { Logger } from '@aws-lambda-powertools/logger';
import { customerRepository } from '../repository/customerRepository';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage';

const logger = new Logger({ serviceName: 'getCustomers' });
const { errorHandler } = new ErrorManager(logger);

export async function handler(event: APIGatewayProxyEvent) {

  try {
    const { companyId } = event.pathParameters || {};
    
    if (!companyId) {
      return missingCompanyIdMessage;
    }

    logger.info({ message: 'Fetching customers for company', companyId });

    const customers = await customerRepository.getCustomers(companyId);
  
    return {
      statusCode: 200,
      body: JSON.stringify(
        { 
          data: {
            items: customers || []
          }
        }
      ),
    };
    
  } catch (error) {
    const errorResponse = errorHandler(error);
    return errorResponse;
  }  
}