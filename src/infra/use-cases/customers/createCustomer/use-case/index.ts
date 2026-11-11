import type { CustomerDomainInterface, CustomerInterface } from '../../../../domain/entities/customer/customer.js';
import type { CustomerRepositoryInterface } from '../../../../domain/entities/customer/customerRepository.js';

export class CreateCustomerUseCase {
  private customerRepository: CustomerRepositoryInterface;

  constructor(customerRepository: CustomerRepositoryInterface) {
    this.customerRepository = customerRepository;
  }

  async execute(customerData: CustomerInterface): Promise<CustomerDomainInterface> {
    const customerId = await this.customerRepository.storeCustomer(customerData);
    return { ...customerData, customerId };
  }
}
