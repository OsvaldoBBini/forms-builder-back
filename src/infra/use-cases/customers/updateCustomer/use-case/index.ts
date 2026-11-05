import { CustomerDomainInterface } from '../../../../domain/entities/customer/customer';
import { CustomerRepositoryInterface } from '../../../../domain/entities/customer/customerRepository';

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
