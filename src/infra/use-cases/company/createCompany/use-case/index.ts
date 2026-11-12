import { type CompanyDomainInterface, type CompanyInterface } from '../../../../domain/entities/company/company.js';
import { type CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository.js';

export class CreateCompanyUseCase {

  private companyRepository: CompanyRepositoryInterface;

  constructor(companyRepository: CompanyRepositoryInterface) {
    this.companyRepository = companyRepository;
  }

  async execute(companyData: CompanyInterface): Promise<CompanyDomainInterface> {
    const companies = companyData.isDefault === true ? await this.companyRepository.getCompaniesByUserId(companyData.userId) : undefined;
    const defaultCompany = companies ? companies.find((company: CompanyDomainInterface) => company.isDefault === true) : undefined;
    const company = await this.companyRepository.putCompany({...companyData, defaultCompanyId: defaultCompany?.companyId});
    return company;
  }
}

