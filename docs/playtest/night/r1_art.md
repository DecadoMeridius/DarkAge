# Night playtest r1: art and UI critic (Kingdom test)

Tester: AI persona "picky art and UI critic". Harness port 9303. Screenshots are `s3_<n>.png` in the playtest scratchpad folder.
Played for about 110 harness commands: Kingdom test → herald procession → herald dialogue → the Wilds → Kingsbridge (gates, plaza, bank, town hall) → waystone back → Emberhollow village (Elias at the museum) → Ashcombe's manor (closed after 17:00) → the farm's south-east tree line at dusk.

**Not reached:** Greyhelm, Ashford, Saltmere and Briarholt. The story stalled because the manor shuts at 5 pm, and I found no castle sign at the farm's south-east tree line.

## Summary
The new content holds up well against the older art. Building sprites, the Kingsbridge plaza fountain, town houses and interiors use the same ramps, outlines and shading as the farm and village, and nothing looked blurry or smoothed. The weak spots are composition and staging:
- **Procession:** knights stack on top of each other, and the herald stands on the campfire. I never saw the wagons.
- **City walls:** the N-S walls are a thin one-tile ribbon, and the gates are bare gaps between towers.
- **Kingsbridge looks unfinished:** the "city" is mostly empty grass lots and an empty plaza with four unmanned stalls. The village feels more alive.
- **Floating labels:** tracker, signpost and hint labels pile on top of each other all the time.
- **Interiors:** you can walk behind counters, and the Kingsbridge bank "Vault" prompt does nothing.

`errors`: **None** (no JS errors during the session).

## Art issues
1. **Procession knights overlap in pairs.**
   - Where: farm, after the procession parks (s3_5, s3_6, s3_7).
   - What: two knights stand at the same x, one tile apart vertically, so they read as one 2-headed sprite. The same happens while they walk off.
   - Fix: give parked slots at least 1 tile of spacing in both axes, or stagger them in a V or a line beside the herald.
2. **Herald parks on top of the campfire.**
   - Where: s3_5, s3_6 (the fire is hidden under him). Afterwards the player stood in the same spot, overlapping the fire (s3_7).
   - Fix: pick the herald's parking spot with a free-tile check (no objects), or offset it from the tent/campfire cluster.
3. **No wagons seen.**
   - Where: the whole procession (s3_4, s3_5).
   - What: I saw only knights and the herald walking up the path. Either the wagons parked off-screen or they never spawned.
   - Fix: park the wagons in view of the herald, for example beside the dirt path.
4. **City walls running N-S are a 1-tile stone ribbon.**
   - Where: Kingsbridge east wall (s3_27, s3_38, s3_41) and the west wall.
   - What: the south and north runs have a tall brick face with a crenellated wall-walk. The vertical runs show only a grey strip with no face, no crenellations and no shadow. They look like a path, not a wall.
   - Fix: draw vertical runs as a crenellated top with a lit west edge and a shaded east edge (2 tiles wide), plus a cast shadow on the outside.
5. **Gates are just gaps.**
   - Where: east gate (s3_27, s3_28) and north gate (s3_39).
   - What: two round towers with grass or cobbles between them, and no arch, portcullis, gatehouse or doors. The north gate towers are squeezed together.
   - Fix: add a gatehouse sprite (an arch over the road, a raised portcullis, a banner each side) spanning the opening, drawn with its lintel over the player.
6. **Tower and wall join.**
   - Where: SE corner and east gate (s3_25, s3_26, s3_27).
   - What: the east wall ribbon shows above and behind the conical tower roof, so the tower looks pasted in front of a pole.
   - Fix: end the wall ribbon at the tower's centre, or draw the tower top over the run.
7. **Plaza paving vs road cobbles: hard straight seam.**
   - Where: Kingsbridge plaza edge by the bank (s3_36, s3_38).
   - What: two different stone textures meet in a perfectly straight line. The plaza also frays into grass with ragged edges on its north side (s3_30).
   - Fix: add a kerb or border row of dressed stones around the plaza, and blend road-to-plaza with a transition tile.
8. **Fountain foam puddle.**
   - Where: Kingsbridge fountain (s3_29, s3_30).
   - What: the underlying pond tile's foam shoreline spills out from under the basin as an irregular white-edged puddle on dry paving. The village fountain doesn't show this.
   - Fix: pave the tiles under the Kingsbridge fountain the same way the village fountain's are.
9. **Market stall touching the bank wall.**
   - Where: s3_36.
   - What: the NE plaza stall overlaps the bank's left wall edge.
   - Fix: move the stall 1 tile west, or shrink the plaza stall grid.
10. **Kingsbridge feels empty.**
    - Where: s3_29, s3_38, s3_41.
    - What:
      - **Plaza:** four identical red-white stalls with no vendors, four benches and nobody else.
      - **Wards:** between buildings, large blank grass lots.
      - **Lamp posts:** they sit in the grass lots rather than along the roads.
      - **Statues:** identical grey knight statues flank the two identical portico buildings (temple/town hall), and those two buildings are near-mirrors (s3_39).
    - Fix:
      - Fill the lots with gardens, hedges, wells, carts, crates, washing lines, trees in planters and small houses.
      - Give each stall a vendor and different goods (fish, cloth, pottery).
      - Line the roads with lamps.
      - Make the temple and the town hall look different (a bell tower or a spire on the temple, a clock or flags on the hall).
