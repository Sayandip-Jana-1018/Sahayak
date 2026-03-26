'use client';

export function BackgroundOrbs() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Large slow orb — top left */}
      <div
        style={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,40,204,0.12) 0%, transparent 70%)',
          top: '-200px',
          left: '-200px',
          animation: 'orbFloat1 20s ease-in-out infinite',
          filter: 'blur(40px)',
        }}
      />
      {/* Medium orb — right */}
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,44,0.10) 0%, transparent 70%)',
          top: '30%',
          right: '-100px',
          animation: 'orbFloat2 15s ease-in-out infinite',
          filter: 'blur(30px)',
        }}
      />
      {/* Small fast orb — bottom center */}
      <div
        style={{
          position: 'absolute',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,182,122,0.08) 0%, transparent 70%)',
          bottom: '10%',
          left: '40%',
          animation: 'orbFloat3 12s ease-in-out infinite',
          filter: 'blur(25px)',
        }}
      />
    </div>
  );
}
