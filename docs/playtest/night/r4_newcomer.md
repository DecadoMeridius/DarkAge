# Round 4 newcomer playtest (persona: brand-new player)

Harness on port 9304 (`[::1]:5174`), screenshots `r4s4_*.png` in the playtest scratchpad
(`C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/playtest/`).
About 120 harness commands. Played Mon 1 to Wed 3 morning: creator, letter, tilling, planting, watering, Mara's store, a gift,
workbench craft, campfire (could not cook), tent sleep x2, Wilds, a fight with slimes, Kingsbridge (inn, market stall, waystone),
waystone to the village, Elias (Hollow Crown start), walk home.

## Summary
The first hour looks great and mostly reads well: the letter says what to do, the Getting Started list ticks itself off, crop
tooltips ("Potato · day 0/6 · watered"), seed rows with grow days and sell prices, the waystone menu and the gift feedback
("+20 friendship, 220 to the next heart") are all clear. What hurts a newcomer is **movement and clicking**: the camera
re-centres after every click-walk, so the next click in a batch lands on a different tile; the player gets stuck on bushes,
trees and tree-line pockets (three times in two days); a first Wilds fight against two green slimes took 71 of 100 HP;
and Kingsbridge's gate is easy to miss (the north road dead-ends at a corner tower). Cooking was impossible on days 1-3
because every campfire recipe needs salt, fish, flour, herbs or mushrooms and nothing tells you where to get them.
No JS errors.