11. **Wooden plank structures on dry land.**
    - Where: next to the Wilds crossroads waystone (s3_17–s3_21) and twice more along the Wilds' south edge (s3_43, s3_46, s3_49).
    - What: vertical plank docks or palisades standing on sand or dirt with no water. One of them is solid and, together with the waystone, trapped the player (see collision).
    - Fix: if they are piers, they need water. If they are bridges over a carved road, remove them where the road replaced the river.
12. **Ghost or faded trees not covering the player.**
    - Where: s3_17.
    - What: a tree south of the player renders semi-transparent even though it doesn't cover him.
    - Fix: only fade canopies whose sprite rectangle actually overlaps the player.
13. **Pale square artifacts.**
    - Where: s3_27 (near the red roof), s3_29 (bottom right), s3_41.
    - What: faint, semi-transparent large squares float over grass and paving, probably smoke or particles at the wrong scale.
    - Fix: check the particle size at 2x zoom, and snap particles to art pixels.
14. **The ruined greenhouse's glass** reads as a checkerboard of black squares (s3_2, s3_14). It's an older asset, but it's the first thing seen in the Kingdom test. Broken panes would read better as dark-teal holes with jagged edges than as pure black squares.
15. **Player's side-view helmet** is a flat bucket with a 1px slit, and the body is very narrow in profile (s3_13). Fine, but the profile is noticeably thinner than the front view.
16. **Dirt stain in the village plaza** (s3_50, at the left): an orange-brown blob on the cobbles that looks like a texture error.
17. **Interior floors** in the bank and town hall reuse the outdoor grey-dirt ground texture with grass flecks (s3_31, s3_40). Grand interiors need flagstones, marble or boards.
18. **Rug overlaps the wall.** In the bank, the rug's bottom edge overlaps the lower wall line and the doorway (s3_31).
19. **Town hall interior is tiny** compared with its large exterior: one small room with a dining table jammed against the counter (s3_40).

## UI issues
1. **Label pile-ups.** Floating labels collide constantly:
   - The tracker "to Emberhollow Village" overlaps the crossroads signpost text (s3_21) and the Kingsbridge gate signpost (s3_27).
   - The signpost "Old mine: north-east · the coast: east" overlaps the "LMB Attack" hint (s3_15).
   - Fix: run the tracker label through the same label-avoidance used on the map, and lift signpost labels above the hint row.
2. **Stale or misleading tracker.**
   - Inside the village museum (in the village itself) the arrow still reads "to Emberhollow Village" and points at the wall (s3_53, s3_55).
   - Inside the Kingsbridge bank it floats over the back wall (s3_32).
   - Fix: hide the tracker inside rooms unless the target is in that room.
3. **The quest list doesn't scroll with the mouse wheel** (s3_9, s3_10). Only the scrollbar arrow worked.
4. **The active story is hard to find.** In the Kingdom test the active story is the last card, under the 7 Getting Started steps and 5 locked stories (s3_11). Put tracked or active stories first.
5. **Story name mismatch.** The story chapter says "A Rider from Kingsholt", but the city is Kingsbridge.
6. **Cinzel glyphs still look off in headings.**
   - "SATCHEL" renders the CH pair oddly (s3_8).
   - "GREYSTONE HIGHLANDS" renders H and the first letters as a swash (s3_39).
   - "EMBERHOLLOW MUSEUM" sits over the room's top wall (s3_52).
7. **Oversized windows for little content.**
   - The waystone list (2 rows) fills the whole Satchel-size window (s3_42).
   - The museum window with one row is the same (s3_54).
   - Fix: use `#modal.small` for both.
8. **The story dialogue box overlaps the ability bar** (the Guard button is half covered, s3_6).
9. **The player is hidden under the hotbar or past the screen edge at map edges.**
   - Walking along the Wilds' south tree line puts the player behind the hotbar (s3_44–s3_49).
   - At the village's west edge the player and tracker label are cut off at x 0 (s3_59, s3_60).
   - Fix: let the camera scroll past the map edge by the hotbar height, or clamp so the player stays inside a safe rectangle.
10. **The Wilds map** (s3_16, s3_23):
    - The "Farm" and "Village" labels sit at the bottom left, nowhere near the explored patch.
    - "Saltmere" is clipped at the right edge.
    - The farm map shows a "You" label overlapping a yellow dot (s3_12).
11. **Bank "Vault" does nothing.** The prompt shows "E Vault" / "RMB Vault", but E and RMB open nothing (s3_34, s3_35). The banker herself can't be talked to from behind or beside the counter (s3_33).
12. **Extra Space presses after story dialogue open the shop window.** Pressing Space past the end of Elias's lines opened the museum donation window (s3_54). An Enter or Space press that closes a dialogue shouldn't fall through to the main button.

