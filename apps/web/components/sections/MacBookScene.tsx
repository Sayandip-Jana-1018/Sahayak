// @ts-nocheck
'use client';

/**
 * MacBookScene — position:fixed canvas, visible during hero + story zones.
 *
 * HERO zone: MacBook CENTRED, lid CLOSED, viewed from a steep top-front angle
 * STORY zone: camera transitions to front view, lid opens, shows frames, then vanishes
 *
 * The model is rotated 180° on Y so the Apple logo faces the camera from above.
 * Lid rotation uses a programmatic pivot at the hinge to ensure perfect folding.
 */

import { useRef, useEffect, useMemo, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

const MODEL = '/models/model.glb';
const LID_NODE = 'VCQqxpxkUlzqcJI_62';
const LID_CLOSED = 1.65; // ~95 degrees (closed over keyboard)
const LID_OPEN = 0;

const FRAME_SRCS = [
  '/story/frame1.png',
  '/story/frame2.png',
  '/story/frame3.png',
  '/story/frame4.png',
];

/* ── math ── */
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const norm = (v: number, lo: number, hi: number) => clamp((v - lo) / (hi - lo), 0, 1);
const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

/* ── global scroll ── */
let gScrollY = 0;
if (typeof window !== 'undefined')
  window.addEventListener('scroll', () => { gScrollY = window.scrollY; }, { passive: true });

/* ═══════════════════════════════════
   Animated camera rig
   Hero: steep top-front angle
   Story: transitions to front view
   ═══════════════════════════════════ */
function CameraRig() {
  const { camera } = useThree();

  // Steep top-down angle — closer for bigger hero presence
  const TOP_POS = new THREE.Vector3(0, 4.5, 5);
  const FRONT_POS = new THREE.Vector3(0, 1.2, 5.5);
  const LOOK_AT = new THREE.Vector3(0, 0, 0);

  const prevPos = useRef(TOP_POS.clone());

  useFrame(() => {
    const heroEl = document.getElementById('hero');
    const storyEl = document.getElementById('macbook-story');
    if (!heroEl || !storyEl) return;

    const heroH = heroEl.offsetHeight;
    const storyH = storyEl.offsetHeight;

    let targetPos = TOP_POS;

    if (gScrollY < heroH) {
      targetPos = TOP_POS;
    } else {
      const rawSP = gScrollY - heroH;
      const sp = clamp(rawSP / storyH, 0, 1);
      const camP = ease(norm(sp, 0, 0.25));
      targetPos = new THREE.Vector3(
        lerp(TOP_POS.x, FRONT_POS.x, camP),
        lerp(TOP_POS.y, FRONT_POS.y, camP),
        lerp(TOP_POS.z, FRONT_POS.z, camP),
      );
    }

    prevPos.current.lerp(targetPos, 0.06);
    camera.position.copy(prevPos.current);
    camera.lookAt(LOOK_AT);
  });

  return null;
}

/* ═══════════════════════════════════
   3-D MacBook
   ═══════════════════════════════════ */
function MacBook3D() {
  const { scene } = useGLTF(MODEL);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const groupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group | null>(null);   // Programmatic hinge pivot
  const screenRef = useRef<THREE.Mesh | null>(null);
  const textures = useRef<(THREE.Texture | null)[]>([null, null, null, null]);
  const frameIdx = useRef(-1);

  /* ── Find nodes, build hinge pivot, & scale ── */
  useEffect(() => {
    // 1. Scale model to a comfortable 3-unit size
    const box = new THREE.Box3().setFromObject(cloned);
    const sz = box.getSize(new THREE.Vector3());
    const c = box.getCenter(new THREE.Vector3());
    const sf = 3.0 / Math.max(sz.x, sz.y, sz.z);
    cloned.scale.setScalar(sf);
    cloned.position.sub(c.multiplyScalar(sf));

    // 2. Find lid node and screen mesh
    let lidNode: THREE.Object3D | null = null;
    cloned.traverse((obj) => {
      if (obj.name === LID_NODE) lidNode = obj;
      if (obj instanceof THREE.Mesh && obj.name === 'Screen') screenRef.current = obj;
    });

    // 3. Create a programmatic hinge pivot
    if (lidNode) {
      // Find the lid's bounding box to locate the hinge (bottom back edge)
      const lidBox = new THREE.Box3().setFromObject(lidNode);
      const hingePos = new THREE.Vector3(
        (lidBox.min.x + lidBox.max.x) / 2,   // center X
        lidBox.min.y,                          // bottom Y (the hinge edge)
        lidBox.max.z,                          // back Z
      );

      // Create pivot group at the exact hinge position
      const pivot = new THREE.Group();
      pivot.position.copy(hingePos);

      // Re-parent the lid from its current parent into our new pivot
      const lidParent = lidNode.parent;
      if (lidParent) {
        lidParent.add(pivot);
        lidParent.remove(lidNode);
        pivot.add(lidNode);

        // Offset the lid so its hinge aligns with the pivot origin
        lidNode.position.sub(hingePos);
      }

      pivotRef.current = pivot;

      // Start lid CLOSED
      pivot.rotation.x = LID_CLOSED;
    }
  }, [cloned]);

  /* ── Preload story frames ── */
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    FRAME_SRCS.forEach((src, i) => {
      loader.load(src, (t) => {
        t.flipY = true;
        t.colorSpace = THREE.SRGBColorSpace;
        t.minFilter = THREE.LinearFilter;
        textures.current[i] = t;
      });
    });
  }, []);

  /* ── Apply frame to screen ── */
  const applyFrame = (idx: number) => {
    if (idx === frameIdx.current) return;
    if (!screenRef.current || !textures.current[idx]) return;
    frameIdx.current = idx;
    screenRef.current.material = new THREE.MeshBasicMaterial({
      map: textures.current[idx]!,
      side: THREE.DoubleSide,
    });
  };

  /* ── Animated scroll loop ── */
  const prevLidAngle = useRef(LID_CLOSED);
  const prevScale = useRef(0.65);
  const prevY = useRef(0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    const heroEl = document.getElementById('hero');
    const storyEl = document.getElementById('macbook-story');
    if (!heroEl || !storyEl) return;

    const heroH = heroEl.offsetHeight;
    const storyH = storyEl.offsetHeight;

    // Drop the laptop down significantly so it anchors the bottom of the screen
    // This gives the text plenty of room above it
    const bob = Math.sin(t * 0.7) * 0.03 - 0.4; // Base Y is -0.4

    /* ─── HERO ZONE ─── */
    if (gScrollY < heroH) {
      groupRef.current.position.set(0, bob, 0);
      groupRef.current.scale.setScalar(0.68); // slightly larger
      groupRef.current.visible = true;
      prevScale.current = 0.68;
      prevY.current = bob;

      if (pivotRef.current) {
        prevLidAngle.current = lerp(prevLidAngle.current, LID_CLOSED, 0.08);
        pivotRef.current.rotation.x = prevLidAngle.current;
      }

      setGroupOpacity(cloned, 1);
      return;
    }

    /* ─── STORY ZONE ─── */
    const rawSP = gScrollY - heroH;
    if (rawSP < storyH) {
      const sp = clamp(rawSP / storyH, 0, 1);

      // Open phase 0→25%
      const openP = ease(norm(sp, 0, 0.25));
      const targetLid = lerp(LID_CLOSED, LID_OPEN, openP);
      prevLidAngle.current = lerp(prevLidAngle.current, targetLid, 0.1);
      if (pivotRef.current) pivotRef.current.rotation.x = prevLidAngle.current;

      // Scale 0.68 → 0.85
      const targetScale = lerp(0.68, 0.85, ease(norm(sp, 0, 0.30)));
      prevScale.current = lerp(prevScale.current, targetScale, 0.08);

      // Push up from -0.4 to center screen for the story view
      const targetY = lerp(bob, bob + 0.8, ease(norm(sp, 0, 0.20)));
      prevY.current = lerp(prevY.current, targetY, 0.1);

      // Close + shrink 65→85%
      const closeP = ease(norm(sp, 0.65, 0.85));
      const finalScale = lerp(prevScale.current, 0.0, closeP);
      if (pivotRef.current && sp > 0.65) {
        const closedAngle = lerp(LID_OPEN, LID_CLOSED, closeP);
        pivotRef.current.rotation.x = lerp(pivotRef.current.rotation.x, closedAngle, 0.1);
      }

      groupRef.current.position.set(0, prevY.current, 0);
      groupRef.current.scale.setScalar(finalScale);
      setGroupOpacity(cloned, lerp(1, 0, closeP));
      groupRef.current.visible = finalScale > 0.01;

      // Story frames 25%–86%
      if (sp >= 0.24 && sp < 0.86) {
        const frameP = norm(sp, 0.25, 0.82);
        const idx = Math.min(Math.floor(frameP * 4), 3);
        applyFrame(idx);
      }
      return;
    }

    /* ─── PAST STORY ─── */
    groupRef.current.visible = false;
    setGroupOpacity(cloned, 0);
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={cloned} />
    </group>
  );
}

/* ── Opacity helper ── */
function setGroupOpacity(scene: THREE.Object3D, opacity: number) {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach(m => { m.transparent = true; m.opacity = opacity; });
    }
  });
}

useGLTF.preload(MODEL);

/* ═══════════════════════════════
   MAIN EXPORT — position: fixed
   ═══════════════════════════════ */
export function MacBookScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      id="macbook-scene"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <Canvas
        camera={{ position: [0, 5.5, 2.5], fov: 38 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2)]}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 8, 5]} intensity={1.8} />
        <pointLight position={[-3, 3, 3]} intensity={0.5} color="#FF9933" />
        <pointLight position={[3, -1, 2]} intensity={0.3} color="#6C63FF" />
        <Suspense fallback={null}>
          <CameraRig />
          <MacBook3D />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
}
