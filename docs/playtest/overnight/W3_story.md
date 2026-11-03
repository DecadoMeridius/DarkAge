# W3 — Story playtest, second pass (Kingdom test, Painterly)

Tester role: story tester. Kingdom test (developer mode), Painterly style, FPS counter on, port 9302.

**What I played**
- **The Empty Throne**, chapters 1-10 in about 9 in-game days:
  - herald → Elias → Ashcombe → keep → Isolde → deed → Vey;
  - patrols (6 assisted kills) → hunters' camp + 8 bandits → Rudd;
  - Finn → Mags → Harrow;
  - Osric → Halvard → 12 highland kills → horn → Vey;
  - **the siege of Briarholt** (lost the first try, won the second) → Isolde;
  - council → Isolde;
  - Vey → Warlord → chapel vigil → oath.
  - I stopped at chapter 11, "Defeat the Cinder Drake". The Emberwaste is closed and I didn't fight the Ash Colossus.
- **Side stories:**
  - The Lost Lanterns: chapter 1 done; chapter 2 is **stuck** (see Broken 1).
  - The Salt Smugglers: chapters 1-2 done; chapter 3 (kill 6 Drowned) not played.
  - The Ashcombe Signet: chapter 1 done; chapter 2 reached "Defeat Highmarch Raiders".
  - The Ember Pilgrims: chapter 1 done; chapter 2 ("10 ember shards") not played.

**Shortcuts I used (all from the console):**
- **Travel:**
  - `goMap` or setting `S.p.x/y` to jump to the current story target (`trackTarget()`) or near it;
  - `walkTo` for the last stretch.
  I still pressed E / right-clicked and read every line myself.
- **Fighting:** a small helper made real mouse clicks on the nearest enemy, walking up to it first. In patrol mode it waited until a knight had hit the enemy.
- **Time:**
  - `endDay()` to reach days 3, 4, 5, 6 and 9 (you wake where you stood, not at home);
  - `S.time` set to 20:05 at the wreck and 21:00 in the chapel.
- **Items:**
  - moved loot from my full backpack to the bank;
  - gave myself 30 hardwood and a rabbit's foot for the Shrine of Leaves.
- **No story state was set directly.** Once, early on, I overwrote the game's global `TP` (townsfolk palette) by accident and restored it straight away.

Console errors: none from the game. The harness log shows 5 × "Failed to load resource: 404"; I didn't check which file.

## Broken

1. **The Lost Lanterns can't be finished (stuck state).**
   - Chapter 1's last step, "Bring the three lanterns to Pip", takes all 3 Old Brass Lanterns (`takeAll` in `storyTalk`).
   - Chapter 2's first step, "Bring Hale the lanterns, 3 copper bars and 2 amber sap", needs `old_lantern: 3` again. There is no other source of `old_lantern`.
   - Hale says "(Still needed: 3 Old Brass Lantern, 3 Copper Bar, 2 Amber Sap.)" while the player has just handed them to Pip.
   - Fix: Pip's step shouldn't take them (e.g. a `keep` flag), or Hale's step shouldn't need them.
2. **Story items land on the ground when the backpack is full, and the step still advances.**
   - The three lanterns each gave "Your backpack is full" and dropped at the ruins, the Whisperwood and Corwin's hut, while the journal moved on to "Bring the three lanterns to Pip".
   - The toast is easy to miss, and a player with no lanterns doesn't know to walk back to three far-apart places.
   - My bag filled up with ordinary loot (ore, arrows, goo) during the story fights, so this will happen in real games.
   - Fix: story `give` items should bypass the 28-slot limit or go to the bank, with a toast.
3. **The Empty Throne chapter 10: the Warlord step is blocked for a week after the siege.**
   - The siege's last wave includes the Bandit Warlord. Killing him there sets `S.bosses.warlord` and `S.bossDay.warlord`, so the arena Warlord doesn't respawn for 7 days.
   - Chapter 10 then asks you to "Defeat the Bandit Warlord at his camp", which counts only a new kill.
   - The camp is empty and nothing says when he returns (he was back on day 9).
   - Fix: count the siege kill, spawn a story Warlord, or have the siege's last wave use a lieutenant.
   - The story also contradicts itself: Vey sends you to kill the Warlord you just killed at Briarholt.
