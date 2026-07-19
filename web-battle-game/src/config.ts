export const CANVAS_WIDTH = 900;
export const CANVAS_HEIGHT = 600;
export const ARENA_PADDING = 50;
export const CHARACTER_RADIUS = 30;
export const DEBUG_DRAW_VELOCITY = false;

export const GAME_STATES = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  GAME_OVER: 'GAME_OVER',
} as const;

export const CHARACTER_IDS = {
  cr7: 'cr7',
  messi: 'messi',
  firefighter: 'firefighter',
  police: 'police',
  thief: 'thief',
  cowboy: 'cowboy',
} as const;
