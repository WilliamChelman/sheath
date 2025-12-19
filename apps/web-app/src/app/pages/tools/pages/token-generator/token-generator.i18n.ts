import { defineI18nBundle } from '@/i18n';

/**
 * Token Generator i18n bundle.
 *
 * Covers the token generator view + its controls.
 */
export const tokenGeneratorBundle = defineI18nBundle({
  namespace: 'tokenGenerator',
  schema: {
    header: {
      badge: { message: '' },
      title: { message: '' },
      subtitle: { message: '' },
    },
    preview: {
      livePreview: { message: '' },
      sizeIndicator: {
        // "{sizeLabel} • {sizePx}px"
        message: '',
        params: {} as { sizeLabel: string; sizePx: number },
      },
    },
    tips: {
      title: { message: '' },
      items: {
        png: { message: '' },
        svg: { message: '' },
        webp: { message: '' },
        resolution: { message: '' },
      },
    },
    controls: {
      title: { message: '' },
      reset: {
        label: { message: '' },
        title: { message: '' },
      },
      name: { label: { message: '' }, placeholder: { message: '' } },
      initials: {
        label: { message: '' },
        helperText: { message: '' },
        placeholder: { message: '' },
      },
      colors: {
        background: { message: '' },
        border: { message: '' },
      },
      size: { label: { message: '' } },
      borderWidth: { label: { message: '' } },
      toggles: {
        showInitials: { message: '' },
        showName: { message: '' },
        showMinionIcon: { message: '' },
      },
      namePosition: { label: { message: '' } },
    },
    backgroundImage: {
      title: { message: '' },
      upload: { label: { message: '' } },
      opacity: { label: { message: '' } },
      actions: {
        reset: { message: '' },
        resetTitle: { message: '' },
        remove: { message: '' },
        removeTitle: { message: '' },
      },
      hint: { message: '' },
    },
    export: {
      title: { message: '' },
      format: { label: { message: '' } },
      download: {
        message: '',
        params: {} as { format: string },
      },
    },
    options: {
      sizes: {
        small: { message: '' },
        medium: { message: '' },
        large: { message: '' },
        huge: { message: '' },
      },
      borderWidths: {
        none: { message: '' },
        thin: { message: '' },
        medium: { message: '' },
        thick: { message: '' },
      },
      namePositions: {
        top: { message: '' },
        bottom: { message: '' },
      },
    },
  } as const,
  locales: {
    en: {
      header: {
        badge: 'Token Generator',
        title: 'Token Creator',
        subtitle:
          'Design custom tokens for your TTRPG sessions. Customize colors, size, and text, then export in your preferred format.',
      },
      preview: {
        livePreview: 'Live Preview',
        sizeIndicator: '{sizeLabel} • {sizePx}px',
      },
      tips: {
        title: 'Tips',
        items: {
          png: 'Use PNG for tokens with transparency',
          svg: 'Use SVG for infinite scalability',
          webp: 'Use WebP for smaller file sizes with good quality',
          resolution:
            'Tokens export at 2x resolution for crisp display on high-DPI screens',
        },
      },
      controls: {
        title: 'Token Configuration',
        reset: {
          label: '↺ Reset',
          title: 'Reset all options to defaults',
        },
        name: { label: 'Token Name', placeholder: 'Enter name' },
        initials: {
          label: 'Initials',
          helperText: 'Auto-generated from name',
          placeholder: 'GB',
        },
        colors: {
          background: 'Background',
          border: 'Border',
        },
        size: { label: 'Token Size' },
        borderWidth: { label: 'Border Width' },
        toggles: {
          showInitials: 'Show initials',
          showName: 'Show name on token',
          showMinionIcon: 'Show minion icon',
        },
        namePosition: { label: 'Name Position' },
      },
      backgroundImage: {
        title: 'Background Image',
        upload: { label: 'Upload Image' },
        opacity: { label: 'Opacity' },
        actions: {
          reset: '🔄 Reset View',
          resetTitle: 'Reset pan and zoom',
          remove: '🗑️ Remove',
          removeTitle: 'Remove background image',
        },
        hint: 'Drag the preview to reposition. Scroll to zoom in/out.',
      },
      export: {
        title: 'Export Token',
        format: { label: 'Format' },
        download: '📥 Download {format}',
      },
      options: {
        sizes: {
          small: 'Small',
          medium: 'Medium',
          large: 'Large',
          huge: 'Huge',
        },
        borderWidths: {
          none: 'None',
          thin: 'Thin',
          medium: 'Medium',
          thick: 'Thick',
        },
        namePositions: {
          top: 'Top',
          bottom: 'Bottom',
        },
      },
    },
  },
});
