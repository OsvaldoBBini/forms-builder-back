import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { APIGatewayProxyEvent } from 'aws-lambda';
import { handler } from './handler.js';
import { missingCompanyIdMessage } from '../../../utils/missingCompanyIdMessage.js';

const { mockFormsRepository, mockDatabaseGateway } = vi.hoisted(() => ({
  mockFormsRepository: {
    getForms: vi.fn(),
    storeForm: vi.fn(),
    updateForm: vi.fn(),
  },
  mockDatabaseGateway: {
    query: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('../repository/formsRepository', () => ({
  FormsRepository: vi.fn().mockImplementation(() => mockFormsRepository),
}));

vi.mock('../../../adapters/database', () => ({
  databaseGateway: mockDatabaseGateway,
}));

describe('updateForm handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormsRepository.updateForm.mockResolvedValue(undefined);
  });

  it('should update only the form name', async () => {
    const event = {
      body: JSON.stringify({ formName: 'Updated Form' }),
      pathParameters: {
        companyId: 'company-123',
        formId: 'form-456',
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.formId).toBe('form-456');
    expect(mockFormsRepository.updateForm).toHaveBeenCalledWith({
      companyId: 'company-123',
      formId: 'form-456',
      formName: 'Updated Form',
    });
  });

  it('should reject a form name outside the allowed length', async () => {
    const event = {
      body: JSON.stringify({ formName: 'A' }),
      pathParameters: {
        companyId: 'company-123',
        formId: 'form-456',
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response.statusCode).toBe(422);
    expect(mockFormsRepository.updateForm).not.toHaveBeenCalled();
  });

  it('should return unauthorized when companyId is missing', async () => {
    const event = {
      body: JSON.stringify({ formName: 'Updated Form' }),
      pathParameters: {
        formId: 'form-456',
      },
    } as unknown as APIGatewayProxyEvent;

    const response = await handler(event);

    expect(response).toEqual(missingCompanyIdMessage);
    expect(mockFormsRepository.updateForm).not.toHaveBeenCalled();
  });
});
