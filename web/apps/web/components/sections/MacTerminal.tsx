'use client';

import { useRef, useEffect, useState } from 'react';

const TERMINAL_LINES = [
  { delay: 0,    text: 'sahayak init --lang=hindi --region=UP', type: 'cmd' },
  { delay: 150,  text: '✓ Voice model loaded (42 MB, quantized)', type: 'ok' },
  { delay: 280,  text: '✓ Language pack: हिन्दी (11 dialects)', type: 'ok' },
  { delay: 400,  text: '✓ On-device inference — no cloud', type: 'ok' },
  { delay: 550,  text: '✓ TTS Engine initialized (24kHz)', type: 'ok' },
  { delay: 1000, text: 'listen --user="Kamala Devi" --passive', type: 'cmd' },
  { delay: 1200, text: '⟳  Mic active  [████████░░] 80%', type: 'info' },
  { delay: 1500, text: '📣  "बेटे को फोन लगाओ"', type: 'voice' },
  { delay: 1750, text: '→  intent: call_contact  entity: "बेटा"', type: 'parse' },
  { delay: 2000, text: '✓ Resolving contact "Rohan Sharma"...', type: 'ok' },
  { delay: 2400, text: '✓ Dialling "Rohan Sharma" via 2G VoIP…', type: 'ok' },
  { delay: 2800, text: '✓ Call connected (latency: 112ms)', type: 'info' },
];

const lineColor = (type: string) => {
  switch (type) {
    case 'cmd':   return '#E2E8F0';
    case 'ok':    return '#4ADE80';
    case 'info':  return '#60A5FA';
    case 'voice': return '#FB923C';
    case 'parse': return '#C084FC';
    default:      return '#94A3B8';
  }
};

interface Props {
  /** 0 = fully visible, 1 = scrolled out */
  scrollOpacity: number;
}

