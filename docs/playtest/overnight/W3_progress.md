# W3: progression and balance over the first week (New game, painterly, days 1-5)

**Route:** New game → creator → Ashcombe → "I know my way around a farm" → till and plant 7 turnips → into the Wilds with the
wooden sword (slimes) → walked toward the Wilds mine (247,109) → knocked out by a goblin tribe (day 1, 4 pm) → day 2: watered,
sold at Mara's, Brann's smithy (anvil, forge, shop, tool upgrades, patterns), bought 2 coal, north road → Kingsbridge waystone →
travelled home and slept → day 3: waystone to Kingsbridge, headed north for the mine → knocked out by a bandit patrol (11 am) →
day 4: watered → slept → day 5: harvested the first turnip.

**What I didn't reach:** I never got to the mine, so I didn't smelt copper or smith a copper sword. I couldn't afford any
upgrade. These gaps are findings in themselves (see Balance).

Painterly and the FPS counter were on. `errors` returned **none** every time I checked. Shots are `shots/W3_progress_<n>.png` (1-42).

## Numbers
| | Day 1 | Day 2 | Day 3 | Day 4 | Day 5 (6 am) |
|---|---|---|---|---|---|
| Gold (start of day) | 500 | 450 (−50 KO fee) | 386 | 471 (−52 KO fee, +bandit loot) | 471 |
| Energy at wake | 120 | **60** (KO) | 120 | **60** (KO) | 120 |
| HP at wake | 100 | **50** | 100 | **50** | 100 |
| Crops alive | 7 planted | 5 (1 lost to grass) | 4 (2 lost) | 4 (3 more tiles lost, incl. bare soil) | 3, first turnip harvested |

- **Income:** after five days I've earned 175g. All of it came from foraging and drops: 3 dandelions sold for **120g** (40g each),
  7 slime goo for 35g and 4 hay for 20g. I've harvested 1 turnip (36g base) and sold no crops. Net gold went from 500 to 471.
- **Skills (K):** Farming level 1 after 5 days (44 XP; 83 needed for level 2), from ~7 tills, ~8 plantings, ~20 waterings and 1
  harvest. All other life skills are level 1. Combat went from level 4 to **8**, mostly from being beaten: Defence has 1,139 XP
  (level ~12) and Melee only 490 (level ~5). **Losing fights levels you faster than winning them.**
- **Energy:** a tile costs 2 (till or water), the scythe 1. Day 1: 120 → 90 by 10 am. Energy was never the limit; the limits
  were travel time and knockouts.
- **Clock:** 6:00 → 10:10 am took about 5 minutes of real play. A day is roughly an hour of real time.

### Damage taken
- **Slimes** (22 HP, atk 3, packs of 4): the first pack of 4 took me from **100 → 33 HP in about 6 seconds** and I killed only
  2. Fighting them one at a time cost about 3 HP per kill. A wooden sword needs 3-4 swings per slime.
- **Goblin tribe** (goblin 59 HP at level 5, slingers 47 HP, an **ogre with 368 HP**), about 75 tiles north of the farm gate on
  day 1: it took **87 HP plus all 3 lives (~390 damage) in under two minutes**. I was walking with the hoe at the time.
- **Bandit patrol** (bandit 90-102 HP, atk 17, chief 167 HP), about 50 tiles north of Kingsbridge on day 3: **all 3 lives in
  about 30 seconds of fighting** (HP 86 → 72 → 45 → 17 → life → 3 → life → 4 → KO). I killed one or two.

## Broken
1. **Brann can't be talked to by clicking him.** RMB on Brann (or a click on his tile) walks you to (9,6) beside the anvil,
   where his Talk isn't in reach, and nothing opens (shots 33, 35). Only standing exactly below him at (7,6) and pressing E
   opens "Brann's Smithy" (Forge, Tool upgrades, Buy, Sell, Patterns). RMB on the anvil or the forge opens only the Satchel's
   station recipes, never the shop. A new player won't find the tool upgrades or Brann's shop.
