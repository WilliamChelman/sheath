import { Injectable } from '@angular/core';
import { FileDownloader } from '@/token-creator';

@Injectable()
export class TauriFileDownloader extends FileDownloader {
  async download(blob: Blob, filename: string): Promise<void> {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeFile } = await import('@tauri-apps/plugin-fs');

    const extension = filename.split('.').pop() ?? '';
    const filterName = this.getFilterName(extension);

    const path = await save({
      defaultPath: filename,
      filters: [{ name: filterName, extensions: [extension] }],
    });

    if (path) {
      const buffer = await blob.arrayBuffer();
      await writeFile(path, new Uint8Array(buffer));
    }
  }

  private getFilterName(extension: string): string {
    switch (extension.toLowerCase()) {
      case 'png':
        return 'PNG Image';
      case 'jpg':
      case 'jpeg':
        return 'JPEG Image';
      case 'svg':
        return 'SVG Image';
      case 'zip':
        return 'ZIP Archive';
      default:
        return 'File';
    }
  }
}
