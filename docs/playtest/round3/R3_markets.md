# R3 markets, traders and stall (port 9301)

Setup: Test sandbox (Developer mode ticked), pixel style; a short New game for the save/reload check.
Shortcuts used are named per finding (endDay / mktDaily for skipping days, setting S.time, goMap).

## Game-breaking
- **Infinite money loop at Finn's Fish (Saltmere): buy tuna, sell it straight back.** With Saltmere standing 50+ (friend price 1.3x), buying Bluefin Tuna with the x5 button
  and selling them back with "All" in the same window nets **+303g per cycle**, repeatable forever without time passing (stock returns to 14 each time).
  5 cycles: bought 10 for 4,030g, sold for 4,333g each time, total +1,515g. At standing 0 (1.45x) the same cycle loses 157g (bought 4,490 / sold 4,333), so it's
  close even then. Two causes: (a) the x5 button charges 5x the price shown *before* the 5 leave the stock (`mktBuyRow`: `p` is computed at render, `orig` charges
  5*p, the price only rises on the redraw), while selling steps the price down unit by unit; (b) Finn pays 15% over (`BONUS.sm_fish`) on goods he also sells, so the
  markup over his buy-back is only 1.3/1.15 = 13%. Low-stock goods (tuna T=14) are the worst because x5 is a big share of the stock.
  Repro: sandbox, `S.realm.rep.saltmere=60` (shortcut), `goMap('in_sm_fish')` at 10:00, Finn's menu, Buy tuna x5 twice, Sell All. Script: p9301_loop.js. Fix idea: price
  multi-buys unit by unit like `mktBulk`, and/or keep BONUS off goods the shop itself sells.

## Economy
- **The shipping bin beats the market for any big load, so markets don't bite.** 300 pumpkins sold at Mara's (village, normal stock 45) paid **45,575g**
  (256g down to the 141g floor, avg 152g). The same 300 in the bin pay a flat **76,800g** (256 each), no glut, no recovery wait. A sensible player bins
  everything big and only sells small amounts in shops, so the glut/recovery system mostly never triggers. Repro: sandbox, `give('pumpkin',300)`, Mara → Sell → All.
  Consider having the bin pay the village market price (or a fixed fraction under base), so selling into a glut costs something whichever way you sell.
- **Buy-in-a-glut, ship-in-the-bin pays.** After the day-8 news "Saltmere has more fish than it can use", Saltmere fish stood at 0.62-0.64x. At friend standing
  I bought 4 tuna, 30 sardines, 30 anchovies at Finn's for **2,742g** and the bin paid **3,024g** next morning (**+282g, +10%**). Bounded by the glut size
  and the price climbing as you buy, so small, but it's a loop the bin's fixed base price creates. Also: tuna Saltmere (friend 350) → Corwin in the village
  (370, +10% for fish) is +20g each at normal stock.
- **Lowland food to region towns: no loop at normal stock.** Every inn take-away / Pip meal costs more than the best region sale (closest: Saltmere grilled
  fish 21 → 19 in Highmarch; Ashford bread 103 → 95). Pip's meals are 2-15x their sell value (grilled fish 220 vs base 15, ale 300 vs 90) — fine, just not a loop.
  Only a region shortage event (stock x0.4 → price capped at 2x) opens a gap, e.g. Ashford mushroom skewer 188 → up to 278 in a short region; small stocks limit it.
- **Same-shop buy/resell elsewhere loses** (good): Kingsbridge stall goat cheese at friend price, 25 bought for 20,025g, sold back for 16,481g (−3,544g);
  Saltmere sardines 30 for 1,245g → 1,159g (−86g). Only Finn's tuna loops (see Game-breaking).
- **Glut and recovery work and spread** (village pumpkins, Next day button in the sandbox banner, stock/normal and price factor):
  day 1 after selling 300: village 345/45 x0.55. Day 2: 182/45, a caravan of 103 pumpkins leaves for Kingsbridge. Day 3: Kingsbridge 146/43 x0.61 (the caravan
  dumped more than it needed: Kingsbridge was briefly glutted worse than the village). Days 4-8: spreads on to Greyhelm (56/18 x0.63 on day 6) and Ashford
  (32/14 x0.61 on day 8), village back to x0.80 on day 8. Nothing stuck at the 0.5 or 2.0 caps, nothing ran out for good (`mktT` has a floor of 3 and stocks
  return 20%/day). One nit: a single caravan can overshoot the target town into a deeper glut than its source had; caravans could stop at the gap.

- **Stall: "sells fast" is barely faster than "sells steadily", so underpricing is a trap.** Sandbox has no stall, so I added a finished one by script
  (`S.structures.push({k:'stall',x:46,y:17,stage:4,...})` + `placeStructure`, shortcut). Melon at 70% ("sells fast", 146g), pumpkin at 100% ("sells steadily",
  212g), kelp at 160% ("hardly sells", 112g), 60/60/20 on display, hours 8-17 on a weekday (stepping `S.time` per hour): **melon 16 sold, pumpkin 19 sold,
  kelp 0**, 5,955g earned. The code gives a sale chance of 1.0 at ≤90% and 0.83 at 100% (`clamp((1.5-mul)/.6)`), so 70% gives up 30% of the money for ~20%
  more sales. 125% ("slowly", 0.42) is where speed really drops. Labels for 125-160% match what I saw. Also: 16 melons at 70% paid ~2,300g; the bin would have paid 3,328g.
