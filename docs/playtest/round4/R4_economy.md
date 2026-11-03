# Round 4: early economy (1.3.0), tester R4_economy

New game, Developer mode off, Painterly (the default it opened in). Harness on [::1]:5173, port 9301.
Shortcuts used are named inline (`walkTo`, teleports near the tracked target, `S.time`, `endDay`).

## Log

### Day 1 (Mon 1 Spring)
- Start: 500g, 15 turnip seeds, 5 potato seeds, 15 wood, 20 fibre, 5 Trail Bread. Energy 120.
- Tutorial: scythe 6 weeds/grass (6 energy, 5 fibre + 6 hay), till 12 tiles (2 energy each = 24), plant turnips,
  water 11 tiles (2 energy each = 22), chop a tree (6 energy, 5 wood), mine (6 energy, 1 stone), make a Cord Grip.
  By 10:00 energy was 56/120: the tutorial alone uses over half the first day's energy.
- Shortcut: teleported to the village plaza and the store for the "meet Ashcombe" and "meet Mara" steps.
- Mara's seeds (spring): Turnip 23g (sells ~45, 4 d), Garlic 33g (~60, 4 d), Potato 51g (~72, 6 d), Kale 56g (~88, 6 d),
  Cabbage 102g (~152, 10 d), Strawberry 74g (~68, 8 d then every 4), Pea 45g (~51, 9 then 3), Rhubarb 113g (~192, 12 d),
  Tulip 19g (~40, 6 d). Bought 10 garlic: 500 -> 170g.
- Shortcut: `goMap('farm')` back. Tilled 10 more tiles, planted the garlic (hotbar slot set by `S.hot[7]='garlic_seed'`),
  watered. By 12:00 energy was 18/120 and the can (40) was empty.
- Wilds (shortcut: `goMap('wilds')` placed at the farm gate, 130,326), 12 flowers picked within 45 tiles: 12 energy, 29 min.
  4 daisy, 2 bluebell, 2 dandelion, 2 marigold, foxglove, buttercup = 135g at Mara's price.
- Shipping bin: "Tonight so far: 108g" for those 12 = exactly 80% of 135. Morning: "Shipping paid 108g", gold 170 -> 278. **Matches.**

### Day 2 (Tue 2) - 278g in the morning (bin 108g)
- Note on the tent at the end of the tutorial: +250g and 3 Trail Bread -> 528g.
- Watering 22 crops: 44 energy (2 each with the copper can; cost only drops by 0.15 per old 1-10 level) + walks to the pond 28 tiles away.
- Chopping: 3 trees -> 18 wood for 18.6 energy (27 min); later 3 more -> 15 wood for 18.6 energy. ~0.9 wood per energy.
  Wood sells for 3g at Mara: **~2.7g/energy (2.2 in the bin)**.
- Mining: 3 rocks -> 10 stone for 13.2 energy; 6 small stones -> 5 stone for 11.4 energy. Stone sells 2g:
  **~1-1.5g/energy**. Mining on the farm is only worth it for building stone.
- By 9:37 on day 2 energy was 14/120. Ate a Trail Bread (+55 energy, worth 8g; not sold anywhere, 8 from the start + tutorial).
- Wilds forage, 20 picks: only flowers (no dandelion), 124g, 48 min -> **6.2g/energy**.
- Wilds forage, next 20 picks: 3 dandelion (40g), 4 Red Cap (75g each), 1 Morel (150g) -> 646g for 20 energy, 54 min ->
  **32g/energy**. Mushrooms pay 75-150g for one energy point each; there are ~93 mushrooms in the Wilds.
- Sold in person at Mara's: her Sell tab pays the full base price (Red Cap 75, Morel 150, Dandelion 40, flowers 4-8).
  Sold morel, 2 red caps, all flowers: 528 -> 1154g. Shipped 3 red caps: "Tonight so far: 180g" (60 each = 80%).
- 3 more trees: 21 wood + 1 Amber Sap for 23.4 energy.

### Day 3 (Wed 3) - 1,334g in the morning (bin paid 180g, matches)
- Watering 44 energy again. Wilds: 30 picks, all flowers incl. 5 dandelions: 346g, 79 min -> 11.5g/energy.
  Flowers had grown back where I picked the day before (43 flowers, but only 4 mushrooms within 60 tiles of the gate).
