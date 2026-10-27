import { DatabaseGatewayInterface, dynamoGateway } from '../../../adapters/database/dynamo';
import { FormRepositoryInterface } from '../../../domain/entities/form/formRepository';
import { DatabaseError } from '../../../../errors/errorManager';
import { FormDomainInterface, FormInterface, FormPersistenceInterface, FormUpdateInterface } from '../../../domain/entities/form/form';
import { formatDate } from '../../../utils/formatDate';

export class FormsRepository implements FormRepositoryInterface {

  private dbGateway: DatabaseGatewayInterface;

  constructor(dbGateway: DatabaseGatewayInterface) {
    this.dbGateway = dbGateway;
  }

  private mapFormData(persistenceData: FormPersistenceInterface): FormDomainInterface {
    return {
      companyId: persistenceData.companyId,
      formId: persistenceData.formId,
      formName: persistenceData.formName,
      createdAt: persistenceData.createdAt,
    };
  }

  private async queryFormsByCompanyId(companyId: string): Promise<FormPersistenceInterface[] | undefined> {
    const { dbClient, queryCommand } = this.dbGateway;

    const command = queryCommand({
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': `COMPANY#${companyId}#FORMS` }
    });
  
    const { Items: dbResponse } = await dbClient.send(command);
    const response = dbResponse as FormPersistenceInterface[] | undefined;
    return response;
  } 

  private async putForm(formData: FormInterface): Promise<string> {
    const { dbClient, putCommand } = this.dbGateway;
    const formId = crypto.randomUUID(); 
    const command = putCommand({
      PK: `COMPANY#${formData.companyId}#FORMS`,
      SK: `FORM#${formId}`,
      ...formData,
      formId: formId,
      createdAt: formatDate(new Date()),
      fieldsAddress: `${process.env.BUCKET_NAME}/${formData.companyId}/fields/${formId}`
    });
    await dbClient.send(command);

    return formId;
  }

  private async changeForm(customerData: FormUpdateInterface): Promise<void> {
    const { dbClient, updateCommand } = this.dbGateway;
    const command = updateCommand({
      PK: `COMPANY#${customerData.companyId}#FORMS`,
      SK: `FORM#${customerData.formId}`
    }, customerData);

    await dbClient.send(command);
  }
  
  async getForms(companyId: string): Promise<FormDomainInterface[] | undefined> {
    try {
      const response = await this.queryFormsByCompanyId(companyId);  
      const formsData: FormDomainInterface[] | undefined = response ? response.map((item) => this.mapFormData(item)) : undefined;

      return formsData;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
  
  async storeForm(formData: FormInterface): Promise<string> {
    try {
      const formId = await this.putForm(formData);
      return formId;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async updateForm(formData: FormUpdateInterface): Promise<void> {
    try {
      await this.changeForm(formData);
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}

export const formsRepository = new FormsRepository(dynamoGateway);