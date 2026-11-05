import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './handler';

const { mockFormsRepository } = vi.hoisted(() => ({
  mockFormsRepository: {
    storeForm: vi.fn(),
    getForms: vi.fn(),
  },
}));

vi.mock('../repository/formsRepository', () => ({
  FormsRepository: vi.fn().mockImplementation(() => mockFormsRepository),
}));

describe('createForm handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormsRepository.storeForm.mockReset();
  });

  it('should create a form successfully', async () => {
    const event = {
      body: JSON.stringify({ formName: 'Lead Form' }),
      pathParameters: {
        companyId: 'company-123'
      }
    } as unknown as APIGatewayProxyEvent;

    mockFormsRepository.storeForm.mockResolvedValueOnce('form-123');

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(201);
    expect(responseBody.data.form).toEqual({
      formId: 'form-123',
      formName: 'Lead Form',
      companyId: 'company-123'
    });

    expect(mockFormsRepository.storeForm).toHaveBeenCalledWith({
      companyId: 'company-123',
      formName: 'Lead Form'
    });
  });
});
