# Round 6: art and UI critic (final polish pass)

Persona: picky art and UI critic. Mode: Kingdom test. Harness port 9303, about 125 commands. Screenshots are in the playtest scratchpad as `r6s3_<n>.png`.

## What I covered
- **Farm:** the herald's procession.
- **Village:** the plaza and fountain, Elias in the museum, Ashcombe at the manor.
- **Day 2:** I passed out at 2 am while the harness was paused by a usage limit, then woke on day 2 in the rain.
- **Briarholt grounds:** the farm's south-east gap, the outer road, walls, towers, the gatehouse, the fountain plaza, gardens and hedges, the orangeries and the training-yard pavilions.
- **Keep, ground floor:** entrance hall, great hall, throne room and dais, library, chapel pews, kitchen (the stove story step), and Isolde's scene.
- **Keep, cellars:** wine cellar, treasury and crypt.
- **Keep, upper floor:** the landing and the solar.

**Kingsbridge was not reached.** No waystone was attuned in Kingdom test. Neither the farm map nor the castle map shows one. Kingsbridge is far across the 440x330 Wilds, which was out of budget on foot.

## Summary
- **Art direction:** mostly coherent and in style.
  - Outside: the castle exteriors look polished (wall run, round towers with slate caps and pennants, gatehouse arch, ivy on the keep, orangeries, cobbled plaza with the tiered fountain).
  - Inside: wine racks, bookshelves, throne, gold hoards and stained glass are good.
- **Weak spots:** joins and placement more than individual sprites.
  - Doorways inside the keep are painted as dirt or rubble.
  - Several draw-order and collision holes let the player stand inside props and NPCs.
  - Some village buildings open straight into a dense tree line.
  - The UI has a few oversized empty windows, cropped local maps, and a tracker arrow that is hard to read.
- `errors`: none.

## Art issues
| # | What | Where | Shot | Fix |
|---|------|-------|------|-----|
| A1 | Every interior doorway between keep rooms is painted with a dirt or rubble texture. It cuts through the marble checker and the purple runner, and in the crypt a stained-glass window sits on top of a doorway tile. | castle_in (entrance hall, great hall, throne room, library, kitchen), castle_down, castle_up | 44, 45, 46, 50, 71, 76 | Paint door gaps with the floor of the room on the south side, or a threshold slab. Never use the default ground. Skip wall decals on door tiles. |
| A2 | The vertical (N-S) interior walls are a flat black strip with a brick face only at the door. Horizontal walls get a full brick face, so the two read inconsistently. | All keep floors | 50, 51, 55 | Give vertical walls a lit top cap (1-2 px rim) and a dark side face, like `cliffTop`. |
| A3 | Several village buildings (museum, the cottage beside it, the cottage west of the manor) open straight into a solid wall of trees. Leaving the museum puts you inside the canopy. | Village, south row | 23, 24, 27 | Clear a 2-3 tile apron and a path in front of every door, or move the tree line down. |
| A4 | The great hearth in the kitchen is a small black box with a pot. It doesn't read as "great" and has no chimney breast. The story stove that carries the "!" vanishes after use, which looks like a pop. | castle_in kitchen | 55, 56, 57 | Draw a wide hearth with a stone surround and a mantel. Keep a regular stove in place after the step. The stew text should match a visible pot. |
| A5 | The throne dais is a flat grey slab: no edge light and weak step definition. | Throne room | 47, 59 | Add a lit top edge, shaded risers and a carpet fold over the steps. |
| A6 | Garden hedges are flat dark-green rectangles with no top light. Flower beds are stiff evenly spaced rows. | Briarholt gardens | 64, 66 | Give hedges a lit top band and a darker south face. Jitter the flower clumps. |
| A7 | A mid-wall tower on the west wall is stamped over the vertical wall strip, with a stub of crenellation under it. The vertical wall has no side face, so it reads as a road. | Briarholt west wall | 36, 64 | Clip the wall strip where the tower sits. Add a shaded east face to vertical wall runs. |
| A8 | The upper landing is mostly empty marble with a carpet that starts and stops in mid-floor. The up and down stairs differ only by direction. | castle_up, castle_in | 74, 75 | Run the carpet from the stair to the door. Add rails or newel posts. |
| A9 | The plaza benches are tiny flat grey bars. | Briarholt fountain plaza | 42 | Wooden slats with stone legs, about twice the size. |
| A10 | A random dirt blob sits in the middle of the village cobbles. | Village plaza west | 13, 28 | Remove it, or make it a proper worn patch. |
| A11 | The museum floor is dirt-like blotchy stone. The library and solar wooden planks are very large and busy. | in_museum, library, solar | 18, 50, 76 | Use finer flagstones and narrower planks with less contrast. |
| A12 | Side-facing player in plate armour is very thin (a plank silhouette), with stick legs. | Everywhere | 9, 19, 33 | Widen the side torso and leg by 1-2 art px. Show the cuirass depth. |
| A13 | Wall shelves (bottles) and crates sit on or over the wall line. | Wine cellar | 69, 73 | Snap shelves to the wall face. Keep crates one tile off the wall. |

