import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateDefaultCompanyUseCase } from './index.js';
import type { CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository.js';
import type { CompanyDomainInterface } from '../../../../domain/entities/company/company.js';

describe('UpdateDefaultCompanyUseCase', () => {
  const mockRepository: CompanyRepositoryInterface = {
    putCompany: vi.fn(),
    getCompaniesByUserId: vi.fn(),
    updateDefaultCompany: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the existing default to the requested company', async () => {
    const useCase = new UpdateDefaultCompanyUseCase(mockRepository);
    const companies: CompanyDomainInterface[] = [
      {
        companyId: 'company-1',
        userId: 'user-1',
        companyName: 'Default company',
        cnpj: '11111111000191',
        role: 'owner',
        isDefault: true,
      },
      {
        companyId: 'company-2',
        userId: 'user-1',
        companyName: 'New default company',
        cnpj: '22222222000192',
        role: 'admin',
        isDefault: false,
      },
    ];
    mockRepository.getCompaniesByUserId.mockResolvedValueOnce(companies);
    mockRepository.updateDefaultCompany.mockResolvedValueOnce(undefined);

    const result = await useCase.execute({ userId: 'user-1', companyId: 'company-2' });

    expect(result).toBe('company-2');
    expect(mockRepository.getCompaniesByUserId).toHaveBeenCalledWith('user-1');
    expect(mockRepository.updateDefaultCompany).toHaveBeenCalledWith({
      userId: 'user-1',
      defaultCompanyId: 'company-1',
      newDefaultCompanyId: 'company-2',
    });
  });

  it.each([null, []])('throws and skips the update when company results are %s', async (companies) => {
    const useCase = new UpdateDefaultCompanyUseCase(mockRepository);
    mockRepository.getCompaniesByUserId.mockResolvedValueOnce(companies);

    await expect(useCase.execute({ userId: 'user-1', companyId: 'company-2' }))
      .rejects.toThrow('Default company not found');
    expect(mockRepository.updateDefaultCompany).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    const useCase = new UpdateDefaultCompanyUseCase(mockRepository);
    mockRepository.getCompaniesByUserId.mockRejectedValueOnce(new Error('Query failed'));

    await expect(useCase.execute({ userId: 'user-1', companyId: 'company-2' }))
      .rejects.toThrow('Query failed');
    expect(mockRepository.updateDefaultCompany).not.toHaveBeenCalled();
  });
});
