import { type CustomerDomainInterface } from '../../../domain/entities/customer/customer.js';
import { type CustomerInterface } from './customer.js';

export interface CustomerRepositoryInterface {
  getCustomers(companyId: string): Promise<CustomerDomainInterface[] | undefined>;
  updateCustomer(customerData: CustomerDomainInterface): Promise<void>;
  storeCustomer(customerData: CustomerInterface): Promise<string>;
}