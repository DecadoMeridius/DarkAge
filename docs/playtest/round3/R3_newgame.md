# R3_newgame: New game, tutorial and first two weeks (Painterly)

Tester port 9302, `http://[::1]:5173/`, New game with Developer mode off, Painterly art style.

## Game-breaking
- (ok) Reload during Lord Ashcombe's welcome, before answering: back on the title, Continue loads the slot and he walks up the road again and asks "Show me around / I know my way around" again (`S.flags.tutWalk` 1). No problem. Shots R3_newgame_8, _9.
- (ok) Drag-to-place fences next to yourself: a 6-fence line placed on the row under the player, joined correctly; a line drawn through the player's tile skips that tile ("Placed 4"), so you're never boxed in. A drag along the column next to the farm→village exit is refused as a whole with "Not there: keep your own spot and the ways off the map clear." (even the end tiles that aren't the exit). Shots _15, _16, _17.

## Economy
Shortcuts used: `goMap` (via a helper) to hop farm <-> village store, `S.time = 9:00` once to skip waiting for Mara to open, `S.hot[8] = <seed>` instead of dragging seeds onto the hotbar, a helper that does the hoe/seed/can/scythe clicks on tiles with the real mouse.

- Gold each morning: D1 500 (start), D2 170 (+250 from the tutorial note = 420).
- Day 1 start: 500g, 13 turnip + 5 potato seeds. Bought 10 garlic (330g). Day 2 bought 10 more garlic (330g) -> 90g left.
- Spring seed margins at Mara (buy -> "sells for about"): turnip 23 -> 45 in 4 d (+5.5/tile/day), garlic 33 -> 60 in 4 d (+6.75), kale 56 -> 88 in 6 d (+5.3), potato 51 -> 72 in 6 d (+3.5, worst), cabbage 102 -> 152 in 10 d (+5), rhubarb 113 -> 192 in 12 d (+6.6). Garlic is the clear pick; potatoes in the starter kit are a poor crop.
- Energy is the real cap in week 1: sleeping restores the full 120, but each watering costs 2 energy, so watering 28 crops takes ~56 (120 -> 64 every morning). Tilling + planting + watering 22 tiles on day 1 took 120 -> 25. A new player can't run more than ~30-40 tiles in week 1.
- Gold each morning: D1 500, D2 170 (+250 tutorial note -> 420), D3 90 (after 330g of garlic), D4 370 (bin paid 280g forage), D5 610 (bin paid 240g; +300g "First harvest" milestone on harvest -> 910).
- **Foraging still out-earns farming per energy in week 1.** Wild flowers cost 1 energy each and give fibre 75% of the time (2g) or a dandelion (40g). Measured in the Wilds by the farm exit: 12 picks -> 12 fibre (24g); 10 -> 8 fibre + 2 dandelion (96g); 30 -> 24 fibre + 6 dandelion (288g, 1 h game time); 27 -> 20 fibre + 7 dandelion (~320g). That's ~8-12g per energy with no outlay. Garlic (the best spring seed) nets 27g per tile per 4 days for ~10 energy (till 2 + 4 waterings at 2 each), so ~2.7g per energy and it ties up seed money. In week 1 the energy left after watering is worth more in the Wilds than on more tiles. The 2-energy watering is what tips it.
- **Shipping bin vs Mara:** both pay the same base price at first (dandelion 40, turnip 45, garlic 60). Selling 8 turnips one by one at Mara paid 45, 45, 45, 45, 44, 44, 44, 44 (small market drop); the bin paid 8 garlic x 60 = 480g flat. So the bin is never worse than Mara for a farmer and needs no trip; Mara's Sell tab has no reason to exist for crops except immediate cash (fine, just no trade-off).

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

## Top 5
