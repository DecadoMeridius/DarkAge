# Round 4: the frontier explorer (Greyhelm and Ashford)

Persona: an explorer who plays by the map. Kingdom test save (combat 30, iron gear, 23,000g). About 125 harness commands. Screenshots are `r4s3_<n>.png` in the playtest scratchpad.

## Summary (route)
1. **Farm.** I spawned stuck inside the workbench next to the tent (W and D did nothing; A freed me). Then I took the farm's north exit.
2. **Into the Wilds.** I followed the road "to Kingsbridge" but drifted off it, got stuck on trees and lost the road several times. The road I ended up on went north past Kingsbridge's west side, so I reached the mine crossroads between Ashford and Greyhelm first. I changed the plan.
3. **Ashford** (about 2:30 pm, day 1). Sawmill (Jorund), The Felled Oak tavern (Rudd): I ate a hot meal, rested two hours, then slept until morning. I attuned the waystone, but only on a second, deliberate touch.
4. **East to Greyhelm** (day 2, 8:30 am). Miners' Supply (Kessa), The Iron Kettle inn (Dagna), the Longhouse (Chief Halvard) where I took "Raiders on the north road". I attuned the waystone after several tries. Killing a slime pack south of the town took the job to 5/12.
5. **South to Kingsbridge** through the west gate. The Barracks (Captain Vey) has "Ride with a patrol" (900g), which I took. The plaza has a fountain, market stalls and the waystone (attuned).
6. **East road toward Saltmere.** I met one knight fighting a slime on the road and helped kill it: patrol job 1/5. The knight walked off and I lost him. I stopped there.

No JS errors all session (`errors`: None).

## Bugs
1. **Spawned inside the workbench (Kingdom test start).** The player stands in the workbench beside the tent ("placed on the tick" right on the player). W and D don't move you; A gets you out. (r4s3_6 to r4s3_9)
2. **Waystones only respond from one exact spot.** Walking over or past a waystone does not attune it. RMB on it walks you there but often does nothing. In Greyhelm, E did nothing from the left side or while overlapping it; it worked only after nudging below it, facing up, then E ("The rune wakes under your hand: Greyhelm"). In Kingsbridge, RMB on the stone left me standing on top of it with no message, though it turned teal (attuned?). The player can also stand inside the stone sprite (no collision). (r4s3_67 to r4s3_72, r4s3_92)
3. **RMB on a keeper behind a counter does nothing in some rooms.** In The Felled Oak, RMB on Rudd did nothing; RMB on the counter opened the menu. In the sawmill, RMB on the keeper worked, but E while standing at the counter did nothing (no prompt). (r4s3_41, r4s3_50, r4s3_52)
4. **Greyhelm's Longhouse (town hall) has a tavern mug sign**, the same symbol as the Iron Kettle inn. From the street I couldn't tell the hall from the inn; I walked into the inn first. (r4s3_75, r4s3_76)
5. **LMB on a street innkeeper opens the full inn menu outside** (meals, Rest two hours) instead of the small street window. This happened with Dagna in Greyhelm. (r4s3_73)
6. **Weapon slot gets selected on its own.** After walking with the axe (slot 1), the hotbar was back on slot 7 (sword) near an enemy. Clicks then attacked instead of walking, and I got stuck at a cliff edge. (r4s3_59)
7. **Possible tower overlap at Greyhelm's south gate.** Just outside the gate, the player was drawn inside the west tower's base. (r4s3_79)
8. **Kingsbridge's west gate has only one tower** (the north one); the south side is plain wall. This looks unfinished next to the two-towered north and south gates of Greyhelm. (r4s3_85)
9. **Waystone attune feedback is inconsistent.** Ashford gave a toast; Kingsbridge gave none, only a colour change.
10. **Gold rose by 500g for no visible reason** while walking from the barracks to the plaza in Kingsbridge (22,759 to 23,259). I saw no toast and don't know which quest or milestone paid it. (r4s3_91)

