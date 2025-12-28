import { defineI18nBundle } from '@/i18n';

/**
 * Board Editor i18n bundle.
 *
 * Covers board editing, cell editing, and entity editor operations.
 */
export const boardEditorBundle = defineI18nBundle({
  namespace: 'boardEditor',
  schema: {
    editBoard: { message: '' },
    addColumn: { message: '' },
    removeColumn: { message: '' },
    addRow: { message: '' },
    removeRow: { message: '' },
    editCell: { message: '' },
    deleteCell: { message: '' },
    entityReference: { message: '' },
    entityReferencePlaceholder: { message: '' },
    entityReferenceHint: { message: '' },
    content: { message: '' },
    contentPlaceholder: { message: '' },
    contentHint: { message: '' },
    preview: { message: '' },
    save: { message: '' },
    cancel: { message: '' },
  } as const,
  locales: {
    en: {
      editBoard: 'Edit Board',
      addColumn: 'Add Column',
      removeColumn: 'Remove Column',
      addRow: 'Add Row',
      removeRow: 'Remove Row',
      editCell: 'Edit Cell',
      deleteCell: 'Delete Cell',
      entityReference: 'Entity Reference',
      entityReferencePlaceholder: 'Entity ID (e.g., monster-goblin)',
      entityReferenceHint: 'Enter the ID of an entity to reference',
      content: 'Content (Markdown)',
      contentPlaceholder: 'Custom markdown content...',
      contentHint: 'Supports markdown formatting',
      preview: 'Preview',
      save: 'Save',
      cancel: 'Cancel',
    },
  },
});