4. **The chapel vigil before dark shows the smugglers' message.** At Briarholt's chapel altar in daylight, E gives "Nothing here by daylight. Corwin said the lights come after dark." (W3_story_48). It should say something like "Come back after dark to keep the vigil."
5. **The Empty Throne chapter 11 can stall without explanation.**
   - "Defeat the Cinder Drake in the Emberwaste" appears while the Emberwaste is closed (`regionOpen('emberwaste')` is false).
   - Neither the hint nor Halvard says the Ash Colossus guards the way. The Ashcombe story does this well ("the Hollow Crown leads there"); do the same here.
6. **The tracker sends you the wrong way in three places:**
   - **The Saltreach:** after Corwin opens it, the arrow "to The Saltreach" points into Corwin's fisher hut (it enters `in_fisher`). The ferry is at the dock, about 66 tiles east (W3_story_33, W3_story_34).
   - **The dock:** on the beach by the dock the arrow pointed up-left, away from the ferry, with no label (W3_story_35).
   - **Highmarch:** with a Wilds target, the arrow pointed north-east and kept the same angle as I walked south, although the only exit is due south (`exitToward` gives 90,139) (W3_story_41, W3_story_42).
7. **Kill and boss steps never track anything.** `trackTarget()` returns null for the patrol, highland, Warlord, Drowned and Raider steps. No arrow, no map hint, and the Warlord camp isn't named anywhere. Pointing at the arena, the biome or the nearest patrol would help.
8. **The ferry doesn't respond to E.**
   - Standing at the end of Corwin's dock and facing it, `findInteract()` is null and E does nothing.
   - Right-clicking the boat sprite works. The sprite seems to sit about a tile off its `ferry` object, as with the Warrens hole in W2 (W3_story_36).
9. **The recap shows finished counters as zero and leaves out lines.**
   - Done kill steps are listed with zero counts: "✓ Fight beside a knight patrol … (0/6 monsters felled together)", "(0/8)", "(0/12)".
   - Choice replies are missing:
     - Isolde's "Thank you. Truly…";
     - Osric's "Then Kingsbridge stands with Margit's heir";
     - Ashcombe's "Thirty thousand for Briarholt… Shall we settle it?" offer.
   - Without the offer, the recap jumps straight to "The princess? At Briarholt?".
10. **Story NPCs stand on top of the player or hide under trees.**
    - Quill and Isolde stand on the player again (W3_story_7, W3_story_37).
    - Sister Wren is placed under a tree canopy, so you see only a faint shape (W3_story_43).
    - Townsfolk in Saltmere stand in Finn's doorway, so E talked to a fisher instead.
11. **The auto tool picks the axe in towns.** In Saltmere the hotbar switched to the axe by itself and the hint read "LMB Chop" while I pointed at a door and at Captain Harrow (W3_story_15, W3_story_17).
12. **Enter still doesn't press "Start the day"** on the morning report (confirmed from W2).

## Story and dialogue consistency (not typos; none found)

