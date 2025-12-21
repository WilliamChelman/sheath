import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import {
  BehaviorSubject,
  from,
  map,
  Observable,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';
import { Entity } from '../models/entity';
import {
  EntityCreationOptions,
  EntityInput,
  EntityService,
} from './entity.service';

class EntityDatabase extends Dexie {
  entities!: Table<Entity, string>;

  constructor() {
    super('sheath-entities-db');
    this.version(1).stores({
      entities: 'id, type, name',
    });
  }
}

@Injectable({ providedIn: 'root' })
export class IndexedDbEntityService implements EntityService {
  private readonly db = new EntityDatabase();
  private readonly _entities$ = new BehaviorSubject<Map<string, Entity>>(
    new Map(),
  );

  readonly entities$: Observable<Entity[]> = this._entities$.pipe(
    map((m) => Array.from(m.values())),
    shareReplay(1),
  );
  readonly entitiesMap$: Observable<Map<string, Entity>> =
    this._entities$.asObservable();

  constructor() {
    this.loadFromDB();
  }

  private loadFromDB(): void {
    this.db.entities.toArray().then((entities) => {
      const map = new Map<string, Entity>();
      entities.forEach((entity) => map.set(entity.id, entity));
      this._entities$.next(map);
    });
  }

  getAll(): Observable<Entity[]> {
    return from(this.db.entities.toArray());
  }

  getById(id: string): Observable<Entity | undefined> {
    return from(this.db.entities.get(id));
  }

  getByType(type: string): Observable<Entity[]> {
    return from(this.db.entities.where('type').equals(type).toArray());
  }

  create(
    data: EntityInput | EntityInput[],
    options?: EntityCreationOptions,
  ): Observable<Entity[]> {
    const now = new Date().toISOString();
    const inputs = Array.isArray(data) ? data : [data];

    const entities = inputs.map(
      (input) =>
        ({
          ...input,
          id: input.id ?? crypto.randomUUID(),
          createdAt: input.createdAt ?? now,
          updatedAt: input.updatedAt ?? now,
        }) as Entity,
    );

    const operation = options?.force
      ? this.db.entities.bulkPut(entities)
      : this.db.entities.bulkAdd(entities);

    return from(operation).pipe(
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

    return from(this.db.entities.put(updated)).pipe(
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
    if (!this._entities$.getValue().has(id)) {
      return throwError(() => new Error(`Entity with id ${id} not found`));
    }

    return from(this.db.entities.delete(id)).pipe(
      tap(() => {
        const currentMap = this._entities$.getValue();
        const newMap = new Map(currentMap);
        newMap.delete(id);
        this._entities$.next(newMap);
      }),
    );
  }

  search(query: string): Observable<Entity[]> {
    const lowerQuery = query.toLowerCase();
    return from(
      this.db.entities
        .filter(
          (e) =>
            e.name.toLowerCase().includes(lowerQuery) ||
            (e.description?.toLowerCase().includes(lowerQuery) ?? false) ||
            (e.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ??
              false),
        )
        .toArray(),
    );
  }
}
