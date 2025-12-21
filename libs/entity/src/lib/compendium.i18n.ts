import { defineI18nBundle } from '@/i18n';

export const compendiumBundle = defineI18nBundle({
  namespace: 'compendium',
  schema: {
    title: { message: '' },
    noEntities: { message: '' },
    noEntitiesDescription: { message: '' },
    entityCount: { message: '', params: {} as { count: number } },
    searchPlaceholder: { message: '' },
    allTypes: { message: '' },
    loading: { message: '' },
    indexing: { message: '' },
    filters: { message: '' },
    clearFilters: { message: '' },
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
    // Detail view
    detail: {
      backToList: { message: '' },
      loading: { message: '' },
      notFound: { message: '' },
      notFoundDescription: { message: '' },
      tableOfContents: { message: '' },
      searchPlaceholder: { message: '' },
      searchClear: { message: '' },
      searchNoResults: { message: '' },
    },
    // Edit mode
    edit: {
      editButton: { message: '' },
      saveButton: { message: '' },
      cancelButton: { message: '' },
      saveSuccess: { message: '' },
      saveError: { message: '' },
      coreFields: { message: '' },
      nameLabel: { message: '' },
      typeLabel: { message: '' },
      descriptionLabel: { message: '' },
      tagsLabel: { message: '' },
      tagsPlaceholder: { message: '' },
      propertiesSection: { message: '' },
      contentSection: { message: '' },
      contentLabel: { message: '' },
    },
    // Delete
    delete: {
      button: { message: '' },
      confirmTitle: { message: '' },
      confirmMessage: { message: '', params: {} as { name: string } },
      confirmButton: { message: '' },
      cancelButton: { message: '' },
      success: { message: '' },
      error: { message: '' },
    },
    // Editor modes
    editor: {
      livePreview: { message: '' },
      splitView: { message: '' },
      toggleToc: { message: '' },
      placeholder: { message: '' },
      noHeadings: { message: '' },
      previewPlaceholder: { message: '' },
    },
    // Floating toolbar
    toolbar: {
      bold: { message: '' },
      italic: { message: '' },
      heading: { message: '' },
      link: { message: '' },
      code: { message: '' },
      quote: { message: '' },
    },
    // Create modal
    create: {
      button: { message: '' },
      title: { message: '' },
      typeLabel: { message: '' },
      selectType: { message: '' },
      nameLabel: { message: '' },
      namePlaceholder: { message: '' },
      createButton: { message: '' },
      cancelButton: { message: '' },
    },
  } as const,
  locales: {
    en: {
      title: 'Compendium',
      noEntities: 'No entities found',
      noEntitiesDescription:
        'Select a directory containing markdown files to get started',
      entityCount: '{count} entities',
      searchPlaceholder: 'Search entities...',
      allTypes: 'All Types',
      loading: 'Loading entities...',
      indexing: 'Building search index...',
      filters: 'Filters',
      clearFilters: 'Clear filters',
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
      // Detail view
      detail: {
        backToList: 'Back to list',
        loading: 'Loading...',
        notFound: 'Entity not found',
        notFoundDescription:
          "The entity you're looking for doesn't exist or hasn't been loaded",
        tableOfContents: 'Contents',
        searchPlaceholder: 'Search in document...',
        searchClear: 'Clear search',
        searchNoResults: 'No matching sections',
      },
      // Edit mode
      edit: {
        editButton: 'Edit',
        saveButton: 'Save Changes',
        cancelButton: 'Cancel',
        saveSuccess: 'Entity saved successfully',
        saveError: 'Failed to save entity',
        coreFields: 'Core Fields',
        nameLabel: 'Name',
        typeLabel: 'Type',
        descriptionLabel: 'Description',
        tagsLabel: 'Tags',
        tagsPlaceholder: 'Add a tag...',
        propertiesSection: 'Properties',
        contentSection: 'Content',
        contentLabel: 'Content (Markdown)',
      },
      // Delete
      delete: {
        button: 'Delete',
        confirmTitle: 'Delete Entity',
        confirmMessage:
          'Are you sure you want to delete "{name}"? This action cannot be undone.',
        confirmButton: 'Delete',
        cancelButton: 'Cancel',
        success: 'Entity deleted successfully',
        error: 'Failed to delete entity',
      },
      // Editor modes
      editor: {
        livePreview: 'Live Preview',
        splitView: 'Split View',
        toggleToc: 'Toggle Table of Contents',
        placeholder: 'Start writing...',
        noHeadings: 'Add headings to see outline...',
        previewPlaceholder: 'Preview will appear here...',
      },
      // Floating toolbar
      toolbar: {
        bold: 'Bold (Ctrl+B)',
        italic: 'Italic (Ctrl+I)',
        heading: 'Heading',
        link: 'Link (Ctrl+K)',
        code: 'Code (Ctrl+`)',
        quote: 'Quote (Ctrl+Shift+.)',
      },
      // Create modal
      create: {
        button: 'Create Entity',
        title: 'Create New Entity',
        typeLabel: 'Entity Type',
        selectType: 'Select a type...',
        nameLabel: 'Name',
        namePlaceholder: 'Enter entity name...',
        createButton: 'Create',
        cancelButton: 'Cancel',
      },
    },
  },
});
