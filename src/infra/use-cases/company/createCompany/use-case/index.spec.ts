import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCompanyUseCase } from './index.js';
import { type CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository.js';
import { type CompanyDomainInterface } from '../../../../domain/entities/company/company.js';

describe('CreateCompanyUseCase', () => {
  const mockRepository: CompanyRepositoryInterface = {
    putCompany: vi.fn(),
    getCompaniesByUserId: vi.fn(),
    updateCompany: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a company and keep it as default if it is the first one', async () => {
    const useCase = new CreateCompanyUseCase(mockRepository);
    const companyData = {
      userId: 'user-1',
      companyName: 'Acme',
      cnpj: '11111111000191',
      isDefault: true,
      role: 'owner',
    };

    const createdCompany: CompanyDomainInterface = {
      ...companyData,
      companyId: 'company-1',
    };

    mockRepository.getCompaniesByUserId.mockResolvedValueOnce([]);
    mockRepository.putCompany.mockResolvedValueOnce(createdCompany);

    const result = await useCase.execute(companyData);

    expect(result).toEqual(createdCompany);
    expect(mockRepository.getCompaniesByUserId).toHaveBeenCalledWith('user-1');
    expect(mockRepository.putCompany).toHaveBeenCalledTimes(1);
    expect(mockRepository.putCompany).toHaveBeenCalledWith({
      ...companyData,
      defaultCompanyId: undefined,
    });
  });

  it('should unset the old default company before creating a new default company', async () => {
    const useCase = new CreateCompanyUseCase(mockRepository);
    const existingCompany: CompanyDomainInterface = {
      companyId: 'company-old',
      userId: 'user-1',
      companyName: 'Old Company',
      cnpj: '11111111000191',
      role: 'owner',
      isDefault: true,
    };

    const newCompanyData = {
      userId: 'user-1',
      companyName: 'New Company',
      cnpj: '22222222000192',
      isDefault: true,
      role: 'owner',
    };

    const createdCompany: CompanyDomainInterface = {
      ...newCompanyData,
      companyId: 'company-new',
    };

    mockRepository.getCompaniesByUserId.mockResolvedValueOnce([existingCompany]);
    mockRepository.putCompany.mockResolvedValueOnce(createdCompany);

    const result = await useCase.execute(newCompanyData);

    expect(result).toEqual(createdCompany);
    expect(mockRepository.getCompaniesByUserId).toHaveBeenCalledWith('user-1');
    expect(mockRepository.putCompany).toHaveBeenCalledTimes(1);
    expect(mockRepository.putCompany).toHaveBeenCalledWith({
      ...newCompanyData,
      defaultCompanyId: 'company-old',
    });
  });

  it('should not look up existing companies when the new company is not default', async () => {
    const useCase = new CreateCompanyUseCase(mockRepository);
    const companyData = {
      userId: 'user-1',
      companyName: 'Acme',
      cnpj: '11111111000191',
      isDefault: false,
      role: 'owner' as const,
    };
    const createdCompany: CompanyDomainInterface = {
      ...companyData,
      companyId: 'company-1',
    };
    mockRepository.putCompany.mockResolvedValueOnce(createdCompany);

    await expect(useCase.execute(companyData)).resolves.toEqual(createdCompany);

    expect(mockRepository.getCompaniesByUserId).not.toHaveBeenCalled();
    expect(mockRepository.putCompany).toHaveBeenCalledWith({
      ...companyData,
      defaultCompanyId: undefined,
    });
  });
});
