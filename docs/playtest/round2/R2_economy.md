# R2 economy audit (Emberhollow 1.0.0, Test sandbox, port 9302)

Method: Test sandbox (dev mode), prices read from the running game (`sellPrice`, `IT[k].p`, shop rows captured from every
village and town shop window, `artisanFor`, `RC`, `ANIMAL`, `BP`, `plotInfo`). Loops were checked in the real windows:
buy with the shop's buttons, make at the station window, sell in Mara's Sell tab. Shortcuts used: `S.time = 660` (shops
were shut at 6:36), and station windows opened with `openMenu('craft', <station>)` instead of walking to them.
No perks, no demand, base quality unless said.

## Game-breaking

- **Money loop, buy only: Layer Cake.** Kingsbridge stall (2 egg 42, milk 119) + Kingsbridge market (2 flour 49, 2 sugar 32,
  butter 79) = 444g of shop goods; cook at any kitchen; sells for 1,300g at Mara. Tested in the windows: +856g per cake.
  Stock (15 per item per shop per day; flour also at Mara 65) allows ~7-15 cakes a day = 6,000-12,000g/day with no farm.
  Needs the cookbook page (3,250g at Pip) and Cooking 7 (old scale). Shot: R2_economy_1.png (stall: egg 42, milk 119).
- **Money loop, buy only: Harrow / Seed Drill.** 2 iron bars (Kingsbridge forge 159) + 10 wood (Ashford 5) at an anvil =
  368g, sells for 600 (type `implement` sells at full `p`, not half like other placeables). Tested: +282g each (with wood I
  already carried). With bars smelted from Greyhelm ore (5 x 16 + coal 21 = 101) it is 252g -> 600. 7 a day from one forge's
  bar stock = ~1,600g/day. Needs automation tier 2 (1,500g plans).
- **Money loop from day one: Building Hammer.** 6 wood + 4 stone (raw sell value 26g; bought 50g at Ashford/Greyhelm,
  100g at Hale) -> 120g at a workbench, known from the start (`x_hammer.js` forces `recipeKnown`). Type `buildtool` sells at
  full price.
- **Inn hot meal = unlimited energy.** Every town inn sells "Eat a hot meal here" for 40-70g: full health AND full energy,
  repeatable. Energy stops being a daily limit for anything earning more than ~50g per bar (fishing, mining, all crafting).

## Economy

### Crops (per tile per day, one season = 28 days, base quality, seed at Mara's base price, no demand)
Regrowing crops earn 2-4x single-harvest ones. `simPacing` uses `IT.p` and misses the x_fix5 +25% on cheap crops and demand.

| crop | days / regrow | seed | sells | g/tile/day |
|---|---|---|---|---|
| corn (sum+fall) | 12 / 4 | 83 | 82 | 16.1 |
| snowpea (winter) | 6 / 3 | 48 | 60 | 15.4 |
| cranberry | 7 / 5 (x2) | 52 | 64 | 15.3 |
| sunberry | 10 / 3 | 103 | **75 (less than its seed)** | 15.1 |
| grape | 10 / 3 | 55 | 68 | 15.0 |
| hops | 11 / **1** | 17 | 21 | 12.9 |
| strawberry | 8 / 4 | 69 | 68 | 12.1 |
| peapod / blueberry / pepper | | | | 10-11 |
| glacier (winter) | 14 | 217 | 336 | 8.5 |
| redcabbage / tomato / eggplant | | | | 7.6-7.8 |
| turnip / garlic / bokchoy / carrot | 4-5 | | | 5.5-7.3 |
| cabbage / potato / radish / yam | 6-10 | | | 3.2-3.8 |
| wheat / sunflower / tulip | | | | **2.7-3.0** |
| Regional (secret): emberfruit | 14 / 7 | 621 | 612 | **72.8** |
| dragon pepper / mountain berry / sea grape | | | | 52 / 46 / 35 |
| cinder melon, saffron, snow lotus, moonblossom, ice turnip, alpine barley | | | | 11-23 |

simPacing(112) = 32,500g in year one with 30 tiles (6.6k spring, 16k summer); 60k with 80 tiles.

**Demand** cuts mono-cropping hard: each unit sold -0.6%, recovering 15%/day. Selling 10 of one crop a day (40 tiles of
strawberries) settles at -34%. But "All" in a sell list (and the bin) prices the whole stack at one price, so a stack of 300
sells at full price; the drop only shows the next day.

### Animals (sell value of raw product, no genes, Odile's price)
| animal | price | product | g/day | payback |
|---|---|---|---|---|
| chicken | 400 | egg 35/day | 35 | 11 d |
| goat | 1,200 | milk 150 / 2 d | 75 | 16 d |
| cow | 1,500 | milk 85/day | 85 | 18 d |
| pig | 5,000 | truffle 280/day | 280 | 18 d |
| rabbit | 1,200 | wool 220 / 4 d | 55 | 22 d |
| duck | 900 | egg 70 / 2 d | 35 | 26 d |
| sheep | 2,400 | wool 250 / 3 d | 83 | 29 d |
(+3-6 days to adulthood for born young; pig truffle -> truffle oil 1,065 makes a pig ~1,000g/day: one pig = 60 tiles of corn.)

