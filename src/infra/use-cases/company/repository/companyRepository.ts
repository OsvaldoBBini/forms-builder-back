import { DatabaseError } from '../../../../errors/errorManager';
import { CompanyRepositoryInterface } from '../../../domain/entities/company/companyRepository';
import { CompanyDomainInterface, CompanyInterface, CompanyPersistenceInterface } from '../../../domain/entities/company/company';
import crypto from 'crypto';
import { IDatabaseGateway } from '../../../adapters/database';

export class CompanyRepository implements CompanyRepositoryInterface {

  private dbGateway: IDatabaseGateway;

  constructor(dbGateway: IDatabaseGateway) {
    this.dbGateway = dbGateway;
  }

  private mapCompanyData(persistenceData: CompanyPersistenceInterface): CompanyDomainInterface {
    return {
      cnpj: persistenceData.cnpj, 
      companyId: persistenceData.companyId,
      userId: persistenceData.userId,
      companyName: persistenceData.companyName,
      role: persistenceData.role,
      isDefault: persistenceData.isDefault
    };
  }

  async getCompaniesByUserId(userId: string): Promise<CompanyDomainInterface[] | null> {
    try {
      const response = await this.dbGateway.query<CompanyPersistenceInterface>({
        partitionKey: `USER#${userId}`
      });
      const dBresponse = response.map((item: CompanyPersistenceInterface) => this.mapCompanyData(item));
      return dBresponse ?? null;
    }
    catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async putCompany(companyData: CompanyInterface): Promise<CompanyDomainInterface> {
    try {
      const companyId = crypto.randomUUID();
      const item: CompanyPersistenceInterface = {
        PK: `USER#${companyData.userId}`,
        SK: `COMPANY#${companyId}`,
        ...companyData,
        companyId: companyId
      };
      await this.dbGateway.put(item);
      return {...companyData, companyId};
    }
    catch (e) {
      throw new DatabaseError(String(e));
    }
  }

}