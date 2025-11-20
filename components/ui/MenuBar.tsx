import React, { useEffect, useState } from 'react';

interface MenuBarProps {
  score: number;
  level: number;
  gameStatus: string;
}

export const MenuBar: React.FC<MenuBarProps> = ({ score, level, gameStatus }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PLAYING': return '运行中';
      case 'GAME_OVER': return '系统崩溃';
      case 'LEVEL_COMPLETE': return '完成';
      case 'VICTORY': return '胜利';
      default: return '待机';
    }
  };

  return (
    <div className="h-8 w-full bg-white/40 backdrop-blur-md border-b border-white/20 flex items-center justify-between px-4 text-xs font-medium text-gray-800 fixed top-0 z-50 select-none shadow-sm">
      <div className="flex items-center gap-4">
        <span className="font-bold text-sm"></span>
        <span className="font-semibold">访达</span>
        <span>文件</span>
        <span>编辑</span>
        <span>显示</span>
        <span>前往</span>
        <span>窗口</span>
        <span>帮助</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-black/10 px-2 py-0.5 rounded text-black font-mono">
          关卡: {level}
        </div>
        <div className="bg-black/10 px-2 py-0.5 rounded text-black font-mono">
          得分: {score.toString().padStart(5, '0')}
        </div>
         <div className={`px-2 py-0.5 rounded font-bold ${gameStatus === 'PLAYING' ? 'text-green-700' : 'text-red-600'}`}>
          状态: {getStatusText(gameStatus)}
        </div>
        <span>{time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </div>
  );
};