# Art playtest 4: creatures and combat in Painterly

Tester: art playtester (creatures and combat). Style: Painterly (`SETTINGS.artStyle = 'painterly'`, confirmed). Mostly in the Combat test on `[::1]:5173` (headless, 1600x900, `ZOOM` 4).

How I checked:
- **Contact sheets.** Every non-human `EN` key was drawn through the game's own `enemySpr` (walk frames 0 and 2, wind-up `a0`, strike `a1`) at the in-game scale of 4 px per world unit: `shots/creature_sheet_0..7.png`, 10 enemies per sheet in `Object.keys(EN)` order. Every `COATS` animal was drawn through `animalSpr` (`shots/creature_animals_0..3.png`).
- **In the game.** Human-art enemies, bosses, hazards, projectiles, swings, skills, death, elites, the goblin camp, guards and dragon flight were all checked in the world (screenshots below).

Severity: **high** = clearly broken or obviously pixel art next to the painted world; **medium** = reads as pixel art or looks off; **low** = a small thing.

The pattern behind most entries: the painted creature frames are cut to the pixel frame's exact outline (`creature_frames`). So every creature keeps a stair-stepped, art-pixel silhouette even when its inside is painted (see `creature_hv_zoom.png`). The `STYLE_SKIP` creatures (crab, yeti, troll) and the human-art enemies are plainly pixel art. Bosses that are scaled up (`EN.scale` 2-3) make it much worse.

---

## Hollow Vale enemies

| Enemy (key / art) | Problem | Severity | Shot |
|---|---|---|---|
| All templates (slime, wolf, boar, goblin, bird, bat, ghost, imp, golem) | Painted inside, but the silhouette is the pixel outline: stair-stepped edges on slime domes, wolf tails and legs, bat wings | medium | creature_hv_zoom.png, creature_sheet_0/1/2 |
| `wolf`, `icewolf` / wolf, strike frame `a1` | Teeth are a row of hard white pixel squares | low | creature_hv_zoom.png |
| `crab`, `rockcrab`, `magmacrab` / crab (`STYLE_SKIP`) | Smoothed pixel art: blocky shell, jaggy legs, hard pixel eyestalks | medium | creature_hv_zoom.png, sheet_0 |
| `yeti` / yeti (`STYLE_SKIP`) | Smoothed pixel art: big flat white blocks, a hard diamond belly patch, sawtooth edges. Strike frame `a1` loses its arms and becomes a squat lump | high | sheet_1 |
| `bandit`, `archer`, `pirate`, `skeleton`, `voidknight`, `zombie`, `banditchief` (human art) | Pixel character templates (Scale2x plus `paintedLook`), clearly blocky beside the painted wolves and boars. The archer shows no bow and the bandit no weapon while idle | high (as a group) | creature_humans.png |
| `drowned` (human) | Drawn half see-through on open ground, whether on purpose or not; it reads as a ghost | low | creature_humans.png |
| `goblin_slinger` / goblin | The same spear sprite as `goblin`: no sling | low | sheet_5 |
| `ogre` / ogre | Washed-out pale green, a pink or red halo outline round the whole body, and a club that's a dotted brown stick. Strike frame `a1` is a different, hunched body | medium | creature_swing_hit.png, sheet_5 |
| `ashgolem`, `warden`, `colossus` / golem, strike frame `a1` | A different, armless boulder pose that pops between frames | medium | sheet_1, sheet_2 |
| `wraith`, `shade`, `mistwraith`, `tidewraith` / ghost | A black hole for a face and pixel-stepped hems; fine otherwise | low | sheet_1, sheet_6/7 |
| Bats (all four) | Tiny, with stepped wing edges and pixel eyes | low | sheet_1/2 |
| `zombie` (human) | Pixel template with a hard green pixel face | medium | creature_humans.png |

## Regional enemies

