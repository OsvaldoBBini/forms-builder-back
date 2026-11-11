import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler.js';

const { mockCompanyRepository } = vi.hoisted(() => ({
  mockCompanyRepository: {
    putCompany: vi.fn(),
    getCompaniesByUserId: vi.fn(),
  }
}));

vi.mock('../repository/companyRepository', () => ({
  CompanyRepository: vi.fn().mockImplementation(() => mockCompanyRepository),
}));

describe('createCompany handler', () => {
  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyRepository.putCompany.mockReset();
    mockCompanyRepository.getCompaniesByUserId.mockReset();
  });

  it('should create a new company successfully', async () => {
    const event = {
      body: JSON.stringify({ companyName: 'AcmeCorp', cnpj: '11111111000191', isDefault: false }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId,
            },
          },
        },
      },
    } as unknown as APIGatewayProxyEvent;

    const mockCompany = {
      companyId: 'company-1',
      userId: mockUserId,
      companyName: 'AcmeCorp',
      role: 'owner',
      cnpj: '11111111000191',
      isDefault: false,
    };

    mockCompanyRepository.putCompany.mockResolvedValueOnce(mockCompany);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.company.companyName).toBe('AcmeCorp');
    expect(mockCompanyRepository.putCompany).toHaveBeenCalledWith({
      userId: mockUserId,
      companyName: 'AcmeCorp',
      role: 'owner',
      isDefault: false,
      cnpj: '11111111000191',
    });
  });

  it('should return 422 when companyName is too short', async () => {
    const event = {
      body: JSON.stringify({ companyName: 'A', cnpj: '11111111000191' }),
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId,
            },
          },
        },
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(422);
    expect(responseBody.data.message).toHaveProperty('properties');
    expect(mockCompanyRepository.putCompany).not.toHaveBeenCalled();
  });

  it('should return 400 when body is empty', async () => {
    const event = {
      body: '',
      requestContext: {
        authorizer: {
          jwt: {
            claims: {
              sub: mockUserId,
            },
          },
        },
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
  });
});
