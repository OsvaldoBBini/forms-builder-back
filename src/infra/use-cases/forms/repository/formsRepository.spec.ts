import { describe, it, expect, beforeEach } from 'vitest';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoGateway } from '../../../adapters/database/dynamo';
import { FormsRepository } from './formsRepository';
import { FormInterface } from '../../../domain/entities/form/form';
import { DatabaseError } from '../../../../errors/errorManager';
import { formatDate } from '../../../utils/formatDate';

const dbMock = mockClient(DynamoDBDocumentClient);

describe('FormsRepository', () => {
  let repository: FormsRepository;
  const companyId = 'company-123';
  const mockDate = formatDate(new Date());

  beforeEach(() => {
    dbMock.reset();
    process.env.BUCKET_NAME = 'test-bucket';
    repository = new FormsRepository(dynamoGateway);
  });

  describe('getForms', () => {
    it('should return mapped forms for a company', async () => {
      const mockItems = [{
        PK: `COMPANY#${companyId}#FORMS`,
        SK: 'FORM#form-123',
        companyId,
        formId: 'form-123',
        formName: 'Lead Form',
        createdAt: mockDate,
        fieldsAddress: `test-bucket/${companyId}/fields/form-123`
      }];

      dbMock.on(QueryCommand).resolves({ Items: mockItems });

      const result = await repository.getForms(companyId);

      expect(result).toHaveLength(1);
      expect(result?.[0]).toEqual({
        companyId,
        formId: 'form-123',
        formName: 'Lead Form',
        createdAt: mockDate
      });
      expect(dbMock.commandCalls(QueryCommand).length).toBe(1);
    });

    it('should return undefined when no forms are found', async () => {
      dbMock.on(QueryCommand).resolves({ Items: undefined });

      const result = await repository.getForms(companyId);

      expect(result).toBeUndefined();
    });

    it('should wrap query errors in DatabaseError', async () => {
      dbMock.on(QueryCommand).rejects(new Error('Query error'));

      await expect(repository.getForms(companyId)).rejects.toThrow(DatabaseError);
      await expect(repository.getForms(companyId)).rejects.toThrow('Query error');
    });
  });

  describe('storeForm', () => {
    it('should store form and return generated formId', async () => {
      const formData: FormInterface = {
        companyId,
        formName: 'Lead Form'
      };

      dbMock.on(PutCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      const formId = await repository.storeForm(formData);
      const putCommand = dbMock.commandCalls(PutCommand)[0];

      expect(putCommand.args[0].input.Item).toEqual(
        expect.objectContaining({
          PK: `COMPANY#${companyId}#FORMS`,
          SK: `FORM#${formId}`,
          companyId,
          formName: 'Lead Form',
          formId,
          createdAt: expect.any(String),
          fieldsAddress: `${process.env.BUCKET_NAME}/${companyId}/fields/${formId}`
        })
      );
    });

    it('should wrap storage errors in DatabaseError', async () => {
      const formData: FormInterface = {
        companyId,
        formName: 'Lead Form'
      };

      dbMock.on(PutCommand).rejects(new Error('Storage error'));

      await expect(repository.storeForm(formData)).rejects.toThrow(DatabaseError);
      await expect(repository.storeForm(formData)).rejects.toThrow('Storage error');
    });
  });

  describe('updateForm', () => {
    it('should update form with the expected keys and values', async () => {
      const formData = {
        companyId,
        formId: 'form-123',
        formName: 'Updated Form'
      };

      dbMock.on(UpdateCommand).resolves({
        $metadata: { httpStatusCode: 200 }
      });

      await expect(repository.updateForm(formData)).resolves.not.toThrow();
      expect(dbMock.commandCalls(UpdateCommand).length).toBe(1);

      const updateCommand = dbMock.commandCalls(UpdateCommand)[0];
      expect(updateCommand.args[0].input.Key).toEqual({
        PK: `COMPANY#${companyId}#FORMS`,
        SK: `FORM#${formData.formId}`
      });
      expect(updateCommand.args[0].input.UpdateExpression).toBe(
        'SET #companyId = :companyId, #formId = :formId, #formName = :formName'
      );
      expect(updateCommand.args[0].input.ExpressionAttributeNames).toEqual({
        '#companyId': 'companyId',
        '#formId': 'formId',
        '#formName': 'formName'
      });
      expect(updateCommand.args[0].input.ExpressionAttributeValues).toEqual({
        ':companyId': companyId,
        ':formId': 'form-123',
        ':formName': 'Updated Form'
      });
    });

    it('should wrap update errors in DatabaseError', async () => {
      const formData = {
        companyId,
        formId: 'form-123',
        formName: 'Updated Form'
      };

      dbMock.on(UpdateCommand).rejects(new Error('Update error'));

      await expect(repository.updateForm(formData)).rejects.toThrow(DatabaseError);
      await expect(repository.updateForm(formData)).rejects.toThrow('Update error');
    });
  });
});
