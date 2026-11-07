import { S3Gateway } from './s3';

export interface FileStoreGatewayInterface {
  bucketName: string;
  getJsonFile: <T>(fileName: string) => Promise<T | null>;
  storeJsonFile: (fileName: string, fileContent: string) => Promise<void>;
  deleteFile: (fileName: string) => Promise<void>;
}

export const fileStoreGateway: FileStoreGatewayInterface = new S3Gateway();