import { Component, computed, input, output } from '@angular/core';
import {
  BackgroundImage,
  BORDER_WIDTH_PX,
  TOKEN_SIZE_PX,
  TokenConfig,
} from '../models/token.model';

@Component({
  selector: 'app-token-preview',
  template: `
    <svg
      [attr.width]="sizePx()"
      [attr.height]="sizePx()"
      [attr.viewBox]="viewBox()"
      xmlns="http://www.w3.org/2000/svg"
      [style.cursor]="config().backgroundImage ? 'grab' : 'default'"
      (pointerdown)="onPointerDown($event)"
      (pointermove)="onPointerMove($event)"
      (pointerup)="onPointerUp($event)"
      (pointercancel)="onPointerUp($event)"
      (pointerleave)="onPointerUp($event)"
      (wheel)="onWheel($event)"
    >
      <defs>
        <!-- Gradient for depth effect -->
        <radialGradient
          [attr.id]="'tokenGradient-' + uniqueId"
          cx="30%"
          cy="30%"
          r="70%"
        >
          <stop
            offset="0%"
            [attr.stop-color]="lightenColor(config().backgroundColor, 20)"
          />
          <stop offset="100%" [attr.stop-color]="config().backgroundColor" />
        </radialGradient>

        <!-- Drop shadow filter -->
        <filter
          [attr.id]="'dropShadow-' + uniqueId"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.3" />
        </filter>

        <!-- Text shadow filter (for legibility on any background) -->
        <filter
          [attr.id]="'textShadow-' + uniqueId"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <!-- Tight shadow for crisp edge contrast -->
          <feDropShadow
            dx="0"
            dy="0.6"
            stdDeviation="0.6"
            flood-opacity="0.75"
          />
          <!-- Softer glow to improve legibility on busy images -->
          <feDropShadow
            dx="0"
            dy="1.4"
            stdDeviation="2.2"
            flood-opacity="0.45"
          />
        </filter>

        <!-- Clip path for circular token -->
        <clipPath [attr.id]="'tokenClip-' + uniqueId">
          <circle
            [attr.cx]="center()"
            [attr.cy]="center()"
            [attr.r]="innerRadius()"
          />
        </clipPath>

        <!-- Curved text path for name (bottom) -->
        <path
          [attr.id]="'namePathBottom-' + uniqueId"
          [attr.d]="nameBottomCurvePath()"
          fill="none"
        />
        <!-- Curved text path for name (top) -->
        <path
          [attr.id]="'namePathTop-' + uniqueId"
          [attr.d]="nameTopCurvePath()"
          fill="none"
        />
      </defs>

      <!-- Clipped content group -->
      <g [attr.clip-path]="'url(#tokenClip-' + uniqueId + ')'">
        <!-- Background gradient circle -->
        <circle
          [attr.cx]="center()"
          [attr.cy]="center()"
          [attr.r]="innerRadius()"
          [attr.fill]="'url(#tokenGradient-' + uniqueId + ')'"
        />

        <!-- Background image (over gradient) -->
        @if (config().backgroundImage) {
          <image
            [attr.href]="config().backgroundImage!.dataUrl"
            [attr.x]="imageX()"
            [attr.y]="imageY()"
            [attr.width]="imageSize()"
            [attr.height]="imageSize()"
            [attr.opacity]="config().backgroundImage!.opacity"
            preserveAspectRatio="xMidYMid slice"
          />
        }
      </g>

      <!-- Border circle (outside clip so stroke is visible) -->
      <circle
        [attr.cx]="center()"
        [attr.cy]="center()"
        [attr.r]="innerRadius()"
        fill="none"
        [attr.stroke]="config().borderColor"
        [attr.stroke-width]="borderWidthPx()"
        [attr.filter]="'url(#dropShadow-' + uniqueId + ')'"
      />

      <!-- Initials in center -->
      @if (config().showInitials) {
        <text
          [attr.x]="center()"
          [attr.y]="initialsY()"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="white"
          [attr.font-size]="initialsFontSize()"
          font-weight="bold"
          font-family="system-ui, -apple-system, sans-serif"
          [attr.filter]="'url(#textShadow-' + uniqueId + ')'"
        >
          {{ config().initials }}
        </text>
      }

      <!-- Name curved along top or bottom -->
      @if (config().showName && config().name) {
        <text
          fill="white"
          [attr.font-size]="nameFontSize()"
          font-family="system-ui, -apple-system, sans-serif"
          [attr.filter]="'url(#textShadow-' + uniqueId + ')'"
        >
          <textPath
            [attr.href]="namePathHref()"
            startOffset="50%"
            text-anchor="middle"
          >
            {{ config().name }}
          </textPath>
        </text>
      }
    </svg>
  `,
})
export class TokenPreviewComponent {
  config = input.required<TokenConfig>();
  backgroundImageChange = output<BackgroundImage>();

