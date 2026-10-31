# Playtest round 4: story player (The Empty Throne, Kingdom test)

Screenshots: `C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/playtest/r4s1_*.png`

## Summary: how far
I did **not** get past chapter 3. I finished chapters 1 and 2 (herald, Elias, Ashcombe's key, warm stove, Isolde: "Chapter complete: Smoke over Briarholt (+1,500g)") and paid Ashcombe the 30,000g for the deed. The last step of chapter 3, telling Isolde, is still open: J shows `3/13 The Empty Throne: A Castle for a Princess`.

Most of my ~130 commands went to walking. The trip village → farm → castle → keep → throne room takes about 15 commands, and I made it twice. The money was 500g short, so I had a third detour to sell bread in the village. On the second trip I reached the keep's door at 1:50 am and collapsed at 2 am before I could get inside. I was carried back to the **farm tent**, even though I now own the castle and its bedchamber.

Time spent per step:
- Herald: about 1 minute.
- Elias: about 6 commands.
- Ashcombe: 3 commands.
- Finding the gate into Briarholt: about 8 commands.
- Finding the kitchen inside the keep: about 6 commands.
- Finding the treasury: about 8 commands, after first going up the wrong staircase.

`errors`: **none** (no JS errors all session).

## Bugs
1. **The tracker arrow often points the wrong way.**
   - Castle grounds after entering from the farm: "to Briarholt Keep" points straight up, but the keep is north-east behind a wall and the only way in is the south gate (r4s1_26, r4s1_28).
   - At the keep's front door: the arrow points down-right, away from the door, which is to the left (r4s1_32).
   - In the great hall: "Princess Isolde · 25 m" points down-right while she is north (r4s1_35, r4s1_39).
   - Courtyard after leaving the keep: "to Emberhollow Village" points up at the keep (r4s1_60, r4s1_61).
   - Village south-west at night: "to Briarholt Keep" points down-right while the farm exit is west (r4s1_82).
   - It looks like the arrow aims at the straight-line target or exit tile, not along the path.
2. **The tracker label in the keep names the story, not the target.** It reads "The Empty Throne · 33 m" (r4s1_33). Elsewhere it gives the target's name ("Elias · 18 m", "Princess Isolde · 29 m").
3. **No home at the castle you just bought.** Collapsing at 2 am in the courtyard sends you to the farm tent: "You stayed up past 2 am and collapsed… Someone carried you home and took 9g" (r4s1_84). You also start the next day at 150/300 HP and 60/120 energy. The bedchamber in `castle_up` should count as home once you own the castle.
4. **Your last click on a dialogue goes through to the world.**
   - Clicking Continue/Close at the end of Ashcombe's dialogue also made the player walk off (r4s1_81c).
   - One Space too many after Ashcombe's key scene reopened the Ashcombe Manor land-deeds window (r4s1_19e).
   - After Elias's last line, the museum menu opened on its own (r4s1_15d).
   - `INPUT_GAP` doesn't seem to cover the story dialogue closing.
5. **Pressing Space quickly skips the herald.** The first dialogue was gone after 8 Space presses and I never read it. That's partly my fault, but there's no log or recap of what the herald said.
6. **The player is drawn over furniture.**
   - The player stands on top of the kitchen stove while searching it (r4s1_38).
   - On the throne-room dais the player is drawn in front of the throne (r4s1_42).
   - In the kitchen, cellar and entrance hall the player can walk up onto the bottom row of the back wall's face (r4s1_39, r4s1_46, r4s1_57).
7. **Ashcombe's lines come in the wrong order.** After you press "Pay 30,000g" he still says "Thirty thousand, and Briarholt is yours" as if he were still selling (r4s1_80). That pitch line belongs before the Pay choice.
8. **The chapter title and the town name don't match.** The chapter is "A Rider from Kingsholt", but the city in the realm is Kingsbridge. If this is a different place, nothing explains it.
9. **The player walks with no key held.** Isolde's dialogue runs while the game is paused, but the player sprite is frozen mid-stride (r4s1_43e).
10. **Small issues:**
    - A hotbar tooltip stays on screen after the mouse leaves ("POTATO SEEDS…", r4s1_58).
    - "LMB Till" shows on the castle courtyard cobbles (r4s1_83).
    - The treasury's two chests are a bank/storage window, not loot. That's fine, but nothing says so.

## Confusing
- **The keep's map (M) is almost useless.** It shows green blocks with no room names and no "You" marker on the ground floor (r4s1_34; "You" does show in the cellars, r4s1_51). The rooms have names (they flash up as you enter: KITCHEN, GREAT HALL, THRONE ROOM, ENTRANCE HALL, WINE CELLAR), so the map could label them.
- **The castle grounds map doesn't show the curtain wall or the gate** (r4s1_27). From the farm road you can't tell you have to walk all the way south and round to the gate.
- **The two staircases look alike.** There is one up and one down on opposite sides of the entrance hall. I took the wrong one first and ended up in `castle_up`. "E Upstairs" / "E Cellar" prompts or labels would help.
- **Paying for the deed:**
  - The only place to sell at night is the tavern.
  - Mara's store and the other shops were closed; Ashcombe still sold me the deed at 11:20 pm.
  - Country Bread sells for 100g, then the price drops with each sale (6 sold = 591g).
- **Elias and Ashcombe move around.** At 8:00 Elias went into the museum and vanished from the street, which was confusing for a moment. Inside the museum the tracker arrow disappears.

## Castle & court
- **Before buying,** the grounds have a hooded or robed figure and a gardener in a straw hat wandering the courtyard (r4s1_31, r4s1_60). They walked away when I right-clicked and had nothing to say.
- **After buying (at night),** two armoured guards with swords flank the keep door and the robed figure stands in the courtyard (r4s1_83). This is a good visual first step and makes the gate feel guarded.
- **I never got back inside after buying,** so I couldn't judge the servants, cook or scribe indoors.
- **The keep before buying feels empty but well dressed:**
  - long banquet tables with food;
  - armour stands;
  - a hearth;
  - wine racks;
  - a treasury with gold piles;
  - a throne room with a tapestry.

  The room-name banners are a nice touch.
- **The tavern at 10 pm was completely empty except Pip.** A village tavern at night with no customers stood out next to the castle's new court.

## Story & dialogue (highlights)
- Elias: "That seal in the corner is the stag and crown of King Oswin's house. Margit wasn't just a farmer. She was the king's younger daughter." A strong reveal.
- Ashcombe: "So the curator finally worked it out. Yes. I've kept Briarholt's keys for forty years. Margit made me promise."
- The stove: "The kitchen stove is still warm. A pot of stew, a single bowl, and beside it a silver hairpin with a stag on it." Then: "Someone is living here, and they left in a hurry when they heard you at the gate." Good environmental storytelling.
- Isolde: "Stop right there! …Oh. You're not one of Morcant's hunters. Hunters don't knock things over in kitchens." / "She taught me my letters. Every summer, here at Briarholt…" / choice: "I'll keep your secret." vs "The council is looking for you." / "Thank you. Truly. Margit would have said yes too, and then made me weed her beans." Charming.
- Ashcombe after the sale: "The princess? At Briarholt? …I didn't hear that. My hearing is terrible these days." / "Look after her. I mean the castle. Obviously." The best line of the session.

## QoL wishes
- A waystone at Briarholt (or at the farm's south-east gap) and in the keep's entrance hall. The farm ↔ village ↔ castle back-and-forth is most of this chapter.
- Make the tracker follow the path (point at the next door or gate), and give it the target's name inside the keep.
- Show room names and "You" on the keep's map; show the curtain wall and gate on the castle map.
- A dialogue log, or "Recent conversations", in the journal.
- Once you own the castle, let the bedchamber be home for sleep, collapse and waking.
- When the deed step starts, say where you can raise money at night (or let Isolde or Ashcombe accept items).
- Label the staircases.

## Balance
- **Kingdom test money:** you start with 23,000g, get 1,500 from chapter 2 and 5,000 from the treasury, which comes to 29,500g, so you are exactly 500 short of the 30,000g deed. It feels deliberate ("sell something"). On an unlucky night every shop is shut and you have to know the tavern buys bread. Either give 30,000+ or put a sellable heirloom in the treasury.
- After paying you have 91g, so there's no budget left for chapter 4.
- **Collapse penalty:** half HP and energy plus 9g.

## Looks
- The castle is the highlight:
  - crenellated curtain wall, towers and a gate arch;
  - a keep facade with banners;
  - glasshouses, a fountain courtyard, a training yard with dummies, archery targets and pavilions (r4s1_26, r4s1_30, r4s1_32, r4s1_62).
- Interiors read clearly: checkered marble, purple runners, gold candelabra, the kitchen hearth, wine racks (r4s1_36, r4s1_37, r4s1_42, r4s1_53).
- **The night grade is very blue and dark** at 9 pm to midnight (r4s1_65, r4s1_69). Lit windows look nice; the people are hard to read.
- Isolde's portrait and sprite (red hair, crown, purple gown) match well.

## Liked
- Chapters 1-3 are short, well paced and well written. The stove → hairpin → princess sequence and Ashcombe's "I didn't hear that" land well.
- Story steps speak first at the museum and manor doors; the ! markers over doors are easy to read.
- The tracker label with distance ("Elias · 7 m") helps whenever it points the right way.
- No JS errors.

## Top 5 fixes
1. Make the tracker arrow follow the path or the next exit (castle grounds, keep door, great hall, village) and name the real target inside the keep.
2. A waystone at Briarholt or the keep. Too much walking between farm, village and castle.
3. The owned castle's bedchamber should count as home (no collapse to the farm tent).
4. Show room names and "You" on the keep map; show the wall and gate on the castle map; label the two staircases.
5. Stop the last click on a dialogue going through to the world (walking, reopening the manor or museum menu), and move Ashcombe's "Thirty thousand… is yours" before the Pay choice.

## errors output
```
none
```
