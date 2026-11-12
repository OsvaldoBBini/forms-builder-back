import type { CompanyDomainInterface, CompanyUpdateInput } from '../../../../domain/entities/company/company.js';
import type { CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository.js';

export class UpdateCompanyUseCase {
  private companyRepository: CompanyRepositoryInterface;

  constructor(companyRepository: CompanyRepositoryInterface) {
    this.companyRepository = companyRepository;
  }

  async execute(updateData: CompanyUpdateInput): Promise<string> {
    const companies = await this.companyRepository.getCompaniesByUserId(updateData.userId);
    const company = companies?.find((item) => item.companyId === updateData.companyId);

    if (!company) {
      throw new Error('Company not found');
    }

    const currentDefaultCompany = updateData.isDefault
      ? companies?.find((item: CompanyDomainInterface) => item.isDefault && item.companyId !== updateData.companyId)
      : undefined;

    const updateCommand = {
      ...updateData,
      ...(currentDefaultCompany ? { defaultCompanyId: currentDefaultCompany.companyId } : {}),
    };

    await this.companyRepository.updateCompany(updateCommand);

    return updateData.companyId;
  }
}
