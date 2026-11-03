# Painterly vs Pixel: overall cohesion and feel

Tester: art director persona, looking at overall cohesion. Route: Test sandbox (dev mode) → yard stations → bag, hotbar and encyclopedia → barn and stable → tilled, planted and watered soil → village plaza and shops → Wilds. A second run at `?speed=8` covered evening, night, rain and the morning after. Screenshots are in `shots/feel_*.png`. Pixel/Painterly pairs were taken in the same spot.

## Verdict

**Painterly is close to ready for the world, but it is not yet better than pixel everywhere.**

At a glance, the painted world is richer and warmer than the pixel style:
- trees, buildings, the fountain, the well and the stations all look good;
- the soft cast shadows give the farm real depth;
- the ground no longer reads as a grid.

A new player would say "this looks like a cosy painted game" (`feel_19_village.png`, `feel_24_wilds.png`, `feel_22_treeline.png`).

It is still a patchwork in three places:
1. **Edges are still pixel-art.** Shore foam, the sand and grass lips, dirt-path borders, tilled-soil squares, petals and particles all show stair-stepped art pixels inside smooth paintings.
2. **A few painted sprites are broken.** The twig/stump pair is visible on every screen of the farm and the Wilds.
3. **Light is overdone.** Morning shadows are huge, and unlit furnaces look lit.

Pixel art is currently the more *consistent* style. Painterly is the more *attractive* one. Fix the top 5 below and Painterly should win clearly.

## Patchwork spots (still pixel or off-style)

| What | Where | Shot |
|---|---|---|
| **Twig sprite is broken.** Each twig is drawn as a half-sliced dark-red stump with a floating red crescent on its left, plus a twig that is cut off flat on its right edge. Pixel mode shows one clean twig in the same spot, so it looks like a neighbouring sprite on the sheet bleeds in and the crop is shifted. It is everywhere: around the tent and the yard, and in the Wilds. It looks like blood smears at a glance, especially at night. | farm yard, Wilds | `feel_3_painterly_yard.png`, `feel_25_wilds2.png` vs `feel_26_wilds2_pixel.png`, `feel_28_night_yard.png` |
| **Unlit furnaces look lit.** Stone Furnace, Blast Furnace, Ember Forge and Charcoal Kiln all show a fire in their mouth in Painterly, while they are cold in Pixel. It looks as if the restyle baked the lit frame into the idle one. At night they glow orange but get no light halo, while the really lit Furnace (forge) does. | sandbox yard | `feel_3` vs `feel_2_pixel_yard.png`, `feel_28_night_yard.png` |
| The Ember Forge lost its pointed top (flat-topped in Painterly). The Furnace (forge) and the Smelter chimney are washed out and ghostly. | yard | `feel_3`, crop of the stations row |
| The Trip Hammer's cauldron shows grass through it (a hole in the cutout). | yard | `feel_6.png` |
| Shore foam and the sand/grass edge are stair-stepped art-pixel lines (with a white 1-px foam staircase) around smooth painted water. This is the most "pixel" thing left on screen. | farm pond, Wilds lake | `feel_30_pond_rain.png` |
| Dirt-path and tilled-patch borders are pixel sawtooth with a dark lip. The painted textures inside them are soft. | yard path, farm patch, Wilds road | `feel_3`, `feel_23_wilds_exit.png`, `feel_25` |
| Tilled soil is drawn as separate rounded squares with grass seams between tiles, not a continuous bed. Watered soil carries little blue pixel "~" glyphs. | farm | `feel_16_soil.png` |
| Petals, ambient motes and a few larger grey or teal squares float as hard square pixels. Up close they look like dead pixels on a painting. | everywhere | `feel_21_village_n.png`, `feel_30` |
| Wild flowers and mushrooms (stems with blobs on top) stay stiff and pixel-like next to painted bushes. | Wilds | `feel_24_wilds.png` |
| Fence: vertical runs are a jumble of overlapping posts that doesn't read as a fence. Rails have a bright yellow edge glow (a fringe), and one rail has a grey square in it. | barn paddock | `feel_13_barn.png` |
| Scale drift from the restyle: the village well is about 20% larger than in Pixel, and the barn is wider on its left. | village, farm | `feel_19` vs `feel_20_village_pixel.png`, `feel_13` vs `feel_14_barn_pixel.png` |
| Stones on the farm are small, glossy brown "eggs" (they read as nuts or eggs, not stones). Rocks turn pinkish-purple at dusk. | farm, Wilds | `feel_3`, `feel_27_evening.png` |
| Faint vertical and horizontal seams at ground-texture tile edges in grass (visible when zoomed, mostly in flat lit areas). | farm, pond | `feel_17_dawn_grass.png`, `feel_13` |

