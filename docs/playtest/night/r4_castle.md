# Playtest r4: castle life player (Briarholt)

Persona: wants to own Briarholt as fast as possible, then live there. Played "Kingdom test" through the harness on port 9302, about 130 commands. Screenshots are `r4s2_<n>.png` in the playtest scratchpad.

## Summary
I got the deed in about 1.5 in-game days: herald → Elias → Ashcombe → keep → kitchen stove → Isolde → treasury (+5,000g) → slept in the royal bed → sold 2 rubies at Mara's (+520g) → paid Ashcombe 30,000g. I ran out of command budget before walking back to tell Isolde, so I never saw the castle as **owned**. All of "living there" below was tested before ownership.

The keep looks great. It is the best interior in the game so far:
- a checkered entrance hall with armour stands;
- a great hall with set feast tables;
- a throne room with a dais, candelabra and a tapestry;
- a solar with a harp and fireplace;
- a canopy-bed chamber, a map room, and a portrait gallery;
- a wine cellar, dungeon cells, and a treasury with gold piles.

The courtyard is also lovely: fountain, banners, lamp posts, well, topiary, flower beds, a training yard with archery targets, dummies and tents, and two glasshouses.

It feels **staged rather than alive**:
- Only two court members were out (steward Aldous and gardener Wenna). Their lines don't react to the story (Aldous still says the keep is "not receiving visitors" after I've met the princess).
- Most furniture is inert. The wardrobe, chests and second gold pile did nothing.
- Getting around is a slog. The keep map has no room names, the tracker arrow points the wrong way, gates and doorways are hard to find with WASD, and the castle is a 2-3 minute walk from the village, where the deed is sold.

## Bugs
1. **Tracker arrow points the wrong way, or at the wrong thing.**
   - On the castle grounds "to Briarholt Keep" pointed up, toward the farm exit, while the keep was to the south-east (r4s2_25, r4s2_27).
   - In the great hall "The Empty Throne · 15 m" pointed down-right while the kitchen was west (r4s2_34). It also pointed down-right on the way to Isolde.
   - The arrow sprite sits at a fixed screen position above the head, and its angle often has nothing to do with the target. The village→museum leg had the same problem (r4s2_9).
2. **Draw order: the story stove covers the player.** In the kitchen, standing just below the glinting stove, the stove (chimney and body) is drawn over the player's head and torso (r4s2_36).
3. **Draw order: the stairs-down sprite covers the player's legs** on the upper floor when you stand just above it (r4s2_66, r4s2_84).
4. **The player looks like they stand inside or on the curtain wall.** Inside the walls, walking up to the south or west wall leaves the player's legs inside the crenellated wall-walk band, so they appear to stand in the wall (r4s2_89, r4s2_90, r4s2_91).
5. **Dark void above the castle's north edge.** At the top-left of the castle map, where the road meets the north tree line, a black-green void shows above the trees. The tracker label is clipped behind the HUD there (r4s2_96, r4s2_98).
6. **Esc on a story "Close" box opened the Satchel (Map tab)** instead of just closing the box (map room, r4s2_70).
7. **Extra Space presses after a dialogue reopen the shop.** After Elias's dialogue ended, the remaining presses opened the museum window (r4s2_16).
8. **LMB with a sword on empty floor indoors does not walk.** It just swings (cellar, r4s2_56). Outdoors, with no enemy, far LMB clicks are supposed to walk.
9. **Right-clicking a wandering NPC often fails.**
   - Aldous and Wenna kept walking off. Twice I ended up beside the wrong NPC: clicking Wenna opened Aldous because he walked into the path (r4s2_87).
   - A clicked villager is supposed to wait (`n.waitT`), but they still drifted before I arrived.
10. **Ashcombe's story line plays through his closed door** at 8:50 (manor opens at 9). At the same moment a toast says "Manor (land) is closed" (r4s2_19). This is harmless, but the two messages contradict each other.
11. **Isolde vanishes from the throne room as soon as chapter 2 ends**, with no exit animation and no hint where she went (r4s2_42). I never found her again.
12. The glasshouse prompt says "E Enter · West Glasshouse", but the result is "The glasshouse is locked" (pre-deed, r4s2_93). The prompt should say Locked.
13. Possible name mismatch: the chapter title says "A Rider from **Kingsholt**", while the map room lists Kingsbridge, Greyhelm, Ashford, Saltmere "and the capital". If Kingsholt is the capital, the game should name it somewhere.

## Confusing
- **The keep and cellar maps** (M) show rooms as plain green blocks with no names and no furniture. On the ground floor the "You" dot was off-screen. I had to guess where the kitchen, treasury and armoury are (r4s2_32, r4s2_58, r4s2_67).
- **Doorways between rooms** are 1-2 tiles wide in thick dark walls and easy to miss with WASD. I bumped walls many times.
- **The castle gate is easy to miss.** Twice I walked along the inside of the south wall and missed the gate.
- **The road from the farm** runs down the outside of the west wall and around to the south gate. You walk past the whole castle before you can get in, and the map doesn't draw the walls.
- **Entering the village from the farm** put me in the middle of the plaza rather than at the west edge.
- **The treasury has two gold piles and two chests,** but only one pile does anything. The rest look interactive and aren't.
- **Room-name banners** (KITCHEN, THRONE ROOM, SOLAR...) are nice, but a faint second copy lingers behind other labels. In the museum the room name is ghosted on the wall (r4s2_14).

