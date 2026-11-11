import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler.js';

const { mockCustomerRepository } = vi.hoisted(() => ({
  mockCustomerRepository: {
    getCustomers: vi.fn(),
    storeCustomer: vi.fn(),
    updateCustomer: vi.fn(),
  },
}));

vi.mock('../repository/customerRepository', () => ({
  CustomerRepository: vi.fn().mockImplementation(() => mockCustomerRepository),
}));

describe('getCustomers handler', () => {
  const mockCompanyId = 'company-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomerRepository.getCustomers.mockReset();
  });

  it('should return all customers for a company successfully', async () => {
    const mockCustomers = [
      {
        companyId: mockCompanyId,
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
        customerId: 'customer-1',
      },
      {
        companyId: mockCompanyId,
        email: 'jane.doe@example.com',
        cpf: '98765432109',
        phoneNumber: '11987654322',
        fullName: 'Jane Doe',
        customerId: 'customer-2',
      },
    ];

    const event = {
      pathParameters: { companyId: mockCompanyId },
    } as unknown as APIGatewayProxyEvent;

    mockCustomerRepository.getCustomers.mockResolvedValueOnce(mockCustomers);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toEqual(mockCustomers);
    expect(responseBody.data.items).toHaveLength(2);
    expect(mockCustomerRepository.getCustomers).toHaveBeenCalledWith(mockCompanyId);
  });

  it('should return empty array when no customers exist', async () => {
    const event = {
      pathParameters: { companyId: mockCompanyId },
    } as unknown as APIGatewayProxyEvent;

    mockCustomerRepository.getCustomers.mockResolvedValueOnce(undefined);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toEqual([]);
    expect(mockCustomerRepository.getCustomers).toHaveBeenCalledWith(mockCompanyId);
  });

  it('should return 401 when company ID is missing', async () => {
    const event = { pathParameters: {} } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(401);
    expect(responseBody.data.message).toBe('Unauthorized: Missing company ID in path parameters.');
    expect(mockCustomerRepository.getCustomers).not.toHaveBeenCalled();
  });
});