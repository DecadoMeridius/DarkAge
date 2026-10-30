# Emberhollow — project brief for Claude Code

Emberhollow is a top-down pixel-art farming, crafting and adventure RPG for Windows. It mixes Stardew Valley's farm and village life with RuneScape's combat and skilling, plus Path of Exile style passive trees. The game code is the earlier 2D mobile version (v3), now being reworked for Windows with new pixel art. Its untouched original is in `reference/v3-mobile-source/`.

Read `docs/GDD.md` for the full design. This file covers how to work in the repo.

## Stack
- Plain JavaScript, **classic scripts sharing globals** (not ES modules), drawing to one 2D canvas. UI is HTML/CSS overlays.
- **Vite 5** serves the game and copies it to `dist/`; it does not bundle (the scripts live in `public/js/`). **Electron 33** + **electron-builder** for the Windows build.
- `npm run dev` runs the game at localhost:5173. `npm run art` redraws all sprites into the atlas. `npm run app` builds and opens it in Electron. `npm run dist` makes the Windows installer and portable .exe.

## Layout
- `index.html`: HUD/menus markup and CSS, then loads `public/js/*.js` in order: `a_core` (canvas, colour, audio helpers), `b_art` / `b1_obj` / `b2_art` (the old painted art), `c_data` (items, crops, NPCs, enemies...), `d_world` (map generation), `e_play` (gameplay), `f_render` (render loop), `g_ui` (menus, `boot()`), `h_pixel` (pixel-art layer), `z_main` (loads the atlas, then calls `boot()`).
- `art/`: Python sprite scripts. `px.py` holds the drawing helpers. Each module in `art/sprites/` exposes `SPRITES = {name: fn}`. `build_atlas.py` draws them all and packs `public/art/atlas.png` + `atlas.json`. Style tests (`style_test.py`, `blacksmith_test.py`) render to `art/out/`.
- `tools/pixelart-mcp-main/`: the local pixelart-mcp library (ramps, form shading, outlines). `npm run art` runs inside its uv environment. `.mcp.json` also exposes it as an MCP server.

## Pixel-art rules
1. **Scale:** 32 art px per tile. World units are unchanged (`TS = 16` per tile), so a sprite is 2 art px per world unit: `PIX.get(name)` returns a canvas with `ww`/`wh` in world units, a drop-in for the painted sprites in `D()`.
2. **Zoom** is always even (`pixZoom`), smoothing is off and the camera snaps to the art-pixel grid. Never draw sprites with smoothing on.
3. **How art replaces old art:** `h_pixel.js` overrides the old sprite functions (`treeImg`, `humanSpr`, `paintChunk`, entries in `SPR`). It uses the atlas sprite when one exists and falls back to the painted art otherwise, so the game always runs mid-conversion. To convert something, add its sprite to `art/sprites/`, give it the name the game looks up, run `npm run art`, and add an override if needed.
4. **Style:** light from the top-left, hue-shifted ramps (`px.ramp` or hand-picked `colors=`), form shading from pixelart-mcp, selective 1px outlines (`Canvas.outline()`), dithered contact shadows. Match `art/out/style_test@4x.png` and `blacksmith_test@5x.png`.
5. **Characters are palette-swapped:** `art/sprites/human.py` draws layers in channel codes RGB(255, channel, level). `humanSpr` in `h_pixel.js` composites the layers and swaps codes for ramps built from the character's palette. New outfit pieces = a new channel + layer, not new colours.
6. **Ground** is painted per chunk at art-pixel resolution from 64x64 seamless textures (`ground_<key>_<season>`), with a lit rim and a dark lip on terrain edges and foam on shores.
7. **Anything solid must look solid.** Cliff tiles (`r`, and `x` outside rooms) are drawn as raised ground over the whole block (`cliffTop`: darker top, rock side walls, lit far edge, loose stones), not only their front face. When adding a solid tile type or object, make sure it has a visible sprite or treatment, or players hit invisible walls.

## Buildings and interiors
- Exteriors (Phase 10): `art/sprites/buildings.py` draws `bld_<kind>_<w>x<h>` for every building the maps place; `buildingSpr` in `public/js/i_interior.js` uses them (chimney position comes from the atlas `meta`). Each building is a recipe in `STY`: a roof form (`side` gable, `hip`, `front` gable, `gambrel`), roof and wall materials (shingle, slate, thatch, glass; plaster, timber frame, stone, ashlar, boards, batten, logs, brick) and extras (cross gable, dormers, porch, portico, cupola, chimneys that sit on the roof, shutters, flower boxes, signs, props). Roofs overhang the walls with a fascia and a cast shadow; doors are ~46 art px so they fit a character.
- Coop, barn and stable have upgrade looks `..._l2` to `_l4` (`level_style`: windows and painted trim, then stone footing and a cupola, then a weathervane, lanterns and flower boxes). `buildingSpr` picks the one for `S.build[kind]`, and opening Hale's build menu refreshes the farm's sprites.
- Footprint tiles a sprite barely covers (the empty top corners of front-gabled roofs) are left walkable by the `addB` wrapper in `i_interior.js`.
- Interiors: `ROOMS` in `i_interior.js` lays out a room per door action (farmhouse, coop, barn, stable, store, smithy, tavern, stables, carpenter, museum, fisher hut). The door now walks you in (map id `in_<act>`); the counter, bed, trough or shopkeeper inside opens the menu the door used to. Rooms are rebuilt on entry and never saved. Furniture is `furn_<kind>` objects from `art/sprites/interior.py`; rugs, windows and banners are decals painted into the room chunks. Cottages and the frost cabin still only "knock"; the greenhouse keeps its own map.

## Art status
Everything in the world is pixel art from the atlas: ground, trees, rocks, props, buildings, rooms, crops and soil, people, animals, enemies and bosses, and item icons. Crops, animals, enemies and icons are palette-swap templates (`pixSwap` / `pixTemplate` in `h_pixel.js`), recoloured from the colours in `c_data.js`. The painted functions remain only as fallbacks.

## Time of day and weather (no lighting system)
There is no light map. `pixGrade` in `h_pixel.js` multiplies the frame by one flat colour: night blue, dawn pink, clear day, evening amber (keyframes in `GRADE_KEYS`), plus a rain or snow tint; mines get a dim warm grade and rooms a faint warm one. Keep it flat: no gradients, light holes, vignettes or dithering, which blur the pixel art. Shadows are hard-edged pixel ellipses (`shadow()`), particles and smoke are pixel squares.

## Characters
`art/sprites/human.py` draws natural proportions (about 4.5 heads tall) with flat cel shading; outlines are selective (each edge a darker shade of its neighbour). Heads are row tables (`HEAD_ROWS_F/S`: rounded crown, tapered chin and jaw), torsos come from `torso_f`/`torso_s` (sloped shoulders, waist, hips) with a `belt_line`, the hair cap has a ragged fringe and strand highlights; the frame and head box are unchanged, so helmets, armour and hair styles still fit. `art/preview_char.py` renders the template. The character creator (`public/js/k_creator.js`) opens before the arrival letter on a new game and from Options → Change appearance; the look is saved in `S.look` (older saves fall back to `DEFAULT_LOOK`).

## PC UI and controls
`public/css/pc.css` restyles the HUD and windows (hard-edged wood-and-parchment frames). `public/js/j_pc.js` replaces the touch input: the character faces the mouse; LMB uses the selected tool/weapon (hold to repeat), RMB or E interacts, wheel / 1-0 pick a hotbar slot, Shift dodges, R rides, I bag, B recipe book, T/Tab passive tree, Z/X/C abilities, K skills, N animals, P friends, O collections, M map, J quests, Esc closes or opens options, H hides the key help. A dashed cursor marks the tile your next action hits; hovering hotbar slots shows tooltips.

## Rules for working here
1. Keep the game runnable after every change. `npm run dev` must load without console errors.
2. Build in the phase order in `docs/GDD.md`. Finish a phase's acceptance checklist before starting the next.
3. All art is generated by the scripts in `art/`. Don't add external images unless the user supplies them.
4. Performance budget: 60 fps at 1080p on a mid-range laptop. Cache composed sprites and painted chunks; never rebuild per frame.
5. Ask before deleting or renaming the user's save files or changing the save format without a migration.
6. When porting from `reference/`, translate the data, not the old painted rendering code.

