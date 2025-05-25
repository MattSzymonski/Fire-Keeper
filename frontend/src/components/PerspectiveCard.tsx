import React, { useRef } from 'react';

const MaxRotation = 25; 

export default function PerspeciveCard({ imagePath, style }:{ imagePath: string, style: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    const img = imgRef.current;
    if (!card || !img) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -MaxRotation;
    const rotateY = ((x - centerX) / centerX) * MaxRotation;

    img.style.transition = 'none'; // Remove lag during movement
    img.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    const img = imgRef.current;
    if (!img) return;

    img.style.transition = 'transform 0.4s ease'; // Smooth reset
    img.style.transform = `rotateX(0deg) rotateY(0deg)`;
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
        display: 'inline-block',
      }}
    >
      <img
        ref={imgRef}
        src={imagePath}
        alt="COTW Logo"
        className={`h-auto ${style}`}
        style={{
          height: 'auto',
          objectFit: 'contain',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      />
    </div>
  );
};