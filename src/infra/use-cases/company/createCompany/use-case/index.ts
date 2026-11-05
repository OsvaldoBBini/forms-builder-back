import { CompanyDomainInterface, CompanyInterface } from '../../../../domain/entities/company/company';
import { CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository';

export class CreateCompanyUseCase {

  private companyRepository: CompanyRepositoryInterface;

  constructor(companyRepository: CompanyRepositoryInterface) {
    this.companyRepository = companyRepository;
  }

  async execute(companyData: CompanyInterface): Promise<CompanyDomainInterface> {
    if (companyData.isDefault === true) {
      const companies = await this.companyRepository.getCompaniesByUserId(companyData.userId);
      if (companies) {
        const isDefaultCompany = companies.find((company: CompanyDomainInterface) => company.isDefault === true);
        if (isDefaultCompany) await this.companyRepository.putCompany({...isDefaultCompany, isDefault: false});
      }
    }
    const company = await this.companyRepository.putCompany(companyData);
    return company;
  }
}

