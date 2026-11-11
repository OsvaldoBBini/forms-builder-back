import type { IField } from '../../../../domain/entities/form/form.js';
import type { FileStoreGatewayInterface } from '../../../../adapters/fileStore/index.js';

export class GetFormFieldsUseCase {
  private readonly fileStoreGateway: FileStoreGatewayInterface;

  constructor(fileStoreGateway: FileStoreGatewayInterface) {
    this.fileStoreGateway = fileStoreGateway;
  }

  async execute({ companyId, formId }: { companyId: string; formId: string }): Promise<IField[] | null> {
    const fieldAddress = `${this.fileStoreGateway.bucketName}/${companyId}/fields/${formId}/fields.json`;
    const response = await this.fileStoreGateway.getJsonFile<IField[]>(fieldAddress);
    return response;
  }
}
