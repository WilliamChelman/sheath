import { defineI18nBundle } from '@/i18n';

export const aboutBundle = defineI18nBundle({
  namespace: 'standalone-about',
  schema: {
    pageTitle: { message: '' },
    legal: { message: '' },
    inspirationsTitle: { message: '' },
    inspirationsIntro: { message: '' },
    forgesteelName: { message: '' },
    forgesteelDesc: { message: '' },
    steelcompendiumName: { message: '' },
    steelcompendiumDesc: { message: '' },
    tokenstampName: { message: '' },
    tokenstampDesc: { message: '' },
    licensingTitle: { message: '' },
    licensingIntro: { message: '' },
    phosphoriconsName: { message: '' },
    phosphoriconsLicense: { message: '' },
    twemojiName: { message: '' },
    twemojiLicense: { message: '' },
  } as const,
  locales: {
    en: {
      pageTitle: 'About',
      legal:
        'Sheath is an independent product published under the DRAW STEEL Creator License and is not affiliated with MCDM Productions, LLC. DRAW STEEL \u00A9 2024 MCDM Productions, LLC.',
      inspirationsTitle: 'Inspirations & Thanks',
      inspirationsIntro:
        'Sheath would not exist without the incredible work of these projects and their creators:',
      forgesteelName: 'Forge Steel',
      forgesteelDesc:
        'A hero builder for Draw Steel created by Andy Aiken. An invaluable resource that inspired many features in Sheath.',
      steelcompendiumName: 'Steel Compendium',
      steelcompendiumDesc:
        'A comprehensive suite of parsed data in multiple formats for Draw Steel, maintained by Xentis.',
      tokenstampName: 'Token Stamp',
      tokenstampDesc:
        'A token creation tool by RollAdvantage that makes it easy to create custom tokens for tabletop RPGs.',
      licensingTitle: 'Icon Licensing',
      licensingIntro: 'Sheath uses icons from the following libraries:',
      phosphoriconsName: 'Phosphor Icons',
      phosphoriconsLicense: 'MIT License',
      twemojiName: 'Twitter Twemoji (Favicon)',
      twemojiLicense: 'CC BY 4.0',
    },
  },
});
