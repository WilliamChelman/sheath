import { Injectable } from '@angular/core';
import {
  BatchToken,
  EXPORT_FORMATS,
  ExportFormat,
  TOKEN_SIZE_PX,
  TokenConfig,
} from '../models/token.model';

@Injectable({ providedIn: 'root' })
export class TokenExportService {
  async exportToken(
    svgElement: SVGSVGElement,
    config: TokenConfig,
    format: ExportFormat,
  ): Promise<void> {
    const filename = this.generateFilename(config.name, format);

    if (format === 'svg') {
      this.downloadSvg(svgElement, filename);
      return;
    }

    await this.downloadRaster(svgElement, config, format, filename);
  }

  async exportBatch(
    getSvgElement: () => SVGSVGElement | null,
    baseConfig: TokenConfig,
    tokens: BatchToken[],
    format: ExportFormat,
    updateConfigFn: (config: TokenConfig) => void,
    waitForRenderFn: () => Promise<void>,
  ): Promise<void> {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const originalConfig = { ...baseConfig };

    for (const token of tokens) {
      // Update config for this token
      updateConfigFn({
        ...baseConfig,
        name: token.name,
        initials: token.initials,
        showMinionIcon: token.isMinion,
      });

      // Wait for Angular to re-render
      await waitForRenderFn();

      // Get the updated SVG element
      const svgElement = getSvgElement();
      if (!svgElement) continue;

      // Get blob and add to zip
      const blob = await this.getBlob(svgElement, baseConfig, format);
      const filename = this.generateFilename(token.name, format);
      zip.file(filename, blob);
    }

    // Restore original config
    updateConfigFn(originalConfig);

    // Generate and download ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const timestamp = new Date().toISOString().slice(0, 10);
    this.triggerDownload(zipBlob, `tokens-${timestamp}.zip`);
  }

  private async getBlob(
    svgElement: SVGSVGElement,
    config: TokenConfig,
    format: ExportFormat,
  ): Promise<Blob> {
    if (format === 'svg') {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      return new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    }

    return this.generateRasterBlob(svgElement, config, format);
  }

  private async generateRasterBlob(
    svgElement: SVGSVGElement,
    config: TokenConfig,
    format: ExportFormat,
  ): Promise<Blob> {
    const size = TOKEN_SIZE_PX[config.size];
    const scale = 2;
    const exportSize = size * scale;

    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    if (format === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportSize, exportSize);
    }

    const svgData = this.prepareSvgForExport(svgElement, exportSize);
    const img = await this.loadImage(svgData);

    ctx.drawImage(img, 0, 0, exportSize, exportSize);

    const mimeType =
      EXPORT_FORMATS.find((f) => f.value === format)?.mimeType || 'image/png';
    const quality = format === 'jpg' ? 0.92 : undefined;

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        mimeType,
        quality,
      );
    });
  }

  private generateFilename(name: string, format: ExportFormat): string {
    const sanitizedName = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `token-${sanitizedName || 'token'}.${format}`;
  }

  private downloadSvg(svgElement: SVGSVGElement, filename: string): void {
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    this.triggerDownload(blob, filename);
  }

  private async downloadRaster(
    svgElement: SVGSVGElement,
    config: TokenConfig,
    format: ExportFormat,
    filename: string,
  ): Promise<void> {
    const size = TOKEN_SIZE_PX[config.size];
    const scale = 2; // Export at 2x for better quality
    const exportSize = size * scale;

    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // For JPG, fill with white background (no transparency)
    if (format === 'jpg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, exportSize, exportSize);
    }

    const svgData = this.prepareSvgForExport(svgElement, exportSize);
    const img = await this.loadImage(svgData);

    ctx.drawImage(img, 0, 0, exportSize, exportSize);

    const mimeType =
      EXPORT_FORMATS.find((f) => f.value === format)?.mimeType || 'image/png';
    const quality = format === 'jpg' ? 0.92 : undefined;

    canvas.toBlob(
      (blob) => {
        if (blob) {
          this.triggerDownload(blob, filename);
        }
      },
      mimeType,
      quality,
    );
  }

  private prepareSvgForExport(svgElement: SVGSVGElement, size: number): string {
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    clone.setAttribute('width', size.toString());
    clone.setAttribute('height', size.toString());

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private triggerDownload(blob: Blob, filename: string): void {
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
