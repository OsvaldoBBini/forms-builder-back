import { IField } from '../../../../domain/entities/form/form';
import { FileStoreGatewayInterface } from '../../../../adapters/fileStore';

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
