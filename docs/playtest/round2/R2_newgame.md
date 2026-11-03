# R2_newgame: new player, days 1-5, early economy (port 9301)

## Game-breaking
- None found in days 1-5. No console errors in the whole run (`errors` → none). No stuck states: tutorial, shops, rooms, greenhouse in/out, well build, fence + gate, save → quit → load all worked.
- Tutorial quirk (not breaking): going straight into Mara's shop before the plaza opens the normal shop. The "Say hello to Mara" step only counts after the "go to the plaza" step fires, and the tracker then says "Emberhollow Village · 22 m" while you're in the village. A new player who shops first must walk to the plaza and come back.
- Felling the farm's west tree-line oaks (x = 1) is allowed and leaves a gap. The x = 0 trees still block, so you can't leave the map.

## Economy
- **The greenhouse repair is free on day 1-2.** Hale → Buildings → Upgrades lists "Greenhouse (not built) … Next: no cost. Build". Clicking it says "Greenhouse built!" and sets `S.build.greenhouse = 1` (crops in any season) for 0g and no materials (`c_data.js` `greenhouse.lv[0] = [0, {}, 0]`). Every other building costs 1,200-6,000g in plans plus materials, and the brief says the greenhouse is a ruin to repair, so this looks unintended. Repro: new game, day 2 9:00-17:00, Hale's → Buildings → scroll to Upgrades → Build. (shot R2_newgame_31)
- **Wild flowers are a day-1 money fountain.** In spring every flower in the Hollow Vale meadow gives a Dandelion worth 40g for 1 energy (`pickWild`, x_world.js: it always picks the season's flower from `FORAGE`). The Wilds hold ~665 flowers and they respawn after 2 days. Measured on day 1, right by the village gate: 10 flowers in 26 game minutes and 10 energy = 400g, about 900g per game hour. With 120 energy that's 3-4k g a day from day 1, compared with ~22g profit for a turnip tile over 4 days. The ~0.6%-per-unit demand drop only halves it. Repro: new game → village → north into the Wilds → RMB the flowers by the pond. Suggest flowers at 5-10g, or count picks per day. (shot R2_newgame_25)
- Other forage is also rich next to crops: Wild Leek 60g, Herb 35g. Carp 24g, Sunfish 32g.
- Mara's seeds: turnip 23g → ~45g in 4 days, garlic 33 → 60 in 4 days, potato 51 → 72 in 6 days, kale 56 → 88, cabbage 102 → 152 in 10 days, rhubarb 113 → 192 in 12 days, tulip 19 → 40 in 6 days. Seeds sell back for ~45%. No loops found: copper bar (5 ore at 28g + coal 37g) sells 60g; bread (2 flour at 65g + salt) sells 100g; arrows (20 for 4 wood + 4 stone) sell 1g each; fence 2g, gate 15g, both below their wood.

## Art
- **Birch canopies look like enlarged pixel art in Painterly.** Every birch (white trunk) has a blocky, stepped canopy next to the smoothly painted oaks, maples and pines. It shows on the farm, in the Wilds and on the title screen. Shots R2_newgame_8 (right), _9 (top right), _25 (left), _28 (bottom middle), _32 (two birches by the field), _40 (right), _37 (title, left). It looks like a failed or low-res repaint of `tree_birch*`.
- Terrain borders (cobbles ↔ grass in the village, sand ↔ water at ponds, dirt paths) are staircase-stepped at art-pixel size, and a square grass patch inside the village paving reads as a hard pixel rectangle (shot R2_newgame_27, top middle; _17, _23).
- Fence Gate (painted): a bare post-and-lintel frame that reads as a table or doorway, with no gate leaves (shot R2_newgame_16).
- Repaired greenhouse: outside it's a blank pale-glass box with no glazing bars on the front (shot R2_newgame_38). Inside it's a grass rectangle on a plank floor with no glass walls (shot R2_newgame_39).
- Hale's carpentry room: the stacked lumber pile on the right sticks out past the room's right wall (shot R2_newgame_30).
- Warping into the Wilds from the farm (north exit) on day 3 put the player inside an oak trunk (shot R2_newgame_34). From the village the player lands at a pond with a birch growing through them (shot _25).
- Characters are pixel templates (as designed). The female body picked in the creator looked the same as the male one at play size, short hair (shot _3 vs creator _2).

## Performance
- A flat 164-166 fps everywhere (farm, village, Wilds meadow and forest, rain, rooms), 0.7-1.7 ms work per frame. No stutter noticed.

## Top 5
1. **Wild flowers and mushrooms break the early economy.** 1 energy per pick, dandelions at 40g, morels at 150g, ~665 flowers + ~106 mushrooms in the Wilds that respawn in 2 days. About 900g per game hour on day 1. Gold went 500 → 1,240 → 2,362 → 3,236 by day 4, almost all from foraging. A turnip tile nets ~22g over 4 days.
2. **The greenhouse repair is free** (Hale → Upgrades → Build, 0g and no materials) on day 2, giving crops in every season from week 1 (`c_data.js` greenhouse `lv[0]`).
3. **Birch trees render as blocky pixel art in Painterly** everywhere (farm, Wilds, title).
4. Tutorial order: shopping at Mara's before reaching the plaza doesn't count as "say hello". The tracker label points at the village while you're in it. Not breaking, but confusing for the target audience.
5. Smaller art: stepped pixel edges on cobble/grass/water borders, a gate that looks like a table, a blank-box greenhouse, the lumber pile poking out of Hale's room, and warps landing inside tree trunks.

### Log (day 1)
- New game: 500g, 15 turnip seeds, 5 potato seeds, 15 wood, 20 fibre, 5 Trail Bread. Creator → Ashcombe walk-up → "Show me around" works.
- Tutorial steps scythe → till → plant → water → chop → mine → workbench all advanced (each pops a dialogue that pauses the game; fine).
- Fence x4 (4 wood, 1 fibre), Fence Gate (6 wood, 2 fibre). Drag-to-place along a row and a column works (it silently skips tiles with a twig/stone). Gate placed by click joined to a fence and replaced it (the fence came back to the bag). Walked through the gate: OK.
- Day 1 → day 2 morning: 500g − 165g (5 garlic seeds) + 655g shipped (12 dandelions 480g, leek 60, herb 35, carp 24×2, sunfish 32) = 990g, + 250g from the tutorial's tent note = **1,240g**. Every coin above the start came from foraging, not crops.
- Mushrooms in the Wilds: Red Cap 75g, Morel 150g (silver quality from a first pick). There are 106 on the Wilds map. Same 1-energy pick as the flowers, so they make the flower problem worse.
- The watering can doesn't refill overnight (it was 14/40 after day 1). You have to walk to the pond: fine, but new players might not expect it.
- Day 2: bought the Well plans (250g), crafted the blueprint, placed it, delivered 30 stone and 10 wood, hammered it up. Fine. Hammering works at 0 energy (construction uses no energy). Day 3 morning: 2,362g (day 2: forage sold at Mara's for +1,702g; spent 330g on garlic and 250g on the Well).
- Day 3 (rain): 1 hour of picking in the Wilds plus 5 fish → 874g shipped. Day 4 morning: **3,236g**. Dandelions dropped to 33g after ~50 sold (demand). Fishing on the farm pond: 5 fish (carp, sunfish) in ~40 game minutes, ~140g.
- Gold each morning: D1 500 → D2 1,240 → D3 2,362 → D4 3,236. Crops haven't paid anything yet (turnips are ready on day 5). The cottage (1,600g plans + 150 wood + 80 stone) is affordable on day 2 from foraging alone.
- Save and quit to title → Load game → Tess: gold, bag, 22 soil tiles / 21 crops, 59 fence pieces, the well, the greenhouse flag, plans and tutorial state all match. No console errors.
- Day 5: the first turnips (planted day 1) were ripe. The scythe harvested 6 (one silver) at 45g each: 270g from 138g of seeds over 4 days. Meadow grass had grown into a few field tiles (intended).
- Shortcuts used (only to save commands): `walkTo` for long walks, and setting `S.hot[7]`/`S.hot[8]` to seed packets once (the bag's "Put on hotbar" buttons did the same for fences and the gate).
