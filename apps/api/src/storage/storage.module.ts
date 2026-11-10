import { Global, Module } from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';

@Global()
@Module({ providers: [BlobStorageService], exports: [BlobStorageService] })
export class StorageModule {}
