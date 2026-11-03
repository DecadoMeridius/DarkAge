# R3_newgame: New game, tutorial and first two weeks (Painterly)

Tester port 9302, `http://[::1]:5173/`, New game with Developer mode off, Painterly art style.

## Game-breaking
- (ok) Reload during Lord Ashcombe's welcome, before answering: back on the title, Continue loads the slot and he walks up the road again and asks "Show me around / I know my way around" again (`S.flags.tutWalk` 1). No problem. Shots R3_newgame_8, _9.
- No console errors in 14 in-game days (`errors` = none every check).
- (not a game bug, for whoever reads the logs) Twice the game dropped back to the title screen mid-session. It lines up with JS files changing on disk during the session (x_market.js etc. at 16:15), i.e. a Vite reload. Continue loaded slot 3 at the last autosave with the bin contents and planted crops intact, so saving held up.
- (ok) Drag-to-place fences next to yourself: a 6-fence line placed on the row under the player, joined correctly; a line drawn through the player's tile skips that tile ("Placed 4"), so you're never boxed in. A drag along the column next to the farm→village exit is refused as a whole with "Not there: keep your own spot and the ways off the map clear." (even the end tiles that aren't the exit). Shots _15, _16, _17.

## Economy
Shortcuts used: `goMap` (via a helper) to hop farm <-> village store, `S.time = 9:00` once to skip waiting for Mara to open, `S.hot[8] = <seed>` instead of dragging seeds onto the hotbar, a helper that does the hoe/seed/can/scythe clicks on tiles with the real mouse.

- Gold each morning: D1 500 (start), D2 170 (+250 from the tutorial note = 420).
- Day 1 start: 500g, 13 turnip + 5 potato seeds. Bought 10 garlic (330g). Day 2 bought 10 more garlic (330g) -> 90g left.
- Spring seed margins at Mara (buy -> "sells for about"): turnip 23 -> 45 in 4 d (+5.5/tile/day), garlic 33 -> 60 in 4 d (+6.75), kale 56 -> 88 in 6 d (+5.3), potato 51 -> 72 in 6 d (+3.5, worst), cabbage 102 -> 152 in 10 d (+5), rhubarb 113 -> 192 in 12 d (+6.6). Garlic is the clear pick; potatoes in the starter kit are a poor crop.
- Energy is the real cap in week 1: sleeping restores the full 120, but each watering costs 2 energy, so watering 28 crops takes ~56 (120 -> 64 every morning). Tilling + planting + watering 22 tiles on day 1 took 120 -> 25. A new player can't run more than ~30-40 tiles in week 1.
- Gold each morning: D1 500, D2 170 (+250 tutorial note -> 420), D3 90 (after 330g of garlic), D4 370 (bin paid 280g forage), D5 610 (bin paid 240g; +300g "First harvest" milestone on harvest -> 910).
- Gold each morning (cont.): D6 1,097 (bin paid 491g), D7 1,247 (480g), D8 1,351 (104g, nothing ripe), D9 1,351 (nothing shipped D8); D9 harvest of 18 garlic -> 1,098g in the bin. With ~30 tiles of garlic and the rest of each day's energy spent chopping, income is ~250-300g/day averaged over week 1, lumpy (every 4th day).
- Wood: chopping at Woodcutting 1 with ~55 spare energy a day gave ~50 wood/day (twigs + oaks + birches). 150 wood for the Cottage took about 3 days of spare energy (D6-D8); stone is slower (7 stone from 66 minutes of rocks on D5).
- **Foraging still out-earns farming per energy in week 1.** Wild flowers cost 1 energy each and give fibre 75% of the time (2g) or a dandelion (40g). Measured in the Wilds by the farm exit: 12 picks -> 12 fibre (24g); 10 -> 8 fibre + 2 dandelion (96g); 30 -> 24 fibre + 6 dandelion (288g, 1 h game time); 27 -> 20 fibre + 7 dandelion (~320g). That's ~8-12g per energy with no outlay. Garlic (the best spring seed) nets 27g per tile per 4 days for ~10 energy (till 2 + 4 waterings at 2 each), so ~2.7g per energy and it ties up seed money. In week 1 the energy left after watering is worth more in the Wilds than on more tiles. The 2-energy watering is what tips it.
- Gold each morning (cont.): D10 1,609 (bin paid 878g), D11 1,793 (494g), D12 1,793, D13 1,793, D14 2,513 (720g for 15 garlic = 48g each, i.e. 80%). Days 11-14 my seed-buying helper failed, so the field went fallow from D13: those numbers understate a real player. Realistic week-2 pace with ~30 tiles of garlic is ~250-300g/day.
- **Cottage and first buildings:** by D9 I had 1,350g and 158 wood; by D14 2,513g and 513 wood but only 8 stone (Cottage: 1,600g + 150 wood + 80 stone). Gold and wood for the Cottage are there around day 9-10; **stone is the bottleneck**: farm rocks gave 7 stone in 66 game minutes at Mining 1. A Coop (2,400g + 100 wood + 50 stone) is about end of week 2. That pace feels fair; the stone rate is the only thing that drags.
- Levels after 14 days: Farming 7, Woodcutting 7, Foraging 3, everything else 1.
- Not tested: inn meals/rests (never needed them on the farm loop) and town markets beyond the village.
- **Shipping bin vs Mara:** both pay the same base price at first (dandelion 40, turnip 45, garlic 60). Selling 8 turnips one by one at Mara paid 45, 45, 45, 45, 44, 44, 44, 44 (small market drop); the bin paid 8 garlic x 60 = 480g flat. So the bin is never worse than Mara for a farmer and needs no trip; Mara's Sell tab had no reason to exist for crops. **After the mid-session reload** (new x_market.js) the bin paid 80%: D10 paid 878g for a bin the window had totalled at 1,098g before the reload (16 garlic + 2 silver), D14 720g for 15 garlic (48 each), and bin rows now show 80% prices. With the new rule, selling in person at Mara pays more, which gives the bin a sensible trade-off. Fine as is; just check the bin's "Tonight so far" total uses the same 80% as the payout (it showed 1,098g, which may have been the old code).

## Art (Painterly)
- **Maples and birches look like enlarged pixel art** next to the soft painted oaks: hard stair-stepped canopy outlines and blocky leaf clusters. Seen at the farm pond (birch at 38,32), in the Wilds just north of the farm (maple and birch near the entry) and on the title backdrop (several blocky canopies top-left). Shots R3_newgame_26, _31, _1.
- **Terrain borders are stair-stepped:** grass/cobble at the village entrance, sand/water at the farm pond and the dirt roads have pixel-step edges in an otherwise painted scene. Shots _18, _25.
- **Rooms:** in Mara's store the green lattice rug is a crisp pixel decal and the floor planks are pixel-sharp beside the painted shelves. Shot _19.
- **Tilled soil** reads as flat square tiles with hard seams; wet and dry halves of a tile pair show a straight seam. Shots _12, _24.
- **Creator preview** (Who are you?) shows a blocky, unsmoothed pixel character in Painterly (CLAUDE.md says it should be smooth in painted styles). Shot _4.
- The ruined greenhouse glass is a regular pixel grid of panes; fine but reads pixel-like. Shot _10.
- Village cobbles, the well, the tent, workbench, notice board, fences, Wilds grass and flowers look good.
- Code note seen while checking: `h_pixel.js` line ~339 has `out.wh = 32;   // the finished frame on the GPU ... if (K > 1) out.hi = K;`. The `if (K > 1) out.hi = K` is hidden inside the comment (the one-line-comment trap CLAUDE.md warns about). Harmless while characters have no styled layers, but it's dead code.

## Performance
- 162-165 fps with 1-5 ms of game work per frame on the farm, village, store interior and Wilds in Painterly; no stutter seen in screenshots.

## Top 5
1. **Foraging beats farming per energy in week 1.** Flowers: 1 energy for ~10g on average (75% fibre at 2g, 25% dandelion at 40g), 8-12g per energy, no outlay. Garlic, the best spring seed, nets ~2.7g per energy, because watering costs 2 energy a tile per day. Farming wins on gold per day only because flowers run out nearby. Cheaper watering (1 energy) or a lower dandelion rate would settle it.
2. **Stone gates the Cottage.** Gold (1,600) and wood (150) are ready around day 9-10, but stone came at ~7 per game hour at Mining 1, so 80 stone is several days of nothing else.
3. **Painterly maples and birches look like enlarged pixel art** (hard stepped canopies) beside the painted oaks: farm pond, Wilds entry, title backdrop. Terrain edges (grass/cobble, sand/water, road) are pixel-stepped too. Shots _26, _31, _18, _25.
4. **Bin and shop price (after the 1.1.0 reload):** the bin now pays 80% (garlic 48 instead of 60), and Mara pays the market price (45, 45, 45, 45, 44... for turnips). That's a fair trade-off. Check that the bin window's "Tonight so far" matches the payout: I saw 1,098g promised and 878g paid across the reload.
5. **Reloading during Ashcombe's welcome and drag-to-place both work:** he walks up and asks again after a reload; fence drags skip your own tile and refuse the farm exit. Small extras: the creator preview isn't smoothed in Painterly, and `h_pixel.js:339` has `if (K > 1) out.hi = K` hidden in a trailing comment.
