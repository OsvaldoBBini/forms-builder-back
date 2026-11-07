import { IDatabaseGateway } from '../../../adapters/database';
import { FormRepositoryInterface } from '../../../domain/entities/form/formRepository';
import { DatabaseError } from '../../../../errors/errorManager';
import { FormDomainInterface, FormInterface, FormPersistenceInterface, FormUpdateInterface } from '../../../domain/entities/form/form';
import { formatDate } from '../../../utils/formatDate';

export class FormsRepository implements FormRepositoryInterface {
  private dbGateway: IDatabaseGateway;

  constructor(dbGateway: IDatabaseGateway) {
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

  async storeForm(formData: FormInterface): Promise<void> {
    try {
      const item: FormPersistenceInterface = {
        PK: `COMPANY#${formData.companyId}#FORMS`,
        SK: `FORM#${formData.formId}`,
        ...formData,
        createdAt: formatDate(new Date()),
        fieldsAddress: formData.fieldsAddress,
      };

      await this.dbGateway.put(item);
      return; 
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