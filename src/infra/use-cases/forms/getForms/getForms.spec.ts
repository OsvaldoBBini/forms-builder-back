import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './getForms';
import * as formsRepositoryModule from '../repository/formsRepository';

vi.mock('../repository/formsRepository', () => ({
  formsRepository: {
    getForms: vi.fn()
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFormsRepository = formsRepositoryModule.formsRepository as any;

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
