import type { CustomerDomainInterface } from '../../../../domain/entities/customer/customer.js';
import type { CustomerRepositoryInterface } from '../../../../domain/entities/customer/customerRepository.js';

export class UpdateCustomerUseCase {
  private customerRepository: CustomerRepositoryInterface;

  constructor(customerRepository: CustomerRepositoryInterface) {
    this.customerRepository = customerRepository;
  }

  async execute(customerData: CustomerDomainInterface): Promise<CustomerDomainInterface> {
    await this.customerRepository.updateCustomer(customerData);
    return customerData;
  }
}
