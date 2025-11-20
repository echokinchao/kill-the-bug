import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MenuBar } from './components/ui/MenuBar';
import { Dock } from './components/ui/Dock';
import { Bug } from './components/game/Bug';
import { Explosion } from './components/game/Explosion';
import { GameStatus, Entity, EntityType, GameConfig } from './types';
import { generateSystemMessage, generateBossTaunt } from './services/geminiService';

// --- Configuration ---
const LEVELS: Record<number, GameConfig> = {
  1: { bossHp: 15, bugCount: 12, bugSpeed: 2, bossName: 'Trojan.Win32', themeColor: '', timeLimit: 60 },
  2: { bossHp: 40, bugCount: 25, bugSpeed: 3.5, bossName: 'Worm.NetSky', themeColor: '', timeLimit: 90 },
  3: { bossHp: 80, bugCount: 40, bugSpeed: 5, bossName: 'Ransom.WannaCry', themeColor: '', timeLimit: 120 },
};

const FPS = 60;

function App() {
  // --- State ---
  const [level, setLevel] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [explosions, setExplosions] = useState<{ id: string, x: number, y: number }[]>([]);
  const [systemMessage, setSystemMessage] = useState<string>("系统安全。等待指令...");
  const [bossTaunt, setBossTaunt] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  // --- Refs for Game Loop ---
  const requestRef = useRef<number>(0);
  const entitiesRef = useRef<Entity[]>([]);
  const frameCount = useRef(0);
  const gameBounds = useRef({ width: window.innerWidth, height: window.innerHeight });

  // --- Game Logic Helpers ---
  const spawnEntity = (type: EntityType) => {
    const padding = 50;
    const { width, height } = gameBounds.current;
    
    const isBoss = type === EntityType.BOSS;
    const isItem = type === EntityType.ITEM_SPRAY;
    
    // Determine speed based on type
    let speedMultiplier = 1;
    if (isBoss) speedMultiplier = 2;
    if (isItem) speedMultiplier = 0.5;

    const newEntity: Entity = {
      id: Math.random().toString(36).substr(2, 9),
      x: Math.random() * (width - padding * 2) + padding,
      y: Math.random() * (height - 250) + 80, // Keep away from dock and icons
      vx: (Math.random() - 0.5) * LEVELS[level].bugSpeed * speedMultiplier,
      vy: (Math.random() - 0.5) * LEVELS[level].bugSpeed * speedMultiplier,
      type: type,
      hp: isBoss ? LEVELS[level].bossHp : 1,
      maxHp: isBoss ? LEVELS[level].bossHp : 1,
      rotation: 0,
      scale: isBoss ? 1 : (isItem ? 1 : 0.8 + Math.random() * 0.4)
    };
    
    entitiesRef.current.push(newEntity);
  };

  const startGame = async (startLevel = 1) => {
    setLevel(startLevel);
    setScore(startLevel === 1 ? 0 : score);
    setEntities([]);
    entitiesRef.current = [];
    setExplosions([]);
    setBossTaunt("");
    setTimeLeft(LEVELS[startLevel].timeLimit);
    
    setStatus(GameStatus.PLAYING);

    // Initial Spawns
    for (let i = 0; i < LEVELS[startLevel].bugCount; i++) {
      spawnEntity(EntityType.BUG_EASY);
    }

    // Trigger Gemini for flavor text
    const msg = await generateSystemMessage(startLevel, LEVELS[startLevel].bossName);
    setSystemMessage(msg);
  };

  const spawnBoss = async () => {
    spawnEntity(EntityType.BOSS);
    const taunt = await generateBossTaunt(LEVELS[level].bossName);
    setBossTaunt(taunt);
    setSystemMessage(`警告：${LEVELS[level].bossName} 已进入系统内存。`);
  };

  const useInsecticide = () => {
    // Find up to 3 random bugs (not boss, not other items)
    const targets = entitiesRef.current.filter(e => e.type !== EntityType.BOSS && e.type !== EntityType.ITEM_SPRAY);
    const toKill: Entity[] = [];
    
    // Kill up to 3 bugs to make the item useful
    for (let i = 0; i < 3; i++) {
      if (targets.length === 0) break;
      const randomIndex = Math.floor(Math.random() * targets.length);
      toKill.push(targets[randomIndex]);
      targets.splice(randomIndex, 1);
    }

    toKill.forEach(bug => {
      // Trigger explosion for each
      const expId = Math.random().toString();
      setExplosions(prev => [...prev, { id: expId, x: bug.x, y: bug.y }]);
      setTimeout(() => setExplosions(prev => prev.filter(e => e.id !== expId)), 600);
      
      // Remove from main array
      const idx = entitiesRef.current.indexOf(bug);
      if (idx > -1) {
        entitiesRef.current.splice(idx, 1);
        setScore(prev => prev + 100);
      }
    });
  };

  const handleEntityClick = (id: string, x: number, y: number) => {
    if (status !== GameStatus.PLAYING) return;

    const entityIndex = entitiesRef.current.findIndex(e => e.id === id);
    if (entityIndex === -1) return;

    const entity = entitiesRef.current[entityIndex];

    // Handle Item Click
    if (entity.type === EntityType.ITEM_SPRAY) {
      entitiesRef.current.splice(entityIndex, 1);
      useInsecticide();
      setEntities([...entitiesRef.current]);
      return;
    }

    // Handle Bug/Boss Damage
    entity.hp -= 1;
    entity.scale = Math.max(0.8, entity.scale * 1.2); // React to hit

    // Add explosion effect
    const expId = Math.random().toString();
    setExplosions(prev => [...prev, { id: expId, x, y }]);
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== expId));
    }, 600);

    if (entity.hp <= 0) {
      // Kill
      entitiesRef.current.splice(entityIndex, 1);
      setScore(prev => prev + (entity.type === EntityType.BOSS ? 1000 : 100));
      
      if (entity.type === EntityType.BOSS) {
        handleLevelComplete();
      }
    } else {
      // Hit feedback (teleport slightly + speed up)
      entity.vx = -entity.vx * 1.5;
      entity.vy = -entity.vy * 1.5;
    }

    // Force update state for render
    setEntities([...entitiesRef.current]);
  };

  const handleLevelComplete = () => {
    setStatus(GameStatus.LEVEL_COMPLETE);
    if (level < 3) {
       setSystemMessage("威胁已清除。系统升级中...");
    } else {
       setStatus(GameStatus.VICTORY);
       setSystemMessage("所有威胁已清除。系统安全。");
    }
  };

  const nextLevel = () => {
    startGame(level + 1);
  };

  // --- Game Loop ---
  const update = useCallback(() => {
    if (status !== GameStatus.PLAYING) return;

    frameCount.current++;
    const bounds = gameBounds.current;

    // Timer Logic (roughly every second)
    if (frameCount.current % 60 === 0) {
      setTimeLeft(prev => {
        if (prev <= 1) {
           setStatus(GameStatus.GAME_OVER);
           return 0;
        }
        return prev - 1;
      });
    }

    // Spawn Boss Condition
    const hasBoss = entitiesRef.current.some(e => e.type === EntityType.BOSS);
    const bugCount = entitiesRef.current.filter(e => e.type !== EntityType.BOSS && e.type !== EntityType.ITEM_SPRAY).length;

    // If no bugs left and no boss, spawn more bugs or boss
    if (bugCount === 0 && !hasBoss) {
        spawnBoss();
    } else if (bugCount < 5 && !hasBoss && frameCount.current % 60 === 0) {
        // Replenish minions quickly if low to maintain chaos
        spawnEntity(level === 3 ? EntityType.BUG_HARD : EntityType.BUG_MEDIUM);
    }

    // Random Item Drop (Insecticide) 
    // Probability reduced from 0.005 (0.5%) to 0.001 (0.1%) per frame (approx once every 16 seconds)
    // Only spawn if there are bugs to kill and not too many sprays already
    const sprayCount = entitiesRef.current.filter(e => e.type === EntityType.ITEM_SPRAY).length;
    if (Math.random() < 0.001 && bugCount > 5 && sprayCount < 2) {
       spawnEntity(EntityType.ITEM_SPRAY);
    }

    // Move Entities
    entitiesRef.current.forEach(entity => {
      entity.x += entity.vx;
      entity.y += entity.vy;
      
      // Gentle rotation based on velocity
      entity.rotation = Math.sin(frameCount.current * 0.1) * 10;

      // Wall Bounce
      if (entity.x <= 0 || entity.x >= bounds.width) {
        entity.vx *= -1;
        entity.x = Math.max(0, Math.min(entity.x, bounds.width));
      }
      if (entity.y <= 40 || entity.y >= bounds.height - 120) { 
        entity.vy *= -1;
        entity.y = Math.max(40, Math.min(entity.y, bounds.height - 120));
      }
    });

    setEntities([...entitiesRef.current]);
    requestRef.current = requestAnimationFrame(update);
  }, [status, level]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [update]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      gameBounds.current = { width: window.innerWidth, height: window.innerHeight };
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Desktop Components ---
  const DesktopIcon = ({ name, color, type }: { name: string, color: string, type: 'drive' | 'folder' }) => (
    <div className="flex flex-col items-center gap-1 w-20 mb-6 group cursor-pointer z-10">
      {type === 'drive' ? (
         <div className="w-16 h-16 bg-gray-800/80 border-2 border-cyan-500/50 rounded shadow-[0_0_15px_rgba(6,182,212,0.5)] relative flex items-center justify-center group-active:bg-cyan-900/50 backdrop-blur-sm">
           <div className="w-12 h-2 bg-cyan-500/30 absolute top-3 rounded-sm"></div>
           <div className="w-2 h-2 bg-cyan-400 rounded-full absolute bottom-2 right-2 animate-pulse"></div>
         </div>
      ) : (
        <div className="w-16 h-14 bg-purple-900/60 border border-purple-500/50 rounded-md shadow-[0_0_10px_rgba(168,85,247,0.3)] relative flex items-center justify-center group-active:bg-purple-800/60 backdrop-blur-sm">
           <div className="absolute -top-1 left-0 w-6 h-2 bg-purple-500/50 rounded-t-md"></div>
           <div className="w-full h-[1px] bg-purple-400/30 absolute top-0"></div>
        </div>
      )}
      <span className="text-cyan-100 text-[10px] font-mono drop-shadow-md bg-black/60 rounded px-2 py-0.5 group-active:text-white tracking-wider text-center leading-tight">{name}</span>
    </div>
  );

  // --- Render Helpers ---

  const renderOverlay = () => {
    if (status === GameStatus.IDLE) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900/90 backdrop-blur-xl p-8 rounded border border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] text-center max-w-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500"></div>
            <div className="mb-4 text-6xl animate-pulse">🛡️</div>
            <h1 className="text-2xl font-bold text-cyan-400 mb-2 font-mono uppercase tracking-widest">系统防御</h1>
            <p className="text-gray-300 mb-6 text-xs font-mono">神经网络已受损。检测到未授权实体。启动清除协议。</p>
            <button 
              onClick={() => startGame(1)}
              className="bg-cyan-600 hover:bg-cyan-500 text-black px-8 py-2 rounded-sm font-bold font-mono shadow-[0_0_10px_rgba(6,182,212,0.6)] transition active:scale-95 uppercase clip-path-button"
            >
              启动防御程序
            </button>
          </div>
        </div>
      );
    }

    if (status === GameStatus.GAME_OVER) {
       return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/40 backdrop-blur-md">
          <div className="bg-black/90 p-8 rounded border-2 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.5)] text-center max-w-md">
            <div className="mb-4 text-6xl">☠️</div>
            <h1 className="text-4xl font-bold text-red-500 mb-2 font-mono glitch-text">系统崩溃</h1>
            <p className="text-red-300 mb-6 font-mono">核心已损坏。数据丢失。</p>
            <button 
              onClick={() => startGame(1)}
              className="bg-red-600 hover:bg-red-500 text-white px-8 py-2 rounded-sm font-bold font-mono uppercase shadow-lg transition active:scale-95"
            >
              重启系统
            </button>
          </div>
        </div>
      );
    }

    if (status === GameStatus.LEVEL_COMPLETE) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-gray-900/90 p-8 rounded border border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] text-center max-w-md">
            <div className="mb-4 text-6xl">✅</div>
            <h2 className="text-xl font-bold text-green-400 mb-2 font-mono">威胁等级 {level} 已清除</h2>
            <p className="text-gray-400 mb-6 text-sm font-mono">系统完整性恢复中... 准备应对下一波攻击。</p>
            <button 
              onClick={nextLevel}
              className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-sm font-bold font-mono shadow-lg transition active:scale-95"
            >
              继续
            </button>
          </div>
        </div>
      );
    }

    if (status === GameStatus.VICTORY) {
      return (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xl">
          <div className="bg-white/10 p-10 rounded-3xl shadow-2xl text-center max-w-lg border border-white/20 backdrop-blur-2xl">
            <div className="mb-6 text-8xl animate-pulse">✨</div>
            <h1 className="text-3xl font-bold text-white mb-4 font-mono">所有系统安全</h1>
            <p className="text-gray-300 mb-8">Rootkits 已清除。祝您使用愉快。</p>
            <div className="text-xl font-mono font-bold text-cyan-300 mb-8">最终得分: {score}</div>
            <button 
              onClick={() => startGame(1)}
              className="bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-3 rounded font-bold shadow-xl transition active:scale-95"
            >
              重新启动
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    // Cyberpunk Theme Background
    <div className={`w-screen h-screen overflow-hidden bg-cover bg-center relative cursor-default select-none font-['Inter']`}
         style={{
           backgroundImage: 'url("https://images.unsplash.com/photo-1605218427360-6954be8c913d?q=80&w=2624&auto=format&fit=crop")'
         }}
    >
      {/* Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] bg-[length:100%_2px,3px_100%]"></div>

      <MenuBar score={score} level={level} gameStatus={status} />

      {/* Desktop Icons (Right Side) */}
      <div className="absolute top-12 right-4 flex flex-col items-end z-20">
        {/* System Critical Warning Box */}
        <div className={`mb-6 w-64 transition-all duration-500 ${status === GameStatus.PLAYING ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
           <div className={`bg-black/80 border-l-4 p-3 backdrop-blur-md shadow-lg ${timeLeft < 10 ? 'border-red-600 animate-pulse' : 'border-yellow-500'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold font-mono uppercase ${timeLeft < 10 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {timeLeft < 10 ? '严重错误' : '系统警告'}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">错误代码_2077</span>
              </div>
              <div className="text-gray-200 text-xs leading-tight font-mono mb-2">
                 恶意软件正在侵蚀核心扇区。
                 <br/>
                 数据永久丢失倒计时：
              </div>
              <div className="text-2xl font-black font-mono text-right text-white">
                 {formatTime(timeLeft)}
              </div>
           </div>
        </div>

        <DesktopIcon name="系统核心" color="gray" type="drive" />
        <DesktopIcon name="绝密文件" color="blue" type="folder" />
        <DesktopIcon name="数据备份" color="blue" type="folder" />
      </div>

      {/* Game Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <div className="w-full h-full relative pointer-events-auto">
          {entities.map(entity => (
            <Bug key={entity.id} entity={entity} onClick={handleEntityClick} />
          ))}
          {explosions.map(exp => (
            <Explosion key={exp.id} x={exp.x} y={exp.y} />
          ))}
        </div>
      </div>

      {/* Notification / Message Log */}
      {(systemMessage || bossTaunt) && status === GameStatus.PLAYING && (
        <div className="absolute bottom-24 right-4 w-80 bg-black/70 backdrop-blur-xl border border-cyan-500/30 p-4 z-30 animate-slide-up shadow-[0_0_20px_rgba(6,182,212,0.2)]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-cyan-900/50 border border-cyan-500 rounded flex items-center justify-center text-xs text-cyan-300 font-mono">CMD</div>
            <div>
              <div className="text-xs font-bold text-cyan-400 font-mono tracking-wider">网络安全协议</div>
            </div>
          </div>
          <div className="text-sm text-cyan-100 font-mono leading-snug">
             <span className="text-green-400 mr-2">{'>'}</span>
             {systemMessage}
             {bossTaunt && (
               <div className="mt-2 p-2 bg-red-900/30 text-red-300 rounded text-xs font-bold border-l-2 border-red-600">
                 入侵者: "{bossTaunt}"
               </div>
             )}
          </div>
        </div>
      )}

      {renderOverlay()}
      <Dock />
    </div>
  );
}

export default App;