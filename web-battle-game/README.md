# Web Battle Game

Browser-based 2D auto-battle game. Two AI fighters collide, attack, build rage, and fire special projectiles. Vanilla JS ES Modules, HTML5 Canvas, no build tools, no backend.

## Run

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Game Rules

- Fighters start at opposite sides of the arena and charge at each other
- Movement is automatic — fighters steer toward each other at their configured speed
- Colliding fighters deal normal attacks (cooldown-limited), building rage
- At 100 rage the fighter fires a special projectile toward the opponent
- A fighter dies when health reaches 0
- The survivor wins

## Characters

| Character | Health | Speed | Radius | Normal Attack | Cooldown | Special |
|-----------|--------|-------|--------|---------------|----------|---------|
| Police | 100 | 180 px/s | 30 px | Punch (15) | 800 ms | Spirit Arrow (35, beam) |
| Thief | 70 | 240 px/s | 25 px | Slash (10) | 600 ms | Shuriken (25, star, knockback 120) |
| Firefighter | 140 | 140 px/s | 36 px | Slam (20) | 1000 ms | Water Cannon (40, circle, knockback 160) |

### Special Projectile Properties

| Character | Shape | Speed | Radius | Color | Knockback |
|-----------|-------|-------|--------|-------|-----------|
| Police | beam | 360 | 8 | `#facc15` | 0 |
| Thief | star | 480 | 7 | `#a78bfa` | 120 |
| Firefighter | circle | 300 | 14 | `#60a5fa` | 160 |

## Combat & Rage System

- **Rage gain**: +20 on landing a normal attack, +10 on receiving one
- **Rage cap**: 100 (resets to 0 on special use)
- **Normal attack cooldown**: per-character config, checked against `performance.now()`
- **Damage numbers**: floating text at hit location (rise 35 px/s, fade over duration)
- **Impact rings**: expanding rings on normal attack hits and projectile impacts
- **Screen shake**: triggered by knockback projectiles, respects `prefers-reduced-motion`
- **Self-damage prevention**: projectiles track `owner` and skip their own character

## Controls

| Input | Action |
|-------|--------|
| Pause button | Toggle pause (freezes update, still draws) |
| Mute button | Toggle mute (wired, no audio assets yet) |
| Arena shape select | Square or Circular arena |
| Character selects | Assign fighters to Player 1 / Player 2 slots |
| Start Game | Begin the match |
| Play Again | Restart with same settings |
| Return to Menu | Back to character selection |

## Project Structure

```
web-battle-game/
├── index.html              # Shell: canvas + toolbar + menu container
├── css/
│   └── style.css           # Layout, responsive, card styles, accessibility
├── js/
│   ├── main.js             # Top-level wiring, resize listener
│   ├── game.js             # Game loop, state machine, combat, effects
│   ├── ui.js               # Menu, cards, game-over panel, toolbar wiring
│   ├── config.js           # Constants, enums, arena shapes, character IDs
│   ├── arena.js            # Bounds, collision detection, wall logic
│   ├── collision.js        # Circle overlap + elastic separation
│   ├── combat.js           # Damage, rage, cooldown
│   ├── projectile.js       # Moving projectile class with shape-aware draw
│   ├── character.js        # DEPRECATED — unused, configs now plain objects
│   └── characters/
│       ├── index.js         # Aggregates configs + lookup helper
│       ├── police.js        # Police config (balanced)
│       ├── thief.js         # Thief config (fast, small)
│       └── firefighter.js   # Firefighter config (tough, large)
└── README.md
```

## How to Add a New Character

1. Create `js/characters/foo.js`:

```js
export const foo = {
  id: 'foo',
  name: 'Foo',
  description: 'Short description.',
  image: 'images/foo.png',     // optional, null if none
  color: '#ff6600',
  accentColor: '#ffaa00',
  maxHealth: 100,
  speed: 180,                   // px/s
  radius: 30,                   // px
  normalAttack: 'Punch',
  normalDamage: 15,
  attackCooldown: 800,          // ms
  specialSkill: 'Fireball',
  specialDamage: 35,
  special: {
    speed: 360,                 // px/s
    radius: 8,                  // px
    color: '#facc15',
    knockback: 0,              // 0 = none
    shape: 'circle',           // circle | beam | star
    type: 'projectile',
    label: 'projectile',
    flash: 'special',
  },
};
```

2. Import and add to `js/characters/index.js`:

```js
import { foo } from './foo.js';
export const characterConfigs = [police, thief, firefighter, foo];
```

3. Add ID to `CHARACTER_IDS` in `js/config.js` if needed (optional, used only for default selection).

4. Character appears in start menu dropdowns and character cards automatically.

### Adding Character Images

1. Place PNG/SVG in `images/` folder
2. Set `image: 'images/foo.png'` in config
3. Image renders in character card avatar area (see `characterCard` in `ui.js`)

Images are decorative — gameplay is unaffected if absent.

## Balance Tuning Guide

Edit character config files. Key knobs:

| Parameter | Effect |
|-----------|--------|
| `maxHealth` | Total HP pool |
| `speed` | Movement velocity (px/s) |
| `radius` | Collision size, affects hitbox and separation distance |
| `normalDamage` | Damage per normal attack hit |
| `attackCooldown` | Milliseconds between normal attacks |
| `specialDamage` | Damage from special projectile |
| `special.speed` | Projectile travel speed (px/s) |
| `special.radius` | Projectile collision radius |
| `special.knockback` | Impulse applied on projectile hit (0 = none) |

All configs are read once at game start — edit, refresh browser, play.

### Square vs Circle Arena

- Square: axis-aligned bounce (velocity component flips per wall)
- Circle: radial bounce (reflects velocity along wall normal)

Fighters with different speeds/radii behave differently in each shape. Circle arena gives more chaotic bounces.

## Collision & Physics Notes

- **Wall bounce**: square arena flips the offending axis; circle arena reflects velocity along the radius normal
- **Character separation**: elastic impulse with equal mass (overlap push + velocity adjustment)
- **Coincident centers**: if two characters have identical positions, separation defaults to x-axis push
- **Wall drift**: after collision resolution a position-correction pass pushes all characters inside arena bounds; a second collision pass resolves any reintroduced overlap
- **Delta time**: capped at 50 ms to prevent tunneling on lag spikes

## Known Limitations

- Start button is disabled only by same-character check; empty character IDs show console warning but menu validation prevents runtime crash
- End-game projects one extra animation frame (harmless — next frame exits immediately)
- Pause button `aria-pressed` inverts twice if both `showPlayingUI` and `onPauseToggle` mutate it (fixed: only `onPauseToggle` manages button state)
- Effect text float uses hardcoded 35 px/s upward drift
- No audio assets loaded yet; mute toggle wired for future use
- Characters start at fixed positions (arena.left + padding / arena.right - padding), no random offset
- No replay or spectator mode
- Canvas logical size 900×600, CSS `aspect-ratio: 3/2` keeps it stable

## Manual Test Checklist

1. Start game → fighters appear, move toward each other
2. Collision → normal attacks fire, rage bars fill, damage numbers appear
3. Rage 100 → special projectile fires toward opponent
4. Projectile hits → knockback, damage number, impact ring, screen shake (if knockback > 0)
5. Health 0 → game-over overlay, stats panel, Play Again works
6. Pause → overlay drawn, updates freeze, draw still runs
7. Change arena shape → square vs circle bounce behavior
8. Mute → toggle state persists (no audio yet)
9. Responsive → canvas scales with viewport, menu reflows
