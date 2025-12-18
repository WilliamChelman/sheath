import type { Route } from '@angular/router';

export const compendiumRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./compendium.view').then((m) => m.CompendiumView),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./compendium-detail.view').then((m) => m.CompendiumDetailView),
  },
];

