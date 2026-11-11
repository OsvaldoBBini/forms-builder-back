import type { FormDomainInterface } from '../../../../domain/entities/form/form.js';
import type { FormRepositoryInterface } from '../../../../domain/entities/form/formRepository.js';

export class GetFormsUseCase {
  private formsRepository: FormRepositoryInterface;

  constructor(formsRepository: FormRepositoryInterface) {
    this.formsRepository = formsRepository;
  }

  async execute({ companyId }: { companyId: string }): Promise<FormDomainInterface[] | null> {
    const response = await this.formsRepository.getForms(companyId);
    return response ?? null;
  }
}
