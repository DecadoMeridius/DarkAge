# Painterly playtest: creatures and combat

Tester: art-and-feel, creatures and combat. Game: Combat test (Wilds meadow), Developer mode, Art style switched to Painterly (preview), FPS counter on. Harness on `[::1]:5173`, nothing saved. Console errors: **none** across the whole session.

Screenshots are in `shots/creature_*.png`. The `*_zoom` / `*_frames` files are 3x crops (nearest) of two consecutive shots side by side. Note: the image viewer gave out for `creature_1` to `creature_15`, so the early wolf/slime/ranged pack shots were taken but not reviewed. Everything below comes from `creature_16` onward (bosses, mixed packs, knights, slimes).

Not covered: farm animals and mines. The combat test starts in the Wilds and I ran out of budget before reaching them.

## Broken

1. **The Stone Warden is drawn half see-through, with grass and foliage showing through its body** (`creature_warden_zoom.png`, `creature_warden_zoom2.png`, also `creature_18/21/22/24`). The left third (arm and shoulder) is solid grey stone. The rest of the torso and legs show a green leafy texture with flower petals, so the bush/tree behind it shows through. It looks like the "see-through when behind a canopy" fade or the painted cut-out mask is applied to the wrong region, or the painted sprite has alpha holes. The same thing happens on the **Ember Wyrm** in `creature_29/30`: the body goes muddy orange with flower blobs on it (`creature_wyrm_frames2.png`). In `creature_27/28` the same wyrm is clean and fully opaque. So this is probably the canopy/occlusion fade switching on when a big boss stands near a tree, and the fade looks like a texture smear instead of a clean alpha.
2. **Rockfall / debris hazards draw as flat untextured grey-brown squares.** They hang mid-air with no sprite (`creature_21.png` around (560-960, 190-340); `creature_45.png` brown squares over the pond and trees). In painterly mode they look like missing textures.
3. **Large telegraph rings run off screen and cover the HUD.** The Stone Warden quake ring (`creature_19.png`, `creature_23.png`) is a huge flat orange band that crosses the Focus bar and hotbar. This is by design, but in painterly mode the flat, sharp-edged pixel band is the most "out of style" thing on screen.

## Animation problems

- **Ember Wyrm: walk frames change shape a lot** (`creature_wyrm_frames.png`). In frame A the wings are swept back flat along the body, the neck is upright and the tail is hidden under the wings. In frame B the wings are a raised fan of spines, the tail sweeps down and left, and the head is higher. The silhouette jumps between two different poses rather than stepping smoothly, and the outer outline grows by roughly 20-30% between frames. It reads as flicker while walking. The wings' rear tips also show a stray dark-blue/purple pixel cluster (`creature_wyrm_frames.png`, left end of the wing in frame B).
- **Stone Warden:** between frames the head moves and the eye glow appears and disappears (yellow eye in one frame, flat in the other). That part is OK, but the left fist changes shape noticeably (`creature_warden_zoom2.png`).
- **Old Snapper (crab), Frost Giant, Hollow King, Bandit Warlord:** across two shots 250 ms apart I saw no visible walk change. They are either idle or have very subtle frames. No flicker seen.
- **Skeletons (Pale Lich adds):** a stable shape across frames, fine. One skeleton overlapped the player and the see-through player outline worked (`creature_skeletons_zoom.png`).

## Looks wrong / inconsistent

- **Several bosses are clearly still smoothed pixel art, not painted,** and look out of place next to the painted trees:
  - **Hollow King and Bandit Warlord** (`creature_hollowking_zoom.png`): blurry upscaled blocks, flat colours, soft edges. They read as low-res, and are the weakest-looking things on screen.
  - **Old Snapper** (`creature_snapper_zoom.png`): pixel template with smoothing, plus **blue outline pixels** along the leg/claw edges (dark-blue dots on the bottom and side edges).
  - **Frost Giant** (`creature_frostgiant_zoom.png`): a hard stepped pixel outline with **light-blue rim pixels all round the silhouette** (like a halo or matte edge). It also has odd flat, pale rectangular "arms" or panels at the sides that look like the template's raised arms filled flat.
  - **Ember Wyrm:** a smooth painted body, but a pixel-stepped outline and small blue/grey speckles along the back (the spine dots).
  - **Stone Warden:** a painted stone texture, but the outline has **blue-ish pixels** at the edges (left arm).
  Several templates seem to have the same blue outline: the dark outline colour from the template ramp is coming through as blue.