2. **A far click with a weapon never walks, even with no enemies around** (farm, village and Kingsbridge; shot 39). CLAUDE.md
   says it should walk. In the Wilds, any foe within 200 px turns every click into a swing at the air, including foes across a
   lake (shots 19-20). To get anywhere I had to switch to the pickaxe or use WASD.
3. **A far click with the hoe tills the tile you walk to.** Walking to the village with the hoe in hand tilled 6 random tiles
   along the farm path and cost 12 energy. The off-farm hoe then walks you into danger without fighting back (my day-1
   knockout).
4. **Lord Ashcombe stands on top of you after "I know my way around a farm".** He leaves very slowly (tutWalk 3) and blocks the
   tile you're on (shot 9). Clicking the tiles next to him reopens his "Get on with it, farmer" dialogue again and again, and
   the first click on Close was ignored (shots 7-8).
5. **Pressing Space during the dialogue cost 2 energy** (120 → 118). The hoe was used behind the dialogue box (W1 found the same
   with fences).
6. **No way to eat with LMB.** The hint says "LMB Eat" with bread selected, but clicking the world or yourself walks or does
   nothing. The only way that worked was clicking the selected hotbar slot again (it gave +25 HP and energy to full). The
   Satchel's Eat button probably works, but nothing points to it mid-fight.
7. **Scythe harvest can miss:** "Cut turnip with your scythe (left click with it selected)" appeared after a left click with
   the scythe selected on a ripe turnip (shot 42). The second click on the turnip under/next to me did nothing; one of two
   harvested.
8. **Tile clicks are dropped while the previous swing plays.** Clicking 7 tiles 0.45 s apart watered 2 of 7 and planted 4 of 7.
   Clicks also walk you onto the soil and drift the camera, so the next planned click lands elsewhere (shots 13-16).
9. **A villager stood on the village well's roof** (shot 29, right side).
10. **The knockout report says "Sleep in your tent before 2 am next time"** after a combat knockout at 11 am or 4 pm. The text
    is for passing out from staying up late.
11. **Meadow grass reporting:** night 1 lost a crop with no line in the report (the knockout line replaced it?). Night 2 said
    "a tile" and two crops vanished.

## Quality of life
- **The mine is far too far.** The Wilds mine is at (247,109); the farm gate is at about (131,329) and the village gate at
  (220,326), so it's **about 200 tiles** of forest away, past goblin camps and bandit roads. Nothing tells a new player where
  it is ("Explored 1% of the Wilds"); I had to read state to find it. "Mine the first floors" doesn't fit in a first week. A
  mine entrance within reach of the village, or a waystone at the mine mouth, would fix the early game.
- **No warning before lethal areas.** Nothing tells you a level-5 goblin tribe with a 368-HP ogre is ahead, or that bandits
  walk the Kingsbridge road. The map's green triangles aren't explained as danger.
- **Click-to-act drift** makes farming fiddly with 1-tile tools (above). A queue of clicked tiles, or acting only when in reach,
  would help.
- **The ability bar covers the LMB hint** in the Wilds ("LMB A…" hidden behind the Focus bar, shot 23).
- **The hint shows "LMB Attack" inside shops** next to the shopkeeper (shots 30, 32).
- **The hint shows "LMB Mine" on the Kingsbridge waystone** (shot 40).
- **Kingsbridge traps you:** the fountain and the town hall sit across the north–south line, so far-clicks north route to the
  waystone or a door and stall (30 click rounds and 2.5 in-game hours went nowhere).
- **Selling:** the Sell tab shows each item's price, which is good. "All" buttons shift rows after each sale.

## Balance
- **Money is tight; crops lose to dandelions.** One dandelion sells for 40g, about a whole turnip (seed 23g, about 45g, 4
  days of watering). Three dandelions picked for 1 energy each earned more than any crop. Foraging is far better per energy and
  per day.
