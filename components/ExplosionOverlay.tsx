
import React, { useEffect, useState, useRef } from 'react';
import { Particle, GrenadeType } from '../types';

interface ExplosionOverlayProps {
  explosions: Particle[];
}

const ExplosionOverlay: React.FC<ExplosionOverlayProps> = ({ explosions }) => {
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [isFireFlashing, setIsFireFlashing] = useState(false);
  const explosionIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (explosions.length > 0) {
      const latest = explosions[explosions.length - 1];
      
      if (!explosionIdsRef.current.has(latest.id)) {
        explosionIdsRef.current.add(latest.id);
        
        if (latest.type === GrenadeType.FRAG) {
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 500);
        }
        if (latest.type === GrenadeType.STUN) {
          setIsFlashing(true);
          setTimeout(() => setIsFlashing(false), 1500);
        }
        if (latest.type === GrenadeType.INCENDIARY) {
          setIsFireFlashing(true);
          setTimeout(() => setIsFireFlashing(false), 800);
        }
      }
    }
  }, [explosions]);

  return (
    <div className={`fixed inset-0 pointer-events-none z-[100] ${isShaking ? 'shake' : ''}`}>
      {isFlashing && <div className="absolute inset-0 bg-white flash-effect"></div>}
      {isShaking && <div className="absolute inset-0 bg-red-600/30 blur-xl"></div>}
      {isFireFlashing && <div className="absolute inset-0 bg-orange-600/40 mix-blend-screen transition-opacity duration-700"></div>}

      {explosions.map(e => {
        const xPos = e.x;
        const yPos = e.y;

        switch (e.type) {
          case GrenadeType.SMOKE:
            return (
              <div 
                key={e.id}
                className="absolute rounded-full bg-gray-500/80 smoke-particle blur-3xl w-[500px] h-[400px]"
                style={{ left: `${xPos}%`, top: `${yPos - 10}%`, transform: 'translate(-50%, -50%)' }}
              />
            );

          case GrenadeType.INCENDIARY:
            return (
              <React.Fragment key={e.id}>
                <div 
                  className="absolute rounded-full bg-orange-600/70 smoke-particle blur-2xl w-80 h-80"
                  style={{ left: `${xPos}%`, top: `${yPos - 10}%`, transform: 'translate(-50%, -50%)' }}
                />
                <div 
                  className="absolute w-64 h-64 bg-yellow-500/20 rounded-full heat-distortion"
                  style={{ left: `${xPos}%`, top: `${yPos - 20}%`, transform: 'translate(-50%, -50%)' }}
                />
                {/* Primary Embers */}
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={`${e.id}-emb-${i}`}
                    className="absolute w-3 h-3 bg-yellow-400 rounded-full ember-particle shadow-[0_0_8px_orange]"
                    style={{ 
                      left: `${xPos + (Math.random() * 15 - 7.5)}%`, 
                      top: `${yPos}%`,
                      animationDelay: `${Math.random() * 0.8}s`
                    }}
                  />
                ))}
                {/* Secondary Rapid Sparks */}
                {[...Array(15)].map((_, i) => {
                  const angle = Math.random() * 360;
                  const distance = 50 + Math.random() * 100;
                  const tx = Math.cos((angle * Math.PI) / 180) * distance;
                  const ty = Math.sin((angle * Math.PI) / 180) * distance;
                  return (
                    <div 
                      key={`${e.id}-spark-${i}`}
                      className="absolute w-1 h-1 bg-white rounded-full secondary-spark shadow-[0_0_4px_yellow]"
                      style={{ 
                        left: `${xPos}%`, 
                        top: `${yPos}%`,
                        '--tw-translate-x': `${tx}px`,
                        '--tw-translate-y': `${ty}px`
                      } as any}
                    />
                  );
                })}
              </React.Fragment>
            );

          case GrenadeType.STICKY:
            return (
              <React.Fragment key={e.id}>
                <div 
                  className="absolute rounded-full bg-purple-900/90 sticky-splat blur-sm w-56 h-40"
                  style={{ left: `${xPos}%`, top: `${yPos}%`, transform: 'translate(-50%, -85%) scaleX(1.4)' }}
                />
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={`${e.id}-spl-${i}`}
                    className="absolute bg-purple-700 rounded-full sticky-splat"
                    style={{ 
                      width: `${20 + Math.random() * 40}px`, 
                      height: `${20 + Math.random() * 40}px`,
                      left: `${xPos + (Math.random() * 30 - 15)}%`, 
                      top: `${yPos - (Math.random() * 20)}%`,
                      animationDelay: `${i * 0.08}s`
                    }}
                  />
                ))}
              </React.Fragment>
            );

          case GrenadeType.STUN:
            return (
              <div 
                key={e.id}
                className="absolute border-[40px] border-blue-100 rounded-full shockwave"
                style={{ left: `${xPos}%`, top: `${yPos}%`, width: '150px', height: '150px', marginLeft: '-75px', marginTop: '-75px' }}
              />
            );

          case GrenadeType.FRAG:
            return (
              <React.Fragment key={e.id}>
                <div className="absolute bg-white/90 w-12 h-12 rounded-full blur-md flash-effect" style={{ left: `${xPos}%`, top: `${yPos}%`, transform: 'translate(-50%, -50%)' }} />
                {/* Large Fragments */}
                {[...Array(30)].map((_, i) => {
                  const angle = (i / 30) * 360;
                  const distance = 300 + Math.random() * 300;
                  const tx = Math.cos((angle * Math.PI) / 180) * distance;
                  const ty = Math.sin((angle * Math.PI) / 180) * distance;
                  return (
                    <div 
                      key={`${e.id}-frag-${i}`}
                      className="absolute w-3 h-5 bg-gray-500 rounded-sm frag-fragment border border-black/30"
                      style={{ left: `${xPos}%`, top: `${yPos}%`, '--tw-translate-x': `${tx}px`, '--tw-translate-y': `${ty}px` } as any}
                    />
                  );
                })}
                {/* Secondary Short-lived Shrapnel */}
                {[...Array(20)].map((_, i) => {
                  const angle = Math.random() * 360;
                  const distance = 100 + Math.random() * 150;
                  const tx = Math.cos((angle * Math.PI) / 180) * distance;
                  const ty = Math.sin((angle * Math.PI) / 180) * distance;
                  return (
                    <div 
                      key={`${e.id}-tiny-frag-${i}`}
                      className="absolute w-1 h-1 bg-yellow-500 rounded-full secondary-spark shadow-[0_0_2px_orange]"
                      style={{ 
                        left: `${xPos}%`, 
                        top: `${yPos}%`,
                        '--tw-translate-x': `${tx}px`,
                        '--tw-translate-y': `${ty}px`
                      } as any}
                    />
                  );
                })}
              </React.Fragment>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};

export default ExplosionOverlay;