## Core systems (`public/js/m_core.js`)
- **Game tick:** `EVT.on('tick', n => ...)` fires every 0.6 s of unpaused time. Put RuneScape-style gameplay (combat rounds, skilling actions, growth timers) on the tick; keep rendering and movement per frame.
- **Event bus:** `EVT.on / off / emit`. Fired so far: `tick`, `map` (id), `arrive` (tx, ty).
- **Click-to-move:** clicking out of reach walks there on an A* path over the tile grid (`findPath`, 8 directions, no corner cutting). If you clicked something (object, crop, water, creature, person) you stop beside it, face it and act: LMB uses the selected tool/item/weapon, RMB interacts. In reach, clicks act immediately. WASD cancels the walk.
- **Item-on-item:** right click → Use in the backpack, then click another item; a workbench recipe (you must be at a workbench) with exactly those two ingredients is crafted (`comboRecipe`).

## Combat (`public/js/n_combat.js`, design doc Phase 2)
- **Skills:** `S.csk` holds Melee, Ranged, Magic, Defence, Constitution (1-99, RuneScape XP table `XPT`). Combat level = sum / 3 (also mirrored into `S.sk.combat.l` for old code). Constitution x10 = base health. Old 1-10 combat progress is migrated once (`ensureCombat`).
- **Fighting:** clicking an enemy sets `TARGET`; you walk into weapon range and auto-attack every `PS.ticks` (dagger 3, sword/bow 4, spear 5, warhammer 6) on the game tick. `rollHit`: accuracy vs enemy defence, then damage 1..`PS.maxHit`. Hit splats: red hit, blue miss, gold crit, green heal, purple bleed. Enemies in melee range attack on ticks too (`enemyTick`); their old per-frame touch damage is filtered out, while projectiles and boss telegraphs still hit in real time. Being hit with no target auto-retaliates.
- **Focus & abilities:** Focus (0-100) builds per hit; abilities in three slots on **Z / X / C** (crafting moved to **B**): Cleave, Lunge, Guard, plus Rend, Volley and Second Wind unlocked from the tree. Slots are chosen in the tree tab.
- **Passive tree:** `PTREE` / `PTREE_LINKS`, 40 nodes in Might / Precision / Arcana with small nodes, notables, keystones (Berserker, Deadeye, Overflow) and ability unlocks. One point per combat level above 3. Opened with **T** or **Tab**. Respec costs 250g per point, only at the village altar.
- **Gear requirements:** weapons need Melee (bows Ranged), armour needs Defence, by tier (`TIER_REQ_RS`: wood, leather and copper 1, iron 10, steel 20 … starforged 80).
- **Balance reference:** Stone Warden (mine floor 10) vs Melee 20 / Defence 15 / Constitution 20 in full iron: about 60 s, ~14 bread if you never dodge, fewer if you dodge the slams and rock rings. Bosses use `BOSS_HP_MULT` (0.5) on their old health; their tick melee is light (every 5 ticks, 0.8× attack) because their telegraphed moves are meant to be the real threat. Re-run this fight after changing combat numbers.

## Skilling and stations (`public/js/o_skills.js`, design doc Phase 3)
- **Levels 1-99:** life skills keep total XP in `S.sk[k].tx` and the 1-99 level in `S.sk[k].L`. `S.sk[k].l` is still the old 1-10 scale (`1 + floor(L/10)`) so older gates keep working; requirements display on the 1-99 scale (`oldToRS`). XP grants use the original amounts (`XP_MULT` 1) and are scaled by level in `t_balance.js` (`xpScale`). Crafting is a new skill (tanning, jewellery, field-kit work).
- **Passive picks:** every 10 levels a locked window offers 1 of 3 passives (`pickOpts`): the original specialties at 10 and 20, then Swift Hands / Bountiful / Studious (`perkCount` reads them).
- **Gathering on ticks:** axe/pickaxe on a node starts `GATHER`; each tick rolls success (level vs `NODE_REQ`/`TREE_REQ`, tool tier, Swift Hands). Each success puts one unit in the backpack; the node depletes after its old drop count, then the old break-up logic runs for extras (stump, hardwood, ladders). Rocks and ores in the Wilds and the regions respawn after a day (`S.respawn`); felled trees leave a stump that regrows in 5 nights in the village, the Wilds and every region (not on your farm), and a dug-out stump in the wild grows back in 5 days. Respawns for a region that isn't loaded wait for it. Moving cancels.
- **Stations:** furnace (bars: smithy forge or a built forge), anvil (weapons/armour: smithy anvil or a built anvil), tanning rack (leather and leather gear; built), kitchen (stove, fireplace, campfire, tavern), field kit (anywhere). Making things at a station is a timed batch on ticks (`JOB_TICKS`); moving cancels.
- **Acceptance path (tested):** chop logs → mine copper → smelt copper bars at a furnace → smith a copper sword at an anvil → equip it; the equipped weapon is drawn in the character's hand.
- Not done yet: 99 mastery capes and keystones, respec of skill passives.

## Construction (`public/js/p_build.js`, design doc Phase 4)
- **Nothing pre-built:** new games start with a tent (rest and save) and a campfire; the greenhouse stays a ruin to repair. Player buildings live in `S.structures` and are re-placed on the farm every time it is generated. Saves from before this keep their farmhouse, coop, barn and stable as finished structures (migrated once in `genFarm`).
- **Blueprints (`BP`)**: plans bought from Hale (Carpenter → Buildings), then blueprints made at a workbench (see `x_blueprints.js` below): Cottage (farmhouse, placed anywhere, replaces the tent when finished), Coop, Barn, Stable, Storage Shed (bank chest on the farm), Well (refills the watering can), Silo. The old upgrade list now only shows buildings that exist (it used to build level 1 for free).
- **Placement:** a ghost follows the cursor, green where it fits and red where it doesn't (no water, soil, objects or buildings, and the tile row in front kept clear). LMB places, RMB or Esc cancels.
- **Build sites:** interact to deliver materials from the backpack, then Hammer. Work runs on the game tick through Foundation, Frame, Walls, Roof (`siteSprite` reveals the finished sprite in stages with timber scaffolding), then the site becomes the real building and `S.build[...]` is set. Construction is a new life skill trained by hammering. Moving stops the work.
- **Paths:** Stone Path and Gravel Path (workbench) paint farm tiles; stored in `S.paths`.
- **Farming** keeps its daily growth (watered crops age one day each morning, seasons gate planting); tested plant → water → harvest.
- Not done yet: building upgrades through construction (levels 2+ still use the old instant upgrade), rotating placements, farmhouse beyond the cottage, silo and greenhouse as build sites.

## Land and economy (`public/js/q_land.js`, design doc Phase 5)
- **Plots:** West, South and South-west of the farm (`PLOTS`). `plotInfo(k)` derives everything from the world seed + grid position: type (meadow, woodland, rocky, lakeside, hillside, marsh; the West plot is always lakeside), soil quality (multiplies crop growth), resources, price and 0-2 features (ruin with a loot chest, hot spring that restores energy, fairy ring, ancient tree), some hidden until surveyed. Each plot is its own farm map `plot_<dir>` (in `PERSIST`, saved like the farm). Owning one opens a gap in the farm's tree line with a warp; plot-to-plot exits only open into land you own.
- **Landowner:** Lord Ashcombe's manor in the village (`addB(..., 'manor', 'landowner')`). Deeds show a mini-map, soil, resources, known features and price. Buy outright, lease (25% down, 6% a week; missing a payment closes the plot again), survey (4%), or buy out a lease. Ownership is `S.land`.
- **Shops:** every `buyRow` list has stock per shop (`S.stock`, refilled each morning) and a weekly price drift (±10%). Selling lowers that item's price ~0.6% per unit (to at most −50%), recovering 15% a day (`S.demand`, `S.shipSnap`, `econDaily` after `endDay`).
- **Market stall:** a blueprint from Hale (60 wood, 2 cloth). Interact to put goods on display; from 8:00 to 18:00 it sells a few items per hour at 130% of the going price, twice as many at weekends (`S.stall`).
- Tested: buy the lakeside plot → walk west through the opened fence line → fish a carp in its pond.

