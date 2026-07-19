export function circlesOverlap(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSum = a.radius + b.radius;

  return distanceSquared <= radiusSum * radiusSum;
}

export function resolveCharacterCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.hypot(dx, dy);
  const minDistance = a.radius + b.radius;

  if (distance >= minDistance) {
    return false;
  }

  let normalX = dx / (distance || 1);
  let normalY = dy / (distance || 1);

  if (distance === 0) {
    normalX = 1;
    normalY = 0;
  }

  const overlap = minDistance - distance;

  a.x -= normalX * overlap * 0.5;
  a.y -= normalY * overlap * 0.5;
  b.x += normalX * overlap * 0.5;
  b.y += normalY * overlap * 0.5;

  const relativeVelocityX = a.velocityX - b.velocityX;
  const relativeVelocityY = a.velocityY - b.velocityY;
  const speedAlongNormal = relativeVelocityX * normalX + relativeVelocityY * normalY;

  if (speedAlongNormal <= 0) {
    return true;
  }

  a.velocityX -= speedAlongNormal * normalX;
  a.velocityY -= speedAlongNormal * normalY;
  b.velocityX += speedAlongNormal * normalX;
  b.velocityY += speedAlongNormal * normalY;

  return true;
}
