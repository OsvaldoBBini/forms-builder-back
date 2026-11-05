import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './handler';

const { mockCustomerRepository } = vi.hoisted(() => ({
  mockCustomerRepository: {
    updateCustomer: vi.fn(),
    storeCustomer: vi.fn(),
    getCustomers: vi.fn(),
  },
}));

vi.mock('../repository/customerRepository', () => ({
  CustomerRepository: vi.fn().mockImplementation(() => mockCustomerRepository),
}));

describe('updateCustomer handler', () => {
  const mockCompanyId = 'company-123';
  const mockCustomerId = 'customer-12345';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomerRepository.updateCustomer.mockReset();
  });

  it('should update a customer successfully', async () => {
    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId,
      },
    } as unknown as APIGatewayProxyEvent;

    mockCustomerRepository.updateCustomer.mockResolvedValueOnce(undefined);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.customer.cpf).toBe('12345678901');
    expect(mockCustomerRepository.updateCustomer).toHaveBeenCalledWith({
      companyId: mockCompanyId,
      customerId: mockCustomerId,
      email: 'john.doe@example.com',
      cpf: '12345678901',
      phoneNumber: '11987654321',
      fullName: 'John Doe',
    });
  });

  it('should return error when CPF format is invalid', async () => {
    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '123456789',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId,
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('cpf');
  });

  it('should return error when phone number format is invalid', async () => {
    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654',
        fullName: 'John Doe',
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId,
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('phoneNumber');
  });

  it('should return error when email format is invalid', async () => {
    const event = {
      body: JSON.stringify({
        email: 'invalid-email',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId,
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('email');
  });

  it('should return error when fullName is too short', async () => {
    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'J',
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId,
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('fullName');
  });

  it('should update customer with optional email field omitted', async () => {
    const event = {
      body: JSON.stringify({
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
        email: null,
      }),
      pathParameters: {
        companyId: mockCompanyId,
        customerId: mockCustomerId,
      },
    } as unknown as APIGatewayProxyEvent;

    mockCustomerRepository.updateCustomer.mockResolvedValueOnce(undefined);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.customer.customerId).toBe(mockCustomerId);
  });
});