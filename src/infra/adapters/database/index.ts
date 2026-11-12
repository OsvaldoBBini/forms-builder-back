/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamoGateway, type QueryFilters } from './dynamo.js';

export interface DatabaseGatewayInterface<F> {
  query: <T>(filters: F) => Promise<T[]>;
  get: <T>(partitionKey: string, sortKey?: string) => Promise<T | null>;
  put: <T extends Record<string, any>>(item: T) => Promise<void>;
  update: <T>(keys: { pk: string; sk?: string }, updateValues: Partial<T>) => Promise<void>;
  transact: <T extends Record<string, any>>(
    updates?: { keys: { pk: string; sk?: string }; updateValues: Partial<T> }[],
    inserts?: { Item: T }[]
  ) => Promise<void>;
}

export type IDatabaseGateway = DatabaseGatewayInterface<QueryFilters>;
export const databaseGateway = new DynamoGateway('FormsBuilderTable');