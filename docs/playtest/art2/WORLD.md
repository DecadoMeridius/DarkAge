# Art playtest 2: the world in Painterly

Tester: world / art-and-feel. Build 0.9.2, Kingdom test, Options → Art style → Painterly (preview).
Route: farm (day 1, 6:00) → village → farm pond and paddock → the Wilds (Amber Meadow) → Kingsbridge (afternoon, dusk, night) → waystone to the village at night → farm at night → slept → farm at dawn (day 2).
Screenshots: `docs/playtest/art2/shots/world_0.png` to `world_28.png` (no `world_13` problems; `world_0` is the title screen in pixel art).

I couldn't get into Briarholt: the south-east gap in the farm's tree line is closed until the story opens it (`world_11`). The castle grounds aren't covered.

Console errors: none for the whole session. Performance: I didn't notice any stutter, including painterly chunks loading while walking across the Wilds and in Kingsbridge.

## Broken (bugs)

1. **Lit windows are in the wrong place on painted buildings.** At night the window glow lands *below* the painted windows: orange bars under each window, on the flower boxes, and under the dormers, while the glass stays dark blue. The clearest case is the Drowsy Drake (`world_24`, `world_25`); Brann's smithy is also off, with glow squares beside the windows and a lit bit showing through the tree canopy in front (`world_24`). It looks like `meta.win` still uses the pixel-art building layout, which doesn't match the painted sprite. Cottages roughly line up.
2. **Twigs are broken sprites** everywhere on the farm and in the Wilds (`world_1`, `world_2`, `world_3`, `world_26`). Each twig is drawn as three loose bits: a vertical dark-red sliver with a cut-off straight edge, a curved stroke, and a short stick. It looks like a bad cut-out or misregistration.
3. **Tree shadows come apart from their trees around midday.** At 11:00–13:00 each tree's shadow is a flat, dark horizontal bar sitting a few tiles below the trunk, with grass showing between them (`world_12` is the clearest, also `world_13`, `world_16`). In the morning they're long sheared slabs that do touch the tree. The near-noon squash looks like it moves the silhouette away from the base instead of shrinking it toward it.
4. **Lamp-post halos** in Kingsbridge are hard-edged, saturated red discs at dusk and magenta discs at night (`world_20`, `world_22`). Each one is centred on the post rather than the lantern, and its lower edge is cut off along a straight diagonal, as if clipped to a box.
5. **The lit shop window in Kingsbridge** (emporium, top-left of the plaza, `world_21`) is a flat near-white rectangle that paints over the window frames and the edge of the hanging shop sign. The sign ends up with a glowing outline.
6. Not art, but seen: **four slimes inside Kingsbridge's walls** at 21:50, near the smithy, and they hit me (`world_22`). Towns are meant to have no spawns within 10 tiles.
7. The camera's overscroll past a map edge shows **pure black** at the top of the village (`world_24`, `world_25`), and a smeared dark band below the farm's south tree line (`world_11`).

## Looks wrong (art problems)

- **Water edges are pixel stair-steps** (farm pond `world_3`, `world_10`, `world_12`; Wilds pond by Kingsbridge `world_23`). The shoreline and the 1-px grey "foam" are jagged art-pixel steps against smooth painted water and sand. This is the most pixel-art-looking thing left in the outdoor world. Grass↔sand and grass↔cobble edges have the same jagged pixel outline (`world_6`, `world_7`, `world_17`).
- **Faint square seams in water** (chunk or tile edges), visible as soft vertical and horizontal lines across the farm pond (`world_13`).
- **The village cobbles** visibly tile, with a regular repeat of the same stone pattern (`world_4`, `world_5`, `world_9`). They also don't match: very busy, high-contrast stones next to soft painted grass. Kingsbridge's plaza gravel is much better.
- **A dirt blob in the middle of the village cobbles** at the west entrance (`world_4`, `world_5`). It reads as a stain.
- **Pebbles / small stones** read as brown beans or acorns with a band round them (`world_1`) and as dark-blue ovals at night (`world_26`).
- **The ivy on the greenhouse ruin** is made of blocky square leaves, pixel clusters scaled up, while the glass behind it is soft (`world_1`, `world_28`).
- **Kingsbridge's north–south town wall** is a repeated stack of identical segments with a seam every block, like blurry upscaled pixel art (`world_23`).
- **Kingsbridge houses** are one design repeated (`world_19`), and the red tile and blue slate roofs are flat and plain next to the village's painted roofs.
- **A tree stands in the middle of the farm road** at the paddock corner (`world_2`, `world_14`): its trunk is on the road.
- **The player in Kingsbridge** stands over the fountain basin rim, with a square of different paving visible behind the fountain (the paved solid tiles, `world_18`).

