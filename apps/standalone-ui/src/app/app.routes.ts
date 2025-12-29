import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'select-folder',
    loadComponent: () =>
      import('./pages/folder-selection/folder-selection.view').then(
        (m) => m.FolderSelectionView,
      ),
  },
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
