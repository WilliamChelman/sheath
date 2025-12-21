import { Component, computed, input } from '@angular/core';

/**
 * Spotlight component that creates a dark overlay with a transparent
 * "hole" to highlight a specific element.
 *
 * Uses SVG masking for smooth rounded corners and transitions.
 */
@Component({
  selector: 'app-tour-spotlight',
  template: `
    <svg
      class="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300"
      [attr.viewBox]="viewBox()"
      preserveAspectRatio="none"
    >
      <defs>
        <mask id="spotlight-mask">
          <!-- White background = visible overlay -->
          <rect width="100%" height="100%" fill="white" />
          <!-- Black rectangle = transparent hole -->
          @if (hasTarget()) {
            <rect
              [attr.x]="cutoutX()"
              [attr.y]="cutoutY()"
              [attr.width]="cutoutWidth()"
              [attr.height]="cutoutHeight()"
              [attr.rx]="8"
              fill="black"
            />
          }
        </mask>
      </defs>
      <!-- Semi-transparent overlay with mask applied -->
      <rect
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.6)"
        mask="url(#spotlight-mask)"
        class="backdrop-blur-sm"
      />
    </svg>
  `,
  host: {
    class: 'contents',
  },
})
export class TourSpotlightComponent {
  /** Target element's bounding rect, or null for no spotlight cutout */
  targetRect = input<DOMRect | null>(null);

  /** Padding around the highlighted element */
  private readonly padding = 12;

  protected hasTarget = computed(() => this.targetRect() !== null);

  protected viewBox = computed(() => {
    return `0 0 ${window.innerWidth} ${window.innerHeight}`;
  });

  protected cutoutX = computed(() => {
    const rect = this.targetRect();
    return rect ? rect.left - this.padding : 0;
  });

  protected cutoutY = computed(() => {
    const rect = this.targetRect();
    return rect ? rect.top - this.padding : 0;
  });

  protected cutoutWidth = computed(() => {
    const rect = this.targetRect();
    return rect ? rect.width + this.padding * 2 : 0;
  });

  protected cutoutHeight = computed(() => {
    const rect = this.targetRect();
    return rect ? rect.height + this.padding * 2 : 0;
  });
}
