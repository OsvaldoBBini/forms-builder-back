import type { FormUpdateInterface } from '../../../../domain/entities/form/form.js';
import type { FormRepositoryInterface } from '../../../../domain/entities/form/formRepository.js';

export class UpdateFormUseCase {
  private readonly formsRepository: FormRepositoryInterface;

  constructor(formsRepository: FormRepositoryInterface) {
    this.formsRepository = formsRepository;
  }

  async execute(formData: FormUpdateInterface): Promise<void> {
    await this.formsRepository.updateForm(formData);
  }
}
