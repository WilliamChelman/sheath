import { Observable } from 'rxjs';
import { Entity } from '../models/entity';
import { InjectionToken } from '@angular/core';

export type EntityInput = Partial<Entity>;

export interface EntityService {
  readonly entities$: Observable<Entity[]>;
  readonly entitiesMap$: Observable<Map<string, Entity>>;

  getAll(): Observable<Entity[]>;
  getById(id: string): Observable<Entity | undefined>;
  getByType(type: string): Observable<Entity[]>;
  create(
    data: EntityInput | EntityInput[],
    options?: EntityCreationOptions,
  ): Observable<Entity[]>;
  update(
    id: string,
    data: Partial<Omit<Entity, 'id' | 'createdAt'>>,
  ): Observable<Entity>;
  delete(id: string): Observable<void>;
  search(query: string): Observable<Entity[]>;
}

export const EntityService = new InjectionToken<EntityService>('EntityService');

export interface EntityCreationOptions {
  force?: boolean;
}
