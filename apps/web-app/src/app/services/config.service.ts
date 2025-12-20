import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

interface Config {
  version: string;
  buildDate: string;
}

@Injectable({ providedIn: 'root' })
export class ConfigService {
  config!: Config;
  private readonly http = inject(HttpClient);

  async init(): Promise<void> {
    this.config = await firstValueFrom(this.http.get<Config>('config.json'));
  }
}