## Characters vs world

The smoothed pixel character (Scale2x plus soften) is acceptable but clearly a different medium:
- He reads as a soft, blocky doll with flat cel colours, while everything around him has painterly texture and highlights (`feel_6.png` crop: player next to the Trip Hammer).
- He is a bit chunky beside thin painted props like the fence.
- He has almost no ground shadow, while every prop casts a long soft one, so he looks pasted on.
- Villagers have the same issue but stand up fine.

At night his saturated blue shirt barely takes the grade and pops out (`feel_33_wilds_night.png`). The see-through silhouette behind tree canopies works well.

Fix suggestion: give the player and NPCs the same soft cast shadow as props, and a touch of the warm-top-left / cool-bottom-right light ramp.

## Icons and UI

- The UI frame (parchment and wood) fits Painterly better than it fits Pixel. The dock and hotbar sit fine over the painted world.
- Tool icons (the mythril set) read well. The hoe icon is very thin, and the wooden sword reads as a club.
- **Food icons are almost all the same loaf or lozenge.** This is the same in Pixel (`feel_10_food.png` vs `feel_11_food_pixel.png`), so it is a template problem, not a Painterly one, but it hurts the bag.
- Resource icons are small inside their slots (bars are tiny flat smears). The "monster part" icons look noisy and spider-like (`feel_8_ency.png`). Smooth scaling makes the small ones blurry.
- World labels (station names in the sandbox) are fine.
- The dock covers sprites at the right edge (Tanning Rack, Compost Bin labels), the same as in Pixel.

## Readability

- Interactables mostly read well: painted stations, chests and the waystone all stand out.
- Weak spots:
  - stones and twigs (see above) don't read as what they are;
  - the big morning shadows (`feel_4.png`, `feel_19`) stretch across half the screen and cut the plaza into dark diagonal bands that look like terrain;
  - the cobbled plaza texture is busy and slightly repetitive, which makes NPCs harder to pick out (`feel_18_village.png`).
- Tall grass grows in identical side-by-side clumps that look duplicated.

## Night and light

- **Morning:** the low-sun shadows are dramatic but far too long and too dark (barn and stable shadows cover the path; lamp-post shadows cross the whole plaza). Cap the length or fade them out early in the morning.
- **Evening:** the golden hour reads as muddy olive more than gold (`feel_27`, `feel_32_wilds_golden.png`).
- **Night:** it reads well and is moody (`feel_33`). The grass stays quite saturated green, and water stays vivid royal blue (nearly ungraded), so water is the brightest thing at night.
- **Lit furnace:** its halo is nice. The baked-in fires on idle furnaces break the logic.
- **Rain:** it is just a tint plus faint streaks; that's fine.

## Performance

- 165 fps in the farm yard and the village, 133 fps on entering the Wilds (painting chunks), back to 165 fps right after.
- No visible stutters while walking or switching styles. The switch takes about 2-3 s.
- `errors`: none in either session.

## Liked

- Trees (blossoming broadleaf, pines, lush tree lines with roots): they are the best thing in the style.
- Village houses (slate and tile roofs, timber framing), the fountain, the well, the barn, the coop and the ivy-covered greenhouse ruin.
- Stations and machines are consistent with each other: the Golem, Reaper, Seed Hopper and Power Hammer look like one set.
- The soft cast shadows (at sane lengths) give real depth. The ground no longer looks like a tile grid.
- The see-through player behind canopies.

## Top 5 fixes

1. **Fix the twig sprite** (it slices in a red stump fragment and is cropped flat on the right). It is on every farm and Wilds screen and looks like a bug or blood.
2. **Use the unlit frame for idle furnaces** (Stone Furnace, Blast Furnace, Ember Forge, Charcoal Kiln). Also restore the Ember Forge's pointed top and fill the Trip Hammer's see-through cauldron.
3. **Smooth the remaining pixel edges:** shore foam, the sand and grass lips, dirt-path and patch borders, and tilled-soil tiles (merge them into beds). Optionally make petals and motes soft dots instead of squares.
4. **Tame the light:**
   - cap the cast-shadow length and darkness in early morning and late evening;
   - grade the water at night;
   - make the golden hour gold rather than olive.
5. **Seat the characters in the painted world:** give the player and NPCs the same soft cast shadow as props, plus a light warm/cool ramp. While there, fix the fence vertical runs (overlapping posts, yellow rail fringe) and the egg-like stones.
