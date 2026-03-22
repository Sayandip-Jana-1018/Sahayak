// @ts-nocheck
'use client';

import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/iphone_model.glb';

/* ── Screen image paths matching StoryScroll captions ── */
const SCREEN_IMAGES = [
  '/story/frame1.png', // Voice-First UPI
  '/story/frame2.png', // Smart Medication
  '/story/frame3.png', // SOS Emergency
  '/story/frame4.png', // Always Connected
];

/* Caption scroll ranges (matching StoryScroll.tsx) */
const CAPTION_RANGES = [
  { start: 0.00, end: 0.18 },
  { start: 0.25, end: 0.45 },
  { start: 0.50, end: 0.70 },
  { start: 0.75, end: 0.95 },
];

/* ── Scroll state (updated every frame) ── */
let scrollY = 0;
let viewportH = 1;
let heroH = 0;
let storyTop = 0;
let storyH = 0;

function updateMetrics() {
  if (typeof window === 'undefined') return;
  scrollY = window.scrollY;
  viewportH = window.innerHeight;
  const hero = document.getElementById('hero');
  const story = document.getElementById('story-scroll');
  if (hero) heroH = hero.offsetHeight;
  if (story) { storyTop = story.offsetTop; storyH = story.offsetHeight; }
}

if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  window.addEventListener('resize', updateMetrics);
}

/* ── Helpers ── */
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function smoothstep(t: number) { return t * t * (3 - 2 * t); }
function clamp01(t: number) { return Math.max(0, Math.min(1, t)); }

/* ── Cinematic scroll keyframes ── */
interface KeyFrame {
  scroll: number;
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  opacity: number;
}

function interpolateKeyframes(frames: KeyFrame[], progress: number) {
  let a = frames[0], b = frames[0];
  for (let i = 0; i < frames.length - 1; i++) {
    if (progress >= frames[i].scroll && progress <= frames[i + 1].scroll) {
      a = frames[i];
      b = frames[i + 1];
      break;
    }
    if (i === frames.length - 2) {
      a = frames[frames.length - 2];
      b = frames[frames.length - 1];
    }
  }
  if (progress <= frames[0].scroll) { a = frames[0]; b = frames[0]; }
  if (progress >= frames[frames.length - 1].scroll) { a = frames[frames.length - 1]; b = frames[frames.length - 1]; }

  const range = b.scroll - a.scroll;
  const t = range > 0 ? smoothstep(clamp01((progress - a.scroll) / range)) : 0;

  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
    rotX: lerp(a.rotX, b.rotX, t),
    rotY: lerp(a.rotY, b.rotY, t),
    rotZ: lerp(a.rotZ, b.rotZ, t),
    scale: lerp(a.scale, b.scale, t),
    opacity: lerp(a.opacity, b.opacity, t),
  };
}

