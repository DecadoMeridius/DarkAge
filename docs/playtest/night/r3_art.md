# Round 3 art critique: Briarholt Castle

Persona: picky art critic. Kingdom test, played only through the harness (port 9303, ~115 commands). Route: herald at the farm → Elias (museum) → Lord Ashcombe (manor) → farm SE gap → Briarholt grounds → keep ground floor → upper floor → wine cellar. At 2:00 am I collapsed in the cellar and woke on the farm, so the treasury, dungeon cells, crypt, chapel, armoury and map room went **unseen**. Screenshots are `r3s3_<n>.png` in the playtest scratchpad.

## Summary
From outside, Briarholt is the best-looking place in the game. The south curtain wall has crenellations and a stone face. The round towers have conical slate roofs and pennants. The keep facade is well done: corner drum towers, a gatehouse bay with machicolations, purple banners, a crest, ivy and arched windows. The iron-and-glass orangeries are lovely. The castle's weak points are:
- the **north–south wall runs**, which read as a flat paved strip;
- **floors copied from the village and museum** (cobble plaza, blotchy "museum" stone indoors, the road cobble in the kitchen and cellar);
- an **under-furnished, under-scaled interior**: a huge bare throne room with a small chair, farmhouse beds and stoves, a "great hearth" that is a small black box;
- **walls you can walk onto**: the player stands on north wall faces indoors.

The tracker arrow also seems frozen in one orientation inside the castle grounds.

## Art issues

