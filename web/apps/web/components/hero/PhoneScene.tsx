// @ts-nocheck
'use client';

// phone.glb — screen mesh: 'xXDHkMplTIDAXLN', front-facing at rotY=0
import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/phone.glb';
// Screen mesh confirmed: xXDHkMplTIDAXLN (highlighted blue in current Blender screenshot)
const SCREEN_MESH = 'xxdhkmpltiidaxln';

/* ── Global scroll ── */
let gScrollY = 0;
let gHeroH = 0;
if (typeof window !== 'undefined') {
  window.addEventListener('scroll', () => { gScrollY = window.scrollY; }, { passive: true });
  window.addEventListener('load', () => { gHeroH = document.getElementById('hero')?.offsetHeight ?? 0; });
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ── 3-D Model ── */
function IPhone() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const [videoTex, setVideoTex] = useState<THREE.VideoTexture | null>(null);

  /* Load hero.mp4 as screen texture */
  useEffect(() => {
    const vid = document.createElement('video');
    vid.src = '/videos/hero.mp4';
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.crossOrigin = 'anonymous';
    vid.play().catch(() => { });
    const tex = new THREE.VideoTexture(vid);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.flipY = false;
    setVideoTex(tex);
    return () => { vid.pause(); tex.dispose(); };
  }, []);

  /* Apply video texture to screen mesh whenever videoTex becomes available */
  useEffect(() => {
    if (!videoTex) return; // wait for video to load

    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const n = child.name.toLowerCase();
      if (n === SCREEN_MESH || n.includes('screen')) {
        child.material = new THREE.MeshStandardMaterial({
          map: videoTex,
          emissiveMap: videoTex,
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 1.0,
          roughness: 0.05,
          metalness: 0.05,
          side: THREE.DoubleSide,
        });
        console.log('[PhoneScene] ✅ Screen texture applied to:', child.name);
      }
    });
  }, [cloned, videoTex]); // re-runs when videoTex arrives

  /* Animation loop — simple in-place spin + float */
  const spinRef = useRef(0);  // continuous Y spin (radians)
  const scaleRef = useRef(1);  // ping-pong scale target

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    const heroH = gHeroH || document.getElementById('hero')?.offsetHeight || window.innerHeight;
    const scrollP = clamp(gScrollY / heroH, 0, 1);

    // Continuous slow Y-axis spin
    spinRef.current += 0.005;

    // Ping-pong scale breath
    const pingPong = 1.0 + Math.sin(t * 0.9) * 0.04;
    scaleRef.current = lerp(scaleRef.current, pingPong, 0.06);

    // Float bob
    const bob = Math.sin(t * 0.75) * 0.07;

    groupRef.current.position.set(1.0, bob, 0);
    groupRef.current.rotation.set(0, spinRef.current, 0);
    // Fixed absolute scale — bypasses bounding box uncertainty
    groupRef.current.scale.setScalar(16 * scaleRef.current);

    // Fade out past hero
    const fade = clamp(1 - (scrollP - 0.85) * 10, 0, 1);
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach(m => { m.transparent = true; m.opacity = fade; });
      }
    });
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

/* ── PhoneScene: Fixed full-viewport Canvas ── */
export function PhoneScene() {
  const [mounted, setMounted] = useState(false);
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      const heroH = document.getElementById('hero')?.offsetHeight ?? window.innerHeight;
      const visible = window.scrollY < heroH;
      if (badgesRef.current) {
        badgesRef.current.style.opacity = visible ? '1' : '0';
        badgesRef.current.style.transition = 'opacity 0.4s ease';
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, []);

  if (!mounted) return null;

  return (
    <div
      id="phone-scene"
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 10 }}
    >
      {/* 3-D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 5], fov: 40 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 8, 6]} intensity={2.2} />
        <pointLight position={[-3, 2, 3]} intensity={1.0} color="#FF9933" />
        <pointLight position={[3, -1, 2]} intensity={0.5} color="#3B28CC" />
        <Suspense fallback={null}>
          <IPhone />
          <Environment preset="city" />
        </Suspense>
      </Canvas>

    </div>
  );
}
