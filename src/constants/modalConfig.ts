// Modal configuration constants for consistent behavior
export const MODAL_CONFIG = {
  // Maximum height as percentage of screen
  MAX_HEIGHT_PERCENTAGE: 85,

  // Default snap points for different content types
  SNAP_POINTS: {
    SMALL: '40%',
    MEDIUM: '60%',
    LARGE: '75%',
    MAX: '85%',
  },

  // Padding values
  PADDING: {
    HORIZONTAL: 16,
    VERTICAL: 16,
    BOTTOM_SAFE: 20,
  },

  // Border radius for modal top
  BORDER_RADIUS: 24,

  // Animation timing
  ANIMATION_DURATION: 300,
} as const;

export const getModalSnapPoints = (contentType: 'small' | 'medium' | 'large' | 'dynamic' = 'dynamic') => {
  switch (contentType) {
    case 'small':
      return [MODAL_CONFIG.SNAP_POINTS.SMALL];
    case 'medium':
      return [MODAL_CONFIG.SNAP_POINTS.MEDIUM];
    case 'large':
      return [MODAL_CONFIG.SNAP_POINTS.LARGE];
    case 'dynamic':
    default:
      return [MODAL_CONFIG.SNAP_POINTS.LARGE, MODAL_CONFIG.SNAP_POINTS.MAX];
  }
};