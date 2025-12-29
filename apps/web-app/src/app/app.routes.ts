import { Route } from '@angular/router';

export const appRoutes: Route[] = [
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
];
