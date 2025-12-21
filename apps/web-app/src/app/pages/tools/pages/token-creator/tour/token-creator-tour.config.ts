import { TourConfig } from '@/ui/tour';
import { tokenCreatorTourBundle } from './token-creator-tour.i18n';

/**
 * Tour configuration for the Token Creator feature.
 *
 * Guides users through both normal single-token creation
 * and batch mode for creating multiple tokens at once.
 */
export const TOKEN_CREATOR_TOUR_CONFIG: TourConfig<typeof tokenCreatorTourBundle> = {
  id: 'token-creator',
  bundle: tokenCreatorTourBundle,
  showStepIndicator: true,
  steps: [
    // Introduction (no highlight)
    {
      id: 'intro',
      target: 'none',
      titleKey: 'intro.title',
      contentKey: 'intro.content',
    },

    // Step 1: Preview
    {
      id: 'preview',
      target: '[data-tour="token-preview"]',
      titleKey: 'preview.title',
      contentKey: 'preview.content',
      position: 'right',
    },

    // Step 2: Token Content Controls
    {
      id: 'content-controls',
      target: '[data-tour="token-content"]',
      titleKey: 'contentControls.title',
      contentKey: 'contentControls.content',
      position: 'left',
    },

    // Step 3: Batch Mode Demo
    {
      id: 'batch-mode',
      target: '[data-tour="token-name-input"]',
      titleKey: 'batchMode.title',
      contentKey: 'batchMode.content',
      position: 'bottom',
    },

    // Step 4: Appearance Controls
    {
      id: 'appearance',
      target: '[data-tour="token-appearance"]',
      titleKey: 'appearance.title',
      contentKey: 'appearance.content',
      position: 'left',
    },

    // Step 5: Background Controls
    {
      id: 'background',
      target: '[data-tour="token-background"]',
      titleKey: 'background.title',
      contentKey: 'background.content',
      position: 'left',
    },

    // Step 6: Export Controls
    {
      id: 'export',
      target: '[data-tour="token-export"]',
      titleKey: 'export.title',
      contentKey: 'export.content',
      position: 'left',
    },

    // Conclusion (no highlight)
    {
      id: 'outro',
      target: 'none',
      titleKey: 'outro.title',
      contentKey: 'outro.content',
    },
  ],
};