## Bugs
1. **Stuck on a bush when entering the Wilds** (Tue 2, ~7:10). Arrived from the farm's north exit standing on top of a small
   bush; holding W for 6 s twice did nothing (r4s4_49, r4s4_51). A/S/D or a click-walk got me out. Spawn point for the
   farm→Wilds warp overlaps a bush (or the bush isn't cleared from the arrival tile).
2. **Stuck in the village's south-west tree pocket** (Tue 2, ~14:10-16:00). Walking west along the south side of Hale's
   Carpentry puts you inside the tree line at the map's SW corner (r4s4_76-80). W does nothing (tree above), a click on open
   cobbles did nothing (no red cross either), D then W got me out only after three tries. Unstick / `openPockets` doesn't seem
   to cover the village tree belt.
3. **Kingsbridge north road leads into a corner tower** (r4s4_59, r4s4_61). The dirt road along the west wall runs north and
   ends at the NW tower; north of it is solid forest. The real west gate is further south and has no visible arch - just a gap
   between a tower and a wall stub, with cobbles (r4s4_62/63). I walked past it once.
4. **Innkeeper "You can't reach that."** (Crowned Stag, r4s4_65). Right-clicking Hollis (behind the counter) from the room
   says you can't reach him and you don't walk there. Right-clicking the counter works. Mara's store had the opposite: E with
   the counter in front did nothing, RMB on Mara worked.
5. **Shop prompt while closed**: at Mara's door at 8:30 the prompt says "E Shop · Mara's Store" and only after pressing it you
   get "closed, open 9 am". The prompt could say "Closed until 9 am".
6. **Planting on your own tile**: clicking the tilled tile you stand on with seeds does nothing (no message). Twice I
   planted into "nothing" because the player had walked onto the tile in the previous click.
7. **Auto-tool switched seeds to the scythe** when a planting click landed on grass (camera moved), so the next clicks cut grass
   instead of planting (r4s4_8, "LMB Cut", slot 6 selected). Confusing when you're holding seeds.
8. **Quest tracker arrow points the wrong way**: "to The Wilds" arrow pointed down-right inside the museum (toward a wall, not
   the door) and down/right next to the tent (r4s4_75, r4s4_83). It also sits over the crops (r4s4_84).
9. **Twig click with the can selected walks to the twig and does nothing** (auto tool leaves the can). For a beginner it just
   looks broken; at least a "need the axe" hint.
10. **Esc after giving a gift opened Options**: the gift window closes itself after the gift, so my Esc opened the Options tab
    (r4s4_29). Minor, but you suddenly see rebinding.
11. **Village map: villagers are unlabelled white dots** (r4s4_16), and the Wilds map labels overlap in towns
    ("Inn / Shop / Kingsbridge / Bank / Forge" pile up, r4s4_45, r4s4_60). "Centre on me" showed no red "you" dot at the
    Kingsbridge wall (r4s4_60).
12. **Text**: request board "Bring 56 Woods" (should be "Wood"). Waystone menu lists "Emberhollow village / Emberhollow Village"
    (name twice, different case). Signpost "Greyhelm → · Ashford ↖ · Saltmere → · Emberhollow ↓" has two "→" for different
    directions.

## Confusing
- **Click batches drift**: every click-walk recentres the camera, so screen coordinates of your field change between clicks.
  Planting/watering 6 tiles took 4-5 tries. Standing still and clicking adjacent tiles works; one tile further does not.
- Village farm exit is only a few tiles tall at the plaza's west edge; walking "west" from anywhere else hits trees.
- The character creator's bottom half is empty (r4s4_2), and the tent "Home" window is a full-screen box for three buttons
  (r4s4_40). Both should be small windows.
- The gift picker shows the hotbar and worn equipment too (r4s4_26), and the item tooltip covers Search/Sort.
- Where do I get salt, flour, herbs? The cooking list shows 12 recipes, none makeable; no hint "Mara's Pantry sells salt".
- Market stall in Kingsbridge sells a **Cheese Press** between apples and jam.
- "LMB Water" on the village cobbles and "LMB Attack" inside the inn: hints for actions that can't happen there.
- The Hollow Crown dialogue: Space advanced so fast I missed most lines (could be my harness pressing).

## First days
- Day 1: new game → creator → letter → farm at 6:00 with 15 seeds, hoe, can, sword. Workbench pops in after a few seconds.
  Till/plant/water is clear thanks to the LMB hint under the hotbar and crop tooltips. Mara opens at 9; I waited and talked to
  passers-by (they walked off before E landed). Bought 5 garlic (165g). Gift of Trail Bread liked (+20). Crafted a wooden
  spear (10 wood). Campfire: nothing cookable. Slept at noon (allowed, fine).
- Day 2: morning report announced The Hollow Crown and the stray pet. Watered, attuned the farm waystone, went north.
- Day 3: crops sprouting nicely (r4s4_84), can at 5/40 after 2 waterings of 6 tiles + earlier use - refill source not obvious.
- Gold: 500 → 335, nothing sold yet; Getting Started still wants "Sell something".

## The Wilds for a beginner
- Arrived stuck on a bush (bug 1). Meadow right outside the farm is pretty: flowers, tall grass, river.
- Two green slimes took me from 100 to 29 HP in about 6 s of hold-to-attack with the wooden sword (r4s4_54-56). I won, but
  a newcomer in their first fight losing 71% HP to slimes feels harsh, especially since only 5 breads exist and inn takeaway
  bread is 111g. Aiming is the problem too: hold-LMB attacks toward the mouse, and the camera moves while you fight, so the
  mouse ends up pointing at empty grass.
- Getting to Kingsbridge: map M is good (towns, roads), and Kingsbridge is just north of the farm. But walking north I hit
  trees, then the west wall, then a dead-end at the NW tower; found the gate by luck (bug 3).
- Kingsbridge itself is lovely: guards, plaza, fountain, stall, inn interior. Inn: hot meal 40g, rest 2 h 120g, takeaway food
  111-1959g (very pricey next to 8g Trail Bread). Waystone attuning is clear ("The rune wakes under your hand"), travel worked.

## QoL wishes
- Don't recentre (or ease) the camera on short click-walks; or let the hover cursor snap to tiles relative to the player.
- "Closed until 9 am" in the door prompt; let talking to a walking villager stop them (they kept walking away).
- A hint line in the kitchen: "Salt: Mara's Pantry. Herbs and mushrooms: forage in the Wilds."
- Gate arches on Kingsbridge (and a road that actually ends at a gate).
- Small windows for the tent, waystones and creator.
- Watering can refill hint on the farm (well/pond).

## Balance
- Green slimes hit too hard for a level-4 newcomer (≈12-15 per hit, several hits per second-ish with two of them).
- Inn takeaway prices (Country Bread 111g vs Trail Bread 8g sell) look 10x off for day-2 money.
- Seeds: turnip 23g → ~45g in 4 days, garlic 33g → ~60g in 4 days: sensible.

## Looks
- Excellent pixel art throughout: farm, greenhouse ruin, village shops with trade signs, Kingsbridge stone buildings, inn and
  museum interiors, crops sprouting. The Kingsbridge west wall reads as a flat grey strip while the north wall has a full face
  (r4s4_57 vs r4s4_61), which looks odd from outside.

## Liked
- The letter and Getting Started list; ticks appear as you do things.
- Seed shop rows with grow days and sell prices; crop hover info.
- Gift feedback with hearts and points to next heart.
- Waystones; map M with towns and roads; town guards and a living plaza.
- Morning report with story hooks.

## Top 5 fixes
1. Stop the player getting stuck: Wilds arrival on a bush; village SW tree pocket; unstick should also help in the village.
2. Kingsbridge gates: visible arches, and roads that lead to them (north road ends at the corner tower).
3. Click accuracy while the camera moves (farm actions and combat aim both suffer).
4. Soften the first meadow enemies (slimes) or give the newcomer more food/healing.
5. Cooking onboarding: at least one recipe makeable from starting/farm items, and say where salt comes from.

## `errors` output
```
none
```
