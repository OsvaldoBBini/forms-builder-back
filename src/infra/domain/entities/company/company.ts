export interface CompanyInterface {
  cnpj: string; 
  userId: string;
  companyName: string;
  role: 'owner' | 'admin' | 'user';
  isDefault: boolean
}

export interface CompanyInterfaceCreate extends CompanyInterface {
  defaultCompanyId: string | undefined;
}

export interface CompanyDomainInterface extends CompanyInterface {
  companyId: string;
}

export interface CompanyPersistenceInterface extends CompanyDomainInterface {
  PK: string;
  SK: string;
}

export interface CompanyUpdateInput {
  companyId: string;
  userId: string;
  companyName: string;
  cnpj: string;
  isDefault: boolean;
}

export interface CompanyUpdateCommand extends CompanyUpdateInput {
  defaultCompanyId?: string;
}