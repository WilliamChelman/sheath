export type TokenSize = 'small' | 'medium' | 'large' | 'huge';
export type BorderWidth = 'none' | 'thin' | 'medium' | 'thick';
export type NamePosition = 'top' | 'bottom' | 'bottom-flat';
export type MinionIconPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export type ShadowIntensity = 'none' | 'subtle' | 'medium' | 'strong' | 'dramatic';
export type BorderStyle = 'solid' | 'metallic';
export type TextSize = 'small' | 'medium' | 'large' | 'extra-large';
export type TextShadowIntensity = 'none' | 'subtle' | 'medium' | 'strong';

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
  showMinionIcon: boolean;
  minionIconPosition: MinionIconPosition;
  namePosition: NamePosition;
  shadowIntensity: ShadowIntensity;
  borderStyle: BorderStyle;
  backgroundImage?: BackgroundImage;
  textColor: string;
  initialsSize: TextSize;
  nameSize: TextSize;
  textShadowIntensity: TextShadowIntensity;
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

export const SHADOW_INTENSITY_VALUES: Record<ShadowIntensity, { stdDeviation: number; opacity: number } | null> = {
  none: null,
  subtle: { stdDeviation: 1.5, opacity: 0.15 },
  medium: { stdDeviation: 3, opacity: 0.3 },
  strong: { stdDeviation: 5, opacity: 0.45 },
  dramatic: { stdDeviation: 8, opacity: 0.65 },
};

// Text size multipliers (relative to token size)
export const INITIALS_SIZE_MULTIPLIER: Record<TextSize, number> = {
  small: 0.25,
  medium: 0.35,
  large: 0.45,
  'extra-large': 0.55,
};

export const NAME_SIZE_MULTIPLIER: Record<TextSize, number> = {
  small: 0.08,
  medium: 0.1,
  large: 0.12,
  'extra-large': 0.14,
};

// Text shadow filter values
export const TEXT_SHADOW_VALUES: Record<TextShadowIntensity, { stdDeviation1: number; opacity1: number; stdDeviation2: number; opacity2: number } | null> = {
  none: null,
  subtle: { stdDeviation1: 0.4, opacity1: 0.5, stdDeviation2: 1.2, opacity2: 0.3 },
  medium: { stdDeviation1: 0.6, opacity1: 0.75, stdDeviation2: 2.2, opacity2: 0.45 },
  strong: { stdDeviation1: 1.0, opacity1: 0.9, stdDeviation2: 3.5, opacity2: 0.6 },
};

export const DEFAULT_TOKEN_CONFIG: TokenConfig = {
  name: 'Goblin',
  initials: 'GB',
  backgroundColor: '#78350f',
  borderColor: '#d97706',
  borderWidth: 'medium',
  size: 'large',
  showName: true,
  showInitials: true,
  showMinionIcon: false,
  minionIconPosition: 'bottom-left',
  namePosition: 'bottom',
  shadowIntensity: 'medium',
  borderStyle: 'solid',
  textColor: '#ffffff',
  initialsSize: 'medium',
  nameSize: 'medium',
  textShadowIntensity: 'medium',
};

export type ExportFormat = 'svg' | 'png' | 'jpg' | 'webp';

export interface BatchToken {
  name: string;
  initials: string;
  isMinion: boolean;
}

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
