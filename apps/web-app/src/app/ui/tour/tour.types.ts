/**
 * Position where the tooltip should appear relative to the highlighted element.
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/**
 * Definition of a single tour step.
 */
export interface TourStep {
  /** Unique identifier for this step */
  readonly id: string;

  /** CSS selector to highlight. Use 'none' for intro/outro steps with no highlight */
  readonly target: string | 'none';

  /** i18n key for the step title */
  readonly titleKey: string;

  /** i18n key for the step content */
  readonly contentKey: string;

  /** Preferred tooltip position relative to target element */
  readonly position?: TooltipPosition;
}

/**
 * Configuration for a tour.
 */
export interface TourConfig<TBundle = unknown> {
  /** Unique tour identifier */
  readonly id: string;

  /** Ordered list of steps */
  readonly steps: readonly TourStep[];

  /** i18n bundle containing step titles and content */
  readonly bundle: TBundle;

  /** Whether to show step indicators (1/5, 2/5, etc.) */
  readonly showStepIndicator?: boolean;
}

/**
 * Current state of an active tour.
 */
export interface TourState {
  readonly tourId: string;
  readonly currentStepIndex: number;
  readonly totalSteps: number;
}
