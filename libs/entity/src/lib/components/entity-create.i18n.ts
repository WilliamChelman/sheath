import { defineI18nBundle } from '@/i18n';

/**
 * Entity Create Modal i18n bundle.
 */
export const entityCreateBundle = defineI18nBundle({
  namespace: 'entityCreate',
  schema: {
    title: { message: '' },
    typeLabel: { message: '' },
    selectType: { message: '' },
    nameLabel: { message: '' },
    namePlaceholder: { message: '' },
    createButton: { message: '' },
    cancelButton: { message: '' },
  } as const,
  locales: {
    en: {
      title: 'Create New Entity',
      typeLabel: 'Entity Type',
      selectType: 'Select a type...',
      nameLabel: 'Name',
      namePlaceholder: 'Enter entity name...',
      createButton: 'Create',
      cancelButton: 'Cancel',
    },
  },
});
