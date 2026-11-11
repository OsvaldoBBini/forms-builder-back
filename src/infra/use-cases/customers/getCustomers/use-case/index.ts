import type { CustomerDomainInterface } from '../../../../domain/entities/customer/customer.js';
import type { CustomerRepositoryInterface } from '../../../../domain/entities/customer/customerRepository.js';

export class GetCustomersUseCase {
  private customerRepository: CustomerRepositoryInterface;

  constructor(customerRepository: CustomerRepositoryInterface) {
    this.customerRepository = customerRepository;
  }

  async execute({ companyId }: { companyId: string }): Promise<CustomerDomainInterface[] | null> {
    const response = await this.customerRepository.getCustomers(companyId);
    return response ?? null;
  }
}
