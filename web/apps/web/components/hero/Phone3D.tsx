// @ts-nocheck
'use client';

import { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

const MODEL_PATH = '/models/phone.glb';

/* ── iPhone 3D Model ── */
function IPhoneModel({ videoSrc }: { videoSrc?: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const [ready, setReady] = useState(false);

  // Auto-center and auto-scale the model to a normalized size
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Log mesh names for debugging screen texture
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log('[Phone3D] Mesh found:', child.name, '| geometry vertices:', child.geometry?.attributes?.position?.count);
      }
    });

    console.log('[Phone3D] Model native size:', size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));
    console.log('[Phone3D] Model center:', center.x.toFixed(3), center.y.toFixed(3), center.z.toFixed(3));

    // Normalize model to exactly 3 units tall
    const targetHeight = 3;
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = targetHeight / maxDim;

    clonedScene.scale.setScalar(scaleFactor);

    // Re-center at origin after scaling
    const newCenter = center.clone().multiplyScalar(scaleFactor);
    clonedScene.position.set(-newCenter.x, -newCenter.y, -newCenter.z);

    setReady(true);
  }, [clonedScene]);

  // Apply video texture to the "Screen" mesh
  useEffect(() => {
    if (!videoSrc || !ready) return;

    const video = document.createElement('video');
    video.src = videoSrc;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.play().catch(() => {
      setTimeout(() => video.play().catch(() => { }), 1000);
    });

    const tex = new THREE.VideoTexture(video);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name.toLowerCase();
        if (name === 'screen' || name.includes('screen') || name.includes('display')) {
          console.log('[Phone3D] Applying video texture to mesh:', child.name);
          child.material = new THREE.MeshBasicMaterial({
            map: tex,
          });
        }
      }
    });

    return () => {
      video.pause();
      video.src = '';
      tex.dispose();
    };
  }, [videoSrc, ready, clonedScene]);

  // Float + 360° spin
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(t * 0.6) * 0.1;
    groupRef.current.rotation.y = Math.PI + t * 0.5; // Start facing front (screen toward camera) + full spin
  });

  return (
    <group ref={groupRef} dispose={null}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);

/* ── Main Phone3D Component ── */
export function Phone3D() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 500,
        position: 'relative',
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
          <IPhoneModel videoSrc="/videos/hero.mp4" />
          <Environment preset="city" />
          <ContactShadows
            position={[0, -1.6, 0]}
            opacity={0.3}
            scale={5}
            blur={2}
            far={4}
          />
        </Suspense>
      </Canvas>

      {/* Accent glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(var(--sah-accent-1-rgb), 0.08) 0%, transparent 60%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
    </div>
  );
}
