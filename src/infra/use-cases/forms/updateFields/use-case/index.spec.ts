import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFieldsUseCase } from './index.js';

describe('UpdateFieldsUseCase', () => {
  const mockFileStoreGateway = {
    bucketName: 'test-bucket',
    getJsonFile: vi.fn(),
    storeJsonFile: vi.fn(),
    deleteFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFileStoreGateway.storeJsonFile.mockResolvedValue(undefined);
  });

  it('should store the fields at the form fields address', async () => {
    const fields = [{
      label: 'Nome completo',
      fieldType: 'shortAnswer',
      fieldId: 'field-1',
      aiAnalysis: {
        prompt: 'Analise o campo',
        shouldAnalyse: false,
      },
    }];

    const useCase = new UpdateFieldsUseCase(mockFileStoreGateway);
    await useCase.execute({ companyId: 'company-123', formId: 'form-456', fields });

    expect(mockFileStoreGateway.storeJsonFile).toHaveBeenCalledWith(
      'test-bucket/company-123/fields/form-456/fields.json',
      JSON.stringify(fields)
    );
  });

  it('should throw an error when storing fields fails', async () => {
    mockFileStoreGateway.storeJsonFile.mockRejectedValueOnce(new Error('storage unavailable'));
    const useCase = new UpdateFieldsUseCase(mockFileStoreGateway);

    await expect(useCase.execute({
      companyId: 'company-123',
      formId: 'form-456',
      fields: [],
    })).rejects.toThrow('Failed to update fields: Error: storage unavailable');
  });
});
