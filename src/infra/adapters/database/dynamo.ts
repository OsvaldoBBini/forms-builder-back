/* eslint-disable @typescript-eslint/no-explicit-any */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, QueryCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export interface DatabaseGatewayInterface {
  dbClient: DynamoDBDocumentClient;
  queryCommand: (item: QueryCommandInputInterface) => QueryCommand;
  getCommand: (item: GetCommandInputInterface) => GetCommand;
  putCommand: (item: Record<string, any> | undefined) => PutCommand;
  updateCommand: (key: { PK: string; SK?: string }, updateValues: Record<string, any>) => UpdateCommand;
}

interface GetCommandInputInterface {
  Key: {
    PK: string;
    SK?: string;
  }
}

interface QueryCommandInputInterface {
  KeyConditionExpression: string;
  ExpressionAttributeValues?: Record<string, any> | undefined
}

export class DynamoGateway implements DatabaseGatewayInterface {
  public dbClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({ region: 'us-east-1' });
    this.tableName = 'FormsBuilderTable';
    this.dbClient = DynamoDBDocumentClient.from(client);
  }

  public queryCommand = (item: QueryCommandInputInterface) => new QueryCommand({
    TableName: this.tableName,
    ...item
  });

  public getCommand = (item: GetCommandInputInterface) => new GetCommand({
    TableName: this.tableName,
    ...item
  });

  public putCommand = (item: Record<string, any> | undefined) => new PutCommand({
    TableName: this.tableName,
    Item: { ...item }
  });

  private updateExpression = (keys: string[]) => `SET ${keys.map((k) => `#${k} = :${k}`).join(', ')}`;
  private expressionAttributeNames = (keys: string[]) => keys.reduce((acc, k) => ({ ...acc, [`#${k}`]: k }), {});
  private expressionAttributeValues = (keys: string[], updates: Record<string, any>) => keys.reduce((acc, k) => ({ ...acc, [`:${k}`]: updates[k] }), {});

  public updateCommand = (key: { PK: string; SK?: string }, updateValues: Record<string, any>) => new UpdateCommand(
    {
      TableName: this.tableName,
      Key: key,
      UpdateExpression: this.updateExpression(Object.keys(updateValues)),
      ExpressionAttributeNames: this.expressionAttributeNames(Object.keys(updateValues)),
      ExpressionAttributeValues: this.expressionAttributeValues(Object.keys(updateValues), updateValues)
    }
  );
}

export const dynamoGateway = new DynamoGateway();