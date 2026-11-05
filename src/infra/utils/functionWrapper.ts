import { APIGatewayProxyEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { ErrorManager } from '../../errors/errorManager';

export interface HandlerContext {
  event: APIGatewayProxyEvent;
  context: Context;
  logger: Logger;
}

type BusinessLogicHandler = (ctx: HandlerContext) => Promise<APIGatewayProxyResult>;

export const functionWrapper = (serviceName: string, logic: BusinessLogicHandler) => {
  const logger = new Logger({ serviceName });
  const { errorHandler } = new ErrorManager(logger);

  return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    try {
      return await logic({ event, context, logger });
    } catch (error) {
      return errorHandler(error);
    }
  };
};