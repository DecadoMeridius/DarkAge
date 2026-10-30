# Playtest 3 (2026-10-30): six areas on build 0.5.1

Six AI testers played their own headless Chrome with mouse and keyboard only, about 480 harness commands in total:

| Tester | Played |
|---|---|
| Combat | New game, then Combat test |
| Farming | New game, days 1–5 |
| Animal husbandry | Test sandbox |
| Quests and stories | New game |
| Crafting, building and automation | New game, then sandbox |
| Exploration | New game, then Combat test |

None of them saw a JavaScript error. Each harness command takes about 1 second, so timing-heavy things (parry, dodging) are judged harshly.

## Across several testers
1. **Visibility.** You still lose sight of yourself:
   - Enemies and NPCs stand inside the player sprite.
   - The player vanishes behind village roofs and, in some frames, after hits (the hit blink).
   - Bosses hide behind canopies.
   - The boss bar covers the player at a map edge.
   - Fix: a stronger and permanent separation radius for enemies and NPCs, the outline always shown when covered, and a softer hit blink.
2. **Click and movement interplay.**
   - **With a weapon:** clicking ground never walks you anymore, so you can't click to travel (exploration). Wanted: clicking open ground walks, clicking an enemy or with enemies near attacks.
   - **With a tool:** clicks 2+ tiles away walk you and then act, and you end up standing on the crop.
   - **Empty slot:** a click on a tile in reach opened the Satchel.
   - **Placing objects:** belts and crates don't land on the clicked tile.
   - **Doors and counters:** right-clicking them walks you there without entering or opening.
   - **Unreachable spots:** clicking one gives no feedback.
3. **Getting stuck.**
   - 1-tile cliff notches and tree-blocked gaps in the highland terraces trap you (only the dash gets you out).
   - Weeds and stones block WASD.
   - One tester's WASD stopped working after closing the bag next to a stump.
   - Cliffs don't read as solid: the tops look like grass, and the faces are brick in the wild.
4. **Storage crate:** search doesn't filter, there are no hover names, the grid reflows after taking an item, and one click takes the whole stack. This affects the sandbox supply crate and bank chests.
5. **Text and consistency:**
   - The tent says "Grandmother's cottage".
   - "plans" and "blueprint" are both used for the same thing.
   - Double full stops in the blueprint, staff and robe descriptions.
   - The internal key "ore_gem" leaks into the locked-node label.
   - Both "Fiber" and "fibre".
   - Friends still says "tapping".
   - Stale hints: "LMB Plant/Till" with an empty slot, "LMB Till" indoors or on cobbles, and "Cut … with your scythe" while already using the scythe.
6. **Layout jumps:** the craft progress bar pushes the rows down, the title-screen buttons move once a save exists, and the dialog buttons move between pages.

## Combat
- **Spacing:** enemies still converge on the player tile.
- **Combat test panel:** covers the lives hearts and the target frame.
- **Toasts:** they cover the Z/X/C bar.
- **Difficulty extremes:**
  - Three level-2 slimes take a new player to 9 HP.
  - The Mixed pack (regional mobs) kills a 600-HP character in about 5 s, far deadlier than any boss.
  - Wolf packs die to one Whirlwind.
- **After losing a life:** there's no visible invulnerability, and enemies are still on you. It needs a visible shield or blink.
- **Telegraphs:** boss rings are thin outlines (inside or outside? when?). Use filled zones with a fill-up timer everywhere (the rockfall style read best). Small enemies' wind-up markers were rarely noticed.
- **Loadouts:** the V screen doesn't say which weapon's loadout you're editing, lets you slot skills that don't fit the weapon, and bow and staff default to Cleave/Lunge.
- **Bow and staff:** projectiles are still hard to see, and the bow isn't drawn in the hand.
- **Boss fights:** one pushed the player off the Wilds edge onto the farm, and the next boss then spawned on the farm.
- **Mouse dropdown:** the boss dropdown didn't take a mouse selection (only keyboard).
- **Unexplained damage:** a hooded green figure did unexplained damage on a new game (no health bar).

## Farming
- **Water** is the real limit: the 20-unit can and a far pond. Wanted: an early well, a rain barrel or a bigger can.
- **Crop information:** the shop shows no grow days, season or sell price, crops have no hover info, and all seedlings look the same.
- **Checklist:** "Water your crops" unticks again the next day.
- **Economy:**
  - The starting bread sells for 100g each (an exploit).
  - Turnips barely profit (23g seed, 36g crop).
  - Haft sells for more than its wood (a free profit loop).
- **The road east above the paddock** dead-ends; a signpost at the fork is wanted.
- Enter doesn't press Begin or Start the day.

## Animals and building
- **Blueprint gate:** workbench blueprint recipes show for plans you don't own (Cottage, Shed, Well, Stall).
- **Hotbar ghost:** a used-up blueprint leaves an icon with "0" on the hotbar.
- **Delivering materials:** build sites should take materials from the bank or a crate.
- **Placing blueprints:** they need a "Place" button in the bag.
- **Disabled buttons need reasons:** "Needs a barn", "Grows up in N days".
- **E on counters:** pressing E on Odile's counter does nothing.
- **Closed shops:** they refuse entry, but the docs say you can walk in.
- **Prices:** a cow at 1500 for daily milk vs a goat at 2000 every 2 days looks off.
- **Animal names:** a bought chicken was named "Pip" (a villager).
- **Sandbox:**
  - Pre-built animal buildings, a skip-day button, labelled station signs, and Get ×5 wanted.
  - The supply crate already holds the machines; the intro should say so.
  - Its solid signposts make the yard a maze.
