import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetFormFieldsUseCase } from './index';

describe('GetFormFieldsUseCase', () => {
  const mockFileStoreGateway = {
    bucketName: 'test-bucket',
    getJsonFile: vi.fn(),
    storeJsonFile: vi.fn(),
    deleteFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return fields for a company form', async () => {
    const fields = [{
      fieldId: 'field-1',
      label: 'Nome completo',
      fieldType: 'shortAnswer',
      aiAnalysis: {
        prompt: 'Analise o campo',
        shouldAnalyse: false,
      },
    }];

    mockFileStoreGateway.getJsonFile.mockResolvedValueOnce(fields);

    const useCase = new GetFormFieldsUseCase(mockFileStoreGateway as any);
    const result = await useCase.execute({ companyId: 'company-123', formId: 'form-456' });

    expect(mockFileStoreGateway.getJsonFile).toHaveBeenCalledWith(
      'test-bucket/company-123/fields/form-456/fields.json'
    );
    expect(result).toEqual(fields);
  });

  it('should return null when there are no fields stored', async () => {
    mockFileStoreGateway.getJsonFile.mockResolvedValueOnce(null);

    const useCase = new GetFormFieldsUseCase(mockFileStoreGateway as any);
    const result = await useCase.execute({ companyId: 'company-123', formId: 'form-456' });

    expect(result).toBeNull();
  });
});