| Enemy | Problem | Severity | Shot |
|---|---|---|---|
| `stonetroll` / troll (`STYLE_SKIP`) | **Broken:** a flat grey-green blob with no features (two dots for eyes), a darker belly blob and a thin outline. Strike frames are cut flat at the right edge (the club is a cropped vertical bar) | **high** | creature_troll_iceelem.png |
| `iceelemental` / shardling, frame 0 | **Broken:** the standing frame is a smeared ice slab with brown sticks or branches stuck on top, unlike the other frames (a clean ice golem) | **high** | creature_troll_iceelem.png |
| `flameslime` / elemental, frame 0 | **Broken:** torn flame with grey smudges and a hard vertical cut on its left side. All frames have a flat cut at the bottom and left | **high** | creature_flame_wisp_rimewolf.png, sheet_3 |
| `frostwraith` / wisp | Looks like a blue map-pin icon with a black hole: flat, graphic, not a creature | medium | creature_flame_wisp_rimewolf.png |
| `rimewolf` / icewarg | Beige blobs like bones or teeth along the back (painted spikes came out tan). Very blue, with stepped edges | medium | creature_flame_wisp_rimewolf.png |
| `icetroll` / mammoth | Named a troll but it's a brown elephant with a white halo along its top edge; not icy | medium | sheet_3 |
| `cavebear` / bear | A strange reddish saddle or blanket shape on its back. Strike frame has pixel teeth | low | creature_wyrm_bear_giant.png |
| `reefcrab` / lobster | Flat pink segmented tube with prong legs, very pixel | medium | sheet_4 |
| `harpy` / harpy | Blocky pixel figure (square head, flat wings). Strike frame `a1` is a different, detailed pose | medium | sheet_4 |
| `cinderimp` / salamander | Good inside. Strike frame `a1` is cut flat at the snout | low | creature_troll_iceelem.png (row 3) |
| `obsidiangolem` / basalt | Blocky stepped outline | low | sheet_3 |
| `hellhound`, `griffin`, `direwolf` | Acceptable; stepped edges only | low | sheet_2/3 |
| `tideslime` / jelly | Hard pixel tentacles | low | sheet_4 |
| `rat`, `plaguerat`, `bigrat`, `roach` | Fine; the roach is tiny | low | sheet_5 |

## Isle creatures

| Enemy | Problem | Severity | Shot |
|---|---|---|---|
| `reefstalker` / lobster | Saturated flat blue, very pixel | medium | sheet_5 |
| `moonsiren` / harpy | Same blocky harpy in pale blue | medium | sheet_5 |
| `starjelly` / jelly | Hard magenta pixel tentacles | low | sheet_6 |
| `lavaspirit` / elemental | Same broken frame 0 as the flameslime (grey smear, cut edges) | high | sheet_6 |
| `thornwisp` / wisp | Same map-pin look | medium | sheet_6 |
| `glassling` / shardling | Same broken frame 0 as the ice elemental | high | sheet_6 |
| `glasswolf` / icewarg | Same tan bone-spikes | medium | sheet_6 |
| `coralgolem` / basalt | Hot pink, a blocky stepped body | medium | sheet_7 |
| `frostmammoth` / mammoth | Fine painting, but pale with a stepped outline | low | sheet_6 |
| `mossbear`, `atollsalamander`, `magmacrab`, `drownedknight`, `mistwraith`, `tidewraith` | As their base templates above | low / medium | sheets |

## Bosses

