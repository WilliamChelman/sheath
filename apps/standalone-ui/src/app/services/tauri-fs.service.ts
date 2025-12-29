import { Injectable } from '@angular/core';

export interface DirEntry {
  name: string;
  isDirectory: boolean;
  isFile: boolean;
}

@Injectable({ providedIn: 'root' })
export class TauriFsService {
  /**
   * Read directory entries
   */
  async readDir(path: string): Promise<DirEntry[]> {
    const { readDir } = await import('@tauri-apps/plugin-fs');
    const entries = await readDir(path);
    return entries.map((entry) => ({
      name: entry.name,
      isDirectory: entry.isDirectory,
      isFile: entry.isFile,
    }));
  }

  /**
   * Read file content as string
   */
  async readFile(path: string): Promise<string> {
    const { readTextFile } = await import('@tauri-apps/plugin-fs');
    return readTextFile(path);
  }

  /**
   * Write string content to file
   */
  async writeFile(path: string, content: string): Promise<void> {
    const { writeTextFile } = await import('@tauri-apps/plugin-fs');
    await writeTextFile(path, content);
  }

  /**
   * Delete a file
   */
  async remove(path: string): Promise<void> {
    const { remove } = await import('@tauri-apps/plugin-fs');
    await remove(path);
  }

  /**
   * Check if path exists
   */
  async exists(path: string): Promise<boolean> {
    const { exists } = await import('@tauri-apps/plugin-fs');
    return exists(path);
  }

  /**
   * Create directory (with parents if needed)
   */
  async mkdir(path: string): Promise<void> {
    const { mkdir } = await import('@tauri-apps/plugin-fs');
    await mkdir(path, { recursive: true });
  }

  /**
   * Recursively scan for all markdown files in a directory
   */
  async scanMarkdownFiles(basePath: string): Promise<string[]> {
    const results: string[] = [];
    await this.walkDir(basePath, results);
    return results;
  }

  private async walkDir(dirPath: string, results: string[]): Promise<void> {
    const entries = await this.readDir(dirPath);

    for (const entry of entries) {
      const fullPath = this.joinPath(dirPath, entry.name);

      if (entry.isDirectory) {
        await this.walkDir(fullPath, results);
      } else if (entry.isFile && entry.name.toLowerCase().endsWith('.md')) {
        results.push(fullPath);
      }
    }
  }

  /**
   * Join path segments (handles both / and \ separators)
   */
  joinPath(...segments: string[]): string {
    return segments.join('/').replace(/\/+/g, '/');
  }

  /**
   * Get the directory containing a file
   */
  dirname(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    parts.pop();
    return parts.join('/');
  }

  /**
   * Get the filename from a path
   */
  basename(filePath: string): string {
    const parts = filePath.split(/[/\\]/);
    return parts.pop() ?? '';
  }
}
