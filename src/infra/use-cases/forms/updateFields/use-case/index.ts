import type { FileStoreGatewayInterface } from '../../../../adapters/fileStore/index.js';
import type { IField } from '../../../../domain/entities/form/form.js';

export class UpdateFieldsUseCase {
  private readonly fileStoreGateway: FileStoreGatewayInterface;

  constructor(fileStoreGateway: FileStoreGatewayInterface) {
    this.fileStoreGateway = fileStoreGateway;
  }

  async execute({ companyId, formId, fields }: { 
    companyId: string; 
    formId: string; 
    fields: IField[] }): Promise<undefined> {

    try {
      const fieldAddress = `${this.fileStoreGateway.bucketName}/${companyId}/fields/${formId}/fields.json`;
      await this.fileStoreGateway.storeJsonFile(fieldAddress, JSON.stringify(fields));
    } catch (e) {
      throw new Error(`Failed to update fields: ${e}`);
    }

    return;
  }
}
