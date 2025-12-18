import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TokenPreviewComponent } from './token-preview.component';
import {
  BackgroundImage,
  DEFAULT_TOKEN_CONFIG,
  TokenConfig,
} from '../models/token.model';

// Mock PointerEvent for JSDOM which doesn't support it
class MockPointerEvent extends MouseEvent {
  pointerId: number;

  constructor(
    type: string,
    init: PointerEventInit & { pointerId?: number } = {},
  ) {
    super(type, init);
    this.pointerId = init.pointerId ?? 0;
  }
}

// Polyfill for test environment
if (typeof PointerEvent === 'undefined') {
  (
    globalThis as unknown as { PointerEvent: typeof MockPointerEvent }
  ).PointerEvent = MockPointerEvent;
}

// Wrapper component to provide required input
@Component({
  imports: [TokenPreviewComponent],
  template: `
    <app-token-preview
      [config]="config"
      (backgroundImageChange)="onBackgroundImageChange($event)"
    />
  `,
})
class TestHostComponent {
  config: TokenConfig = {
    ...DEFAULT_TOKEN_CONFIG,
    backgroundImage: {
      dataUrl: 'data:image/png;base64,test',
      opacity: 1,
      panX: 0,
      panY: 0,
      zoom: 1,
    },
  };
  lastBackgroundImageChange: BackgroundImage | null = null;

  onBackgroundImageChange(bg: BackgroundImage) {
    this.lastBackgroundImageChange = bg;
  }
}

describe('TokenPreviewComponent', () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let svgElement: SVGSVGElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    svgElement = fixture.nativeElement.querySelector('svg');
  });

  it('should create', () => {
    expect(svgElement).toBeTruthy();
  });

  it('should render background image when config has backgroundImage', () => {
    const imageElement = svgElement.querySelector('image');
    expect(imageElement).toBeTruthy();
    expect(imageElement?.getAttribute('href')).toBe(
      'data:image/png;base64,test',
    );
  });

  it('should not render background image when config has no backgroundImage', () => {
    hostComponent.config = {
      ...DEFAULT_TOKEN_CONFIG,
      backgroundImage: undefined,
    };
    fixture.detectChanges();

    const imageElement = svgElement.querySelector('image');
    expect(imageElement).toBeFalsy();
  });

  describe('drag-to-pan interaction', () => {
    it('should emit backgroundImageChange with updated pan on pointer drag', () => {
      // Simulate pointer down
      const pointerDownEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });
      svgElement.dispatchEvent(pointerDownEvent);

      // Simulate pointer move (drag)
      const pointerMoveEvent = new PointerEvent('pointermove', {
        clientX: 150,
        clientY: 120,
        pointerId: 1,
      });
      svgElement.dispatchEvent(pointerMoveEvent);

      // Should have emitted a change
      expect(hostComponent.lastBackgroundImageChange).toBeTruthy();
      expect(hostComponent.lastBackgroundImageChange?.panX).not.toBe(0);
      expect(hostComponent.lastBackgroundImageChange?.panY).not.toBe(0);
    });

    it('should not emit when no backgroundImage exists', () => {
      hostComponent.config = {
        ...DEFAULT_TOKEN_CONFIG,
        backgroundImage: undefined,
      };
      fixture.detectChanges();

      const pointerDownEvent = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        pointerId: 1,
      });
      svgElement.dispatchEvent(pointerDownEvent);

      const pointerMoveEvent = new PointerEvent('pointermove', {
        clientX: 150,
        clientY: 120,
        pointerId: 1,
      });
      svgElement.dispatchEvent(pointerMoveEvent);

      expect(hostComponent.lastBackgroundImageChange).toBeNull();
    });
  });

  describe('wheel-to-zoom interaction', () => {
    it('should emit backgroundImageChange with increased zoom on wheel up', () => {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: -100, // Scroll up = zoom in
      });
      svgElement.dispatchEvent(wheelEvent);

      expect(hostComponent.lastBackgroundImageChange).toBeTruthy();
      expect(hostComponent.lastBackgroundImageChange?.zoom).toBeGreaterThan(1);
    });

    it('should emit backgroundImageChange with decreased zoom on wheel down', () => {
      const wheelEvent = new WheelEvent('wheel', {
        deltaY: 100, // Scroll down = zoom out
      });
      svgElement.dispatchEvent(wheelEvent);

      expect(hostComponent.lastBackgroundImageChange).toBeTruthy();
      expect(hostComponent.lastBackgroundImageChange?.zoom).toBeLessThan(1);
    });

    it('should clamp zoom to min value', () => {
      // Set zoom to near minimum
      hostComponent.config = {
        ...hostComponent.config,
        backgroundImage: {
          ...hostComponent.config.backgroundImage!,
          zoom: 0.3,
        },
      };
      fixture.detectChanges();

      // Zoom out multiple times
      for (let i = 0; i < 10; i++) {
        const wheelEvent = new WheelEvent('wheel', { deltaY: 100 });
        svgElement.dispatchEvent(wheelEvent);
      }

      expect(
        hostComponent.lastBackgroundImageChange?.zoom,
      ).toBeGreaterThanOrEqual(0.25);
    });

    it('should clamp zoom to max value', () => {
      // Set zoom to near maximum
      hostComponent.config = {
        ...hostComponent.config,
        backgroundImage: {
          ...hostComponent.config.backgroundImage!,
          zoom: 4.5,
        },
      };
      fixture.detectChanges();

      // Zoom in multiple times
      for (let i = 0; i < 10; i++) {
        const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
        svgElement.dispatchEvent(wheelEvent);
      }

      expect(hostComponent.lastBackgroundImageChange?.zoom).toBeLessThanOrEqual(
        5,
      );
    });

    it('should not emit when no backgroundImage exists', () => {
      hostComponent.config = {
        ...DEFAULT_TOKEN_CONFIG,
        backgroundImage: undefined,
      };
      fixture.detectChanges();

      const wheelEvent = new WheelEvent('wheel', { deltaY: -100 });
      svgElement.dispatchEvent(wheelEvent);

      expect(hostComponent.lastBackgroundImageChange).toBeNull();
    });
  });
});
