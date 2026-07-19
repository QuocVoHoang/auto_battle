# Canvas Auto Battle

Simple browser auto-battle game built with TypeScript, Vite, and HTML5 Canvas.

Pick two characters, choose circle or square arena, then watch them fight automatically. No backend, database, login, multiplayer, or game engine.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the local URL Vite prints in the terminal.

## Folders

```text
public/
  characters/    Character SVG sprites.
  effects/       Place future effect images here.
  arena/         Place future arena images here.

src/
  data/          Character stats and shared constants.
  engine/        Game loop, renderer, shared types.
  entities/      Character class.
  systems/       Movement, arena collision, combat, skills.
  ui/            Start screen, top HP bars, game-over overlay.
  main.ts        App entry point.
  style.css      Page and UI styles.
```

## How Combat Works

Characters move on their own with smooth random direction changes.

When they touch:

1. They stop briefly.
2. Each ready character performs a normal attack.
3. Target HP goes down.
4. Attacker gains Rage.
5. If Rage reaches maximum, the attacker immediately casts a special skill.

When one character reaches `0 HP`, the match stops and the winner is shown.

## Characters

Current characters live in `src/data/characters.ts`.

- Police: balanced fighter, baton strike, pistol shot.
- Thief: fast, lower HP and damage, gains Rage faster, rock throw.
- Firefighter: more HP, slower, takes less damage, water cannon.

All shared numbers live in `src/data/constants.ts`.

## Add a New Character

1. Add a sprite to `public/characters/`, for example `ninja.svg`.
2. Add a new id to `CharacterId` in `src/engine/types.ts`.
3. Add stats to `CHARACTER_DEFINITIONS` in `src/data/characters.ts`.
4. If the character needs a new special projectile color or shape, update `src/systems/skills.ts` and `src/engine/Renderer.ts`.

Keep stats close to the existing characters first. Tune after playing.

## Change Arena Shape

Arena behavior lives in `src/systems/arena.ts`.

To change size, edit:

- `arenaRadius`
- `arenaHalfSize`

Both are in `src/data/constants.ts`.

To add a new arena shape:

1. Add the shape name to `ArenaShape` in `src/engine/types.ts`.
2. Add it to the selector in `src/ui/screen.ts`.
3. Add boundary logic in `src/systems/arena.ts`.
4. Add drawing logic in `src/engine/Renderer.ts`.

## Important Logic

- Game loop: `src/engine/Game.ts`
- Rendering: `src/engine/Renderer.ts`
- Movement: `src/systems/movement.ts`
- Arena wall collision: `src/systems/arena.ts`
- Normal attacks and Rage gain: `src/systems/combat.ts`
- Special skills and particles: `src/systems/skills.ts`
- Character stats: `src/data/characters.ts`
- Constants: `src/data/constants.ts`

## Build

```bash
npm run build
```

Use this before sharing changes. It checks TypeScript and creates a production build.
