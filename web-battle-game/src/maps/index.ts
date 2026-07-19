import { ARENA_PADDING } from '../config.js';
import type { MapConfig } from '../types.js';

export const mapConfigs: MapConfig[] = [
  {
    id: 'square',
    name: 'Square Arena',
    shape: 'square',
    padding: ARENA_PADDING,
  },
  {
    id: 'circle',
    name: 'Circular Arena',
    shape: 'circle',
    padding: ARENA_PADDING,
  },
];

export function getMapConfig(id: string): MapConfig | undefined {
  return mapConfigs.find((map) => map.id === id);
}
