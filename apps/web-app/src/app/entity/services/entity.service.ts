import { Injectable, signal, computed } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import Dexie, { Table } from 'dexie';
import { Entity } from '../models/entity';

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
export class EntityService {
  private readonly db = new EntityDatabase();
  private readonly _entities = signal<Map<string, Entity>>(new Map());

  readonly entities = computed(() => Array.from(this._entities().values()));
  readonly entitiesMap = this._entities.asReadonly();

  constructor() {
    this.loadFromDB();
  }

  private loadFromDB(): void {
    this.db.entities.toArray().then((entities) => {
      const map = new Map<string, Entity>();
      entities.forEach((entity) => map.set(entity.id, entity));
      this._entities.set(map);
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

  create(data: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Observable<Entity> {
    const now = new Date().toISOString();
    const entity = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as Entity;

    return from(this.db.entities.add(entity)).pipe(
      map(() => entity),
      tap(() => {
        this._entities.update((map) => {
          const newMap = new Map(map);
          newMap.set(entity.id, entity);
          return newMap;
        });
      })
    );
  }

  update(id: string, data: Partial<Omit<Entity, 'id' | 'createdAt'>>): Observable<Entity> {
    const existing = this._entities().get(id);
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
        this._entities.update((map) => {
          const newMap = new Map(map);
          newMap.set(id, updated);
          return newMap;
        });
      })
    );
  }

  delete(id: string): Observable<void> {
    if (!this._entities().has(id)) {
      return throwError(() => new Error(`Entity with id ${id} not found`));
    }

    return from(this.db.entities.delete(id)).pipe(
      tap(() => {
        this._entities.update((map) => {
          const newMap = new Map(map);
          newMap.delete(id);
          return newMap;
        });
      })
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
            (e.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ?? false)
        )
        .toArray()
    );
  }
}