- **Meadow grass is harsh before fences.** 6 of ~13 tilled tiles (including 3-4 planted ones) were lost in 4 nights. The game
  says "fence your fields", but on day 1 a new player has 15 wood and doesn't know yet. Consider no overgrowth in the first week,
  or a 1-2 night grace for freshly planted tiles.
- **Knockouts snowball:** each one costs the rest of the day, about 50g, and you wake at half HP and **half energy**. Two
  knockouts cost me two of my first four days.
- **The copper sword is out of reach in week 1** without the mine. It needs 4 copper bars (20 ore + 4 coal) and a grip. Buying
  the ore at Brann's costs 20 × 28g + 4 × 37g = **708g**, and the finished sword costs **925g**. A copper tool upgrade is
  **500g + 5 bars** (about 885g more if you buy the ore), the Iron pattern 800g. Starting gold is 500.
- **Combat at level 3-6 with the wooden sword:**
  - Slimes alone: fine.
  - A slime pack of 4: dangerous.
  - Goblin tribes and bandit patrols: certain death. They spawn on the main routes out of the farm and village into the Wilds,
    from day 1 (goblins) and day 3 (bandits).
  - Lives (3) melt in seconds against 3-5 attackers. Bandits (atk 17, 90+ HP) are tuned for a much later player.
- **Defence levels much faster than Melee** (1,139 XP against 490) because it's earned by taking damage. Dying is the fastest
  way to raise your combat level.

## Art & feel (Painterly)
- The farm, the Wilds forest and lake, and Kingsbridge plaza look good (shots 18, 22, 38, 41). The night grade in Kingsbridge
  reads well, and the rain overlay on day 3 works.
- **Ashcombe's dialogue portrait** is a huge, blurry upscaled pixel figure filling half the box (shots 4-6).
- **Shop interiors** have a detached strip of back wall and windows floating at the top of the screen (Mara's and Brann's,
  shots 30, 32).
- **Tilled soil** is raised square blocks. Day-2 overgrown and bare tiles look the same as planted ones until you're close.
- A **villager stood on the well's roof** (shot 29).

## Performance
127-130 fps throughout (farm, village, Wilds, Kingsbridge, shop rooms), 0.7-2.3 ms work per frame. No stutters, and map
changes and waystone travel were instant.

## Liked
- Brann's shop is clear once open: tool upgrade costs, patterns with recipe counts, stock and prices.
- Mara's seed rows (grow days, season, expected sale price) and the item prices in the Sell tab.
- Waystones: Kingsbridge attuned as I walked past, and travel home was instant.
- The morning report (weather, new stories, the merchant, knockout and overgrowth lines) gives clear goals.
- Out-of-combat regeneration is quick (33 → 52 HP in about a minute).
- No console errors in five in-game days.

## Top 5 fixes
1. **Make the first week's danger fit a level-3 player.** Keep goblin tribes, ogres and bandit patrols (atk 17, 90+ HP)
   away from the farm and village gates and the first roads in week 1. Warn before camps and patrols, and stop knockouts
   halving the next day's energy.
2. **Put the first mine within reach:** about 200 tiles of hostile forest is too far. Add a nearby entrance, a mine waystone,
   or at least a signpost and map marker from the farm gate.
3. **Fix click intent:**
   - A weapon should walk when nothing is in reach.
   - The hoe shouldn't till on walk-clicks.
   - Tile clicks shouldn't be dropped during a swing.
   - LMB "Eat" should eat.
4. **Brann (and other keepers):** RMB on a keeper should open the shop from where the path stops. The forge and anvil should
   offer the shop (tool upgrades, patterns), not only the recipe list.
5. **Early farming should pay:** no meadow-grass overgrowth in the first week, or on freshly planted tiles. Rebalance
   dandelion (40g) against turnips (~45g after 4 days of work).