| Boss | Problem | Severity | Shot |
|---|---|---|---|
| `frostgiant` / yeti x2 (Frost Giant) | The `STYLE_SKIP` yeti blown up 2x in the world: huge chunky pixels and sawtooth edges. The worst-looking thing on screen | **high** | creature_giant_colossus_zoom.png, creature_bosses1.png |
| `colossus` / golem x2.2 (Ash Colossus) | Very dark and blocky, with dithered pixel edges when enlarged; reads as low-res | **high** | creature_giant_colossus_zoom.png |
| `snapper` / crab x3 (Old Snapper) | Smoothed pixel crab at 3x: jaggy, blocky | **high** | creature_bosses1.png, sheet_2 |
| `rimequeen` / queen (Rime Queen) and `mistqueen` | Walk and wind-up frames are a flat blue trapezoid with a white blob for a head. The strike frame is a detailed painted queen, a completely different picture, so she swaps between a cardboard cut-out and a portrait | **high** | creature_tyrant_queen_forgeking.png, creature_bosses2/3.png |
| `wyrm` / dragon (Ember Wyrm) | Walk frames are a simple cartoon dinosaur with a fan of red spikes for wings; the strike frame is a different, detailed dragon | **high** | creature_wyrm_bear_giant.png |
| `stonetyrant` / tyrant (Stone Tyrant) | Wind-up frame has a grey card-coloured slab round the body (background left in). Frames 0 and `a1` have green pine trees growing out of its shoulders | **high** | creature_tyrant_queen_forgeking.png |
| `forgeking` / forgeking (Forge King) | Wind-up frame has a grey card slab on its left half and a cut-off hammer. The strike frame is a different, boxier robot | **high** | creature_tyrant_queen_forgeking.png |
| `glacierheart` / glacierheart and `glassheart` | Frame 0 has brown sticks on the chest (the same fault as the shardling). The wind-up frame is washed out to near-white | high | sheet_4, sheet_7 |
| `moonleviathan` / kraken | Body painted lavender, but the tentacles are pure saturated blue with hard stair-step edges | high | creature_bosses3.png, sheet_7 |
| `tidecaller` / kraken | Same stair-stepped tentacles in purple; eyes are pixel dots | medium | sheet_5, creature_bosses2.png |
| `drownedcaptain`, `drownedking` / captain | Frame 0 hat is beige, other frames dark; the strike frame is a different, detailed figure. The gold King reads as a lump of armour | medium | sheet_4, sheet_7 |
| `ratking` / ratking | Crown on frames 0-2 reads as an orange flame; only the strike frame shows a real crown | medium | sheet_5 |
| `ashmother` / ashmother | Flat dark red slab with candle-like spikes, little form, jaggy edges | medium | sheet_4 |
| `cinderdrake`, `atolldrake` / drake | Good painting, but stair-stepped outline and hard spine pixels | low | sheet_4/7 |
| `hollowking`, `warlord` (human art) | Pixel character templates scaled up for a boss: very blocky (the Hollow King at the screen edge in creature_bosses1/h1) | **high** | creature_bosses1.png |
| `lich` / lich | Decent. Strike frame has a different skull face | low | sheet_2 |
| `warden` / golem x1.6 | Drawn see-through while its waking shield is up (fine), blocky when solid | medium | creature_bosses1.png |
| Lich summons (skeletons) | Pixel human skeletons | medium | creature_ring_zoom.png |

## Hazards and telegraphs

| Item | Problem | Severity | Shot |
|---|---|---|---|
| Ice lanes, spirals (`HAZ`) | Flat cyan rectangles with no texture or edge, like debug boxes | medium-high | creature_hazards.png |
| Tide wave | A flat translucent cyan rectangle; the creatures inside are ghosted copies | medium | creature_hazards.png |
| Fire pools | Flat orange ellipses with no flames or glow | medium | creature_hazards.png |
| Quake rings | A smooth band with a white stepped pixel rim (`pxBand`); OK but a little pixel | low | creature_ring_zoom.png |
| Dashed red telegraph circles, wind-up wedges | Pixel-dashed outlines; acceptable as UI | low | creature_hazards.png |
| Meteor telegraph | The ground circle is filled with a blotchy, dithered brown noise texture | medium | creature_arcane_skills.png (row 5) |
| Groundslam cracks | Thin dark straight vector lines radiating out; crude | medium | creature_blade_skills.png (row 2) |

## Projectiles and skill effects

