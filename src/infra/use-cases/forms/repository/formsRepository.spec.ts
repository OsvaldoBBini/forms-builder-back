import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FormsRepository } from './formsRepository';
import { FormInterface } from '../../../domain/entities/form/form';

describe('FormsRepository', () => {
  const companyId = 'company-123';
  const mockDbGateway = {
    query: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    update: vi.fn(),
  };

  let repository: FormsRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.FIELDS_BUCKET = 'test-bucket';
    repository = new FormsRepository(mockDbGateway as any);
  });

  it('should return mapped forms for a company', async () => {
    const mockItems = [{
      PK: `COMPANY#${companyId}#FORMS`,
      SK: 'FORM#form-123',
      companyId,
      formId: 'form-123',
      formName: 'Lead Form',
      createdAt: '2024-01-01T00:00:00.000Z',
      fieldsAddress: `test-bucket/${companyId}/fields/form-123`,
    }];

    mockDbGateway.query.mockResolvedValueOnce(mockItems);

    const result = await repository.getForms(companyId);

    expect(result).toEqual([
      expect.objectContaining({
        companyId,
        formId: 'form-123',
        formName: 'Lead Form',
      }),
    ]);
    expect(mockDbGateway.query).toHaveBeenCalledWith({ partitionKey: `COMPANY#${companyId}#FORMS` });
  });

  it('should return undefined when no forms are found', async () => {
    mockDbGateway.query.mockResolvedValueOnce([]);

    const result = await repository.getForms(companyId);

    expect(result).toBeUndefined();
  });

  it('should store form and return generated formId', async () => {
    const formData: FormInterface = {
      companyId,
      formName: 'Lead Form',
    };

    mockDbGateway.put.mockResolvedValueOnce(undefined);

    const formId = await repository.storeForm(formData);

    expect(formId).toBeTruthy();
    expect(mockDbGateway.put).toHaveBeenCalledWith(
      expect.objectContaining({
        PK: `COMPANY#${companyId}#FORMS`,
        SK: expect.stringMatching(/^FORM#.+$/),
        companyId,
        formName: 'Lead Form',
        formId: expect.any(String),
        createdAt: expect.any(String),
        fieldsAddress: `${process.env.FIELDS_BUCKET}/${companyId}/fields/${formId}`,
      })
    );
  });

  it('should update form with the expected keys and values', async () => {
    const formData = {
      companyId,
      formId: 'form-123',
      formName: 'Updated Form',
    };

    mockDbGateway.update.mockResolvedValueOnce(undefined);

    await expect(repository.updateForm(formData)).resolves.toBeUndefined();
    expect(mockDbGateway.update).toHaveBeenCalledWith(
      { pk: `COMPANY#${companyId}#FORMS`, sk: `FORM#${formData.formId}` },
      { ...formData }
    );
  });

  it('should wrap query errors in DatabaseError', async () => {
    mockDbGateway.query.mockRejectedValueOnce(new Error('Query error'));

    await expect(repository.getForms(companyId)).rejects.toThrow('Query error');
  });

  it('should wrap storage errors in DatabaseError', async () => {
    mockDbGateway.put.mockRejectedValueOnce(new Error('Storage error'));

    await expect(repository.storeForm({ companyId, formName: 'Lead Form' })).rejects.toThrow('Storage error');
  });

  it('should wrap update errors in DatabaseError', async () => {
    mockDbGateway.update.mockRejectedValueOnce(new Error('Update error'));

    await expect(repository.updateForm({ companyId, formId: 'form-123', formName: 'Updated Form' })).rejects.toThrow('Update error');
  });
});
