import { Injectable } from '@angular/core';
import Dexie, { type Table } from 'dexie';
import { catchError, from, map, Observable, of } from 'rxjs';

interface IndexChunk {
  key: string;
  data: string;
}

interface MetaEntry {
  key: string;
  value: string;
}

class EntitySearchCacheDb extends Dexie {
  indexChunks!: Table<IndexChunk, string>;
  meta!: Table<MetaEntry, string>;

  constructor() {
    super('entity-search-cache');
    this.version(1).stores({
      indexChunks: 'key',
      meta: 'key',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class EntitySearchCacheService {
  private readonly db = new EntitySearchCacheDb();

  getCachedHash(): Observable<string | null> {
    return from(this.db.meta.get('contentHash')).pipe(
      map((entry) => entry?.value ?? null),
      catchError(() => of(null)),
    );
  }

  saveHash(hash: string): Observable<void> {
    return from(this.db.meta.put({ key: 'contentHash', value: hash })).pipe(
      map(() => void 0),
    );
  }

  saveIndexChunk(key: string, data: string): Observable<void> {
    return from(this.db.indexChunks.put({ key, data })).pipe(map(() => void 0));
  }

  getIndexChunk(key: string): Observable<string | null> {
    return from(this.db.indexChunks.get(key)).pipe(
      map((chunk) => chunk?.data ?? null),
      catchError(() => of(null)),
    );
  }

  getAllIndexKeys(): Observable<string[]> {
    return from(this.db.indexChunks.toArray()).pipe(
      map((chunks) => chunks.map((c) => c.key)),
      catchError(() => of([])),
    );
  }

  clearIndex(): Observable<void> {
    return from(this.db.indexChunks.clear()).pipe(
      map(() => void 0),
      catchError(() => of(void 0)),
    );
  }

  isCacheValid(contentHash: string): Observable<boolean> {
    return this.getCachedHash().pipe(
      map((cachedHash) => cachedHash === contentHash),
    );
  }
}
