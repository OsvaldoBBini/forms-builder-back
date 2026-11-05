import crypto from 'crypto';
import { IDatabaseGateway } from '../../../adapters/database';
import { CustomerDomainInterface, CustomerInterface, CustomerPersistenceInterface } from '../../../domain/entities/customer/customer';
import { CustomerRepositoryInterface } from '../../../domain/entities/customer/customerRepository';
import { DatabaseError } from '../../../../errors/errorManager';

export class CustomerRepository implements CustomerRepositoryInterface {
  private dbGateway: IDatabaseGateway;

  constructor(dbGateway: IDatabaseGateway) {
    this.dbGateway = dbGateway;
  }

  private mapCustomerData(persistenceData: CustomerPersistenceInterface): CustomerDomainInterface {
    return {
      companyId: persistenceData.companyId,
      email: persistenceData.email === null ? '' : persistenceData.email,
      fullName: persistenceData.fullName,
      cpf: persistenceData.cpf,
      phoneNumber: persistenceData.phoneNumber,
      customerId: persistenceData.customerId,
    };
  }

  async getCustomers(companyId: string): Promise<CustomerDomainInterface[] | undefined> {
    try {
      const response = await this.dbGateway.query<CustomerPersistenceInterface>({
        partitionKey: `COMPANY#${companyId}#CUSTOMERS`,
      });

      return response.map((item) => this.mapCustomerData(item));
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async storeCustomer(customerData: CustomerInterface): Promise<string> {
    try {
      const customerId = crypto.randomUUID();
      const item: CustomerPersistenceInterface = {
        PK: `COMPANY#${customerData.companyId}#CUSTOMERS`,
        SK: `CUSTOMER#${customerId}`,
        ...customerData,
        customerId,
      };

      await this.dbGateway.put(item);
      return customerId;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async updateCustomer(customerData: CustomerDomainInterface): Promise<void> {
    try {
      await this.dbGateway.update<CustomerPersistenceInterface>(
        {
          pk: `COMPANY#${customerData.companyId}#CUSTOMERS`,
          sk: `CUSTOMER#${customerData.customerId}`,
        },
        { ...customerData }
      );
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}