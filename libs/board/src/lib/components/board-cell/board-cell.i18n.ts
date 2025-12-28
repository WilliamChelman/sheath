import { defineI18nBundle } from '@/i18n';

/**
 * Board Cell i18n bundle.
 *
 * Covers display and span controls for board cells.
 */
export const boardCellBundle = defineI18nBundle({
  namespace: 'boardCell',
  schema: {
    emptyCell: { message: '' },
    expandRowSpan: { message: '' },
    shrinkRowSpan: { message: '' },
    expandColSpan: { message: '' },
    shrinkColSpan: { message: '' },
  } as const,
  locales: {
    en: {
      emptyCell: 'Empty cell',
      expandRowSpan: 'Expand row span',
      shrinkRowSpan: 'Shrink row span',
      expandColSpan: 'Expand column span',
      shrinkColSpan: 'Shrink column span',
    },
  },
});
