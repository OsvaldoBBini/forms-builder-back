import { CustomerDomainInterface, CustomerInterface } from '../../../../domain/entities/customer/customer';
import { CustomerRepositoryInterface } from '../../../../domain/entities/customer/customerRepository';

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