  uniqueId = Math.random().toString(36).substring(2, 9);

  // Drag state
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartPanX = 0;
  private dragStartPanY = 0;

  sizePx = computed(() => TOKEN_SIZE_PX[this.config().size]);
  borderWidthPx = computed(() => BORDER_WIDTH_PX[this.config().borderWidth]);
  center = computed(() => this.sizePx() / 2);
  innerRadius = computed(() => (this.sizePx() - this.borderWidthPx()) / 2 - 1);
  viewBox = computed(() => `0 0 ${this.sizePx()} ${this.sizePx()}`);

  // Background image computed properties
  imageSize = computed(() => {
    const bg = this.config().backgroundImage;
    if (!bg) return 0;
    // Base size covers the token diameter, then apply zoom
    return this.sizePx() * bg.zoom;
  });

  imageX = computed(() => {
    const bg = this.config().backgroundImage;
    if (!bg) return 0;
    const size = this.imageSize();
    // Center the image, then apply normalized pan offset
    const baseX = (this.sizePx() - size) / 2;
    // panX is normalized: -1 to 1 maps to ±sizePx/2
    const panOffset = bg.panX * (this.sizePx() / 2);
    return baseX + panOffset;
  });

  imageY = computed(() => {
    const bg = this.config().backgroundImage;
    if (!bg) return 0;
    const size = this.imageSize();
    // Center the image, then apply normalized pan offset
    const baseY = (this.sizePx() - size) / 2;
    // panY is normalized: -1 to 1 maps to ±sizePx/2
    const panOffset = bg.panY * (this.sizePx() / 2);
    return baseY + panOffset;
  });

  initialsFontSize = computed(() => this.sizePx() * 0.35);
  nameFontSize = computed(() => this.sizePx() * 0.1);

  initialsY = computed(() => {
    const size = this.sizePx();
    return size * 0.45;
  });

  nameBottomCurvePath = computed(() => {
    const center = this.center();
    const radius = this.innerRadius() * 0.75;
    // Arc across the bottom: from lower-left (150°) to lower-right (30°)
    // sin > 0 for these angles = below center in SVG
    const startAngle = 150;
    const endAngle = 30;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    // Sweep counter-clockwise (0) to go through the bottom (90°)
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 0 ${x2} ${y2}`;
  });

  nameTopCurvePath = computed(() => {
    const center = this.center();
    const radius = this.innerRadius() * 0.75;
    // Arc across the top: from upper-left (210°) to upper-right (330°)
    // sin < 0 for these angles = above center in SVG
    const startAngle = 210;
    const endAngle = 330;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    // Sweep clockwise (1) to go through the top (270°)
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  });

  namePathHref = computed(() => {
    const position = this.config().namePosition;
    return position === 'top'
      ? `#namePathTop-${this.uniqueId}`
      : `#namePathBottom-${this.uniqueId}`;
  });

  lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
    const B = Math.min(255, (num & 0x0000ff) + amt);
    return `#${((1 << 24) | (R << 16) | (G << 8) | B).toString(16).slice(1)}`;
  }

  // Pointer event handlers for drag-to-pan
  onPointerDown(event: PointerEvent): void {
    const bg = this.config().backgroundImage;
    if (!bg) return;

    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartPanX = bg.panX;
    this.dragStartPanY = bg.panY;

    // Capture pointer for smooth dragging even outside element
    const target = event.target as Element;
    if (target.setPointerCapture) {
      target.setPointerCapture(event.pointerId);
    }
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging) return;

    const bg = this.config().backgroundImage;
    if (!bg) return;

    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    // Convert pixel delta to normalized pan offset
    // Divide by (sizePx/2) to normalize, since panX/Y range is roughly -1 to 1
    const normalizedDeltaX = deltaX / (this.sizePx() / 2);
    const normalizedDeltaY = deltaY / (this.sizePx() / 2);

    const newPanX = this.clamp(this.dragStartPanX + normalizedDeltaX, -2, 2);
    const newPanY = this.clamp(this.dragStartPanY + normalizedDeltaY, -2, 2);

    this.backgroundImageChange.emit({
      ...bg,
      panX: newPanX,
      panY: newPanY,
    });
  }

  onPointerUp(event: PointerEvent): void {
    if (this.isDragging) {
      this.isDragging = false;
      const target = event.target as Element;
      if (target.releasePointerCapture) {
        target.releasePointerCapture(event.pointerId);
      }
    }
  }

  // Wheel event handler for zoom
  onWheel(event: WheelEvent): void {
    const bg = this.config().backgroundImage;
    if (!bg) return;

    event.preventDefault();

    // Zoom factor: scroll up = zoom in, scroll down = zoom out
    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = this.clamp(bg.zoom * zoomFactor, 0.25, 5);

    this.backgroundImageChange.emit({
      ...bg,
      zoom: newZoom,
    });
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