## Inconsistent style

- Still crisp pixel art in Painterly mode: **the tent** (`world_1`, `world_27`), **the village altar** (stone block with an orange gem, `world_9`), **the village lamp posts** (`world_5`, `world_6`), and **the town wall** (`world_23`). Characters, riders and horses are pixel by design, but next to the painted trees they look noticeably low-res.
- Ground edges and water foam are pixel stair-steps (see above), while the textures inside them are painted.
- The campfire at night has only a tiny glow and no ground halo (`world_27`), while the lamp posts have huge halos.

## Shadows & light

- Direction follows the sun: shadows fall down-left (west) in the morning (`world_5`–`world_7`, `world_28`). That reads right.
- Lengths look too long and too boxy. Building shadows are big hard-edged parallelograms (the cottage and tavern in `world_7`). They cover the whole front lawn at 8:30 and still read as solid slabs at 9–10 am. Tree shadows are rectangles, not canopy shapes (`world_10`, `world_12`). The greenhouse throws a stripe across half the farm at dawn (`world_28`).
- Around noon, shadows separate from the objects that cast them (see Broken 3).
- Darkness level is fine: tinted, not black.
- Night grade: the blue night with lit windows is atmospheric where the windows line up (cottages, Kingsbridge houses, `world_20`/`world_23`). Lamp halos are too strong and too saturated.

## Ground

- Grass is lovely: no visible repeat in any shot, and the light/warm drift works.
- Dirt roads are good (`world_2`, `world_15`).
- Village cobbles repeat visibly (see above).
- The Kingsbridge plaza gravel is good. The Kingsbridge street cobbles are OK.
- The meeting edge between the paved and dirt roads in the Wilds is a jagged pixel seam (`world_17`).
- Shores and the edges between materials are the weak point.

## Feel of places

- **Farm:** cosy and green. The blossoming trees and the painted wagons of the herald's procession are charming (`world_15`). Pixel twigs and pebbles litter it, though, and the tent looks out of place.
- **Village:** the painted buildings (Mara's store with its awning, the smithy, the tavern with dormers, the manor's blue slate) give it a warm storybook look (`world_6`, `world_7`, `world_8`). The plaza is a big empty field of busy cobbles that reads more "car park" than lively. A few more props or variety in the paving would help.
- **Kingsbridge:** the plaza with fountain, stalls, benches and the glowing waystone feels like a market town (`world_18`). The rows of identical houses make the residential streets feel generated. At night it's moody and nice apart from the halos.
- **Wilds:** lush and readable. The tall grass in neat rows looks planted rather than wild (`world_16`).
- **Briarholt:** not reached (closed in the Kingdom test until the story opens it).

## Liked

- The trees: rich painted canopies with blossoms, roots and good silhouettes (`world_3`, `world_10`). They're the best thing in the style.
- The village and town fountains, the well, the notice board and the wagons are fully painted and fit.
- The greenhouse ruin's glass and brick, and the tavern and manor facades.
- The waystone's blue rune glow at night (`world_21`).
- The night grade and the cottage windows that do line up (`world_23`).
- No console errors and no hitches.

## Top 5 fixes

1. **Re-map lit windows to the painted buildings.** `meta.win` (and probably chimney and light points) need positions measured on the painted sprite. The tavern and smithy glow under their windows right now.
2. **Fix the twig sprite** (and check the other small litter, like pebbles): it's shown as three broken fragments all over the farm and the Wilds.
3. **Make shadows attach and soften.** Keep the shadow anchored at the object's base at every sun height (no gap at noon), use the canopy silhouette instead of a box, and shorten the morning and evening length or fade its far end.
4. **Smooth the shorelines and material edges in Painterly.** Water foam, and the edges between sand, grass and cobbles, are art-pixel stair-steps. Also hide the faint seams in the water.
5. **Tone down the lamp halos** (soft falloff, warm amber, centred on the lantern, not clipped). Repaint or retexture the village cobbles so the repeat doesn't show, and paint the leftover pixel props (tent, altar, lamp posts, town walls).
