# W2 — Story playtest (Kingdom test, Painterly)

Tester role: story-focused player. Kingdom test (dev mode), Painterly style, FPS counter on. Played The Empty Throne from
the herald's arrival through chapter 4's opening (Find Captain Vey in Kingsbridge): the procession, Elias, Ashcombe's key,
the walk to Briarholt, the warm kitchen, Isolde in the throne room, buying the deed (30,000g), telling Isolde. Explored all
three keep floors (great hall, kitchen, throne room, wine cellar, treasury hoard, crypt with Margit's empty tomb) and the
first floor of the Warrens (killed a rat). I did not reach the Rat King or Kingsbridge, and the side stories begin on day 3-6,
so I couldn't start them (the game was on day 2 when I stopped).

How I moved: walking, plus `walkTo(x, y)` from the console for long trips (the same as clicking far away), and
`objInteract(...).fn()` once to climb the Warrens rope ladder. I used JS only to read state and dialogue text. I didn't
skip any story progress.

Also: my harness helper `w2ev.mjs` in the shared playtest folder was overwritten by another tester's script that connects
to port 9303. Give testers' helper scripts names that include their port.

## Broken

1. **The Warrens hole can't be used with E, and no prompt shows.** In the wine cellar, standing below the hole (17, 9)
   and pressing E does nothing, and `findInteract()` returns null. The sprite is drawn about one tile above its tile, so
   the dashed cursor and the hole don't line up. It only worked when I right-clicked the sprite itself.
   Shots: W2_story_36, W2_story_38.
2. **The Warrens hole sprite is cut off.** Its right edge is a straight vertical cut and there is a red smear under it.
   Shot: W2_story_32 (zoomed).
3. **The treasury hoard can be looted before you own the castle.** On my first visit (chapter 2), "Search" on the hoard
   gave Margit's purse: +5000g, 3 ancient coins and 2 rubies. The vault chests next to it say the steward keeps the keys,
   so this is inconsistent, and it is a 5k discount on the 30k deed. Shot: W2_story_33.
4. **The story contradicts the NPCs.**
   - Ashcombe says "Nobody has lived there since the old king".
   - The kitchen clue says "Someone is living here, and they left in a hurry when they heard you at the gate".
   - But the old household (`bh_scull` Kit, porter, laundress, groom, Aldous) is already there before you own the castle.
     Kit stands beside the warm stove and says "I keep the hearth warm. Aldous says a cold kitchen is a dead house."
     That gives the mystery away.
   - Later Isolde says "We can't hold Briarholt with two people and a harp", while guards already stand at the gate and
     the keep door. Shot: W2_story_26 (Kit next to the clue stove).
5. **E doesn't talk to an NPC who overlaps you.** Isolde stood on top of my character in the throne room (W2_story_27/28),
   and E did nothing because I faced away (toward the mouse). Right-clicking her worked. Story NPCs and the player overlap a
   lot (the herald's riders park on top of you, Isolde, Aldous), so E should prefer a story NPC within about 1 tile.
6. **Space re-triggers an interaction after it closes a lore box.** On Margit's tomb, Space closed the text and the next
   Space opened it again.
7. **Enter didn't press "Start the day" on the morning report** (after the 2 am collapse). I had to click the button.

Console errors (`errors`): none during the whole session.

## Quality of life

- **The walk to the keep is long and goes the wrong way first.** From the farm gap you arrive at the north-west corner of
  the grounds, but the curtain wall makes you walk all the way round the outside to the south gate (W2_story_21).
  - It took about 1 in-game hour of walking on the first visit.
  - Ashcombe's "Mind the brambles" doesn't match anything: the gap is a clean path with no brambles.
  - Consider a postern gate in the north wall, or an arrival point nearer the gate.
- **2 am collapse after the Warrens:** the castle-to-tent round trip costs a lot of time. Isolde offers the royal bed only
  after you buy the deed, so on the first visit the trip home is long. I collapsed (−2,500g, half HP and energy). I didn't
  notice the 1 am warning toast while walking.
- The tracker worked well overall:
  - It led from the farm through the fence gap to the village exit, then to the museum and the manor.
  - The "to Briarholt Keep", "to Emberhollow Village" and "Search here · 33 m" labels were helpful (W2_story_19, W2_story_24).
  - It follows the route, so at first it seems to point the wrong way (west through the fence gap on the farm, south in the
    treasury). That's correct but surprising. A dotted path line would read better than the arrow alone.
- The **journal and recap are very good**:
  - "Begins on day 3 / 4 / 5 / 6" for the other stories is clear.
  - The Read button and recap reproduce every line correctly, with speakers and "Now:".
  - "A New Start — Not begun yet" in the Kingdom test is confusing, because it will never begin there. Hide it once the
    tutorial is impossible or skipped.
- **The dialogue box is a big centred window**, with a 450 px blurry upscaled pixel portrait (smoothed, not crisp) taking up
  half of it (W2_story_6).
  - The text is small next to the portrait.
  - The procession and NPCs vanish from the background while it's open.
- The herald's step text "A royal herald is waiting outside your home" and "He waits by your door" don't fit when your
  home is a tent.
- Choices: Space correctly does nothing at a choice, which is good, and the choice buttons work.
- Hint text: after Elias, "Ask Lord Ashcombe about Briarholt" is fine. Captain Vey is in Kingsbridge, but the Kingsbridge
  waystone isn't attuned in the Kingdom test, so it's a long first walk. It might be worth attuning it in the test.

## Balance

- The **deed (30,000g)** is easy in the Kingdom test (33,000g start), and the free 5,000g hoard plus the +1,500g chapter
  reward make it trivial. In a normal game that's fine.
- Warrens floor 1 rats die in 2 hits at combat 30 with iron gear and barely scratch you (−6 HP). Fine for an optional cellar.

## Art & feel (Painterly)

- **The throne dais is a 3D isometric stone block** (it breaks the "flat" rule), drawn off-centre with the pixel throne on
  top. My character could stand on top of it. This is the worst-looking thing in the keep. Shots: W2_story_27, W2_story_29.
- **A purple carpet runner lies diagonally (rotated about 45°)** in the throne room and looks like a dropped banner
  (W2_story_27).
- **Magenta leaks on the keep's entrance steps:** pink grout lines between the pale steps, and pink halos round the banner
  poles at the keep door. Shot: W2_story_23 (zoomed), also visible at night in W2_story_42.
- **Torn purple banners on poles stand in the middle of the floor**: in the entrance hall, right where you arrive (you spawn
  inside one, W2_story_24), and in the great hall (W2_story_25).
- **Past the map edges**, rooms show a mirrored strip:
  - a duplicated wall band above the museum (W2_story_15);
  - floor tiles below the keep's south walls (W2_story_24, W2_story_27).
  This reads as glitchy. Black would look cleaner indoors.
- Pieces that look pixel-like or weak:
  - Crypt tombs are thin slabs that look like wall radiators (W2_story_34).
  - The stair down is a plain black rectangle (W2_story_30).
  - The wine racks are crisp grids.
  - The courtyard benches are flat grey brackets (W2_story_44).
  - The castle's curtain walls are neat regular brickwork, much less painterly than the keep.
- Warrens: walls and floor are hard to tell apart. The dark cobbled ground is solid rock and the lighter dirt is floor, edged
  only by thin lines, and bricks sit on the wall line (rule 7, W2_story_39/40/41). The map is not dark despite `dark`.
- Courtyard at night (W2_story_42):
  - The lamps are small flat lit squares with no glow.
  - I saw no torches at the keep door.
  - The keep windows were off-screen, so I couldn't check them.
- Good looking:
  - the museum exterior and the village houses (W2_story_14);
  - the castle plaza fountain;
  - the castle grounds in daylight (W2_story_22);
  - the kitchen hearth fire;
  - the candelabras;
  - the armour stands.
- Characters stay pixel templates as designed. Next to painted buildings they look small and crisp, which is expected.

## Performance

- Steady 127-131 fps everywhere (farm, village, museum, grounds, keep, cellar, Warrens), 0.8-1.6 ms work.
- One hitch while walking into the great hall: 97 fps with 12.3 ms work (W2_story_25).
- On the grounds at night it was 6.2 ms work per frame (W2_story_42), higher than in the day.

## Liked

- The story writing is strong and funny: "Hunters don't knock things over in kitchens", "I would rather eat this hairpin",
  Ashcombe's "Look after her. I mean the castle. Obviously." No typos found in any line I read.
- The herald's procession riding in and parking is a lovely opening (W2_story_5).
- The recap is excellent: every chapter, step and line, in order.
- Story objects glint gold, so they're easy to spot.
- Story steps say who and where ("(in Emberhollow Village)").
- The keep has a real sense of place: room names fade in ("THRONE ROOM", "WINE CELLAR"), Margit's empty tomb, and the
  hoard purse from her.

## Top 5 fixes

1. Make the Warrens hole usable with E: line the sprite up with its tile, show a "Climb down" prompt, and fix the cut-off
   right edge.
2. Fix the throne room: the 3D isometric dais, the diagonal carpet runner, and story NPCs (Isolde) standing on top of the
   player. Let E reach an overlapping or adjacent story NPC.
3. Keep the old household (Kit, Aldous, porter...) and the gate guards out of the keep until the mystery is solved and the
   deed is bought, or rewrite Ashcombe, the kitchen clue and Isolde's "two people and a harp" to match. Lock the treasury
   hoard until you own the castle.
4. Clean the magenta from the keep steps and banner poles. Remove the free-standing torn banners from the entrance and great
   hall floors (you spawn inside one).
5. Shorten the first trip to the keep: add a north postern or an arrival nearer the gate, so you don't walk round the whole
   curtain wall. Show the mirrored band past indoor map edges as black.
