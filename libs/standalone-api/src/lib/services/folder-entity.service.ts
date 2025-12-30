import {
  Entity,
  EntityCreationOptions,
  EntityInput,
  EntityService,
} from '@/entity';
import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  from,
  map,
  Observable,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { FolderSettingsService } from './folder-settings.service';
import {
  entityToFrontmatter,
  frontmatterToEntity,
  generateEntityId,
  parseFrontmatter,
  toKebabCase,
  toMarkdown,
} from '../utils/markdown-frontmatter.util';
import { TauriFsService } from './tauri-fs.service';

@Injectable({ providedIn: 'root' })
export class FolderEntityService implements EntityService {
  private readonly tauriFsService = inject(TauriFsService);
  private readonly folderSettings = inject(FolderSettingsService);

  private readonly _entities$ = new BehaviorSubject<Map<string, Entity>>(
    new Map(),
  );
  private readonly _filePathMap = new Map<string, string>(); // entity.id -> file path
  private _initialized = false;

  readonly entities$: Observable<Entity[]> = this._entities$.pipe(
    map((m) => Array.from(m.values())),
    shareReplay(1),
  );
  readonly entitiesMap$: Observable<Map<string, Entity>> =
    this._entities$.asObservable();

  /**
   * Initialize the service by scanning the folder for markdown files
   */
  async initialize(): Promise<void> {
    if (this._initialized) return;

    const folderPath = this.folderSettings.folderPath();
    if (!folderPath) {
      throw new Error('No folder path configured');
    }

    // Check if folder exists
    const folderExists = await this.tauriFsService.exists(folderPath);
    if (!folderExists) {
      throw new Error(`Folder does not exist: ${folderPath}`);
    }

    // Scan for markdown files
    const mdFiles = await this.tauriFsService.scanMarkdownFiles(folderPath);
    const entities = new Map<string, Entity>();
    this._filePathMap.clear();

    for (const filePath of mdFiles) {
      try {
        const content = await this.tauriFsService.readFile(filePath);
        const parsed = parseFrontmatter(content);

        // Skip files without valid frontmatter id
        if (!parsed.data['id']) {
          console.warn(`Skipping file without id: ${filePath}`);
          continue;
        }

        const entity = frontmatterToEntity(
          parsed.data as Record<string, unknown>,
          parsed.content,
        );

        entities.set(entity.id, entity);
        this._filePathMap.set(entity.id, filePath);
      } catch (error) {
        console.warn(`Failed to parse ${filePath}:`, error);
      }
    }

    this._entities$.next(entities);
    this._initialized = true;
  }

  /**
   * Re-initialize (reload from folder)
   */
  async reload(): Promise<void> {
    this._initialized = false;
    await this.initialize();
  }

  getAll(): Observable<Entity[]> {
    return of(Array.from(this._entities$.getValue().values()));
  }

  getById(id: string): Observable<Entity | undefined> {
    return of(this._entities$.getValue().get(id));
  }

  getByType(type: string): Observable<Entity[]> {
    const entities = Array.from(this._entities$.getValue().values()).filter(
      (e) => e.type === type,
    );
    return of(entities);
  }

  create(
    data: EntityInput | EntityInput[],
    options?: EntityCreationOptions,
  ): Observable<Entity[]> {
    const now = new Date().toISOString();
    const inputs = Array.isArray(data) ? data : [data];

    // Extract path hints before creating entities
    const pathHints = new Map<string, string>();

    const entities = inputs.map((input) => {
      const id =
        input.id ??
        generateEntityId(
          input.type ?? 'sheath.core.unknown',
          input.name ?? 'unnamed',
        );

      // Store path hint if provided (used for audio companion files)
      const inputWithHint = input as EntityInput & { _pathHint?: string };
      if (inputWithHint._pathHint) {
        pathHints.set(id, inputWithHint._pathHint);
      }

      // Remove _pathHint from the entity data
      const { _pathHint, ...rest } = inputWithHint as EntityInput & {
        _pathHint?: string;
      };

      return {
        ...rest,
        id,
        type: input.type ?? 'sheath.core.unknown',
        name: input.name ?? 'Unnamed',
        createdAt: input.createdAt ?? now,
        updatedAt: input.updatedAt ?? now,
      } as Entity;
    });

    return from(
      this.writeEntities(entities, options?.force ?? false, pathHints),
    ).pipe(
      map(() => entities),
      tap(() => {
        const currentMap = this._entities$.getValue();
        const newMap = new Map(currentMap);
        entities.forEach((entity) => newMap.set(entity.id, entity));
        this._entities$.next(newMap);
      }),
    );
  }

