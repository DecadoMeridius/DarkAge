# Overnight playtest, 2026-11-03: summary

16 AI testers played in Painterly on `[::1]:5173`; your real saves weren't touched.
- Full reports are in this folder (`W1_*`, `W2_*`, `W3_*`); screenshots are in `shots/`.
- No tester saw a game error, apart from a few 404s and 4 "reading 'opts'" errors in W3_farmlife.
- The game ran at 110-131 fps nearly everywhere.

Five testers were stopped early when the usage limit was hit: far regions, the farming-first week, The Hollow Crown, icons and creatures art, and a year in fast-forward. Their reports may be missing or partial; rerun them later.

## Must fix (broken)
Fixed on 2026-11-03: 1-10, 13-18, the fence gate item, Brann's locket (story items now taken when the dialogue ends), the Cinder Drake/Colossus cliff bug and the goMap NaN. Second pass, also fixed: 12 (Kingsbridge plan, inn job boards), belt-jam feedback, meat dish types, pet swap, knockout advice, dialogue portrait size, festivals and birthdays in the morning report, Wilds rock growth in saves, Odile buy confirm, recipe search reset. Third pass: weapon/gather clicks ignore foes you can't reach, E falls back to your facing, food clicks eat, empty-slot clicks pick the tool, full-bag tag, no sandbox quest gold, clean combat test. Fourth pass: melee Cleave/Lunge/Rend reworked for action combat, Whirlwind and Blade Dash stronger, new Earthshatter and Cyclone; recap kill counts, respec label, Learn requirement note, Defence spelling, chore/egg/gift/wedding texts, Block text, town banner on waystone arrival, no night warning in towns, inn wake inside. Fifth pass: Defence level counts in action combat, scythe cuts after walking, bank counts follow search, Enter names the baby, Farewell close button hidden, Family tab age rule, Hale's empty cost text, treasury sealed until owned, off-duty town keepers just talk, wishing well asks first. Not reproduced: fences one tile south of the click. Sixth pass: E talks to someone on top of you, goblin camps empty until day 5 and bandits from day 7, Rimesteel bar at Smithing ~60, coal in region markets, story contradictions (bloodline, six knights, Ashcombe intro, Sigrun, Wren). Balance pass: staff toned down, Forge King softened, region/tough packs 2-3, fish -20% and casts cost more energy. Art pass (code only): smeared standing frames swapped, fruit painted on ripe fruit trees, clay along rivers and lakes, ore rocks 80%. New art: all 47 ripe crops drawn one by one (crops2.py) and five wild flower species (wildflowers.py), in pixel and Painterly. Art pass 2: soil joins into fields, lava under lava bridges, mine rocks and walls per theme, patrons off furniture, keep dais/runners/poles/stairs as smoothed pixel art. Pass 7: signposts no longer read as chests, frost bats hittable, E prefers story objects over flowers, camera clears the dock at map edges, tracker arrows for boss and kill steps. The map (M) can be dragged to pan.
1. **Doubled back wall in every room.** A mirrored copy of the wall floats above each interior. The cause is the mirrored map-edge chunks being drawn indoors too (my 0.9.x change). Seen in W2_art, W2_story, W3_ui and W3_realm.
2. **The Lost Lanterns can't be finished.** Pip's step takes all 3 lanterns, then Hale's step needs 3 again. Story items also drop on the ground when the bag is full, and the step still advances. (W3_story)
3. **The horse cart doesn't work.** It checks `selKind()==='cart'` (s_auto.js:161, 310), so pickups go to the bag and crates never offer "Unload". (W3_farmlife)
4. **Goblin camps never clear.** The `campTick` cleared check looks for camp goblins in `m.ents` after they've been removed, so tribes respawn at once. (W3_combat)
5. **Ash Colossus stuck on a cliff** at (409,59). It hits you but can't be reached. Keep bosses off solid tiles and pull them back within 150 px. (W3_combat)
6. **Enter doesn't press "Start the day".** The Enter handler skips windows that contain `.list`, and in the sandbox the focused Next day button eats it. Every tester hit this.
7. **Space and dialogue keys also use the held item.** It placed a fence and used the hoe. (W1_newplayer, W3_progress)
8. **Nothing is saved when the window closes.** Up to 5 minutes are lost; add a pagehide/beforeunload save and the Electron close. Also, "Save and quit" saves in places where "Save game" refuses. (W2_robust)
9. **Load game list:** each slot's details stack at the bottom of the screen, because `#title small` is absolutely positioned. (W2_robust, W3_ui)
10. **Key bindings popup:** Esc leaves `KEYPOP=1` and the wheel doesn't scroll it. Rebinding allows clashes with no warning.
12. **Kingsbridge W/E gates** were deleted on purpose (x_terrain.js:136), but the main street, guards and lamps still lead into a blank wall. Ashford and Saltmere jobs can't be taken because those towns have no hall.
13. **The Warlord step is blocked for a week after the siege**, because the siege kill starts his weekly timer.
14. **Street-chat window:** Chat gives no friendship and Shop isn't greyed. The likely cause is the wrapper order in x_fix5.js (lines 193 vs 491).
15. **Keepers without a counter don't respond to right-click.** This affects the Brann and town smiths and makes Brann's shop nearly unreachable. An off-duty keeper opens the full shop.
16. **Automation clicks:**
    - Holding a belt piece and clicking upgrades or rotates the belt under you, because `findInteract` runs before `useItem`.
    - The pickaxe can't pick up crates or stations with the mouse.
    - Belts jam silently on an item the next machine won't accept.
