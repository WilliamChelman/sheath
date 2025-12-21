import { defineI18nBundle } from '@/i18n';

export const commandPaletteBundle = defineI18nBundle({
  namespace: 'command-palette',
  schema: {
    openButton: { message: '' },
    searchLabel: { message: '' },
    searchPlaceholder: { message: '' },
    noResults: { message: '', params: {} as { query: string } },
    emptyState: { message: '' },
    hints: {
      navigate: { message: '' },
      select: { message: '' },
      close: { message: '' },
    },
  } as const,
  locales: {
    en: {
      openButton: 'Open command palette (Ctrl+K)',
      searchLabel: 'Search...',
      searchPlaceholder: 'Search commands...',
      noResults: 'No results found for "{query}"',
      emptyState: 'Start typing to search commands...',
      hints: {
        navigate: 'to navigate',
        select: 'to select',
        close: 'to close',
      },
    },
  },
});