- **Stall trader works and pays what the toast says.** With a shortage set by script (`mktSet('greyhelm','melon',2)`, `mktSet('ashford','pumpkin',3)`, shortcut):
  10:00 — "A trader bound for Greyhelm bought 28 melon at your stall for 3,556g": gold +3,556 exactly (127 each, the price at 10:00, 3g under the 130 shown at 9:59
  because passers-by had lowered the village price). 15:00 — 11 pumpkins to Ashford, +1,903g. He walked to the stall, stood, and left; the melons went on as a caravan.
  Note the trader pays *your* price and accepts anything up to 85% of the short town's price (here 354g a melon), so a high price (+) is always better for
  trader sales; the low price only gifts him margin. Shot R3_markets_5.png (trader at the stall, toast).
- **Stall trader appears at the farm's west edge, not on the east road.** `traderWalk` starts him at tile (m.w-2, 18) = x 872, but every time the first reading
  was x 20-100 on row 18 (polled 10:00 and 15:00): he walks the whole width of the farm in a straight line to the stall (path node 1 is (53,18), so he goes
  straight across the farm towards it). Something resets his x to ~0 on spawn (`hx: 0` in the new NPC?).
- **Stall resale of shop-bought goods: no real loop.** Mara's butter 90 → stall cap 160% of village price = 123g, "hardly sells" (5% chance per pick);
  kelp from Saltmere 96 (friend) → village 73. Only a trader in a town shortage pays enough, bounded by that town's gap.
- **Markets tab and shop notes disagree.** Notes on shop rows use 0.8 / 1.25 ("Scarce here" / "Plentiful here"), the notice board uses 0.7 / 1.4. With Saltmere
  fish at 1.29x the board said "Saltmere: Prices as usual" while Finn's rows would say "Plentiful here"; same for village fish at 1.27-1.30x. The board also gives
  no numbers ("Plenty of Pumpkin (cheap)": how cheap?) and shows at most 3 goods, so a "short of farm produce" event shows 3 random crops. Suggest the same
  thresholds, a % ("Pumpkin 55%"), and the note on **sell** rows too (sell rows only show "557g each", the note is only on buy rows, where most trade goods
  can't be bought anyway).
- **News is good and readable** ("A caravan of 103 pumpkin left Emberhollow for Kingsbridge", "Greyhelm is short of farm produce: prices are up there").
  Small text nit: a single good reads "103 pumpkin" (not plural). The morning report never mentions markets; a one-line "Trade news" there would help.

- **Crafting from bought ingredients: no loop worth having.** Every recipe whose ingredients are all sold in shops costs more than its bin value at friend
  prices (copper bar −12g, haft −7g, arrows −12g), except the **Building Hammer: 6 wood + 4 stone ≈ 40g bought, bins for 60g (+20g each)**. Trivial.
- **Model check of same-shop loops** (every good in a shop that pays a bonus, x5 buys then Sell All, friend price): only Finn's tuna is positive (+303g);
  sardine −19, anchovy −8, hardwood −8, wood −10, coal −7, ores −7 to −12, copper ore 0. Script p9301_d.js.
- **Save / reload (normal New game, slot 4 on [::1]):** sold 40 turnips at Mara (1,676g, stock 150→190), set a test stock by script, saved (`saveGame()`),
  reloaded, Continue: `S.mkt` identical, turnip price still 39g. After `endDay()` (shortcut) two caravans were in transit (iron ore to Kingsbridge, forage to
  Cinder Camp); saved, reloaded: both still in `S.mkt.cv` with the same arrival times. No console errors all session (`errors`: none).

## Art
(not in scope)

## Performance
- 165 fps, ~1 ms work in the store, on the farm with the trader walking, and after 9 skipped days; no stutter noticed. `S.mkt.s` stays small
  (stocks within 3% of normal are deleted); one glut event added ~30 entries to two towns.

## Top 5
1. **Infinite gold loop at Finn's Fish:** at Saltmere standing 50+, buy tuna x5 twice and Sell All back = +303g per cycle, forever, no time passing.
   Cause: x5 charges the pre-purchase price for all five, plus Finn's 15% sell bonus on goods he sells himself.
2. **The shipping bin ignores the market:** 300 pumpkins = 45,575g at Mara vs 76,800g in the bin. Big sellers will always bin, so gluts never bite;
   it also makes "buy in a glut, bin at base" pay (+282g on 2,742g of Saltmere fish).
3. **Stall pricing labels mislead:** 70% "sells fast" sold 16 vs 19 at 100% "sells steadily" in a day (the chance is 1.0 vs 0.83), and the trader pays your
   price up to 85% of the short town's price, so low prices only lose money. 160% sold nothing to passers-by.
4. **Markets tab vs shop notes use different thresholds** (0.7/1.4 vs 0.8/1.25): Saltmere fish at 1.29x was "Prices as usual" on the board; the board has no
   numbers, and sell rows have no Scarce/Plentiful note at all.
5. **Stall trader spawns at the farm's west edge** (x≈20-100) instead of the east road and walks straight across the farm; otherwise he buys, pays exactly what
   the toast says, and leaves. Gluts spread sensibly (village → Kingsbridge → Greyhelm/Ashford over a week) and saves keep stocks and caravans.
