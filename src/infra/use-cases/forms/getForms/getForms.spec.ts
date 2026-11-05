import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './handler';

const { mockFormsRepository } = vi.hoisted(() => ({
  mockFormsRepository: {
    getForms: vi.fn(),
    storeForm: vi.fn(),
  },
}));

vi.mock('../repository/formsRepository', () => ({
  FormsRepository: vi.fn().mockImplementation(() => mockFormsRepository),
}));

describe('getForms handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormsRepository.getForms.mockReset();
  });

  it('should return forms list successfully', async () => {
    const event = {
      pathParameters: {
        companyId: 'company-123'
      }
    } as unknown as APIGatewayProxyEvent;

    const mockForms = [
      {
        companyId: 'company-123',
        formId: 'form-123',
        formName: 'Lead Form',
        createdAt: '2024-01-01T00:00:00.000Z'
      }
    ];

    mockFormsRepository.getForms.mockResolvedValueOnce(mockForms);

    const response = await handler(event);
    const responseBody = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(responseBody.data.items).toHaveLength(1);
    expect(responseBody.data.items[0].formName).toBe('Lead Form');

    expect(mockFormsRepository.getForms).toHaveBeenCalledWith('company-123');
  });
});
