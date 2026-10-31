# Night playtest r1: STORY player (The Empty Throne)

Harness port 9301. Title screen → **Kingdom test**. About 100 harness commands. Screenshots are in the playtest scratchpad (`s1_*.png`, plus the dialogue strips `dlg1.png`, `dlg2.png` and `dlg3.png`).

## Summary (how far I got)
I got to chapter 2 of 13, "Smoke over Briarholt", step 2: *"Search the keep for whoever lit the fires. Try the kitchen. (marked on your map)"*.
- What worked: the procession arrived and I talked to the Royal Herald. Elias at the museum gave me the reveal about Margit, and Lord Ashcombe gave me the key. I found the Briarholt exit on the farm, crossed the grounds, entered the keep and reached the kitchen.
- Where it stopped: the tracker and the map `!` point at a floor spot beside the great hearth. Nothing there can be interacted with (details under Bugs). **Softlock**: I never met anyone in the castle, never saw Isolde, and never got to the towns or the Wilds.
- `errors`: **none** (no JS errors the whole session).

## Bugs

1. **SOFTLOCK: the kitchen story target can't be used** (castle_in, kitchen). This is the blocker.
   - Steps: follow the step "Search the keep… Try the kitchen". A yellow `!` floats on the floor between the great hearth and a stove (s1_51, s1_52, s1_55, s1_59).
   - Nothing is drawn there: no person and no object.
   - What I tried, none of which worked:
     - walking onto it;
     - pressing E next to it while facing it, from the left, the right and below;
     - right-clicking the `!` (the pathing walked me onto it, then nothing);
     - left-clicking it.
   - The top-right interaction prompt never shows. Right-clicking the hearth only opens the normal Kitchen recipe window; the story does not speak first.
   - The journal stays on the same step. Waiting about 1 in-game hour changed nothing.
   - My guess: the story object or person (Isolde?) is not being placed, or sits on a solid hearth/stove tile where it is hidden and can't be reached.
2. **The tracker sent me to the wrong building for Lord Ashcombe** (village).
   - After Elias the step is "Ask Lord Ashcombe about Briarholt". The arrow and its label pointed at the **museum** door (s1_20, s1_23: "The Empty Throne · 11 m").
   - Clicking that door just put me back inside the museum (s1_21). The real target is the Manor next door, which has the `!` (map s1_22).
   - Also, the label says "The Empty Throne" there instead of "Lord Ashcombe".
3. **Space and extra clicks after the last line re-trigger an interaction.**
   - Space while ending the herald's dialogue opened the campfire **Kitchen** window (s1_d6).
   - Space while ending Elias's dialogue opened the **Museum** window.
   - Extra clicks on Ashcombe's "Close" button position walked me into the tree line south of the manor.
   - Fix: swallow input for a moment after a dialogue closes, the way `INPUT_GAP` does after windows.
4. **The keep's main door is very hard to enter.**
   - Standing on the cobbled path right in front of the door, E did nothing and showed no prompt (s1_40). Right-clicking the door did nothing either (s1_41).
   - I had to sidestep to an exact tile before E worked.
   - No "Enter" prompt was shown at any point.
5. **The herald covers the campfire when he parks, and a knight walks through the player.** One knight stood exactly on top of my character (s1_08). The procession's two **wagons never appeared**: I only saw the herald and 4 knights.
6. **The tracker label goes under the top-right menu dock.**
   - On the farm the label "to Emberhollow Village" was cut to "to Emb" behind the dock several times (s1_12, s1_14, s1_27, s1_28), so I couldn't read where it pointed.
   - At map edges the camera stops following, so the player sits under the dock too.
7. **The tracker's arrow direction is hard to read.**
   - It is a cursor-like chevron, and I misread it several times (I went the wrong way in the village: 27 m → 33 m).
   - In the great hall it is drawn over the "GREAT HALL" room title (s1_45). In the throne room it covers the "THRONE ROOM" title (s1_46).
8. **Exit labels make no sense indoors.** Inside the museum the arrow said "to Emberhollow Village", but I was already in the village (s1_19). It should say "Exit" or "Outside".
9. **Leaving the museum puts you in the trees.** I came out of the museum door into the tree line south of the buildings, with my character drawn see-through among the trees (s1_20, s1_23).
10. **Map label direction:** the farm map labels the castle exit "↑ Briarholt Castle", but it is on the **south** edge (s1_33). The castle exit is also below the visible part of the farm map, so you have to scroll the map to see it at all.
11. **Journal title mismatch:** the chapter is "A Rider from Kingsholt", while the brief and the towns say Kingsbridge. If Kingsholt is the capital, that's fine, but nothing says so.
12. The getting-started checklist ("Buy seeds… Sleep in your tent") and the village request show in Kingdom test too. Elias shows 0 hearts even though the whole Hollow Crown is supposedly done. Both are minor.

