# W1 — brand-new player (New game, painterly, days 1-2)

Ran: title → New game → character creator → Lord Ashcombe's welcome ("Show me around") → scythe weeds, till, plant, water,
chop, mine, workbench → walk to the village → meet Mara → buy turnip and garlic seeds → sell hay → back to the farm, till and
plant 6 more tiles → fences around 2 tiles → sleep in the tent → morning report (day 2) → tent note → chop twigs → craft a
Fence Gate → place it → water. Painterly on, FPS counter on. `errors` returned **none** at every check.
Shots: `shots/W1_newplayer_<n>.png` (1-92). Note: I could not view shots 1-49 after taking them, so the notes on the
creator and the first tutorial steps come from the UI text and status line, not from looking at the screen.

## Broken
1. **Space on the last dialogue line also uses the selected item.** On day 2 I advanced the tent-note dialogue with Space while
   holding Fences (slot 7). A fence post was placed in the middle of the farm path in front of me and the toast said
   "Something is in the way." (shot 81, fences went from 3 to 2). Closing a dialogue with Space should not also act in the
   world. Reproduce: hold a placeable, sleep, press Space through the tent note.
2. **The Fence Gate looks like a fence end.** The placed gate is a bare 2-tile wooden doorframe (shots 89-91). The south rail
   my fences drew round the 2-tile plot has the same "∏" frame (shot 90, under the left plot), so you can't tell gate and
   fence apart. The gate's icon in the bag and hotbar is just a thin "∏" glyph (shots 87-88), not a drawn icon like the
   fence's.
3. **No ghost when placing a gate.** With the gate selected, the hint said "LMB Place" but no green/red ghost followed the
   cursor (shot 88). It went down 2 tiles from where I clicked, after walking there.
4. **The axe offers "LMB Chop" on the tent.** Standing at the tent with the axe selected (shot 85) showed "LMB Chop / RMB
   Rest". I didn't click, but either the hint is wrong or you can hit your own tent.
5. **The farm notice board doesn't respond.** RMB and E from its west side (standing beside it, shot 92) opened nothing.
   CLAUDE.md says it shows weather, festivals, birthdays and the request.
6. **Twigs didn't always break.** Four axe clicks on twigs near the path gave wood, but three twigs were still there
   afterwards (shots 84-85). I couldn't tell which ones had been hit.

## Quality of life
- **Tutorial:** it's smooth. Each task is announced after the last one, the tracker arrow with "A New Start · 35 m" is clear,
  and the Getting-started list ticks itself. The ending (sleep → note on the tent → +250g and 3 Trail Bread) is a nice close.
- **Recipe rows move their buttons.** When only one can be made, Make jumps to the far right and x5/x10/x100 disappear
  (shot 86 vs 74). My click on the old Make position did nothing.
- **Far clicks walk, and the camera follows.** So a planned run of clicks (water 5 tiles) drifts: after the first walk every
  later click lands somewhere else, and I watered 1 of 5 tiles and walked across the farm (shot 91). A short "act only if
  in reach" or a queue of tile targets would help.
- **Fences:** a fence post standing alone and the joined pieces read oddly (2 tall posts beside the soil, a doorframe below).
  It's hard to see whether a field is closed.
- The Satchel Quests page shows "Getting started" items 5 and 6 still open after sleeping. Fine, but "Harvest a crop" is
  4+ days away and could say so.
- **Mara:** the shop says she's open "nine till five" (good). The Buy list shows grow days, seasons and sell price, which is
  great for a new player.
- **First trip to the village:** the "Buy more seeds… (east, along the road)" hint and the village map worked; I found the
  store at once.

## Balance
- **Energy:** 120 → 72 by 2:40 pm on day 1 after the full tutorial, about 12 tool actions and a few walks. Generous; I never
  felt short. It's back to 120 in the morning.
- **Gold:** you start with 500g. 5 turnip (115g) and 5 garlic (165g) took me to 220g. Hay sells for 5g, fibre 2g, stone
  2g, wood 3g, so early scraps are worth almost nothing. The tutorial's +250g matters a lot.
- **Seeds:** turnip 23g → ~45g in 4 days is clearly the best. Cabbage 102g → 152g in 10 days and rhubarb 113g → 192g in
  12 days are poor next to it. Potato 51g → 72g in 6 days is weak. Kale 56g → 88g in 6 days is OK.
- **Selling seeds** back gives about half (turnip 11g); fine.
- **Fence Gate:** 6 wood + 2 fibre and **Fence ×4:** 4 wood + 1 fibre are both cheap and reachable on day 2 with twigs.

## Art & feel (Painterly)
- **Farm ground, trees, the vine-covered greenhouse, tent, workbench, campfire and village fountain** look lovely. The
  village is warm and lively, with walkers and lamp posts (shots 50, 52).
- **Village cobbles** have a strong, regular embossed stone repeat across the whole plaza (shot 50); they read as a
  wallpaper texture.
- **Mara's portrait** in the dialogue box is a big, blurry upscaled pixel figure (shots 54-55), soft and smeared next to the
  crisp UI.
- **Mara's store interior** (shot 53) has a stray strip of the back wall and windows floating above the room, cut off in the
  void at the top of the screen.
- **Tilled soil** reads as raised square cushions with hard edges, each tile its own block (shots 67-69), rather than
  furrowed ground.
- **The top of the farm map** has a wide dark band under the tree line (shots 85, 88, 91), like a smeared shadow strip.
- **Characters stay pixel figures** on painted ground (by design). They look fine but plainly a different style.
- **Day 2 at 6:00** has a heavy orange dawn grade (shot 80). OK, but it looks muddy for the first in-game hour.

## Performance
127-130 fps the whole time (farm, village, shop interior), 0.6-3.3 ms work per frame. No stutters noticed, including on map
changes.

## Liked
- The welcome tutorial with Ashcombe walking you through the jobs, and the note on the tent at the end.
- The shop rows showing grow days, seasons and expected sale price.
- The tracker arrow with distance; the village map with the "!" on Mara's store.
- The day-2 morning report: weather, the new story, and Odile's stray-pet hint give clear next goals.
- No console errors at all.

## Top 5 fixes
1. Closing a dialogue with Space must not also use or place the held item (stray fence placed on day 2).
2. Give the Fence Gate its own sprite and icon (a real gate with boards or a latch), and make fence south ends stop looking
   like gates.
3. Show the placement ghost for the Fence Gate (and check other placeables).
4. Make the farm notice board open on RMB/E from any side; fix the axe "Chop" hint on the tent.
5. Keep the Make / x5 / x10 / x100 buttons in fixed positions, and rebalance early seeds (cabbage, rhubarb and potato are
   far behind turnip).
