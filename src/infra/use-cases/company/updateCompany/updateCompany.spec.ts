import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler.js';

const { mockCompanyRepository } = vi.hoisted(() => ({
  mockCompanyRepository: {
    putCompany: vi.fn(),
    getCompaniesByUserId: vi.fn(),
    updateCompany: vi.fn(),
  },
}));

vi.mock('../repository/companyRepository.js', () => ({
  CompanyRepository: vi.fn().mockImplementation(() => mockCompanyRepository),
}));

describe('updateCompany handler', () => {
  const mockUserId = 'user-123';
  const mockCompanyId = 'company-2';
  const body = {
    companyName: 'Acme Corporation',
    cnpj: '11111111000191',
    isDefault: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates company details and returns the company id', async () => {
    const event = {
      body: JSON.stringify(body),
      pathParameters: { companyId: mockCompanyId },
      requestContext: {
        authorizer: {
          jwt: {
            claims: { sub: mockUserId },
          },
        },
      },
    } as unknown as APIGatewayProxyEvent;

    mockCompanyRepository.getCompaniesByUserId.mockResolvedValueOnce([
      { companyId: 'company-1', isDefault: true },
      { companyId: mockCompanyId, isDefault: false },
    ]);
    mockCompanyRepository.updateCompany.mockResolvedValueOnce(undefined);

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({ data: { company: mockCompanyId } });
    expect(mockCompanyRepository.getCompaniesByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockCompanyRepository.updateCompany).toHaveBeenCalledWith({
      ...body,
      companyId: mockCompanyId,
      userId: mockUserId,
      defaultCompanyId: 'company-1',
    });
  });

  it('returns an authorization error when the company id is missing', async () => {
    const event = {
      body: JSON.stringify(body),
      pathParameters: {},
      requestContext: {
        authorizer: {
          jwt: {
            claims: { sub: mockUserId },
          },
        },
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(401);
    expect(JSON.parse(response.body)).toEqual({
      data: { message: 'Unauthorized: Missing company ID in path parameters.' },
    });
    expect(mockCompanyRepository.updateCompany).not.toHaveBeenCalled();
  });

  it('rejects invalid company data', async () => {
    const event = {
      body: JSON.stringify({ ...body, cnpj: 'invalid' }),
      pathParameters: { companyId: mockCompanyId },
      requestContext: {
        authorizer: {
          jwt: {
            claims: { sub: mockUserId },
          },
        },
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(422);
    expect(mockCompanyRepository.updateCompany).not.toHaveBeenCalled();
  });
});
