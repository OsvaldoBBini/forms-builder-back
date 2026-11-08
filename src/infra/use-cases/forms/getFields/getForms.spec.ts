import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage';
import { handler } from './handler';

const { mockFileStoreGateway } = vi.hoisted(() => ({
  mockFileStoreGateway: {
    bucketName: 'test-bucket',
    getJsonFile: vi.fn(),
    storeJsonFile: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

vi.mock('../../../adapters/fileStore', () => ({
  fileStoreGateway: mockFileStoreGateway,
}));

describe('getFields handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFileStoreGateway.getJsonFile.mockReset();
  });

  it('should return form fields successfully', async () => {
    const event = {
      pathParameters: {
        companyId: 'company-123',
        formId: 'form-456',
      }
    } as unknown as APIGatewayProxyEvent;

    const mockFields = [
      {
        fieldId: 'field-1',
        label: 'Nome completo',
        fieldType: 'shortAnswer',
        aiAnalysis: {
          prompt: 'Analise o campo',
          shouldAnalyse: false,
        },
      }
    ];

    mockFileStoreGateway.getJsonFile.mockResolvedValueOnce(mockFields);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.fields).toEqual(mockFields);
    expect(mockFileStoreGateway.getJsonFile).toHaveBeenCalledWith(
      'test-bucket/company-123/fields/form-456/fields.json'
    );
  });

  it('should return unauthorized when companyId is missing', async () => {
    const event = {
      pathParameters: {
        formId: 'form-456',
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response).toEqual(missingCompanyIdMessage);
  });

  it('should return bad request when formId is missing', async () => {
    const event = {
      pathParameters: {
        companyId: 'company-123',
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(400);
    expect(responseBody.message).toBe('Missing formId in path parameters');
  });
});
