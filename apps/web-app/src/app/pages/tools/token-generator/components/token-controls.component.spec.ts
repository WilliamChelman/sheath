import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { TokenControlsComponent } from './token-controls.component';
import { DEFAULT_TOKEN_CONFIG } from '../models/token.model';

describe('TokenControlsComponent', () => {
  let component: TokenControlsComponent;
  let fixture: ComponentFixture<TokenControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TokenControlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TokenControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default config values', () => {
    const config = component.config();
    // Note: initials may be auto-generated from name by an effect
    expect(config.name).toBe(DEFAULT_TOKEN_CONFIG.name);
    expect(config.backgroundColor).toBe(DEFAULT_TOKEN_CONFIG.backgroundColor);
    expect(config.borderColor).toBe(DEFAULT_TOKEN_CONFIG.borderColor);
    expect(config.size).toBe(DEFAULT_TOKEN_CONFIG.size);
  });

  describe('background image upload', () => {
    it('should set backgroundImage on file selection', fakeAsync(() => {
      const mockDataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: vi.fn(),
        onload: null as (() => void) | null,
        result: mockDataUrl,
      };
      vi.spyOn(window, 'FileReader').mockImplementation(
        () => mockFileReader as unknown as FileReader,
      );

      // Create mock file
      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      // Trigger file selection
      component.onBackgroundImageSelected(mockFile);

      // Simulate FileReader onload
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
      mockFileReader.onload?.();
      tick();

      // Verify backgroundImage was set
      const config = component.config();
      expect(config.backgroundImage).toBeDefined();
      expect(config.backgroundImage?.dataUrl).toBe(mockDataUrl);
      expect(config.backgroundImage?.opacity).toBe(1);
      expect(config.backgroundImage?.panX).toBe(0);
      expect(config.backgroundImage?.panY).toBe(0);
      expect(config.backgroundImage?.zoom).toBe(1);
    }));

    it('should remove backgroundImage when removeImage is called', () => {
      // First set a background image
      component.updateConfig({
        backgroundImage: {
          dataUrl: 'data:image/png;base64,test',
          opacity: 1,
          panX: 0,
          panY: 0,
          zoom: 1,
        },
      });
      expect(component.config().backgroundImage).toBeDefined();

      // Remove it
      component.removeImage();
      expect(component.config().backgroundImage).toBeUndefined();
    });

    it('should reset position and zoom but keep image when resetImagePosition is called', () => {
      // Set a background image with modified pan/zoom
      component.updateConfig({
        backgroundImage: {
          dataUrl: 'data:image/png;base64,test',
          opacity: 0.5,
          panX: 0.5,
          panY: -0.3,
          zoom: 2,
        },
      });

      // Reset position
      component.resetImagePosition();

      const bg = component.config().backgroundImage;
      expect(bg).toBeDefined();
      expect(bg?.dataUrl).toBe('data:image/png;base64,test');
      expect(bg?.opacity).toBe(0.5); // Opacity should be preserved
      expect(bg?.panX).toBe(0);
      expect(bg?.panY).toBe(0);
      expect(bg?.zoom).toBe(1);
    });

    it('should update opacity when onOpacityChange is called', () => {
      // Set a background image
      component.updateConfig({
        backgroundImage: {
          dataUrl: 'data:image/png;base64,test',
          opacity: 1,
          panX: 0,
          panY: 0,
          zoom: 1,
        },
      });

      // Change opacity
      component.onOpacityChange(0.7);

      expect(component.config().backgroundImage?.opacity).toBe(0.7);
    });
  });
});
