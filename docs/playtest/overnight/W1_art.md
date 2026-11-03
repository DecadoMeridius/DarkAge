# W1 art director: Painterly across the world (Kingdom test)

The Kingdom test was played on port 9303 with the Painterly style and the FPS counter on, at zoom Auto.
Route:
- Farm → waystone to the village → north into the Wilds.
- Kingsbridge: walls, gate, plaza, Wynna's Emporium, the inn.
- The road east: hills, cliffs, the Bandit Warlord's camp.
- The coast and Saltmere at dusk and night (waystone attuned).
- Waystone back to Kingsbridge at 11:30 pm, then the farm at midnight.
- Sleep, and the farm at dawn on day 2.

Not reached: Greyhelm, Ashford, a region, a mine floor, rain. Day 2 was "Clear skies", and the budget ran out after the long walk.
Screenshots: `shots/W1_art_<n>.png`. The `..z`, `..a` and `..b` files are 2x crops.
Note: shots 1-19 (title, farm, village, first Wilds steps) were taken but I couldn't view them, so this report doesn't cover them.

## Broken
- **Signposts at Saltmere look like treasure chests on poles.**
  - Seen at the north road exit (W1_art_52 at 270,640 and W1_art_60 at 345,200).
  - The painted sign board reads as a closed chest on a stick, so players will try to open it.
  - Other signposts are fine: the plain board at the Saltmere west edge (W1_art_61) and the farm sign.
- **Night window lights land in the wrong places.**
  - The style changed where windows are, but the lit rectangles still use the pixel `meta.win`.
  - **Kingsbridge half-timbered house** (W1_art_65a): the **shutters glow** as two yellow bars either side of each window. The top row of panes stays blue and unlit; only the bottom two rows are lit.
  - **Kingsbridge brick house** (dark roof, right edge, W1_art_65b): the light is broken into 4 separate yellow blobs. They spill past the window frame onto the brick.
  - **Saltmere stilt houses** (W1_art_49z, W1_art_61z): the top pane row is unlit. The left window of each house has dark painted scribbles over the light, which looks like soot or a broken window.
  - **Saltmere fishmonger** (blue roof, W1_art_61): no lit windows at all at 11 pm, while every house near it is lit. It may be meant as a dark household, but next to the lit houses it looks wrong.
- **Enter doesn't press "Start the day"** in the morning report (W1_art_71). CLAUDE.md says Enter presses a window's main button. I had to click.
- **Possible stuck moment** among the palms (south of Saltmere, W1_art_56 and W1_art_57).
  - After a fight, d 2.5 s plus w 8 s left the player in exactly the same spot, inside a palm trunk.
  - s and a then worked. It may have been hit-stop, or a narrow-trunk collision trap.
- No console errors (`errors`: none).

## Quality of life
- **The "to Hollowmere Farm" tracker label sits in the middle of the screen.**
  - It stays over the player's head for hours, in Saltmere, on the beach and in the Warlord fight (W1_art_43, 49, 54).
  - It covers the art and the enemies right above you.
  - Suggestion: fade it after the 4 s that CLAUDE.md describes, or move it to the screen edge.
- **After waystone Travel the window has already closed**, so the habitual Esc opens Options (W1_art_64, W1_art_66). Happened twice.
- **The Bandit Warlord stands on the main road east of Kingsbridge** on day 1 at about 5:40 pm, right by the road (W1_art_43-45).
  - I lost 220 HP walking past him and lost all 3 lives on the way to Saltmere (W1_art_55, 56).
  - In a Kingdom test that's harsh for someone sightseeing.
- **The morning report is a full-screen parchment for one line** (W1_art_71). It could be a small window.
- **Map:** waystones are hard to tell from other marks. The purple squares are bandit patrols, but they look like waystone diamonds (W1_art_59).

## Balance
- Slime packs of 6-7 on the Saltmere beach at night, plus bandits, wore down 300 HP fast with an iron sword (W1_art_53-55).
- The Warlord's melee hit me for about 80 per strike.

## Art & feel (Painterly)
**What holds up**
- Kingsbridge plaza (W1_art_26, 27) is the best place in the game.
  - The fountain, market stalls, benches, lamp posts and guards all read as one painted style.
  - Buildings are whole, doors face the cobbles, and the sun-and-cloud light drift looks good.
- The forest in the Wilds (W1_art_25, 37) is lush and consistent, and the canopy fade over the player works.
- The ivy-covered ruined greenhouse on the farm (W1_art_67, 72) is lovely by night and at dawn.
- The Kingsbridge inn interior (W1_art_34): marble floor, bar, bookcases and lamps. Painted, coherent and warm.

