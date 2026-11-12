import { type CompanyDomainInterface, type CompanyInterfaceCreate, type CompanyUpdateCommand } from './company.js';

export interface CompanyRepositoryInterface {
  putCompany(companyData: CompanyInterfaceCreate): Promise<CompanyDomainInterface>;
  getCompaniesByUserId(userId: string): Promise<CompanyDomainInterface[] | null>;
  updateCompany(updateData: CompanyUpdateCommand): Promise<void>;
}