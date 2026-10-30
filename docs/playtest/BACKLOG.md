# Backlog: playtest 1 + Sebastiaan's notes (2026-10-30)

Work order: A (bugs and controls) → B (inventory and UI) → C (world content) → D (combat overhaul). Each item gets ticked off here when it's done.

## A. Bugs and controls
- [x] A1 The farm → village exit is invisible. Make a clear gap in the trees, a signpost, a wider trigger and an entry banner.
- [x] A2 The map (M) is empty on the farm and in the village. Add a real layout, a you-are-here marker and shop labels.
- [x] A3 Clicks act on the faced tile, never diagonals. Act on the hovered tile when it's within reach (including diagonals), and fix the fishing reach mismatch.
- [x] A4 The intro letter promises a cottage. Match it to the tent start.
- [x] A5 The HUD recipe button says "C". It should say B.
- [x] A6 Getting stuck on trunks, map edges and the starter workbench. Slide along obstacles and give the workbench a free spot.
- [x] A7 Placing a chest or building on or next to you locks you in. Refuse placements that overlap or wall in the player.
- [x] A8 Options has no Load game and no "back to the title screen".
- [x] A9 There's no way to remove placed buildings. Add demolish (refund part of the materials).
- [x] A10 Boss skills keep firing however far away you are. Bosses should only act when you're near or in their arena.
- [x] A11 Enemies never lose interest. Make them de-aggro and go home when you're far away.
- [x] A12 Bow kills drop no loot.
- [x] A13 Small bugs (done except Track across maps, the duplicate "Haft" name, the stables door path and "Cast / Cast"; the pause "vanishing" was the camera stopping, the player is drawn):
  - the campfire is drawn over your head;
  - the player vanishes on pause;
  - a silent knockout (show the hit and the fall);
  - the request board can't be opened;
  - clicking a locked tree gives no message, and its toast stacks;
  - E doesn't open the workbench;
  - the stables door path is wrong;
  - the default name "Wren" and the name field;
  - the creator shows gold and a close button;
  - tooltips stick after a drag;
  - the Encyclopedia doesn't dim;
  - Track doesn't point across maps;
  - no fishing bite cue;
  - trees grow out of roofs;
  - the sandbox starts without full health and energy, Get moves too little, the signs are blank and there are three intro dialogs;
  - text fixes: old mobile "How to play", "tapping", "1 items", "4 Potato", double full stops, two "Haft" recipes, double craft toasts, "Cast / Cast";
  - the "OO" ligature;
  - "New game" saves before the creator is finished.

## B. Inventory, recipes and UI
- [ ] B1 A search box in the recipe book, station windows, backpack, bank and encyclopedia.
- [ ] B2 A Sort button in the backpack, bank and chests.
- [ ] B3 Clicking an item in the bag shows what it's used for (like the encyclopedia), with a "Recipes" option on right click.
- [ ] B4 Category tabs at the workbench and in the recipe book (Blueprints, Machines, Parts, Tools, Farming...).
- [ ] B5 Onboarding: a short first-day guide, hide late milestones at the start, and stories say how they begin.
- [ ] B6 Shop name signs, a closed notice at the door, a quantity picker and confirmation for purchases, and don't offer to sell seeds.
- [ ] B7 HUD:
  - hide the combat bar when you're not fighting;
  - show the watering-can level;
  - one name for the bag;
  - a wider backpack grid;
  - compact key-binding rows.
- [ ] B8 Balance:
  - the clock runs too fast early;
  - wolves near the farm are level 9;
  - you start with no food;
  - no health regeneration out of combat;
  - a low-HP warning;
  - early requests pay too much;
  - common Woodcutting-10 maples at the start.

## C. World content
- [ ] C1 A pet dog or cat from a quest. It sometimes digs something up overnight and says so in the morning report.
- [ ] C2 Harvestable wild flowers and mushrooms.
- [ ] C3 Nodes for basic resources: clay mounds on beaches, and the same for other basics that have no node yet (sand, flint, salt...).
- [ ] C4 Slaughtering animals for meat, hide, bones and so on, used in recipes.

## D. Combat overhaul (Hades-like feel)
- [ ] D1 Movement: responsive 8-way movement with acceleration, a dash with invulnerability frames and a cooldown, and sliding collision.
- [ ] D2 Direct, directional combat:
  - attack toward the mouse with weapon arcs and combos;
  - charged attacks;
  - ranged attacks aimed at the cursor;
  - hit-stop, knockback and screen shake;
  - telegraphed enemy attacks you can dodge.
- [ ] D3 Enemy AI: approach, wind-up, attack and recover. Ranged enemies keep their distance, and packs flank you.
- [ ] D4 Unique boss mechanics per boss: phases, patterns and arena hazards.
- [ ] D5 Unlockable combat skills in specialisation trees, each with its own visual effects, replacing just Cleave, Lunge and Guard. Add AOE skills.
- [ ] D6 Magic: staffs, spells, mana or Focus, and magic armour (robes) in tiers.
- [ ] D7 Character animation: proper limbs and joints for walking, attacking and dashing, so it doesn't look goofy.
