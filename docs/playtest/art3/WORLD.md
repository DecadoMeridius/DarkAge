# Art playtest 3: World (Painterly re-check)

Kingdom test, Painterly (preview), FPS counter on, auto zoom, 1600x900 headless Chrome on `[::1]:5173`.
Route: farm (dawn) → village → the Wilds → Kingsbridge (day, golden hour, dusk, night) → the forest road back → village at night → farm next morning. No console errors.

## Round-1 items

| Round-1 problem | Status | Evidence |
|---|---|---|
| Night window light in the wrong place | **Mostly fixed.** Glow now sits on the painted glass of most houses (Kingsbridge cottages, the inn's arched window, cottage dormers). Three buildings are still off, see New problems 1. | fixed: `world_26`, `world_27`, `world_25`; still off: `world_33`, `world_34`, `world_29` |
| Shadows too long and dark, gaps below trees | **Half fixed.** Shadows are lighter and softer and no longer dominate the screen. Every tree still has a small contact shadow at its roots, then a lit strip of grass, then a large flat canopy shadow band further down. In the afternoon those bands are wide horizontal bars that run into each other across a meadow. | `world_17` (11:40, the band floats ~2 tiles below the roots), `world_20`/`world_21` (15:30), `world_23` (16:50) |
| Red lamp discs | **Fixed.** Lamp posts now show a small warm square on the lantern with a faint halo. No red discs. | `world_26`, `world_32`, `world_33` |
| Harsh shore foam | **Fixed.** Shores are soft sand into water with no white rim, by day and night. | `world_05`, `world_17`, `world_30` |
| Broken twigs | **Fixed.** Twigs are whole, painted branches with leaf buds. | `world_35` (bottom right), `world_05` |
| Stutters in dense areas | **Mostly fixed.** Walking live, the counter showed 142-165 fps everywhere (Wilds forest, Kingsbridge, village at night). Measured frame times: Wilds forest median 9.1 ms, p95 13.7, max 22 (no frames over 25 ms); village median 6.4, p95 12.8, max 32 (8 frames 25-32 ms while about 45 sway frames were active). Arriving cold in Kingsbridge (teleport, nothing cached) still hitches: median 8.1, **p95 63.5, max 151**, 81 frames over 25 ms in about 8 s. `castMake` costs 4-11 ms per sprite, and there's more per-frame cost on top of that. | `stutter.mjs` run, see Performance |
| Slimes inside Kingsbridge | **Fixed.** No monsters inside the walls during day, dusk or night; guards and patrols only. | `world_13` to `world_16`, `world_26` to `world_29` |

## New problems

1. **Window light is still wrong on three buildings at night.**
   - **Mara's store** (`world_33`): the glow fills the whole bottom of both display windows. It also bleeds out of the frame onto the planters, the grass at the foot of the wall and a strip to the right of the building.
   - **Brann's forge** (`world_29`, `world_33`): a set of lit brick outlines on the right wall where there is no window, and a lit sliver beside the second window.
   - **The log house / carpenter** (`world_34`): every window glows only round its frame while the panes stay dark blue. The window behind the hanging sign glows round the sign.
   - The masks for these sprites don't match the painted glass. `meta.win` probably still uses the pixel-art rectangles.
2. **Canopy shadows look detached and stripy.** The canopy shadow is a soft horizontal slab offset well below the tree with lit grass between them. In meadows several slabs line up into bands (`world_20`, `world_23`). It reads as stripes on the ground rather than tree shadows. Joining the canopy shadow to the trunk shadow, or using a rounder blob, would help.
3. **Terrain edges are pixel-stepped under painted textures.** Grass to cobble and grass to dirt borders show hard art-pixel staircases next to soft painted ground. Examples: the Kingsbridge street verges (`world_12`, `world_16`), the farm's north dirt edge (`world_05`) and the plaza paving (`world_31`). This is the single biggest "two styles at once" tell.
4. **Characters are still crisp pixel sprites among painted art.** This is expected per the docs. Knights, villagers and the horses at the procession (`world_35`) stand out the most at 2x zoom. At night the player's armour picks up the blue grade and nearly disappears against the cobbles (`world_28`, `world_32`).
5. **Collapsing at 2 am costs 2,500 g in the Kingsbridge test.** It surprised me after walking home from Kingsbridge (`Tue. 2` report). That's a gameplay item, not art; noted for the gameplay testers.

## Performance

- Live FPS counter: 142-165 fps throughout (farm, Wilds forest, Kingsbridge day and night, village at night). Only 96 fps with the Options window open.
- No visible hitches in normal walking. I measured frame times with `stutter.mjs` (results in the Round-1 table): the remaining stutter is the first seconds after arriving somewhere new and dense (Kingsbridge after a waystone or teleport). Cast-shadow creation (`castMake`, 4-11 ms per sprite) lands in the slow frames, but the slow frames run 36-60 ms, so something else costs more on those frames too. The worst was 151 ms.

## Liked

- Kingsbridge in golden hour and dusk (`world_24`, `world_25`): warm grade, long soft light, lit windows coming on. It looks like a painting.
- The fountain plazas (`world_13`, `world_32`), the town walls with their towers and gates (`world_19`, `world_23` gate), and the Wilds' flowering trees.
- Lamp lights are now subtle and believable, and night town scenes read well (`world_26`, `world_27`).
- The shore softening is a big improvement; ponds look natural now.
- No console errors across about 2 in-game days.

## Top 5 fixes

1. Repaint the `meta.win` light masks for Mara's store, the forge and the log/carpenter house so the glow matches the painted glass and never leaves the building.
2. Attach canopy shadows to trees (no lit gap under the trunk) and give them a rounder, less bar-like shape, so meadows don't stripe.
3. Smooth the terrain borders in painterly mode (grass/cobble, grass/dirt). The staircase edges clash with the painted textures.
4. Warm the cast-shadow and sprite caches when a map or area loads (or spread `castMake` over idle frames) to remove the 40-150 ms hitches on arriving in Kingsbridge.
5. Give the player and NPCs a slight lift at night (a rim or less blue grade on characters) so armoured characters don't vanish on dark cobbles.
