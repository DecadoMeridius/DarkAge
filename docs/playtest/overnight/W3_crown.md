# W3 crown — The Hollow Crown and the side stories, from a new game (Painterly)

Tester role: story tester. New game ("Tess"), tutorial skipped, Painterly, FPS counter on, port 9302.

## Shortcuts used (running log)
- `endDay()` from the console to reach day 2.
- Travel: `goMap` + placing `S.p` near the track target, then `walkTo` (helpers h9302_go / h9302_tp); mine floors by `S.mineFloor`, dungeon floors by `S.dgFloor`. Every E / right click and every dialogue line was done by hand.
- Combat (noted where used): Melee/Defence/Constitution raised to 35, 45, 60, 75, then 90; steel, cobalt and cindersteel sets given and equipped; bread given (40-100 per fight); loot moved from the bag to the bank. Fights used a click-at-the-enemy helper that never dodges (it eats bread under 40% HP).
- Items to get past bugs or grind: a replacement locket and Warden Heart (after the item loss), 30 hardwood and a rabbit's foot, 4 ember shards picked up by teleporting next to them.
- Time: `S.time` set for the wreck (20:05), the cache (10:00), the Drowned (21:00), the manor (10:00) and Wren (9:00). Tracking set with `S.story.track` (same as the Track button).
- Bug workaround: moved the Cinder Drake out of the cliff back to its home tile.
- No story state was set directly.

## Play log

