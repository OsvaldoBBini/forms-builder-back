import crypto from 'crypto';
import { IDatabaseGateway } from '../../../adapters/database';
import { FormRepositoryInterface } from '../../../domain/entities/form/formRepository';
import { DatabaseError } from '../../../../errors/errorManager';
import { FormDomainInterface, FormInterface, FormPersistenceInterface, FormUpdateInterface } from '../../../domain/entities/form/form';
import { formatDate } from '../../../utils/formatDate';

export class FormsRepository implements FormRepositoryInterface {
  private dbGateway: IDatabaseGateway;
  private readonly bucketName: string;

  constructor(dbGateway: IDatabaseGateway) {
    this.dbGateway = dbGateway;
    this.bucketName = process.env.FIELDS_BUCKET || '';
  }

  private mapFormData(persistenceData: FormPersistenceInterface): FormDomainInterface {
    return {
      companyId: persistenceData.companyId,
      formId: persistenceData.formId,
      formName: persistenceData.formName,
      createdAt: persistenceData.createdAt,
    };
  }

  async getForms(companyId: string): Promise<FormDomainInterface[] | undefined> {
    try {
      const response = await this.dbGateway.query<FormPersistenceInterface>({
        partitionKey: `COMPANY#${companyId}#FORMS`,
      });

      return response.length > 0 ? response.map((item) => this.mapFormData(item)) : undefined;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async storeForm(formData: FormInterface): Promise<string> {
    try {
      const formId = crypto.randomUUID();
      const item: FormPersistenceInterface = {
        PK: `COMPANY#${formData.companyId}#FORMS`,
        SK: `FORM#${formId}`,
        ...formData,
        formId,
        createdAt: formatDate(new Date()),
        fieldsAddress: `${this.bucketName}/${formData.companyId}/fields/${formId}`,
      };

      await this.dbGateway.put(item);
      return formId;
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }

  async updateForm(formData: FormUpdateInterface): Promise<void> {
    try {
      await this.dbGateway.update<FormUpdateInterface>(
        {
          pk: `COMPANY#${formData.companyId}#FORMS`,
          sk: `FORM#${formData.formId}`,
        },
        { ...formData }
      );
    } catch (e) {
      throw new DatabaseError(String(e));
    }
  }
}