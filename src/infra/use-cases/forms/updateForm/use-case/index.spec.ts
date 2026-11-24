import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateFormUseCase } from './index.js';

describe('UpdateFormUseCase', () => {
  const mockFormsRepository = {
    getForms: vi.fn(),
    storeForm: vi.fn(),
    updateForm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFormsRepository.updateForm.mockResolvedValue(undefined);
  });

  it('should update the form name using its company and form IDs', async () => {
    const formData = {
      companyId: 'company-123',
      formId: 'form-456',
      formName: 'Updated Form',
    };
    const useCase = new UpdateFormUseCase(mockFormsRepository);

    await expect(useCase.execute(formData)).resolves.toBeUndefined();

    expect(mockFormsRepository.updateForm).toHaveBeenCalledWith(formData);
  });

  it('should propagate repository errors', async () => {
    mockFormsRepository.updateForm.mockRejectedValueOnce(new Error('Update failed'));
    const useCase = new UpdateFormUseCase(mockFormsRepository);

    await expect(useCase.execute({
      companyId: 'company-123',
      formId: 'form-456',
      formName: 'Updated Form',
    })).rejects.toThrow('Update failed');
  });
});