- **Pale Lich** (`creature_lich_zoom.png`) looks good: painted robe, crown and staff orb. The lower robe goes semi-transparent and murky where it overlaps a tree's canopy (same issue as Broken #1, milder).
- **Knights and villagers / bandits** (characters, smoothed pixel) are fine, but next to painted slimes and trees they look blockier. That is expected.
- **Damage numbers stack and overlap** in busy fights (`creature_31`, `creature_32`, `creature_44`): "-17 -17 19 21" on top of each other, white ally numbers on top of red ones.
- The **signpost label** "Kingsbridge ↖ · Greyhelm ↗ · Ashford ↖ · Saltmere → · Ember…" runs off the right edge of the screen under the clock (`creature_46/47`).

## Combat effects

- **Good:** the Lich's purple orb ring is crisp pixel squares with a soft glow and reads well against painted grass (`creature_32`). The Ember Wyrm's fire motes (`creature_29`) are glowing orange squares and readable. Guard's shield icon and "Guard" text are clear. The cleave swing's red wedge is readable.
- **Telegraphs:** the red circle markers (`creature_21`, `creature_45`) are clear but are thin 1-px pixel rings with a flat fill. They are readable, and slightly harsh on painterly ground. The Old Snapper's charge lane (`creature_39`) is a **flat cyan rectangle** that cuts through a tree and the boss. It reads, but it is the ugliest telegraph: a hard-edged solid block with no fill progress visible in that frame.
- **Fire pool under the player** (`creature_27/28`) is a smooth orange blob. It reads well and its style matches.
- **Hit-stop and knockback** felt fine. The player was knocked out once by the Hollow King/Warlord pair (expected at that level). The see-through player outline works.
- **Death:** a slime died to the knights (`creature_47` → `48`, "+2 Slime Goo"). I did not catch the corpse fade frame.

## Performance

- A steady **163-166 fps** throughout (FPS counter), including 2 bosses + knights + 5 slimes + hazards and night grading. No stutter noticed. There was no hitch when spawning a boss (the first spawn of each painted boss would be where a cache miss showed, and none did).

## Liked

- **Slimes** (green, `creature_46/47`) and the orange **fire slimes** (`creature_29`) look really nice painted: soft glossy jelly that sits naturally on the painted grass.
- **The Pale Lich** is the best boss: a painted robe, a readable skull, a glowing staff orb.
- **Skeletons** are clean and readable.
- The Ember Wyrm in its clean frames (`creature_27`) is a bold, readable silhouette.
- The night/evening grade over painted foliage is beautiful (`creature_44-48`).

## Top 5 fixes

1. **Fix the boss see-through/canopy fade in painterly mode.** The Stone Warden and Ember Wyrm show foliage and flowers through their bodies near trees. Either the occlusion fade is sampling the wrong layer, or the painted sprite's mask has holes.
2. **Paint, or at least clean up, the remaining pixel bosses:** Hollow King, Bandit Warlord, Old Snapper and Frost Giant read as blurry low-res next to painted trees.
3. **Remove the blue/cyan outline and rim pixels** on creature templates in painterly mode (Frost Giant halo, Snapper legs, Warden arm, Wyrm spine dots). The template outline channel seems to map to a blue shade.
4. **Ember Wyrm walk frames:** match the wing pose and silhouette size between frames (wings flat in one frame, raised fan in the next) so it doesn't pop while walking.
5. **Give rockfall/debris hazards and the Snapper's charge lane a proper look.** Rockfall is flat grey/brown squares. The charge lane is a solid cyan slab; a filling, softer-edged band would match painterly.
