import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFormUseCase } from './index.js';

describe('CreateFormUseCase', () => {
  const mockFormsRepository = {
    storeForm: vi.fn(),
  };

  const mockFileStoreGateway = {
    bucketName: 'test-bucket',
    getJsonFile: vi.fn(),
    storeJsonFile: vi.fn(),
    deleteFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileStoreGateway.storeJsonFile.mockResolvedValue(undefined);
    mockFileStoreGateway.deleteFile.mockResolvedValue(undefined);
    mockFormsRepository.storeForm.mockResolvedValue(undefined);
  });

  it('should create a form and return the payload', async () => {
    const fields = [{
      label: 'Nome completo',
      fieldType: 'shortAnswer',
      fieldId: 'field-1',
      aiAnalysis: {
        prompt: 'Analise o campo',
        shouldAnalyse: false,
      },
    }];

    const useCase = new CreateFormUseCase(mockFormsRepository as any, mockFileStoreGateway as any);
    const result = await useCase.execute({ companyId: 'company-123', formName: 'Lead Form', fields });

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
    expect(result).toEqual(expect.any(String));
  });
});
