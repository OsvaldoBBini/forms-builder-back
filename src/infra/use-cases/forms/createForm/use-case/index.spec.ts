import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateFormUseCase } from './index';

describe('CreateFormUseCase', () => {
  const mockFormsRepository = {
    storeForm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a form and return the payload', async () => {
    mockFormsRepository.storeForm.mockResolvedValueOnce('form-123');

    const useCase = new CreateFormUseCase(mockFormsRepository as any);
    const result = await useCase.execute({ companyId: 'company-123', formName: 'Lead Form' });

    expect(mockFormsRepository.storeForm).toHaveBeenCalledWith({ companyId: 'company-123', formName: 'Lead Form' });
    expect(result).toEqual({
      companyId: 'company-123',
      formId: 'form-123',
      formName: 'Lead Form',
    });
  });
});
