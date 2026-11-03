# Round 2: what's open (2026-11-03, after 1.0.0)

Five testers in Painterly on `[::1]`: economy (R2_economy.md), art and world (R2_art_world.md), systems (R2_systems.md), new game days 1-5 (R2_newgame.md) and the kingdom story (R2_kingdom.md). No crashes, broken saves or lost items. The crafted-goods prices were reworked after R2_economy (commit 74d5247) and are left out here.

Left out as intended (see memory): blocked dungeon ladders, field overgrowth, field-click quirks, tracker details, story-place mismatches, mine distance, seeds, watering cost, boss tuning, romance pace, weather.

## 1. Close to game-breaking
- **Empty Throne ch. 4 kills barely count.** A kill only counts if a knight hit that monster within 12 s (`x_story2.js:35`); with decent gear you kill first. The barracks job uses "a knight within 120 px" (`x_realm.js:292`). Use that.
- **Reloading during Ashcombe's welcome loses the tutorial** (`tutWalk` 2, the choice never comes back).
- **Drag-to-place can box you in** or fill a map exit, and it keeps placing while the Satchel is open.

## 2. Economy leaks
- **Foraging pays far more than farming in week one.** Wild flowers give a 40g Dandelion for 1 energy (`pickWild`, x_world.js); Morels 150g, Red Caps 75g; ~665 flowers and ~106 mushrooms in the Wilds, back after 2 days. Gold went 500 → 3,236 by day 4; a turnip tile nets ~22g over 4 days.
- **Greenhouse repair is free** (`c_data.js` `greenhouse.lv[0] = [0, {}, 0]`): crops in every season from week 1.
- **Staircase (27g) and Warp Totem (25g)** sold 15 a day at Greyhelm's Miners' Supply: `p: 0` falls back to 20g. The guild locks the Staircase behind Hewer.
- **Town trade loop:** shops buy at 1.15× and sell at 1.3× (1.15× at 50+ standing) with ±10% weekly drift: ~500g a day on tuna.
- **Market stall** resells at 1.3×; **inn take-away** at 1.1×; **Sell All** ignores the demand drop.
- **Town bring jobs pay less than the goods** (kelp 350g for 700g, pies 650g for 1,140g, iron bars 1,100g for 1,200g).
- **Unlimited inn hot meals** (cheap energy).
- **Artisan multipliers:** hops → ale ~14×; smoked tuna sells below raw tuna.
- Hale's materials cost about twice the towns'; Brann's copper ore is 28g; Mara's Pantry says making your own is cheaper (it no longer is).

## 3. Systems and QoL
- A blueprint in the hotbar does nothing on LMB (only the bag's Place).
- The hammer doesn't open a well with E.
- Removing a build site doesn't return the blueprint.
- A dropped stack flies straight back into the bag.
- A message shows the raw key "tgrass".
- Tutorial: going into Mara's shop before the plaza doesn't count "Say hello to Mara"; the tracker says "Emberhollow Village · 22 m" inside the village.
- Entering the Wilds can put you inside a tree trunk.
- Construction hammering works at 0 energy.

## 4. Painterly art
- **Birches** are blocky enlarged pixel art next to painted trees (farm, Wilds, title screen).
- **Interiors** (town rooms, the keep) are pixel art except the floors.
- **Night windows:** glow misplaced on Mara's store and the tavern in winter, spills over shutters (Kingsbridge) and onto a wall (Highmarch).
- **Stone Troll** has a dark-green box behind it; Briarholt benches are see-through; barracks armour stands have orange spots; the throne dais is a flat grey box; a black shadow blob on Greyhelm's longhouse; a blocky oak at the Briarholt wall.
- **Pier** (Saltmere) reads as a fence; the **Fence Gate** as a table or door frame; the **repaired greenhouse** is a blank glass box outside and a grass patch on planks inside.
- **Ground borders** (cobble/grass, sand/water, dirt paths) are stepped at pixel size; a square grass patch in the village paving.
- Cliffs, lava and some animals still look pixel; flowers bloom on snow; the fountain keeps grass in winter; the well has no snow; the sea shows a tile grid; rain is barely visible.
- Hale's lumber pile sticks out past the wall.

## What worked
Tutorial steps, shops and rooms, the well, drag fences and gates, sleeping, rain, save/quit/load, the whole kingdom story to the council, the siege, guilds, town jobs. Steady ~165 fps (first keep-kitchen entry 118 fps once).
