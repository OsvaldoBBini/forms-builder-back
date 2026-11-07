/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { Logger } from '@aws-lambda-powertools/logger';
import z from 'zod';
import { 
  UserNotFoundException,
  UsernameExistsException,
  UserNotConfirmedException,
  CodeMismatchException,
  InvalidPasswordException,
  NotAuthorizedException
} from '@aws-sdk/client-cognito-identity-provider';
import { ErrorManager, DatabaseError } from './errorManager';

const logger = new Logger({ serviceName: 'TestErrorManager' });
const errorManager = new ErrorManager(logger);

describe('ErrorManager', () => {

  describe('DatabaseError handling', () => {

    it('should return 400 status for DatabaseError', () => {
      const error = new DatabaseError('Connection failed');

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).data.message).toBe('A error hapened while trying to persist your data');
    });

    it('should log DatabaseError correctly', () => {
      const error = new DatabaseError('Table not found');
      
      expect(() => {
        errorManager.errorHandler(error);
      }).not.toThrow();
    });
  });

  describe('Zod validation errors', () => {

    it('should return 422 for ZodError', () => {
      const schema = z.object({
        email: z.string().email(),
        name: z.string()
      });

      const invalidData = { email: 'not-an-email', name: '' };
      const result = schema.safeParse(invalidData);

      if (!result.success) {
        const response = errorManager.errorHandler(result.error);
        expect(response.statusCode).toBe(422);
        expect(JSON.parse(response.body).data).toHaveProperty('message');
      }
    });
  });

  describe('AWS Cognito errors', () => {

    it('should return 404 for UserNotFoundException', () => {
      const error = new UserNotFoundException({ 
        message: 'User does not exist',
        $metadata: {} as any
      });

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).data.message).toBe('User not found');
    });

    it('should return 409 for UsernameExistsException', () => {
      const error = new UsernameExistsException({ 
        message: 'Username already exists',
        $metadata: {} as any
      });

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(409);
      expect(JSON.parse(response.body).data.message).toBe('E-mail already in used');
    });

    it('should return 403 for UserNotConfirmedException', () => {
      const error = new UserNotConfirmedException({ 
        message: 'User not confirmed',
        $metadata: {} as any
      });

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(403);
      expect(JSON.parse(response.body).data.message).toBe('User not confirmed');
    });

    it('should return 404 for CodeMismatchException', () => {
      const error = new CodeMismatchException({ 
        message: 'Code mismatch',
        $metadata: {} as any
      });

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).data.message).toBe('The confirmation code is not valid');
    });

    it('should return 400 for InvalidPasswordException', () => {
      const error = new InvalidPasswordException({ 
        message: 'Invalid password',
        $metadata: {} as any
      });

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).data.message).toBe('Invalid Password');
    });

    it('should return 401 for NotAuthorizedException', () => {
      const error = new NotAuthorizedException({ 
        message: 'Not authorized',
        $metadata: {} as any
      });

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(401);
      expect(JSON.parse(response.body).data.message).toBe('Incorrect username or password');
    });
  });

  describe('Generic errors', () => {

    it('should return 400 for SyntaxError', () => {
      const error = new SyntaxError('Invalid JSON');

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).data.message).toBe('Invalid request body format');
    });

    it('should return 500 for unknown errors', () => {
      const error = new Error('Something unexpected happened');

      const response = errorManager.errorHandler(error);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).data.message).toBe('Something went wrong');
    });
  });

  describe('Error response format', () => {

    it('should return proper HTTP response format', () => {
      const error = new DatabaseError('DB error');

      const response = errorManager.errorHandler(error);

      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('body');
      expect(typeof response.statusCode).toBe('number');
      expect(typeof response.body).toBe('string');
    });

    it('should return parseable JSON body', () => {
      const error = new UserNotFoundException({ 
        message: 'User not found',
        $metadata: {} as any
      });

      const response = errorManager.errorHandler(error);
      const body = JSON.parse(response.body);

      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('message');
    });
  });
});
