/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand, UpdateCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { type DatabaseGatewayInterface } from './index.js';

type filterType = 'begins_with' | 'contains' | 'equals';

export interface QueryFilters {
  partitionKey: string;
  sortKey?: string;
  filterType?: filterType;
}

export class DynamoGateway implements DatabaseGatewayInterface<QueryFilters> {
  private readonly dbClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(tableName: string) {
    const client = new DynamoDBClient({ region: 'us-east-1' });
    this.dbClient = DynamoDBDocumentClient.from(client);
    this.tableName = tableName;
  }

  private defineFilterExpression(filterType: filterType) {
    const filterExpressions: Record<filterType, string> = {
      'begins_with': 'AND begins_with(SK, :sk)',
      'contains': 'AND contains(SK, :sk)',
      'equals': 'AND SK = :sk'
    };
    return filterExpressions[filterType];
  }

  public async query<T>(filters: QueryFilters): Promise<T[]> {
    let KeyConditionExpression = 'PK = :pk';
    const ExpressionAttributeValues: Record<string, any> = { ':pk': filters.partitionKey };

    if (filters.sortKey) {
      KeyConditionExpression += ` ${this.defineFilterExpression(filters.filterType || 'equals')}`;
      ExpressionAttributeValues[':sk'] = filters.sortKey;
    }

    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression,
      ExpressionAttributeValues,
    });

    const response = await this.dbClient.send(command);
    return (response.Items || []) as T[];
  }

  public async get<T>(partitionKey: string, sortKey?: string): Promise<T | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { PK: partitionKey, SK: sortKey },
    });

    const response = await this.dbClient.send(command);
    return (response.Item as T) || null;
  }

  public async put<T extends Record<string, any>>(item: T): Promise<void> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: item,
    });

    await this.dbClient.send(command);
  }

  private updateExpression = (keys: string[]) => `SET ${keys.map((k) => `#${k} = :${k}`).join(', ')}`;
  private expressionAttributeNames = (keys: string[]) => keys.reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {});
  private expressionAttributeValues = (keys: string[], updates: Record<string, any>) => keys.reduce((acc, k) => ({ ...acc, [`:${k}`]: updates[k] }), {});
  
  public async update<T>(keys: { pk: string; sk?: string }, updateValues: Partial<T>): Promise<void> {
    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { PK: keys.pk, SK: keys.sk },
      UpdateExpression: this.updateExpression(Object.keys(updateValues)),
      ExpressionAttributeNames: this.expressionAttributeNames(Object.keys(updateValues)),
      ExpressionAttributeValues: this.expressionAttributeValues(Object.keys(updateValues), updateValues)
    });

    await this.dbClient.send(command);
  }

  public async transact<T extends Record<string, any>>(
    updates?: { keys: { pk: string; sk?: string }; updateValues: Partial<T> }[],
    inserts?: { Item: T }[]
  ): Promise<void> {
    const transactItems = updates?.map((item) => ({
      Update: {
        TableName: this.tableName,
        Key: { PK: item.keys.pk, SK: item.keys.sk },
        UpdateExpression: this.updateExpression(Object.keys(item.updateValues)),
        ExpressionAttributeNames: this.expressionAttributeNames(Object.keys(item.updateValues)),
        ExpressionAttributeValues: this.expressionAttributeValues(Object.keys(item.updateValues), item.updateValues)
      }
    })) ?? [];

    const insertItems = inserts?.map((item) => ({
      Put: {
        TableName: this.tableName,
        Item: {...item.Item}
      }
    })) ?? [];

    const command = new TransactWriteCommand({
      TransactItems: [...transactItems, ...insertItems]
    });
    await this.dbClient.send(command);
  }

}

export const databaseGateway = new DynamoGateway('FormsBuilderTable');