### Artisan markup (sell of product / sell of input)
- Keg: fruit wine x3.0-4.4 (30 h); **hops -> pale ale x14.3 (21 -> 300, 20 h)**, **wheat -> ale x8 (25 -> 200)**, sunberry x6,
  honey -> mead x2.3. Hops regrows daily, so one hops tile feeds a keg forever: ~280g/day per tile+keg (crop tile alone 13).
- Jar: x2.4-4.7 (20 h). Cheese press x2.7 in only 3.3 h (milk 85 -> cheese 230; goat 150 -> 400).
- Loom: wool x1.9, rabbit x3.1, golden fleece x2.2, **yeti fur -> frost cloth x7.5 (120 -> 900)**.
- Oil press: sunflower x1.56 (64 -> 100, barely worth it); truffle x3.8.
- Smoker x2.5 for every fish, except **tuna 336 -> smoked 240 (loss)** and swordfish 576 -> 1,040 (x1.8).
- Artisan inputs can be bought: Kingsbridge stall sells milk 119 (cheese 230: +111 per 3.3 h press), apple 119 / cherry
  104 / plum 106 (wine 240-300, jam 210-250), honey 180 (mead 300). Buy-and-process loops limited by stock (15/day).

### Fishing, foraging, mining: gold per energy point (from the code's costs, base quality)
Energy: 120 at the start. A gathering attempt costs 0.6 and succeeds 30-95% (level vs node, +7% per tool tier); a cast
costs 3 - 0.2 x old fishing level (2.8 at the start, 1 at old level 10); picking a wild flower or mushroom costs 1.
| activity | per unit | energy per unit | g/energy |
|---|---|---|---|
| wood (tree 4-6 + felling bonus) | 3 | ~1.2 | ~2.5 (but 10 wood + stone = a 120g hammer) |
| stone | 2 | ~1.2 | ~2 |
| copper / iron / gold / mythril ore | 6 / 12 / 30 / 65 | ~1.2-1.5 | 4 / 9 / 22 / 45 |
| regional ore (cobalt 90 .. cinder 190) | | ~1.5 | 60-130 |
| fishing, start (carp-perch 24-44) | ~35 | 2.8 | ~12 |
| fishing, late (pike 80 .. sea 300+) | | 1 | 80-500 |
| foraging (dandelion 40 .. moon mushroom 500) | | 1 | 40-250, limited by spawns |
Fishing and foraging pay 5-20x more per energy than mining or chopping in the lowlands. With town hot meals at 40-70g for a
full refill (330 energy in the sandbox), energy has no real cost for anything except raw wood and stone.

