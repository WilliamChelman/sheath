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
        path: 'tools/token-generator',
        loadComponent: () =>
          import(
            './pages/tools/pages/token-generator/token-generator.view'
          ).then((m) => m.TokenGeneratorView),
      },
      {
        path: 'compendium',
        loadChildren: () =>
          import('./pages/compendium/compendium.routes').then(
            (m) => m.compendiumRoutes
          ),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./pages/not-found/not-found.view').then(
            (m) => m.NotFoundView
          ),
      },
    ],
  },
];
