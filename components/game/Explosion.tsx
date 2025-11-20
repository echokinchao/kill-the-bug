import React from 'react';

interface ExplosionProps {
  x: number;
  y: number;
}

export const Explosion: React.FC<ExplosionProps> = ({ x, y }) => {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
    >
      {/* Core flash */}
      <div className="absolute inset-0 w-16 h-16 bg-white rounded-full animate-[ping_0.5s_ease-out_forwards] opacity-80"></div>
      
      {/* Expanding ring */}
      <div className="absolute inset-0 w-24 h-24 border-4 border-yellow-400 rounded-full animate-[ping_0.4s_ease-out_forwards_0.1s] opacity-60"></div>
      
      {/* Debris particles (simulated with text/shapes for DOM) */}
      <div className="absolute w-4 h-4 bg-red-500 rounded-full animate-[bounce_0.5s_ease-out_forwards] translate-x-8 -translate-y-8 opacity-0"></div>
      <div className="absolute w-3 h-3 bg-orange-500 rounded-full animate-[bounce_0.6s_ease-out_forwards] -translate-x-8 -translate-y-6 opacity-0"></div>
      <div className="absolute w-5 h-5 bg-yellow-300 rounded-full animate-[bounce_0.4s_ease-out_forwards] translate-x-6 translate-y-8 opacity-0"></div>
      <div className="absolute w-2 h-2 bg-white rounded-full animate-[bounce_0.5s_ease-out_forwards] -translate-x-5 translate-y-5 opacity-0"></div>
    </div>
  );
};