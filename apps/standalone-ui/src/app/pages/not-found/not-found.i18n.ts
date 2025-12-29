import { defineI18nBundle } from '@/i18n';

export const notFoundBundle = defineI18nBundle({
  namespace: 'standalone-notFound',
  schema: {
    badge: { message: '' },
    title: { message: '' },
    subtitle: { message: '' },
    actions: {
      goHome: { message: '' },
      browseTools: { message: '' },
    },
  } as const,
  locales: {
    en: {
      badge: '404',
      title: 'Page not found',
      subtitle: "The page you're looking for doesn't exist (or may have moved).",
      actions: {
        goHome: 'Go home',
        browseTools: 'Browse tools',
      },
    },
  },
});