### Market stall resale (passive)
The farm stall sells any non-gear item at 1.3x its sell value, 2 sales an hour (4 at weekends) of 1-3 units, 8:00-18:00,
wherever you are: up to ~40 units a weekday. Anything a shop sells at under 1.3x `p` resells at a profit with no work:
every town inn take-away dish (1.1x, e.g. Greyhelm miners' pie 407 -> 494), Mara's bread (116 -> 130), and at standing 50
every town shop item (1.15x, e.g. cobalt bar 782 -> 884, goat cheese ~460 -> 520). Layer cakes (1,300) sell at 1,690 there.

### Crafted and smithed goods (cheapest shop for every ingredient)
Profitable buy -> make -> sell: Building Hammer x2.4, Harrow x1.63 (x2.4 with smelted bars), Seed Drill x1.53, iron bar from
Greyhelm ore x1.19 (+19), wooden sword/spear x1.17, gears x1.13 (x1.78 from a smelted bar), canoe x1.11, silver bar x1.10.
Copper bar x0.98, bread 0.92 (flour 2 x 49 + salt 11 = 109 -> 100), steel bar 0.77. All weapons/armour/rings sell for less
than materials (half price), so `priceMadeGoods` holds for gear. Perks open more: Blacksmith (+20% bars) makes Greyhelm-ore
iron bars +43 each and cobalt bars bought at Greyhelm (838) sell 816 (+34 with rep 50); Gourmet (+20% food) makes every
inn take-away dish (bought at 1.1x `p` x drift) resell at a profit.

### Big purchases (total incl. materials at Hale's prices: wood 10, stone 10, hardwood 58)
| item | gold | with materials | days of 30-tile summer income (~350 g/day) |
|---|---|---|---|
| Cottage | 1,600 + 150 wood 80 stone | 3,900 | 11 |
| Coop | 2,400 | 3,900 | 11 |
| Barn | 5,000 | 8,000 | 23 |
| Stable | 6,000 | 8,700 | 25 |
| Shed / Well / Silo / Stall | 1,200 / 250 / 1,500 (+5 Cu) / 1,600 | | |
| Plots | S 9,400 (soil .84), W 11,700, SW 15,100 | lease 25% + 6%/wk | 27-43 |
| Tool upgrade (each of 6 tools) | Cu 500, Fe 2,000, Au 5,000, Mythril 12,000 (+5 bars) | full mythril set ~117,000 | ~330 |
| Ember Multitool | 30,000 + runes, starmetal, 10 mythril bars | | 85 |
| Briarholt deed | 30,000 | | 85 |
| Horses (Odile) | 1,500 / 4,000 / 9,000 (+140 per gene point, +2,500 per trait) | | 4-26 |
| Automation plans | 1,500 / 6,000 / 15,000 / 40,000 | | |
| Fruit saplings | 643-1,134 (Kingsbridge 835-1,354) | | |
Materials are the cheap part: Hale charges double Ashford/Greyhelm (wood 10 vs 5, stone 10 vs 5, hardwood 58 vs 25).

### Shop systems
- Stock: seeds 40, gear 2, placeables/saplings 4, everything else 15 per item per shop per day; refills overnight.
- Drift: 0.9-1.1 per item per week (`weekDrift`, hashed from id length and first letter, so items with the same length and
  initial drift together).
- Demand: -0.6% per unit sold to -50%, 15% recovery a day. Not applied inside one "All" sale (see above).
- Town shops buy at 1.3x `p` (1.15x at standing 50+), and sell bonuses (Saltmere fish 1.15, Ashford saw 1.15, Greyhelm
  supply 1.1, Kingsbridge market 1.05). **At standing 50 the Saltmere fishmonger sells tuna for 1.15 x 336 x drift and buys
  it back at 1.15 x 336**: profit whenever drift < 1 (this week +36 a tuna, 15 a day).

### Regional markets and towns vs Mara
- Regional seeds cost exactly `IT.p` (Mara-equivalent); their crops are by far the best (emberfruit 73 g/tile/day).
- Region market Sell tab says "Traders up here pay well for food from the lowlands" but pays the normal price (no bonus).
- Saltreach market sells **salt for 5, it sells for 8** anywhere: tiny loop (15 a day, +45g).
- Kingsbridge market seeds are 30% dearer than Mara's; compost cheaper (38 vs 59), growth tonic 85 vs 131.
- Town inns sell take-away food at ~1.06-1.13x its sell price (Greyhelm miners' pie 407 vs 380); the Drowsy Drake charges
  1.8x for the same pie (682).
- Brann sells copper ore at 28 vs Greyhelm 8, coal 37 vs 21.

## Top 10 out-of-line prices
1. Layer Cake 1,300g from 444g of shop ingredients (x2.9; buy-only loop).
2. Hops -> Pale Ale x14 (21 -> 300) with hops regrowing every day.
3. Harrow / Seed Drill 600g (implement sells at full price) from 2 iron bars + wood (252-393g).
4. Building Hammer 120g from 6 wood + 4 stone (raw worth 26g), known from day one.
5. Inn hot meal 40-70g restores all energy and health, unlimited.
6. Yeti fur -> frost cloth x7.5 (120 -> 900).
7. Smoked tuna 240 < raw tuna 336 (and smoked swordfish only x1.8): smoking loses money.
8. Sunberry sells for 75, its seed costs 103; wheat/sunflower/tulip earn under 3 g/tile/day (worthless unless kegged).
9. Pig truffle 280/day (-> truffle oil 1,065): one pig out-earns ~60 crop tiles; ducks and sheep pay back slowest (26-29 d).
10. Hale's materials at double the town price (wood 10 vs 5, hardwood 58 vs 25); Brann's copper ore 28 vs 8.

## Art
Not in scope for this role (no Painterly pass made). Side note: the sandbox's "Test sandbox..." intro dialog stayed open
and drew on top of a shop window (seen in R2_economy_1.png; the window was opened from the console, so it may not happen in
normal play).

## Performance
FPS counter showed 165 fps / 1.4 ms work in the sandbox yard (R2_economy_1.png). No console errors during the session.

## Top 5
1. **Layer Cake buy-only loop:** 444g of Kingsbridge stall + market goods -> 1,300g (tested, +856 each, ~6-12k g/day).
2. **Harrow / Seed Drill loop:** 2 iron bars + wood (252-393g) -> 600g, because implements sell at full price (tested +282).
3. **Building Hammer from day one:** 6 wood + 4 stone (worth 26g, 50g bought) -> 120g; plus inn hot meals (40-70g, full
   energy, unlimited) remove energy as a limit on every gathering/crafting loop.
4. **Hops -> Pale Ale x14** with a daily-regrowing crop (~280g/day per tile+keg vs 13 for the best plain crop); wheat -> ale
   x8; frost cloth x7.5. Meanwhile smoked tuna sells for less than raw tuna, and sunberry sells below its seed.
5. **Market stall + "Sell All":** the stall resells any shop-bought food or (at standing 50) any town item at +13-20% with no
   work, and "All" sells a whole stack at one price, so the demand drop (-0.6%/unit) never applies within a sale.