| # | What | Where / shot | Fix |
|---|------|--------------|-----|
| A1 | **North–south curtain wall runs are a flat 2-tile brick strip.** They have no crenellations, no wall-walk edge, no face and no cast shadow on either side. From a distance they read as a paved road. | West wall outside (r3s3_31, 33) and inside (r3s3_42, 43, 64) | Draw the N–S run as a wall-walk: a lit merlon row on the west edge, a dark parapet on the east edge, stone courses along the walk. Add a hard 1-tile shadow on the east side (light comes from the top-left). |
| A2 | **Gatehouse arch is tiny and buried.** The opening is a short black arch at the bottom of a wall segment the same height as the curtain wall. There are no doors, no portcullis teeth and no gatehouse block, and the road runs straight through the face. | r3s3_36, 37 | Raise a real gatehouse between the two towers: taller than the curtain, with a portcullis half raised (iron grid in the arch top), heavy timber door leaves folded back, and a crest or banner over the arch. |
| A3 | A **tower set mid-run on the west wall** has a crenellated wall block stuck to its lower half, so the wall-walk seems to pass through the tower. | r3s3_64 (x 200–260, y 430–550) | Stop the wall strip at the tower's footprint, or draw the junction so the tower clearly sits over the run. |
| A4 | **Fountain and well are the village props** (same fountain, same red-roofed well). The plaza is the village's irregular cobble blob with ragged grass edges. | r3s3_38, 40, 45 | Give the castle its own formal pieces: a square or octagonal ashlar basin with a statue (the Ember Stag), and paving in a regular flagstone grid with a kerb edge. Drop the well or make it a stone well-head with an iron winch. |
| A5 | **Hedges are flat green bars** with no top plane, front face or dithered shadow. Flowers stand in a loose row above the hedge on plain grass, with no bed edging or soil. | r3s3_39, 40, 64 | Draw the hedge as a block: lighter clipped top, darker front, a 1px dark base, a contact shadow. Put the flowers in a raised bed (stone kerb plus dark soil) and frame them with the hedge so they read as a parterre. The topiary cones are good; add balls and spirals too. |
| A6 | **Training yard sits on plain lawn.** Hay bales are flat yellow rectangles with dots. The grey "armour stand" by the bales reads as a stone gravestone. | r3s3_41, 42 | Give the yard a packed-dirt or sand floor with a timber rail fence. Draw the bales with bound twine, a top face and a shadow. Make the stand a wooden post with a dented breastplate and helm. The weapon rack, straw dummies, archery targets and striped pavilions are good. |
| A7 | **Barrels stacked off-grid**: the top barrel is offset and seems to float. | Courtyard r3s3_44, cellar r3s3_74 | Either drop stacking or draw a proper 2-high barrel stack sprite with chocks. |
| A8 | **Banner pole collision**: a banner pole blocked my path in the middle of the cobbled approach. | r3s3_44 | Make poles non-solid (1 px), or move them off the walk line. |
| A9 | **Keep at night: every window is dark.** Village houses and lamp posts light up; the royal keep looks abandoned. | r3s3_65 | Add `meta.win` glass for `bld_castle_18x10` and the glasshouses. Keep a few dark for drama, but light the great hall and gatehouse. |
| A10 | **Keep has no plinth or steps.** The double door opens straight onto a ragged cobble blob. | r3s3_46 | Add a 2–3 step stone stair with side cheeks and a lantern on each side, plus a straight flagstone apron. |
| I1 | **Indoor floors are reused**: the throne room, great hall, entrance hall and gallery all use the blotchy museum stone. The kitchen and cellar use the *outdoor road cobble*. | r3s3_47–49, 55, 74 | Per-room floors: polished chequered marble or large ashlar flags for the throne room and hall; red quarry tiles for the kitchen; rough slabs, darker, for the cellar; herringbone parquet upstairs. |
| I2 | **The throne room is vast and empty.** The throne is about 1.3 tiles wide on bare floor at the end of a long runner, with no dais. Columns are thin white Greek ones. | r3s3_49, 50, 62 | Put the throne on a 2-step dais with a canopy (cloth of estate) behind it in purple and gold. Swap the Greek columns for thick stone piers with banners hung on them. Add braziers, flanking guards or armour, and a gallery rail. Scale the throne to about 2x3 tiles. |
| I3 | **"Great hearth" in the kitchen is a small black box standing in the middle of the floor**, with a grey grille on top. It is not set into a wall. | r3s3_55, 56 | Build it into the north wall: a wide stone arch 4–5 tiles across, with a spit, hanging pots on a crane, a firedog and a glow. Swap the three modern cast-iron stoves for a bread oven and a long work table. |
| I4 | **Great hall tables are tiled segments** with visible repeating legs and seams every tile. The runner carpet breaks into separate pieces at room boundaries (a gap of bare floor). | r3s3_48, 54, 60 | One long table sprite with a cloth that runs to the end and legs only at the ends and middle. A high table on a dais at the north end. Make carpets continuous through doorways. |
| I5 | **Bedchambers use the farmhouse bed** (single, red quilt). | r3s3_70, 73 | A royal four-poster (canopy, curtains, bolster) for the bedchamber and Isolde's chamber, plus a wardrobe, a dressing table and a chest. |
| I6 | **The library is sparse**: 5 bookcases, one small table, a harp, bare plank floor. | r3s3_52 | Fill the walls with bookcases, add reading lecterns, a globe, a ladder, a big rug, and a desk with candles and scrolls. |
| I7 | **The gallery has 4 portraits from only 2 designs** (purple man and red woman, repeated). | r3s3_68, 71 | At least 6 distinct portraits (the kings and Margit). Add a name plate under each, plus busts on plinths. |
| I8 | **Doorways show a raw square of museum stone** between wooden floors (threshold mismatch), with dark void walls on either side. Vertical walls are flat black bands with a single floating brick "jamb" block beside each doorway. | r3s3_51, 69, 70, 73 | Give doorways a stone threshold and a timber or arched frame. Give vertical walls a lit top edge (the wall cap) and a darker inner edge, like the wall tops already used outdoors. |
| I9 | **The cellar is as bright as the rooms above.** The underground floor has no dim warm grade. | r3s3_74 | Apply the mine or room dim grade to `castle_down`. Add sconces and torch flames via `meta.light`. |
| O1 | **The manor in the village is an ordinary cottage sprite** (the same one as a cottage next door). Lord Ashcombe, the keeper of the royal keys, lives in a cottage. | r3s3_25 | Give the manor a distinct sprite: hipped slate roof, two storeys, ashlar, a portico and the quartered-shield sign. |
| O2 | The **farm greenhouse ruin** has a checkerboard of dark broken panes that reads as noise. | r3s3_2 | Use fewer, larger broken areas with jagged edges, and some vines. |

