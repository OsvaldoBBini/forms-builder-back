import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler.js';

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

describe('updateFields handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFileStoreGateway.storeJsonFile.mockResolvedValue(undefined);
  });

  it('should update form fields successfully', async () => {
    const fields = [{
      label: 'Nome completo',
      fieldType: 'shortAnswer',
      fieldId: 'field-1',
      aiAnalysis: {
        prompt: 'Analise o campo',
        shouldAnalyse: false,
      },
    }];

    const event = {
      body: JSON.stringify({ fields }),
      pathParameters: {
        companyId: 'company-123',
        formId: 'form-456',
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.formId).toBe('form-456');
    expect(mockFileStoreGateway.storeJsonFile).toHaveBeenCalledWith(
      'test-bucket/company-123/fields/form-456/fields.json',
      JSON.stringify(fields)
    );
  });

  it('should return unprocessable entity when fields are invalid', async () => {
    const event = {
      body: JSON.stringify({ fields: [{ fieldId: 'field-1' }] }),
      pathParameters: {
        companyId: 'company-123',
        formId: 'form-456',
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(422);
    expect(mockFileStoreGateway.storeJsonFile).not.toHaveBeenCalled();
  });
});
