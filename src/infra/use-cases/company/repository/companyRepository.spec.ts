import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyRepository } from './companyRepository.js';
import type { CompanyInterfaceCreate, CompanyUpdateCommand } from '../../../domain/entities/company/company.js';

describe('CompanyRepository', () => {
  const mockUserId = 'user123';
  const mockDbGateway = {
    query: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    update: vi.fn(),
    transact: vi.fn(),
  };

  let repository: CompanyRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new CompanyRepository(mockDbGateway as any);
  });

  it('should store a company and return it with a generated companyId', async () => {
    const companyData: CompanyInterfaceCreate = {
      cnpj: '11111111000191',
      userId: mockUserId,
      companyName: 'Test Company',
      role: 'owner',
      isDefault: true,
      defaultCompanyId: undefined,
    };

    mockDbGateway.transact.mockResolvedValueOnce(undefined);

    const createdCompany = await repository.putCompany(companyData);

    expect(createdCompany.companyId).toBeTruthy();
    expect(createdCompany.userId).toBe(mockUserId);
    expect(createdCompany.companyName).toBe('Test Company');
    expect(createdCompany).not.toHaveProperty('defaultCompanyId');
    expect(mockDbGateway.transact).toHaveBeenCalledWith(undefined, [{
      Item: expect.objectContaining({
        PK: `USER#${mockUserId}`,
        SK: `COMPANY#${createdCompany.companyId}`,
        companyId: createdCompany.companyId,
        cnpj: '11111111000191',
        role: 'owner',
        isDefault: true,
      }),
    }]);
    expect(mockDbGateway.transact.mock.calls[0][1][0].Item).not.toHaveProperty('defaultCompanyId');
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
    const companyData: CompanyInterfaceCreate = {
      cnpj: '11111111000191',
      userId: mockUserId,
      companyName: 'Test Company',
      role: 'owner',
      isDefault: true,
      defaultCompanyId: undefined,
    };

    mockDbGateway.transact.mockRejectedValueOnce(new Error('Database error'));

    await expect(repository.putCompany(companyData)).rejects.toThrow('Database error');
  });

  it('should wrap database errors when querying companies', async () => {
    mockDbGateway.query.mockRejectedValueOnce(new Error('Query error'));

    await expect(repository.getCompaniesByUserId(mockUserId)).rejects.toThrow('Query error');
  });

  it('should update company fields and unset the previous default in one transaction', async () => {
    const updateData: CompanyUpdateCommand = {
      userId: mockUserId,
      companyId: 'company-new',
      companyName: 'New Company',
      cnpj: '22222222000192',
      isDefault: true,
      defaultCompanyId: 'company-old',
    };
    mockDbGateway.transact.mockResolvedValueOnce(undefined);

    await repository.updateCompany(updateData);

    expect(mockDbGateway.transact).toHaveBeenCalledWith([
      {
        keys: { pk: `USER#${mockUserId}`, sk: 'COMPANY#company-old' },
        updateValues: { isDefault: false },
      },
      {
        keys: { pk: `USER#${mockUserId}`, sk: 'COMPANY#company-new' },
        updateValues: {
          companyName: 'New Company',
          cnpj: '22222222000192',
          isDefault: true,
        },
      },
    ]);
    expect(mockDbGateway.transact).toHaveBeenCalledTimes(1);
  });

  it('should update the company in one transaction when there is no previous default', async () => {
    mockDbGateway.transact.mockResolvedValueOnce(undefined);

    await repository.updateCompany({
      userId: mockUserId,
      companyId: 'company-new',
      companyName: 'New Company',
      cnpj: '22222222000192',
      isDefault: true,
    });

    expect(mockDbGateway.transact).toHaveBeenCalledWith([
      {
        keys: { pk: `USER#${mockUserId}`, sk: 'COMPANY#company-new' },
        updateValues: {
          companyName: 'New Company',
          cnpj: '22222222000192',
          isDefault: true,
        },
      },
    ]);
  });

  it('should wrap database errors when updating company', async () => {
    mockDbGateway.transact.mockRejectedValueOnce(new Error('Transaction failed'));

    await expect(repository.updateCompany({
      userId: mockUserId,
      companyId: 'company-new',
      companyName: 'New Company',
      cnpj: '22222222000192',
      isDefault: false,
      defaultCompanyId: 'company-old',
    })).rejects.toThrow('Transaction failed');
  });
});