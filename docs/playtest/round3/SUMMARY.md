# Round 3: what's open after 1.2.0 (2026-11-03)

Four testers on 1.1.0 in `[::1]`: markets (R3_markets.md), a new game to day 14 (R3_newgame.md), the Wilds, caravans and towns
(R3_wilds.md) and Painterly art (R3_art.md). No crashes, softlocks or console errors; saves and reloads kept everything,
markets included. Everything the markets and Wilds testers found was fixed in 1.2.0 (tuna loop, bin at 80%, stall curve,
scarcity rule, caravans vanishing and draw order, trader start, sea goods, region inn rest, crate), and it's left out here.

Left out as intended: watering cost, seed prices, mine distance, boss tuning, romance pace, weather, field overgrowth,
ore blocking dungeon ladders.

## Economy
1. **Foraging still out-earns farming per energy in week one.** A wild flower costs 1 energy and averages ~10g (75% fibre at
   2g, 25% a 40g dandelion): 8-12g per energy with no outlay, against ~2.7g for garlic. Watering cost is intended, so the
   lever is the flower: a lower dandelion chance early, or a cheaper common flower item.
2. **Stone holds up the cottage.** Gold (1,600) and wood (150) were ready by day 9-10, but at Mining 1 the farm's rocks
   gave ~7 stone an hour: 8 of 80 stone by day 14. More stone from farm rocks early, or stone at Hale's (6g) made obvious.
3. Caravans only appear when town stocks are out of balance, so a player who doesn't trade rarely meets one.
4. Check: the bin's "Tonight so far" total and the morning payout once disagreed (1,098g shown, 878g paid) across the
   switch to 80%; probably the old code, but worth confirming they match.

## Painterly art (ranked by how much it hurts the look)
1. **Region towns feel dead:** Port Saltreach has four buildings, a stall with no vendor and nobody about at noon; its square
   is a hard grey rectangle in sand.
2. **Stepped ground borders:** dirt roads, grass/cobble at the village, sand/water at ponds; grey paving "fingers" into the
   village lawn; Wilds cliffs read as stacked green blocks.
3. **Flat roofs in towns:** Greyhelm's turf roofs are flat bright-green rectangles, slate roofs near-black slabs; Kingsbridge too.
4. **Maples (and some birches) look like enlarged pixel art** beside the painted oaks (farm pond, Wilds entry, title).
5. **Briarholt:** the throne room isn't royal (tiny throne, radiator-like pillars, a vast empty chequered floor); the fountain
   benches are see-through.
6. **Greenhouse** (repaired: a blank salmon glass box; ruin: a pixel grid of panes) and the **Stone Troll** (washed out,
   see-through, a strip down its right edge).
7. **Interiors** are pixel art except the floors (Mara's rug and planks, the keep); tilled soil has hard square seams; the
   character creator preview isn't smoothed.
8. Smaller: the Fence Gate reads as a frame; no snow on the well, altar, notice board, tent and greenhouse ruin in winter;
   the sea's wave dashes sit on a grid and shores have no foam; a straight seam in Saltmere's sea; the Saltmere pier has
   no posts; the ice mine reads as brown boulders on grey; the tavern patrons stand in a cluster; the village plaza is bare;
   some Greyhelm windows look lit at 11:00; the caravan wagon has no horse of its own.

## Code
- `h_pixel.js` ~line 339: `if (K > 1) out.hi = K` sits inside a trailing `//` comment, so it never runs (harmless today,
  the one-line-comment trap).

## What worked
The tutorial reload fix, drag-to-place safety, the stall and its trader, gluts that recover and spread, town price
differences, buying stock out and its recovery, the round-2 re-checks (chapter 4 kills, inn limits, delivery jobs), saves
with markets, ~165 fps everywhere at the default zoom.