| Item | Problem | Severity | Shot |
|---|---|---|---|
| **Multishot and Rain of Arrows arrows** | **Broken:** skill arrows are drawn as black or dark-green pixel diamonds (a stacked column for Multishot, blobs falling for Rain), not arrows | **high** | creature_arrows_zoom.png, creature_marksman_skills.png |
| Piercing Shot | A black pixel arrowhead blob with a white bar; dark and pixel | high | creature_arrows_zoom.png |
| Enemy orbs (lich, queen, imps: blue, purple, orange) | Hard square pixels with square stepped halos | **high** | creature_projectiles_zoom.png |
| Thrown rocks (warden, colossus, rockfall) | Grey square boxes with a pale square glow; look like UI icons | **high** | creature_projectiles_zoom.png, creature_bosses3.png |
| Archer arrows (enemy) | Arrow inside a pale translucent square box | high | creature_humans.png (bottom left) |
| Player bow arrow (basic) | Pale rectangle or bar | medium | creature_marksman_skills.png |
| Staff bolt (basic) | Purple square with square glow | medium | stc / creature_arcane_skills.png |
| Fireball | Small square ball with a dotted square-pixel trail | medium | creature_arcane_skills.png |
| Chain Lightning | Thin, dull grey jagged line; no glow, hardly reads as lightning | medium | creature_arcane_skills.png |
| Burn and frost status | The whole enemy is recoloured flat orange or purple-blue, so an ogre looks like a different creature | medium | creature_arcane_skills.png |
| Bladestorm | Ghost weapons are flat cyan silhouettes (icons) | low-medium | creature_blade_skills.png |
| Lunge streak | A flat beige rectangle bar | medium | creature_swing_hit.png / skc |
| Motes and sparks (all skills) | Square pixel motes everywhere | low | most skill shots |
| Arcane Orbs | Pixel 4-point stars with a soft glow; read OK | low | creature_arcane_skills.png |
| Cleave, Whirlwind, Cyclone, Frost Nova rings | Smooth arcs and rings, painted enough | (good) | creature_blade_skills.png |
| Sword swing | Thin white smear arc; OK. **Idle and walking: no held weapon is drawn in the hand** (sword, bow and staff only show while attacking) | medium | creature_swing_hit.png |

## Combat UI

