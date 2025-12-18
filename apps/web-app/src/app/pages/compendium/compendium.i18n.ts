import { defineI18nBundle } from '@/i18n';

/**
 * Compendium feature i18n bundle.
 */
export const compendiumBundle = defineI18nBundle({
  namespace: 'compendium',
  schema: {
    title: { message: '' },
    search: {
      placeholder: { message: '' },
      noResults: { message: '' },
      resultsCount: { message: '', params: {} as { count: number } },
      loading: { message: '' },
      error: { message: '' },
    },
    detail: {
      backToSearch: { message: '' },
      notFound: { message: '' },
      category: { message: '' },
      source: { message: '' },
    },
    browse: {
      showingCount: { message: '', params: {} as { count: number; total: number } },
    },
  } as const,
  locales: {
    en: {
      title: 'Compendium',
      search: {
        placeholder: 'Search the compendium...',
        noResults: 'No results found. Try a different search term.',
        resultsCount: '{count, plural, =0 {No results} one {# result} other {# results}}',
        loading: 'Loading compendium...',
        error: 'Failed to load compendium data. Please try again.',
      },
      detail: {
        backToSearch: 'Back to Search',
        notFound: 'Entry not found',
        category: 'Category',
        source: 'Source',
      },
      browse: {
        showingCount: 'Showing {count} of {total} entries',
      },
    },
  },
});