## Confusing
- The herald's dialogue ends with "send word… quietly", yet the next step is "Tell Elias at the museum about the herald". **The herald never mentions Elias**, so the link only lives in the journal.
- The `!` over the workbench on the farm (s1_07) appeared as soon as I tracked the quest, before the herald had arrived. It looked like the workbench was the target.
- In the keep, the map has **no room names** (s1_47). "Try the kitchen" means I have to guess which grey box is the kitchen. Room titles only appear when you walk in.
- The farm-to-castle route isn't obvious until Ashcombe explains it. I had to open the map and scroll it to find the gap.

## Castle & royal feel
- **Outside: good.**
  - Crenellated curtain wall, round towers with slate cones and purple pennants, a gatehouse arch, a big keep front with purple stag banners, a well, stone benches, lamp posts, flower beds.
  - Behind the walls: glasshouses with fruit trees, a weapon rack and training dummies.
  - It reads as a castle (s1_37, s1_39).
- **But the grounds are empty.** The courtyard is a big grass field with a cross of cobbles and four lamps (s1_38). No guards at the gate, no servants, no gardener, no horses.
- **Inside: big, but bare and lifeless.**
  - Entrance hall: suits of armour, golden candelabra, a purple runner and pillars. It's decent, but most of it is large flat dirt-stone floor (s1_44).
  - Great hall: long tables laid with food and benches, which is nice, but there is **not one person** eating or serving (s1_45).
  - Throne room: a single throne at the top of a long runner in a huge empty room, with a couple of armour stands (s1_46). "Empty Throne" fits, but the room itself feels unfinished.
  - Kitchen: a great hearth, a few stoves, barrels, tables and stools. No cook, no hanging herbs, no pots on the tables (s1_50, s1_51).
- **Overall: royal shell, no life.**
  - The story says someone is secretly living there (smoke from the chimneys), but the kitchen gives no sign of it: no lit candles, no half-eaten bread, no footprints. That was a missed chance for environmental storytelling.
  - The floor texture is the same mottled dirt-stone in almost every room. Flagstones, rugs and wooden floors per room would help a lot.

## Story & dialogue
- **The writing is good and tight.** Examples:
  - Herald: "You are the farmer who walked out of the mine with the Hollow King's crown in pieces? Good."
  - Herald: "Some people want her found for the wrong reasons."
  - Elias: "That seal in the corner is the stag and crown of King Oswin's house. Margit wasn't just a farmer. She was the king's younger daughter."
  - Ashcombe: "my gamekeeper swears he saw smoke from the castle chimneys last week."
- A good hook: the missing Princess Isolde, Grandma Margit as royalty, and a mystery in the castle next door. It is paced well and each conversation is short.
- Each speaker's portrait in the dialogue box and the "The Empty Throne" header work well.
- Wishes:
  - Let the herald point you at someone ("Your curator may know more").
  - Give the player a reply choice or two. The first chapters are all click-Continue.

## Quality-of-life wishes
- The tracker should point at the actual door of the actual NPC, and its label should name the person ("Lord Ashcombe · 11 m").
- Keep the tracker label clear of the HUD dock and of room titles.
- Use a clearer arrow (a solid triangle or an arrow with a shaft).
- Room names on the keep map.
- An "E Enter" prompt on the keep door, and a wider door hitbox.
- A short input lock after dialogue closes.
- The world map should show the castle exit without scrolling.

## Balance
I didn't reach combat or rewards, so I have nothing to judge. Kingdom test starts with 23,000g, 300 HP, full iron-looking armour and combat 30+ ("Seasoned fighter" was completed on load).

## Looks (art/UI)
- The procession knights (purple tabards, red-plumed captain) and the herald in a purple hat look good. The knights walk in a nice column (s1_07).
- The castle exterior art is the highlight. The glasshouses look good too.
- Interiors: the furniture art is nice (tables with food, candelabra, hearth, armour stands), but the rooms are huge with large empty floors.
- The dialogue box is clean and readable.
- The village museum and the manor look nearly identical from the front. Only the sign and the pillared porch differ, which feeds the tracker confusion.

## What I liked
- The procession arriving on the farm actually happens on screen. It's a great opening.
- The lore reveal (Margit as princess) ties the farm to the kingdom nicely.
- The walk from the farm through the brambles to a big walled castle with towers and banners really felt like a discovery.
- No JS errors at all.

## Top 5 fixes
1. **Fix the kitchen softlock**: make the "Smoke over Briarholt" kitchen target show up and be interactable (an Isolde / story object near the hearth). Make sure story objects aren't placed on solid hearth or stove tiles.
2. **Fix the Ashcombe tracker target**: point at the manor door, not the museum, and label it with the NPC's name.
3. **Lock input briefly after dialogue closes**, so Space, E or clicks don't open the campfire, museum or other windows, or walk you off.
4. **Bring the castle to life**: a guard at the gate and in the halls, a servant or two, signs of someone living there before Isolde is found, and different floor materials per room.
5. **Make the keep door easy to enter** (prompt plus a wider hitbox). Keep the tracker label off the dock and room titles, and use a clearer arrow.

`errors` output: `none`
