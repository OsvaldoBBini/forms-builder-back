import { DatabaseError } from '../../../../errors/errorManager.js';
import type { CompanyRepositoryInterface } from '../../../domain/entities/company/companyRepository.js';
import type { CompanyDomainInterface, CompanyInterfaceCreate, CompanyPersistenceInterface, CompanyUpdateCommand } from '../../../domain/entities/company/company.js';
import crypto from 'crypto';
import { type IDatabaseGateway } from '../../../adapters/database/index.js';

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

  async putCompany(companyData: CompanyInterfaceCreate): Promise<CompanyDomainInterface> {
    try {
      const { defaultCompanyId, ...company } = companyData;
      const oldDefaultCompany = company.isDefault && defaultCompanyId ? [{
        keys: { pk: `USER#${company.userId}`, sk: `COMPANY#${defaultCompanyId}` },
        updateValues: { isDefault: false }
      }] : undefined;

      const companyId = crypto.randomUUID();
      const item: CompanyPersistenceInterface = {
        PK: `USER#${company.userId}`,
        SK: `COMPANY#${companyId}`,
        ...company,
        companyId
      };
      await this.dbGateway.transact(oldDefaultCompany, [{ Item: item }]);

      return {...company, companyId};
    }
    catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async updateCompany(updateData: CompanyUpdateCommand): Promise<void> {
    try {
      const { companyId, userId, companyName, cnpj, isDefault, defaultCompanyId } = updateData;

      const defaultCompany = (isDefault && defaultCompanyId && defaultCompanyId !== companyId)
        ? {
          keys: { pk: `USER#${userId}`, sk: `COMPANY#${defaultCompanyId}` },
          updateValues: { isDefault: false }
        } : null;
        
      const itemsToUpdate = [
        ...(defaultCompany ? [defaultCompany] : []),
        {
          keys: { pk: `USER#${userId}`, sk: `COMPANY#${companyId}` },
          updateValues: { companyName, cnpj, isDefault }
        }
      ];
      await this.dbGateway.transact(itemsToUpdate);
      return;
    }
    catch (e) {
      throw new DatabaseError(String(e));
    }
  }

}