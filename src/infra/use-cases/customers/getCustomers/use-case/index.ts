import { CustomerDomainInterface } from '../../../../domain/entities/customer/customer';
import { CustomerRepositoryInterface } from '../../../../domain/entities/customer/customerRepository';

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
