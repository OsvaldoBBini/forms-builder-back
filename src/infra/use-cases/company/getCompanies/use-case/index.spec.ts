import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GetCompaniesUseCase } from './index.js';
import { type CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository.js';
import { type CompanyDomainInterface } from '../../../../domain/entities/company/company.js';

describe('GetCompaniesUseCase', () => {
  const mockRepository: CompanyRepositoryInterface = {
    putCompany: vi.fn(),
    getCompaniesByUserId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the companies for a given user', async () => {
    const useCase = new GetCompaniesUseCase(mockRepository);
    const companies: CompanyDomainInterface[] = [
      {
        companyId: 'company-1',
        userId: 'user-1',
        companyName: 'Acme',
        cnpj: '11111111000191',
        role: 'owner',
        isDefault: true,
      },
      {
        companyId: 'company-2',
        userId: 'user-1',
        companyName: 'Beta',
        cnpj: '22222222000192',
        role: 'admin',
        isDefault: false,
      },
    ];

    mockRepository.getCompaniesByUserId.mockResolvedValueOnce(companies);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toEqual(companies);
    expect(mockRepository.getCompaniesByUserId).toHaveBeenCalledWith('user-1');
  });

  it('should return null when there are no companies', async () => {
    const useCase = new GetCompaniesUseCase(mockRepository);

    mockRepository.getCompaniesByUserId.mockResolvedValueOnce(null);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(result).toBeNull();
    expect(mockRepository.getCompaniesByUserId).toHaveBeenCalledWith('user-1');
  });
});
