import { defineI18nBundle } from '@/i18n';

/**
 * Token Appearance Controls i18n bundle.
 *
 * Covers colors, sizes, borders, shadows, and text settings.
 */
export const tokenAppearanceControlsBundle = defineI18nBundle({
  namespace: 'tokenAppearanceControls',
  schema: {
    title: { message: '' },
    colors: {
      background: { message: '' },
      border: { message: '' },
      text: { message: '' },
    },
    size: { label: { message: '' } },
    borderWidth: { label: { message: '' } },
    shadowIntensity: { label: { message: '' } },
    borderStyle: { label: { message: '' } },
    textSettings: { label: { message: '' } },
    initialsSize: { label: { message: '' } },
    nameSize: { label: { message: '' } },
    textShadowIntensity: { label: { message: '' } },
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
      textSizes: {
        small: { message: '' },
        medium: { message: '' },
        large: { message: '' },
        extraLarge: { message: '' },
      },
      textShadowIntensities: {
        none: { message: '' },
        subtle: { message: '' },
        medium: { message: '' },
        strong: { message: '' },
      },
    },
  } as const,
  locales: {
    en: {
      title: 'Appearance',
      colors: {
        background: 'Background',
        border: 'Border',
        text: 'Text',
      },
      size: { label: 'Token Size' },
      borderWidth: { label: 'Border Width' },
      shadowIntensity: { label: 'Shadow Intensity' },
      borderStyle: { label: 'Border Style' },
      textSettings: { label: 'Text Settings' },
      initialsSize: { label: 'Initials Size' },
      nameSize: { label: 'Name Size' },
      textShadowIntensity: { label: 'Text Shadow' },
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
        textSizes: {
          small: 'S',
          medium: 'M',
          large: 'L',
          extraLarge: 'XL',
        },
        textShadowIntensities: {
          none: 'None',
          subtle: 'Subtle',
          medium: 'Medium',
          strong: 'Strong',
        },
      },
    },
  },
});
