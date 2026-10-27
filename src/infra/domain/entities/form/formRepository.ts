import { FormInterface, FormUpdateInterface, FormDomainInterface } from './form';

export interface FormRepositoryInterface {
  getForms(companyId: string): Promise<FormDomainInterface[] | undefined>;
  updateForm(formData: FormUpdateInterface): Promise<void>;
  storeForm(formData: FormInterface): Promise<string>;
}