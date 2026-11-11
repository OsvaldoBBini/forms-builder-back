import { type FormInterface, type FormUpdateInterface, type FormDomainInterface } from './form.js';

export interface FormRepositoryInterface {
  getForms(companyId: string): Promise<FormDomainInterface[] | undefined>;
  updateForm(formData: FormUpdateInterface): Promise<void>;
  storeForm(formData: FormInterface): Promise<void>;
}