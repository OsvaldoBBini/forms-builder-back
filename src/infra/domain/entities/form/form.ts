export interface FormInterface {
  companyId: string;
  formName: string;
}

export interface FormUpdateInterface extends FormInterface{
  formId: string;
}

export interface FormDomainInterface extends FormInterface {
  formId: string;
  createdAt: string;
}

export interface FormPersistenceInterface extends FormInterface{
  PK: string;
  SK: string;
  formId: string;
  createdAt: string;
  fieldsAddress: string;
}