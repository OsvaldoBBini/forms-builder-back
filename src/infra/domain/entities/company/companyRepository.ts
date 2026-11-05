import { CompanyDomainInterface, CompanyInterface } from './company';

export interface CompanyRepositoryInterface {
  putCompany(companyData: CompanyInterface): Promise<CompanyDomainInterface>;
  getCompaniesByUserId(userId: string): Promise<CompanyDomainInterface[] | null>;
}