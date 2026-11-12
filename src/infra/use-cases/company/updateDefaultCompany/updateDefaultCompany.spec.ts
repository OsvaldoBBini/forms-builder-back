import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler.js';

const { mockCompanyRepository } = vi.hoisted(() => ({
  mockCompanyRepository: {
    putCompany: vi.fn(),
    getCompaniesByUserId: vi.fn(),
    updateDefaultCompany: vi.fn(),
  },
}));

vi.mock('../repository/companyRepository.js', () => ({
  CompanyRepository: vi.fn().mockImplementation(() => mockCompanyRepository),
}));

describe('updateDefaultCompany handler', () => {
  const mockUserId = 'user-123';
  const mockCompanyId = 'company-2';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('updates the default company and returns the selected company id', async () => {
    const event = {
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
    mockCompanyRepository.updateDefaultCompany.mockResolvedValueOnce(undefined);

    const response = await handler(event);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({
      data: { company: mockCompanyId },
    });
    expect(mockCompanyRepository.getCompaniesByUserId).toHaveBeenCalledWith(mockUserId);
    expect(mockCompanyRepository.updateDefaultCompany).toHaveBeenCalledWith({
      userId: mockUserId,
      defaultCompanyId: 'company-1',
      newDefaultCompanyId: mockCompanyId,
    });
  });

  it('returns an authorization error when the company id is missing', async () => {
    const event = {
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
    expect(mockCompanyRepository.getCompaniesByUserId).not.toHaveBeenCalled();
    expect(mockCompanyRepository.updateDefaultCompany).not.toHaveBeenCalled();
  });
});
