# Agent Context

## Project
Small A-Frame/Vite flying game. The player pilots a forward-moving biplane, steers with `WASD`, shoots with `Space`, collects air rings for score, and can shoot enemy planes / balloons.

## Runtime
- Entry: `index.html` loads A-Frame 1.7, aframe-extras, Ammo, aframe-physics-system, then `/main.js`.
- Build check: `npm run build`.
- Do not start a dev server unless explicitly asked; the user often already has one running.

## Architecture
- Pure client-side JavaScript app: Vite serves `main.js`, which imports component modules for side-effect registration with `AFRAME.registerComponent`.
- A-Frame owns entity lifecycle/rendering; Three.js vectors/quaternions are used directly inside components for flight math and hit tests.
- Ammo physics is loaded but only trusted for static terrain and legacy physical sphere obstacles; core flying gameplay uses deterministic JS movement/collision.
- `main.js` is the scene composition layer; components own behavior and communicate via A-Frame events (`hit-by-projectile`, `collide-with-character`) plus `character.addScore`.
- Assets are GLB/JPG files under `models/`; every runtime model/image must be declared in `<a-assets>` before scene use.

## File Map
- `main.js`: scene markup, assets, lights, terrain, obstacle placement, player entity.
- `components/character.js`: player flight, camera-relative forward motion, shooting, projectile hit tests, score, damage.
- `components/enemy-plane.js`: simple autonomous enemy plane movement; one projectile hit destroys it.
- `components/air-obstacle.js`: collectible air rings; uses custom pass-through radius/depth, not mesh physics.
- `components/air-balloon-obstacle.js`: shootable balloon obstacle with score reward and custom hit radius.
- `components/obstacle.js`: older physical sphere obstacles.
- `shaders/glowing.js`: material shader for glowing asteroid sphere.
- `style.css`: fixed HUD only.
- `models/`: GLB/JPG assets referenced by id in `main.js`.

## Scene Invariants
- Player entity has `character`; its first child is the visible `player-airplane` model and must stay first because `character.js` reads `this.el.children[0]`.
- Player camera is a child of the player entity for cockpit/chase flight view.
- Player always moves along local `-Z`; model rotation is only visual correction/banking.
- Current player model orientation depends on child rotation `0 90 0`; banking is applied on the model X axis in `character.js`.
- Enemy planes use wrapper entities with `enemy-plane`; visible model is the first child, rotated `0 90 0`, scaled very small (`0.02`).
- Hot-air balloons use non-physics wrapper entities with `air-balloon-obstacle`; preserve user-tuned child rotation `270 90 45`.
- Avoid `ammo-body` on flying dynamic objects that are removed by gameplay; removing Ammo entities during hits has caused freezes.
- Projectile collision is custom continuous segment-vs-radius logic in `projectile.distanceToCurrentPath`; keep it for fast bullets.
- Projectile targets are `[obstacle], [enemy-plane], [air-balloon-obstacle]`; rings should not be shot or destroyed by bullets.
- Enemy and balloon hitboxes come from component `hitRadius`, not mesh bounds.
- Ring collection should feel like flying through the ring, not touching exact origin; `air-obstacle` uses X/Y radius plus Z depth.

## Gameplay Values
- Player speed `7`, projectile speed `35`, shoot cooldown `250ms`.
- Enemy planes are slower than player (`~4-4.5`) and die in one shot.
- Balloons currently take accumulated damage against `strength`; increase/decrease in `air-balloon-obstacle` or scene attributes.
- Score HUD is `#score`; all score changes should go through `character.addScore`.

## Editing Rules
- Match existing A-Frame component style; no new framework.
- Keep scene placement in `main.js` unless behavior needs a component.
- Prefer custom distance checks for airborne gameplay; only use Ammo for static terrain/legacy ground obstacles.
- If adding a GLB asset, register it in `<a-assets>` and reference by id.
- If a component reads child index `0`, do not insert helper children before the model.
- After edits, run `npm run build`; do not run `npm run dev` unless requested.
