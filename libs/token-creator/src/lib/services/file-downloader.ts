import { InjectionToken } from '@angular/core';

export abstract class FileDownloader {
  abstract download(blob: Blob, filename: string): Promise<void>;
}

export const FILE_DOWNLOADER = new InjectionToken<FileDownloader>(
  'FILE_DOWNLOADER',
);
