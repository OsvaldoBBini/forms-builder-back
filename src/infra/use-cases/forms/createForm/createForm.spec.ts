import { describe, it, expect, beforeEach, vi } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy';
import { handler } from './createForm';
import * as formsRepositoryModule from '../repository/formsRepository';

vi.mock('../repository/formsRepository', () => ({
  formsRepository: {
    storeForm: vi.fn()
  }
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFormsRepository = formsRepositoryModule.formsRepository as any;

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
