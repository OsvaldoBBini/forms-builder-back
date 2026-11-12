import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UpdateCompanyUseCase } from './updateCompanyUseCase.js';
import type { CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository.js';
import type { CompanyDomainInterface, CompanyUpdateInput } from '../../../../domain/entities/company/company.js';

describe('UpdateCompanyUseCase', () => {
  const mockRepository: CompanyRepositoryInterface = {
    putCompany: vi.fn(),
    getCompaniesByUserId: vi.fn(),
    updateCompany: vi.fn(),
  };

  const updateData: CompanyUpdateInput = {
    userId: 'user-1',
    companyId: 'company-2',
    companyName: 'Updated company',
    cnpj: '22222222000192',
    isDefault: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates company fields and moves the default flag when requested', async () => {
    const companies: CompanyDomainInterface[] = [
      {
        companyId: 'company-1',
        userId: 'user-1',
        companyName: 'Current default',
        cnpj: '11111111000191',
        role: 'owner',
        isDefault: true,
      },
      {
        companyId: 'company-2',
        userId: 'user-1',
        companyName: 'Old name',
        cnpj: '33333333000193',
        role: 'admin',
        isDefault: false,
      },
    ];
    mockRepository.getCompaniesByUserId.mockResolvedValueOnce(companies);
    mockRepository.updateCompany.mockResolvedValueOnce(undefined);

    const result = await new UpdateCompanyUseCase(mockRepository).execute(updateData);

    expect(result).toBe(updateData.companyId);
    expect(mockRepository.updateCompany).toHaveBeenCalledWith({
      ...updateData,
      defaultCompanyId: 'company-1',
    });
  });

  it('updates company fields without changing another company default when isDefault is false', async () => {
    const company = { ...updateData, isDefault: false };
    mockRepository.getCompaniesByUserId.mockResolvedValueOnce([
      {
        companyId: 'company-1',
        userId: 'user-1',
        companyName: 'Current default',
        cnpj: '11111111000191',
        role: 'owner',
        isDefault: true,
      },
      {
        companyId: 'company-2',
        userId: 'user-1',
        companyName: 'Old name',
        cnpj: '33333333000193',
        role: 'admin',
        isDefault: false,
      },
    ]);

    await new UpdateCompanyUseCase(mockRepository).execute(company);

    expect(mockRepository.updateCompany).toHaveBeenCalledWith({
      ...company,
    });
  });

  it('rejects updates for a company not owned by the user', async () => {
    mockRepository.getCompaniesByUserId.mockResolvedValueOnce([]);

    await expect(new UpdateCompanyUseCase(mockRepository).execute(updateData))
      .rejects.toThrow('Company not found');
    expect(mockRepository.updateCompany).not.toHaveBeenCalled();
  });

  it('propagates repository errors', async () => {
    mockRepository.getCompaniesByUserId.mockRejectedValueOnce(new Error('Query failed'));

    await expect(new UpdateCompanyUseCase(mockRepository).execute(updateData))
      .rejects.toThrow('Query failed');
    expect(mockRepository.updateCompany).not.toHaveBeenCalled();
  });
});
