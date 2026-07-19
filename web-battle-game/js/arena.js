import { ARENA_PADDING } from './config.js';

export function getArenaBounds(canvas, shape) {
  const center = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };

  const size = Math.min(canvas.width, canvas.height) - ARENA_PADDING * 2;

  if (shape === 'circle') {
    return {
      shape,
      center,
      radius: size / 2,
    };
  }

  return {
    shape,
    center,
    left: center.x - size / 2,
    right: center.x + size / 2,
    top: center.y - size / 2,
    bottom: center.y + size / 2,
    size,
  };
}

export function drawArena(ctx, canvas, shape) {
  const arena = getArenaBounds(canvas, shape);

  ctx.save();
  ctx.strokeStyle = '#72d6ff';
  ctx.lineWidth = 4;

  if (arena.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(arena.center.x, arena.center.y, arena.radius, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.strokeRect(arena.left, arena.top, arena.size, arena.size);
  }

  ctx.restore();
}

export function isInsideArena(character, arena) {
  if (arena.shape === 'circle') {
    const dx = character.x - arena.center.x;
    const dy = character.y - arena.center.y;
    const distance = Math.hypot(dx, dy);

    return distance + character.radius <= arena.radius;
  }

  return (
    character.x - character.radius >= arena.left &&
    character.x + character.radius <= arena.right &&
    character.y - character.radius >= arena.top &&
    character.y + character.radius <= arena.bottom
  );
}

export function correctCharacterPosition(character, arena) {
  if (arena.shape === 'circle') {
    const dx = character.x - arena.center.x;
    const dy = character.y - arena.center.y;
    const distance = Math.hypot(dx, dy);
    const maxDistance = arena.radius - character.radius;

    if (distance <= maxDistance) {
      return character;
    }

    const normal = distance === 0 ? { x: 1, y: 0 } : { x: dx / distance, y: dy / distance };

    character.x = arena.center.x + normal.x * maxDistance;
    character.y = arena.center.y + normal.y * maxDistance;

    return character;
  }

  character.x = clamp(character.x, arena.left + character.radius, arena.right - character.radius);
  character.y = clamp(character.y, arena.top + character.radius, arena.bottom - character.radius);

  return character;
}

export function getWallNormal(character, arena) {
  if (arena.shape === 'circle') {
    const dx = character.x - arena.center.x;
    const dy = character.y - arena.center.y;
    const distance = Math.hypot(dx, dy);

    return distance === 0 ? { x: 1, y: 0 } : { x: dx / distance, y: dy / distance };
  }

  const distances = [
    { normal: { x: 1, y: 0 }, distance: Math.abs(character.x - character.radius - arena.left) },
    { normal: { x: -1, y: 0 }, distance: Math.abs(arena.right - character.radius - character.x) },
    { normal: { x: 0, y: 1 }, distance: Math.abs(character.y - character.radius - arena.top) },
    { normal: { x: 0, y: -1 }, distance: Math.abs(arena.bottom - character.radius - character.y) },
  ];

  return distances.sort((a, b) => a.distance - b.distance)[0].normal;
}

export function getStartingPositions(arena, leftRadius, rightRadius) {
  if (arena.shape === 'circle') {
    return [
      { x: arena.center.x - arena.radius * 0.45, y: arena.center.y, radius: leftRadius },
      { x: arena.center.x + arena.radius * 0.45, y: arena.center.y, radius: rightRadius },
    ];
  }

  return [
    { x: arena.center.x - arena.size * 0.25, y: arena.center.y, radius: leftRadius },
    { x: arena.center.x + arena.size * 0.25, y: arena.center.y, radius: rightRadius },
  ];
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