export function MacTerminal({ scrollOpacity }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shownLines, setShownLines] = useState<number[]>([]);
  const [started, setStarted] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  // Start typing animation once visible (scrollOpacity near 1 means visible in hero)
  useEffect(() => {
    if (!started) {
      setStarted(true);
      TERMINAL_LINES.forEach((_, i) => {
        setTimeout(() => setShownLines((p) => [...p, i]), TERMINAL_LINES[i].delay + 600);
      });
    }
  }, [started]);

  // Robust video playback — retry on error, force play on canplay
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    let retryCount = 0;
    const maxRetries = 3;

    const tryPlay = () => {
      el.play().catch(() => {
        // Some browsers block autoplay; muted + playsInline should fix it
        // but if it still fails, we'll show the fallback
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryPlay, 500 * retryCount);
        } else {
          setVideoFailed(true);
        }
      });
    };

    const onCanPlay = () => {
      if (scrollOpacity > 0.1) tryPlay();
    };

    const onError = () => {
      // Video codec not supported on this device — show gradient fallback
      setVideoFailed(true);
    };

    el.addEventListener('canplay', onCanPlay);
    el.addEventListener('error', onError);

    // Immediately try if already loaded
    if (el.readyState >= 3 && scrollOpacity > 0.1) {
      tryPlay();
    }

    return () => {
      el.removeEventListener('canplay', onCanPlay);
      el.removeEventListener('error', onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Play / pause video based on scroll
  useEffect(() => {
    if (!videoRef.current || videoFailed) return;
    if (scrollOpacity > 0.1) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
    }
  }, [scrollOpacity, videoFailed]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 900,
        opacity: scrollOpacity,
        transform: `translateY(${(1 - scrollOpacity) * 24}px) scale(${0.97 + scrollOpacity * 0.03})`,
        transition: 'none',
        willChange: 'transform, opacity',
        margin: '0 auto',
      }}
    >
      {/* Mac window chrome */}
      <div className="mac-terminal-chrome" style={{
        borderRadius: 14,
        overflow: 'hidden',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
      }}>

        {/* Title bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px',
          background: 'rgba(255,255,255,0.025)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['#FF5F57','#FEBC2E','#28C840'].map((c, i) => (
              <div key={i} style={{
                width: 11, height: 11, borderRadius: '50%',
                background: c, boxShadow: `0 0 5px ${c}80`,
              }} />
            ))}
          </div>
          <span style={{
            flex: 1, textAlign: 'center',
            fontSize: 11.5, color: 'rgba(255,255,255,0.35)',
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            letterSpacing: '0.04em',
          }}>sahayak — zsh — 120×30</span>
          <div style={{ width: 46 }} />
        </div>

        {/* Two-panel body: 35% terminal | 65% video */}
        <div style={{ display: 'grid', gridTemplateColumns: '38% 62%', minHeight: 360 }}>

          {/* LEFT: Terminal code */}
          <div className="mac-terminal-text" style={{
            padding: '16px 18px',
            fontFamily: 'ui-monospace, "JetBrains Mono", "Fira Code", monospace',
            fontSize: 12,
            lineHeight: 1.75,
            borderRight: '1px solid rgba(255,255,255,0.06)',
            overflowX: 'hidden',
          }}>
            <div className="mac-terminal-muted" style={{ marginBottom: 8, fontSize: 10, letterSpacing: '0.08em' }}>
              ~ sahayak
            </div>
            {TERMINAL_LINES.map((line, i) => (
              shownLines.includes(i) && (
                <div key={i} style={{
                  color: lineColor(line.type),
                  animation: 'term-in 0.25s ease-out both',
                  display: 'flex', gap: 5, alignItems: 'flex-start',
                }}>
                  {line.type === 'cmd'
                    ? <span style={{ color: 'var(--sah-accent-1)', flexShrink: 0, marginRight: 2 }}>▶</span>
                    : null
                  }
                  <span style={{ wordBreak: 'break-word' }}>{line.text}</span>
                </div>
              )
            ))}
            {/* Blinking cursor */}
            <span style={{
              display: 'inline-block', width: 7, height: 14,
              background: 'var(--sah-accent-1)',
              animation: 'term-blink 1s step-end infinite',
              borderRadius: 1, verticalAlign: 'text-bottom',
              opacity: 0.75,
            }} />
          </div>

          {/* RIGHT: Video (bigger) */}
          <div style={{ position: 'relative', background: '#000', overflow: 'hidden', minHeight: 320 }}>
            {/* Scanlines */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
              background: 'repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
              mixBlendMode: 'overlay',
            }} />
            {/* Vignette */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none',
              background: 'radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,0.5) 100%)',
            }} />
            {/* Accent tint */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
              background: 'rgba(var(--sah-accent-1-rgb), 0.05)',
              mixBlendMode: 'screen',
            }} />
            {/* Gradient fallback — always rendered behind video */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 0,
              background: 'linear-gradient(135deg, #1a0a00 0%, #2d1810 30%, #1a2332 70%, #0a0a14 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {videoFailed && (
                <div style={{
                  textAlign: 'center', color: 'rgba(255,255,255,0.25)',
                  fontFamily: 'ui-monospace, monospace', fontSize: 12,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>👵🏾</div>
                  <div>Live Preview</div>
                </div>
              )}
            </div>
            <video
              ref={videoRef}
              src="/videos/old.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                display: videoFailed ? 'none' : 'block', opacity: 0.88,
              }}
            />
            {/* LIVE badge */}
            <div style={{
              position: 'absolute', top: 10, right: 12, zIndex: 4,
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6,
              padding: '3px 8px',
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#ef4444',
                animation: 'term-blink 1.2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', fontFamily: 'monospace' }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Status bar */}
        <div style={{
          padding: '7px 18px',
          display: 'flex', gap: 20, alignItems: 'center', justifyContent: 'center',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.015)',
          flexWrap: 'wrap',
        }}>
          {[
            { k: 'Model', v: 'Whisper-small' },
            { k: 'Latency', v: '~120 ms' },
            { k: 'Network', v: '2G / offline' },
            { k: 'Lang', v: 'हिन्दी +10' },
          ].map(({ k, v }) => (
            <span key={k} style={{
              fontSize: 10,
              fontFamily: 'ui-monospace, monospace',
              color: 'rgba(255,255,255,0.28)',
              letterSpacing: '0.03em',
            }}>
              <span style={{ color: 'rgba(var(--sah-accent-1-rgb),0.65)' }}>{k}:</span> {v}
            </span>
          ))}
        </div>
      </div>




      <style>{`
        @keyframes term-in {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes term-blink {
          0%, 100% { opacity: 0.75; }
          50%       { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
