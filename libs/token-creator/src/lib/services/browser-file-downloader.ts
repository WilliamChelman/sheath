import { Injectable } from '@angular/core';
import { FileDownloader } from './file-downloader';

@Injectable()
export class BrowserFileDownloader extends FileDownloader {
  async download(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
