import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyRepository } from './companyRepository.js';
import type { CompanyInterface, IUpdateDefaultCompany } from '../../../domain/entities/company/company.js';

describe('CompanyRepository', () => {
  const mockUserId = 'user123';
  const mockDbGateway = {
    query: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    update: vi.fn(),
    transactUpdate: vi.fn(),
  };

  let repository: CompanyRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new CompanyRepository(mockDbGateway as any);
  });

  it('should store a company and return it with a generated companyId', async () => {
    const companyData: CompanyInterface = {
      cnpj: '11111111000191',
      userId: mockUserId,
      companyName: 'Test Company',
      role: 'owner',
      isDefault: true,
    };

    mockDbGateway.put.mockResolvedValueOnce(undefined);

    const createdCompany = await repository.putCompany(companyData);

    expect(createdCompany.companyId).toBeTruthy();
    expect(createdCompany.userId).toBe(mockUserId);
    expect(createdCompany.companyName).toBe('Test Company');
    expect(mockDbGateway.put).toHaveBeenCalledWith(
      expect.objectContaining({
        PK: `USER#${mockUserId}`,
        SK: expect.stringMatching(/^COMPANY#.+$/),
        companyId: createdCompany.companyId,
        cnpj: '11111111000191',
        role: 'owner',
        isDefault: true,
      })
    );
  });

  it('should return companies by user id', async () => {
    const mockItems = [{
      PK: `USER#${mockUserId}`,
      SK: 'COMPANY#c1',
      companyId: 'c1',
      userId: mockUserId,
      companyName: 'Test Company',
      role: 'owner',
      cnpj: '11111111000191',
      isDefault: true,
    }];

    mockDbGateway.query.mockResolvedValueOnce(mockItems);

    const result = await repository.getCompaniesByUserId(mockUserId);

    expect(result).toHaveLength(1);
    expect(result?.[0].companyName).toBe('Test Company');
    expect(mockDbGateway.query).toHaveBeenCalledWith({ partitionKey: `USER#${mockUserId}` });
  });

  it('should return null when query result is empty', async () => {
    mockDbGateway.query.mockResolvedValueOnce([]);

    const result = await repository.getCompaniesByUserId(mockUserId);

    expect(result).toStrictEqual([]);
  });

  it('should wrap database errors when persisting company', async () => {
    const companyData: CompanyInterface = {
      cnpj: '11111111000191',
      userId: mockUserId,
      companyName: 'Test Company',
      role: 'owner',
      isDefault: true,
    };

    mockDbGateway.put.mockRejectedValueOnce(new Error('Database error'));

    await expect(repository.putCompany(companyData)).rejects.toThrow('Database error');
  });

  it('should wrap database errors when querying companies', async () => {
    mockDbGateway.query.mockRejectedValueOnce(new Error('Query error'));

    await expect(repository.getCompaniesByUserId(mockUserId)).rejects.toThrow('Query error');
  });

  it('should update the old and new default company in one transaction', async () => {
    const updateData: IUpdateDefaultCompany = {
      userId: mockUserId,
      defaultCompanyId: 'company-old',
      newDefaultCompanyId: 'company-new',
    };
    mockDbGateway.transactUpdate.mockResolvedValueOnce(undefined);

    await repository.updateDefaultCompany(updateData);

    expect(mockDbGateway.transactUpdate).toHaveBeenCalledWith([
      {
        keys: { pk: `USER#${mockUserId}`, sk: 'COMPANY#company-old' },
        updateValues: { isDefault: false },
      },
      {
        keys: { pk: `USER#${mockUserId}`, sk: 'COMPANY#company-new' },
        updateValues: { isDefault: true },
      },
    ]);
  });

  it('should wrap database errors when updating the default company', async () => {
    mockDbGateway.transactUpdate.mockRejectedValueOnce(new Error('Transaction failed'));

    await expect(repository.updateDefaultCompany({
      userId: mockUserId,
      defaultCompanyId: 'company-old',
      newDefaultCompanyId: 'company-new',
    })).rejects.toThrow('Transaction failed');
  });
});