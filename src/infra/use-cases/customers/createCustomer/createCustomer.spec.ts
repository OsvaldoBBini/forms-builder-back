import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './handler';

const { mockCustomerRepository } = vi.hoisted(() => ({
  mockCustomerRepository: {
    storeCustomer: vi.fn(),
    getCustomers: vi.fn(),
    updateCustomer: vi.fn(),
  },
}));

vi.mock('../repository/customerRepository', () => ({
  CustomerRepository: vi.fn().mockImplementation(() => mockCustomerRepository),
}));

describe('createCustomer handler', () => {
  const mockCompanyId = 'company-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCustomerRepository.storeCustomer.mockReset();
    mockCustomerRepository.getCustomers.mockReset();
    mockCustomerRepository.updateCustomer.mockReset();
  });

  it('should create a new customer successfully', async () => {
    const mockCpf = '12345678901';
    const event = {
      body: JSON.stringify({
        email: 'john.doe@example.com',
        cpf: mockCpf,
        phoneNumber: '11987654321',
        fullName: 'John Doe',
      }),
      pathParameters: {
        companyId: mockCompanyId,
      },
    } as unknown as APIGatewayProxyEvent;

    mockCustomerRepository.storeCustomer.mockResolvedValueOnce('customer-1');

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.customer.cpf).toBe(mockCpf);
    expect(responseBody.data.customer.customerId).toBe('customer-1');
    expect(mockCustomerRepository.storeCustomer).toHaveBeenCalledWith({
      companyId: mockCompanyId,
      email: 'john.doe@example.com',
      cpf: mockCpf,
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
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message.properties).toHaveProperty('fullName');
  });

  it('should create customer with optional email field omitted', async () => {
    const event = {
      body: JSON.stringify({
        cpf: '12345678901',
        phoneNumber: '11987654321',
        fullName: 'John Doe',
        email: null,
      }),
      pathParameters: {
        companyId: mockCompanyId,
      },
    } as unknown as APIGatewayProxyEvent;

    mockCustomerRepository.storeCustomer.mockResolvedValueOnce('customer-2');

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.customer.cpf).toBe('12345678901');
  });

  it('should return error when body is empty', async () => {
    const event = {
      body: '',
      pathParameters: {
        companyId: mockCompanyId,
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    expect(response.statusCode).toBe(400);
  });
});