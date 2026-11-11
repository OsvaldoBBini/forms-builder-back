import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler.js';

const { mockFormsRepository, mockFileStoreGateway } = vi.hoisted(() => ({
  mockFormsRepository: {
    storeForm: vi.fn(),
    getForms: vi.fn(),
  },
  mockFileStoreGateway: {
    bucketName: 'test-bucket',
    getJsonFile: vi.fn(),
    storeJsonFile: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

vi.mock('../repository/formsRepository', () => ({
  FormsRepository: vi.fn().mockImplementation(() => mockFormsRepository),
}));

vi.mock('../../../adapters/fileStore', () => ({
  fileStoreGateway: mockFileStoreGateway,
}));

describe('createForm handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormsRepository.storeForm.mockReset();
    mockFileStoreGateway.storeJsonFile.mockReset();
    mockFileStoreGateway.deleteFile.mockReset();
    mockFileStoreGateway.storeJsonFile.mockResolvedValue(undefined);
    mockFormsRepository.storeForm.mockResolvedValue(undefined);
  });

  it('should create a form successfully', async () => {
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
      body: JSON.stringify({ formName: 'Lead Form', fields }),
      pathParameters: {
        companyId: 'company-123'
      }
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.form).toEqual(expect.any(String));

    expect(mockFileStoreGateway.storeJsonFile).toHaveBeenCalledWith(
      expect.stringContaining('test-bucket/company-123/fields/'),
      JSON.stringify(fields)
    );

    expect(mockFormsRepository.storeForm).toHaveBeenCalledWith(
      expect.objectContaining({
        companyId: 'company-123',
        formName: 'Lead Form',
        formId: expect.any(String),
        fieldsAddress: expect.stringContaining('test-bucket/company-123/fields/'),
      })
    );
  });
});
