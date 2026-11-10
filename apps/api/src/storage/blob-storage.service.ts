import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

/**
 * Archivos de los viajes en Vercel Blob (BLOB_READ_WRITE_TOKEN).
 * Cada archivo queda en una ruta aleatoria por agencia: la URL no se puede adivinar.
 */
@Injectable()
export class BlobStorageService {
  constructor(private readonly config: ConfigService) {}

  isConfigured() {
    return Boolean(this.config.get<string>('BLOB_READ_WRITE_TOKEN'));
  }

  async upload(
    agencyId: string,
    extension: string,
    contentType: string,
    body: Buffer,
  ): Promise<string> {
    const token = this.config.get<string>('BLOB_READ_WRITE_TOKEN');
    if (!token)
      throw new ServiceUnavailableException(
        'El almacenamiento de archivos no está configurado.',
      );
    const blob = await put(
      `agencies/${agencyId}/documents/${randomUUID()}.${extension}`,
      body,
      {
        access: 'public',
        contentType,
        addRandomSuffix: true,
        token,
      },
    );
    return blob.url;
  }
}
