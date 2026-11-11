import type { FileStoreGatewayInterface } from '../../../../adapters/fileStore/index.js';
import type { IField } from '../../../../domain/entities/form/form.js';
import type { FormRepositoryInterface } from '../../../../domain/entities/form/formRepository.js';
import crypto from 'crypto';

export class CreateFormUseCase {
  private readonly formsRepository: FormRepositoryInterface;
  private readonly fileStoreGateway: FileStoreGatewayInterface;

  constructor(formsRepository: FormRepositoryInterface, fileStoreGateway: FileStoreGatewayInterface) {
    this.formsRepository = formsRepository;
    this.fileStoreGateway = fileStoreGateway;
  }

  async execute({ companyId, formName, fields }: { 
    companyId: string; 
    formName: string; 
    fields: IField[] }): Promise<string> {

    const formId = crypto.randomUUID();
    const fieldAddress = `${this.fileStoreGateway.bucketName}/${companyId}/fields/${formId}/fields.json`;
    
    try {
      await this.fileStoreGateway.storeJsonFile(fieldAddress, JSON.stringify(fields));
    } catch (e) {
      throw new Error(`Failed to store fields: ${e}`);
    }

    try {
      await this.formsRepository.storeForm({ 
        formId, 
        companyId, 
        formName, 
        fieldsAddress: fieldAddress });
    } catch (e) {
      await this.fileStoreGateway.deleteFile(fieldAddress);
      throw new Error(`Failed to store form: ${e}`);
    }

    return formId;
  }
}