/* ── iPhone 3D Model — always front-facing with scroll-synced screen images ── */
function CinematicPhone() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const screenMeshRef = useRef<THREE.Mesh | null>(null);
  const currentImageIdx = useRef(0);
  const prevImageIdx = useRef(0);
  const crossfadeProgress = useRef(1); // 1 = fully showing current
  const texturesRef = useRef<THREE.Texture[]>([]);
  const prevTextureRef = useRef<THREE.Texture | null>(null);

  // Auto-center + normalize
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 2.2 / maxDim;
    clonedScene.scale.setScalar(scaleFactor);
    const c = center.clone().multiplyScalar(scaleFactor);
    clonedScene.position.set(-c.x, -c.y, -c.z);
    updateMetrics();
  }, [clonedScene]);

  // Find screen mesh and load textures
  useEffect(() => {
    // Find screen mesh — case-insensitive to handle both "Screen" and "screen.001"
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name.toLowerCase();
        if (name === 'screen' || name.includes('screen')) {
          console.log('[PhoneScene] Screen mesh found:', child.name);
          screenMeshRef.current = child;
        }
      }
    });

    // Pre-load all 4 screen textures
    const loader = new THREE.TextureLoader();
    const textures: THREE.Texture[] = [];

    SCREEN_IMAGES.forEach((src, i) => {
      loader.load(src, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.flipY = false; // GLB UVs are usually non-flipped
        textures[i] = tex;
        console.log(`[PhoneScene] Loaded screen texture ${i}:`, src);

        // Apply first texture immediately
        if (i === 0 && screenMeshRef.current) {
          screenMeshRef.current.material = new THREE.MeshBasicMaterial({ map: tex });
          console.log('[PhoneScene] Applied initial screen texture');
        }
      });
    });

    texturesRef.current = textures;

    return () => {
      textures.forEach(t => t?.dispose());
    };
  }, [clonedScene]);

  // Front-facing keyframes — phone ALWAYS faces front (rotY = Math.PI / 2)
  // The Sketchfab model's screen faces -X (left), so +90 deg rotation is needed to face camera (+Z)
  // Only subtle tilt for dynamism, never showing back or side
  const KEYFRAMES: KeyFrame[] = [
    // Hero: right-of-center, front-facing, normal size
    { scroll: 0.00, x: 1.8,  y: 0,    z: 0,    rotX: 0,     rotY: Math.PI / 2, rotZ: 0,     scale: 1.0,  opacity: 1 },
    // Slight zoom + subtle tilt as user starts scrolling
    { scroll: 0.10, x: 1.8,  y: 0,    z: 0.5,  rotX: 0.03,  rotY: Math.PI / 2, rotZ: 0.01,  scale: 1.05, opacity: 1 },
    // Settle back, start moving to story position
    { scroll: 0.25, x: 1.8,  y: 0,    z: 0,    rotX: 0,     rotY: Math.PI / 2, rotZ: 0,     scale: 1.0,  opacity: 1 },
    // Transition to story section position
    { scroll: 0.35, x: 1.6,  y: 0,    z: 0,    rotX: 0,     rotY: Math.PI / 2, rotZ: 0,     scale: 0.95, opacity: 1 },
    // Story section — stable, front-facing
    { scroll: 0.42, x: 1.6,  y: 0,    z: 0,    rotX: 0,     rotY: Math.PI / 2, rotZ: 0,     scale: 0.95, opacity: 1 },
    // Hold through story
    { scroll: 0.80, x: 1.6,  y: 0,    z: 0,    rotX: 0,     rotY: Math.PI / 2, rotZ: 0,     scale: 0.95, opacity: 1 },
    // Fade out when past story
    { scroll: 0.90, x: 1.6,  y: -1,   z: -1,   rotX: 0.1,   rotY: Math.PI / 2, rotZ: 0,     scale: 0.8,  opacity: 0 },
  ];

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Total scrollable range
    const totalRange = storyTop + storyH || viewportH * 5;
    const scrollProgress = clamp01(scrollY / totalRange);

    const state = interpolateKeyframes(KEYFRAMES, scrollProgress);

    // Apply position with subtle float
    groupRef.current.position.x = state.x;
    groupRef.current.position.y = state.y + Math.sin(t * 0.8) * 0.05;
    groupRef.current.position.z = state.z;

    groupRef.current.rotation.x = state.rotX;
    groupRef.current.rotation.y = state.rotY;
    groupRef.current.rotation.z = state.rotZ;

    groupRef.current.scale.setScalar(state.scale);

    // Apply opacity to all meshes
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = state.opacity;
      }
    });

    // Make group globally available for debug
    if (typeof window !== 'undefined') {
      window.__phoneGroup = groupRef.current;
    }

    // ── Scroll-synced screen image with crossfade ──
    if (!screenMeshRef.current || texturesRef.current.length < 4) return;

    // Determine which caption/image is active based on story scroll
    const storyScrollStart = storyTop || heroH || viewportH;
    const storyProgress = clamp01((scrollY - storyScrollStart) / (storyH || viewportH * 3.5));

    let targetIdx = 0;
    for (let i = CAPTION_RANGES.length - 1; i >= 0; i--) {
      if (storyProgress >= CAPTION_RANGES[i].start) {
        targetIdx = i;
        break;
      }
    }

    // Crossfade logic
    const CROSSFADE_SPEED = 1 / 0.3; // 0.3 seconds at 60fps ≈ 18 frames

    if (targetIdx !== currentImageIdx.current) {
      prevImageIdx.current = currentImageIdx.current;
      currentImageIdx.current = targetIdx;
      crossfadeProgress.current = 0;
      // Store previous texture for crossfade
      prevTextureRef.current = texturesRef.current[prevImageIdx.current] || null;
    }

    // Advance crossfade
    if (crossfadeProgress.current < 1) {
      crossfadeProgress.current = Math.min(1, crossfadeProgress.current + (1 / 60) * CROSSFADE_SPEED);
    }

    // Apply texture with crossfade opacity
    const currentTex = texturesRef.current[currentImageIdx.current];
    if (currentTex && screenMeshRef.current) {
      const mat = screenMeshRef.current.material as THREE.MeshBasicMaterial;
      if (!mat.map || mat.map !== currentTex) {
        screenMeshRef.current.material = new THREE.MeshBasicMaterial({
          map: currentTex,
          transparent: true,
          opacity: crossfadeProgress.current * state.opacity,
        });
      } else {
        mat.opacity = crossfadeProgress.current * state.opacity;
      }
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

/* ── Floating badges data ── */
const FLOATING_BADGES = [
  { label: '🌐 11 Languages', top: '18%', right: '4%', delay: '0s' },
  { label: '🤖 AI Companion', top: '38%', right: '2%', delay: '0.4s' },
  { label: '🆘 SOS Alerts', bottom: '32%', right: '3%', delay: '0.8s' },
  { label: '💊 Med Reminders', bottom: '14%', right: '6%', delay: '1.2s' },
];

/* ── PhoneScene: Fixed full-viewport Canvas + floating badges ── */
export function PhoneScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); updateMetrics(); }, []);

  if (!mounted) return null;

  return (
    <div
      id="phone-scene"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />
        <directionalLight position={[-3, 2, -2]} intensity={0.4} color="#FFD700" />
        <pointLight position={[0, -2, 3]} intensity={0.3} color="#FF9933" />

        <Suspense fallback={null}>
          <CinematicPhone />
          <Environment preset="city" />
        </Suspense>
      </Canvas>

      {/* Floating language/feature badges with CSS bobbing */}
      {FLOATING_BADGES.map((badge, i) => (
        <div
          key={i}
          className="phone-floating-badge"
          style={{
            position: 'absolute',
            top: badge.top,
            right: badge.right,
            bottom: badge.bottom,
            animationDelay: badge.delay,
          }}
        >
          {badge.label}
        </div>
      ))}
    </div>
  );
}