## UI issues
- **The tracker arrow inside Briarholt and the keep always points the same diagonal way.** It says "to Briarholt Keep" with the arrow down-right, wherever the keep is (including when it is straight north). Distance labels sometimes don't change as you approach (the throne at "25 m" while standing at it). See r3s3_31–46 and 49.
- **The local map of Briarholt shows no walls, towers or gate**, only buildings and a road (r3s3_32). The **keep map** colours the wood-floored library bright green like grass and has no room names (r3s3_53).
- **Room title text overlaps the tracker label** (the "THRONE ROOM" fade-in under "The Empty Throne · 25 m", r3s3_49; "PORTRAIT GALLERY" over the carpet, r3s3_67).
- **Left-click to walk with food selected eats it.** With bread in slot 0, two ground clicks ate 4 Trail Bread (5 → 1).
- **The camera lets the player sit under the top-right menu dock** at the farm's east edge (r3s3_10, 11). You can't see yourself.
- **Collapsing at 2 am inside the keep teleports you to the farm** and costs 2,300 g. Losing time indoors is easy because the keep has no clock cue (no night grade, no lit windows inside).
- In the museum, the "Go outside" label and arrow point right while the exit is down (r3s3_23).

## Draw order / collision
- **You can walk onto north wall faces indoors.** The player stands on the brick face of the kitchen's north wall (r3s3_58) and on the gallery wall over a portrait (r3s3_68). The wall-face rows need to be solid, or the face should be drawn over the player.
- **The player clips into the throne** (drawn overlapping the chair back, r3s3_62).
- **The story "!" marker is drawn over the player's face** at the kitchen hearth (r3s3_56).
- Walking south into the village tree line makes the player half transparent and lets them stand inside the canopy row (r3s3_24, 30). That's fine as a see-through, but the border should block earlier.
- Fountain, archery targets, pots and benches sorted correctly against the player in every case I checked.

## Looks great
- **Keep facade** (r3s3_46): drum towers, a gatehouse bay with machicolations, banners, a crest, ivy, arched windows with flower boxes. The best building in the game.
- **South curtain wall and round towers** (r3s3_37, 42): good merlon rhythm, conical slate roofs with purple pennants, arrow slits.
- **Orangery / glasshouse** (r3s3_43): iron glazing bars, a central gabled bay with a fanlight, fruit trees visible through the glass, potted standards at the door. Excellent.
- **Striped pavilions**, **weapon rack**, **straw dummies** and **archery targets**: crisp and on-style.
- **Armour stands, gold candelabras, wine racks, the tapestry of the castle, the grand stair with a purple runner**: all good, readable props.
- Steward and gardener NPCs walking about make the grounds feel inhabited.
- The night grade outdoors with lit lamp posts looks good (r3s3_65).

## Royal / full ideas
1. **Parterre garden**: a symmetrical box-hedge knot with gravel paths, an obelisk topiary at each corner and a sundial in the centre, between the keep and the plaza.
2. **The court in motion**: courtiers in pairs on the plaza, a guard at each gate tower and either side of the keep door, a falconer near the pavilions, servants carrying baskets.
3. **Stable and smithy lean-tos** against the inner curtain wall: a horse trough, a tethered horse, an anvil with sparks.
4. **Bunting and heraldry**: swags of purple and gold pennants between the towers, and shields along the wall-walk.
5. **Inside the keep**: a minstrels' gallery over the great hall, a dais with a high table and a canopy, tapestries every few tiles, rush matting or rugs per room, hanging iron chandeliers (pixel squares of flame), and a window light patch on the floor below the windows. Keep it flat, no gradient.
6. **Cellar mood**: cobwebs in the corners, puddles, chains, and a torch sconce every 6 tiles with `meta.light` flames.

## Top 5 fixes
1. **Make N–S curtain walls look like walls**: a merlon edge, a parapet and an east-side shadow (A1).
2. **Make indoor north wall faces solid** so the player can't stand on walls or portraits (draw order/collision).
3. **A royal throne room**: a dais, a canopy of estate, stone piers instead of Greek columns, a throne scaled to about 2x3, and a polished floor (I1, I2).
4. **A real gatehouse and keep entrance**: a portcullis, door leaves, a taller gatehouse, stone steps, and lit windows at night (A2, A9, A10).
5. **Castle-specific props and floors**: a formal fountain and paving, hedge parterre beds, a built-in great hearth, a four-poster bed and one long hall table, with no village and farmhouse reuse (A4, A5, I3, I4, I5).

Also fix the **frozen tracker arrow** inside Briarholt, and **left-click walking eating the selected food**.

## errors output
```
None
```
