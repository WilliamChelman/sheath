import { EntityService } from '@/entity';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface DataMdFile {
  hash: string;
  entities: Array<Record<string, unknown>>;
}

const HASH_STORAGE_KEY = 'sheath.data-md.hash';

@Injectable({ providedIn: 'root' })
export class EntityInitializerService {
  readonly #entityService = inject(EntityService);
  readonly #http = inject(HttpClient);

  async init(): Promise<void> {
    const data = await firstValueFrom(
      this.#http.get<DataMdFile>('data/data-md.json'),
    );

    const storedHash = localStorage.getItem(HASH_STORAGE_KEY);
    if (storedHash === data.hash) {
      console.log('Data MD hash is the same, skipping initialization');
      return;
    }

    await firstValueFrom(
      this.#entityService.create(data.entities, { force: true }),
    );

    localStorage.setItem(HASH_STORAGE_KEY, data.hash);
  }
}