  update(
    id: string,
    data: Partial<Omit<Entity, 'id' | 'createdAt'>>,
  ): Observable<Entity> {
    const existing = this._entities$.getValue().get(id);
    if (!existing) {
      return throwError(() => new Error(`Entity with id ${id} not found`));
    }

    const updated: Entity = {
      ...existing,
      ...data,
      id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };

    return from(this.writeEntity(updated)).pipe(
      map(() => updated),
      tap(() => {
        const currentMap = this._entities$.getValue();
        const newMap = new Map(currentMap);
        newMap.set(id, updated);
        this._entities$.next(newMap);
      }),
    );
  }

  delete(id: string): Observable<void> {
    const existing = this._entities$.getValue().get(id);
    if (!existing) {
      return throwError(() => new Error(`Entity with id ${id} not found`));
    }

    const filePath = this._filePathMap.get(id);
    if (!filePath) {
      return throwError(
        () => new Error(`File path not found for entity ${id}`),
      );
    }

    return from(this.tauriFsService.remove(filePath)).pipe(
      tap(() => {
        const currentMap = this._entities$.getValue();
        const newMap = new Map(currentMap);
        newMap.delete(id);
        this._entities$.next(newMap);
        this._filePathMap.delete(id);
      }),
      map(() => undefined),
    );
  }

  search(query: string): Observable<Entity[]> {
    const lowerQuery = query.toLowerCase();
    const entities = Array.from(this._entities$.getValue().values()).filter(
      (e) =>
        e.name.toLowerCase().includes(lowerQuery) ||
        (e.description?.toLowerCase().includes(lowerQuery) ?? false) ||
        (e.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ??
          false),
    );
    return of(entities);
  }

  /**
   * Get the file path for an entity by its ID.
   * Returns undefined if the entity is not found.
   */
  getFilePath(entityId: string): string | undefined {
    return this._filePathMap.get(entityId);
  }

  /**
   * Get the directory containing an entity's file.
   */
  getEntityDirectory(entityId: string): string | undefined {
    const filePath = this._filePathMap.get(entityId);
    if (!filePath) return undefined;
    return this.tauriFsService.dirname(filePath);
  }

  /**
   * Write multiple entities to disk
   */
  private async writeEntities(
    entities: Entity[],
    force: boolean,
    pathHints?: Map<string, string>,
  ): Promise<void> {
    for (const entity of entities) {
      const existingPath = this._filePathMap.get(entity.id);
      if (existingPath && !force) {
        throw new Error(`Entity with id ${entity.id} already exists`);
      }
      const pathHint = pathHints?.get(entity.id);
      await this.writeEntity(entity, pathHint);
    }
  }

  /**
   * Write a single entity to disk
   */
  private async writeEntity(entity: Entity, pathHint?: string): Promise<void> {
    const folderPath = this.folderSettings.folderPath();
    if (!folderPath) {
      throw new Error('No folder path configured');
    }

    // Get existing path, use path hint, or generate new one
    let filePath = this._filePathMap.get(entity.id);
    if (!filePath) {
      filePath = pathHint ?? this.generateFilePath(entity);
    }

    // Ensure directory exists
    const dirPath = this.tauriFsService.dirname(filePath);
    const dirExists = await this.tauriFsService.exists(dirPath);
    if (!dirExists) {
      await this.tauriFsService.mkdir(dirPath);
    }

    // Write the markdown file
    const frontmatter = entityToFrontmatter(entity);
    const content = toMarkdown(frontmatter, entity.content ?? '');
    await this.tauriFsService.writeFile(filePath, content);

    // Update file path mapping
    this._filePathMap.set(entity.id, filePath);
  }

  /**
   * Generate file path for a new entity based on type and name
   */
  private generateFilePath(entity: Entity): string {
    const basePath = this.folderSettings.folderPath()!;
    // Convert type like "sheath.ds.monster" to "sheath/ds/monster"
    const typeSegments = entity.type.split('.');
    const typePath = typeSegments.join('/');
    const nameSlug = toKebabCase(entity.name);
    const fileName = `${nameSlug}.md`;

    return this.tauriFsService.joinPath(basePath, typePath, fileName);
  }
}