## Village life (`public/js/r_life.js`, design doc Phase 6)
- **Schedules:** `SCHED` gives each villager [minute, place] entries; a place is a village tile, `'shop'` (inside behind the counter) or `'home'` (hidden). `lifeTick` (every 5 ticks) filters `village.npcs` from `allNpcs` and sends walkers along `findPath`; `npcWalk` moves them per frame. Keepers only stand in a shop room during its hours.
- **Opening hours:** `HOURS` per door action. Outside them the door stays shut and says when it opens. Shops are shut on festival days (the tavern stays open).
- **Festivals (`FEST`, one per season):** Blossom Day (Spring 13, egg hunt until noon, 120g per egg), Lantern Night (Summer 11, release lanterns at dusk: friendship with everyone), Harvest Fair (Fall 16, your most valuable crop/fish/artisan good is judged for up to 3000g), Ember Feast (Winter 25, every gift gets one back). The village gets lanterns and flowers (flagged `fest`, cleared next morning) and everyone gathers in the plaza from 9:00. Talk to any villager for the activity.
- **Birthdays (`BDAY`):** announced in the morning; a gift that day counts triple. The Friends tab lists birthdays and the next festival.
- **Animals and genetics** are the original system: buy at Odile's, Breed on one animal then Pair on a mate, offspring average their parents' genes plus luck. Tested: two chickens → pregnancy → chick with graded genes.
- Not done yet: heart events and NPC indoor routines (homes have no interiors).

## The Wilds, mines and world bosses (design doc Phase 7)
These come from the original game and were checked against the rebuilt systems: the 200x150 Wilds (six biomes, 21 points of interest including caves, shrines, ruins, a wreck, the merchant and the mine), mine floors as separate generated maps with ladders and themes (earth/ice/magma/void, bosses every 10th floor), and four world-boss arenas (Bandit Warlord, Old Snapper, Frost Giant, Ash Colossus). Ground chunks are painted on demand and cached as you move (4-12 ms per chunk); running across the Wilds measured ~165 fps at 1889x1206 (p95 6 ms). Fixed in this phase: invisible cliff walls (see pixel-art rule 7) and the highlands' rocky ground, which used a paving texture (`ground_st` is now natural rock).

## Automation (`public/js/s_auto.js`, design doc Phase 8)
- **Belts:** Conveyor (faces the way you face, interact to rotate clockwise), Sorter (interact holding an item to set its filter: matches go straight, the rest turn right), Splitter (alternates straight / right). Belts move one tile per tick when powered; items are baked into the belt sprite (`beltSprite`) so they sit on the floor under the player.
- **Storage:** Storage Crate. Belts pointing in fill it; it pushes onto any adjacent belt pointing away, round-robin over its contents.
- **Stations** (input + output slots, `CAP` 40 per stack): Smelter (ore → bars, fuel), Charcoal Kiln (wood → charcoal, fuel), Bread Oven (flour → bread, fuel), Mill (wheat → flour, hay → fibre, power), Compost Bin (fibre → compost), Trip Hammer (power; set it to any anvil recipe and it smiths that from bars). The artisan machines (keg, jar, cheese press, loom, oil press, smoker) also take inputs from belts and push finished goods onto belts.
- **Fuel:** `FUEL` burn ticks: wood 8, hardwood 14, charcoal 24, coal 36. Belts insert inputs first, then fuel.
- **Power** within 7 tiles: Windmill (always), Waterwheel (must touch water), Treadwheel (runs while fed hay, 1 hay per 20 ticks).
- **Water channels:** a channel touching water or a well carries water along connected channels; soil next to a wet channel is watered every morning (`waterFromChannels`).
- **Horse tools** (`x_implements.js`): set down on the farm as an `impl` object, hitched while riding (`S.hitch = { k, on }`), drawn behind the horse with traces (`impl_<k>.0/.1` in `art/sprites/implements.py`), G lowers/raises, E with nothing in front or the bar's Unhitch leaves it standing, dismounting unhitches. `implementTick` and the cart run through `asKind` (borrows `selKind`, now a `let`). Plough (tills 3 wide), Seed Drill (sows the first in-season seed you carry), Harrow (clears weeds and grass in the 3-wide strip ahead), Cart (what you pick up goes into a 400-item cart; interact with a crate to unload).
- **Simulation:** `autoTick` every game tick on the farm and owned plots even while you're elsewhere; `endDay` runs 300 catch-up ticks for the night. Placed pieces return their contents when picked up with the pickaxe.
- Tested: ore line (crate → smelter → crate, while away), wheat → mill → oven → bread on treadwheel power, keg loaded and emptied by belts, trip hammer → splitter into two crates, channel watering, cart load/unload, plough, seed drill and harrow.

## Balance (`public/js/t_balance.js`, design doc Phase 9)
- Loaded after `s_auto.js`; it overrides prices, costs and curves in one place, so retune here rather than in the data files. `BALANCE_TARGETS` lists what a player should have per season.
- **Quality:** one curve, `qualityRoll(L, bonus)`, for crops, forage, fish and fruit (animals: `animalQ`). Gold is ~16% of harvests at level 99 (~25% with rich compost); ember needs level 80+ and the best fertiliser. `QMULT` is 1 / 1.15 / 1.35 / 1.7.
- **Prices and costs:** crops -20% (regrowing -32%), seeds +15%, animal products cut so animals pay back in 3-4 weeks; buildings ~1.6x (`BP_GOLD`), tool upgrades iron 2000 / gold 5000 / mythril 12000; price perks +10-20%.
- **XP:** `xpScale(L)` multiplies XP above level 10 so one skill takes ~1h to 10, 5h to 30, 18h to 50, 50h to 70, ~200h to 99. Combat XP per damage: style 0.6, constitution 0.2, defence 1 per damage taken.
- **Checking:** `simPacing(days, { tiles, hours })` in the console estimates income and levels for a steady player (40 tiles, best crops: ~7k by end of spring, ~19k by end of summer, ~39k in year one). Re-run it after changing prices.

## World regions (`public/js/u_regions.js`, design doc Phase 11)
- The Wilds are the Hollow Vale. Four more regions are generated from the world seed (`genRegion`, 180x140 each, in `PERSIST` so they save like the farm): **Highmarch** (pine valleys, snow peaks; gate on the Wilds' north edge at x 120), **Frostmere** (tundra, glacier; x 40), **Emberwaste** (badlands, cinder fields; x 176), **Saltreach** (isles and shallows; Corwin's ferry at the coast dock). New biomes are appended to `BIOMES` (`RBIO`, with enemy tables and levels 20-34) and cliffs take their biome's ground (`paintKey` wrapper).
- Each region has a town (inn: meals and a 300g rest; forge; market buying region goods and paying for lowland food; houses that only knock), a five-floor dungeon (`genDungeon`, map id `dg_<region>`, rebuilt each visit, boss and a tier-6 chest on floor 5, floors 3 and 5 selectable once reached), a world boss arena (`WBOSS[hard biome]`, weekly like the Wilds bosses) and hidden caches plus an ember shard. 25 new enemies and bosses are palette swaps of the existing templates.
- **Gates:** `regionOpen(id)` is true once `S.regions[id]` is set (for Phase 12 storylines) or the Wilds boss that guards it is beaten (Warlord, Frost Giant, Ash Colossus, Old Snapper). Locked warps carry `lock` and turn you back (`regionLocked`).
- **Waystones** (farm, village, Wilds crossroads, each town and dungeon mouth; positions kept in `S.wayPos`): touch to attune (`S.ways`), then travel between attuned stones.
- The map (M) shows the current region's chart and a list of regions with how each opens. Enemies don't spawn within 18 tiles of a town (`m.safe`). Mined ores respawn in regions as in the Wilds.

