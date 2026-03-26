'use client';

import { create } from 'zustand';

export type ColorTheme = {
  name: string;
  accent1: string;
  accent2: string;
  accent1Rgb: string;
  accent2Rgb: string;
  grainColor1: string;
  grainColor2: string;
  grainColor3: string;
};

export const colorThemes: ColorTheme[] = [
  {
    name: 'Tiranga',
    accent1: '#FF9933', accent2: '#138808',
    accent1Rgb: '255, 153, 51', accent2Rgb: '19, 136, 8',
    grainColor1: '#0A0A0A', grainColor2: '#FF9933', grainColor3: '#138808',
  },
  {
    name: 'Saffron & Indigo',
    accent1: '#FF6B2C', accent2: '#3B28CC',
    accent1Rgb: '255, 107, 44', accent2Rgb: '59, 40, 204',
    grainColor1: '#0A0A14', grainColor2: '#3B28CC', grainColor3: '#FF6B2C',
  },
  {
    name: 'Ocean Blue',
    accent1: '#0EA5E9', accent2: '#0369A1',
    accent1Rgb: '14, 165, 233', accent2Rgb: '3, 105, 161',
    grainColor1: '#020B18', grainColor2: '#0369A1', grainColor3: '#0EA5E9',
  },
  {
    name: 'Forest Green',
    accent1: '#22C55E', accent2: '#15803D',
    accent1Rgb: '34, 197, 94', accent2Rgb: '21, 128, 61',
    grainColor1: '#010803', grainColor2: '#15803D', grainColor3: '#22C55E',
  },
  {
    name: 'Rose Gold',
    accent1: '#F43F5E', accent2: '#9F1239',
    accent1Rgb: '244, 63, 94', accent2Rgb: '159, 18, 57',
    grainColor1: '#140208', grainColor2: '#9F1239', grainColor3: '#F43F5E',
  },
  {
    name: 'Midnight Purple',
    accent1: '#A855F7', accent2: '#6B21A8',
    accent1Rgb: '168, 85, 247', accent2Rgb: '107, 33, 168',
    grainColor1: '#0A0214', grainColor2: '#6B21A8', grainColor3: '#A855F7',
  },
];

interface ThemeStore {
  activeTheme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  activeTheme: colorThemes[0],
  setTheme: (theme) => {
    const root = document.documentElement;
    root.style.setProperty('--sah-accent-1', theme.accent1);
    root.style.setProperty('--sah-accent-2', theme.accent2);
    root.style.setProperty('--sah-accent-1-rgb', theme.accent1Rgb);
    root.style.setProperty('--sah-accent-2-rgb', theme.accent2Rgb);
    set({ activeTheme: theme });
  },
}));
