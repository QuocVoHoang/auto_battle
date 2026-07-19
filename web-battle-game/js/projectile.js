export class Projectile {
  constructor({ x, y, velocityX, velocityY, radius, damage, owner, type, label, color, knockback = 0, shape = 'circle', img = null }) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.radius = radius;
    this.damage = damage;
    this.owner = owner;
    this.type = type;
    this.label = label;
    this.color = color;
    this.knockback = knockback;
    this.shape = shape;
    this.active = true;
    this.img = img;
  }

  update(deltaTime) {
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  draw(ctx) {
    ctx.save();

    if (this.img) {
      const size = this.radius * 2;
      ctx.drawImage(this.img, this.x - this.radius, this.y - this.radius, size, size);
      ctx.restore();
      return;
    }

    ctx.fillStyle = this.color;

    if (this.shape === 'wide') {
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(this.x, this.y, this.radius * 1.7, this.radius, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
