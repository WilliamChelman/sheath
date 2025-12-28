import { defineI18nBundle } from '@/i18n';

/**
 * Compendium List View i18n bundle.
 *
 * Covers the main list view with search, filters, pagination, and sorting.
 * Detail view, edit, delete, and markdown editor have their own bundles.
 */
export const compendiumBundle = defineI18nBundle({
  namespace: 'compendium',
  schema: {
    title: { message: '' },
    subtitle: { message: '' },
    noEntities: { message: '' },
    noEntitiesDescription: { message: '' },
    noEntitiesWithFilters: { message: '' },
    noEntitiesWithFiltersDescription: { message: '' },
    entityCount: { message: '', params: {} as { count: number } },
    searchPlaceholder: { message: '' },
    allTypes: { message: '' },
    loading: { message: '' },
    indexing: { message: '' },
    filters: { message: '' },
    filtersCount: { message: '', params: {} as { count: number } },
    clearFilters: { message: '' },
    clearAllFilters: { message: '' },
    applyFilters: { message: '' },
    showFilters: { message: '' },
    createButton: { message: '' },
    // Pagination aria labels
    pagination: {
      previousPage: { message: '' },
      nextPage: { message: '' },
      goToPage: { message: '', params: {} as { page: number } },
    },
    // Mobile filters aria labels
    mobileFilters: {
      closePanel: { message: '' },
      closeBackdrop: { message: '' },
    },
    // Sort
    sort: {
      label: { message: '' },
      nameAsc: { message: '' },
      nameDesc: { message: '' },
      scoreDesc: { message: '' },
      propertyAsc: { message: '', params: {} as { name: string } },
      propertyDesc: { message: '', params: {} as { name: string } },
      booleanAsc: { message: '', params: {} as { name: string } },
      booleanDesc: { message: '', params: {} as { name: string } },
    },
  } as const,
  locales: {
    en: {
      title: 'Compendium',
      subtitle: 'Browse and discover your collection',
      noEntities: 'No entities found',
      noEntitiesDescription:
        'Select a directory containing markdown files to get started',
      noEntitiesWithFilters: 'No matching entities',
      noEntitiesWithFiltersDescription:
        "Try adjusting your search or filters to find what you're looking for",
      entityCount: '{count} entities',
      searchPlaceholder: 'Search entities...',
      allTypes: 'All Types',
      loading: 'Loading entities...',
      indexing: 'Building search index...',
      filters: 'Filters',
      filtersCount: '{count} active',
      clearFilters: 'Clear',
      clearAllFilters: 'Clear all filters',
      applyFilters: 'Apply filters',
      showFilters: 'Filters',
      createButton: 'Create Entity',
      // Pagination aria labels
      pagination: {
        previousPage: 'Go to previous page',
        nextPage: 'Go to next page',
        goToPage: 'Go to page {page}',
      },
      // Mobile filters aria labels
      mobileFilters: {
        closePanel: 'Close filters panel',
        closeBackdrop: 'Close filters',
      },
      // Sort
      sort: {
        label: 'Sort by',
        nameAsc: 'Name (A-Z)',
        nameDesc: 'Name (Z-A)',
        scoreDesc: 'Score (High to Low)',
        propertyAsc: '{name} (Low to High)',
        propertyDesc: '{name} (High to Low)',
        booleanAsc: '{name} (False to True)',
        booleanDesc: '{name} (True to False)',
      },
    },
  },
});
