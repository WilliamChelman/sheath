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
      tableOfContents: { message: '' },
    },
    browse: {
      showingCount: { message: '', params: {} as { count: number; total: number } },
    },
    facets: {
      title: { message: '' },
      clearAll: { message: '' },
      type: { message: '' },
      class: { message: '' },
      level: { message: '' },
      roles: { message: '' },
      source: { message: '' },
      echelon: { message: '' },
      action_type: { message: '' },
      ancestry: { message: '' },
      size: { message: '' },
      feature_type: { message: '' },
      subclass: { message: '' },
      target: { message: '' },
      common_ability_type: { message: '' },
      treasure_type: { message: '' },
      perk_type: { message: '' },
      chapter_num: { message: '' },
      culture_benefit_type: { message: '' },
      dynamic_terrain_type: { message: '' },
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
        tableOfContents: 'Contents',
      },
      browse: {
        showingCount: 'Showing {count} of {total} entries',
      },
      facets: {
        title: 'Filters',
        clearAll: 'Clear all',
        type: 'Type',
        class: 'Class',
        level: 'Level',
        roles: 'Roles',
        source: 'Source',
        echelon: 'Echelon',
        action_type: 'Action Type',
        ancestry: 'Ancestry',
        size: 'Size',
        feature_type: 'Feature Type',
        subclass: 'Subclass',
        target: 'Target',
        common_ability_type: 'Ability Type',
        treasure_type: 'Treasure Type',
        perk_type: 'Perk Type',
        chapter_num: 'Chapter',
        culture_benefit_type: 'Benefit Type',
        dynamic_terrain_type: 'Terrain Type',
      },
    },
  },
});

