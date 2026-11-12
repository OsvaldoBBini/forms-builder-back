import { type CompanyDomainInterface, type IUpdateDefaultCompanyInput } from '../../../../domain/entities/company/company.js';
import { type CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository.js';

export class UpdateDefaultCompanyUseCase {

  private companyRepository: CompanyRepositoryInterface;

  constructor(companyRepository: CompanyRepositoryInterface) {
    this.companyRepository = companyRepository;
  }

  async execute({ userId, companyId }: IUpdateDefaultCompanyInput ): Promise<string> {
    const companies = await this.companyRepository.getCompaniesByUserId(userId);
    const defaultCompany = companies && companies.find((company: CompanyDomainInterface) => company.isDefault === true);
    if (!defaultCompany) {
      throw new Error('Default company not found');
    }
    await this.companyRepository.updateDefaultCompany({ userId, defaultCompanyId: defaultCompany?.companyId, newDefaultCompanyId: companyId });
    return companyId;
  }
}

