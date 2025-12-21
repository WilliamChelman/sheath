import { defineI18nBundle } from '@/i18n';

export const compendiumBundle = defineI18nBundle({
  namespace: 'compendium',
  schema: {
    title: { message: '' },
    subtitle: { message: '' },
    noEntities: { message: '' },
    noEntitiesDescription: { message: '' },
    entityCount: { message: '', params: {} as { count: number } },
    searchPlaceholder: { message: '' },
    allTypes: { message: '' },
    loading: { message: '' },
    indexing: { message: '' },
    filters: { message: '' },
    clearFilters: { message: '' },
    // Detail view
    detail: {
      backToList: { message: '' },
      loading: { message: '' },
      notFound: { message: '' },
      notFoundDescription: { message: '' },
      tableOfContents: { message: '' },
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
      title: 'Compendium V2',
      subtitle: 'Browse your local entity files',
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
      // Detail view
      detail: {
        backToList: 'Back to list',
        loading: 'Loading...',
        notFound: 'Entity not found',
        notFoundDescription:
          "The entity you're looking for doesn't exist or hasn't been loaded",
        tableOfContents: 'Contents',
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
