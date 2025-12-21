import { Route } from '@angular/router';
import { EntityInitializerService } from './services/entity-initializer.service';
import { inject } from '@angular/core';

export const compendiumV2Routes: Route[] = [
  {
    path: '',
    providers: [],
    canActivate: [
      async () => {
        const entityInitializerService = inject(EntityInitializerService);
        await entityInitializerService.init();
        return true;
      },
    ],
    children: [
      {
        path: '',
        loadComponent: () => import('@/entity').then((m) => m.CompendiumView),
      },
      {
        path: ':id',
        loadComponent: () =>
          import('@/entity').then((m) => m.CompendiumDetailView),
      },
    ],
  },
];