## The court
- **Aldous** (steward, dark robe): wanders the courtyard. His two lines were "keep not receiving visitors" and "Ashcombe holds the deed now". The second is fine; the first is stale once you've been inside.
- **Wenna** (royal gardener): wanders the flower beds. Her line about twenty years of tending beds is good.
- **Not found:** guards, maid, stable hand, cook, scribe, chaplain. They may only appear after the deed or in rooms I didn't reach (chapel, library, armoury). Before ownership the keep is empty apart from Isolde.
- The court NPCs walk constantly and quickly, which makes them hard to talk to.

## Rooms & furniture
Visited:
- **Ground floor:** entrance hall (grand stair up, stair down), great hall (feast tables, great hearth), kitchen (two stoves, range, story stove), throne room (throne, dais, armour, candelabra).
- **Upper floor:** gallery (portraits, pillars), solar (harp, fireplace, bookshelf, table), royal bedchamber (canopy bed, wardrobe, dresser, rugs), map room (war table).
- **Cellars:** wine cellar (racks, kegs), dungeon (cells with straw), treasury.

Not reached: library, chapel, pantry, armoury and its bank chest, guard room, Isolde's chamber, bath, crypt.

What the furniture did:
- **Bed:** "Royal Bedchamber" window → Sleep until morning. It works, even before you own the castle. It is a huge empty window for one button and should be a small window (r4s2_77).
- **Harp:** "You pluck a few notes. The hall answers with an echo." (toast). It's a nice touch; I couldn't tell whether a sound played.
- **War table:** flavour text about Valdmark's towns. It's good, but the table could open the world map.
- **Wardrobe:** no prompt, no reaction (r4s2_82). I expected the creator / change outfit.
- **Treasury:** the first gold pile gave +5000g, 3 ancient coins and 2 rubies. The second pile and both chests did nothing.
- **Kitchen story stove:** works, then disappears.

## Glasshouses
West glasshouse: "The glasshouse is locked. Its beds are green with weeds." This was before ownership. I couldn't test planting after buying the deed (out of budget). The exterior is beautiful, with fruit trees visible through the glass.

## Looks
- The keep exterior is excellent: a towered facade, purple banners, a crest, ivy, and a double door under a portcullis arch.
- Interiors read well. The checkered marble, wood floors and stone walls change by room, which gives each room its own feel.
- The curtain wall's inner side is just a crenellated band with no inner face or stair up to the wall-walk. From inside, the west wall looks like a thin grey strip (r4s2_25).
- The corner tower and west wall joint looks odd: a short wall stub pokes down the side of the tower (r4s2_97).
- The dungeon "cells" are just a row of bars with hay bales behind them; they need a back wall.
- The keep has no time-of-day difference indoors at night. That is fine, but the candelabra are never lit.

## QoL wishes
1. Room names on the keep maps, and room labels on the M map for all three floors.
2. A waystone or carriage at Briarholt, or let Ashcombe's deed sale happen at the castle (the steward could handle it). The castle↔village walk is long.
3. Make the tracker arrow reliable: point at the real target, or at the right stair/door when the target is on another floor.
4. Talk to wandering court NPCs on a click that really pauses them, and let E pick the nearest NPC.
5. Furniture that does something:
   - the wardrobe opens the appearance editor;
   - the chests are storage;
   - the war table opens the world map;
   - the library gives a lore or skill book;
   - the chapel altar gives a blessing.
6. After the deed, court members should say something about the new owner.
7. Wider doorways, or click-to-walk through rooms (right-click on far floor walks; LMB with a weapon indoors should too).

## Liked
- The herald's procession of knights arriving on the farm is a great opener.
- The chain of story beats is quick, clear and cosy: museum, manor, the warm kitchen stove with the stag hairpin, and the princess hiding in the throne room.
- The treasury hoard is a satisfying find, and Margit's purse ties into the story.
- Sleeping in the canopy bed with "sheets smell of lavender".
- The harp echo line.
- The courtyard composition: fountain, banners, topiary, the training yard with tents.

## Top 5 fixes
1. Tracker arrow direction and target (bug 1). It is the main reason getting around the castle is confusing.
2. Draw-order problems: story stove over the player, stairs over legs, player inside the wall-walk (bugs 2-4).
3. Keep maps with room names and the player marker in view.
4. Make the court present and reactive. Several listed members never appeared. Aldous's lines should change after the deed, and Isolde should say where she's going.
5. Interactive furniture (wardrobe, chests, war table → world map) and a small window for the bed.

## `errors` output
```
none
```
