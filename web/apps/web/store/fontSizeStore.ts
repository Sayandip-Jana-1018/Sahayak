import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FontSize = 'normal' | 'large' | 'xlarge';

interface FontSizeState {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

export const useFontSizeStore = create<FontSizeState>()(
  persist(
    (set) => ({
      fontSize: 'normal',
      setFontSize: (fontSize) => set({ fontSize }),
    }),
    {
      name: 'sahayak-font-size',
    }
  )
);