## Regional content (`public/js/u_regiondata.js`, loaded before `u_regions.js`)
- Each region has its own ore, wood, forage, fish, crops, dishes, monster parts and boss trophies; going further out is how you get better things. Ores need Mining 35 / 45 / 57 / 72 (`NODE_REQ`), regional trees Woodcutting 30-70 (`TREE_REQ`, woods via the `gatherTick` wrapper).
- **Gear tiers** appended to `TIERS` with stats placed by strength (`RTIERS`): Cobalt (Highmarch, Melee/Defence 35, between gold and mythril), Tidesteel (Saltreach, 45), Rimesteel (Frostmere, 57), Cindersteel (Emberwaste, 75, just under starforged). Bars smelt at a furnace and need a regional part; weapons and armour need that region's monster parts and wood. Each tier has a set bonus.
- **Trophy rings:** every world and dungeon boss drops a trophy that a regional bar turns into a ring (Tyrant Band, Rime Circlet, Drakeheart Signet...).
- **Crops** are `secret` (kept out of Mara's store) and sold only at their region's market; regional dishes cook at any kitchen and are sold at the region's inn. Region markets sell seeds, timber, ore and forage; inns sell the local dishes.
- **Art:** regional creatures and bosses are their own templates in `art/sprites/creatures2.py` (drawn full size, no in-game scaling); towns use regional buildings (`REGION_STY` in `buildings.py`: turf-roofed stone for the Highmarch, snowy log lodges with icicles for the Frostmere, flat-roofed basalt and hide tents for the Emberwaste, a whitewashed inn and stilt houses for the Saltreach), regional stalls and dungeon mouths (`bld_dg_<code>_5x4`); new trees (stonepine, frostwood, charwood, mangrove) and ore rocks are in `nature.py`.
- Saves made before this regenerate their region maps once (`S.regionVer` 2); the farm, village and Wilds are untouched.

## Storylines (`public/js/w_story.js`, design doc Phase 12)
- Five questlines run side by side (`STORIES`), each in chapters with a cast and rewards: **The Hollow Crown** (main: Elias, the squire's grave, Brann's key, Old Marta, Elder Sigrun, Sir Aldren's ghost; ends with Aldren's Blade), **The Ashcombe Signet** (the burned lodge, Rowan, the Stag Signet), **The Lost Lanterns** (three lanterns, Hale, Lantern Night), **The Salt Smugglers** (the wreck at night, Harbourmaster Quill, a choice, the Drowned Captain), **The Ember Pilgrims** (Sister Wren, the shrines, 10 and 30 shards, the brazier). A story begins on its own (`start`) and says who to see.
- Steps: `talk`/`bring` (a villager; hooked into `doorAction` and the shopkeeper/counter `objInteract`, so the story speaks first), `meet` (a story character placed at a role), `use` (a story object placed at a role), `go`, `have`, `cond`, `boss`, `kill` (counted in a `killEnemy` wrapper while the step is active). Steps can give items, chapters give gold, items, flags, friendship and open regions (`S.regions`).
- **Roles, not coordinates:** `storyWhere` resolves `wilds:<poi>[:<biome>]`, `<region>:town|dungeon|arena`, `village:plaza|altar`, `farm:home` and `site:<map>:<biome>` (a new clearing in that biome, created when first needed). Resolved places are remembered in `S.story.places`. `storyPlace` clears every story object and puts back what the current steps need, after each load and each step.
- **Dialogue** is a box along the bottom (`storyDialog`): portrait, name, line by line, choices at the end; the game pauses; Space, Enter or E continue.
- **Journal:** the Quests tab (J) starts with the stories (chapter, hint, where). Track one to get a bobbing marker over the target, an arrow at your feet and a `!` on the map.
- Story state is `S.story` (`q` per story: chapter `c`, step `i`, `kills`; `flags`; `places`; `track`). Older saves start the stories fresh.
- Tested: all five stories played through to the end in a fresh game; every role resolved and every region opened.

## Relationships and generations (`public/js/x_family.js`, design doc Phase 13)
- **Romance** (`ROMANCE`: Pip, Odile, Hale, Brann, Mara) runs through the shop greeting (`greet` wrapper): heart scenes at 4/7/10 hearts (`S.fam.seen`), "Ask out" at 8 hearts (300g bouquet), "Spend time together" once a day (+friendship, a speed buff), "Propose" at 10 hearts with an Ember Pendant (anvil: 3 gold bars, ruby, diamond) and a built cottage. The wedding plays three mornings later.
- **Spouse:** at home on the farm before 9:00 and after 18:00 (`schedPlace` returns 'home' for them in the village then), at their shop in between; one chore each morning (`spouseChore`: water up to 30 crops, tend animals, clear weeds, or cook). Talking to them on the farm opens a home chat; "Talk about the future" asks for a child (after a week married, max 3, due in 14 days, you name them).
- **Children** (`S.fam.kids`): baby under 4, child under 13 (brings forage), teen under 18 (learns the skill you teach: 2% of your XP in it per day), adult (chores, can inherit). On the farm by day as hidden `NPCS` entries (`kid<i>s<stage>`, non-enumerable so they stay out of Friends); children are drawn smaller (`humanSpr` wrapper).
- **Aging:** `AGE_RATE` = 5 years per in-game year; you start at 25. Past 45 max health and energy fall (to at most -45%); past 30 XP gain rises (up to +15%).
- **Death** needs an heir (`canDie`: a spouse or any child). Old age from 75 (checked each season), or a 10% chance that a knockout outside the farm and village is fatal. Without an heir you can't die. `die` opens a locked Farewell window; `succeed` makes the spouse or an adult child the player: same farm, gold, buildings and items; their own look and skills (spouse 35% of your life-skill XP; a child their taught skills, at least 20% of yours; combat 25%), +5% XP family bonus per generation (`S.fam.bonus`, max 50%). The old spouse becomes a parent (`S.fam.elder`) back at their trade.
- **Family tab (F):** crest (`S.fam.crest`), you, spouse, partners, children with stage and teaching, parent, romance candidates, and the family tree (`S.fam.tree`).
- Tested: date → propose (refused without a cottage) → wedding → child → named → child → teen learning Mining → aging → fatal knockout → succeed as the adult child (generation 2) → no heir means no death.

## Animation (`public/js/y_anim.js`, design doc Phase 14)
- **Frames** (`art/sprites/human.py`): `hb_body_<d>_w0..w7` (8-frame walk on a sine), poses `idle1`, `wind`, `strike`, `thrust`, `draw`, `cast`, `pour`, `eat`, `block`, `hurt`, and `hb_body_0_tuck` (the roll). The old 0-3 walk frames stay for older callers. `humanSpr` takes these as `f` and moves the head layers with the pose (`POSE_DY`/`POSE_DX` in `h_pixel.js`); the tuck is drawn alone.
- **Player** (`drawPlayer` replaced): `playerAction()` picks one state: mounted > roll (tuck rotated in 90° steps, so it stays crisp) > hurt > weapon attack > tool > eating (`pl.eatT`) > fishing (rod, line and a bobber that dips on a bite) > Guard (shimmer) > walk > idle breathing. Held items are drawn at the pose's hand (`HAND`, art px, mirrored for dir 1).
- **Weapons** (`SWING_T`: dagger .26, sword .34, spear .38, bow .46, hammer .5 s): sword wind-up, sweep with a smear arc, follow-through; warhammer overhead then a slam with dust, a ring and a small shake; spear pull-back and thrust with a streak; dagger double jab; bow upright, string drawn back, then released with a quiver. Abilities: Cleave ring, Lunge afterimages, Rend bleed drops, Second Wind motes.
- **Enemies** (`enemyAnim`, applied in `f_render`'s enemy draw): walk bob, a lunge toward you on every melee attack (`e.lunge`, set in `n_combat`), recoil and squash when hit, a crouch while a slam telegraphs, a lean before a charge; deaths leave a corpse that flashes, flattens and fades (`CORPSES`; bosses shake and shed dust).
- **World** (the `pcCursorDraw` overlay pass): water glints, lava sparks, forge sparks while smelting or smithing, belt items sliding between tiles (`slideFrom`/`slideT` set in `s_auto`, `beltSprite` leaves the arriving item out), and `!` (a story step waits) or heart (partner) bubbles over villagers. Villagers walk on the 8-frame cycle.
- Not done: swaying crops and trees, enemy art frames beyond the 2-frame templates (motion is procedural instead), carrying, sitting and turning poses, a knockout fall.

## Automation tiers and combined recipes (`public/js/v_tiers.js`)
- **Tiers** (`S.autoTier`, `AUTOTIER` per piece; `canCraft` refuses higher tiers): 1 hand-built (chute: no power, a tile every other tick; stone furnace; crate, kiln, oven, compost bin, treadwheel), 2 iron (conveyor, sorter, splitter, smelter, mill, windmill, waterwheel, trip hammer, butter churn, seed hopper, horse tools), 3 cobalt (cobalt belt 2 tiles/tick, lever crane, blast furnace, reaper), 4 tide/rime (filter crane, tide mill, power hammer, storehouse ledger), 5 ember, the magical top (rune belt 3 tiles/tick without power, ember forge with no fuel, ember core, ember golem). Plans (`PLANS`): Hale sells tier 2 (1500g, Construction 5); the Highmarch forge tier 3 (6000g, 25); the Saltreach or Frostmere forge tier 4 (15000g, 40); the Emberwaste forge tier 5 (40000g, 55), as a Plans tab added to those windows (`openModal` wrapper). Older saves with machines start at tier 2.
- **Upgrade in place** (`UPG`): use the next piece on a placed one (chute → conveyor → cobalt belt → rune belt, stone furnace → smelter → blast furnace → ember forge, waterwheel → tide mill, trip hammer → power hammer, crane → filter crane, crate → ledger, seed hopper → golem); contents are kept.
- **Engine hooks in `s_auto.js`:** `BELTS`, `BELT_SPEED` (extra belt rounds per tick), `BELT_FREE` (no power), `STORE`, `ACCEPT` (custom inputs), `DIRPLACE` (placed facing you), power entries `[x, y, radius]` (treadwheel 5, windmill 7, waterwheel 9, tide mill 13, ember core 18; `scanPowerExtra`), station `mult` (speed), `yield` and `fuelx` (fuel lasts longer). Cranes move one item a tick from the tile behind to the tile in front (`craneTick`); the reaper cuts a ripe crop within 3 tiles each powered tick; the hopper sows and the golem harvests, waters and replants each morning. Machine harvests go through `give` into the machine (`CAPTURE`), then onto belts.
- **Combined recipes:** new parts `flour` (also by hand), `sugar` (mill from beets, or by hand), `butter` (churn or by hand), `salt` (Mara's Pantry tab, Saltreach, or from clams), `grip`, `haft`, `bowstring`, `rivets`, `straps`, `padding`, `gear`, `cobalt_gear`, `firebrick`, `tide_valve`, `rime_coil`, `ember_rune`. Food needs real ingredients (bread: flour + salt; cakes: flour, eggs, milk, butter...; new Layer Cake), weapons need grips, hafts or bowstrings, armour needs padding, straps and rivets, and machines need gears, cogs, firebricks and the regional parts. The bread oven bakes bread from flour and salt, and layer cakes.

## Crafting at stations (`public/js/v_crafting.js`)
- The old field kit is gone: workbench recipes (`r[3] === 'bench'`: fences, sprinklers, parts, belts, most machines) need a workbench in reach (a placed `workbench`, 2 tiles, or the `furn_workbench` in Hale's and the farmhouse rooms). Every farm gets one beside the tent or house, once (`S.flags.wb`, placed on the tick). Only `hand` recipes (the workbench and the campfire) can be made anywhere.
- Using a station opens its recipes (`openMenu('craft', station)`; the tab is labelled after the station). The backpack's crafting tab (B) is a read-only recipe book that says where each recipe is made. Shop forge windows (Brann, the regional forges) open on the furnace and show only furnace and anvil.

## Seasons and the time of day (`public/js/v_seasons.js`)
- Dirt, cobbles, rock and sand have spring, autumn and winter textures (`ground_<k>_<season>` in `ground.py`; summer is the base); still water freezes in winter (painting only, `paintKey`); buildings use snow-roofed `bld_..._w` sprites in winter (`refreshBuildings`, drawn with `WINTER` roof snow in `buildings.py`). The Emberwaste never gets snow.
- `gradeColor` follows the season: sunrise/sunset from `SUN` (summer ~5:30-20:30, winter 7:00-18:00), with pre-dawn, dawn, morning, noon, golden hour, sunset and dusk keyframes, times a seasonal `TINT`. Still one flat multiply, no gradients.
- After the grade, `nightLights` (called from `f_render`) draws lit windows (buildings record their glass in atlas `meta.win`; a few households are dark) and flames on lanterns, campfires, forges and lit furnaces (from sprite `meta.light`), as flat pixel squares.
- Ambient particles: spring petals, summer butterflies by day and fireflies at night, autumn leaves, winter snow motes.

## Riding
The rider uses a seated pose (`hb_ride_2` in `human.py`, `humanSpr(..., 'ride')`): thigh along the saddle, leg down the horse's flank, mirrored when facing left.

## Saves, autosave and the test sandbox (`public/js/x_saves.js`, `x_sandbox.js`)
- **Slots:** up to 8 saves, each in `localStorage` key `emberhollow_slot_<id>` (with a `_bak` copy of the previous save), listed in `emberhollow_slots` (name, in-game date, gold, generation, real time saved). The title screen has Continue (newest), Load game (list with delete) and New game (a new slot, never overwrites). `S.slot` is the current slot. The old single save `emberhollow_v2` was copied into slot 1 and is left untouched as a backup.
- **Autosave** every 500 ticks (5 minutes) on a saveable map with no window open, plus the existing morning save.
- Saves live per address: the dev server is pinned to `localhost:5173`. The desktop build serves the game from `app://game/` (`electron/main.cjs`), so its saves are separate from the browser's.
- **Test sandbox** (title screen button): a throwaway game where `saveGame` does nothing and Delete/Save are hidden; a yard with every station (and an ember core for power), a supply crate and the bank holding every ingredient, automation tier 5, skills 75, 1,000,000 gold. At a station each recipe gets a Get button that moves its ingredients from the supply crate into the backpack.
- **Testing without touching the player's save:** use `http://[::1]:5173` (a different origin, so different storage) for automated tests.

## Crafting jobs (`public/js/x_craftjobs.js`)
- Crafting at a station is a timed batch (`JOB`, `JOB_TICKS`: workbench 2, furnace 3, anvil 4, kitchen 3, tanning 3 ticks per item). The window stays open with a progress bar and Cancel; it runs in real time (0.6 s steps) while the window is open and on the game tick when closed, until you walk away. No tool swing. Recipes have Make, x5, x10 and x100, capped at what the materials allow; repeating the running recipe extends the batch.

## Settings (`public/js/x_settings.js`, Phase 15)
- Stored for the whole game in `localStorage` `emberhollow_settings` (not per save). Options tab (Esc): master, music, effects and ambience volumes (gain buses; every sound goes through `audioOut()` in `a_core.js`, `BUS_MODE` picks the bus); zoom (auto or fixed 2/4/6/8, still even), particles (full/low/off, `PARTICLE_K`), FPS counter, fullscreen; and rebinding for 22 actions.
- Rebinding works by translation: a capture-phase listener turns the bound key into the action's default key (`KEYMAP`) and swallows the default key if it was moved (`SUPPRESS`), so modules keep reading their default keys. Esc is fixed.
- Ambience (`ambientTick`): birdsong on spring/summer days, crickets on warm nights, wind in winter and cold biomes, rain, surf on the coast, crackle near fires and lit furnaces, drips in mines.
- Performance (measured at 1889x1206): ~164 fps median everywhere (farm yard, village day and winter night, Wilds, Highmarch), p95 frame about 7 ms.

## Music and small polish (`public/js/x_music.js`, `x_polish.js`)
- **Music** (`SONGS`, `compose`, `moodNow`): a piece per mood (spring, summer, autumn, winter on the farm; village; wild; alpine, sea, frost, ash for the regions; night; home indoors; mine; battle when fighting or near a boss), composed from a seed: key, scale, tempo, a four-chord progression, bass, a pad on each bar, a melody from a two-bar motif in an A A' B A shape, and percussion where it fits. Changes wait for the end of the bar (battle cuts in at once). Notes go through the music bus.
- **Wind:** trees and grown fruit trees switch to a second frame with the canopy one art px over (`swayFrame`, made once per sprite); tall grass cycles its three frames. Phases live in a `WeakMap`, not in saves; gusts are more frequent in rain or snow.
- **Knockout:** `faint` now plays 1.7 s first (recoil, lying down with stars, fade to black), then runs the old faint (and the death check in `x_family.js`).
- **Locked nodes:** aiming at a tree, rock or vein above your level turns the cursor red and labels it under the node ("Maple · Woodcutting 10", `TREE_N` in `x_polish.js`). Maples (Woodcutting 10) have red leaves and grey bark so they don't pass for oaks.
- **Resource pieces:** gathered logs, stones, ore, fibre and hay pop out as ground drops that arc and then fly to you (`popTo` in `x_polish.js`, `home` drops in the `updateDrops` wrapper); a full bag leaves them on the ground.
- **Carrying:** a crop, fruit, forage, fish, animal product, artisan good, gem or artifact in the selected slot is shown above your head.

## Blueprints, silo, field seeds, home (`public/js/x_blueprints.js`)
- Hale sells building **plans** (`S.blue[k]`, kept for good). A plan adds a workbench recipe `bp_<k>` (1 wood, 1 fibre); the blueprint item is used from the hotbar/backpack on the farm (`useItem` → `startPlacing`), and placing a site uses it up (`BP_ITEM`). Wells, sheds and silos (`BP_MULTI`) can be built any number of times; cottage, coop, barn, stable and stall once.
- **Silo** is a building site now (`BP.silo`, sprite `bld_silo_3x4` in `buildings.py`), no longer an instant upgrade. `S.build.silo` = number of finished silos; each holds 240 hay. Nothing fills them on its own: interact to store hay from the bag or take it out; animals eat from them first in winter. A silo from an old save with no building becomes free plans and its hay goes to the bag (`siloSync`).
- **Field seeds** (Mara → Field seeds): Meadow Grass (regrows, harvests into hay) and Flax (fibre). They are non-enumerable `CROPS` entries with `as: [item, min, max]`, so Collections and the seasonal seed list skip them.
- Once the cottage is built you wake beside your bed (`wakeHome` after `endDay`, and on load from the default farm spot). The tent is removed when the cottage finishes.

## Recipe knowledge (`public/js/x_unlocks.js`)
- Only basics are known at first (`recipeKnown`): parts, bars, wood/leather/copper gear (`BASIC_TIERS`), simple meals (`BASIC_FOOD`), fences, paths, stations. Machines stay gated by automation tiers.
- Learned with gold, stored in `S.known`: smithing **patterns** per tier (`tier:<tk>`, Brann's Patterns tab; regional tiers at their forge), **cookbook** pages per dish (Pip; regional dishes at their inn), **item plans** for workbench extras (`WORKSHOP`, Hale).
- Unknown recipes are hidden from station windows by swapping `RC` during `renderCraft`; `canCraft` refuses them. Older saves learn everything they own or have made (`migrateKnown`); the sandbox knows all.
- Recipe rows name each ingredient (`g_ui.js` renderCraft).

## Encyclopedia, pause, sounds, tree (`x_ency.js`, `x_polish.js`, `x_settings.js`, `x_tree.js`)
- **Encyclopedia** (U, Satchel tab): every item by category with search; a card with stats, where it comes from (recipes, crops, drops from `EN[k].drops`, type hints) and what uses it. The satchel is wider; its tab row scrolls with the wheel.
- **Pause**: Pause key (rebindable) or the button by the clock; alt-tab pauses too (`setPause`, `GPAUSE`).
- **Sounds**: rain is one looping low-passed hiss (`rainLoop`), mine drips and crickets are soft and low, music bells are rarer, the mine piece has no high pings, and `SFX.pick` is a soft thud.
- **Passive tree** is redrawn to fit its window and has a fourth branch, **Life** (`LTREE`, `S.tree.life`): energy, tool energy savings, life-skill XP, extra harvests, sell prices, speed. Life points = life-skill levels gained / 8, separate from combat points.
- **Quests** are on the 1-99 scale: "Master of Emberhollow" is now every life skill 60 (40,000g), plus milestone quests appended in `t_balance.js` (indices are kept because `S.qdone` is by index).

## Scythe and tool upgrades (`public/js/x_scythe.js`)
- The scythe is a hotbar tool (`S.tools.scythe`, `isTool`, `TOOLN`, icon `ic_scythe`, a low sweep in `y_anim`). One swing covers `SCYTHE_AREA[level]` in front of you (1, 3, 3x2, 5x2, 5x3): every weed or tall grass gives 1 fibre and 1 hay, straight into the bag, and ripe crops in the swath are harvested. Vegetables, grains and field crops (`needsScythe`) can only be harvested with it; fruit and flowers by hand. Older saves get it on the hotbar.
- Tool upgrades: axes and pickaxes gather faster (+7% success per level) and give an extra log or ore 10% of the time per upgrade (`gatherTick` in `o_skills.js`); the final hit that fells a tree or splits a rock (not twigs, pebbles, bushes or weeds: `SMALL_NODES`) gives a bonus of 40% of the node's yield + 1 per tool upgrade and half its XP again; hoes and cans cover more tiles; rods widen the catch zone.

## Hotbar in the backpack (`public/js/x_hotbar.js`)
- The backpack window starts with the 10 hotbar slots. Drag bag → hotbar (the hotbar points at the item), hotbar ↔ hotbar (swap, tools too), hotbar → bag or right click (off the hotbar). A tool taken off becomes a bag item `tool_<kind>` (type `tool`, one per slot, can't be dropped); dragging or clicking it puts it back. `ensureToolRefs` restores any tool that is nowhere. Equipping a weapon no longer writes `S.hot[5]`.
- The cottage is placed anywhere like other buildings (no fixed lot); the tent stays until it's finished.

## Ember Multitool (`public/js/x_multitool.js`)
- The last tool tier (6, "Ember"): axe, pickaxe and scythe in one hotbar tool (`S.tools.multi`, kind `multi`, icon `ic_multi`). Brann forges it (Tool upgrades) once axe, pickaxe and scythe are mythril: 30,000g, 3 Ember Runes, 5 Starmetal, 10 Mythril Bars. `useTool` picks the sub-tool from the target (axe objects → axe, pick objects and placed machines → pickaxe, everything else → a 7x3 scythe sweep) and runs it at tier 6; gathering keeps `GATHER.k = 'multi'`. Skill levels still gate nodes.

## The wild keeps changing (`public/js/x_wildregrow.js`)
- In the Wilds and the regions (`m.wild`), regrowth moves: a felled tree's stump disappears after 5 nights and a new tree of the same kind grows elsewhere in the same biome (same ground if possible); mined rocks and ores come back after a day somewhere else; dug-out stumps after 5 days. `wildSpot` never uses roads/paths, towns (`m.safe`), warps or tiles in view of the player.
- Biome treasure chests (`w0`-`w5` in the Wilds, `<region>_c<n>` caches) restock a week after opening in a new random spot in their biome (`S.restock`); story and landmark chests stay put. The farm and the village regrow in place as before.
- **Auto tool:** left-clicking a tree, rock, ore, grass, weed or ripe vegetable first selects the matching hotbar tool (the multitool if it's there); a seed or item in hand on soil is kept (`toolFor` in `x_multitool.js`).

## Playtest fixes (`x_fixes.js`, `x_ui.js`, `x_world.js`; list in `docs/playtest/BACKLOG.md`)
- **x_fixes.js:**
  - Wide signposted farm↔village exits (`clearNatural`, `widenExit`).
  - A local map for small places (`localMapCanvas`).
  - `faceTile` returns the hovered tile when it's next to you (`AIM` holds the clicked target on arrival); the rod casts at water up to 3 tiles ahead.
  - Corner sliding and unsticking in `moveEnt`; refusing placements that would trap the player.
  - Options → Load another save / Save and quit to title.
  - `demolish` at Hale's.
  - Enemy leash (home, heal, bosses wake within 190 px and stop beyond 280); kill loot homes to the player.
  - Small fixes: flame overlay, toasts, creator, saving only after the creator closes.
- **x_ui.js:**
  - Recipe search and category chips (RC swapped during `renderCraft`).
  - Backpack search, Sort and "Recipes & uses"; bank search.
  - Getting-started checklist; a shorter milestone list.
  - Door name plates; closed-shop notice; buy confirmation.
  - Combat bar only when fighting; watering-can level.
  - Out-of-combat regen and a low-HP warning.
  - The clock runs at 0.7×; starting bread; lower request rewards.
- **x_world.js:**
  - The pet (`S.pet`, Odile's stray quest, a `pet` entity on the farm, morning digs in `showDayReport`).
  - Picking wild flowers and mushrooms.
  - Clay mounds and salt crusts (`spawnNodes` once per wild map).
  - Slaughtering animals (`BUTCHER`), meat items, `$meat`, and meat recipes.

## Action combat (`public/js/x_action.js`, design in `docs/COMBAT_OVERHAUL.md`)
- `SETTINGS.combat`: `action` (default) or `classic` (the tick auto-attack in `n_combat.js`), switchable in Options.
- Action mode:
  - **Attacks:** LMB (hold to repeat) attacks toward the mouse with `WPN[PS.wt]` (cooldown, range, arc, knockback, damage multiplier, 3-hit combo whose finisher staggers). No misses (`actionHit`: 55-100% of `PS.maxHit`, crits, defence).
  - **Arrows:** real projectiles (`PSHOTS`).
  - **Feel:** hit-stop (`ACT.hitstop` pauses `update`), knockback, sparks and shake.
  - **Dash:** Shift is 0.2 s and invulnerable, with a 0.45 s cooldown.
  - **Enemies:** they wind up (`e.wind`, a red ground marker drawn in the `drawEnt` wrapper), strike if you're still in the arc, then recover (`enemyAttackAI`). The tick melee in `enemyTick` is off (bleed still ticks). Guard opens a 0.5 s parry (`ACT.parry`) that stuns.
  - **No auto-target:** `TARGET` only feeds the target frame and aims Lunge, Rend and Volley.
- **Bosses (`x_bosses.js`):** each boss has a kit (`BOSS_KIT`) of old moves plus signature hazards: quake rings, rockfall, fire pools, ice lanes, spirals, triple charges, tide waves and anvil slams. Hazards live in `HAZ`, telegraphed then live, and hit through `hurtPlayer`. Phase 2 starts at 50% health (roar, a 1.2 s shield, plus a phase move).
- **Skill trees and magic (`x_skills.js`):**
  - **Trees:** Combat skills tab (V) with Blade, Marksman and Arcane, 5 skills each (`CSKILLS`), ranks 1-3. Points = style level / 5 per tree. Each skill needs its weapon type.
  - **Abilities:** skills are `ABIL` entries usable in the Z/X/C slots (`abilPoolX`). Effects live in `VFX` (draw functions plus a `tick` for damage); skill projectiles in `SKP`.
  - **Staffs:** one per metal tier, wt `staff`, Magic style. Their basic attack is a bolt, and a fireball on the combo finisher.
  - **Robes and hats:** Apprentice to Starweave give `magic` (damage) and `fregen` (Focus regen), need Magic to wear, and are gated by the metal patterns.

## Combat test (`public/js/x_combattest.js`)
- Title screen → Combat test: SANDBOX game, combat skills at 60, every weapon type, staff, robes, arrows and meals, in the Wilds meadow, with a panel (`#ctpanel`) to spawn packs or any boss, heal and clear.

## Combat fixes from playtest 2 and lives (`public/js/x_combatfix.js`)
- **Seeing yourself:** a see-through player is drawn on top when enemies, hazards or canopies cover you (canopy fade is 0.25 in `f_render`).
- **Spacing:** `separate` (with `nudge` for stuck enemies) spaces enemies and keeps a ring around you; bosses are solid. At most two ordinary wind-ups happen at once. Swings always hit an overlapping enemy (`x_action`).
- **Controls:** weapon clicks never walk you. You face the mouse for 0.45 s after an attack. The dash follows the movement keys, or the mouse when none are held (with a trail).
- **HUD:** `#abil` sits at the bottom right and `#tframe` at the top left. The boss bar tracks the boss you hit, else the nearest one.
- **Bosses:** 1.8 s of grace on waking (shielded, no melee, nearby hazards cleared). Every hit is capped at 20% of max health plus defence. Regional bosses' `atk` is ×0.55.
- **Lich and Hollow King:** the Lich uses `blink2` (fade, a destination marker, then a punish window); the Hollow King walks and quakes.
- **Projectiles:** glowing arrows and bolts; staff bolts live 1.4 s and puff out; plain arrows are used before fire arrows.
- **Focus:** skill hits (`hitArea`, `{skill:1}` projectiles) give no Focus.
- **Skill tuning:** `SKILL_MULT` (Whirlwind, Chain, Meteor down; Ground Slam, Piercing up). Blade Dash stops at the mouse; Chain Lightning starts on a boss in range.
- **Loadouts and keys:** a Z/X/C loadout per weapon group (`S.abilSets`). **Q parries** (Guard). Equipping a weapon selects it.
- **Quieter toasts:** repeated "backpack full" and "recharging" toasts are suppressed.
- **Lives (`S.lives`, max 3):**
  - A knockout with a life left gets you up on the spot (full health, 2 s invulnerable, a shockwave).
  - With none left it's the old knockout (home, a new day).
  - One life returns per 60 s out of combat, and all refill each morning. The hearts show under the bars (`#lives`).
  - Combat test respawns without using lives.

## Building the desktop app
- `npm run build` then `npx electron-builder --win` (or `npm run dist`) writes `release/Emberhollow-setup-<version>.exe` (installer) and `release/Emberhollow-portable-<version>.exe` (runs without installing). `release/` and `dist/` are not committed.

## Playtest 3 fixes (`public/js/x_fix3.js`)
- **Visibility:** enemies keep a ring of their radius + 11 px around you (bosses + 14), villagers step out of your way, you're outlined behind buildings and NPCs, there is no hit blink, and losing a life gives 2 s of shield (`S.p.shieldT`, drawn as a ring).
- **Clicks:** with a weapon and no enemy on the cursor or within 200 px, clicking ground out of reach walks there; an empty slot only walks (never opens the Satchel); clicking a building goes to its door; an unreachable click shows a red cross (`NOPATH`). Unstick moves never push you into more blocked corners.
- **Terrain:** `openPockets` (Wilds and regions) opens walkable tiles with 3+ cliff neighbours and removes trees, bushes and rocks plugging 1-wide cliff gaps.
- **Crates:** `openCrate` has search, a stable order (empty stacks dimmed), hover names; click takes 10, right click 1, Shift-click all.
- **Quests:** Track points at the nearest uncollected journal page and at villagers where they stand; off-map targets get an arrow to the right exit labelled "to <place>" (`exitToward`). The journal says when each story begins (`STORY_WHEN`), the morning report announces new stories, Space advances dialogue and Enter presses a window's main button.
- **Farming:** the Getting started steps stay ticked (`S.flags.gs<i>`), seed rows show grow days, seasons and sell price, pointing at a crop shows its day and water, the watering can holds 40, the starting food is Trail Bread (8g), Well plans 250g (30 stone, 10 wood), haft and grip sell for 8g, goats 1200g, a signpost where the paddock road ends, and weeds, stones and twigs around the tent on a new farm.
- **Building:** build sites pull missing materials from the bank, used-up blueprints leave the hotbar, blueprints have a Place button in the bag, and shops say which plans you need from Hale.
- **Combat:** meadow and forest enemies hit 40% softer; the V screen names the loadout you're editing; the combat test panel and the ability bar moved off the hearts and toasts; the craft progress bar is sticky.
- Item descriptions lose trailing full stops (the UI adds its own).

## Playtest 3, second pass (`public/js/x_fix4.js`)
- **Clicks:** a placeable in hand walks next to a far empty tile and places it there; LMB hints say Walk (empty slot), Cut (scythe), and no Till off the farm. Doors and shop counters act on arrival (checked).
- **Combat:** `drawHazards` is replaced: every telegraph shows its full zone and fills up until it hits; quake rings are a solid band. Winding-up enemies fill their wedge and show a "!". Knockback or a dash never carries you through a map exit (warps are off for that frame and you are put back). Combat test: Mixed pack uses Hollow Vale enemies at level 10, bosses are a clickable list. A held bow is drawn full size (`playerAction` wrapper).
- **Animals:** greyed Buy and Breed buttons say why ("Needs a barn", "Grown in 3 d", "Needs 2 ♥"...); animal names never match a villager.
- **Sandbox:** stations have ground labels instead of solid signposts (`SB_LABELS`), a coop, barn and stable are pre-built, a Next day button sits in the banner, recipes have Get ×5.
- **Villagers:** talking to a shopkeeper on the street opens a small window (greeting, Shop, Chat, Goodbye; story steps still speak first). The greeting shows a heart progress bar; gifts say how much friendship they gave.
- **Exploration:** the Wilds and region maps zoom (buttons, mouse wheel) and show waystones; chests list what they held; picked flowers and mushrooms are named; mine ladders have a bobbing arrow; early request-board items are first-week items; gem veins need floor 5+; small windows (`#modal.small`) for the elevator and lost pages; opened chests have a raised lid (`props.py`).
- **Cliffs:** `r` faces are natural rock (cracks, a broken ledge, darker toward the foot) instead of stone courses; cliff tops get a rocky tint and flat stones (`h_pixel.js`).

## Canoe (`public/js/x_canoe.js`)
- Made at a workbench (40 wood, 4 hardwood, 12 fiber), worn in the Boat slot (`S.eq.boat`, between the rings). While worn, deep water (`w`) is open to the player's `moveEnt` and `walkTo` (`withWater` lifts `TER.w.solid` for that call); `S.p.boat` follows the tile under you, so you climb in and out at the shore. Drawn seated in the hull with the near gunwale over the legs, a paddle stroking side to side and a wake (`canoe.0/.1` in `implements.py`).

## Building hammer (`public/js/x_hammer.js`)
- Workbench: 6 wood, 4 stone. Held, interacting with one of your buildings (E / RMB, or LMB on it) opens Move / Remove. Remove = `demolish()` (half the materials back; sites return everything). Move lifts the building (`MOVING`, `PLACING`) and uses the placement ghost; left click sets it down, right click / Esc / leaving the map puts it back. Hale's Demolish list is replaced by a pointer to the hammer.

## Harpoon, crab traps and the canoe rule (`public/js/x_fishing2.js`, art in `fishing_art.py`)
- In the canoe only fishing works (`canoeAllows`: rod, `fishtool` items, food); other clicks say so, and action attacks are off.
- Harpoon (anvil: 3 iron bars, 5 wood, 6 fiber): facing deep water, picks a `BIGFISH` for the water and season (shark, swordfish, tuna, manta at sea; sturgeon in rivers and lakes). Minigame in `#fishgame` (pauses the game, own rAF loop): aim (a sweeping mark over the fish's shadow, 3 throws), then fight (hold to reel, release while it runs, keep tension 0.3-0.78; snaps at 1, shakes loose after 2.4 s slack).
- Crab trap (workbench: 8 wood, 10 fiber): set in water as a `crabtrap` object; from the next day `trapReady` rolls 1-3 `SHELLFISH` for its water (mud crab, prawn, crayfish, rock lobster, river snail). Hauling: 3-4 timed pulls on a sliding marker; a miss loses one catch. The trap stays set; on an empty one, interacting lifts it back into the bag.

## Menu dock (`public/js/x_dock.js`, icons in `art/sprites/ui_icons.py`)
- The top-right `#topr` is a 4-column dock with a labelled tile per tab (Bag, Recipes, Skills, Tree, Combat, Animals, Friends, Family, Collect, Lore, Map, Quests, Options), each with a hand-pixelled 16x16 `ui_<tab>` icon; the open tab's tile is lit and a click on it closes the window. The Satchel's tab row shows the same icons (`drawModal` wrapper).

## Trade signs
- `sign()` in buildings.py: a 20x15 board on two chains from a curled iron bracket, with a hand-pixelled 12x9 trade symbol (`SIGN_ICONS`: grain sack, anvil, mug, horseshoe, saw, urn, fish, crest for the manor). The floating name plates are off; `x_prompt.js` adds the building's name (`BLD_N`) to the door prompt.

## Stations, trees, arms and townsfolk
- `art/sprites/stations_hand.py` redraws the keg, preserves jar, cheese press, loom, oil press, smoker, campfire (3 flame frames), kiln, bread oven, smelter and stone furnace by hand at the old sizes (lit frames carry `meta.light`).
- `upright()` in handdrawn.py narrows torsos (`P.tw`) so arms hang clear; the troll, basalt golem and crystal creatures have organic part outlines.
- Bare trees (`bare_branches` in nature.py): limbs taper from 4px to twigs with a lit and a shaded side, knots and snow along the upper side.
- Arms (`arm_front`, `hand` in human.py): shoulder cap, a sleeve narrowing to a cuff, elbow crease, shaded hands with a thumb.
- `public/js/x_townsfolk.js` dresses the villagers and the story cast (aprons, vests, robes, hats, hoods, capes; Sir Aldren in silver armour).

## Enemy outfits (`public/js/x_outfits.js`)
- New character layers in `human.py`: `hb_mask_<d>` (bandana, hood channel), `hb_vest_<d>` (leather vest, belt channel), `hb_quiver_<d>`; `humanSpr` adds them for `P.mask`, `P.vest`, `P.quiver`. Bandits and archers are masked and in vests (archers with quivers), goblins wear vests, and the Highmarch Raider, Bandit Warlord, Void Knight and Hollow King wear tier helmets and cuirasses (`P.helmS`, `P.armS`).

## Hand-drawn item icons (`art/sprites/icons_hand.py`)
- Overrides icons.py's material and food templates (`ic_bar`, `ic_ore`, `ic_gem`, `ic_log`, `ic_fish`, `ic_round`, `ic_bread`, ...) with pixel grids in the same channels (ch 0 item colour, ch 1 second colour). `icon()` grows small designs (nearest on the letter grid) before shading, so outlines stay 1px. `art/preview_module.py <module>` makes a contact sheet of a whole module.

## Hand-drawn props (`art/sprites/props_hand.py`, `public/js/x_props.js`)
- Fences join: `fence_<mask>` (1 N, 2 E, 4 S, 8 W) chosen from `o.fm`, refreshed by `fenceMasks` on map change and every 2 ticks; vertical runs show their rail tops beside the posts. Also redrawn by hand: the knight statue, ivy-covered ruin walls, the iron lamp post, the stone forge and the ember shrine.

## Interaction prompt and tack
- `x_prompt.js`: a panel under the top-right menu lists what you can do with what's in front of you, each with its (rebound) key: the interact label, G lower/raise and E unhitch while an implement is hitched, R get off while riding.
- The ridden horse wears a saddle, blanket, girth, stirrup, bridle and reins (`horse_tack` in `implements.py`, drawn between horse and rider in `y_anim.js`).

## Gear and creature art (`public/js/x_gear.js`, `art/sprites/gear.py`, `armor.py`, `farm_animals.py`, `foes.py`, `foes2.py`)
- Every tier has its own weapon, shield and tool icons (`gi_<item>`, `gi_tool_<kind>_<level>`), used in the hotbar, bag and hand. Helmets (`hb_helm_<tier>_<d>`, full head, accent in the plume channel) and cuirasses (`hb_arm_<tier>_<d>`, new channels `armor` and `trim`) are drawn on the character; `GEAR_ACC` holds each tier's accent.
- Farm animals and the horse, the Hollow Vale creatures and the regional ones are redrawn with the same sizes and channels; `art/preview_creatures.py` and `art/preview_armor.py` render preview sheets to `art/out/`.
- **Hand-pixelled creatures** (`art/sprites/handdrawn.py`, overrides the earlier modules): every animal, enemy and boss is drawn from hand-placed pixel grids and hand-picked outlines with flat cel shading (`grid_sprite`; letters b/m/d are regions, digits and E/W/N/T/R/O/Y/G/g/C/I/J are placed colours). Each has 4 walk frames (`an_<sp>.0-3`, `en_<art>.0-3`) and enemies a wind-up and a strike (`en_<art>_atk.0/.1`). `x_creatureanim.js` picks frames (`animFrames`, `enemyFrame`: wind-up while `e.wind`/`e.tele2`, strike while `e.lunge`). Preview with `art/preview_hand.py [names]` -> `art/out/hand.png`.
 in `public/js/l_pack.js`)
- `S.pack` is the backpack: 28 slots of `{ k, n }` (k = item key, `id` or `id#quality`). Weapons, armour and rings take one slot each; everything else stacks in one slot (`SINGLE` set). `S.inv` is a read-only view (key -> total) so older code keeps reading it; all writes go through `give` / `take` / `takeK`.
- A full backpack never deletes items: `give` drops the rest on the ground, and ground pickups stay put until there's room.
- Worn equipment: weapon, head, body, shield, feet, two rings (RuneScape layout in the Items tab). Gear needs a Combat level per tier (`TIER_REQ`). Swapping checks for backpack space.
- `S.bank` is unlimited storage, opened from the storage chest in the farmhouse and the bank chest in Mara's store. `S.presets` holds three equipment loadouts (save / load in the bank window).
- Saves from before the backpack are migrated on load (`ensurePack`): stacks go into slots, anything that doesn't fit goes to the bank.
- Never an infinite bag: bulk storage belongs in the bank or storage chests.