- **Starting money:** 500g can't buy any building plan. Wanted: a cheap starter plan.
- **Around the tent:** there are no resources (the letter promises weeds).

## Quests and stories
- **Day 1:** no story can start and nothing says why. A new story is announced only by a toast that fades.
- **Track:**
  - It stays on a collected page (multi-item steps).
  - The arrow is tiny and points the wrong way.
  - Nothing points across maps.
  - The marker points at the closed museum door instead of Elias.
- **Dialogue:** Space doesn't advance it (only Enter or E do), and it covers the hotbar.
- **Talking to shopkeepers** on the street opens their whole shop. Wanted: a chat line or a Chat/Shop/Gift choice.
- **Gifts:** a liked gift shows no heart progress.
- **"Page 6 of 12"** vs "find 3 pages" is confusing.
- **Requests:** day 1 asks for Wool.
- **Writing:** strong but very short (3 lines from Elias).

## Exploration
- **Cliffs and terraces:** see "Getting stuck" above. The biggest exploration problem.
- **The Wilds map:** too small and not zoomable; no roads, waystones or POI icons.
- **Silent pickups:** flowers and mushrooms, chest contents not listed, opened chests still look closed, and +500g appeared without a message.
- **Mine:**
  - The floor-1 elevator window is huge for one button.
  - Hard to find the ladder down.
  - A gem rock needing Mining 20 on floor 1.
  - Possibly an enemy drawn on a wall.

## What testers liked
- **Look:** the art and interiors; the signposts.
- **Interface:**
  - The encyclopedia, especially "Where it comes from / Used in".
  - Auto-tool, recipe search, Can make, and the capped ×5.
  - Village and farm maps.
  - The Getting started checklist.
- **Discovery:** lore pages and an ember shard starting a story.
- **Building:** the building ghost and staged construction.
- **Animals:** rich animal cards (genes S–D).
- **Combat:** Whirlwind, the Stone Warden's phase 2, and the combat test panel.

## Suggested fix order
1. Visibility and separation (enemies and NPCs), the hit blink, and clear invulnerability after losing a life.
2. Click rules:
   - Ground walks, enemies or nearby enemies attack.
   - Tools stop beside the target.
   - Placements use the cursor tile.
   - Doors and counters act on arrival.
   - Feedback for unreachable spots.
   - No Satchel from world clicks.
3. Terrain: no 1-tile pockets or tree-blocked gaps, solid-looking cliffs (rock faces, no brick in the wild), and corner sliding for weeds and stones.
4. Storage window: working search, hover names, a stable grid, take 1/10/all.
5. Quest Track: multi-item steps, a bigger arrow and cross-map direction, NPC targets, a day-1 hint, story-start announcements, Space advancing dialogue.
6. Farming: water access, crop info (shop and hover), the checklist, the economy (bread, haft), the signpost at the fork.
7. Building and animals: the plan gate on blueprints, the hotbar ghost, delivering from the bank, a Place button, reasons on disabled buttons, a cheap starter plan, resources near the tent.
8. Combat tuning: early slimes, the Mixed pack, filled telegraphs, the loadout per weapon shown in V with sensible defaults, the panel and toasts off the HUD.
9. Text and consistency cleanup; layout jumps.

## Status after the first fix pass (`x_fix3.js`, 2026-10-30)
**Done:**
- Separation ring for enemies and NPCs, outline behind buildings and NPCs, no hit blink, a shield after losing a life.
- Click rules: ground walks with a weapon, an empty slot never opens the Satchel, building clicks go to the door, a red cross for unreachable spots, safer unstick.
- Cliff pockets and gaps plugged by trees or rocks are opened in the Wilds and regions.
- Crate window: search, stable grid, hover names, take 1 / 10 / all.
- Track: journal pages, villagers where they stand, a bigger arrow, the exit toward another map; "Begins on day N" in the journal; new stories in the morning report; Space in dialogue; Enter on the main button.
- Farming: checklist stays ticked, crop info in the shop and on hover, can holds 40, Trail Bread, 250g Well, haft 8g, goat 1200g, signpost, debris around the tent.
- Building: site delivery from the bank, no hotbar ghost, Place button, plan hints in shops, "plans" wording.
- Combat: softer early enemies, loadout named in V, test panel and ability bar moved, sticky craft bar.
- Text: tent text, "Give a gift", no trailing full stops in descriptions.

**Still open:**
- Cliffs and brick faces in the wild still need art (rock faces, darker tops).
- Placement on the cursor tile; doors and counters acting on arrival; E on counters.
- Filled telegraphs with a fill-up timer, the Mixed pack, bow in hand and brighter projectiles, a boss pushing you off the map, the boss dropdown with the mouse.
- Workbench blueprint recipes for plans you don't own, reasons on disabled buttons, animal names that match villagers, sandbox wishes.
- Chat / Shop / Gift choice, gift heart progress, longer dialogue.
- Wilds map (zoom, roads, POI icons), pickup messages for flowers and chests, opened chests looking open, mine floor-1 issues.
- Stale hints, "ore_gem" label, Fiber/fibre, title and dialog button jumps.
