# W3_farmweek: a careful, farming-first first week (New game, painterly, days 1-7)

**Route:** New game → creator → Ashcombe "Show me around" (tutorial) → days 2-7 on the farm and in the village only: a 40-tile
field fenced with a gate, turnips/potatoes/garlic/rhubarb/strawberries, watering every day, the farm pond for fish, Mara,
Hale, the tavern, a Well built on day 5, Cottage plans bought on day 7. Never entered the Wilds. Never knocked out.
Painterly + FPS counter on. `errors` returned **none** every time. Shots: `shots/W3_farmweek_<n>.png` (1-42).

## Numbers

| Day | Gold morning | Gold at night (before bin) | Paid next morning | Where the money came from | Energy at end | Farming / Foraging / Fishing | Tiles lost to grass |
|---|---|---|---|---|---|---|---|
| 1 | 500 | 170 | 498 | fish 286 (+213 seeds/bread shipped by mistake); spent 330 seeds | 6 | 1 / 1 / 2 | 1 turnip (open field) |
| 2 | 668 → 918 (Ashcombe's note +250) | 609 | 482 | Angler milestone +600, fish 482; spent 909 seeds | 8 | 2 / 1 / 5 | 1 (empty stray tile) |
| 3 | 1,091 | 588 | 832 | fish 832; spent 502 seeds | 15 | 2 / 1 / 9 | **4** (my fences picked up by walk-clicks) |
| 4 | 1,420 | 1,288 | 1,102 | fish 1,102; spent 132 | 8 | 3 / 1 / 11 | **2** (gate deleted, see Broken 1) |
| 5 | 2,390 | 2,094 | 565 | turnips 599 at Mara; spent 495 seeds, 250 Well plans, 150 stone | 30 | 4 / 1 / 13 | 0 |
| 6 | 2,659 (+300 First harvest) | 3,076 | 1,427 | garlic 249, fish 1,427; spent 132 | 40 | 5 / 1 / 16 | 0 |
| 7 | 4,503 | 3,118 | 326 | potatoes+garlic 463; spent 248 seeds, **1,600 Cottage plans** | 13 | 5 / 1 / 17 | 0 |
| 8 | **3,444** (after 1,600 on plans, 250 on the well) | | | | | | |

**Totals for the week** (500g start): fish ≈ **5,000g** (≈210 fish), crops **1,311g** (13 turnips 599, 8 garlic 466,
3 potatoes 227 + leftover), milestones 900g (Angler 600, First harvest 300), Ashcombe's note 250g. Seeds cost 2,748g.
Crops alive on day 8: 40 (6 rhubarb, 5 strawberries, garlic).

### Per energy (2 energy per till and per water, scythe 1, a cast ~2)
| Activity | Return | Gold per energy |
|---|---|---|
| Turnip (seed 23g, sells 45g, 4 days) | +22g for ~10 energy (till + 4 waterings) | ~2.2 |
| Garlic (seed 33g, sells 60g, 4 days) | +27g for ~10 energy | ~2.7 |
| Potato (seed 51g, sells 72g, 6 days) | +21g for ~14 energy | ~1.5 |
| Pond fishing (carp 30→22g, sunfish 40g) | ~1 fish per cast | **12-20** |
| Grilled Fish (1 fish at any kitchen) | +45 energy for a 22-30g carp | energy is buyable with fish |

## Answers
- **Is a safe week rewarding?** In gold, yes: 500 → 3,444g plus a well and cottage plans, 40 crops in the ground, Fishing 17,
  no knockouts. W3_progress (Wilds) earned 175g in five days. But **almost all of it is fishing**: ~5,000g of fish against
  1,311g of crops. As a *farming* week it isn't rewarding: Farming reached 5, crops pay ~2-3g per energy, and the field
  kept losing tiles to grass because fences and gates disappear under normal clicks (Broken 1-2).
- **Can you afford the first upgrades by day 7?** The **plans**, easily: Well plans 250g (built day 5), Cottage plans 1,600g
  (bought day 7), Coop 2,400g also affordable. The **materials**, no: the Cottage needs 150 wood + 80 stone. Hale sells 15
  wood and 15 stone a day (9-10g), a tree gives 8-10 wood for 10-16 energy, so it's ~15 trees or 10 days of Hale's stock. Tool
  upgrades need copper bars, i.e. the mine in the Wilds. The Barnyard milestone needs a coop.
- **What's tedious?**
  1. **Watering**: 40 tiles = 80 energy and ~1.5 game hours of one-tile clicks every morning; the can (40) needs a refill
     mid-field. No sprinkler is in reach in week 1.
  2. **Click handling around the field**: clicks dropped while walking (fences, seeds, water), the scythe walking then
     refusing ("Cut turnip with your scythe…"), fences landing a tile south, the hotbar letting go of fences when you place
     the last one, tool clicks picking fences up.
  3. **Walking**: workbench by the tent, field and pond south-east, village east; every shop trip is a long walk and rooms
     are fiddly to leave (2-tile door gap, villagers standing in door paths).
  4. **Energy-gated days**: by 11 am on day 1 the energy was gone; the afternoon was fishing or sleeping at 3:40 pm.
- **Which early seed is best?** For week 1: **garlic** (33g → 60g in 4 days, best profit per tile-day, 6.75g/day). Turnips
  are close and are the best return on a thin purse (23g → 45g, ~96% in 4 days). Potatoes (6 days, +21g) and tulips are
  poor. For the season: **strawberries** (74g, first crop day 8, then every 4 days at 68g: ~12g per tile-day). Rhubarb
  (113g → 192g in 12 days) pays only through the board request, which was gone by day 6. Nothing grown beats the pond.

## Broken
1. **A tool click on a Fence Gate deletes it and gives nothing back.** `useTool` (e_play.js:159) does `delObj` then
   `give(o.k)`; for a gate `o.k` is `'fgate'`, which isn't an item (the item is `fence_gate`). Repro: place a gate, hit it
   with the pickaxe (or walk-click it with the axe): both halves vanish, the bag gets nothing. Lost 2 gates this way; each time
   the field stood open and lost tiles overnight (days 4-5).
2. **Any tool click on a placed fence picks it up instantly**, no swing count or confirmation. One axe click on (35,24)
   removed it into the bag. Walking to the field with the axe in hand picked up 2-3 fences on three different days and opened
   the field (day 3: 4 crops lost). The watering can doesn't do it; the axe and pickaxe do.
3. **The meadow-grass line in the morning report is one day late.** Night 1's lost turnip was reported on day 3 ("a tile"),
   night 3's 4 tiles on day 5, night 4's 2 tiles on day 6. The `endDay` wrapper in x_gate.js runs `fieldsOvergrown` after
   the report has been built, so `OVERGROWN_NEWS` waits for the next one. It also says "choked what grew there" for empty soil.
4. **Placing a Fence Gate next to a gap takes the fence on the other side.** On a 2-tile gap (32-33,24) the gate went on
   31-32 (fence at 31 returned), leaving 33 open; `putObj` prefers a fence neighbour over the free gap tile.
5. **Fences land one tile south of the click** (twice: clicked (32,22) → fence at (32,23); clicked (33,24) → (33,25); shot
   39 shows the stray post under the south fence).
6. **Scythe harvest:** a left click with the scythe on a ripe crop out of reach walks you there, then shows "Cut turnip with
   your scythe (left click with it selected)" and does nothing (shot 34). 2 of 13 first clicks worked; a second click on each
   worked. (W3_progress #7.)
7. **Walk-clicks with a selected item act at the destination:** food eats (two clicks toward the notice board ate 2 Trail
   Bread), the hoe tills, a placeable (the gate) gets placed where you clicked to walk (the gate ended up by the tent).
8. **The hotbar slot lets go of fences when you place your last one**; fences picked back up go to the bag, so the slot says
   "Walk" and 14 placement clicks did nothing until I dragged fences back (shot 23).
9. **The request board swapped its request:** day 2 "6 Rhubarb for 1,480g" (rhubarb takes 12 days), day 6 "45 Woods for
   209g". I'd bought 678g of rhubarb for it. (Also "45 Woods".)
10. **RMB on Hale or Brann behind their counters does nothing**; the counter in front of Hale opens his shop (W3_progress #1).
11. **Hale's Greenhouse upgrade row reads "Next: 0g, ."** with a Build button.
12. Tutorial dialogues pop up after the first tile of each task and swallow the following clicks (14 of 15 turnip clicks lost).

## Quality of life
- **The shipping bin shows no contents and can't give anything back.** It offers seeds and food for sale too. One wrong
  "All" (my harness, but easy for a player) shipped 10 garlic seeds bought for 330g at 15g each.
- **The bin's "Tonight so far" over-promises**: it ignores the per-unit demand drop (852 → 832g, 604 → 565g, 1,470 → 1,427g).
  Carp fell from 30g to 22g after ~80 sold, with no warning in the bin or the Sell tab.
- **Every story begun in week 1 needs the Wilds** (Hollow Crown pages, Lost Lanterns, Salt Smugglers, Ember Pilgrims,
  Ashcombe Signet). A careful player has nothing to follow but the milestones.
- **Trail Bread (55 energy for an 8g item) isn't sold anywhere**; the tavern's Country Bread is 144g. The real food loop
  (Grilled Fish from any fish at the campfire) isn't pointed out by anything.
- **Clicking the tile you stand on does nothing** (tilling, scything); a hoe click two tiles away sometimes did nothing either.
- **Villagers stand in door paths** (Rosie blocked Mara's 1-tile path twice; walk-clicks talk to her instead).
- **Leaving rooms**: the door is a 2-tile gap; walking S from anywhere else hits the wall. A click-to-exit or a wider door
  zone would help.
- The level-10 passive pick is three small cards on a huge empty panel (shot 33).
- A fully fenced field with no gate gives no hint that a click inside it is unreachable; the walk just stops.
- The weeds spread fast (110 weeds on the farm by day 4) but give nothing except fibre/hay through the scythe.

## Balance
- **Fishing dwarfs farming** (12-20g per energy vs 2-3g). Fishing 1 → 10 by day 4, 17 by day 7, and the Angler milestone (600g)
  comes on day 2. Crops are a side income. The demand drop (carp 30 → 22g) is the only brake.
- **Energy isn't a real limit once you cook fish**: one carp → Grilled Fish → 45 energy at the campfire. A careful player
  can water 40 tiles and still fish 40 casts a day.
- **Meadow grass is harsh only because fences and gates are so easy to lose** (Broken 1-2). With an intact ring, nights 5-7
  lost nothing, which feels right.
- **First upgrades:** plans are cheap next to the week's income; materials are the wall (Cottage 150 wood + 80 stone).
- **Board requests** should fit the time they stay up: a 12-day crop for a request that changes within 4 days is a trap.
- Starting kit (15 turnip + 5 potato seeds, 500g, 5 bread) is fine; the 250g + 3 bread from Ashcombe on day 2 is welcome.

## Art & feel (Painterly)
- The fenced field, crops (turnip leaves, white garlic bulbs, strawberries), the well and the pond look good (shots 20, 32,
  38, 39, 42). The village plaza with the fountain and well reads well (shot 40). The crop tooltip ("Garlic · day 2/4 ·
  watered") is handy (shot 42).
- **Ashcombe's dialogue portrait** is a big blurry upscaled pixel figure (shot 6), as W3_progress said.
- **Shop rooms** (Mara's, Hale's) still have a detached strip of back wall floating at the top (shots 12, 30).
- At **6 am** the farm is drab grey-brown (shot 17) and at **9-10 pm** very dark (shots 36, 38); the night is fine for mood but
  makes field work hard to read.
- Hale's "LMB Chop" hint shows inside his shop with the axe in hand (shot 30).
- At the carpenter's the player was hidden under the foreground tree canopy by the door, with no outline (shot 35).
- The gate is a plain frame (two posts and a lintel): readable, but it looks like a hole in the fence at a glance.

## Performance
165 fps throughout (farm, village, shops, night), 0.6-1.4 ms work per frame. No stutters. No console errors in 7 days.

## Liked
- Building the Well: plans → blueprint → place ghost → Deliver everything at once → Hammer in stages. Clear and quick.
- Mara's seed rows (days, seasons, sale price) and the Sell tab with per-quality prices.
- The fishing minigame feel and the quality tiers; the Angler perk choice at 10.
- The crop hover tooltip, the morning report's weather/festival/birthday lines, the farm notice board.
- Fences joining up into a proper paddock; `enclosedTiles` behaves exactly as described once the ring is intact.
- No knockouts, no console errors: the safe week is genuinely safe.

## Top 5 fixes
1. **Stop fences and gates disappearing**: a tool click on a gate must return `fence_gate` (not `'fgate'`), and only the
   pickaxe (with a swing or two) should lift fences and gates; the axe/hoe/scythe should not.
2. **Make the overgrowth line same-day** (run `fieldsOvergrown` before the report is built) and name the lost crops.
3. **Fix field clicks:** the scythe should cut on arrival; don't drop clicks while walking; place fences on the clicked tile;
   don't eat/till/place on walk-clicks; keep the hotbar slot for fences after the last one is placed.
4. **Rebalance fishing vs crops** for week 1 (or raise crop prices / lower watering cost), and point a safe player at
   something in the village: one story step or request that doesn't need the Wilds.
5. **Shipping bin**: list what's in it with a take-back, don't offer seeds/food by default, and show the demand-adjusted
   payout. Keep board requests up long enough for the crop they ask for.

## Daily log
### Day 1 (Mon, spring 1)
- New game, creator, Ashcombe → "Show me around". Tutorial played fast.
- Field: 20 tiles tilled at (29-38, 20-21), south of the farm road, 8 tiles from the pond. 15 turnips + 4 potatoes planted
  (start kit: 15 turnip seeds, 5 potato seeds).
- Energy by 11 am: 120 → 25 (till 2, water 2, chop/mine ~3 per swing). Tilling + planting + watering 20 tiles costs ~80 energy:
  a 20-tile field eats two thirds of the day's energy on day 1.
- Tutorial interrupts work: each task's completion dialogue pops after the FIRST tile and swallows the next clicks (14 of my
  15 turnip clicks and 11 of 19 water clicks were lost behind "Seeds want water…" / "Watered crops grow…").
- A far click with the hoe tilled a stray tile at (20,16) on the walk (as in W3_progress).
- Crafted at the workbench: Fence ×4, Fence Gate (6 wood, 2 fibre) — and a second gate by accident (my dialogue-clicker
  hit the craft window's Make button; not a game bug).
- Afternoon: fished the farm pond with 17 energy: **9 casts → 4 carp, 4 sunfish, 1 silver sunfish = 286g** (carp 30g,
  sunfish 40g, silver 46g; ~2 energy a cast). Fishing 1 → 2 in one afternoon.
- Shipping bin: my harness mis-clicked "All" on the first rows and shipped my 10 garlic seeds (bought 330g, paid back 150g),
  the potato seed and the 5 Trail Bread. **The bin can't give anything back**: it doesn't even list what's in it, only
  "Tonight so far: 499g". A real player who misclicks loses the seeds. The bin also offers seeds and food for sale.
- Slept at 3:40 pm with 6 energy (nothing left to do without energy). Morning gold 500 → night 170 (330 on seeds), +498 shipping.
- **Night 1: one planted turnip (37,20) became tall grass, and the morning report said nothing.** (Later found: the line
  arrives one morning late; see day 5.)

### Day 2 (Tue)
- Morning: 668g, energy 120. Farming 1 (59 xp), Foraging 1, Fishing 2 (136 xp). 18 crops alive, 1 tile lost to grass.
- Ashcombe's note on the tent: +250g and 3 Trail Bread (918g).
- Watered 18 crops (34 energy). Chopped 3 trees (birch ≈ 8 wood for 16 energy; 2nd and 3rd ~10 wood for ~10 energy each).
- Crafted 28 fences, then **fenced the field** (ring 12×4 with the gate on the south side), then moved the south side down
  two rows and tilled 20 more tiles. `enclosedTiles` confirms every field tile is safe.
- Fence placement is fiddly: ~1 in 3 clicks on a fence tile was dropped (the click lands while you're still walking to the
  previous spot). One click on (32,22) put a fence on (32,23) instead (shot 20: the odd post under the south fence).
- **When you place your last fence the hotbar slot lets go of it**; picking fences back up puts them in the bag, not on
  the hotbar, so the next 14 clicks said "Walk" and placed nothing until I dragged fences back on (shot 23).
- Clicking a tile with a weed or stone on it switched my hotbar to the pickaxe (auto tool) in the middle of fence placing.
- **Food eats on a walk-click:** with Trail Bread selected, two far clicks toward the notice board ate 2 breads (energy
  50 → 120) instead of walking. (W3_progress found the opposite, that LMB "Eat" never eats.)
- Trail Bread restores **55 energy for an 8g item**. If bread can be bought, energy stops being a limit.
- Notice board: "The village board wants 6 Rhubarb for 1480g" — rhubarb takes 12 days, so not a first-week request.
- Mara: bought 6 rhubarb (678g, for the board) + 7 garlic (231g) → 9g left. The ×5 confirm ("Click ×5 again to buy for
  565g") is a toast near the bottom-right; my second click after a tab switch didn't count.
- Rosie the flower seller stood in the 1-tile path to Mara's door; every walk-click toward the door talked to her (twice)
  instead (shot 21).
- Evening: 18 casts at the pond → 16 carp (6 silver) = 482g; night fish are carp only. Fishing 2 → **5**.
  The 15th fish completed the **"Angler" milestone: +600g**.
- End of day: 8 energy, 609g before shipping. Farming 2 (125 xp), Foraging 1, Fishing 5 (408 xp).

### Day 3 (Wed)
- Morning: 1,091g (+482 shipping). Report: "Meadow grass crept into a tile of your fields and choked what grew there" —
  the tile was an empty stray hoe tile outside the fence (20,16), so "choked what grew there" is wrong for empty soil.
- Watered 32 crops: ~62 energy and 1 h 30 of game time, plus a refill trip to the pond (refills are free).
- Pip (Lost Lanterns) wants lanterns from the ruins, the forest and Corwin's dock: all in the Wilds, so not for a safe week.
- Tavern opens at noon. Food there is dear (Country Bread 144g, Grilled Fish 241g), and **Trail Bread isn't sold anywhere**.
- Mara: 5 strawberries (370g) + 4 garlic (132g). All 41 field tiles planted. Mara's Pantry sells salt, sugar, butter, flour.
- Daytime fishing: 14 casts → 8 carp, 4 sunfish (2 casts did nothing). Fishing 6.
- **Hale's Workshop prices (the "first upgrades"):** Well plans 250g (30 stone, 10 wood), Storage Shed 1,200g, Cottage
  1,600g (150 wood, 80 stone), Market Stall 1,600g, Silo 1,500g, Coop 2,400g, Barn 5,000g, Stable 6,000g. Hale sells wood and
  stone at 10g (15 a day), hardwood 58g, clay 37g, fibre 7g.
- Hale's "Greenhouse (not built)" upgrade row reads **"Next: 0g, ."** with a Build button: the cost text is empty.
- **RMB on Hale or Brann behind their counters does nothing**; RMB on the counter in front of Hale opens his shop. RMB on
  Brann (7,5) and E from below him did nothing either (he closed at 6 pm while I tried).
- Rooms are awkward to leave: the door is a 2-tile gap in the bottom wall, and walking with S from anywhere else hits the wall.
- **Energy loop:** the tavern kitchen's Grilled Fish takes 1 fish of any kind and restores 45 energy (35 HP). A carp is 30g
  and ~2 energy to catch. One night's fishing feeds the next day's watering, so energy is not really a limit once you know.
- Night: ate 1 grilled fish (14 → 59 energy), then 24 casts → 21 carp (4 silver/gold). Fishing 6 → **9**.
- Bin said "Tonight so far: 852g"; the morning paid **832g**. The bin's estimate ignores the price drop from selling many of
  one item (~0.6% a unit), so it over-promises.
- End of day 3: 15 energy, 588g before shipping. Farming 2, Foraging 1, Fishing 9. Tiles lost: 0.

### Day 4 (Thu)
- Morning: 1,420g. New story: The Salt Smugglers (Corwin on the coast, in the Wilds: skipped).
- **Morning: 4 field tiles inside my fence had become tall grass** (a turnip, a potato, two garlic), and **3 fences were
  missing** from the ring (28,19 / 29,19 on the road side, 38,24), so the field had been open. I had 3 more fences in the
  bag than I'd placed: walking clicks with the axe along the fence had picked them up (see Broken: any tool picks fences up).
- No overgrowth line in the morning report (it came a day late, see day 5).
- Re-placed the fences, scythed the grass and re-tilled (the hoe click on a tile two tiles away did nothing and cost no
  energy until I stepped closer).
- Elias (Hollow Crown) wants three journal pages "blown all over the Wilds". **Every story begun in week 1 (Hollow Crown,
  Lost Lanterns, Salt Smugglers) sends you into the Wilds**; a safe player has no story to follow until day 5's Ashcombe Signet.
- Ashcombe Manor plots: South 9,900g (lease 2,475 down + 594/week), South-west 12,700g (hot spring), West lakeside 13,200g.
- Clicking a selected food slot again eats it (grilled fish 9 → 52 energy). Cooking at the farm campfire works (5 grilled
  fish ×5 batch).
- **Fishing 10 on day 4** (passive pick: chose Angler, +10% fish prices). The pick window is three cards on an empty
  full-size panel (shot 33).
- Afternoon + evening: 35 casts → 36 fish (gold and silver sunfish now). End: 8 energy, 1,288g before shipping.
  Farming 3 (222 xp), Foraging 1, Fishing 11 (1,575 xp).

### Day 5 (Fri)
- Morning: **2,390g** (+1,102 shipping). The report says "Meadow grass crept into 4 tiles" — those were **night 3's**
  losses. **The overgrowth line is always one morning late** (`OVERGROWN_NEWS` is counted in the `endDay` wrapper after the
  report was already built; it shows the next morning). Night 4 lost 2 more (OVERGROWN_NEWS = 2 waiting for tomorrow).
- **My fence gate vanished overnight-or-afternoon**, and the 2 tiles beside the gateway were lost. Cause (code): a tool
  used on a placed fence or gate picks it up — `useTool` in e_play.js:159 does `delObj` then `give(o.k)`, and for a gate
  `o.k` is `'fgate'`, which isn't an item (the item is `fence_gate`). **The gate is deleted and nothing comes back.** My
  axe walk-clicks through the gateway hit it.
- Turnips (day 1) are ripe on day 5; potatoes and garlic close behind.
- **Harvest:** 13 turnips (2 silver) from the 15 day-1 seeds (1 lost to grass, 1 to my open fence). Mara's Sell tab paid
  45g (silver 52g): **599g**. Cost 15 seeds × 23g = 345g and ~4 days × 30 energy of watering.
- **Scythe harvest drops most clicks**: a left click with the scythe on a ripe turnip that isn't in reach walks you over,
  then says "Cut turnip with your scythe (left click with it selected)" and does nothing (shot 34). 2 of 13 first clicks
  worked; clicking each turnip twice (walk, then cut) got them all. Clicking the tile you're standing on does nothing.
- New Fence Gate (6 wood): placed on the 2-tile gap (32-33,24), it **took the fence piece at 31 (returned) and left 33 open**
  — `putObj` prefers a fence neighbour over the free gap tile. A fence clicked onto (33,24) landed on (33,25) instead (twice
  now a fence lands one tile south of the click). The field still sealed (the gap only opens inward).
- Mara: 15 garlic (495g). Hale: **Well plans 250g** + 15 stone (150g). Mined 11 stone, chopped 11 wood.
- **Built the Well** east of the field: blueprint at the workbench (1 wood, 1 fibre), Place from the hotbar (ghost, "LMB
  place Well"), Deliver (40 materials at once), Hammer: Foundation → finished in ~1 game hour, no energy cost (shot 38).
  Clear and satisfying. RMB on it refills the can.
- Ate 2 grilled fish (10 → 101 energy) for the evening; 26 night casts → 25 carp. Fishing 13. Slept at 1:50 am.
- The bin said 604g, the morning paid 565g. **Carp now sells for 22g (was 30)** after ~80 carp: the demand drop does cap
  fish income, which is good, but the bin estimate and the Sell-tab price don't show it coming.

### Day 6 (Sat)
- Morning: **2,659g**, energy 123 (max went 120 → 123 at Farming 3-4). Farming 4, Foraging 1, Fishing 13, Woodcutting 2.
- Report: "Meadow grass crept into 2 tiles" = night 4's loss (one day late again). Night 5: none (field sealed).
- New story: The Ember Pilgrims (forest shrine in the Wilds). That's 4 of 5 stories pointing into the Wilds.
- Harvested 4 of 5 ripe garlic (one more refused every click); Mara paid 60g / silver 69g = 249g. Rebought 4 garlic (132g).
- Another fence (28,19, the corner) had been picked up by a walk-click; the corner gap happened not to open the field.
- "First harvest" milestone (15 crops): +300g.
- **Ashcombe Signet** (the 5th story) also sends you into the Wilds. **All five stories that start in week 1 need the Wilds.**
- **The request board changed**: on day 2 it wanted 6 Rhubarb for 1,480g (rhubarb takes 12 days, seeds 113g each); by day 6
  it wants "45 Woods for 209g". I bought 678g of rhubarb for a request that was gone before it could ever grow.
- Afternoon/evening: ate 2 grilled fish, 41 casts → 52 fish over the day. Fishing 16. Ended with 40 energy at 8 pm.
  Prices now: carp 22g, sunfish 40g. Bin estimate 1,470g, paid 1,427g.

### Day 7 (Sun)
- Morning: **4,503g**.
