import { computed, Injectable, signal } from '@angular/core';
import { TourConfig, TourState, TourStep } from './tour.types';

/**
 * Service managing the state of interactive tours.
 *
 * Provides signal-based reactive state for tracking active tours,
 * current step, and navigation.
 */
@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly _activeTour = signal<TourConfig | null>(null);
  private readonly _currentStepIndex = signal(0);

  /** The currently active tour configuration, or null if no tour is active */
  readonly activeTour = this._activeTour.asReadonly();

  /** Index of the current step in the active tour */
  readonly currentStepIndex = this._currentStepIndex.asReadonly();

  /** Whether a tour is currently active */
  readonly isActive = computed(() => this._activeTour() !== null);

  /** The current step definition, or null if no tour is active */
  readonly currentStep = computed<TourStep | null>(() => {
    const tour = this._activeTour();
    const index = this._currentStepIndex();
    return tour?.steps[index] ?? null;
  });

  /** Current tour state, or null if no tour is active */
  readonly state = computed<TourState | null>(() => {
    const tour = this._activeTour();
    if (!tour) return null;
    return {
      tourId: tour.id,
      currentStepIndex: this._currentStepIndex(),
      totalSteps: tour.steps.length,
    };
  });

  /** Whether navigation to previous step is possible */
  readonly canGoPrevious = computed(() => {
    const tour = this._activeTour();
    const index = this._currentStepIndex();
    return tour !== null && index > 0;
  });

  /** Whether navigation to next step is possible */
  readonly canGoNext = computed(() => {
    const tour = this._activeTour();
    const index = this._currentStepIndex();
    return tour !== null && index < tour.steps.length - 1;
  });

  /**
   * Start a tour with the given configuration.
   * If a tour is already active, it will be replaced.
   */
  start(config: TourConfig): void {
    this._activeTour.set(config);
    this._currentStepIndex.set(0);
  }

  /**
   * Navigate to the next step.
   * Does nothing if already at the last step or no tour is active.
   */
  next(): void {
    const tour = this._activeTour();
    if (!tour) return;

    const currentIndex = this._currentStepIndex();
    if (currentIndex < tour.steps.length - 1) {
      this._currentStepIndex.set(currentIndex + 1);
    }
  }

  /**
   * Navigate to the previous step.
   * Does nothing if already at the first step or no tour is active.
   */
  previous(): void {
    if (!this._activeTour()) return;

    const currentIndex = this._currentStepIndex();
    if (currentIndex > 0) {
      this._currentStepIndex.set(currentIndex - 1);
    }
  }

  /**
   * Navigate to a specific step by index.
   * Does nothing if the index is out of bounds or no tour is active.
   */
  goToStep(index: number): void {
    const tour = this._activeTour();
    if (!tour) return;

    if (index >= 0 && index < tour.steps.length) {
      this._currentStepIndex.set(index);
    }
  }

  /**
   * Close the current tour.
   */
  close(): void {
    this._activeTour.set(null);
    this._currentStepIndex.set(0);
  }
}