- Chopped to 163 wood (7 trees 30 wood/30.6 energy, then 51 wood/61.8 energy after a Trail Bread).
  Note: the farm's border tree line (y 42-43) can't be reached; my first run wasted 131 in-game minutes walking at it.
- Sold the flowers at Mara's: 1,334 -> 1,688g. Bought the Cottage plans from Hale (1,600g) -> 88g.
  **Cottage affordable on day 3 at 15:30** (gold and wood); stone (21/40) is what holds it up, plus the day's energy.
- Blueprint made at the workbench (1 wood, 1 fibre), site placed (the ghost's bottom row sits on the cursor), delivered 150 wood + 21 stone.

### Day 4 (Thu 4, rain) - 88g in the morning (nothing shipped)
- Mined the missing 19 stone on the farm (rocks + small stones, ~28 energy). My first run got stuck swinging/walking at the
  farm's **boulder** (needs a better pick, I assume) for 150 in-game minutes with no message I could see.
- Delivered, hammered: **cottage finished Thu 4 at 11:10** (about 40 min of hammering, 17 energy). Shot R4_economy_9.png.
  Total cost route: 1,600g plans + 150 wood (~160 energy of chopping) + 40 stone (~45 energy).
- Wilds after the cottage: 30 picks, 346g (5 dandelions), 79 min. Shipped them: "Tonight so far: 289g".
  The bin window's rows show the full price ("Dandelion x4, 38g each", "Foxglove x8, 8g each") while the bin pays 80%
  (32 and 6.4). The total line is right; the per-row "each" is not what the bin pays.
- The tent is gone once the cottage is finished; sleeping is now the bed (Home -> Sleep until morning).

### Day 5 (Fri 5) - 377g (bin 289g, matches) -> 677g after harvest (First harvest quest +300g)
- Harvest: 9 turnips, 10 garlic (2 silver), 3 crops still a day behind. Morning routine with 22 crops: 22 energy.
- Wilds near the farm gate: **empty**. Picks only come back 5 days later in the same spot (`S.respawn`), so the ~60
  flowers within reach of the gate were a one-off stock; after day 4 the forage run got 5 picks in an hour, then nothing
  until I teleported (shortcut) to mushrooms 30+ tiles away: 1 Morel + 2 Red Caps = 298g for 3 energy.
- Mara's Sell tab: Garlic 60, Silver 69, Turnip 45, Silver 52, Gold 61 (the base prices are 48 and 36: Mara pays 1.25x
  base for crops, 1.0x for forage). Sold turnips, 3 garlic, mushrooms: 677 -> 1,711g.
- Bought 20 garlic (660g), replanted 16 (+2 tiles tilled). Plant + water 16: ~37 energy.
- Shipped 5 garlic: "Tonight so far: 240g" = 48 each = 80% of Mara's 60. Morning paid 240g. **Matches.**

### Day 6 (Sat 6) - 1,291g. Day 7 (Sun 7) - 1,463g (bin 172g, matches). Day 8 (Mon 8) - 1,617g (bin 154g, matches)
- Watering 16 garlic: 32-35 energy each morning.
- Chopping again: 34 wood for 31.8 energy (Woodcutting 11 by now: still ~1 wood/energy).
- Day 7, 14:30 (`S.time` set forward): the day-2 picks had started to regrow near the gate; 20 picks = 219g.
- `simPacing(28, {tiles: 40})` says 1,647g at day 7. I had 1,463g on day 7 **after** paying 1,600g for the cottage,
  so ~3,000g earned in a week, mostly from foraging.
- Console errors: none all run (`errors` checked on days 2, 4, 8).

## Game-breaking
- None found. No console errors, no stuck states, no lost gold. Bin totals matched the morning payout every night (5 checks).

## Economy