### Opening (day 1-2)
- Ashcombe walks up and introduces himself on day 1 ("I own most of the land… I sold your grandmother this meadow"). Skipping gives one line of tips. Works.
- Day 2 morning report: "New story: The Hollow Crown. Elias at the museum wants a word. (Quests, J)". Good.
- Journal: "1/6 The Hollow Crown: Grandmother's Pages — Talk to Elias at the museum. (in Emberhollow Village)" with Read and Track (W3_crown_3).
- After clicking Track, on the farm an orange arrow sat beside the tent, pointing right, with no label (W3_crown_4). Not over my head as CLAUDE.md describes.
- At 6:30 the tracker led to a spot behind the museum (the north side), where Elias was standing on the street, not at the museum (W3_crown_5). Two "!" boxes stacked over him again (white bubble + yellow tracker box).
- Pages: the tracker pointed at the nearest page each time. Page 1 lay under a dense canopy, invisible: you only know from the "E Read" prompt (W3_crown_6).
- **Standing on a page, E picked a flower instead** ("Pick" on the faced tile); I had to right click the page's tile under my feet.
- After the 3rd page, the step advanced silently: no toast saying "Bring what you've read back to Elias". Gold went 500 → 1100 (the old "Lost pages" quest's 600g) with no visible toast that I caught.
- Elias at 8:20 had gone into the museum. The tracker stayed on the museum door (village 40,33) after I went inside: no marker over Elias in `in_museum` (W3_crown_8). Pressing E at the door just walked me in; the story didn't speak at the door.
- Elias's 2nd talk, chapter 1 complete (+800g). Toast "Chapter complete: Grandmother's Pages (+800g) || New chapter: The Squire's Grave".

### Chapter 2: The Squire's Grave (day 2)
- The cairn: the tracker led straight to it at the Wilds ruins. On screen it is a **gravestone with a cross**, not "a cairn of mossy stones" (W3_crown_9). A lost page lay on the next tile, so my first E read the page instead of the grave.
- **Stone Warden at combat level 1 with the starting wooden sword** (shortcut: `S.mineFloor = 10; goMap('mine')` instead of walking down 10 floors). My auto-clicker never dodges. I used all 3 lives (each refills to full HP on the spot) and won in about 75 s, ending on 30 HP with 0 lives. **Balance:** with lives, a level-1 character can beat the first story boss by trading hits; lives effectively give 4x health.
- The tracker had no target for the boss step (no `at`), so no arrow and no hint where floor 10 is beyond the journal text.
- **BROKEN (critical): Brann's bring step ate the locket and the Warden Heart without advancing.**
  - E at the smithy door walked me inside (the story didn't speak at the door; the tracker stayed on the street door while I was inside).
  - Inside I right-clicked Brann from 2 tiles away. No dialogue appeared, but afterwards **both the locket and the Warden Heart were gone** from the backpack (their slots were empty), the step was still "Bring Tomas's locket and a Warden Heart to Brann", and E on Brann said "(Still needed: 1 Tomas's Locket, 1 Warden Heart.)".
  - Neither item has another source on a story path (the locket comes only from the cairn), so a real player would be **stuck for good**.
  - Likely cause: `storyTalk` calls `takeAll(st.items)` *before* the dialogue, and `storyDialog` opens with `if (DIALOG) DIALOG.close(true)`, which closes the previous dialogue *without* running its `done`. Any second trigger (a walk-to-act click that fires twice, a second wrapper calling `storyTalk`) closes the first dialogue quietly: items gone, step not run. Fix: take the items in the `done`/`finish` callback (or put them back when a dialogue is closed quietly), and make `close(true)` of a story step dialogue never lose its step.
  - Recovery (shortcut, noted): I gave myself one locket and one Warden Heart from the console. The second right click worked: Brann's lines, "The way to The Highmarch is open", chapter complete (+1,500g).
  - The stale "Still needed" dialogue stayed on screen until the next talk replaced it.
- Interiors: the museum and the smithy both show the mirrored second wall band above the room (W3_crown_8, W3_crown_12).

### Chapter 3: The Sunken Forge (days 2-4)
- Highmarch opened. Marta stood in Highmarch Hold's square with a "!" over her (W3_crown_14); her lines read well. She says "A lowlander carrying Aldren's key", but **no key item is ever given**: Brann's lines talk about the key and the bag never gets one. A "Aldren's Key" quest item would make this land (and it could be what opens the Highmarch gate).
- From the Wilds, the tracker label "to The Highmarch" pointed straight up into Kingsbridge's town wall from just outside it (W3_crown_13). The crossroads sign labels ("Greyhelm ↑ · Ashford ← · Saltmere → · Emberhollow ←") run under the menu dock on the right.
- The dungeon mouth (W3_crown_15): facing it sideways gives no prompt; facing up gives "Descend" and a floor-select window ("Floors you've reached (3 and 5) can be taken straight from here" while only "Floor 1" is listed: the text promises floors you haven't reached; say "Floors 3 and 5 can be taken from here once you've reached them").
- **Balance: The Sunken Forge is far beyond the character the story has produced so far.**
  - Floor 1 enemies are level 30 (skeletons, stone trolls, magma slimes, fire bats).
  - At combat ~3 (just after the Warden) I lost 2 lives in 45 s on floor 1.
  - Shortcut: raised Melee/Defence/Constitution to 35 and gave steel gear: knocked out on floor 1 (no dodging, no eating in my helper).
  - At 45 with steel and bread (helper eats under 40% HP): floor 1 cleared, about 9 bread.
  - Forge King (5,420 HP, summons magma slimes): **lost at 45/steel** (ran out of 20 bread, knocked out). **Won at 60 with cobalt gear and 40 bread** (all 40 eaten), about 100 s.
  - So the main story's chapter 3 asks for roughly combat 50-60 (a human who dodges, maybe 45-50), right after a chapter 2 boss that a level-1 character beats. The jump from the Warden to the Forge King is huge. Either put an easier step between (e.g. Highmarch raiders) or make the journal say so ("The Sunken Forge is dangerous: Melee 40+ recommended").
- **The knockout message is wrong after a fight.** "You were knocked out (around 3 pm). Someone carried you to bed and took 840g for the trouble. **Sleep in your tent before 2 am next time.**" The last sentence is for exhaustion, not for losing a fight.
- Marta's return: "Cold at last…" Chapter complete (+3,000g, 5 cobalt bars). The rewards are fine but small next to the 40 bread and a knockout fee.

### Chapters 4-6: the Wyrm, the Rime Queen, the Lich, Aldren, the Cinder Drake (days 4-6)
- **Ember Wyrm** (floor 20, shortcut `S.mineFloor = 20`): at combat 60 / cobalt it died without me eating a single bread. Chapter 3's Forge King needed 40 bread at the same level. **The difficulty runs backwards** between chapters 3 and 4.
- Elias: works. **Again the museum's donation window opened right after the story dialogue closed** (W3_crown_16). One right click runs both the story and the keeper's menu, which supports the double-trigger theory behind the lost locket.
- Frostmere: Rimehold has **exactly the same plan as Highmarch Hold** (waystone left of the square, striped stall bottom right, signpost bottom left, three houses on top) (W3_crown_14 vs W3_crown_17). Brown dirt splotches around the snowy houses and over the "Glacier" look like mud stains on snow (W3_crown_18).
- Sigrun: lines fine. The arena tracker label read "The Hollow Crown · 16 m"; naming the target ("The Rime Queen · 16 m") would read better.
- **Rime Queen** (8,225 HP) at combat 60 / cobalt: won, 40 bread and 1 life.
- Sigrun afterwards: "**The ice cracked last night.**" I killed the Queen two hours earlier the same afternoon. Use "just now" or gate the line to the next day.
- **Pale Lich** (floor 30): won at 60 / cobalt, all 3 lives and 40 bread.
- Chapter 5 reward opens the Emberwaste. Aldren stood at the target in the Cinder Fields (W3_crown_19):
  - "Search … for **Aldren's last camp**": there is no camp, just Aldren on open ash.
  - Aldren is described as a ghost (pale skin and a glow colour in his palette), but on screen he is a solid grey knight in a horned helm, no glow or transparency.
  - **Bloodline clash with The Empty Throne:** Aldren says Margit is his sister ("my sister's eyes. Her grandchild, then"), and Marta calls him "King Oswin's own knight". The Empty Throne makes Margit the king's daughter, which would make Aldren a prince, not the king's knight. Pick one family tree.
- **Cinder Drake: not beaten.** Tried at 60/cobalt (lost), 75/cindersteel (lost), 90/cindersteel with 100 bread (lost twice).
  - **BROKEN: the drake gets stuck inside a cliff block and heals forever.** After its charge it stood on an `r` cliff tile (137,64) on the raised rock east of its arena (W3_crown_22). It was leashed (`e.leash = 1`): the leash walks it home (2048,1024) through `moveEnt`, which can't move it out of the cliff, so it **never reaches home, never un-leashes and heals 8%/s for ever**, while its fire bolts still reach you. Leaving the map doesn't help (bosses are kept in `cur.ents`).
    - Fix: when a leashing enemy can't move toward home (or is inside a solid tile), teleport it home; don't let charges or knockback end inside solid tiles (`openTileNear`).
    - I moved it back to its home from the console (shortcut) and still lost: in 100 s its health bar never moved below ~11,400 of 11,385+ (it went from 11,385 to 10,000 once in the first try, then back to full when it leashed). With my click-at-the-sprite helper I couldn't land hits reliably; a human may do better, but the leash heal (8%/s, full in ~12 s) undoes any break in contact.
  - Its sprite looks like plain pixel art scaled up (hard square steps on the wings and spines) next to the painted salamanders (W3_crown_22).
- I stopped the main story at chapter 6 step 2 ("Defeat the Cinder Drake in the Emberwaste"); the Hollow King (floor 40) and Aldren's farewell were not reached.
- **Bag full = rewards and bought food land on the ground.** With 28 slots full of boss loot, `give('bread')` (and any story `give`) drops at your feet; on the farm after a knockout that meant 40 bread lay unnoticed by the tent while I fought without food. The toast is easy to miss.

### The Salt Smugglers: played to the end (day 7)
- Shortcuts: tracked it from the console (`S.story.track`, same as the Track button), `S.time` = 20:05 at the wreck, 10:00 for the cache and 21:00 for the Drowned; travel by teleport; combat still 90 / cindersteel from the Drake attempts.
- **Corwin at 6:20:** the tracker box sat on the hut's door while Corwin stood outside to the right with his own "!" bubble (W3_crown_23). E at the door did nothing (shop closed until 8); right-clicking Corwin started the story. The tracker should point at the person when he's outside.
- At night the player stood right on top of Corwin (W3_crown_24); the hut's lit windows are yellow squiggles rather than window shapes.
- **One E press opened the story dialogue twice.** With `storyDialog` wrapped, a single E on Corwin for the ledger step logged two `storyDialog` calls with the same first line. The ledger was taken once and the step advanced once, so this time nothing was lost, but it is the same double call that ate Brann's items (see chapter 2).
- The wreck search, Corwin's ledger, the Saltreach opening and Quill all worked.
- **The cache** is a single small treasure chest on a beach (W3_crown_25), not "crates… with the Captain's sign burned into every lid".
- **Choice balance:** "Hand it over" pays 6,000g; "Keep the cargo" gives 3 pearls and 4 aquamarines (a few hundred gold). The rogue choice should be tempting, not a trap.
- **"Defeat the Drowned on the isles (0/6)" never says "at night".** Drowned spawn only at night (`isles.night` in u_regions.js); by day the isles have crabs, slimes and harpies. A player hunting by day will wait for ever. Add "after dark" to the hint, and the step still has no tracker target.
- Drowned Captain: won at 90 / cindersteel without losing a life.
- Quill's ending and the reward: +5,000g and the **Smuggler's Spyglass**, which is a ring (worn on a finger: "He kept this on his belt"). Call it a signet or make it a trinket.
- **Recap** (`storyRecap`): reads well, but the finished kill step shows "**(undefined/6)**" (W3 found "0/6" in the previous pass; now it's "undefined"), and my choice ("Hand it over", Quill's "Honest. Rare round here…") is missing.

### The Ember Pilgrims: chapters 1-2 done, chapter 3 reached (day 7)
- Wren at the forest shrine (W3_crown_26): the player stands half inside her, and **the shrine's flame is already lit** although she says "This one has gone cold" (also in the previous pass).
- The Shrine of Leaves window lists the offering and what you have. Good.
- **E next to Wren picked a morel instead of talking to her** ("Picked: Morel."). Story people should win over forage when both are in reach.
- Wren's second line, "The ember shards are pieces of the seal that bound **the wyrm**", came after I had already killed the wyrm in The Hollow Crown. The stories can be played in any order, so this needs a variant line.
- **"Find 10 ember shards (5/10)" has no tracker target and no hint where shards come from.** There are `shard` objects lying in the Wilds and in each region, and bosses drop them, but nothing points there. The tracker could point at the nearest shard, as it does for journal pages.
- Right-clicking a shard from 2.5 tiles away failed silently 3 times out of 5. E from the next tile worked every time.
- Wren at the village altar: "Ten. The altar is listening now." Chapter 2 done (+2,000g). Chapter 3 (four shrines) not played; the other shrines have no tracker target either.

### The Ashcombe Signet: played to the end (day 7)
- **Ashcombe introduces himself twice.** On a new game he walks up to you on day 1 ("So you're the grandchild… Ashcombe. I own most of the land…"). On day 5 his story opens with "**So you are the one farming old Margit's land. Good.**" as if you had never met. Every new player sees this.
- **A townsfolk walker (Tam the farmhand) stood on the manor's door tile**, so E talked to him instead of opening the manor (W3_crown_28). The second E worked.
- The manor's story speaks at the door, which is good. **The museum and the smithy don't**: E at their doors walks you inside, and the tracker stays on the street door instead of moving to the keeper inside.
- The burned lodge: once searched, the ruin object is removed and the spot is an empty meadow (W3_crown_29). The text promises "charred beams and a fallen chimney".
- Bringing the signet at the manor door worked (+1,000g, land a tenth cheaper).
- Rowan stood on Highmarch Hold's square, on the same tile Marta used.
  - "Clear ten of them" took about 3 minutes at combat 90 in the hills; the bandits are mixed in with trolls, bears and griffins.
  - No tracker target, and the hint names no place ("Defeat Highmarch Raiders (0/10)").
- Rowan says "Clear ten of them and **I'll walk it with you**", but he was already in the village plaza the moment the tenth fell.
- Ashcombe's ending: "+4,000g, The Ashcombe Signet: story complete!" **plus "Your backpack is full."**
  - The **Stag Signet ring was not in my backpack, and I found no ring drop near me** afterwards.
  - A finished story's unique reward may be lost when the bag is full.

## Broken
1. **Brann's bring step ate Tomas's Locket and the Warden Heart without advancing (stuck for good).**
   - What happened: I right-clicked Brann inside the smithy from 2 tiles away. No dialogue appeared, but both items left the backpack and the step stayed where it was. E then said "Still needed: 1 Tomas's Locket, 1 Warden Heart". The locket has no other source.
   - Likely cause: `storyTalk` takes the items before the dialogue, and a second `storyDialog` call closes the first one quietly (`close(true)` skips `done`).
   - Evidence that one click runs two interaction paths:
     - I logged two `storyDialog` calls from one E on Corwin;
     - the museum's keeper menu opens right after the story dialogue.
   - Fix: take the items in the dialogue's `done`, and never drop a step's `done` silently.
   - I recovered by giving the items back from the console.
2. **The Cinder Drake gets stuck inside a cliff block and heals for ever** (W3_crown_22).
   - After a charge it stood on an `r` tile (137,64) above its arena.
   - Leashed, it tries to walk home through `moveEnt`, can't, and so never un-leashes. It heals 8%/s while its fire bolts still hit you.
   - It stays stuck across map changes.
   - Fix: teleport a stuck leashing enemy home, and keep charges and knockback off solid tiles.
3. **Story rewards with a full bag.** Ashcombe's Stag Signet didn't reach my bag ("Your backpack is full") and I couldn't find it on the ground. Bought or given food also drops at your feet without anyone noticing.
4. **Many steps don't say how to finish them:**
   - "Defeat the Drowned on the isles": they spawn only at night, and the hint doesn't say so.
   - "Defeat Highmarch Raiders": no place, no tracker.
   - "Find 10 ember shards": no hint where.
   - Boss steps without `at` (Warden, Wyrm, Lich, Hollow King): no tracker target.
5. **The recap** shows the finished Drowned step as "(undefined/6)", and Quill's choice and his reply are missing.
6. **E picks forage over a story person or a page:**
   - standing on a page, E picked a flower instead;
   - next to Wren, E picked a morel.
7. **Small:**
   - The dungeon floor window says "Floors you've reached (3 and 5)" while only Floor 1 is listed.
   - After losing a fight, the knockout report says "Sleep in your tent before 2 am next time".

## Quality of life
- The side stories start on their own days, each with a morning-report line that says who to see. The journal's Read/Track buttons and the "x/6" counter are clear.
- The tracker is good across maps ("to The Highmarch", "The Hollow Crown · 16 m"), but:
  - it marks the building's door while the person stands outside (Corwin) or is already inside (Elias, Brann);
  - from the Wilds it pointed into Kingsbridge's wall;
  - its label names the story instead of the target.
- Townsfolk and story people stand on the player or in doorways: Tam on the manor door; the player inside Corwin and Wren.
- The story speaks at the manor door but not at the museum or smithy doors.
- Highmarch Hold and Rimehold share one town plan, and Marta and Rowan use the same tile.
- There is no "Aldren's Key" item, although Marta and Aldren both say "you carry my key".

## Balance
**The Hollow Crown's difficulty runs out of order.** I measured it with a click helper that never dodges, so a human will need less:

| Fight | Chapter | Result |
|---|---|---|
| Stone Warden | 2 | Won at **combat 1** with the wooden sword, using all 3 lives |
| Sunken Forge, floor 1 (level-30 enemies) | 3 | Lost at 3 and at 35/steel; cleared at 45/steel |
| Forge King | 3 | **Lost at 45/steel; won at 60/cobalt with 40 bread** |
| Ember Wyrm (floor 20) | 4 | Won at 60/cobalt **without eating** |
| Rime Queen | 5 | Won at 60/cobalt: 40 bread, 1 life |
| Pale Lich (floor 30) | 5 | Won at 60/cobalt: 40 bread, 3 lives |
| Cinder Drake | 6 | **Not beaten at 60, 75 or 90** (cindersteel, 100 bread), partly because of the cliff bug and the leash heal |
| Drowned Captain | Smugglers 3 | Easy at 90 |

- Chapter 2 is trivial, chapter 3 is a wall, and chapter 4 is easy again.
- Lives give you full health three times, so early bosses are free: a level-1 farmer can stand and trade hits with the Warden.
- Chapter rewards for chapters 1-5 are 800, 1,500, 3,000 (+5 cobalt bars), 5,000 and 7,000 gold. That's fine, though a knockout costs 840g and each late boss ate 40 bread.
- The Salt Smugglers' honest choice (6,000g) dwarfs the rogue one (3 pearls and 4 aquamarines).

## Art & feel (Painterly)
- The squire's "cairn" is a gravestone with a cross (W3_crown_9).
- Interiors (museum, smithy) still have the mirrored second wall band above the room (W3_crown_8, W3_crown_12).
- Frostmere has brown dirt patches on the snow that look like mud stains (W3_crown_17, W3_crown_18).
- Aldren doesn't look like a ghost: he's a solid grey knight (W3_crown_19).
- The Cinder Drake reads as scaled-up pixel art next to the painted salamanders (W3_crown_22).
- Corwin's hut at night: the lit windows are yellow squiggles (W3_crown_24).
- Wren's shrine is lit although it's "gone cold" (W3_crown_26).
- **Liked:**
  - the Saltreach beach and water (W3_crown_25);
  - the Whisperwood glade;
  - the Highmarch dungeon mouth with snowy pines (W3_crown_15);
  - the museum's interior light.

## Performance
- About 165 fps on the farm, in the village and indoors.
- 120-130 fps in the Highmarch and Frostmere towns.
- 97-104 fps arriving in the Emberwaste and next to Kingsbridge.
- 75 fps (7 ms work) right after teleporting to the forest shrine.
- Every dip came right after a long jump, so it's probably chunk painting.
- No console errors from the game. The harness log has 5 × "Failed to load resource: 404", as in earlier passes.

## Liked
- The Hollow Crown's writing ties the farm, the mine and the regions together: Elias's "the little spy", Marta's "Well, well", Sigrun's "You have his stubborn jaw", and Aldren recognising his sister's eyes.
- The Salt Smugglers is the best-paced side story: a night search, a ferry, a cache, a choice, a boss and a payoff in three short chapters.
- Clear feedback:
  - "Still needed: …";
  - the shrine window;
  - chapter-complete and region-open toasts;
  - morning announcements.
- No typos in about 90 lines read.

## Top 5 fixes
1. **Never lose bring-step items.** Take them only when the step's dialogue finishes (or refund them when a dialogue closes quietly), and stop one click from running `storyTalk`/`storyDialog` twice. Today Brann's step can strand the main story.
2. **Fix the leash for stuck bosses.** The Cinder Drake sat inside a cliff healing for ever. Teleport a boss home when it can't walk there, and keep charges off cliffs.
3. **Smooth the Hollow Crown's difficulty.** The Forge King (chapter 3) is far harder than the Warden (chapter 2) and the Wyrm (chapter 4). Reorder, retune, or show a recommended level in the journal.
4. **Give every step a way to be found:**
   - tracker targets for kill steps, boss steps and shards;
   - "after dark" in the Drowned hint;
   - the tracker on the person, inside or outside, rather than on the door;
   - the story speaking at every keeper's door.
5. **Make story rewards and quest items bypass a full backpack** (Ashcombe's Stag Signet went missing). Also fix the consistency problems:
   - Ashcombe's second introduction;
   - Aldren's family tree against The Empty Throne's;
   - "the ice cracked last night", said the same afternoon;
   - Wren's wyrm line after the wyrm is dead;
   - the recap's "(undefined/6)".
