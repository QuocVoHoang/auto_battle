import type { CircleBody, ProjectileShape } from './types.js';

export interface ProjectileOptions extends CircleBody {
  velocityX: number;
  velocityY: number;
  damage: number;
  owner: string;
  label: string;
  color: string;
  knockback?: number;
  shape?: ProjectileShape;
  img?: HTMLImageElement | null;
  isNormalAttack?: boolean;
}

export class Projectile implements CircleBody {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  damage: number;
  owner: string;
  label: string;
  color: string;
  knockback: number;
  shape: ProjectileShape;
  active: boolean;
  img: HTMLImageElement | null;
  isNormalAttack: boolean;

  constructor({ x, y, velocityX, velocityY, radius, damage, owner, label, color, knockback = 0, shape = 'circle', img = null, isNormalAttack = false }: ProjectileOptions) {
    this.x = x;
    this.y = y;
    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.radius = radius;
    this.damage = damage;
    this.owner = owner;
    this.label = label;
    this.color = color;
    this.knockback = knockback;
    this.shape = shape;
    this.active = true;
    this.img = img;
    this.isNormalAttack = isNormalAttack;
  }

  update(deltaTime: number): void {
    this.x += this.velocityX * deltaTime;
    this.y += this.velocityY * deltaTime;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    ctx.save();

    if (this.img?.complete && this.img.naturalWidth > 0) {
      const height = this.radius * 2;
      const width = height * (this.img.naturalWidth / this.img.naturalHeight);

      ctx.drawImage(this.img, this.x - width / 2, this.y - height / 2, width, height);
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
