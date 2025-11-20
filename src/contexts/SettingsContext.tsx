import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
type FontFamily = 'inter' | 'roboto' | 'open-sans' | 'merriweather' | 'playfair';
type PresentationTheme = 'default' | 'modern' | 'elegant' | 'playful' | 'minimal';

interface SettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  getFontSizeClass: () => string;
  fontFamily: FontFamily;
  setFontFamily: (family: FontFamily) => void;
  getFontFamilyClass: () => string;
  presentationTheme: PresentationTheme;
  setPresentationTheme: (theme: PresentationTheme) => void;
  getThemeColors: () => ThemeColors;
}

interface ThemeColors {
  gradient: string;
  cardBg: string;
  accent: string;
  border: string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  'small': 'text-base',
  'medium': 'text-lg',
  'large': 'text-xl',
  'extra-large': 'text-2xl',
};

const FONT_FAMILY_CLASSES: Record<FontFamily, string> = {
  'inter': 'font-sans',
  'roboto': 'font-roboto',
  'open-sans': 'font-opensans',
  'merriweather': 'font-merriweather',
  'playfair': 'font-playfair',
};

const THEME_COLORS: Record<PresentationTheme, ThemeColors> = {
  'default': {
    gradient: 'from-primary via-secondary to-accent',
    cardBg: 'bg-card/50',
    accent: 'text-primary',
    border: 'border-primary/20',
  },
  'modern': {
    gradient: 'from-blue-500 via-purple-500 to-pink-500',
    cardBg: 'bg-slate-900/50',
    accent: 'text-blue-400',
    border: 'border-blue-500/30',
  },
  'elegant': {
    gradient: 'from-amber-600 via-rose-600 to-purple-600',
    cardBg: 'bg-neutral-900/50',
    accent: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  'playful': {
    gradient: 'from-green-400 via-yellow-400 to-orange-400',
    cardBg: 'bg-indigo-900/50',
    accent: 'text-green-400',
    border: 'border-green-400/30',
  },
  'minimal': {
    gradient: 'from-gray-700 via-gray-600 to-gray-500',
    cardBg: 'bg-gray-900/50',
    accent: 'text-gray-300',
    border: 'border-gray-500/30',
  },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('lesson-font-size');
    return (saved as FontSize) || 'medium';
  });

  const [fontFamily, setFontFamilyState] = useState<FontFamily>(() => {
    const saved = localStorage.getItem('lesson-font-family');
    return (saved as FontFamily) || 'inter';
  });

  const [presentationTheme, setPresentationThemeState] = useState<PresentationTheme>(() => {
    const saved = localStorage.getItem('lesson-presentation-theme');
    return (saved as PresentationTheme) || 'default';
  });

  useEffect(() => {
    localStorage.setItem('lesson-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('lesson-font-family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    localStorage.setItem('lesson-presentation-theme', presentationTheme);
  }, [presentationTheme]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const setFontFamily = (family: FontFamily) => {
    setFontFamilyState(family);
  };

  const setPresentationTheme = (theme: PresentationTheme) => {
    setPresentationThemeState(theme);
  };

  const getFontSizeClass = () => {
    return FONT_SIZE_CLASSES[fontSize];
  };

  const getFontFamilyClass = () => {
    return FONT_FAMILY_CLASSES[fontFamily];
  };

  const getThemeColors = () => {
    return THEME_COLORS[presentationTheme];
  };

  return (
    <SettingsContext.Provider value={{ 
      fontSize, 
      setFontSize, 
      getFontSizeClass,
      fontFamily,
      setFontFamily,
      getFontFamilyClass,
      presentationTheme,
      setPresentationTheme,
      getThemeColors,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
