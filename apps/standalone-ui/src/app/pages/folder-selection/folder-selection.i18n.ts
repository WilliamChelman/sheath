import { defineI18nBundle } from '@/i18n';

export const folderSelectionBundle = defineI18nBundle({
  namespace: 'standalone-folder-selection',
  schema: {
    pageTitle: { message: '' },
    title: { message: '' },
    description: { message: '' },
    selectButton: { message: '' },
    continueButton: { message: '' },
    currentFolder: { message: '' },
    noFolderSelected: { message: '' },
    hint: { message: '' },
  } as const,
  locales: {
    en: {
      pageTitle: 'Select Folder',
      title: 'Select Entity Folder',
      description:
        'Choose a folder containing your entity markdown files. Sheath will scan this folder recursively for .md files with YAML frontmatter.',
      selectButton: 'Select Folder',
      continueButton: 'Continue',
      currentFolder: 'Selected folder:',
      noFolderSelected: 'No folder selected',
      hint: 'Tip: You can use the dist/data/data-md folder from the Sheath repository as a starting point.',
    },
  },
});
