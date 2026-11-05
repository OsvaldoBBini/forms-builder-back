import { CompanyDomainInterface } from '../../../../domain/entities/company/company';
import { CompanyRepositoryInterface } from '../../../../domain/entities/company/companyRepository';

export class GetCompaniesUseCase {

  private companyRepository: CompanyRepositoryInterface;

  constructor(companyRepository: CompanyRepositoryInterface) {
    this.companyRepository = companyRepository;
  }

  async execute({ userId }: { userId: string }): Promise<CompanyDomainInterface[] | null> {
    const response = await this.companyRepository.getCompaniesByUserId(userId);
    if (!response) return null;
    return response;
  } 
}
