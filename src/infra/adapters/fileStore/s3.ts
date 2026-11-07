import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { FileStoreGatewayInterface } from '.';

export class S3Gateway implements FileStoreGatewayInterface {

  private readonly s3Client: S3Client;
  public bucketName: string;

  constructor() {
    this.s3Client = new S3Client();
    this.bucketName = process.env.FIELDS_BUCKET || '';
  }

  async storeJsonFile(fileName: string, fileContent: string): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: 'application/json',
    });

    await this.s3Client.send(command);
  }

  async deleteFile(fileName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    await this.s3Client.send(command);
  }

  async getJsonFile<T>(fileName: string): Promise<T | null> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: fileName,
    });

    const response = await this.s3Client.send(command);
    if (!response.Body) {
      return null;
    }

    const stringData = await response.Body.transformToString();
    return JSON.parse(stringData) as T;
  }

}