17. **The hammer can't move or remove a Well** (`fwell` object).
18. **The Warrens hole sprite** sits one tile above its real tile, and E does nothing.

## Balance
- **Week one is too dangerous and earns too little.** Goblin tribes with an ogre and bandit patrols near the home roads knock a level-3 player out, and each knockout loses the day. The mine is about 200 tiles away with no signs. One run went from 500g to 471g in 5 days. (W3_progress)
- **Early seeds:** turnips beat cabbage, rhubarb and potato by a wide margin. Dandelions (40g) are about as good as turnips.
- **Combat:**
  - The Stone Warden takes 20 s in action mode, against the documented 60 s. Classic mode is far harder.
  - The staff outclasses the sword.
  - The Warlord is trivial, while the Frost Giant and Frostmere dungeon floor 1 are brutal.
  - `PS.def` doesn't rise with Defence.
  - The Pale Lich takes about 3 minutes; the Hollow King's 84-damage hits go through Guard.
- **Horses at Odile's** have no confirm, and the list shifts under the cursor, so a double click buys a second horse.
- **Romance** is a bit fast: married with a baby in about 2 months.

## Art (Painterly)
- **Night window glows are misplaced** on many restyled buildings: shutters, roofs and ivy light up, some windows look lit by day, and winter versions use the summer positions.
- **Characters, portraits and some bosses look like blurry upscaled pixel art.**
  - The dialogue portrait is 256x512, because `storyDialog` uses `spr.width*2` and styled canvases are 4x.
  - Affected sprites: Old Snapper, Frost Giant, Ember Wyrm, Hollow King, the Warlord.
