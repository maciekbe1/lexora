export type AppThemeColors = {
  background: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
  primary: string;
  cardShadow: string;
};

export function getColors(mode: 'light' | 'dark'): AppThemeColors {
  if (mode === 'dark') {
    return {
      background: '#0F1115',
      surface: '#1B1F26',
      border: '#2A2F36',
      text: '#E6E6E6',
      mutedText: '#A0A6AD',
      primary: '#0A84FF',
      cardShadow: 'rgba(0,0,0,0.5)',
    };
  }
  return {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    border: '#E1E5E9',
    text: '#1A1A1A',
    mutedText: '#8E8E93',
    primary: '#007AFF',
    cardShadow: 'rgba(0,0,0,0.1)',
  };
}

