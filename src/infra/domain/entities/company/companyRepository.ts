import { type CompanyDomainInterface, type CompanyInterface } from './company.js';

export interface CompanyRepositoryInterface {
  putCompany(companyData: CompanyInterface): Promise<CompanyDomainInterface>;
  getCompaniesByUserId(userId: string): Promise<CompanyDomainInterface[] | null>;
}