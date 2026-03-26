'use client';

import { createContext, useContext, useRef, useCallback, type ReactNode } from 'react';
import { Howl, Howler } from 'howler';

interface SoundContextValue {
  playHover: () => void;
  playClick: () => void;
  playSuccess: () => void;
  playAlert: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound must be used within <SoundProvider>');
  return ctx;
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const mutedRef = useRef(false);
  const sounds = useRef<Record<string, Howl | null>>({
    hover: null,
    click: null,
    success: null,
    alert: null,
  });

  const getOrCreateSound = useCallback((key: string, src: string, volume = 0.3): Howl | null => {
    if (typeof window === 'undefined') return null;

    if (!sounds.current[key]) {
      try {
        sounds.current[key] = new Howl({
          src: [src],
          volume,
          preload: true,
          html5: true,
        });
      } catch {
        return null;
      }
    }
    return sounds.current[key];
  }, []);

  const play = useCallback(
    (key: string, src: string, volume = 0.3) => {
      if (mutedRef.current) return;
      try {
        const sound = getOrCreateSound(key, src, volume);
        sound?.play();
      } catch {
        // Silently fail for audio
      }
    },
    [getOrCreateSound]
  );

  const playHover = useCallback(() => play('hover', '/sounds/hover.mp3', 0.15), [play]);
  const playClick = useCallback(() => play('click', '/sounds/click.mp3', 0.25), [play]);
  const playSuccess = useCallback(() => play('success', '/sounds/success.mp3', 0.3), [play]);
  const playAlert = useCallback(() => play('alert', '/sounds/alert.mp3', 0.5), [play]);

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current;
    Howler.mute(mutedRef.current);
  }, []);

  return (
    <SoundContext.Provider
      value={{
        playHover,
        playClick,
        playSuccess,
        playAlert,
        isMuted: mutedRef.current,
        toggleMute,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}
