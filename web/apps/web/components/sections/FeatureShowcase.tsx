// @ts-nocheck
'use client';

/**
 * FeatureShowcase — Premium 700vh pinned two-column section.
 *
 * Desktop: left text panels swap one-at-a-time, right has a sticky iPhone 3D
 * that gently sways. Click & drag on phone to rotate; release to resume sway.
 *
 * Mobile: single column with static feature cards.
 */

import { useRef, useEffect, useMemo, Suspense, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import {
  Mic, Heart, AlertTriangle, Bot, LayoutDashboard, Landmark,
} from 'lucide-react';

/* ── Feature data ── */
const FEATURES = [
  {
    num: '01', cat: 'VOICE & PAYMENTS', icon: Mic, accent: '#FF9933',
    title: 'Bolo. Ho jaayega.',
    desc: "Say 'Beti ko 500 rupaye bhejo' and Sahayak processes the UPI payment instantly. No app switching. No OTP typing. No passwords. Just voice.",
    stat: 'Works with PhonePe, GPay, Paytm and all UPI apps',
    img: '/features/feature1.png',
  },
  {
    num: '02', cat: 'SMART HEALTH', icon: Heart, accent: '#E85D75',
    title: 'Never miss a dose again',
    desc: 'Photograph any prescription. AI reads it, extracts medicine names and dosages, and sets voice reminders automatically in their language.',
    stat: '65% of Indian elders miss medications regularly',
    img: '/features/feature2.png',
  },
  {
    num: '03', cat: 'EMERGENCY SOS', icon: AlertTriangle, accent: '#FF4D4D',
    title: 'Help in seconds, not minutes',
    desc: "Triple-tap or say 'bachao'. Sahayak instantly alerts all family members with live GPS location and finds the nearest hospital.",
    stat: 'Average SOS alert sent in under 8 seconds',
    img: '/features/feature3.png',
  },
  {
    num: '04', cat: 'AI COMPANION', icon: Bot, accent: '#6C63FF',
    title: 'Aapka digital dost',
    desc: 'Sahayak Dost talks, tells stories, recites bhajans, and monitors for loneliness — alerting family if an elder has not spoken to anyone for 48 hours.',
    stat: '48% of Indian elders live alone or with spouse only',
    img: '/features/feature4.png',
  },
  {
    num: '05', cat: 'FAMILY DASHBOARD', icon: LayoutDashboard, accent: '#28C840',
    title: 'Always connected, always informed',
    desc: 'Real-time caregiver dashboard shows medication adherence, last location, battery level, and SOS history. Everything in one place.',
    stat: 'Trusted by 50,000 families across 18 Indian states',
    img: '/features/feature5.png',
  },
  {
    num: '06', cat: 'GOVERNMENT SCHEMES', icon: Landmark, accent: '#FFD700',
    title: 'Sarkari yojanaen, aasaani se',
    desc: "Enter age and state — Sahayak finds every eligible welfare scheme and explains benefits in simple spoken Hindi, Tamil, or Bengali. No forms.",
    stat: '₹2.3 lakh crore in unclaimed senior citizen benefits annually',
    img: '/features/feature6.png',
  },
];

const IPHONE_MODEL = '/models/phone.glb';
const IPHONE_SCREEN = 'xXDHkMplTIDAXLN';

/* ═══════════════════════════════
   3-D iPhone — drag-to-rotate
   Uses R3F onPointerDown on the model + window events for move/up
   ═══════════════════════════════ */
function IPhone({ activeIdxRef }: { activeIdxRef: React.RefObject<number> }) {
  const { scene } = useGLTF(IPHONE_MODEL);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const groupRef = useRef<THREE.Group>(null);
  const screenRef = useRef<THREE.Mesh | null>(null);
  const textures = useRef<(THREE.Texture | null)[]>(new Array(6).fill(null));
  const curIdx = useRef(-1);
  const screenSearchDone = useRef(false);

  // Drag state — all refs for zero re-renders
  const isDragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const userRot = useRef({ x: 0, y: 0 });

  // Get R3F gl for cursor changes
  const { gl } = useThree();

  /* Window-level move/up listeners (attached once, check isDragging inside) */
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = (e.clientX - lastPointer.current.x) * 0.008;
      const dy = (e.clientY - lastPointer.current.y) * 0.008;
      userRot.current.y += dx;
      userRot.current.x += dy;
      userRot.current.x = Math.max(-0.5, Math.min(0.5, userRot.current.x));
      userRot.current.y = Math.max(-1.3, Math.min(1.3, userRot.current.y));
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };

    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      gl.domElement.style.cursor = 'grab';
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    gl.domElement.style.cursor = 'grab';

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [gl]);

  /* R3F pointer down — fires when clicking ON the phone model geometry */
  const handlePointerDown = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    isDragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    gl.domElement.style.cursor = 'grabbing';
  }, [gl]);

  /* Find screen mesh */
  const findScreen = () => {
    if (screenRef.current) return;
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.name === IPHONE_SCREEN) {
        screenRef.current = child;
      }
    });
    if (!screenRef.current) {
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name === 'Screen') {
          screenRef.current = child;
        }
      });
    }
    if (!screenRef.current) {
      let bestMesh: THREE.Mesh | null = null;
      let bestScore = -1;
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.color) {
            const b = mat.color.r + mat.color.g + mat.color.b;
            if (b > 2.5 && b > bestScore) { bestScore = b; bestMesh = child; }
          }
        }
      });
      if (bestMesh) screenRef.current = bestMesh;
    }
    if (!screenSearchDone.current) screenSearchDone.current = true;
  };

  /* Preload textures */
  useEffect(() => {
    findScreen();
    const loader = new THREE.TextureLoader();
    FEATURES.forEach((f, i) => {
      loader.load(f.img, (t) => {
        t.flipY = false;
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearFilter;
        textures.current[i] = t;
        if (i === activeIdxRef.current && screenRef.current) {
          curIdx.current = -1;
          applyTex(i);
        }
      });
    });
  }, [cloned]);

  const applyTex = (idx: number) => {
    if (idx === curIdx.current) return;
    if (!screenRef.current || !textures.current[idx]) return;
    curIdx.current = idx;
    screenRef.current.material = new THREE.MeshBasicMaterial({
      map: textures.current[idx]!,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
  };

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const dragging = isDragging.current;
    const uRot = userRot.current;

    if (!screenRef.current) findScreen();
    const ai = activeIdxRef.current;
    if (ai !== curIdx.current) applyTex(ai);

    if (!dragging) {
      // Spring user rotation back to zero when not dragging
      uRot.x *= 0.93;
      uRot.y *= 0.93;
      if (Math.abs(uRot.x) < 0.001) uRot.x = 0;
      if (Math.abs(uRot.y) < 0.001) uRot.y = 0;

      // Automatic sway
      const swayAngle = Math.sin(t * 0.6) * 0.40;
      const bob = Math.sin(t * 0.8) * 0.05;
      const tiltX = Math.sin(t * 0.4) * 0.06;

      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, tiltX + uRot.x, 0.05
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, Math.PI + swayAngle + uRot.y, 0.05
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, bob, 0.05
      );
    } else {
      // While dragging — apply user rotation, STOP sway completely
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x, uRot.x, 0.15
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, Math.PI + uRot.y, 0.15
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, 0, 0.1
      );
    }
  });

  return (
    <group ref={groupRef} dispose={null} scale={20}>
      {/* R3F pointer events on this inner group — fires when ray hits phone mesh */}
      <group onPointerDown={handlePointerDown}>
        <primitive object={cloned} />
      </group>
    </group>
  );
}

