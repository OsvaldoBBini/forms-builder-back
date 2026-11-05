import { FormRepositoryInterface } from '../../../../domain/entities/form/formRepository';

export class CreateFormUseCase {
  private formsRepository: FormRepositoryInterface;

  constructor(formsRepository: FormRepositoryInterface) {
    this.formsRepository = formsRepository;
  }

  async execute({ companyId, formName }: { companyId: string; formName: string }): Promise<{ companyId: string; formId: string; formName: string }> {
    const formId = await this.formsRepository.storeForm({ companyId, formName });
    return { companyId, formId, formName };
  }
}