| Item | Problem | Severity | Shot |
|---|---|---|---|
| Target frame (`#tframe`) | Overlaps the HP/energy panel and the Combat test panel at the top left; covers the lives hearts | medium | creature_elites_targetframe.png |
| Damage splats | Boxed numbers ("85", "123") in hard-edged red rectangles with a pixel bar on top; plain floating numbers look good | low | creature_swing_hit.png |
| Enemy health bars, ally (guard) bars | Plain flat rectangles | low | creature_guards.png |
| Target highlight | A crimson stepped pixel outline round the targeted enemy, plus a red dotted line under its feet | medium | creature_swing_hit.png |
| Enemies going see-through | The targeted or hit ogre was drawn semi-transparent for long stretches next to the player | medium | creature_swing_hit.png, skc |
| Ability bar | Text-only buttons (Cleave, Lunge, Guard), no skill icons | low | most shots |
| See-through player | When covered, the player is drawn with a coarse checker or dither pattern over the helmet | medium | creature_ring_zoom.png |
| Death flash | Dying enemies turn into a flat white silhouette (the yeti's blocky outline shows clearly) | medium | creature_death_corpse.png |
| Corpses | They flatten and fade, but the squashed sprite smears | low | creature_death_corpse.png |
| Boss bar, elite name and ring | Look good | (good) | creature_bosses1.png, creature_elites_targetframe.png |

## Animals and mounts

| Item | Problem | Severity | Shot |
|---|---|---|---|
| Player character (every pose) | Pixel template, Scale2x-blocky, clearly pixel art in every combat shot | high (known decision) | most shots |
| Guards and knights (allies) | Blocky pixel humans. At the Kingsbridge gate a guard is drawn on top of the gate arch (depth order), standing on the wall | medium | creature_guards.png |
| `an_chicken`, `an_rabbit` (`STYLE_SKIP`) | Smoothed pixel art | medium | creature_animals_0.png |
| Belted cow | The belt is a hard flat white rectangle pasted over the body | medium | creature_animals_2.png |
| Spotted pig | Flat black blob spots | low-medium | creature_animals_2.png |
| Dapple horse | Patchy grey dapples | low | creature_animals_3.png |
| Duck heads (mallard, royal) | Hard pixel heads; the royal duck's orange head looks pasted on | low | creature_animals_0.png |
| `pet_dog_*`, `pet_cat_*` (`STYLE_SMOOTH`) | Tiny low-res smoothed pixel sprites | medium | creature_pets_mount.png |
| `drakeling` | Tiny pixel blob | medium | creature_pets_mount.png |
| `drake_mount` (dragon flight) | The dragon is painted well, but the rider is a blocky pixel figure standing upright on its back, and the folded wing reads as a turtle shell | medium | creature_dragon_flight.png |
| Horses, cows, goats, sheep | Painted and good; stepped outline only | (good) | creature_animals_1-3.png |
| Goblin camp | The shack and spit are painted nicely; the totem is a thin dark pole. Goblins are fine | low | creature_goblin_camp.png |

---

## What looks good in Painterly

- Wolves, boars, griffin, hellhound, salamanders, the mammoths' painting, bears and rats: painted forms, read well (if you ignore the outline).
- The Pale Lich, the Cinder and Atoll Drakes, and the drake mount: rich paintings.
- Farm animals (cows, goats, sheep, horses): good, consistent across coats.
- The boss bar, elite gold rings and name labels, and floating damage numbers ("-1", "1502", "Block").
- Cleave, Whirlwind, Cyclone, Frost Nova and Earthshatter rings, and the quake-ring fill.
- The goblin camp shack and spit, and the slime walk frames.

## Top 10 to fix first

1. **Skill arrows drawn as black diamonds** (Multishot, Rain of Arrows, Piercing Shot): broken.
2. **Enemy projectiles as square pixel boxes** (orbs, rocks, archer arrows in a square glow): seen in every boss fight.
3. **Broken frames:** the `stonetroll` grey blob; frame 0 of `iceelemental`, `glassling`, `glacierheart` and `glassheart` (brown sticks); frame 0 of `flameslime` and `lavaspirit` (grey smear, cut edges).
4. **Card slabs and trees on bosses:** the Stone Tyrant's wind-up slab and shoulder pines; the Forge King's wind-up slab.
5. **Frost Giant, Old Snapper, Ash Colossus:** smoothed pixel art blown up 2-3x for world bosses.
6. **Rime Queen and Mist Queen:** cardboard-trapezoid walk frames against a detailed strike frame.
7. **Ember Wyrm:** cartoon walk frames against a detailed strike frame (the same frame-mismatch fault in the harpy, captain and golem strike frames).
8. **Human-art enemies and bosses** (bandits, skeletons, Hollow King, Warlord, guards) look pixel; the archer has no bow and no weapons are shown while idle.
9. **Flat hazard shapes:** ice lanes, tide waves and fire pools are untextured rectangles and ellipses.
10. **Stair-stepped silhouettes on every creature** (the pixel-outline cut), worst on the leviathan's and kraken's blue tentacles. Feather or smooth the outline mask.

## Notes

- Mounting a horse in the Combat test: an animal pushed into `S.animals` by hand without genes crashed the render loop (`Cannot read properties of undefined (reading 'spd')`, a black canvas). That was my test setup, not a game bug; with `newAnimal()` it ran, but riding didn't start outside the farm, so the ridden horse isn't covered here.
- Isle creatures and dungeon or mine bosses were checked on the contact sheets, not in their own maps.