useGLTF.preload(IPHONE_MODEL);

/* ═══════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════ */
export function FeatureShowcase() {
  const outerRef = useRef<HTMLDivElement>(null);
  const activeDomRef = useRef(0);
  const activeIdxRef = useRef(0);
  const panelsRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);

  /* Scroll tracker — zero state updates */
  useEffect(() => {
    const tick = () => {
      const el = outerRef.current;
      if (!el) { rafRef.current = requestAnimationFrame(tick); return; }

      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.max(0, Math.min(1, -rect.top / total)) : 0;

      const rawIdx = Math.floor(p * FEATURES.length);
      const idx = Math.min(rawIdx, FEATURES.length - 1);

      if (idx !== activeDomRef.current) {
        activeDomRef.current = idx;
        activeIdxRef.current = idx;

        const panels = panelsRef.current?.querySelectorAll('[data-panel]');
        panels?.forEach((panel, i) => {
          const el = panel as HTMLDivElement;
          if (i === idx) {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0) scale(1)';
            el.style.pointerEvents = 'auto';
            el.style.zIndex = '10';
          } else if (i < idx) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(-60px) scale(0.92)';
            el.style.pointerEvents = 'none';
            el.style.zIndex = String(i);
          } else {
            el.style.opacity = '0';
            el.style.transform = 'translateY(60px) scale(0.96)';
            el.style.pointerEvents = 'none';
            el.style.zIndex = String(i);
          }
        });

        dotRefs.current.forEach((dot, i) => {
          if (!dot) return;
          dot.style.width = i === idx ? '8px' : '5px';
          dot.style.height = i === idx ? '8px' : '5px';
          dot.style.background = i === idx ? FEATURES[idx].accent : 'rgba(255,255,255,0.15)';
          dot.style.boxShadow = i === idx ? `0 0 10px ${FEATURES[idx].accent}66` : 'none';
        });

        if (glowRef.current) {
          glowRef.current.style.background =
            `radial-gradient(ellipse at 60% 50%, ${FEATURES[idx].accent}10 0%, transparent 70%)`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* Mobile check */
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  /* ── Mobile: simple card layout ── */
  if (isMobile) {
    return (
      <div id="feature-showcase" style={{ padding: '60px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'var(--sah-accent-1)',
            fontFamily: 'var(--font-accent)', margin: '0 0 10px',
          }}>One App. Six Powers.</p>
          <h2 style={{
            fontSize: 'clamp(28px, 7vw, 40px)', fontWeight: 700,
            fontFamily: 'var(--font-display)', color: 'var(--text-primary)',
            margin: 0, lineHeight: 1.2,
          }}>Everything your elders need</h2>
        </div>
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div key={i} style={{
              marginBottom: 48, padding: '28px 20px', borderRadius: 20,
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(16px)',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 12px', borderRadius: 999,
                background: `${f.accent}12`, border: `1px solid ${f.accent}25`,
                marginBottom: 16,
              }}>
                <Icon size={12} color={f.accent} />
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: f.accent,
                  fontFamily: 'var(--font-accent)',
                }}>{f.cat}</span>
              </div>
              <h3 style={{
                fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700,
                fontFamily: 'var(--font-display)', color: 'var(--text-primary)',
                lineHeight: 1.15, margin: '0 0 12px',
              }}>{f.title}</h3>
              <p style={{
                fontSize: 14, color: 'var(--text-secondary)',
                fontFamily: 'var(--font-body)', lineHeight: 1.7, margin: '0 0 16px',
              }}>{f.desc}</p>
              <div style={{
                borderRadius: 16, overflow: 'hidden',
                border: '4px solid rgba(255,255,255,0.06)',
                boxShadow: `0 16px 40px ${f.accent}15`,
              }}>
                <img src={f.img} alt={f.title} style={{
                  width: '100%', height: 'auto', display: 'block',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Desktop: premium two-column pinned layout ── */
  return (
    <div
      ref={outerRef}
      id="feature-showcase"
      style={{ height: '700vh', position: 'relative' }}
    >
      {/* Sticky pinned viewport */}
      <div style={{
        position: 'sticky',
        top: 0,
        height: '100svh',
        display: 'grid',
        gridTemplateColumns: '50% 50%',
        gap: 0,
        overflow: 'hidden',
      }}>

        {/* ── LEFT COLUMN: feature text panels ── */}
        <div style={{
          position: 'relative', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 clamp(20px, 3vw, 48px)',
        }}>
          <div
            ref={panelsRef}
            style={{ position: 'relative', width: '100%', maxWidth: 520, minHeight: 460 }}
          >
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  data-panel={i}
                  style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center',
                    opacity: i === 0 ? 1 : 0,
                    transform: i === 0 ? 'translateY(0) scale(1)' : 'translateY(60px) scale(0.96)',
                    transition: 'opacity 0.55s cubic-bezier(0.4, 0, 0.2, 1), transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
                    pointerEvents: i === 0 ? 'auto' : 'none',
                    zIndex: i === 0 ? 10 : i,
                  }}
                >
                  <div style={{ maxWidth: 480, position: 'relative' }}>

                    {/* Decorative number — vibrant accent color */}
                    <div style={{
                      position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
                      fontSize: 180,
                      fontFamily: 'var(--font-display)',
                      fontWeight: 900,
                      color: f.accent,
                      opacity: 0.18,
                      lineHeight: 1,
                      userSelect: 'none', pointerEvents: 'none',
                      zIndex: 0,
                    }}>
                      {f.num}
                    </div>

                    {/* Category badge */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '7px 16px', borderRadius: 999,
                      background: `${f.accent}12`,
                      backdropFilter: 'blur(12px)',
                      border: `1px solid ${f.accent}30`,
                      marginBottom: 20,
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8,
                        background: `${f.accent}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Icon size={13} color={f.accent} />
                      </div>
                      <span style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
                        textTransform: 'uppercase', color: f.accent,
                        fontFamily: 'var(--font-accent)',
                      }}>
                        {f.cat}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      fontSize: 'clamp(34px, 3.8vw, 56px)',
                      fontWeight: 800,
                      fontFamily: 'var(--font-display)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.12,
                      margin: '0 0 20px',
                      letterSpacing: '-0.02em',
                      position: 'relative', zIndex: 1,
                    }}>
                      {f.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                      fontSize: 'clamp(14px, 1.1vw, 17px)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.8,
                      margin: '0 auto 28px',
                      maxWidth: 420,
                    }}>
                      {f.desc}
                    </p>

                    {/* Stat card */}
                    <div style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '14px 22px', borderRadius: 14,
                      maxWidth: 380,
                      background: 'var(--glass-bg)',
                      backdropFilter: 'blur(24px)',
                      border: '1px solid var(--glass-border)',
                      borderBottom: `2px solid ${f.accent}55`,
                    }}>
                      <span style={{
                        fontSize: 13,
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                        fontFamily: 'var(--font-body)',
                        fontStyle: 'italic',
                      }}>
                        {f.stat}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Indicator dots */}
          <div style={{
            position: 'absolute', left: 'clamp(12px, 2vw, 24px)', top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                ref={el => { dotRefs.current[i] = el; }}
                style={{
                  width: i === 0 ? 8 : 5,
                  height: i === 0 ? 8 : 5,
                  borderRadius: '50%',
                  background: i === 0 ? f.accent : 'rgba(255,255,255,0.15)',
                  boxShadow: i === 0 ? `0 0 10px ${f.accent}66` : 'none',
                  transition: 'all 0.35s ease',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: sticky iPhone canvas ── */}
        <div
          style={{
            position: 'relative', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {/* Accent glow backdrop */}
          <div ref={glowRef} style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse at 60% 50%, ${FEATURES[0].accent}10 0%, transparent 70%)`,
            transition: 'background 0.6s ease',
          }} />

          <Canvas
            camera={{ position: [0, 0, 6], fov: 42 }}
            style={{ width: '100%', height: '100%', touchAction: 'none' }}
            gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
            dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[3, 6, 4]} intensity={1.8} />
            <pointLight position={[-2, 2, 3]} intensity={0.5} color="#FF9933" />
            <pointLight position={[2, -1, 2]} intensity={0.3} color="#6C63FF" />
            <Suspense fallback={null}>
              <IPhone activeIdxRef={activeIdxRef} />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>
      </div>
    </div>
  );
}