- **Ashcombe re-introduces himself.** On day 5, after giving you Briarholt's key and selling you the castle, he says "So you are the one farming old Margit's land. Good." The side story assumes it's your first meeting. It needs a variant line once The Empty Throne has begun.
- **Ashcombe answers something you didn't say.** After "Pay 30,000g" he says "The princess? At Briarholt? ...I didn't hear that". You just promised Isolde to keep her secret and said nothing about her.
- **The bloodline doesn't add up.**
  - Elias: Margit was "the king's younger daughter".
  - Osric: you are "the old king's granddaughter's child".
  - By Elias's line you are the king's great-grandchild (his daughter's grandchild). Osric's line makes Margit the granddaughter. One of them is wrong.
- **Counts that don't match:**
  - Vey sends "Four of my best knights" and Isolde counts "Four of them"; the siege has **6** knights.
  - Vey says they ride "tonight", but they're already in the courtyard minutes later.
- **The Greyhelm War Horn is never used.** Halvard says "Blow it at Briarholt and we'll come". The horn is only a bag item, and nothing happens with it during the siege.
- **Wrong ballista recipe in the dialogue.**
  - Isolde says ballistae are "wood, iron and rope"; the recipe is 30 wood, 4 iron bars and 10 fibre at Construction 10.
  - In the Kingdom test you have Construction 1 and no materials, so the "Ballistae and barricades help" hint can't be followed there.
- **Scenes that don't match their text:**
  - **Hunters' camp:** "A cold fire, red tents and the stag of Morcant painted on a shield". On screen there is one ordinary orange tent half under a tree: no fire, no shield, nothing red (W3_story_13).
  - **Burned lodge:** "Charred beams and a fallen chimney, half swallowed by brambles" is a single small ruin-wall post by a pond (W3_story_39).
  - **Kitchen clue:** the stove story object stands in the middle of the kitchen floor. It's hidden behind the player and isn't a stove (W3_story_6).
  - **Wreck:** "wet sand… tucked into the hull" is an intact rowing boat on dry dirt with no water in sight (W3_story_32).
  - **Third lantern:** it is "half buried in the sand by the dock", but it sits by Corwin's hut, far from any dock.
  - **Shrine of Leaves:** Wren says it "has gone cold", but its flame is already lit (W3_story_43).
- **Mags and Harrow:**
  - Mags says Harrow walks the pier "every evening. Bring your sword", and the step is "Confront Captain Harrow". He's there at 9:40 am and simply hands over the letter.
  - That's fine as a twist, but then drop "Bring your sword", or make it a real confrontation.
- **Isolde after the siege:** "running across your turnips". There are no turnips at Briarholt or on a new farm.
- **Isolde after the council** doesn't react to the bloodline reveal at all. You were just named Margit's heir, and she goes straight to the oath.
- **Back-to-back chapters:** chapter 3 ends with Isolde in the throne room, and chapter 4 starts at once with "Nell from Kingsbridge brought bread this morning, and news…". The two chapters run seconds apart. Gate chapter 4 to the next morning, or reword it.
- **The vigil:** "At dawn a cold voice…", but the clock stays at 21:00. Also, the prompt on the altar says "Search"; "Keep vigil" or "Kneel" would fit.
- **Tracker labels:** "Captain Vey · 27 m" works well. Two "!" markers stack over a story villager on the street: the white speech bubble and the yellow tracker box (Hale, W3_story_29).

## Quality of life

- **The side stories really do start on days 3/4/5/6**, each with a morning-report line ("New story: …"). That works well.
  - "A New Start — Not begun yet" is still listed in the Kingdom test (as in W2).
- **The patrol step is slow and fiddly with good gear.**
  - It counts a kill only if a knight hit the monster in the last 12 s (`allyHit`). With an iron sword you kill slimes before the knights reach them, so 0/6 for a long time.
  - Near Kingsbridge the patrols only meet level 0-1 slimes (the gentle ring).
  - The town job "Ride with a patrol" counts monsters near allies; the story step doesn't. Use the same rule for both.
  - It took me about 5 minutes of following patrols with the helper holding back.
- **"Clear 12 monsters from the highlands"** around Greyhelm got 1 kill in 100 s, because there are no spawns within 18 tiles of a town. 40 tiles out it took about 1 minute. Say "in the highlands north/east of Greyhelm", or track the nearest spawn area.
- **Fishmonger at 8:20:** the door gave no prompt and E did nothing, twice, although `HOURS` says 8:00. It worked at 9:00, probably once Finn had walked in. In this case the story should speak at the door, as Rudd's did at 6:40.
- **The chapel vigil needs a time skip.** There's no way to wait for night (no sleeping before dark), so a player has to burn the day.
- **The shrine window stays open after "Make the offering"**, and the story step only advances once you close it. That's fine, but closing it automatically would make it clear something happened.
- **Kill steps in the journal** could say where to go:
  - "Defeat the Drowned on the isles (0/6)" and "Defeat Highmarch Raiders (0/10)" give no place or arrow;
  - the Warlord step gives no camp location.

## Balance

- **Siege at combat 30 in iron gear, with no ballistae** (they can't be built in the Kingdom test):
  - First try: I lost all 3 lives against wave 4 (the Warlord plus 4 bandits and 2 archers) and was carried out ("They'll come again").
  - Second try: won, ending on 163 HP.
  - That's a fair difficulty, but the Kingdom test should give the materials and Construction 10 so testers can try ballistae.
- **Story gold is generous:** from 3,000g after the deed to 53,000g by day 9 (chapter rewards of 1,500-6,000 plus loot). In the Kingdom test that's fine.
- **The Warlord in his camp (chapter 10)** went down in about 100 s at combat about 32, leaving me on 99/385 HP.

## Art & feel (Painterly)

- **Still seen from W2:**
  - magenta grout on the keep steps and pink halos round the banner poles (W3_story_18, W3_story_19);
  - the 3D isometric throne dais;
  - the diagonal purple carpet (W3_story_7);
  - a mirrored wall band above indoor rooms (barracks, W3_story_10; fisher hut, W3_story_34).
- **Kingsbridge barracks:** an orange/magenta smear at the door's foot and a black triangular wedge at the left wall base (W3_story_9).
- **Saltmere pier:** the lamp posts stand in the water above the pier, not on it (W3_story_17).
- **Corwin's dock:** the dock and ferry boat look fine. The ferry boat reads as the end of the pier, so it's hard to tell it's usable.
- **The keep kitchen's great hearth** is a black box with a small fire (W3_story_6).
- **The chapel altar** is a lit fireplace with candles. It's OK, but it reads as a hearth, not an altar (W3_story_48).
- **Looked good:**
  - Saltmere's houses and stalls by day;
  - lit windows at night (Corwin's hut, Port Saltreach, W3_story_33 and W3_story_37);
  - Highmarch's square;
  - the forest shrine glade with sun dapple (W3_story_43);
  - the Greyhelm and Kingsbridge streets;
  - the bandit camp's tents and campfire (W3_story_30).
- **The courtyard during the siege** still has the steward, gardener, porter, laundress and groom walking round (W3_story_19), although CLAUDE.md says the court stays indoors during a siege.

## Performance

- Mostly 127-131 fps at 1-2 ms of work per frame, everywhere: Kingsbridge, Saltmere, Port Saltreach, Highmarch, the Wilds, the keep and the courtyard at night.
- Dips:
  - 72 fps entering the keep kitchen (W3_story_6);
  - 73 fps at 14.2 ms work arriving at Corwin's dock after a teleport (W3_story_35);
  - 105-109 fps while the coast / Saltreach chunks painted (W3_story_28, W3_story_33).
- All the dips were right after a map change or a long jump, so they're probably chunk painting.

## Liked

- **The Empty Throne is a real adventure.**
  - It moves through all four towns, each with its own voice: Halvard's "Two snakes in one boot", "Terrible voices, all of them"; Harrow's "I was told you'd be shorter"; Vey's "never hit a horse".
  - The siege is a proper climax: knights hold the courtyard, waves come through the gate, and there's a "Briarholt holds!" banner.
- **Clear feedback in the right places:**
  - "Nothing here by daylight…" at the wreck;
  - the Shrine of Leaves window that lists what you have;
  - "Still needed: …" from Hale.
- **Morning-report story announcements, and the journal**, with its "x/y" chapter counter, Read buttons, Tracking, and "Now:" at the end of the recap.
- **The tracker** generally led well across maps: "to The Wilds", "to The Saltreach", and name and distance labels.
- **No typos** in roughly 120 lines read.

## Top 5 fixes

1. **Fix the Lost Lanterns stuck state.** Pip takes the 3 lanterns, then Hale needs them again and there's no other source. Also stop story `give` items from dropping on the ground when the bag is full.
2. **Make chapter 10's Warlord reachable after the siege.**
   - Count the siege kill or spawn a story Warlord; today the weekly boss timer blocks the step for 7 days with no message.
   - Gate chapter 11 visibly too: say that the Emberwaste opens after the Ash Colossus.
3. **Point the tracker at the right exits and at kill and boss steps:**
   - the Saltreach ferry at the dock, not the fisher hut;
   - the Highmarch exit;
   - the Warlord arena, the highlands, the nearest patrol, the Drowned isles.
   - Also make the ferry respond to E.
4. **Fix the dialogue consistency:**
   - Ashcombe's side-story introduction after he has sold you Briarholt;
   - his reaction to a princess you never mentioned;
   - Osric's "granddaughter's child" against Elias's "younger daughter";
   - four knights in the dialogue against six in the siege;
   - the horn that's never blown;
   - the vigil daylight message that mentions Corwin.
5. **Make the story scenes match their text** (hunters' camp, burned lodge, wreck, kitchen stove, cold shrine). Fix the recap to show finished counters and the player's choice replies. Keep story NPCs off the player and out from under tree canopies.
