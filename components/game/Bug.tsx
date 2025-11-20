import React from 'react';
import { Entity, EntityType } from '../../types';

interface BugProps {
  entity: Entity;
  onClick: (id: string, x: number, y: number) => void;
}

export const Bug: React.FC<BugProps> = ({ entity, onClick }) => {
  const isBoss = entity.type === EntityType.BOSS;
  const isItem = entity.type === EntityType.ITEM_SPRAY;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(entity.id, entity.x, entity.y);
  };

  // Render Spray Can Item
  if (isItem) {
    return (
      <div
        className="absolute cursor-pointer select-none flex flex-col items-center justify-center animate-float"
        style={{
          left: entity.x,
          top: entity.y,
          transform: `translate(-50%, -50%) rotate(${entity.rotation}deg) scale(${entity.scale})`,
          zIndex: 40,
          transition: 'top 0.1s linear, left 0.1s linear'
        }}
        onMouseDown={handleClick}
      >
        <svg width="60" height="60" viewBox="0 0 100 100" className="drop-shadow-lg">
           <defs>
             <linearGradient id="sprayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#facc15" />
               <stop offset="50%" stopColor="#eab308" />
               <stop offset="100%" stopColor="#ca8a04" />
             </linearGradient>
           </defs>
           {/* Can Body */}
           <rect x="30" y="30" width="40" height="60" rx="5" fill="url(#sprayGrad)" stroke="white" strokeWidth="2" />
           {/* Label */}
           <rect x="35" y="45" width="30" height="30" rx="2" fill="white" opacity="0.8" />
           <path d="M 45 55 L 55 65 M 55 55 L 45 65" stroke="red" strokeWidth="3" />
           {/* Nozzle/Cap */}
           <rect x="35" y="20" width="30" height="10" fill="#4b5563" />
           <rect x="45" y="10" width="10" height="10" fill="red" />
           {/* Mist Effect */}
           <circle cx="30" cy="15" r="2" fill="white" className="animate-ping" />
           <circle cx="25" cy="10" r="1.5" fill="white" className="animate-ping" style={{animationDelay: '0.2s'}} />
        </svg>
        <div className="mt-1 text-[10px] font-bold text-yellow-300 bg-black/50 px-1 rounded">强力杀虫剂</div>
      </div>
    );
  }

  // Render logic for cute SVG bugs
  const renderBugSVG = () => {
    const colors = {
      [EntityType.BUG_EASY]: { body: '#4ade80', belly: '#86efac', dark: '#16a34a' }, // Green
      [EntityType.BUG_MEDIUM]: { body: '#60a5fa', belly: '#93c5fd', dark: '#2563eb' }, // Blue
      [EntityType.BUG_HARD]: { body: '#f472b6', belly: '#fbcfe8', dark: '#db2777' }, // Pink
      [EntityType.BOSS]: { body: '#ef4444', belly: '#fca5a5', dark: '#991b1b' }, // Red
      [EntityType.ITEM_SPRAY]: { body: '#fff', belly: '#fff', dark: '#fff' }, // Fallback
    };

    const color = colors[entity.type];
    const size = isBoss ? 120 : 60; // Base size unit

    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="overflow-visible"
      >
        <defs>
          <radialGradient id={`grad-${entity.id}`} cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor={color.belly} />
            <stop offset="100%" stopColor={color.body} />
          </radialGradient>
          <filter id={`glow-${entity.id}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Legs */}
        <g className="stroke-current text-gray-800" strokeWidth="6" strokeLinecap="round">
          {/* Left Legs */}
          <path d="M 20 60 Q 10 70 5 80" className="animate-wiggle-left origin-top" />
          <path d="M 20 50 Q 5 50 0 50" className="animate-wiggle-left origin-right" style={{ animationDelay: '0.1s' }} />
          <path d="M 20 40 Q 10 30 5 20" className="animate-wiggle-left origin-bottom" style={{ animationDelay: '0.2s' }} />

          {/* Right Legs */}
          <path d="M 80 60 Q 90 70 95 80" className="animate-wiggle-right origin-top" />
          <path d="M 80 50 Q 95 50 100 50" className="animate-wiggle-right origin-left" style={{ animationDelay: '0.1s' }} />
          <path d="M 80 40 Q 90 30 95 20" className="animate-wiggle-right origin-bottom" style={{ animationDelay: '0.2s' }} />
        </g>

        {/* Antennae */}
        <path d="M 35 25 Q 25 5 15 10" fill="none" stroke={color.dark} strokeWidth="4" strokeLinecap="round" className="animate-antenna" />
        <path d="M 65 25 Q 75 5 85 10" fill="none" stroke={color.dark} strokeWidth="4" strokeLinecap="round" className="animate-antenna" style={{ animationDelay: '0.5s', transformOrigin: 'bottom center' }} />

        {/* Body */}
        <ellipse cx="50" cy="50" rx="35" ry="30" fill={`url(#grad-${entity.id})`} stroke={color.dark} strokeWidth="2" />

        {/* Eyes */}
        <g className="animate-blink">
          <circle cx="35" cy="40" r="8" fill="white" stroke={color.dark} strokeWidth="1" />
          <circle cx="65" cy="40" r="8" fill="white" stroke={color.dark} strokeWidth="1" />
          {/* Pupils */}
          <circle cx="35" cy="40" r="3" fill="black" />
          <circle cx="65" cy="40" r="3" fill="black" />
        </g>

        {/* Mouth */}
        {isBoss ? (
          // Angry mouth
          <path d="M 35 70 Q 50 60 65 70" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        ) : (
          // Happy mouth
          <path d="M 40 65 Q 50 75 60 65" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" />
        )}
        
        {/* Boss Extra Features */}
        {isBoss && (
           <path d="M 30 20 L 40 30 L 50 20 L 60 30 L 70 20" fill="none" stroke={color.dark} strokeWidth="3" />
        )}
      </svg>
    );
  };

  return (
    <div
      className="absolute cursor-crosshair select-none bug-container flex flex-col items-center justify-center animate-float"
      style={{
        left: entity.x,
        top: entity.y,
        transform: `translate(-50%, -50%) rotate(${entity.rotation}deg) scale(${entity.scale})`,
        zIndex: isBoss ? 30 : 20,
        transition: 'top 0.1s linear, left 0.1s linear'
      }}
      onMouseDown={handleClick}
    >
      {/* Health bar for Boss */}
      {isBoss && (
        <div className="absolute -top-10 w-32 h-3 bg-gray-900 rounded-full border border-white/30 overflow-hidden shadow-lg z-50">
          <div
            className="h-full bg-gradient-to-r from-red-500 to-pink-600 transition-all duration-200"
            style={{ width: `${(entity.hp / entity.maxHp) * 100}%` }}
          />
        </div>
      )}

      {/* The SVG Bug */}
      <div className="relative">
        {renderBugSVG()}
      </div>
    </div>
  );
};