### Gold per energy point (early game, level 1-3 skills, copper tools)
| Activity | g/energy at Mara | g/energy in the bin | Notes |
|---|---|---|---|
| Wild flowers | 5-6 | 4-5 | 4-8g each, 1 energy; ~25 picks per in-game hour |
| Flowers incl. dandelions | 11-12 | 9 | the 12% dandelions (40g) are over half the value |
| Mushrooms | 75-150 | 60-120 | Red Cap 75, Morel 150 (15%), 1 energy each; ~93 in the whole Wilds |
| Garlic (best spring crop) | ~2.5-3 | ~1.4 | 33g seed -> 60g (Mara) / 48g (bin); till 2 + water 2/day x3-4 + harvest 1 = ~10 energy |
| Turnip | ~2 | ~1 | 23g -> 45g / 36g |
| Chopping | ~3 | ~2.4 | ~1 wood per energy, wood 3g |
| Mining (farm rocks) | ~1-1.5 | ~1 | stone 2g; boulders can't be broken with the starting pick |

**Farming is not the better earner in week one, even once a field is running.** Watering at 2 energy per tile per day with
the 1-tile copper can makes each garlic cost ~10 energy for 27g profit at Mara (15g via the bin). Even plain flowers pay 2x
that per energy point, and a single mushroom pays as much as a whole 4-day garlic tile. What keeps foraging in check is
supply, not price: picks regrow only 5 days later in place, so the area within walking range of the farm gate is emptied in
two days. Farming wins only on volume (it scales with tiles and isn't limited by stock) and only after the can upgrade.

### The cottage
- Affordable on **day 3 at 15:30** (1,600g plans + 150 wood) and **finished day 4 at 11:10** after mining the last stone.
- Gold was never the limit (foraging reached 1,688g on day 3). What held it up: **energy** for the 150 wood (~160 energy,
  well over a full day) and stone (40 stone ~45 energy; the farm rocks give 3-4 each, small stones 1 for ~2 energy).
- Feels a bit fast: a cottage on day 4 with no stress, carried by two days of mushroom/dandelion picking.

### Shipping bin vs Mara
- The bin's "Tonight so far" matched the morning payout every time (108, 180, 289, 240, 172, 154g).
- Selling in person pays more: forage at 100% of base (bin 80%), crops at Mara's 1.25x base (garlic 60 vs bin 48). So the
  bin pays 80% of Mara's price for everything. Good incentive, but the bin window's per-row "each" shows the full price, not
  the 80% it pays (small display bug).

### Other observations
- Trail Bread restores 55 energy and is worth 8g; 8 come free (5 start + 3 tutorial). Country Bread (also 55) costs 120g at
  Mara. The free bread is what made day 2-3 work; it isn't sold anywhere.
- The tutorial (till 12, water 11, chop, mine, scythe) spends 64 of the first day's 120 energy by 10:00.
- Watering cost (2 per tile) and the pond 28 tiles from the field dominate the morning; noted, not reported per the brief.

## Art
- Not the focus. The finished cottage and its interior look good (R4_economy_9.png, R4_economy_10.png).

## Performance
- 165 fps throughout (FPS counter on), 0.8-1.3 ms work per frame.

## Top 5
1. **Mushrooms break the early economy**: Red Cap 75g and Morel 150g for 1 energy each (75-150 g/energy) vs ~2.5 g/energy
   for garlic. 4 Red Caps + 1 Morel on day 2 = 450g, more than a 10-tile garlic field nets in 4 days at Mara.
2. **Farming is still not the better earner** once the field runs: garlic ~2.5-3 g/energy at Mara, ~1.4 via the bin, below
   chopping (~3) and plain flowers (5-6). Watering 2 energy/tile with a 1-tile can is the cause; the 33g seed price leaves
   only 15g profit per garlic through the bin.
3. **Cottage done on day 4** (affordable day 3 at 15:30). Gold is no obstacle thanks to foraging; wood (~160 energy) and
   stone are the only gates. Probably faster than intended.
4. **Forage supply is the real limit, not price**: picks regrow in place after 5 days, so the Wilds near the farm gate are
   empty from day 4 to day 7; this makes foraging feel boom-and-bust (500-650g days, then ~60g days).
5. **Bin window rows show full prices** ("Dandelion x4, 38g each") while the bin pays 80% (32g); the "Tonight so far" total
   and the morning payout are correct and matched every night. Selling at Mara pays 25% more (crops: Mara 1.25x base, bin 1.0x).
   Minor: the starting pickaxe can't break the farm's boulder, and an attempt silently burns time.

Not reached: days 9-12 (budget). Shortcuts used: teleports to village/store/Wilds gate/mushrooms (`goMap`, `S.p`),
`walkTo`, `S.hot[7]` for seeds, `S.time` forward once (day 7).