## Draw order / collision
- **Walking behind counters.** In both the bank and the museum, click-to-talk pathing walks the player around the counter's end and behind it next to the keeper (s3_32, s3_53). Once there, the museum trapped me: S didn't move me, and I had to press A, then S. Make the space behind counters non-walkable for the player (or block the counter ends).
- **Stuck between the waystone and a plank structure** at the Wilds crossroads: W and D did nothing until I pressed A and S (s3_19, s3_20).
- **The waystone teleport drops you on top of the stone** (overlapping the sprite, s3_43).
- **Herald and player share a tile.** Talking to the herald put the player inside him (s3_6).
- **Guard clipped by a wall.** At the Kingsbridge east gate, a guard's body is cut by the wall ribbon, as if drawn behind it while standing in front of it (s3_27, lower guard). The other guard overlaps the tower.
- **Leaving a building puts you under trees.** Leaving the museum placed the player south of the door inside the treeline canopy (s3_56). Leaving the Kingsbridge town hall placed me several tiles from its door (s3_41).
- **Benches block plaza movement** with no visible reason: the player got stuck at the bench edge (s3_30).
- **No castle sign found** at the farm's south-east tree line (s3_63), though the brief says one stands there from the start. It may be hidden under the canopy, or not placed in the Kingdom test.

## What looks great
- **Herald portrait and dialogue panel:** clean and readable (s3_6). The royal purple-and-gold livery reads clearly on the knights.
- **Kingsbridge buildings:**
  - The ashlar portico bank, the slate-roofed stone houses, the half-timbered red-roof houses and the green-roofed shop with its striped awning (s3_38).
  - They are crisp, consistent with the village and correctly scaled.
- **The tiered fountain** with its pixel water arcs (s3_29).
- **The bank interior** has a good kit:
  - gold candelabras, a purple banner and a painting;
  - armour stands, chests, plants and a patterned rug (s3_31).
- **Town hall interior details:** the bookcases, hearth, royal portrait and banquet table (s3_40).
- **Round towers** with conical slate roofs and pennants. The south wall face and wall-walk look good (s3_25).
- **Lighting:** the golden-hour and dusk grade stays flat and even, as intended, and lamp flames light up nicely (s3_59–s3_63).
- **The crossroads signpost** listing all four towns with arrows is a great touch (s3_17).

## Royal / full ideas (Kingsbridge now, Briarholt next)
- **Gatehouses:** an arched gatehouse with a portcullis, banners each side and two guards on the wall-walk above. Add a small drawbridge or a moat segment at the main gate.
- **Wall-walk sentries:** guards pacing the wall-walk, and banners (purple/gold Ember Stag) hung every few crenels down the wall face.
- **Plaza life:**
  - vendors at every stall, a town crier near the fountain and pigeons;
  - flower boxes, potted topiary, a statue of a past king instead of a generic knight;
  - bunting strung between lamp posts.
- **Districts instead of grass lots:**
  - a noble row of tall townhouses with gardens and hedges;
  - a craft row with signs, crates, barrels and a cart;
  - a cathedral or temple with a spire and stained glass;
  - a palace or keep silhouette at the city's head.
- **Paths:** a red carpet or banner-lined processional road from the main gate to the town hall. Lamp posts along roads, trees in planters, a well, a notice board.
- **Briarholt (and the throne rooms):**
  - Carpet runner from the door to the throne.
  - Tapestries between the pillars, and braziers or chandeliers.
  - Heraldic shields above the throne, and a dais with steps.
  - Guards at the dais, courtiers and a herald by the door.
  - Banquet hall tables set with food and candelabras.
  - A courtyard with a training yard (dummies, weapon racks), a stable with horses, and the procession wagons parked inside the walls.
  - Flags on every tower.
- **Procession:** wagons with a canopy in royal colours and a banner pole, a mounted standard-bearer, and knights in a 2-wide column. They should park in a formal line, not a cluster.

## Top 5 fixes
1. **Procession staging:** space the knights so none overlap, keep the herald off the campfire and other objects, and make the wagons park in view.
2. **City walls and gates:**
   - Draw N-S wall runs as proper 2-tile crenellated walls with a lit and a shaded edge.
   - Add real gatehouse arches or portcullises.
   - Fix the tower/wall join and the guard clipping.
3. **Fill Kingsbridge:** vendors at the stalls, townsfolk walking the plaza, props and gardens in the empty grass lots, lamps along the roads, a kerb at the plaza edge and paving under the fountain.
4. **Label collisions and the tracker:**
   - Run the tracker label and signpost labels through overlap avoidance.
   - Hide the tracker in rooms whose target is elsewhere.
   - Keep the player out from under the hotbar at map edges.
5. **Counters and interactions:**
   - Make the space behind shop counters non-walkable for the player.
   - Fix the bank "Vault" prompt so it opens the bank.
   - Use small windows for the waystones and the museum.
   - Stop Space or Enter after a dialogue from opening the shop.

## errors
```
None
```