- **3D or slanted pieces:**
  - the throne dais (`dec_dais`);
  - great-hall runners at about 45°;
  - some gables (Hale's, Ashford).
- **Still pixel-looking:** tilled soil (separate cushions), channels, belts, fence posts, implements, the canoe, build sites, crypt pieces, town walls, Greyhelm rails, lava, cliffs as outlined boxes, and stair-stepped biome borders.
- **Leaks:**
  - magenta at the keep entrance and banner poles;
  - blue foam on lava;
  - mossy rocks and brick walls in every mine theme;
  - cyan patches under charwood.
- **Others:**
  - Saltmere signposts look like chests;
  - village cobbles repeat;
  - the flat sea;
  - patrons standing on furniture;
  - the Frost Wraith looks like a map pin;
  - the zombie looks like a villager.

## Quality of life (most requested)
- A drag-to-place tool for fences, channels and belts; far clicks walk you and drift the camera.
- Click intent:
  - A weapon in hand plus any foe within 200 px means swings at air, even across water.
  - A held hoe tills the tiles you walk over.
  - There's no eat key.
- E uses the mouse direction, not your facing, so it misses counters and ladders.
- Tell the player which channel is clogged, why a machine is idle, and what blocks a placement.
- The anvil shows every tier; it should default to "Can make". Recipe search keeps its old text.
- The tracker label sits mid-screen. Its arrow points into Corwin's hut instead of the ferry. Kill steps get no arrow.
- In the Combat test, realm patrols join fights, the bag starts nearly full, and the clock runs into night.
- Story dialogue contradicts the castle household. The treasury can be looted before you own the castle.

## Worked well
- The tutorial, saves, settings and style switching.
- All nine automation lines and breeding.
- Ploughing through gates.
- The canoe, harpoon and crab traps; the building flow; the pet.
- The family chain up to generation 2.
- The guilds, the bank's categories and sort, the story recap (matched every line), dialogue writing (no typos), and steady performance.

## From you (morning notes)
- **Ripe crops should look like the real plant.** Strawberries, for example, look nothing like strawberries. Every grown crop should be recognisable at a glance (see also W3_artdetail: corn/wheat/barley and kale/artichoke/bok choy look alike, and all berries are a bead chain).
- **Flowers should look different from each other.** Each flower needs its own colour and shape.
- **Clay should sit mostly by water.** Clay mounds should spawn mostly along rivers, lakes and shores (`spawnNodes` in `x_world.js`).
- **Ore rocks look too big.** Scale them down relative to the player and the plain rocks.

## Art details (W3_artdetail, rerun)
- **Broken standing frame:** in Painterly, frame 0 (standing) of `stonetroll`, `ogre` and `obsidiangolem` is a garbled smear. The `goblin` frame 0 is sheared.
- **Fruit trees never show fruit** in Painterly: `_f` frames look the same as `_0`. Saplings look like pixel conifers.
- **Meat dishes have type and price swapped** in `I(...)` at `x_world.js:21-25` (roast_poultry, steak, roast_pork, meat_stew, sausage). Raw meats use the dish plate icon.
- **Placeholder looks:**
  - Frost Wraith = a map pin.
  - The zombie and pirate read as villagers.
  - Helmets look like bottles.
  - Every dish is one recoloured plate with a seam.
  - Every ordinary fish is one silhouette.
  - Green slimes and goblins vanish in grass.
- **151 icons are still 32x32 pixel art:** seeds, helmets, cuirasses, machines, implements and some loot.
- **Crops:**
  - share sprites until ripe;
  - root crops shrink when they ripen;
  - several ripe crops are identical.
- **Animals:**
  - The rabbit's tail floats off its body.
  - Chicken legs are broken dashes.
  - Some coats don't match their names: the spotted pig has no spots and the dapple horse is plain.
  - Pets are blurry blobs.
- **People:**
  - Woman and man share one body.
  - The creator preview is blurry.
  - Armour tiers are flat recolours (adamant is hot pink).
  - The horse looks small under the rider.
- **Effects:**
  - Hits flash the enemy flat white.
  - Damage numbers pile up.
  - Cleave and Guard rings are faint.
  - Snow is barely visible.
  - Autumn ground is flat mustard.
  - Flyers get long shadow streaks at noon.
- **Gold:** sandbox gold rose by 55,500 for no known reason (seen twice).

## A year in fast-forward (W3_year, rerun)
- **The save and the Wilds grow forever.**
  - `dailyWorld` adds about 30 rock and ore nodes every night, mined or not: 20,160 → 23,496 Wilds objects in a year.
  - Forage and dig spots are saved in the Wilds delta.
  - The save went from 76 KB to 195 KB in a year, doubled by `_bak`, so localStorage could run out over many years.
- **The morning report leaves out festivals and birthdays.** They only show as toasts hidden under it (`lifeMorning`).
- **Pet adoption:** after adopting the dog, the stale "Adopt the cat" still works with no fish and silently replaces the dog.
- **Festivals all look the same:**
  - same lanterns, flowers and fountain gathering every time;
  - Lantern Night is in daylight, only specks for 3 s, and its text says "pond";
  - the Harvest Fair picks your entry for you;
  - the Ember Feast has no feast, and gave a country bread for a 256g pumpkin.
- **Winter art gaps:**
  - the fountain never freezes;
  - bare trees keep green grass skirts;
  - one house has a pixel-patchy snow roof;
  - the pond shore stays yellow and jagged.
- **Weather and calendar:**
  - The weather is only sun, rain or snow.
  - Aging has no new-year or birthday moment.
  - `S.fam.me.name` stays "You".
  - Blossom Day pays up to 1,680g.
- **What held up:** autosave works; `endDay` takes 25-45 ms and fps stayed at the cap with no memory growth; bandits and story objects stay bounded.

## The Hollow Crown and side stories (W3_crown, rerun)
The Salt Smugglers and The Ashcombe Signet were finished. The Hollow Crown stopped at chapter 6 (the Cinder Drake); The Ember Pilgrims reached chapter 3.
- **Brann's step can strand the main story.** One E took Tomas's Locket and the Warden Heart, showed no dialogue and didn't advance. Afterwards he only says "Still needed…", and the locket can't be got again.
  - Likely cause: `storyTalk` takes the items before the dialogue, and a second `storyDialog` call closes the first with `close(true)`, skipping `done`.
  - The same double call shows on Corwin and the museum keeper.
  - Fix: take the items in `done`.
- **The Cinder Drake gets stuck in a cliff tile** at (137,64) after a charge. It heals 8%/s forever and stays stuck across maps. This is the same class of bug as the Ash Colossus: keep charges off solid tiles and teleport stuck bosses home.
- **Hollow Crown difficulty runs out of order:**
  - The Warden (ch. 2) falls at combat 1.
  - The Forge King (ch. 3) needs combat 60 in cobalt and 40 bread.
  - The Ember Wyrm (ch. 4) is easy at that level.
  - The Cinder Drake (ch. 6) wasn't beaten even at 90.
- **Steps are hard to find:**
  - Boss, kill and shard steps have no tracker target.
  - The Drowned only spawn at night, and the hint doesn't say so.
  - The tracker marks building doors while the person is elsewhere.
  - The story speaks at the manor door but not at the museum or smithy doors.
- **Rewards and dialogue:**
  - The Stag Signet was lost to a full backpack.
  - Ashcombe introduces himself again on day 5.
  - Aldren calls Margit his sister, which clashes with The Empty Throne.
  - Sigrun's "the ice cracked last night" comes the same afternoon.
  - Wren speaks of the wyrm's seal after it's dead.
- **Smaller:**
  - The recap shows "(undefined/6)" and leaves out Quill's choice.
  - E picks flowers instead of the page or person.
  - Places don't match their text: cairn, burned lodge, crates, cold shrine, a ghost that doesn't look like one.
  - Rimehold copies Highmarch Hold's plan.

## Far regions (W3_regions, rerun)
The Saltreach and the Frostmere were done in full: town, all 5 dungeon floors, the world boss, regional bar and gear. The Emberwaste reached its town and dungeon floors 1-4 (lost to the Ash Mother on floor 5).
- **Enemies end up inside dungeon wall tiles.** (Ore blocking the way to the ladder is on purpose.)
- **On small floors the camera clamps the player and boss under the top-right dock.** An attack click opened the Satchel mid-fight, and the fight was lost.
- **An enemy within 200 px, even off screen, swallows gathering clicks silently.** The locked-node hover warns about skill level but not tool tier.
- **A full bag gives almost no feedback.** The toast shows once, drops pile up unseen, and chest loot spills into one heap.
- **Balance:**
  - The overworld is harder than the dungeons: 7-wolf Rime Wolf packs, and wounded wolves heal at home.
  - The Rimesteel bar needs Smithing 70, but its ore only needs Mining 57.
  - Region towns sell no coal, workbench or parts.
  - Dungeon bosses are their ordinary creature at normal size.
- **Kingdom test:** it runs with `SANDBOX = true`, so Get buttons show and every pattern is known. Pattern gating can't be tested there.
- **Painterly:**
  - Rimehold's square is pink-beige dust, not snow.
  - Lava is a pixel checkerboard.
  - Dungeon ores look low-poly.
  - The Molten Vault's walls and floor are nearly the same colour.
- **What held up:** the ferry and waystones, each region's gear chain, boss and chest rewards, and 152-165 fps.

## A safe farming week (W3_farmweek, rerun)
A new game played on the farm and in the village only. Gold went from 500 to 3,444g by day 8, after buying Cottage plans (1,600g) and Well plans (250g).
- **Where the money came from:** fish about 5,000g, crops 1,311g, milestones 900g; seeds cost 2,748g.
- **Levels on day 7:** Farming 5, Fishing 17. No knockouts.
- **A Fence Gate hit with a tool vanishes and gives nothing back.** `e_play.js:159` calls `give(o.k)` with `'fgate'`, but the item is `fence_gate`. Any axe click on a fence also picks it up at once, and walk-clicks with the axe opened the field three times.
- **Field clicks misbehave:**
  - The scythe walks to an out-of-reach crop, then does nothing.
  - Clicks are dropped while walking.
  - Fences land one tile south of the click.
  - Walk-clicks act on arrival: you eat, the hoe tills, a gate gets placed.
  - Placing the last fence clears the hotbar slot.
  - A gate placed on a gap takes the fence beside it and leaves the gap open.
- **Balance:**
  - Pond fishing earns 12-20g per energy against 2-3g for crops, and one Grilled Fish gives 45 energy.
  - Watering 40 tiles takes about 80 energy and 1.5 game hours.
  - The Cottage needs 150 wood and 80 stone, but Hale sells only 15 of each a day.
  - All five stories that start in week 1 need the Wilds.
  - Best week-1 seed: garlic (33 → 60g in 4 days); turnips on a thin purse; strawberries for the season.
- **Shipping bin and request board:**
  - The bin doesn't list its contents, can't give anything back, and offers seeds and food for sale.
  - Its "Tonight so far" total ignores the demand drop.
  - A 12-day rhubarb request was replaced within 4 days.
- **Other:**
  - Hale's Greenhouse row reads "Next: 0g, .".
  - Right-clicking Hale or Brann behind the counter does nothing (seen before).
