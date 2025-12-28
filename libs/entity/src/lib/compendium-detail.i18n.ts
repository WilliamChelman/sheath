import { defineI18nBundle } from '@/i18n';

/**
 * Compendium Detail View i18n bundle.
 *
 * Covers detail view, edit mode, and delete functionality.
 */
export const compendiumDetailBundle = defineI18nBundle({
  namespace: 'compendiumDetail',
  schema: {
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
  } as const,
  locales: {
    en: {
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
    },
  },
});