**Problems, by place**
- **Kingsbridge walls and gate** (W1_art_25, 39):
  - The north gate tower pair and gatehouse are drawn **over the road**. The cobbled road continues north as a narrow tongue sticking out above the wall line (W1_art_39 at 660,210-400).
  - The "EMBER MEADOW" area banner overlaps the road stub and the signpost label.
  - The sign label "Greyhelm → · Ashford ↖ · Saltmere → · Emberhollow ↓" is one long line straddling both towers.
- **Kingsbridge east wall** (W1_art_20, 21, 22):
  - The north-south wall is a thin column of stacked blocks with flat blue-grey rectangles beside it (the shaded east face).
  - It looks pixel/blocky next to the painted houses, and the dark east face reads as a flat untextured strip.
  - The wall-walk corner tower at 700,480 (W1_art_21) is good.
- **Kingsbridge brick house beside the east wall** (W1_art_32, roof at 940-1380,175-330): the roof is a **flat black slab** with no shingles or texture. It looks unrendered, like a missing restyle.
- **Kingsbridge houses**: the dark-blue slate roofs on the small brick houses (W1_art_27, 387-515,340) are near-flat navy with little texture. They look pixel next to the painted red tiles.
- **Wynna's Emporium interior** (W1_art_28, 31):
  - The room's top part (a second room strip at y 0-230) floats above, cut by a black band.
  - The "WYNNA'S EMPORIUM" room-name banner lies over that gap.
  - At zoom 2x the room is tiny in a sea of black.
  - The shopkeeper and counter are good.
- **Ground**:
  - Grass has a visible painted repeat in open meadows. The same tufts and light patches line up in rows (W1_art_40, W1_art_44 right side).
  - Hill cliff edges are thin straight lines with small "cliff block" stubs (W1_art_41, 42). These read as pixel tile edges, not painted terrain.
  - The road east turns from dirt to cobble in a hard horizontal seam (W1_art_52 at 370-500,380, W1_art_60 at 440-580,440).
  - The cobble road at the Kingsbridge gate stops in a straight line (W1_art_36 at 430-700).
- **Coast**:
  - Water meets sand with a hard ragged edge and no foam (W1_art_49, 50, 53). The sea is one flat navy with small dashes; it reads as a lake.
  - Rowboats lie on dry sand in Saltmere (W1_art_61 at 1090,685).
- **Characters vs. world**:
  - The player and every NPC are crisp, blocky pixel sprites with hard edges (Scale2x look) among painted trees and buildings.
  - The Bandit Warlord at 2.5x size looks 3D and voxel-like (W1_art_43, 44).
  - The pale knight player at night/dusk becomes a flat sepia or blue silhouette (W1_art_48, 60).
  - This is the biggest style break; most visible in the plaza and the inn.
- **Procession on the farm** (W1_art_68, 73): the wagon horses are about half the size they should be next to their wagons (pony-sized beside a big cart).
- **Small pebbles on the farm** (W1_art_73) look like brown eggs or potatoes.
- **The night grade over painted ground** is very dark green. The beach becomes grey mud (W1_art_57, 60). Lamp posts in Kingsbridge glow nicely (W1_art_65), but the farm campfire's glow is a tiny dot (W1_art_69).
- **Shadows** are plausible (soft, to the bottom-right) on trees and buildings. They get very long and dark across the meadow in late afternoon (W1_art_40 at 900,280: a shadow detached from any object, maybe from an off-screen tree).

## Performance
- About 105-131 fps everywhere, with 1-8 ms work: towns, forest, coast, night, interiors.
- The lowest was 95 fps on the dark beach among palms (W1_art_58).
- No stutters seen.

## Liked
- The Kingsbridge plaza, the fountain and the stalls.
- The dense painted forest.
- The ivy greenhouse.
- The warm inn interior.
- The lamps at night.
- The waystones are quick to use and attune by touch.

## Top 5 fixes
1. **Night window lights:** restyled buildings need their own window rectangles. Light only the glass: not the shutters, not across the brick, and all pane rows.
2. **Saltmere signposts that look like chests:** redraw or re-cut that sign (and check the other town exit signs).
3. **Pixel characters and the voxel-looking Warlord in a painted world:** soften them more or give them a painted outline, or keep big bosses at a scale that doesn't look 3D.
4. **Unfinished-looking surfaces:**
   - the flat black roof on the brick house east of Kingsbridge (W1_art_32) and the textureless navy slate roofs;
   - the blocky north-south town wall with its flat grey face;
   - the cobble road poking through the north gate.
5. **Ground seams and the coast:**
   - dirt-to-cobble straight seams;
   - meadow grass repeats;
   - hairline cliff edges;
   - foam and a sea texture where water meets the beach.
