import { Route } from '@angular/router';
import { LayoutComponent } from './common/layout/layout.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.view').then((m) => m.HomeView),
      },
      {
        path: 'about',
        loadComponent: () =>
          import('./pages/about/about.view').then((m) => m.AboutView),
      },
      {
        path: 'tools',
        loadComponent: () =>
          import('./pages/tools/tools.view').then((m) => m.ToolsView),
      },
      {
        path: 'tools/token-creator',
        loadComponent: () =>
          import('./pages/tools/pages/token-creator/token-creator.view').then(
            (m) => m.TokenCreatorView,
          ),
      },
      {
        path: 'compendium',
        loadChildren: () =>
          import('./pages/compendium/compendium.routes').then(
            (m) => m.compendiumV2Routes,
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found.view').then(
            (m) => m.NotFoundView,
          ),
      },
    ],
  },
];
