export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum EntityType {
  BUG_EASY = 'BUG_EASY',
  BUG_MEDIUM = 'BUG_MEDIUM',
  BUG_HARD = 'BUG_HARD',
  BOSS = 'BOSS',
  ITEM_SPRAY = 'ITEM_SPRAY'
}

export interface Entity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: EntityType;
  hp: number;
  maxHp: number;
  rotation: number;
  scale: number;
}

export interface Explosion {
  id: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface GameConfig {
  bossHp: number;
  bugCount: number;
  bugSpeed: number;
  bossName: string;
  themeColor: string;
  timeLimit: number;
}