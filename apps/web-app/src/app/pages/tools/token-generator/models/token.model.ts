export type TokenSize = 'small' | 'medium' | 'large' | 'huge';
export type BorderWidth = 'none' | 'thin' | 'medium' | 'thick';
export type NamePosition = 'top' | 'bottom';

export interface BackgroundImage {
  dataUrl: string;
  opacity: number;
  panX: number; // Normalized offset (-1 to 1, 0 = centered)
  panY: number; // Normalized offset (-1 to 1, 0 = centered)
  zoom: number; // Scale factor (0.25 to 5, 1 = fit)
}

export const DEFAULT_BACKGROUND_IMAGE_SETTINGS: Omit<
  BackgroundImage,
  'dataUrl'
> = {
  opacity: 1,
  panX: 0,
  panY: 0,
  zoom: 1,
};

export interface TokenConfig {
  name: string;
  initials: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: BorderWidth;
  size: TokenSize;
  showName: boolean;
  showInitials: boolean;
  namePosition: NamePosition;
  backgroundImage?: BackgroundImage;
}

export const TOKEN_SIZE_PX: Record<TokenSize, number> = {
  small: 50,
  medium: 100,
  large: 150,
  huge: 200,
};

export const BORDER_WIDTH_PX: Record<BorderWidth, number> = {
  none: 0,
  thin: 2,
  medium: 4,
  thick: 8,
};

export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  name: 'Goblin',
  initials: 'GB',
  backgroundColor: '#4a5568',
  borderColor: '#e53e3e',
  borderWidth: 'medium',
  size: 'large',
  showName: true,
  showInitials: true,
  namePosition: 'bottom',
};

export type ExportFormat = 'svg' | 'png' | 'jpg' | 'webp';

export const EXPORT_FORMATS: {
  value: ExportFormat;
  label: string;
  mimeType: string;
}[] = [
  { value: 'svg', label: 'SVG (Vector)', mimeType: 'image/svg+xml' },
  { value: 'png', label: 'PNG (Transparent)', mimeType: 'image/png' },
  { value: 'jpg', label: 'JPG (Compressed)', mimeType: 'image/jpeg' },
  { value: 'webp', label: 'WebP (Modern)', mimeType: 'image/webp' },
];
