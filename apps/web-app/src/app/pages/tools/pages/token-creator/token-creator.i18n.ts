import { defineI18nBundle } from '@/i18n';

/**
 * Token Creator i18n bundle.
 *
 * Covers the token creator view + its controls.
 */
export const tokenCreatorBundle = defineI18nBundle({
  namespace: 'tokenCreator',
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
        inspiration: { message: '' },
      },
    },
    appearance: {
      title: { message: '' },
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
      shadowIntensity: { label: { message: '' } },
      borderStyle: { label: { message: '' } },
      toggles: {
        showInitials: { message: '' },
        showName: { message: '' },
        showMinionIcon: { message: '' },
      },
      namePosition: { label: { message: '' } },
      minionIconPosition: { label: { message: '' } },
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
    batch: {
      title: { message: '' },
      inputLabel: { message: '' },
      placeholder: { message: '' },
      hint: { message: '' },
      exportButton: {
        message: '',
        params: {} as { count: number },
      },
      exporting: { message: '' },
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
        bottomFlat: { message: '' },
      },
      minionIconPositions: {
        topLeft: { message: '' },
        topRight: { message: '' },
        bottomLeft: { message: '' },
        bottomRight: { message: '' },
      },
      shadowIntensities: {
        none: { message: '' },
        subtle: { message: '' },
        medium: { message: '' },
        strong: { message: '' },
        dramatic: { message: '' },
      },
      borderStyles: {
        solid: { message: '' },
        metallic: { message: '' },
      },
    },
  } as const,
  locales: {
    en: {
      header: {
        badge: 'Token Creator',
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
          inspiration:
            'A good use case is to load existing tokens, for examples the ones from Max_HammGet, remove the border and the initials, and set the token name, and maybe the minion icon.',
        },
      },
      appearance: {
        title: 'Appearance',
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
        shadowIntensity: { label: 'Shadow Intensity' },
        borderStyle: { label: 'Border Style' },
        toggles: {
          showInitials: 'Show initials',
          showName: 'Show name on token',
          showMinionIcon: 'Show minion icon',
        },
        namePosition: { label: 'Name Position' },
        minionIconPosition: { label: 'Icon Position' },
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
      batch: {
        title: 'Batch Export',
        inputLabel: 'Token Names',
        placeholder: 'Goblin, Orc, Dragon!, Zombie!',
        hint: 'Comma-separated names. Add ! for minions.',
        exportButton: '📦 Download {count} Tokens (ZIP)',
        exporting: 'Exporting...',
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
          bottomFlat: 'Bottom Flat',
        },
        minionIconPositions: {
          topLeft: '↖',
          topRight: '↗',
          bottomLeft: '↙',
          bottomRight: '↘',
        },
        shadowIntensities: {
          none: 'None',
          subtle: 'Subtle',
          medium: 'Medium',
          strong: 'Strong',
          dramatic: 'Dramatic',
        },
        borderStyles: {
          solid: 'Solid',
          metallic: 'Metallic',
        },
      },
    },
  },
});
