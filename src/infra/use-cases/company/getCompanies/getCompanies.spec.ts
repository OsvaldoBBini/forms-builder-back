import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './handler';

const { mockCompanyRepository } = vi.hoisted(() => ({
  mockCompanyRepository: {
    getCompaniesByUserId: vi.fn(),
    putCompany: vi.fn(),
  },
}));

vi.mock('../repository/companyRepository', () => ({
  CompanyRepository: vi.fn().mockImplementation(() => mockCompanyRepository),
}));

describe('getCompanies handler', () => {
  const mockUserId = 'user-abc';

  beforeEach(() => {
    vi.clearAllMocks();
    mockCompanyRepository.getCompaniesByUserId.mockReset();
  });

  it('should return companies list successfully', async () => {
    const event = {
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

    const mockCompanies = [
      { companyId: 'c1', userId: mockUserId, companyName: 'One', role: 'owner', cnpj: '11111111000191', isDefault: true },
      { companyId: 'c2', userId: mockUserId, companyName: 'Two', role: 'member', cnpj: '11111111000191', isDefault: false },
    ];

    mockCompanyRepository.getCompaniesByUserId.mockResolvedValueOnce(mockCompanies);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toHaveLength(2);
    expect(responseBody.data.items[0].companyName).toBe('One');
    expect(mockCompanyRepository.getCompaniesByUserId).toHaveBeenCalledWith(mockUserId);
  });

  it('should return empty items when repository returns null', async () => {
    const event = {
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

    mockCompanyRepository.getCompaniesByUserId.mockResolvedValueOnce(null);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toEqual([]);
    expect(mockCompanyRepository.getCompaniesByUserId).toHaveBeenCalledWith(mockUserId);
  });
});
