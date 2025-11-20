import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

interface SettingsContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  getFontSizeClass: () => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  'small': 'text-base',
  'medium': 'text-lg',
  'large': 'text-xl',
  'extra-large': 'text-2xl',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem('lesson-font-size');
    return (saved as FontSize) || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('lesson-font-size', fontSize);
  }, [fontSize]);

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
  };

  const getFontSizeClass = () => {
    return FONT_SIZE_CLASSES[fontSize];
  };

  return (
    <SettingsContext.Provider value={{ fontSize, setFontSize, getFontSizeClass }}>
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
