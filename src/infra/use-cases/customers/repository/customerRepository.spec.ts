import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomerRepository } from './customerRepository.js';
import type { CustomerInterface } from '../../../domain/entities/customer/customer.js';

describe('CustomerRepository', () => {
  const mockDbGateway = {
    query: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    update: vi.fn(),
  };

  let repository: CustomerRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new CustomerRepository(mockDbGateway as any);
  });

  it('should store customer successfully', async () => {
    const companyId = '599b80c6-6428-4863-a255-f85f986c24e2';
    const customerData: CustomerInterface = {
      companyId,
      email: 'john@example.com',
      cpf: '12345678901',
      phoneNumber: '11987654321',
      fullName: 'John Doe',
    };

    mockDbGateway.put.mockResolvedValueOnce(undefined);

    const customerId = await repository.storeCustomer(customerData);

    expect(customerId).toBeTruthy();
    expect(mockDbGateway.put).toHaveBeenCalledWith(
      expect.objectContaining({
        PK: `COMPANY#${companyId}#CUSTOMERS`,
        SK: expect.stringMatching(/^CUSTOMER#.+$/),
        ...customerData,
        customerId: expect.any(String),
      })
    );
  });

  it('should call put with customer payload for optional email', async () => {
    const companyId = '599b80c6-6428-4863-a255-f85f986c24e2';
    const customerData: CustomerInterface = {
      companyId,
      cpf: '12345678901',
      phoneNumber: '11987654321',
      fullName: 'John Doe',
    };

    mockDbGateway.put.mockResolvedValueOnce(undefined);

    await repository.storeCustomer(customerData);

    expect(mockDbGateway.put).toHaveBeenCalledWith(
      expect.objectContaining({
        PK: `COMPANY#${companyId}#CUSTOMERS`,
        SK: expect.stringMatching(/^CUSTOMER#.+$/),
        companyId,
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
        customerId: expect.any(String),
      })
    );
  });

  it('should return a mapped list of customers for a company', async () => {
    const companyId = 'company-123';
    const mockItems = [{
      PK: `COMPANY#${companyId}#CUSTOMERS`,
      SK: 'CUSTOMER#customer-1',
      companyId,
      email: 'john@example.com',
      cpf: '12345678901',
      phoneNumber: '11987654321',
      fullName: 'John Doe',
      customerId: 'customer-1',
    }];

    mockDbGateway.query.mockResolvedValueOnce(mockItems);

    const result = await repository.getCustomers(companyId);

    expect(result).toEqual([
      expect.objectContaining({
        companyId,
        customerId: 'customer-1',
        email: 'john@example.com',
      }),
    ]);
    expect(mockDbGateway.query).toHaveBeenCalledWith({ partitionKey: `COMPANY#${companyId}#CUSTOMERS` });
  });

  it('should update customer successfully', async () => {
    const companyId = 'company-123';
    const customerId = 'customer-12345';
    const customerData = {
      companyId,
      customerId,
      email: 'john@example.com',
      cpf: '12345678901',
      phoneNumber: '11987654321',
      fullName: 'John Doe',
    };

    mockDbGateway.update.mockResolvedValueOnce(undefined);

    await expect(repository.updateCustomer(customerData)).resolves.toBeUndefined();
    expect(mockDbGateway.update).toHaveBeenCalledWith(
      { pk: `COMPANY#${companyId}#CUSTOMERS`, sk: `CUSTOMER#${customerId}` },
      { ...customerData }
    );
  });

  it('should wrap database errors when storing customer', async () => {
    const customerData: CustomerInterface = {
      companyId: 'company-123',
      email: 'john@example.com',
      cpf: '12345678901',
      phoneNumber: '11987654321',
      fullName: 'John Doe',
    };

    mockDbGateway.put.mockRejectedValueOnce(new Error('Database error'));

    await expect(repository.storeCustomer(customerData)).rejects.toThrow('Database error');
  });

  it('should wrap database errors when querying customers', async () => {
    mockDbGateway.query.mockRejectedValueOnce(new Error('Query error'));

    await expect(repository.getCustomers('company-123')).rejects.toThrow('Query error');
  });
});