## Confusing
- **The tracker is stuck on "to Hollowmere Farm"** (the Empty Throne herald) all game, a big label over my head the whole trip. There's no obvious untrack, and it hid things above the player.
- **Clicking near a house walks you to its door and knocks** ("A dog barks...", "No hawkers, no knights, no geese"). Several "walk there" clicks turned into knocks.
- **With a weapon out, clicking ground doesn't walk if any enemy is about 200 px away.** In the Wilds there almost always is one. I switched to the axe only to walk. Explorers will hit this constantly.
- **The roads are a tangle.** Near the mine crossroads and south of the farm there are 3-5 parallel dirt bands, bridges that end in water, and a T of overlapping bridges (r4s3_20, r4s3_21, r4s3_60). Following "the road to X" is guesswork. The road I believed went to Kingsbridge passed it on the west and took me to Ashford/Greyhelm.
- **Keyboard walking snags on every tree trunk and house corner.** I was stuck under canopies 5-6 times (r4s3_22, r4s3_23, r4s3_47).
- **The "Raiders on the north road" job counts slimes.** Five slimes made 5/12 "raiders".
- **Name clashes with the story.** Rudd runs The Felled Oak, but the story has "the hunters' camp ... then Rudd" as a foe. Chief Halvard runs Greyhelm, while chapter 7 has "Halvard's highland raiders".
- **Kessa (Miners' Supply) says "Picks, lamps, rope"** but sells no picks or rope.
- **The map labels are too sparse.** Ashford shows only Inn and Shop (no Sawmill or Tavern label). Greyhelm shows Hall, Forge and Shop but no Inn. Kingsbridge's labels overlap ("Inn Shop Bank Forge" crammed around the name).

## Greyhelm
- **Strongest look of the three.** Crenellated walls, gatehouse towers with pennants, turf and slate roofs on stone houses, guards at the gate, a busy plaza with 8+ townsfolk walking. It feels like a mining town (coal heaps, crates).
- **Miners' Supply:** coal 21, copper 8, iron 16, silver 32, Staircase 27, Warp Totem 25 (very cheap for a teleport), Lantern 108, Stone 5.
- **Iron Kettle inn:** hot meal 50g, but take-away food is very expensive (Miner's Pie 426g, Highland Stew 617g, Veggie Stew 323g).
- **Longhouse jobs:**
  - Raiders 12 kills, 1000g.
  - Coal 30, 500g. Buying the coal at the supply costs 630g.
  - A miner's lunch, 3 pies, 650g. The inn sells the pies at 426g each, 1278g in all.
  - The bring jobs pay less than buying the goods in the same town.
- **The west wall** is a thin flat grey stripe from inside; it looks flat next to the crenellated north wall.
- I never found the forge (no time).

## Ashford
- **A cosy fenced village.** Log and plaster cottages, lamp posts, a well, log piles, a guard at the west gate, villagers walking. It reads as a woodcutters' village. It is small: one crossroads.
- **Sawmill (Jorund):** wood 5, hardwood 25, fence 5, workbench 210, paths 5. The interior is a generic shop with jar shelves, nothing sawmill-like.
- **The Felled Oak (Rudd):**
  - Hot meal 60g and rumours (good flavour).
  - Rest two hours (120g); after 7 pm the button becomes "Sleep here until morning (120g)", which worked. I woke at the tavern door at 6:00 with a morning report.
  - Take-away food: Hunter's Brew 171, Omelette 245.
- **A woodcutter NPC stands on the waystone.**
- I didn't find the trading post.

## Kingsbridge
- **It feels like a capital.** Wall towers, a big plaza with a fountain, benches and four striped market stalls, a temple-like building, red, blue and plaster houses, lots of people.
- **The barracks interior is great:** weapon racks, armour stands, purple banners, bunks, Captain Vey behind the counter.
- **One house knocked:** "No hawkers, no knights, no geese". Nice.

## Patrols and jobs
- **Taking jobs works.** The Quests tab (J) lists both taken jobs with progress ("Progress: 5/12", "1/5") and where to hand in.
- **Patrols:** in roughly 1.5 in-game days on roads between three towns, I saw one knight, on the Kingsbridge-Saltmere road at about 5:40 pm. Helping kill one slime counted (1/5).
  - The knight then wandered off and I lost him within seconds; there is no marker.
  - **Patrols are too rare or invisible to plan around.** The barracks job should say which road the patrols ride, or the map should show patrols (or at least their routes).
- **No knight patrol on the long Ashford-Greyhelm or Greyhelm-Kingsbridge roads** while I walked them.

## Navigation
- **The world map (M) is the best tool.** Towns are boxed and labelled, roads are drawn, explored land is coloured and attuned waystones show as small blue diamonds. "Centre on me" is essential.
  - The red "you" dot is tiny and hides under the yellow Kingsbridge square.
  - The mouse wheel didn't zoom for me; the Zoom buttons did.
- **Signposts at town gates are good.** The arrows list all four other towns (e.g. "Kingsbridge ↓ · Ashford ← · Saltmere ↘ · Emberhollow ↙").
- **There are no signposts at the many road forks in between.** That's where I got lost.
- **Waystones are good once attuned**, but attuning needs the exact-spot fiddle (bug 2).

## QoL wishes
- An untrack button (or a smaller tracker label) in the Quests tab or on the tracker itself.
- Click on the world map to set a waypoint or auto-walk along roads.
- Attune a waystone by walking over it.
- Shift+click (or a modifier) always walks, even with a weapon out.
- Show patrols on the map, or have the barracks job name a road ("They ride the east road to Saltmere").
- Separate sign icons for town hall and inn.
- Fork signposts on the long roads.

## Balance
- **Bandits hurt a lot.** Combat 30 in full iron: one bandit plus a slime took 108 of 300 HP; bandits drop about 28-31g.
- **Slime packs of 5 were easy.**
- **Take-away inn food costs 3-6x the hot meal**, and town bring jobs pay less than the goods cost in the same town (coal, miner's pies).
- **Warp Totem at 25g looks far too cheap.**
- **Time runs fast while walking:** Ashford to Greyhelm took about 2.5 game hours; Greyhelm to Kingsbridge about 3.

## Looks
- **The towns are the best thing here.** Each has a distinct palette: Ashford logs and thatch, Greyhelm grey stone and turf, Kingsbridge red tile and plaster.
- **Interiors (barracks, hall, tavern) are rich.**
- **Weak spots:**
  - the tangled overlapping road bands and odd bridge junctions (r4s3_20);
  - flat-stripe side walls;
  - the sawmill interior.

## Liked
- Walking through Greyhelm's gate between two guards into a busy stone town.
- Rudd's rumours and lines ("Tastes like toes, too").
- Sleeping at the inn and waking at its door with a morning report.
- The Quests tab tracking town jobs with progress.
- Running into a knight mid-fight on the road. That's the moment the realm felt alive, when it happened.

## Top 5 fixes
1. Make patrols findable: show them on the map, or have the barracks job name their road; and make them not vanish right after one kill.
2. Waystones attune when walked over, interact from any side, and always show the toast.
3. Fix the Kingdom-test spawn inside the workbench, and the weapon-out clicks that don't walk.
4. Clean up the road network: fewer parallel bands, fork signposts, no bridges ending in water.
5. Give the Greyhelm Longhouse a hall sign, add the missing map labels (Inn, Sawmill, Tavern), and add an untrack option for the herald arrow.

## `errors` output
None (checked twice, the second time right before `stop`).
