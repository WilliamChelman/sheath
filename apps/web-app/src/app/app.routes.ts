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
        path: 'features',
        loadComponent: () =>
          import('./pages/features/features.view').then((m) => m.FeaturesView),
      },
      {
        path: 'tools/token-generator',
        loadComponent: () =>
          import('./pages/tools/token-generator/token-generator.view').then(
            (m) => m.TokenGeneratorView,
          ),
      },
    ],
  },
];
