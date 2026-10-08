import React, { useEffect, useRef } from 'react';
import globeImg from '../assets/globe_3d.jpg';

const Interactive3DGlobe = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = 300);
    let height = (canvas.height = 300);
    let rotation = 0;

    // Create 3D sphere particles
    const particleCount = 120;
    const particles = [];
    const radius = 105;

    for (let i = 0; i < particleCount; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      particles.push({ theta, phi, size: Math.random() * 2 + 1, alpha: Math.random() * 0.7 + 0.3 });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      rotation += 0.012;

      // Draw outer glowing halo
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.25);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      grad.addColorStop(0.5, 'rgba(99, 102, 241, 0.12)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // Draw rotating latitude rings
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.18)';
      ctx.lineWidth = 1.2;
      for (let lat = -60; lat <= 60; lat += 30) {
        const radLat = (lat * Math.PI) / 180;
        const r = radius * Math.cos(radLat);
        const y = cy + radius * Math.sin(radLat);
        ctx.beginPath();
        ctx.ellipse(cx, y, r, r * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw orbiting cyber ring
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, radius * 1.35, radius * 0.45, rotation * 0.4, 0, Math.PI * 2);
      ctx.stroke();

      // Draw and project 3D particles on rotating sphere
      particles.forEach((p) => {
        const currentPhi = p.phi + rotation;
        const x3d = radius * Math.sin(p.theta) * Math.cos(currentPhi);
        const y3d = radius * Math.cos(p.theta);
        const z3d = radius * Math.sin(p.theta) * Math.sin(currentPhi);

        // Perspective projection
        const scale = (z3d + radius * 1.5) / (radius * 2.5);
        if (scale > 0.2) {
          const x2d = cx + x3d * 0.95;
          const y2d = cy + y3d * 0.95;

          const dotColor = z3d > 0 ? 'rgba(56, 189, 248, ' + (p.alpha * scale) + ')' : 'rgba(99, 102, 241, ' + (p.alpha * 0.3 * scale) + ')';
          ctx.fillStyle = dotColor;
          ctx.beginPath();
          ctx.arc(x2d, y2d, p.size * scale * (z3d > 0 ? 1.4 : 0.8), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="globe-3d-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* 3D Visual Globe Render Background */}
      <div
        style={{
          width: '280px',
          height: '280px',
          borderRadius: '50%',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 0 50px rgba(56, 189, 248, 0.35), inset 0 0 30px rgba(0,0,0,0.8)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
        }}
      >
        <img
          src={globeImg}
          alt="3D Holographic Globe"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'contrast(1.15) brightness(1.1)',
            transform: 'scale(1.05)',
          }}
        />
        {/* Holographic scanning overlay */}
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        />
      </div>
    </div>
  );
};

export default Interactive3DGlobe;
