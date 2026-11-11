import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetFormsUseCase } from './index.js';

describe('GetFormsUseCase', () => {
  const mockFormsRepository = {
    getForms: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return forms for a company', async () => {
    const forms = [{
      companyId: 'company-123',
      formId: 'form-123',
      formName: 'Lead Form',
      createdAt: '2024-01-01T00:00:00.000Z',
    }];

    mockFormsRepository.getForms.mockResolvedValueOnce(forms);

    const useCase = new GetFormsUseCase(mockFormsRepository as any);
    const result = await useCase.execute({ companyId: 'company-123' });

    expect(mockFormsRepository.getForms).toHaveBeenCalledWith('company-123');
    expect(result).toEqual(forms);
  });
});
