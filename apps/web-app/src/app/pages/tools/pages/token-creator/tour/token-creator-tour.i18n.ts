import { defineI18nBundle } from '@/i18n';

/**
 * i18n bundle for the Token Creator interactive tour.
 *
 * Contains step titles and content for the guided walkthrough
 * of both normal and batch token creation modes.
 */
export const tokenCreatorTourBundle = defineI18nBundle({
  namespace: 'tokenCreatorTour',
  schema: {
    intro: {
      title: { message: '' },
      content: { message: '' },
    },
    preview: {
      title: { message: '' },
      content: { message: '' },
    },
    contentControls: {
      title: { message: '' },
      content: { message: '' },
    },
    batchMode: {
      title: { message: '' },
      content: { message: '' },
    },
    appearance: {
      title: { message: '' },
      content: { message: '' },
    },
    background: {
      title: { message: '' },
      content: { message: '' },
    },
    export: {
      title: { message: '' },
      content: { message: '' },
    },
    outro: {
      title: { message: '' },
      content: { message: '' },
    },
  } as const,
  locales: {
    en: {
      intro: {
        title: 'Welcome to Token Creator!',
        content:
          'This quick tour will show you how to create custom tokens for your TTRPG sessions.\n\nYou can create single tokens or batch export multiple tokens at once.',
      },
      preview: {
        title: 'Live Preview',
        content:
          'See your token update in real-time as you make changes.\n\nThe checkered background shows transparency - perfect for VTT integration.',
      },
      contentControls: {
        title: 'Token Content',
        content:
          'Set your token name and initials here.\n\nToggle options to control what appears on the token: initials, name label, and minion icon.',
      },
      batchMode: {
        title: 'Batch Mode',
        content:
          'Create multiple tokens at once!\n\nUse commas or new lines to separate names.\n\nSpecial syntax:\n• @XX - sets custom initials\n• ! - marks as minion\n\nExample: "Goblin, Orc@OR, Dragon!"',
      },
      appearance: {
        title: 'Appearance Settings',
        content:
          'Customize colors for background, border, and text.\n\nAdjust size, border style, and shadow intensity. Text settings let you control initials and name sizing independently.',
      },
      background: {
        title: 'Background Image',
        content:
          'Upload artwork for your token.\n\nDrag the preview to reposition, scroll to zoom.\n\nGreat for using existing token art as a base!',
      },
      export: {
        title: 'Export Options',
        content:
          'Choose your format:\n• PNG - transparency support\n• SVG - infinite scalability\n• WebP - smaller file size\n\nIn batch mode, all tokens export as a ZIP file.',
      },
      outro: {
        title: 'Ready to Create!',
        content:
          "You're all set! Start designing your tokens.\n\nClick the help button anytime to see this tour again.",
      },
    },
  },
});
