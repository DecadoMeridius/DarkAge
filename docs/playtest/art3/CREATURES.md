# Art playtest 3: creatures and combat (Painterly)

Combat test, Painterly (preview) art style, FPS counter on, on `[::1]:5173`. Screenshots are in `shots/creature_0.png` to `creature_45.png`. I spawned the wolf pack, slimes, mixed packs (x many) and the bosses Stone Warden, Ember Wyrm, Pale Lich, Hollow King, Bandit Warlord, Old Snapper and Frost Giant, and fought most of them. The console showed no errors.

## Round-1 items

| Item | Status | Notes |
|---|---|---|
| Bosses see-through or smeared near trees | **Mostly fixed** | The Wyrm behind a tree canopy (creature_23) is cleanly occluded, with no smear. The Frost Giant beside a tree (20, 22) is drawn solid. A big crowd under a canopy (43) still turns the player see-through, which is intended. |
| Blurry pixel bosses (Hollow King, Warlord, Snapper, Frost Giant) | **Partly fixed** | The Hollow King and Bandit Warlord (45) are now crisp, Scale2x-style, and read as deliberate. They are still pixel characters among painted creatures, which is acceptable. **Old Snapper is still pixel art** (17, 18, 19): a hard-stepped red crab with jaggy edges, plus small *painted* crab heads/claws that pop in on some frames. **The Frost Giant mixes styles inside one sprite**: some frames are the flat pixel yeti (20) and some are the painted yeti (22). In one frame (20) the painted half is pasted over the pixel half, so you see two figures side by side. |
| Blue specks on outlines | **Not fixed (smaller)** | Old Snapper still has blue/purple pixels around its whole outline (17, 18b). The Ember Wyrm's wing edges have a few blue-grey dots (23). Wolves are clean. |
| Ember Wyrm frames popping | **Not fixed** | Across frames 25-27 the wings swap between a low swept-back pair and a tall, fan-shaped crest of spikes. The silhouette changes completely every frame. The body shading also changes (smooth in one frame, darker spots in another). |
| Rockfall squares | **Fixed-ish** | The falling rock is now a stone shape, not a square. The impact ellipse with the red stone on it (28) reads well. |
| Cyan charge lane | Not seen | No boss used a lane in my fights. |
| Hard quake ring | **Improved, not finished** | It is now a soft (1.2 px blur) translucent orange band (28-31). It still reads as a flat stroke laid over the world, and it tints the water purple where it crosses. Under the blur, the band edge is still a stepped staircase (bottom left of 28). |

## New problems

1. **The FPS counter fell to 0-1 fps during the Stone Warden's quake** (creature_29-31). The whole game froze for several seconds: 3:50 pm stayed on the clock across 3+ s of waits, and the screen did not change between shots. It recovered after Clear (32: 165 fps). The most likely cause is the `g.filter = 'blur(1.2px)'` wrapper on `drawHazards` (`x_artlight.js` around line 176). A canvas filter on a full-screen-sized band, redrawn every frame, is very costly in Chrome. Re-check this in the headed build. If it's the cause, pre-render the ring band once per radius step, or drop the filter and use soft alpha falloff instead.
2. **Frost Giant mixed frames** (see above). Some walk frames failed the painterly fit and stayed pixel while others were painted. The per-creature rule ("any frame under 0.45 stays pixel entirely") doesn't seem to apply to `en_yeti` / the giant, or a cached frame is stale.
3. **Old Snapper's partial painting:** a pixel body with painted eyes/claws on some frames (18b). It looks like a paste-up. It needs one style for all of it.
4. **Big pixel mobs among painted ones** in mixed packs. The Stone Golem/Warden (28, 37) is painted and soft, with a good rock texture. The Lich (41) is pixel art with soft scaling, which is fine. But the Snapper and the pixel Frost Giant next to painted wolves are the most obvious style clash on screen.
5. **The Hollow King overlaps the boss-name bar** at the top of the screen (45). His crown and horns are drawn above the HUD bar line, so he reads as if he's on top of the HUD.
6. Slimes: the green/blue/red slimes (37, 44) are painted, glossy and nice, but their tops are slightly flattened and cut off in one frame (the jelly in 21 is just a lump). Minor.

## Animation

- **Wolves** (21, 22, 37): painted, with consistent proportions, good walk frames and no popping between frames. Best of the set.
- **Slimes:** the squash and bob read well, and the colour variants hold up.
- **Ember Wyrm:** wings pop between two different designs (see above). The body walk is okay.
- **Frost Giant:** style flicker between frames is the worst animation problem.
- **Stone Warden:** a stable silhouette, and the attack frames (arms raised in 39) read clearly.
- **Bandits** (33, 34, 43): pixel characters, with a clean walk and good mask and vest outfits. The archer/knight allies are fine.
- **Goblins and boars:** they never came up in 7 mixed packs. The pool is every non-boss enemy, so the odds are low. They're still unchecked; a dedicated spawn button would help.
- **Wind-up wedges** (37, 39) are soft orange fans now. They're readable and less harsh than round 1.
- **Character shadows:** the player and NPCs cast a long soft shadow to the lower right (35, 36). It's subtle and fits the painted light. Next to bosses, the creature shadows match. Good.

## Performance

- 150-165 fps normally, and 125 fps in a busy mixed pack with the Frost Giant and wolves.
- **0-1 fps during the Stone Warden quake** (blur filter suspect, see New problem 1). Another dip to 69 fps came during the Ember Wyrm fire pools (24), which also suggests the hazard blur.

## Liked

- The painted wolves, slimes, ghost/wraith and Stone Warden sit well on the painterly grass.
- The crisp Scale2x Hollow King and Warlord look intentional now.
- The rockfall impact now shows a stone instead of a square.
- The soft wind-up wedges and long character shadows suit the style.

## Top 5 fixes

1. Remove or cache the `blur()` filter in the styled `drawHazards`: it froze the game at 0-1 fps during quake rings.
2. Make the Frost Giant one style for all frames (all painted or all pixel), and fix the frame where both are drawn at once.
3. Give Old Snapper a single style: either paint all frames, or keep it all pixel and remove the painted heads/claws. Clean its blue outline specks.
4. Make the Ember Wyrm's wing frames one design: register the wings from the same restyle sheet/seed, or pin the frames.
5. Quake ring: give it a soft-edged painterly band (radial alpha falloff) instead of a blurred stepped band, and don't let it recolour water. Add a test button to spawn goblins/boars so they can be checked.