## UI issues
| # | What | Shot | Fix |
|---|------|------|-----|
| U1 | **Pressing Space or Enter to advance dialogue spills into the shop window.** After Elias the museum window opened; after Ashcombe the land window opened. | 20, 25 | Swallow the confirming key for about 300 ms after a dialogue closes (the existing `INPUT_GAP`). Don't run interact on the same key. |
| U2 | The museum window, the morning report and the Throne Room line are full-size windows that are about 90% empty. | 20, 30, 48 | Use `SMALL_WIN` for these. |
| U3 | The local map (M) is cropped. The farm's south edge, with the Briarholt gap, and the castle's south half are cut off. There are two scrollbars and the inner one doesn't scroll. The castle map shows no walls, towers or gate. | 10, 32, 65 | Fit the map to the panel (scale down) or make one scroller. Draw walls and towers. Show waystones on local maps. |
| U4 | The tracker arrow is ambiguous. It is a chevron that often seems to point away from the target or at the player. Inside the keep it flips between "13 m right" and "39 m left" as you cross the library. The label overlaps tents, workbenches, room titles ("SOLAR") and furniture. | 8, 33, 51, 52, 59, 76 | Use a clear arrow with a tail. When the target is on screen, put the marker over the target instead. Say "via door" when the arrow follows a path. Drop the label behind a dark plate and hide it while a room title shows. |
| U5 | The world map is hard to read: town labels overlap (Inn, Kingsbridge, Forge, Lamp), roads are a tangle of stair-stepped lines, and waystones are hard to find. | 67 | Thicker, smoothed roads; label collision; larger waystone icons. |
| U6 | The ability bar (Cleave, Lunge, Guard) overlaps the left edge of every dialogue box, and the village signpost. | 5, 7, 13 | Hide the ability bar while dialogue is open, or raise the dialogue box. |
| U7 | Doors near the bottom of the screen sit under the hotbar, and the "LMB Attack" hint sits on the museum door. | 18, 21, 59 | Bias the camera up in rooms, or let the hotbar fade when you are under it. |
| U8 | When the camera clamps at a map edge, the player can stand under the top-right dock. | 11, 12 | Fade the dock when the player is under it, as the key prompt already does. |
| U9 | NPC dialogue header repeats itself: "Knight of the Realm / Knight of the Realm". On day 1 a knight says "You fight well, farmer. Have you thought about the oath?", which is chapter-10 dialogue. | 5 | Hide the title when it equals the name. Gate that line on the story chapter. |
| U10 | The game kept running while nothing was happening (during the harness pause), and the player passed out and lost 2,500g. | 30 | Auto-pause after N minutes with no input, or on blur. This may have been a harness timing quirk. |

## Draw order and collision
- **D1. Campfire:** the player can walk onto the campfire tile. The flame is drawn on top of the helmet (shots 5, 6, 8).
- **D2. Isolde scene:** the player and Isolde overlap on the dais. Her head is drawn over the player's chest, and the yellow "!" marker covers the player's face (60, 61). Characters need separation, and a story NPC shouldn't be walked into.
- **D3. Throne:** the player walks into the throne itself (47, 48) and through the dais into the north wall row (59).
- **D4. Armour stands, potted plants, candelabra:** none are solid. The player stands inside them (58, 68, 55).
- **D5. Well:** the well in the Briarholt gardens is drawn over the player even though the player stands south of it (66). Check the well's sort y.
- **D6. Procession:** knights and the herald overlap each other at the farm (4).
- **D7. Fountain:** the player's head overlaps the fountain basin from the south. This one is acceptable (42).

## Looks great
- **Briarholt walls and gatehouse:** crenellated wall run, round towers with slate cones and purple pennants, the stone arch, lamp posts and banners lining the approach (39-41).
- **Keep facade:** tall arched windows, stag banners, ivy climbing the left tower, the double gate (43).
- **Orangeries:** green-framed glass, little fruit trees inside, terracotta pots (37, 64).
- **Fountain plazas:** both the village and Briarholt tiered fountains have water arcs and a stone rim (14, 42).
- **Inside the keep:**
  - great hall tables laid with roasts and goblets;
  - the purple-and-gold throne;
  - the tapestry of the castle;
  - the wine cellar's barrel racks;
  - treasury gold piles with gems;
  - crypt stained glass.
- **Village roofs:** the slate-roofed manor and museum with dormers, shutters and flower boxes; the trade signs (crest, urn).
- **Rain:** a flat grade with sparse streaks, so the pixel art stays crisp (31).
- **Item icons, bag and equipment panel:** consistent and readable (72).

## Top 5 fixes
1. Paint interior doorways with the room floor (no dirt), and don't put decals on door tiles (A1).
2. Make props and NPCs solid or sort them correctly: campfire, throne, armour stands, plants, the well, and story NPCs on the dais (D1-D5).
3. Stop dialogue-advance keys from opening the shop window afterwards (U1).
4. Fix the local and world maps: fit them to the panel, draw castle walls, show waystones, de-overlap labels (U3, U5). Also give Kingdom test an attuned waystone to each town.
5. Clear the tree line in front of the village doors, and give vertical keep walls a proper cap and face (A3, A2).

## `errors` output
```
none
```
