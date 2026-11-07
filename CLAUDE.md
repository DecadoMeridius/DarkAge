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
The selected hotbar slot rises, grows, has a thick gold rim, a glow and a marker arrow, and the other slots dim a little (end of `pc.css`, asked 2026-11-07: the old thin ring was hidden by the carved frame).
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
- **Shops:** trade goods follow the markets (see Markets below). Gear, seeds, saplings, placeables and tools keep stock per shop (`S.stock`, refilled each morning) and a weekly price drift (±10%); selling those lowers the price ~0.6% per unit (to at most −50%), recovering 15% a day (`S.demand`, `S.shipSnap`, `econDaily` after `endDay`).
- **Market stall:** a blueprint from Hale (60 wood, 30 stone, 15 clay; was 2 cloth). Interact to put goods on display and set their prices (see Markets below).
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
- **Stations** (input + output slots, `CAP` 200 per stack, was 40; one click puts a whole bag stack in): Smelter (ore → bars, fuel), Charcoal Kiln (wood → charcoal, fuel), Bread Oven (flour → bread, fuel), Mill (wheat → flour, hay → fibre, power), Compost Bin (5 fibre, 4 hay, 3 kelp, 4 wild flowers, or 2 of any crop or fruit → 1 compost; added in x_fix6.js, with a one-line `desc` in the window), Trip Hammer (power; set it to any anvil recipe and it smiths that from bars). The artisan machines (keg, jar, cheese press, loom, oil press, smoker) also take inputs from belts and push finished goods onto belts.
- **Fence gates and fenced fields (`x_gate.js`):** the Fence Gate (workbench: 6 wood, 2 fiber) is an open, non-solid gateway two tiles wide that joins fence runs (`fenceMasks` counts it as fence): placing it fills the next tile along the run too (a fence piece there is returned), picking either half up removes both (`putObj`/`delObj` wrappers), and each half knows its side (`o.gs` L/R/T/B, drawn by `gateSpr`), so you, a horse and a hitched implement pass straight through. Each morning (`fieldsOvergrown`) tilled soil that the open meadow can reach (`enclosedTiles`: a flood from the map edge, stopped by fences, gates, buildings, solid terrain and water) has a 4% chance per tile to go back to tall grass, crop lost; the morning report says how many tiles.
- **Station windows (`x_stationui.js`, asked 2026-11-04):** every `STATIONS` machine, the trip and power hammers and the treadwheel open one window (`stationPanel`): the station's inventory on top as slots (4 input, 2 fuel with a burn bar, a progress arrow, 4 output) and the backpack below, slot for slot. Stacks are dragged (HTML drag and drop, `STDRAG`) or clicked between them (`stPut`, `stTake`); Move sets the amount (1, 10, Half, All; `MODAL.opts.sa`), Shift moves half, Ctrl one. A click puts an item into the input if it's used there, else the fuel, so wood goes into a kiln's fuel by dragging it there (a click always made it input). **Recipe choice:** Make chips set `o.sel` (a recipe's output); `stationRecipes` in s_auto.js then limits `recipesOf`, so `accept` (hand and belts), `stationTick` and `idleWhy` only use that recipe; Any clears it. `o.burnMax` is the current fuel item's burn length. Under the fuel slots the window shows how long all the fuel lasts (`stFuelTicks`: what's burning plus every stack, at 0.6 s a tick, `stTime`); under the output, how many more the inputs make and how long that takes, and everything that station has made (`o.madeN`, counted in `stationTick`). Every finished batch also trains a skill (`stationXP`, `STATION_SKILL`, called from `stationTick`, night catch-up included): half the XP of making it by hand; furnaces, smelters and hammers Smithing, the mill, oven and churn Cooking, the kiln Crafting, the compost bin Farming. While a station window is open (`MODAL.opts.stLive`) it is redrawn every 0.6 s (not mid-drag); the game runs on behind it (see Windows don't pause). In painted styles lit stations use their unlit painting (`STYLE_ALIAS` `<k>.1` -> `<k>.0`, also the trip and power hammers) and the fire is drawn over the mouth (`LIT_STATIONS`, `stationFireAt` from the lit frame's `meta.light`): the lit frames were painted apart and changed shape.
- **Belts that pull and the shed (`x_beltpull.js`, asked 2026-11-04):** every belt has a window (`openBeltWin`, `MODAL.opts.belt`; a jammed belt still offers its stuck item first): Rotate, the sorter's filter, "Pull from what's behind it" (`o.pull`) with the chosen item ids (`o.pl`, taken one at a time in turn, `o.pi`) and an item picker with search (what's behind it plus the backpack). `pullOne` takes from the tile behind (`pullSource`): a crate or ledger (`inv`), a station's or machine's output, or a finished Storage Shed (`S.bank`). A belt pointing into a shed (`shedAt`) puts its item in the bank (`unloadShed`). Both run in an `autoTick` wrapper (so the night's 300 catch-up ticks do them too; no second endDay loop) and need the belt's power like moving does. `pushOut` and `pushMach` are replaced with copies that skip belts with `o.pull`. R or Shift+E rotates the aimed belt (`beltAimed`: under the mouse within reach, else the faced tile). While a belt is held, `pxArrow` draws arrows on the tiles round each shed: green in (unloads), blue out (can pull), lit where a belt faces that way.
- **Belts join (`x_beltart.js`, asked 2026-11-04):** every belt is drawn in code (`beltSprite` replaced; palettes from automation.py / automation2.py, built facing down as `beltPx(kind, u, v)` and turned) from its links `o.bl` (`beltLinks`, on every tick and map change, and after placing or picking up: 1 fed from behind, 2 from its east side, 4 from its west side as it faces, 8 runs on into a belt; `beltSends` knows sorters and set splitters). An end that joins another belt has no crossbar, a side feed opens the rail, and a plain belt fed from one side only (not from behind) is a quarter-ring curve round the corner on the side it comes from (u = 32 - r from the east, r from the west, floored, so rails and slats meet the straight belts exactly at both edges; drawn for each side, not mirrored, so each rail keeps its shade; no chevrons). Chute slats are every 8 px and cobalt/rune bands 4 px so they run on across tiles. Painterly uses the same art smoothed (`smoothUp`), like fences; cached in `BELTJ` by kind, direction, frame, links, item and style. The atlas `conveyor_<d>` frames are no longer drawn on the farm. The merger is drawn here too.
- **Merger (`x_beltpull.js`, asked 2026-11-04):** a tier-2 belt piece (workbench: 2 conveyors, a gear, a copper bar; drawn in code over the conveyor sprite by a `beltSprite` wrapper, no atlas frames). It takes from its back and both sides strictly in turn (`o.mi`, `mergeInputs`, `mergeStep`) and sends everything the way it faces (a belt, a machine or crate, or the shed). Plain belts already accept from any side, but on a full line the input first on the map always won. During s_auto's belt pass an empty merger holds `MERGE_HOLD` so nothing pushes in, and `BELT_SPEED.merger` is -1 so the pass never moves it (0 reads as 1 there). Sides can be switched off in its window (`o.moff`).
- **Splitter settings (`x_beltpull.js`, asked 2026-11-04):** in its window: weights for straight, left and right (`o.so`, 0-9 each, as the belt faces; `splitSeq` turns them into a smooth repeating order, pointer `o.sp`), routes per item (`o.route` id -> 's' | 'l' | 'r'; a routed item waits for its own way) and Wait when blocked (`o.swait`; otherwise a blocked output is skipped). A splitter with any setting (`splitCustom`) is renamed `splitter~` during s_auto's pass and moved by `splitStep` (it takes from any belt sending into it, in turn); one without keeps the old straight/right alternation. `sendTo`, `takeFromBelt` and `beltOut` are shared with the merger.
- **Fuel:** `FUEL` burn ticks: wood 8, hardwood 14, charcoal 24, coal 36. Belts insert inputs first, then fuel.
- **Power** within 7 tiles: Windmill (always), Waterwheel (must touch water), Treadwheel (runs while fed hay, 1 hay per 20 ticks).
- **Water channels:** a channel touching water or a well carries water along connected channels; soil next to a wet channel is watered every morning (`waterFromChannels`) and every 3 ticks all day on the farm and every owned plot (asked 2026-11-05: the morning save is written before the channels water, so a game loaded from it, such as after an update, had dry fields until the next morning; channels laid or soil sown beside them waited a day too). Pieces are full squares drawn in code (`channelSpr`): a stone kerb on every side that doesn't meet another channel (mask `o.cm`, set in `waterChannels`, refreshed every 3 ticks and on map change), so bends, T-junctions and crossings join and there's no turning. Each connected run has a 10% chance each morning that one piece clogs with leaves (`clogChannels`, `o.clog`): water stops there until you clear it (interact, 1 energy); the morning report says so the same morning (clogs are rolled before `endDay` writes the report; they came a day late), and clearing one waters the soil along its run at once (`waterFromChannelsOn`).
- **Horse tools** (`x_implements.js`): set down on the farm as an `impl` object, hitched while riding (`S.hitch = { k, on }`), drawn behind the horse with traces (`impl_<k>.0/.1` in `art/sprites/implements.py`), G lowers/raises, E with nothing in front or the bar's Unhitch leaves it standing, dismounting unhitches. `implementTick` and the cart run through `asKind` (borrows `selKind`, now a `let`). Plough (tills 3 wide), Seed Drill (sows the first in-season seed you carry), Harrow (clears weeds and grass in the 3-wide strip ahead), Cart (what you pick up goes into a 400-item cart; interact with a crate to unload).
- **Simulation:** `autoTick` every game tick on the farm and owned plots even while you're elsewhere; `endDay` runs 300 catch-up ticks for the night. Placed pieces return their contents when picked up with the pickaxe.
- Tested: ore line (crate → smelter → crate, while away), wheat → mill → oven → bread on treadwheel power, keg loaded and emptied by belts, trip hammer → splitter into two crates, channel watering, cart load/unload, plough, seed drill and harrow.

## Balance (`public/js/t_balance.js`, design doc Phase 9)
- Loaded after `s_auto.js`; it overrides prices, costs and curves in one place, so retune here rather than in the data files. `BALANCE_TARGETS` lists what a player should have per season.
- **Quality:** one curve, `qualityRoll(L, bonus)`, for crops, forage, fish and fruit (animals: `animalQ`). Gold is ~16% of harvests at level 99 (~25% with rich compost); ember needs level 80+ and the best fertiliser. `QMULT` is 1 / 1.15 / 1.35 / 1.7.
- **Prices and costs:** crops -20% (regrowing -32%), seeds +15%, animal products cut so animals pay back in 3-4 weeks; buildings ~1.6x (`BP_GOLD`), tool upgrades iron 2000 / gold 5000 / mythril 12000; price perks +10-20%.
- **XP:** `xpScale(L)` multiplies XP above level 10 so one skill takes ~1h to 10, 5h to 30, 18h to 50, 50h to 70, ~200h to 99. Combat XP per damage: style 0.6, constitution 0.2, defence 1 per damage taken.
- **Made goods follow their materials (2026-11-03):** `priceMadeGoods` (end of t_balance.js, on DOMContentLoaded, after every script has added recipes) raises bars and parts to at least their ingredients' worth and weapons, armour and rings to at least 1.4x their materials (`MADE_K`, `matCost`); prices only rise. A steel helm went from 340g to ~1,700g; selling back for half (0.7x materials) is never a money loop.
- **Crafts priced by effort (2026-11-03, `repriceCrafts` in `x_fix6.js`, on DOMContentLoaded after `priceMadeGoods`):** each crafted item's sell price is its cheapest recipe's ingredient worth per unit × a tier factor: easy (skill under 3, no station) 0.75, medium (skill 3+ or a station) 1.25, high (skill 6+ or 3+ steps deep) 1.6. If every ingredient can be bought, it sells for under 85% of their shop cost, so buy → craft → sell is never a loop (Layer Cake 1300 → 325). Shop staples (salt, sugar, butter, flour, wood, ore...) sell under 85% of their shop price (`SHOP_PRICE`). Implements and the building hammer sell at half (`HALF_SELL`). Prices are set before a save exists, so it never calls `sellPrice` (its `demandOf` needs `S`).
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
- **Story recap (`x_recap.js`, loaded just before z_main so it wraps the final `renderQuests`):** every begun story's journal row is clickable (and has a Read button); `storyRecap(sid)` opens the story so far: each chapter reached, the done steps' hints ticked and their dialogue lines with speakers (`who`), then "Now:" the current step.
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
- **Crafting from the storage shed (`x_shedcraft.js`, loaded just before z_main, asked 2026-11-04):** with a finished Storage Shed (`S.structures` entry `shed`, stage 4), crafting at a station counts and takes from the bank as well, backpack first, with a toast naming what came from the shed. `SHEDCRAFT` is set only inside `canCraft`, `doCraft`, `jobStep` and `renderCraft`, and makes `cnt`, `catCount`, `take` and `catTake` include `S.bank`; everything else still counts the backpack alone. Without a shed it's the backpack only.

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
- **Developer mode** (`x_devmode.js`): a checkbox on the title screen, off by default and remembered in `localStorage` `emberhollow_dev`. The test scenarios (Test sandbox, Combat test, Kingdom test) show only while it's on.
- **Testing without touching the player's save:** use `http://[::1]:5173` (a different origin, so different storage) for automated tests.

## Crafting jobs (`public/js/x_craftjobs.js`)
- Crafting at a station is a timed batch (`JOB`, `JOB_TICKS`: workbench 2, furnace 3, anvil 4, kitchen 3, tanning 3 ticks per item). The window stays open with a progress bar and Cancel; it runs in real time (0.6 s steps) while the window is open and on the game tick when closed, until you walk away. No tool swing. Recipes have Make, x5, x10 and x100, capped at what the materials allow; repeating the running recipe extends the batch.

## Settings (`public/js/x_settings.js`, Phase 15)
- Stored for the whole game in `localStorage` `emberhollow_settings` (not per save). Options tab (Esc): master, music, effects and ambience volumes (gain buses; every sound goes through `audioOut()` in `a_core.js`, `BUS_MODE` picks the bus); zoom (auto or fixed 2/4/6/8, still even), particles (full/low/off, `PARTICLE_K`), FPS counter, fullscreen; and rebinding for 22 actions (Controls → Key bindings… opens them in a popup, `KEYPOP`), and a mouse cursor (`CURSORS`: arrow (default), sword, gauntlet, big crosshair, the old crosshair; drawn in code, `applyCursor`). The FPS counter also shows the game's own work per frame (`FRAME_MS`), since the frame rate follows the screen refresh.
- Rebinding works by translation: a capture-phase listener turns the bound key into the action's default key (`KEYMAP`) and swallows the default key if it was moved (`SUPPRESS`), so modules keep reading their default keys. Esc is fixed.
- Ambience (`ambientTick`): birdsong on spring/summer days, crickets on warm nights, wind in winter and cold biomes, rain, surf on the coast (`surfLoop`, 2026-11-04: one looping low noise that swells and falls about every 7 s, louder the nearer the sea: it starts within `SURF_R` 8 tiles of water in a coast biome; it was a burst of high-passed noise every half second over the whole coast biome, far inland), crackle near fires and lit furnaces, drips in mines.
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
- **Field seeds** (Mara → Field seeds): Meadow Grass (regrows, harvests into hay) and Flax (regrows every 4 days, 5-8 fibre). They are non-enumerable `CROPS` entries with `as: [item, min, max]`, so Collections and the seasonal seed list skip them.
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
  - Recipe search and category chips (RC swapped during `renderCraft`; `rcatOf`): Blueprints, Machines, Parts, Gear, Farming (fences, gates and horse tools too), Food (with flour, sugar, butter and salt), Tools & travel (staircase, warp totem, canoe, harpoon, crab trap, hammer); the Ember Pendant is Gear. Every recipe has a chip.
  - Backpack search, Sort and "Recipes & uses"; bank search, category chips with counts (`BANK_CATS`, rules on type and id, `MODAL.opts.kc`: Gear (with the staircase, warp totem and treasure map), Food, Farm, Fish & forage, Materials (monster parts too, from round 4), Building, Treasure & trophies (boss trophies, artifacts, ember shards), Story items), headings per category and a Sort button cycling type, name, amount and value (`BANK_SORTS`, `MODAL.opts.ks`).
  - Getting-started checklist; a shorter milestone list.
  - Door name plates; closed-shop notice; buy confirmation.
  - Combat bar only when fighting; watering-can level.
  - Out-of-combat regen and a low-HP warning.
  - The clock runs at 0.7×; starting bread; lower request rewards.
- **x_world.js:**
  - The pet (`S.pet`, Odile's stray quest, a `pet` entity on the farm, morning digs in `showDayReport`). It lives on the farm (`petBrain`): wanders to nearby open spots, sits and naps, and now and then trots over to you for a few seconds (at most every 45-90 s by its own clock `e.t`); a cat sits more and visits less. Walking adds a bounce and stretch per step; in a painted style pets use their smoothed pixel frames (`STYLE_SMOOTH`).
  - Picking wild flowers and mushrooms (1 energy each).
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
- **Building:** build sites take missing materials from the bank only with their Take from storage button (2026-11-05: they took them on opening, unasked), used-up blueprints leave the hotbar, blueprints have a Place button in the bag, and shops say which plans you need from Hale.
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

## Playtest 4 fixes (`public/js/x_fix5.js`, list in `docs/playtest/PLAYTEST_4.md`)
- **Critical:** an implement is only set down while you still have one; hotbar slots let go of items you no longer have. Animals also stand in their coop, barn or stable room (`animalsOn`, used by `f_render`); a store-bought pair is male and female (`balanceSex`); the sandbox pasture is mown.
- **Clicks:**
  - Far clicks with the hoe, can, seeds or fertiliser walk there and act; far water with the can or rod walks to the nearest shore (`shoreWater`). The auto tool leaves a can or rod you picked yourself.
  - Tall objects are clickable over their whole sprite; a clicked villager waits (`n.waitT`); a keeper behind a counter is reached across it (`counterNear`).
  - World clicks only land when the canvas is under the mouse. Input is ignored for a moment after a minigame or window closes (`INPUT_GAP`).
  - The station recipe search takes focus; Esc in a search box closes the window.
- **Seeing and moving:** sidestep sliding up to 9 px in any direction and `freeSpot` when stuck inside something; tree canopies fade over enemies too; damage numbers are drawn after the night grade (`LAST_WT`); the dock and key prompt fade when you're under them; bosses can't hurt you while shielded.
- **Riding:** implements work across the horse's movement, not the mouse, and say when they snag; getting off leaves the horse beside you.
- **Stories:** a story is announced in the morning it begins (`storyState` runs before the report). The tracker shows one arrow above your head with the target's name and distance, and finds villagers inside their shop. The village map shows villagers and the `!`, with labels that avoid each other. A passed-out line goes in the morning report; exhaustion skips lives. There's a night warning on the first trips into the Wilds.
- **Villagers:** Chat cycles lines (`CHAT`) and gives +15 once a day. The street Shop button is greyed outside opening hours. Keepers leave the counter at closing. The gift picker is just the bag. The farm notice board shows weather, festivals, birthdays and the request.
- **Combat:**
  - Combat test: spawns on land, packs come in from 100 px, bosses arrive on the right, Ranged is goblins and archers at level 10, Clear also empties hazards, effects and arrows, and quests and perk picks are off.
  - Balance: one hit is at most 14% of max health plus defence. Focus is +5 a hit before the tree. Bow and staff get their own starting loadouts. V only slots skills for the weapon you hold.
- **Canoe and fishing:** enemies lose track of you on the water; climbing in and out says so; seated lower with the rod, line and bobber drawn; a rod in the canoe casts where you click. Harpoon: a wider hit window, hit or miss feedback, and a brighter fish. Traps: the first missed pull is free and the band is wider; the bite window is 2 s.
- **Placement:** each ghost tile is green or red, and a refusal says why (`tileWhy`). The clock stops while you place. Implements have Set down in the bag.
- **UI:** the Satchel tabs wrap onto two rows. Item details sit beside the bag. Skills are a card grid. Ligatures are off (Cinzel's Ꝏ). Recipe rows read "4 Wood (have 15)". Short windows are small (`SMALL_WIN`).
- **Art:**
  - A hand-drawn Pale Lich (`lich_f` in `handdrawn.py`) and a village fountain over the plaza pond (`fountain` in `props_hand.py`; its tiles are paved and solid).
  - Museum cases show your donations (`furn_display_empty`); lanterns are dark by day (`lantern_off`); the indoor lamp is a table lamp; tilled soil is furrowed earth.
  - Spring maples are green; the manor crest is a quartered shield; Elias's robe is blue; under plate armour the sleeves are mail grey.
  - New icons: log bundle, boot, crown, coin, mask, amphora, flute, brooch, crystal, step cut, brilliant. Artifacts and minerals use them (`SHAPE`). Seed packets show their crop, implements use their own sprite, and the scythe icon has a long crescent blade.
  - Template outlines are channel level 4 (`px.py` outline, decoded in `pixSwap`), so they take each creature's own colours.
  - Second pass:
    - plaza paving wear and moss (`paintChunk`);
    - Wilds signposts to the mine and coast (`o.guide`, labels float when near);
    - the riding boot and a deeper side torso (`human.py`);
    - the passive tree in 3 px blocks;
    - pixel projectiles;
    - slimes sorted behind you;
    - Walk hints;
    - the sandbox Next day keeps you in place;
    - cheap crops +25% and 20 starting fibre.
  - Telegraphs and wind-up wedges are drawn on the art-pixel grid (`pxEll`, `pxBand`, `pxWedge`); chimney smoke is stepped pixel squares; the scarf wraps the neck after the head is drawn; a ponytail shows from behind.

## After 0.5.3 (end of `x_fix5.js`)
- **Cliffs:** cliff blocks (`r`, `x`, `mo` outdoors, not in towns, mines, rooms or on a map's outer edge) break after 14 pickaxe swings, fewer with better picks (`cliffAt`, `m.cliffHits`). They give 3-6 stone and become the biome's ground (`baseFor`, `m.cv++` repaints).
- **Nothing on cliffs:** loose objects on cliff tiles are cleared when a map loads; walking enemies spawned on a cliff move to open ground (`openTileNear`); drops resting on solid ground are moved off it every tick.
- **Damage:** action hits are ×0.6, so a wooden sword takes about 3 swings for a slime.
- **No stun-lock:** an enemy that has started winding up finishes its attack (hits during the wind-up don't knock it back or cancel it; a parry still does), and a combo finisher staggers the same enemy at most once every 2.5 s (`e.poiseT`).
- **Skill colours (`SKILL_FX`):**
  - Every ability gets a burst of coloured motes and a coloured pixel ring when used, and coloured sparks on what it hits.
  - Its own effects take its colours too. Effects created during a cast are tagged with `cols` (the `VFX` and `SKP` push overrides and new `PARTS`). `tintedDraw` then swaps their white and pale fills and strokes for the palette (`tintCol`, alpha kept).

- **Melee skill animations (`MELEE_ANIM`, `swingFx`):** with a melee weapon the equipped weapon itself moves, drawn with `heldIcon` and a fading trail of tinted copies (`ghostIcon`) in the skill's colour. The held weapon is hidden meanwhile (`WSPIN` in the `playerAction` wrapper).
  - Whirlwind: three turns round you while you turn.
  - Cleave: a sweep.
  - Ground Slam: raised, then slammed.
  - Blade Dash and Lunge: thrusts.
  - Leaping Strike: spins overhead.
  - Blade Storm: ghost copies of your own weapon.

- **Bow and staff skills (`RANGED_ANIM`, `RCAST`, `drawSkp`):** bow skills draw and loose the bow; staff skills raise the staff with a glowing tip in the skill's colour. Skill projectiles are pixel art with trails: arrows with a head and fletching (a glow for Piercing Shot), flickering fireballs and bolts. Rain of Arrows drops real arrows, Arcane Orbs are pixel stars and Meteor is a burning rock with a tail. The old projectile drawing in `x_skills.js` and `x_combatfix.js` steps aside when `drawSkp` exists.
- **Combat skills page (V):** every unlearned skill lists what it needs with ✓ and ✗: the style level (and yours), the skill before it, a free tree point (one per 5 levels) and the weapon to hold.

## Canoe (`public/js/x_canoe.js`)
- Made at a workbench (40 wood, 4 hardwood, 12 fiber), worn in the Boat slot (`S.eq.boat`, between the rings). While worn, deep water (`w`) is open to the player's `moveEnt` and `walkTo` (`withWater` lifts `TER.w.solid` for that call); `S.p.boat` follows the tile under you, so you climb in and out at the shore. Drawn seated in the hull with the near gunwale over the legs, a paddle stroking side to side and a wake (`canoe.0/.1` in `implements.py`).

## Building hammer (`public/js/x_hammer.js`)
- Workbench: 6 wood, 4 stone. Held, interacting with one of your buildings (E / RMB, or LMB on it) opens Move / Remove. Remove = `demolish()` (half the materials back; sites return everything). Move lifts the building (`MOVING`, `PLACING`) and uses the placement ghost; left click sets it down, right click / Esc / leaving the map puts it back. Hale's Demolish list is replaced by a pointer to the hammer. The shipping bin and campfires on the farm move with it too (`x_objmove.js`, asked 2026-11-04): E or right click with the hammer offers Move, the object lifts off (`OMOVE`) and a green or red ghost follows the mouse; left click sets it down, right click, Esc or leaving the map puts it back. The farm saves its objects as they are, so the new spot stays.

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
- Every tier has its own weapon, shield and tool icons (`gi_<item>`, `gi_tool_<kind>_<level>`), used in the hotbar, bag and hand. Helmets (`hb_helm_<tier>_<d>`, full head, accent in the plume channel) and cuirasses (`hb_arm_<tier>_<d>`, new channels `armor` and `trim`) are drawn on the character; a cuirass is drawn for the standing arms, so `armFit` (h_pixel.js) fits it per body frame: sleeve armour goes where the arm moved off, and if the standing arm was plate, the moving sleeve is coloured as armour; `GEAR_ACC` holds each tier's accent.
- Farm animals and the horse, the Hollow Vale creatures and the regional ones are redrawn with the same sizes and channels; `art/preview_creatures.py` and `art/preview_armor.py` render preview sheets to `art/out/`.
- **Hand-pixelled creatures** (`art/sprites/handdrawn.py`, overrides the earlier modules): every animal, enemy and boss is drawn from hand-placed pixel grids and hand-picked outlines with flat cel shading (`grid_sprite`; letters b/m/d are regions, digits and E/W/N/T/R/O/Y/G/g/C/I/J are placed colours). Each has 4 walk frames (`an_<sp>.0-3`, `en_<art>.0-3`) and enemies a wind-up and a strike (`en_<art>_atk.0/.1`). `x_creatureanim.js` picks frames (`animFrames`, `enemyFrame`: wind-up while `e.wind`/`e.tele2`, strike while `e.lunge`). Preview with `art/preview_hand.py [names]` -> `art/out/hand.png`.
 in `public/js/l_pack.js`)
- `S.pack` is the backpack: 28 slots of `{ k, n }` (k = item key, `id` or `id#quality`). Weapons, armour and rings take one slot each; everything else stacks in one slot (`SINGLE` set). `S.inv` is a read-only view (key -> total) so older code keeps reading it; all writes go through `give` / `take` / `takeK`.
- A full backpack never deletes items: `give` drops the rest on the ground, and ground pickups stay put until there's room.
- Worn equipment: weapon, head, body, shield, feet, two rings (RuneScape layout in the Items tab). Gear needs a Combat level per tier (`TIER_REQ`). Swapping checks for backpack space.
- `S.bank` is unlimited storage, opened from the storage chest in the farmhouse and the bank chest in Mara's store. `S.presets` holds three equipment loadouts (save / load in the bank window).
- Saves from before the backpack are migrated on load (`ensurePack`): stacks go into slots, anything that doesn't fit goes to the bank.
- Never an infinite bag: bulk storage belongs in the bank or storage chests.

## Briarholt Castle and The Empty Throne (`x_kingdom.js`, `x_story2.js`; art `castle.py`, `castle2.py`, `procession.py`; plan `docs/IDEAS_KINGDOMS.md`)
- **The castle plot:** map `castle` (68x52, in `PERSIST`), through the farm's south-east tree line (x 44-46). A sign stands there from the start; the way opens with `S.story.flags.briarOpen`.
  - **Walls:** `cwall` objects with a join mask (1 N, 2 E, 4 S, 8 W). Each is 32x96: a wall-walk band at y 8-40, and a face only where the run ends to the south.
  - **Gate and towers:** 2x2 `ctower` objects, and a `cgate` arch whose right half is a non-solid `gpart`, so both gate tiles are open. All have `_w` winter versions.
  - **Buildings:** the keep `bld_castle_18x10` (door act `castle`) and the glasshouses `cgh_W`/`cgh_E` (any season).
  - **Ownership:** `flags.castleOwned`; `castleLand()` adds the grounds and glasshouses to `ownedPlots`.
- **The art:** the walls, towers and keep have hand-placed wear (`weather`: cracks, rain streaks, moss tufts), machicolations (`corbels`), string courses on the towers and vine-by-vine ivy (`ivy`). The glasshouses are iron-framed orangeries with citrus trees showing through the glass (`greenhouse`, `glass_bay`, `glass_roof`).
- **The keep has three floors (`KEEP_PLANS`, `genKeepFloor`, rebuilt every load):**
  - **`castle_in`:** throne room with pillars, great hall, library, chapel, kitchen with the great hearth, pantry, armoury, guard room, and an entrance hall with the grand stair up and the stair down.
  - **`castle_up`:** your bedchamber, the solar, Isolde's chamber, the bath, the portrait gallery and the map room.
  - **`castle_down`:** wine cellar, treasury vault (a hoard to search once: 5000g), dungeon cells, and the crypt of the kings (Margit's empty tomb).
  - **How a floor is described:** walls `['v', x, y0, y1]` and `['h', x0, x1, y]` (3 thick), `doors` rectangles, `rooms` with names and floor tiles (shown as you enter), `links` for the stairs (`k_up` / `k_down`).
  - **Wall painting:** `pixRoomWalls` draws a face wherever a wall has floor below it.
  - **Furniture:** the hand-pixelled pieces are letter grids in `castle2.py` (`grid`, mirrored where symmetrical): pillar, throne, wardrobe, war table, bath, hearth, wine rack, cell bars, tomb, hoard, stairs, portraits.
- **The Empty Throne** (`STORIES.throne`, 13 chapters) starts when The Hollow Crown is done; Elias, Marta, Sigrun and Aldren hint at it.
  - **Chapters 1-3:**
    1. The herald's procession (`procStart`/`procFrame`: knights, the herald and two wagons come in by the village road and park; the story herald shows only once he's arrived).
    2. Elias, Margit's seal and Ashcombe's key.
    3. The warm kitchen; Isolde in the throne room; buying the deed (`st.pay`).
  - **Chapters 4-13 (`x_story2.js`):**
    4. Captain Vey and riding with patrols (`kill` `*assist`).
    5. The hunters' camp near Ashford: bandits gather round it, then Rudd.
    6. Finn, Mags and Captain Harrow at Saltmere.
    7. Proof for Mayor Osric; Halvard's highland raiders (`kill` `*bio:highlands`); Vey sends knights.
    8. **The siege of Briarholt.**
    9. The council at Kingsbridge (the bloodline choice, `flags.bloodline`).
    10. The oath of the Ember Stag (the Warlord, a night vigil in the chapel, the Ring of the Ember Stag).
    11. The Cinder Drake and its egg.
    12. The egg hatches (`S.dragon`: hatch in 5 days, grown in 14) and you get the dragon whistle.
    13. A "to be continued" step for the capital.
  - **Story places:** `town:<id>:<spot>` and `castle:gate|hearth|throne|chapel|maproom|crypt|hall`; town keepers are found through `npcWhere`.
- **Siege (`SIEGE`):**
  - It starts when the siege step waits, `flags.knightsAtBriar` is set and you enter the grounds.
  - Four waves (`SIEGE_WAVES`, the Warlord last) come through the gate; six of Vey's knights hold the courtyard and come to your side.
  - Leaving or being knocked out calls it off until you return. Winning sets `flags.siegeWon`.
- **Ballista and barricade:**
  - Both are placeable items on any owned land (workbench recipes). They are hand-pixelled.
  - A ballista shoots a bolt at the nearest monster within 150 px every 1.6 s (`ballistaFrame`, `BOLTS`).
- **Dragon flight (`S.flying`):** the dragon whistle (or R to land) lets you fly.
  - In the air `moveEnt` ignores obstacles at 2.6× speed, you can't be hurt and tools are off, and you land only on open ground.
  - It's drawn in the overlay pass with `drake_mount.0-2` (hand grid, doubled with Scale2x in `castle2.py`) and the rider in the `ride` pose.
  - The drakeling naps by the kitchen hearth until it's grown.
- **Tested on `[::1]`:**
  - the whole story by an automated driver;
  - the siege won (with 2 ballistae);
  - flight;
  - an old save moving onto the new Wilds.

## The court of Briarholt (`public/js/x_court.js`)
- **The grounds** (in `genCastle`):
  - a paved fountain plaza before the keep (the village `fountain` sprite over solid basin tiles);
  - hedged flower beds with topiaries, and banner poles along the road and by the keep door;
  - a training yard (dummies, archery targets, hay, a weapon rack), stores (barrels, crates, sacks, hay) and four knights' pavilions.
  - They're all `furn_<k>` objects. The yard pieces are hand grids in `castle2.py`: `dummy`, `target`, `haybale`, `sbench`, `hedge`, `topiary`, `bpole`, `pavilion`.
- **People (`COURT`)** appear with the story (`courtOn`), on the grounds and on the keep floors:
  - **From the day the way opens:** Aldous the steward and Wenna the gardener. They have their own `pre` lines before you own the castle.
  - **Once owned:** guards at the gate and the keep door plus one walking the grounds, a maid, a stable hand; inside the keep, the cook, a scribe, the chaplain, throne guards, a door warden and maids.
  - **Once `knightsAtBriar` is set:** knights drill at the dummies (they swing on a timer) and Ser Bram walks the yard.
  - **After the council (`flags.bloodline` set):** lords and ladies in the gardens, Tobin the bard by the fountain, courtiers in the great hall and a lady's maid upstairs.
- **How they move and talk:** each walks between its own `spots` on `findPath` (guards on `post`, the walking guard on a `loop`) and pauses between walks.
  - Talking goes to `k_court` (story steps speak first).
  - They're runtime-only `m.npcs` entries (`court: 1`, state in `CSTATE`), and NPCS entries hidden from Friends.
  - During a siege they stay indoors.
- **Kingdom test** (title screen, `startKingdomTest` in `x_combattest.js`): a throwaway game with The Hollow Crown finished (the herald rides in on the first morning), combat 30, iron gear and 20,000 gold.

## Crowds (`public/js/x_crowds.js`, art playtest in `docs/playtest/art/`)
- **Village folk** (`VILLAGE_FOLK`): eight walkers on the village's streets and plaza by day (`villageSpot`); they're kept in `v.npcs` across `lifeTick`'s rebuild.
- **Patrons** (`SEATS`): sit and stand at the same seats in the Drowsy Drake (`in_tavern`) and every town inn (`in_<inn act>`), two at lunch, up to seven in the evening.
- **Evenings:** Brann's and Hale's evening `SCHED` place is `'tavern'`; they appear inside as `REGULARS`.
- **How they work:** runtime only (`crowd: 1` in `m.npcs`), hidden from Friends, and they talk through `k_crowd`.
- **Briarholt:** gains an old household before you own it (`bh_porter`, `bh_laund`, `bh_groom`, `bh_scull` in `COURT`). Everyone but posts and diners leaves the grounds at night (`courtOn`).
- **Night lights:**
  - Indoors, candelabras (`meta.light` in `castle.py`), fireplaces and lamps glow (`FLAMES`, `nightLights` at a fixed 0.6 indoors).
  - The keep and every inn always have lit windows.
  - Torches stand by the keep door and gate (a `genCastle` wrapper).
- **The keep's wall tops** are dark stone coping in 16 px blocks (`pixRoomWalls` in `x_kingdom.js`).
- **The see-through player** only shows when a tree, a tall object directly in front, a building or a villager really overlaps you.

## Guilds (`public/js/x_guilds.js`)
- **The guilds:** `GUILDS` keyed by act: `gh_guild` (Miners', Greyhelm), `af_guild` (Hunters' Lodge, Ashford), `sm_guild` (Anglers', Saltmere), `kb_guild` (Growers', Kingsbridge).
- **Halls:** each converts a townhouse in the town plan (`house`), registers its guildmaster in `TOWN_NPCS`/`NPCS` (Dorrik, Brakka, Nessa, Florian), a room (`ROOMS[act]`, counter plus themed props), hours 8:00-20:00, and `townMenu` → `openGuild` (tabs Guild, Ranks, Guild store, Titles).
- **Ranks:** five per guild, each with `tasks`: `bring` (taken on promotion), `skill` (life skill L), `cskill` (combat style), `stat` (a function and a target), `boss` (`S.bosses`), `kills` (counted since joining in `S.guilds[act].kills`). Rewards: gold, items, `tool` (+1 level, max 5), `unlock` text. The store is gated by rank.
- **Guild-only items:** `hunt_bow`, `ashford_greatbow`, and the rings `ring_delver`, `ring_greyhelm`, `ring_tracker`, `ring_antler`, `ring_angler`, `ring_pearlhook`, `ring_grower`.
- **The Guild Seam:** the mine mouth in Greyhelm (act `gh_seam`) opens at Hewer rank. `genSeam` makes a dense ore cave (`gseam`), rebuilt every visit, full only on the first visit of the day.
- **Titles:** `S.titles` and `S.title`; guildmasters greet you by your title. State: `S.guilds[act] = { r, kills }`.

## Round-3 polish (0.8.0)
- **World text** uses the normal fonts (Fredoka), drawn by the canvas at screen resolution. A pixel-font version was tried and dropped at the user's request.
- **Walls:**
  - Town wall masks no longer wrap round rows (west and east walls were "joined sideways").
  - North-south runs draw a shaded east face (`cwall`, 80 px canvas) and a shadow past it.
- **Cliff tops** are a touch lighter than the ground, with a 3-px lit far rim (`cliffTop` in `h_pixel.js`).
- **Turf roofs** are laid in sod rows with a lit ridge, and their flowers are rare (`roof_px` in `buildings.py`).
- **Variety:**
  - Kingsbridge's stalls cycle the four regional stall designs.
  - Each town's inn keeps the shared seats but has its own floor, walls and props (`INN_LOOK` in `x_terrain.js`).
- **Mounted NPCs:** an NPC entry with `horse: <coat>` is drawn mounted (`drawNpcRider`). The herald's procession rides.
- **HUD:** `#abil` (Z/X/C and Focus) sits centred just above the hotbar.
- **Clicks:** acting on something refuses routes over three times the straight distance plus 15 tiles (`walkTo` in `m_core.js`).
- **Guilds:** halls are labelled "Guild" on the map; a toast says when a rank is ready; each guild has its own first-rank title; Hewer needs Mining 5.

## Generations (`public/js/x_heirs.js`, on top of `x_family.js`)
- **XP:** each generation adds +10% to every XP gain, life skills (`addXP`) and combat (`cxp` wrapper), with no cap (`F.bonus`): generation 2 is +10%, generation 21 +200%.
- **Choosing the heir:** the Farewell window lists the spouse and every grown child. The others go their own ways (`F.siblings`, `F.parted`): grown ones set out for distant lands, younger ones live with the surviving parent. The heir's own children start fresh.
- **The will** (`investiture`, after the heir's first morning):
  - It reads out the deeds (farm, owned plots, Briarholt) and the guild seals. Guild ranks and every title pass down unchanged.
  - With Briarholt, the heir is invested by Aldous and chooses Lord or Lady. With the royal bloodline (`flags.bloodline` 1), Isolde crowns them King or Queen.
  - The style becomes `S.title`.
- **Suitors** (`S.fam.suitors`, `SUITOR_KIND`: bookish, bold, gentle, merry, crafty):
  - About 4 within 8 years of your age at all times. They have their own looks, heart scenes, dates, gifts and trade, walk the village by day (`CROWD` walkers), and talk through `k_suitor` (greeting with gifts, romance buttons and a daily Chat).
  - Those out of range move away at each change of season; new ones arrive.
  - The original five are courtable while within 15 years of you. `ROMANCE[id]` is registered for each suitor, so the existing Ask out, Propose, wedding and children flow works. A wedding records the spouse's real age.

## Bandits, packs and goblin tribes (`x_bandits.js`, `x_goblins.js`, art `goblins.py`)
- **Bandit patrols** (`BANDIT_PATROLS`): 3-5 `bandit`/`archer`/`banditchief` spawn on a Wilds road 26-60 tiles away (not the farm-end roads), from day 3, at most 2 at a time.
  - Each bandit's `home`/`hx` walks with it, so the leash never pulls it back. A patrol goes on along another road at each end and moves on after 7 minutes.
  - Near you (130 px) the normal AI fights you. Otherwise they attack knights and guards (`bHitAlly`) or monsters (`bHitMonster`), and monsters strike back.
  - They're kept out of the 36-tile despawn (110 tiles), spawn past the town slime ring with `window.SPAWN_RAW`, and show as red marks on the Wilds map.
- **Packs:** a wild spawn of a `PACKS` monster (slimes, wolves, crows, bats, jellies) brings 1-4 more of its kind (`WILD_SPAWN` flag around `wildSpawns`).
- **Goblins:**
  - The old green humanoid is now `zombie`, a night shambler in the forest. `goblin` (spear) and `goblin_slinger` use the new `en_goblin` template; `ogre` uses the brute frame with a club.
  - `placeCamps` puts 6 camps in the Wilds (`m.gcamps`: clearing, 1-3 `furn_gshack`, `furn_gtotem`, `furn_gspit` with a flame, a chest).
  - A tribe of 3-6 (sometimes an ogre) appears within 34 tiles (`campTick`, `S.gcamp`) and is back 2 days after being wiped out. Camps show as green triangles on the map.

## The welcome tutorial (`public/js/x_tutorial.js`)
- **The opening:** on a new game, after the character creator, Lord Ashcombe walks up the farm road to you instead of the arrival letter appearing. The `openModal` wrapper swallows the 'Hollowmere Farm' letter while `S.flags.tutIntro` is set.
- **The choice:** he welcomes you, then offers "Show me around" (starts `STORIES.welcome`, "A New Start") or "I know my way around a farm" (one line of tips, then he leaves).
- **Fences:** after tilling, Ashcombe warns that open soil goes back to grass each morning; after the workbench he explains fencing fields with a gate (channels and buildings close a side too). The skip line mentions it.
- **The tasks:** each is a `cond` step whose completion lines are Ashcombe calling out the next task: scythe weeds (hay), till, plant, water, chop, mine, make something at the workbench (`S.stats.crafted` above `S.flags.tutCraft0`). Then he walks you to the village plaza, you meet Mara, and you sleep. A note on the tent ends it (250g, 3 Trail Bread).
- **Ashcombe on the farm:** a hidden NPCS walker (`tut_ashcombe`, `k_tut`). He stands by you while you work, repeats the current task when you talk to him, walks home after the village step, and is gone the next day.
- **State:** `S.flags.tutWalk` (1 arriving, 2 staying, 3 leaving). Old saves never see it.

## The Warrens under Briarholt (`public/js/x_warrens.js`, art `art/sprites/vermin.py`)
- **The way in:** a broken hole (`furn_hole`, act `k_warren`) in the Wine Cellar floor of `castle_down` at (17, 9) drops into `warren_1` to `warren_3`. Rope ladders (`furn_ropeup`, `k_wup`) lead back up.
- **The maps** (`genWarren`, `caveCore` earth theme, dark) are rebuilt every visit and never saved; a save made there loads on the farm.
- **Enemies:**
  - Cellar Rat, Plague Rat, Giant Rat (charges) and Cellar Roach. They drop `rat_tail` and `bug_shell`.
  - **The Rat King** (`ratking`, kit: charge, summoning rats and plague rats, circling; triple charge in phase 2) holds floor 3.
  - He drops `rat_crown` (2,500g) and returns 7 days after he's beaten (`S.flags.ratKing`). The nest's chest is there once (`S.flags.ratChest`).
- **Art:** hand-placed point templates like the beasts in `handdrawn.py`. `rat_f(k)` draws each size at its own scale (`rat` 1, `bigrat` 1.5, `ratking` 2.5 with a crown) so pixels stay crisp, and fixed pinks `K`/`Q` keep tails, ears and feet pink on every coat.

## Walls, terrain, roads and town trades (`public/js/x_terrain.js`, art `castle.py`, `townprops.py`)
- **Walls:** `cwall` sprites are 128 art px tall (`PH`); towers 192. North-south runs have raised parapets and a 14 px dithered east shadow (64 px wide canvas, 16 px padding).
- **Cliffs:** `connectCliffs` joins every open pocket of 12+ tiles to the map by a 2-wide pass, and cuts a 2-wide gap through thin (1-2 tile) cliff ridges once per 20x20 cell, in the Wilds and the regions.
- **Roads:** `realmRoad` is a Z (long leg, a turn on dry land, across, on). It merges onto an older road within 3 tiles. Side paths (`carvePath`) and the towns branch off the nearest road already laid.
- **Town trades:**
  - Greyhelm stands on stony ground with a mine mouth, rails (`furn_rails`, flat and walkable), mine carts and slag heaps.
  - Ashford has log piles and stumps.
  - Saltmere has rowboats and fish-drying racks.

## The realm: a bigger Wilds, towns, guards and patrols (`public/js/x_realm.js`, art `art/sprites/towns.py`)
- **The Wilds are 440x330** (`WK` 2.2 in `d_world.js`; `WW`, `WH`, `WIN_F`/`WIN_V` for the farm and village roads, `EW`/`EH` for the explored fog). Region gates scale with `regionGateX`. Old saves get a new Wilds once (`S.wildsVer` 2).
- **Saves of big generated maps store only their changes** (`DELTA_MAP`, `baseSnap`, `diffO`, `applyDelta`; `ms.d`, with `ms.w`/`ms.h` so a map of another size is regenerated): the Wilds, the regions and Briarholt. A save went from ~470 KB to ~80 KB.
- **Towns (`TOWNS`, hand-laid plans placed per world by `townSpot` in a fitting biome, then `stampTown`):**
  - **Kingsbridge:** a walled city: towers and four gates, a plaza with a fountain and market stalls, temple, town hall, inn, emporium, bank, smithy, barracks and 14 houses.
  - **Greyhelm:** a walled mining town: longhouse, inn, forge and miners' supply.
  - **Ashford:** a fenced woodcutters' village: tavern, trading post and sawmill.
  - **Saltmere:** a fishing village with a pier: tavern, fishmonger and chandlery.
  - **Connections:** roads join them (`m.roads`, carved before the towns are stamped), with signposts at every exit and at the crossroads (arrows to the other towns), and a waystone in each (`wilds_<id>`). Towns are on the world map.
  - **No spawns:** no monsters spawn within 10 tiles of a town (the `spawnEnemy` wrapper). Town trees can't be cut.
- **Shops:**
  - Every shop has a room (`roomFor` → `ROOMS`), a keeper (`TOWN_NPCS`: 18 new villagers in `NPCS` with friendship, gifts and lines), opening hours (`HOURS`, `SCHED`) and a menu (`townMenu`). Story steps waiting on a keeper speak first.
  - The menus are: inn meals and rest (free at 6 hearts), shop buy/sell with a trade bonus, forge, bank, a temple blessing, and town jobs.
  - **Town jobs (`TOWN_JOBS`, `S.realm.q`):** kill jobs by biome, bring jobs, and the barracks' patrol job.
  - **Standing:** `S.realm.rep` per town; 50+ gives friend prices.
  - **Off duty:** keepers walk to a town spot outside their hours (`townLife`, `townWalk`).
- **Allies (`ALLIES`):**
  - Town guards (`guard_kb`, `guard_gh`, `guard_v`) hold posts, and knight patrols of 2-4 (`knight_a/b/c`) walk the roads between towns (`PATROLS`, a path between road ends).
  - They're NPCS entries hidden from the Friends tab, drawn as villagers with a sword and a health bar.
  - **Fighting:** they target the nearest monster in reach (`allyFoes`), move by point collision with a path fallback (`allyMove`), and strike (`allyStrike`). A kill counts as yours if you're within 140 px.
  - **Getting hurt:** monsters next to them hurt them; when beaten they fall back and return later.
  - **Patrols** spawn on a road end 25-90 tiles from you, so they ride past where you are.
- **Townsfolk (`CITS`):** people walk each town's streets by day (Kingsbridge 12, Greyhelm 6, Ashford 4, Saltmere 5).
  - Each has a look made from their id, a role and town lines (`k_cit`), and they're hidden from Friends.
  - Every Kingsbridge market stall has a vendor.
- **Roads:** `realmRoad` lays long straight runs that only turn on dry land, so bridges are straight. It clears trees whose canopy would hang over the road. Gateways are paved through to the road.
- **Placement:**
  - `townSpot` falls back to the best spot it saw when no ideal one exists (Kingsbridge was missing in some worlds).
  - Signposts stand beside a gate's road, never in it (`signNear(..., side)`). The crossroads sign points home too.
- **A gentle ring:** within 18 tiles of a town, and in the Wilds' 22 southern rows where the home roads come in, creatures spawn at level 0-1 and flyers (crows, birds, bats) as slimes. It used to swap everything for slimes in a much wider ring, so wolves, boars and goblins hardly appeared (2026-11-02). Never in the sandbox or combat test.
- **Waystones:** the farm and village stones are attuned from the start; travel lands on a free tile (`wayLand` in `u_regions.js`).
- **Walls:** pieces with no east neighbour cast a hard contact shadow on the ground to the east (sprites are 48 wide, 8 px padding each side), so north-south walls read as raised.

## Playtest night fixes (end of `x_court.js`, plus small edits; log in `docs/playtest/night/FINDINGS.md`)
- **Room furniture:** a room's keeper and its counters call the current `doorAction` (`i_interior.js` used a copy from before the towns, so town menus never opened).
  - A keeper behind a counter is reached across it (`clickTarget` → `counterNear`).
  - Furniture inside a room's doorway is cleared.
- **The story:**
  - A story waiting on a shopkeeper speaks even while the shop is shut.
  - Story objects glint gold (the kitchen stove steams) and E reaches them from any neighbouring tile.
  - Wide buildings' doors open from the tiles either side.
  - Closing a dialogue blocks world input for 0.4 s.
  - The journal lists the tracked story first.
  - The tracker names story characters and says "Go outside" indoors.
- **The procession:** each rider gets a free tile, and the wagons clear weeds and stones to park. `farm:home` needs a free 3×3 spot (cached as `['farm', x, y, 'roomy']`).
- **The camera** may scroll slightly past the top and bottom map edges, so the HUD and hotbar never cover you.
- **New games** start with Trail Bread in hotbar slot 0. Getting-started steps are checked in the background.
- **Shops:** the big-buy confirm keeps the button's text and uses the row's real price.
- **Weapons:** with a weapon, any foe within 200 px means a click attacks. Round 3 asked for this after far-click walking made aimed swings drift.
- **The tracker** follows the walking route. It paths to a free tile beside the target (targets are usually solid), and `exitToward` leads to building doors, the keep's door and its stairs.
- **Inns** are open all night. After 6 pm they offer "Sleep here until morning" (`S.flags.innWake`, and you wake at the inn), plus a hot meal eaten on the spot.
- **Town jobs:** kills count within 60 tiles of the job's town, each kill toasts progress, and taken jobs are listed in the journal. With the patrol job on, patrols come every 10 s.
  - Patrols never stall: stragglers catch up, a stuck leader skips ahead, and a patrol retires after 6 minutes.
- **The Wilds map:** roads, town footprints, building labels and patrols (purple shields) are drawn.
- **Waystones** attune when you walk up to one. Briarholt has its own stone (`castle`).
- **Time:** warnings at 3 am and 3:45; you collapse at 4 am (`S.time` 1680, e_play.js; was 2 am until 2026-11-05). Once Briarholt is yours, a day that ends in the castle wakes you in the royal bedchamber.
- **Floors and walls:**
  - New floors: `fl` (flagstones) and `mb` (chequered marble), with `ground_fl` and `ground_mb` in ground.py, for the keep and town rooms.
  - The throne stands on `dec_dais`.
  - Wall bodies: an east-west wall run also blocks the tile north of it (`wallBodies`); north-south runs don't, so side gates stay 2 tiles wide.
- **The court** dines in the great hall at noon and in the evening (`meal` entries). Aldous has `met` lines once you know Isolde, and Isolde lives in the keep after chapter 2.
- **Fonts:** the "Cinzel" face is Cinzel Decorative, so every Cinzel text is set in uppercase (its lowercase letters are ornamental capitals).
- **Cheese:** the Cheese Press item is `cheese_press` (placed object kind still `cheese`; picking it up gives the item back), so `cheese` is the food. `migrateCheese` runs once per old save (`S.flags.cheeseV`).
- **After the night:** the tracker's name label shows for 4 s after the target changes and while you stand still; inn take-away is plain fare only; local maps draw castle walls, waystones and stairs; trees, bushes, posts, signs, benches, dummies and targets (`NARROW`) are solid only in x 3-13 of their tile, and the player sidesteps up to 14 px round them.

## Art styles (`public/js/x_artstyle.js`, `x_artlight.js`, `art/style_free.py`, `art/style_build.py`, `comfyui/restyle.py`)
- **The switch:** Options → Graphics → Art style (`SETTINGS.artStyle`: `pixel` or `painterly`), live, no reload. A style is a second atlas in `public/art/styles/<style>/` (`atlas.json` + `atlas_<page>.png`, 4096 px pages) with the pixel atlas's sprite names. `PIX.get` uses the style's frame when it has one and the pixel art otherwise; frames carry `k` (style px per pixel-art px), so `ww`/`wh` stay in world units and collisions, anchors and `meta` are unchanged. Switching clears `PIX.cache`, `PXG.tex`, `CHUNK` and the sprite caches (`HC`, `ACACHE`, `ECACHE`, `CROPSPR`, `ICACHE`).
- **Drawing:** the world canvas's `drawImage` draws any sprite with more than 2 px per world unit smoothly (so copies such as sway frames and scaled bosses count too) at `imageSmoothingQuality` `ART_Q` = 'low': 'high' builds mipmaps on every draw and took a full scene from 7.6 to 35 ms a frame. Pixel art stays crisp. Hi-res chunks and recoloured templates are handed back as fresh canvases (`gpuCopy`), since Chrome keeps read-back canvases on the CPU. Ground: `pixGroundHi` in `h_pixel.js` paints chunks at the ground textures' `k` (4) with the same terrain shapes, foam, lips and rims; where terrains meet it picks the terrain with the most bilinear weight per hi-res pixel (smooth edges, not art-pixel steps), a broad `fbm` light and warmth drift hides the texture's repeat, and on soft natural grounds (`SOFT`: grass, dirt, sand, rock, snow, ash, ice) patches of a mirrored, shifted copy of the texture fade in (`mixw`; not on paving or floors, where it showed doubled stones). Cliffs and bridges are drawn in art px on their own layer and laid on smoothly; room walls and decals are drawn on the scaled canvas in art px (`c.hi`; decals with an explicit art-px size).
- **Templates** (creatures, crops, icons) are stored encoded: R = channel, G = shade (20 + level / 3 × 200, continuous), B = 254; other pixels keep their painted colour. `pixTemplate` → `styledSwap` maps the shade onto the creature's own ramps, so one painted template serves every colour variant.
- **Making a style: free painting** (`art/style_free.py --build`, which also packs the atlas; ComfyUI Desktop on 127.0.0.1:8188 with Qwen Image Edit 2511 fp8 + the 4-step Lightning LoRA). The user chose painted art that isn't bound to the pixel art's outlines (2026-11-02): the pixel sprite is only a guide to what an object is, how big it is and where it stands.
  - **One look (2026-11-02):** every prompt ends with `FLAT` (flat, straight-on, like the pixel art; no perspective or isometric view): painted alone or with only freedom, objects drifted into a turned 3D view. Small sprites (8x sheets) and the redone props are fed softened (`soften_up`: smooth enlargement, a half-art-px blur), since crisp enlarged pixels come back as tidied pixel art. The keep is painted beside two village buildings (`CASTLE_WITH`, not cut). Tried and dropped: painting each object alone (3D, a different style), and a house and tree as style company on every sheet (the company came out isometric).
  - **Bases** are painted freely (`FREE` prompt; buildings also keep doors and windows about where they are) on a **magenta card** (`KEY`): whatever the model paints on it (shadows, light, glow) stays magenta-ish, so `background()` cuts it away and gaps under roofs or inside stalls stay open. Input scale (`gen_for`): buildings 2x (at 4x the model traces instead of redesigning), props 4x, sprites of 40 art px or less 8x. Sheets are size-sorted, ~2.4 MP, with room (`PAD` .35) to grow into.
  - **Cutting** (`cut`): the painted parts touching the middle of the sprite's cell, holes filled except where the card shows, `defringe`d. A painting under .45x or over 1.8x its pixel box falls back to the old method.
  - **Frames keep the pixel sprite's box** as `ww`/`wh` (positions, collisions, clicks, windows, chimneys unchanged) and carry `ox`/`oy` in the atlas: where the painting lies against the box; `PIX.get` turns that into `c.off`, and a `drawImage` hook in `x_artlight.js` (outermost on the world canvas, and on the 2D context prototype) draws the painting there, spilling past the box. Icons and floor decals (`CONTAIN`: `gi_`, `ui_`, `dec_`) are fitted inside their box instead.
  - **Variants are word edits of the painted base** (`plan`, `EDIT`, `VAR`), so they stay the same object (an edit of a whole sheet sometimes comes back zoomed out, so `realign` scales it back onto its base by the painted extent and bottom line): `_w` winter snow, `_l2`-`_l4` upgrades (each from the one before), `_ruin`, a lamp lit from `_off`, a display filled from `_empty`, tree seasons from summer (`tree_<k>_1_<v>`: spring, autumn, bare winter or snow on evergreens) and fruit. A pixel variant as a second reference image (`restyle.run(img2=...)`) was tried: the model copied its blocky snow.
  - **Still painted to the pixel outline** (`style_build.py objects`, its cached sheets): pieces that must join (`fence`, `cwall`, `cgate`), animation frames (`.N`), and failed free paintings. There, each sprite is found on the sheet (`register`, `fit_bbox`), checked (`likeness`, `OBJ_IOU`), repainted over its own softened drawing when the full repaint moved or redrew it (img2img, 12 steps at .92), and winter sprites are `winterize`d. Templates (creatures, crops, icons) and ground textures are made by `style_build.py` (see below); `style_free.py --build` packs them from its cache.
  - **Stage cache:** the CPU stage per sheet (cut-outs, door placement, window glow, template fitting, ground prep) is cached in `comfyui/style/<style>/cache/<sheet>.pkl` (`stage_cached` in style_build.py), keyed on that sheet's paintings (`<tag>_*out.png` name, size, time), its sprites' pixel art and the builder code (`style_*.py`; editing them invalidates every sheet). A rebuild with a warm cache is ~1 min (pack only) instead of ~23; `--nocache` skips it.
  - The sheet cache (`comfyui/style/<style>/`, git-ignored) is by name and checked against the sheet's layout (`restyle_sheet` repaints a stale one). `restyle.run` takes `denoise` and `steps` (ComfyUI runs the last `steps` of int(steps / denoise)).
- **Templates and ground (`style_build.py`):** template sheets have wide margins; `register` searches scale (0.55-1.7) and offset per sprite, a fit score retries with other seeds and then img2img (.8), and a creature with any frame under 0.45 stays pixel art entirely (it would flicker). Ground: a 4x4 tiling restyled, the centre 2x2 a 128 art-px tile, `seamless` and `highpass`ed; soft natural grounds (`FLAT_GROUND`) are painted from a non-repeating colour field with a material prompt (`MAT`); paving (`PAVING`) from randomly flipped copies (else the model copies the 64 px repeat stone for stone), high-passed, cut 3x3 (192 art px) and wrapped by `quilt` (a min-cost seam). In the game, soft grounds also blend in patches of a mirrored, shifted copy (`mixw` in `pixGroundHi`). `LOOK[style]` is the prompt; a new style is a new entry there and in `ART_STYLES`.
- **Animals and enemies** are painted with matched frames (`creature_frames` in style_build.py): all from the one try whose worst frame fits best, all cut at that painting's median scale, each with exactly its pixel frame's outline, and card-grey pixels inside replaced by the pixel art's colour (painted frames used to differ in size, so creatures shrank as they walked, and grey leaked in). The twig and stump come from a roomy sheet of their own (`F_8_roomy_twig_stump`). Cast shadows are made at a quarter resolution, queued and built in ~3 ms of spare time a frame (`castMake`, `CASTQ`), since building them on first sight stuttered. Cache versions are per kind (`CODE_VER`): bump the one you change.
- **Characters stay pixel templates.** Tried and dropped: full repaints give a different person in every walk frame; img2img at 10x (`--hb`, `soften`) leaves the pixels at denoise .5 and re-poses some frames but not others at .63-.72. In a styled mode `humanSpr`'s result gets two Scale2x passes plus `paintedLook` (a 0.6 px soften, form shading: a soft inner shade along the bottom-right edges and a warm rim along the top-left ones, and the warm/cool light gradient) and is drawn smoothly; it's the same on every frame. `humanSpr` in `h_pixel.js` can composite styled layers at their `hi` scale if a style ever has them. Gear icons (`gi_`) are styled objects; the helmet and plate icons cut from `hb_helm_`/`hb_arm_` follow the scale (`x_gear.js`). `iconURL` and UI canvases scale smoothly in a styled mode (`body.styled`).
- **Windows at night** are found in each painting (`styleGlow`): glass-coloured patches of window size in the wall band where the pixel art had its windows (free paintings don't keep the pixel window positions). `nightLights` guards it so an error can't stop the other lights.
- **In-game style rules (`x_artstyle.js`):** `STYLE_SMOOTH` (fences, tilled soil) keeps the pixel sprite, rounded and lit, so runs join; `STYLE_FIT` (well, barn) fits the painting inside its pixel box; `STYLE_SKIP` (crab, yeti: Old Snapper, Frost Giant) uses the smoothed pixel animation (a higher-resolution repaint came out cut off and blocky); `STYLE_ALIAS` (lit lamp → unlit painting). `styledSwap` accepts code pixels with B ≥ 250 (canvas rounding at soft edges left raw codes: blue specks). Every cast object also gets a soft contact shadow at its foot. Past the top and bottom map edges the edge chunks are drawn mirrored. Night adds a warm multiply so painted water isn't the brightest thing. Boss hazards are only lightened (a canvas blur on them froze quake rings).
- **Comments on one line:** never put a `//` comment in the middle of a statement line: twice an edit hid the rest of the line behind it (a missing `return` blanked every creature and icon template and crashed the regions in 0.9.6).
- **Blanked canvases:** under GPU memory pressure the browser can drop a canvas's pixels (context lost: blank). `mk` marks such canvases `__lost`, and the sprite caches (`HC`, `PIX.cache`, styled `PIX.get`, `SMOOTH`, `CHUNK`) rebuild them (a guard showed as a floating sword). `CHUNK_LAST` is trimmed with `CHUNK` (it grew without end).
- **Microstutters (2026-11-02):** reading pixels back from a GPU canvas (getImageData, or drawing a GPU canvas into one the code then reads) makes the CPU wait for the GPU. Canvases whose pixels are read are made with `mkCPU` (a_core.js, `willReadFrequently`): character layers and creature/crop templates in `PIX.get`, the character composite in `humanSpr`, `armFit`, `pixTemplate` and `styledSwap` work canvases; finished frames are copied back to a GPU canvas (`mk`) for drawing. Character and creature smoothing runs on the GPU (`gpuUp`: a high-quality smooth 4x enlargement, then `paintedLook`; scale2x read every pixel back), and a character's other walk frames are built in spare time (`WARMQ`, ~2.5 ms a frame). Measure with `stutter3.mjs`-style per-frame attribution before guessing: it was characters, not trees or shadows.
- **Ground painting is sliced (2026-11-02):** painted-style ground is painted at `GROUND_K` 2 px per art px (the textures are 4) by generators (`paintChunkHiGen` → `pixGroundHiGen` in h_pixel.js) that `getChunk` advances ~4 ms a frame (`CHUNK_JOBS`, `CHUNK_DEADLINE`), showing the old picture meanwhile, plus a ring of chunks just outside the view painted ahead; after a map change or camera jump visible chunks finish at once (`CHUNK_SYNC`). A chunk used to take 150-300 ms in one frame: that was the stutter in dense areas, not the shadows. A tile change repaints only its own chunks (`m.cvc`). Night window glow is worked out in the game from each painting's glass near the pixel `meta.win` rects (`styleGlow`); the lit lamp uses the unlit painting (`STYLE_ALIAS`).
- **Light and shadow (`x_artlight.js`, styled modes only; the pixel style keeps its flat grade).** Aimed at the painted example scenes the user picked (`docs/artstyles/painterly/`: long soft shadows, dappled shade, light shafts, warm and saturated):
  - **The sun** (`sunNow`, `SUNP`, from `SUN` sunrise/sunset per season): shadows fall west in the morning and east in the evening (`sx`), short at noon and long near sunrise and sunset (`sy`), and fade under rain or snow (`k`). The warm side of the soft-light wash and the lean of the light shafts follow it.
  - **Cast shadows:** every styled object sprite flagged `cast` (set by name in the `PIX.get` wrapper; flat things don't cast) has a flipped silhouette made once (`castOf`, from a copy, cut at the object's real base row so there is no gap under a building), slanted and stretched by the sun at draw time and started 2.5 world px inside the object (drawn first, so the overlap is hidden). People and creatures (`shadow()`) get a soft contact shadow plus a long soft blob along the sun's direction (they're drawn mirrored, so not a silhouette).
  - **Daylight layer** (in a `nightLights` wrapper, outdoors by day, not in rain or snow): a world-anchored, drifting dapple texture multiplied over the scene (`dappleTex`) and three soft light shafts. After `pixGrade`: the soft-light wash and a deeper vignette; the canvas gets a CSS `contrast(1.1) saturate(1.18)` filter (GPU). Styled ground textures are drawn at 70% contrast (`TC` in `pixGroundHi`) so shadows read on them.
  - **Night windows:** each painted building's `<name>_glow` frame (`window_glow`) is the glass of its day painting (bluish or dark pixels within reach of the pixel sprite's `meta.win` windows) filled with one even warm light, brighter in the middle; `nightLights` adds it over the building (`styleGlow`). A model-painted night edit was tried and dropped: it lit walls and painted the panes in rainbow bands. `nightLights` flames still get warm additive halos.
  - **Variants the pixel art doesn't change** (charwood is the same tree every season) keep the base painting (`plan`: identical crops get no edit), so volcanic trees don't get blossom, autumn leaves or snow. The fountain is painted to its outline (`FAITHFUL`): freely painted it always came out with 3D depth. Cut-outs never take paint nearer to a neighbouring cell (`CELLS`; a stump had taken half a twig). Ground textures are made from softened input (`_x4s`, `_rx4s`).
  - **Pinned frames** (`art/pinned/<style>/`: `<name>.png` + `pinned.json` with k, ox, oy) are approved paintings the build always uses, whatever the sheets do: the twig and stump of 0.9.1 were lost once when a sheet's spacing changed and it was repainted. Pin a frame once the user approves it.
  - **Odd paintings** are repainted alone (`REDO` in `style_free.py`: the well, lamp post, fountain, keep, notice board, storage chest). Cut-outs are despilled near the edge (pink and magenta pulled back to neutral). Paving switches sharply between three copies of its texture (as is, mirrored and shifted, quarter-turned) in noise patches (`mixs`), so the street has no visible repeat.
  - **Tried and dropped:** a style reference image for the free paintings (`--ref`, `STYLE_REF`): the model copies objects out of it, and the example scenes as a reference made the paintings more pixel-like.
- **Menu icons:** the `ui_` dock icons are a styled sheet of their own (`ui_0`); `uiIcon` draws them at full size, and switching styles rebuilds the dock.

## Overnight playtest fixes (`public/js/x_fix6.js` plus small edits; findings in `docs/playtest/overnight/SUMMARY.md`)
- **Rooms:** the mirrored map-edge chunks are only drawn outdoors (`f_render.js`), so rooms no longer show a doubled back wall.
- **Stories (`w_story.js`):**
  - A step's items are taken when its dialogue finishes (`runStep`'s `pay`), not before, so a dialogue cut short by a second one keeps them. `storyTalk` doesn't start while a dialogue is open.
  - A `bring` step with `keep: 1` only shows the items: Pip sees the Lost Lanterns, and Hale takes them.
  - Story items that don't fit go to the bank (`storyGive`), and story steps count and take from the bag plus the bank (`storyCnt`, `hasAll`, `takeAll`).
- **The cart** fills while it's hitched (`cartOn()` in `s_auto.js`), ground pickups included, and crates offer Unload.
- **Goblin camps** count as cleared when the tribe is gone while you're within 30 tiles.
- **Enemies on cliffs:** an enemy on a solid tile for 0.5 s moves to open ground. A leashed enemy that gets no closer to home for 2 s is put home. A siege kill doesn't start the Warlord's weekly timer.
- **Keys:**
  - Enter presses "Start the day".
  - A HUD button you clicked (Next day) loses focus on Enter or Space.
  - Space doesn't use your tool for 350 ms after a window or dialogue closes (`KEY_GAP`).
  - Esc closes only the key bindings popup, and its list scrolls.
  - Rebinding a key that another action uses swaps their keys.
- **Saving:** the game saves on `pagehide`, `beforeunload` and when the window is hidden (not in the sandbox or the creator). Save game works anywhere; outside the saved maps, loading starts you on the farm.
- **Load game list:** only the title's own hint is absolutely positioned (`#title > small`), so each slot shows its date and gold.
- **Placing and picking up:**
  - Holding a placeable aimed at an empty tile places it (`act` wrapper; it used to rotate the belt you stood on).
  - The pickaxe aimed at your placed machines, crates and belts picks them up.
  - Only the pickaxe picks up fences and gates; an axe click opened fenced fields.
  - A gate gives back `fence_gate`.
- **Hammer and wells:** the building hammer moves and removes wells.
- **Shopkeepers:** `counterNear` only matches `furn_counter`/`furn_bar` (it matched `furn_barrel`, so right-clicking Brann walked you to a barrel).
- **Street chat:** the street window's Chat and greyed Shop now work (the wrapper looked for a `small` class added later).
- **goMap without a position** puts you at the map's start instead of NaN.
- **Warrens hole:** drawn from its smoothed pixel sprite (`STYLE_SMOOTH`).
- **Second pass:**
  - **Kingsbridge:** the cross street ends at the side streets, and the side-gate guards and towers are gone (`x_terrain.js`).
  - **Inn job boards:** in towns without a hall (Ashford, Saltmere), the inn has the Job board tab.
  - **Jammed belts:** a belt whose machine won't take its item counts `o.jam` (`s_auto.js`). From 4 it shows a red "!", and interacting takes the item off.
  - **Meat dishes:** they had type and price swapped in `I(...)` (`x_world.js`).
  - **Pet adoption:** a stale window can't swap your pet.
  - **Knockout report:** a fight knockout's report gives fight advice, not "sleep before 4 am".
  - **Story portraits:** sized in world units, so they're no longer huge in a painted style.
  - **Morning report:** it lists festivals, festivals within 3 days and birthdays.
  - **Rock regrowth:** the Wilds' nightly rocks only top back up to the map's count (`m._oreBase` in `dailyWorld`; it added 30 a night, so saves grew).
  - **Odile's:** animals costing 1000g or more need a second click, and Buy buttons rest 0.7 s after a purchase.
  - **Recipe search:** it starts empty when a window opens.
- **Third pass:**
  - **Foes near a click:** a foe only counts for weapon and gathering clicks if it's within reach with open ground between you (`foeNear`, `lineClear`; a goblin across a pond made every click an air swing). Clicking a resource gathers unless a foe is within 110 px.
  - **E:** when nothing is at the mouse, E tries the tile you face.
  - **Food:** with food selected, a left click eats it.
  - **Empty slot:** clicking a tree, rock, ore, grass or ripe crop with an empty slot selected picks the matching tool first.
  - **Full backpack:** a "Backpack full" tag stays on screen while the bag is full, and the toast names what was left on the ground.
  - **Sandbox:** it doesn't pay milestone quest gold.
  - **Combat test:** no knight patrols or bandit patrols, the clock stays at 10:00, and everything but gear, food and arrows starts in the bank.
- **Fourth pass:**
  - **Melee skills (asked 2026-11-03: melee was weaker than bow and staff and needed more area skills):** in action combat, Cleave, Lunge and Rend have their own versions (`wrapA` in `x_fix6.js`; classic combat keeps the old ones, which rolled to hit and needed a clicked target).
    - Cleave hits everything within 38 px for 1.5x.
    - Lunge dashes up to 5 tiles toward the mouse, hitting everything on the way for 2x with a stagger.
    - Rend hits a 46 px arc in front of you for 1.2x, and everything hit bleeds for 6 ticks.
    - `SKILL_MULT`: Whirlwind 1, Blade Dash 1.25.
    - Two new Blade skills, spliced into `CSKILLS` by level: **Earthshatter** (10: three widening quake rings, 0.8x each, a short stun) and **Cyclone** (30: 3 s of spinning that pulls normal enemies in and hits 0.45x every 0.3 s). They keep the coloured motes and weapon swing (`fx`).
  - **Text and display fixes:**
    - Recap kill steps show their real count.
    - Respec reads "no points spent" when there's nothing to reset.
    - The weapon a combat skill needs is a note, not a ✗ requirement.
    - "Defence" everywhere.
    - Spouse chores and egg prizes use singular and plural correctly; "made you an omelette".
    - The wedding line names Brann when you marry Pip.
    - Suitors are asked out "when you talk to them".
    - Neutral gifts are "thanked you for it".
    - "Block" floats beside the damage number.
  - **Towns and inns:**
    - Arriving in a town by waystone shows the town's banner, not "The Wilds".
    - The first-nights warning skips towns.
    - Sleeping at an inn wakes you inside it.
- **Fifth pass:**
  - **Defence:** in action combat, the Defence level lowers damage taken by 0.4% per level, up to 40% (`hurtPlayer` wrapper). Only armour counted before.
  - **Scythe:** walking to a crop with the scythe cuts it on arrival (`act` wrapper; it found the crop's "use your scythe" hint).
  - **Small fixes:**
    - Bank category counts follow the search.
    - Enter names a baby.
    - Locked windows (the Farewell) hide their close button.
    - The Family tab lists only people you could court now (`courtOk`, same age rule as `greet`).
    - Hale's rows skip empty costs ("no cost" instead of "0g, .").
  - **Briarholt:** the treasury hoard stays sealed until you own the castle.
  - **Town keepers:** met on the street outside their hours, they just talk and say when the shop opens (they opened the whole shop).
  - **Wishing well:** it asks before taking 100g, and its prompt shows the price.
- **Sixth pass:**
  - **Talking:** E talks to a person standing right on you (`findInteract` fallback within 14 px).
  - **Week one near home:** goblin camps stay empty until day 5 (`campTick`), and bandit patrols start on day 7, not day 3 (`banditsFrame`).
  - **Regions:** the Rimesteel bar needs Smithing 7 (old scale, about 60) instead of 8, so it fits its Mining 57 ore. Every region market sells coal.
  - **Story lines:**
    - Osric's bloodline line matches Elias: "the old king's daughter, and you her grandchild".
    - Vey and Isolde speak of six knights.
    - Ashcombe no longer introduces himself twice.
    - Sigrun's ice line fits the same afternoon.
    - Wren's shards are from the "old seal".
- **Balance pass (from the overnight playtest):**
  - **Staff:** basic bolts hit 0.85x and the basic fireball 1.2x (`WPN.staff`); it cleared camps far faster than a sword.
  - **Forge King** (The Hollow Crown, chapter 3): 2600 health, 44 attack (`EN.forgeking`), between the Stone Warden and the Ember Wyrm.
  - **Packs:** creatures with 200+ health and anything in a region come 2-3 at a time (`x_bandits.js`); Hollow Vale packs are unchanged.
  - **Fishing:** fish sell for 20% less, like crops, and a cast costs 3 energy at first, down to 1 (`e_play.js`). Pond fishing paid 5-8x more per energy than crops in week one.
  - The Stone Warden reference above was measured before the action-combat changes. In action mode it now takes about 20 s, so re-measure it before tuning bosses again.
- **Art pass (code only, no atlas rebuild):**
  - **Standing frames:** the painted frame 0 of the troll, basalt golem, ogre and goblin came out smeared or sheared, so `STYLE_ALIAS` uses their walk frame 2 for it.
  - **Fruit trees:** in a painted style, a ripe tree gets fruit painted on its canopy in the fruit's colour (`treeImg` wrapper; the painted `_f` frames had no fruit).
  - **Clay:** once per wild map, up to 30 more clay mounds go within two tiles of fresh water on grass, dirt or sand (`clay2_<map>` flag).
  - **Ore rocks:** `ore_*` sprites are drawn at 80% on the same tile.
  - **Still to do, needs new art and an atlas build:**
    - recognisable ripe crops (strawberries and others);
    - distinct flower shapes: the five wild flowers and the flower items share one shape in different colours.
- **Recognisable crops and flowers (asked 2026-11-03):**
  - **Crops:** `art/sprites/crops2.py` draws every ripe crop on its own as `crop_<key>_3`, in real colours: strawberries with seeds and white flowers, corn with cobs and tassels, sunflowers, staked tomatoes, hanging peppers, purple-topped turnips, striped melons, ribbed pumpkins, and more. `cropSpr` (x_fix6.js) uses the crop's own drawing when it exists, else the shape templates of `crops.py`.
  - **Wild flowers:** `art/sprites/wildflowers.py` redraws `flower.0-4` as five species: buttercups, foxgloves, bluebells, daisies and marigolds, with the same colours as before.
  - **Painterly:** the crops are painted to their own outline on sheets of their own (`OWN_CROPS` in `style_free.py`), so the size-grouped free sheets keep exactly what they had.
- **Growth stages (asked 2026-11-04):**
  - **Crops:** `art/sprites/crops_stages.py` draws `crop_<key>_0` (sprout), `_1` (young plant) and `_2` (grown, with buds, flowers or small unripe produce) for every crop, by plant type (`SPEC`: low, bush, vine, staked, tall, grain, pods, root, bulb, head, gourd, flower) with the crop's own leaf ramp and an accent colour, so each leads into its ripe `crop_<key>_3`. `cropSpr` (x_fix6.js) uses them; in a painted style they're smoothed (`smoothUp`), not painted.
  - **Fruit trees:** `art/sprites/saplings.py` draws `sapling_<kind>.0-2` per fruit tree (a whip, a young tree, a small crown with blossom or green fruit) in the tree's own leaf colours; an `objSprite` wrapper shows them while a planted fruit tree grows (age 0-13), smoothed in a painted style.
- **Art pass 2 (code):**
  - **Soil fields:** tilled soil joins into fields (`soilSpr` in x_fix6.js). A side that meets more soil takes the tile's inner rows instead of its rim, and corners fill in. In a painted style each tile is smoothed with a 2 px border of its own edge, then cut back, so no seams show.
  - **Lava bridges:** a bridge over lava has lava under it (`paintKey`), not blue water foam.
  - **Mines:** rocks match the floor's theme (snow rock on ice; ash rock on magma and void; cave rock on earth). Mine, cave, warren and seam walls have the natural rock face; built dungeons keep stone courses (`natural` in `pixCliffsAndBridges`).
  - **Inn patrons:** a seat that lands on furniture moves to the nearest free floor.
  - **Keep pieces:** the throne dais, runners, banner poles and the keep stairs use their smoothed pixel sprites in painted styles (`STYLE_SMOOTH`). Their paintings were 3D, slanted or magenta-fringed.
- **Pass 7:**
  - **Signposts:** the `sign` sprite uses its smoothed pixel art in painted styles (the painting read as a chest on a pole).
  - **Flyers:** fly and swoop enemies are hit where they're drawn, 6 px up with 6 px more reach (`x_action.js`). Frost bats were hard to hit.
  - **E:** a story object, page, shard or chest at or beside you beats a wild flower in front of you.
  - **Camera:** it may go a little past a map's side edges (more on the right, where the dock is).
  - **Tracker:**
    - A boss step without a place points to its arena in the Wilds or a region.
    - A kill step points to the nearest ground of the biome where that enemy lives (`BIOME_EN`, or `*bio:` steps). The search is cached and skipped while you're in that biome.
- **Map dragging (asked 2026-11-03):** press and hold on the map (M) and move to pan it (a `renderMap` wrapper scrolls `.mapbox`). A press that moves under 4 px is still a click, and the click right after a drag is swallowed.
- **Pass 8:**
  - **Flyers:** fly and swoop enemies get only a contact shadow (`shadow(..., .15)`; the long sun shadow is skipped below .18), not a vertical streak at noon.
  - **Hit flash:** `brightness(1.6) saturate(1.2)`, not flat white.
  - **Floating numbers** that land on one spot stack upward (`floatText` wrapper).
  - **Snow:** flakes are 1.6-3.2 px (x1.4 above 900 px tall) with a faint shadow, so they show on snowy ground.
  - **Zombie and Drowned Pirate:** the zombie has green skin, glowing eyes and bare ribs; the pirate drowned-blue skin, a red bandana and ribs.
  - **Ribs:** `hb_ribs_<d>` was never drawn: a `//` comment in `humanSpr` hid `if (P.ribs) add(...)`. It's fixed, so skeletons show their ribs too.
- **Little stones (asked 2026-11-03: they looked like urns):** `stone_small` in props.py is now a cluster of rough, angular stones with cracks and lichen (the single smooth oval read as an egg, and its painting as a banded urn). In painted styles it uses the smoothed pixel drawing (`stone$` in `STYLE_SMOOTH`). It isn't repainted, because it shares the rocks' paint sheet.
- **After 0.9.9 (the user's pick from the open list):**
  - **Drag to place:** with fences, channels or belts in hand, hold LMB and move. A 4-connected line is laid along the mouse path (`DRAGP`), belts facing the drag direction, with no walking. A placement that fails names what's in the way (`dragBlockWhy`), here and in `useItem`.
  - **Why it's stuck:**
    - Station windows say why they're idle (`idleWhy` in s_auto.js: no power, missing inputs, output full, no fuel).
    - Clogged channels get the red "!" like stuck belts, and the morning report points to it.
  - **Station windows:** they open on "Can make" (`MODAL.opts.rcan`; off in the sandbox). The shipping bin lists its contents with Take 1 / Take all (`openBin`).
  - **Loot that doesn't fit** lands in a ring round you (`DROP_RING` in l_pack.js).
  - **Locked-node hover:** it names the tool tier needed too.
  - **Painted sea:** water darkens with distance from shore and gets drifting swells (`waterDepth`/`waterDepthDraw`, from `f_render`).
  - **Winter:** the fountain's water freezes (blue pixels to ice), and green at the foot of winter trees turns to snow (painted styles).
  - **Festivals:** each has its own decorations: Blossom flower ring; Lantern Night extra lanterns and `SKYLANTERNS` that rise for ~30 s; Harvest Fair bales, crates, barrels and sacks; Ember Feast banquet tables, benches and fires.
  - **Bosses at 2-3x:** in painted styles they're enlarged with `smoothUp` at twice the resolution, then drawn down at high quality (sharper, still pixel-based).
  - **Ground and lighting:**
    - Natural ground layers (g, sn, a, i, s) are smoothed before their edges are found in the painted ground, so biome borders curve.
    - Lava blends a mirrored copy (`SOFT.l`).
    - Night window glow only takes clearly blue glass near a pixel-art window position (`styleGlow`).
- **Art pass 3 (pixel atlas rebuilt; the Painterly atlas was left alone, because a rebuild would repaint the shared rock sheet and every icon sheet):**
  - **Animals:**
    - The rabbit's tail sits on its rear, and a hind foot no longer floats.
    - The chicken has whole two-pixel legs.
    - In Painterly both use their smoothed pixel frames (`STYLE_SKIP` `an_(rabbit|chicken)`).
    - Coat patterns are drawn over the sprite in the coat's second colour (`animalSpr` wrapper): spotted pig and rabbit get spots, the dapple horse soft pale dapples, the belted cow a white belt.
  - **Women's body:** `human.py` draws every body frame again with a female torso (`FEM`, `hb_bodyf_*`: narrower shoulders, a waist, fuller hips). `humanSpr` uses it for `P.sex === 'f'`, else when the hair is long, a bun or a ponytail. `playerPal`/`lookToP` pass `S.look.sex`.
  - **Creator preview:** drawn at twice its CSS size, smooth in painted styles.
  - **Armour:** the plate tiers have their own chest detail (steel lames, frost streaks, adamant studs, a cobalt boss, rime crackle). Adamant gear is deep raspberry (`#a8305e`), not hot pink.
  - **Icons:**
    - Helmet icons are cropped to the helmet, in profile (`hb_helm_<tk>_2`), and fill the slot.
    - New `ic_bowl`, `ic_roast`, `ic_cake`, `ic_fish_long`, `ic_fish_flat`, `ic_fish_round` in icons_hand.py, given to dishes, meat and fish by name (x_fix6.js).
  - **Cliffs:** painted cliff rims wander in width (`cliffTop`), with no ruled lines.

## Round 2 fixes (findings in `docs/playtest/round2/SUMMARY.md`)
- **Story:** Empty Throne chapter 4 (`*assist`) counts a kill with a knight within 120 px, like the barracks job (`x_story2.js`); it needed a knight's hit in the last 12 s.
- **Tutorial:** a reload before you answer Ashcombe's welcome sets `tutWalk` back to 1, so he asks again. The village step is a `cond` that's met anywhere in the village or in Mara's store.
- **Drag to place:** never on your own tile or within 2 tiles of a map exit (`dragUnsafe`), a fence that would cut you off from every exit is taken back up (`dragTraps`), and a window, dialogue or building ghost ends the drag.
- **Economy:**
  - Wild flowers keep their forage item 25% of the time (up to 60% with Foraging), else 1 fibre; morels are 15% of mushrooms; both come back after 5 days (`pickWild`).
  - The greenhouse repair costs 4,000g, 150 wood, 100 stone and 5 iron bars.
  - Greyhelm's supply no longer sells the Staircase or Warp Totem (price 0).
  - Town shops sell at 1.25x the market price (1.15x at 50+ standing; it was 1.45x / 1.3x, and with a shortage doubling the market price the gap felt like a rip-off); inn take-away is 1.35x.
  - Selling a stack at once lowers the price per unit like single sales (`bulkPay` in q_land.js; Mara, town shops, the bin).
  - The inn's hot meal (health and half your energy) and the two-hour rest are once a day each (`S.flags.hotDay`, `restDay`).
  - Hale's materials are about town prices (wood and stone 6, hardwood 32, clay 30, fibre 5); Brann's coal 24, copper ore 10, iron 25, silver 45, gold 60, mythril 130.
  - `rebalanceRound2` (x_fix6.js, on DOMContentLoaded): pale ale, ale and frostweave are at most 4.5x their input, smoked fish at least 1.6x the raw fish, and town delivery jobs pay at least 1.35x the goods' worth.
- **Systems:**
  - A blueprint on the hotbar places on left click.
  - The hammer finds a well from any tile of its footprint, so E works.
  - Removing an unfinished site gives its blueprint back (`demolish`).
  - A dropped stack stays on the ground until you've walked 3 tiles away (`d.manual`).
  - Placement refusals name objects in words (`objLabel` in x_fix5.js: "tall grass", not "tgrass").
  - Arriving on a map inside a tree or rock moves you to open ground.
  - Hammering a build site costs 0.3 energy a stroke and stops when you're spent.

## Markets, traders and caravans (`public/js/x_market.js`, asked 2026-11-03)
- **Markets (`MARKETS`):** the village, Kingsbridge, Greyhelm, Ashford, Saltmere and the four region towns. Each keeps a stock of every trade good (`MKT_TYPES`: crop, fruit, forage, mat, ore, bar, gem, loot, animal, fish, artisan, food). The normal level `mktT` depends on the town's size `R`, the item's price (more of cheap goods) and `hold` (the village and Kingsbridge hold a lot of produce). Only stocks away from their level are saved (`S.mkt.s`).
- **Price:** `mktF` = (normal / stock)^0.6 with no floor or ceiling (asked 2026-11-04: prices settle on each town's supply and demand; half a unit is the least stock it counts, so an empty market is dear but finite; over 120 simulated days with moving demand every price stayed between 0.41x and 3.04x) (the fixed per-town factors `pf` are gone since 2026-11-04: `mktPf` is 1, and what a town makes or lacks shows in its real stock). On top of that comes a **dry spell** (2026-11-04): each morning a town's stock of a good is under a quarter of normal counts a dry day (`mktDryDay`, `S.mkt.dry`), and each adds 5% (`DRY_DAY`), up to 3x after 40 days (a month out of halibut in Greyhelm: 126g -> 550g); with stock back the count falls 4 a day. Shop rows say "Out of it for N days here", and the news reports two weeks and a month. `mktHere` picks the market: the region, the town whose shop or streets you're in, else the village.
- **Shops and selling:** trade goods in a `buyRow` take their price from the market and their stock is the market's (`mktBuyRow`); buying takes from it, and ×5 / ×10 charge each unit at the price the shrinking stock gives (it charged them all at the first price, a tuna money loop). Selling adds to it unit by unit (`mktBulk`, through `bulkPay`), so a glut lowers the next unit's price. `sellPrice` uses the market for trade goods (q_land.js). Shop markups still apply on top.
- **Each morning (`mktDaily`, after `econDaily`):**
  - **Making and using (`mktLife`, asked 2026-11-04):** each day every good is made in only one or two towns (`mktToday`, `MKT.makers`), drawn at random by weight (`mktMakers`): the towns whose trade it is (`PROD` per town and `mktCat`: Saltmere fish and sea goods, Greyhelm ore and metal, Ashford wood and forage, the village farm goods, Kingsbridge food, luxuries and crafts; the regions a little) are far likelier, any lowland town now and then (`MKT.side`). A maker gets `MKT.k` (22%) of its normal stock that day. A region's own goods are made only there, on half the days. Monster loot is never made, only traded. Every town uses up a share of its stock (`USE` per town and kind, × `MKT.useK`; `MKT.use0` for the rest), stocks are pulled 4% a day back toward normal (`MKT.relax`, trade from afar) and drift ±6%. A maker settles around 1.5-2.5x its normal stock (cheap), a heavy user around 0.6x (dear). Today's makers are in `S.mkt.made`, shown in the Markets tab ("Made here today"). 90% of prices sit between about 0.57x and 1.57x.
  - **Demand moves too (asked 2026-11-04):** the price compares real stock with what the town *wants* to hold today, `mktT` = `mktT0` (the normal level, where stocks settle) × `mktWant`: a random walk per town and kind of good (`S.mkt.want`, `mktWantDay` each morning, `MKT.wantBack` .85 back toward 1 plus up to ±15% a day `MKT.wantStep`; it ranges about 0.6-1.5) times a daily wobble per good of up to ±15% (`MKT.wobble`, from a hash of town, good and day, so it isn't saved). A town that wants more also uses more. A making day's yield varies 0.4-1.6x (`MKT.yield`). The Markets tab says which kinds a town wants more or less of than usual. Clicking a town in the Markets tab opens its full market (`mktTownOpen`, `#mtownpop`): two scrollable lists, Short of (under 80% of wanted stock) and Plenty of (over 125%), each good with its price against usual and (stock / wanted stock), goods made there today marked.
  - One or two shortages (x0.4) or gluts (x1.8) a day, of one kind of everyday goods in one market, in the news (`MKT.events`).
  - Traders move goods along the roads (`LINKS`) from where the stock is high to where it's low: up to 4 loads per good a day (`MKT.loads`, raised 2026-11-04 for a busier economy), wherever the stock gap is over `MKT.gap` (0.5), 15% of it each (`MKT.load`). Makers stay cheaper than users (Saltmere halibut ~0.6x, Greyhelm ~1.2x); about 22 caravans leave each day.
  - Loads worth 300g+ join that road's caravan of the day (`S.mkt.cv`), which arrives hours later (`mins` per link). From day 7, 4% are taken by bandits.
- **Caravans you see:** in the Wilds, now and then one of the caravans on the road passes near you as a patrol cut to two guards with the supply wagon (`CARAVAN`, `caravanFrame`). The wagon is a map entity (`cvwagon`, drawn in depth order by a `drawEnt` wrapper); one guard leads it and the other walks behind. While you can see it, its route is carried on to the road end farthest from you (`cvExtend`), so it never ends in view. If bandits reach the wagon with both guards down, the load is lost; the wagon stands for 25 s, then fades.
- **Shipping bin:** always pays a fixed 80% of the base price (`BIN_K`), with no market or demand (`MKT_BIN`, set while the bin pays and while its whole window is drawn, `binRender` in x_fix6.js, so the rows show what it pays). `MKT_RAW` gives the plain base price (`valBase`, for the stall and traders).
- **Passers-by you can see (2026-11-04):** on the farm, an hour's stall sales come as a villager (`mkt_buyer0-3`, up to 3 at a time) who walks in from the village road to the stall and buys on arrival (`buyerWalk`, `buyerFrame`, `stallPasserSell`); off the farm the sale just happens. Traders come only for a sale to a town that pays more, or a buy order.
- **Your stall:** per item you set a price against the village price (`S.stall.mul`, − and + in the stall window), from 10% with no top limit (2026-11-04: towns can pay 2-3x now; the steps are 5% up to 2x, 10% up to 4x, then 25%, `stallStep`). From 8:00 to 18:00, three tries an hour (six at weekends); each sells 1-3 with the chance `stallChance`: always at 70%, half the time at 100%, one in eight at 130%, hardly ever at 160%, practically never above 2x (no floor on the chance). Passers-by add to the village stock.
- **Buy orders (asked 2026-11-04):** the stall's Buy orders tab (`renderOrders`) takes an item, your top price and a quantity (`S.stall.orders`). The same trader visits also fill them: the cheapest town whose shop price (`orderCost` = base x market factor x `ORDER_CUT` 1.45, as town shops charge) is under yours, up to 40% of its stock and what you can pay (`stallOrderDeals`, `stallOrdersFill`). The town's stock drops, you pay your price on delivery, and the goods wait in the stall (`S.stall.bought`, Take). At 1.1 an order bought Greyhelm ore that resold in the village at +25%; `ORDER_CUT` is now 1.25 like the shops. Besides trade goods, orders take seeds, saplings, fertiliser, placeables, ammo, implements, the canoe and fishing kit, the hammer, and weapons and armour up to iron (`orderable`; no better gear, no rings or tools): those come from the traders' own stock (`AFAR`) at 1.1x their usual price, up to 20 a visit.
- **Stall window:** a search over your backpack and how many go out per click (1, 5, 10, 25, All; `MODAL.opts.sq`, `sn`). The backpack comes first and the goods on display below it as compact cards in a grid (`.stallgrid`), so the backpack no longer moves down as goods go out.
- **Zephyr (2026-11-04):** on market days (Fri and Sun) the wandering merchant stands at the front corner of his cart in Amber Meadow (`zephyrSync` in x_fix6.js, a runtime NPC `zephyr`, `k_zephyr` opens `openMerchant`); before, only the cart appeared.
- **Stall log (2026-11-04):** a Log tab lists every sale (to villagers, to traders with their town) and every delivered buy order of the last game year (112 days), newest first, by day with day totals, plus 7-day and year totals (`stallLog`, `renderStallLog`, `S.stall.log`); 14 days at a time, Show older for more.
- **Traders at the stall:** three times a day, at 9:00, 13:00 and 17:00 (`TRADER_HRS`; every two hours, and before that 10:00 and 15:00, until 2026-11-04) a trader buys anything some town pays more for than your price after his 15% cut: a short town takes what it lacks, any other town about 15% of its usual stock, and it goes there by caravan (`stallTraderDeal`; until 2026-11-04 only towns short of it counted, so dear city prices didn't help the stall). On the farm you see them walk up the road to the stall, buy and leave (`mkt_trader`, `traderFrame`); elsewhere the sale just happens.
- **News (market analysis, 2026-11-04):** the stall's Market news tab (`renderIntel`): hire Odo Fenn for 28 days at 400g (`INTEL_COST`, `INTEL_DAYS`, `S.stall.intel` = last paid day, `intelOn`; Add a month extends). While hired it shows trade news and, per market (the one you're in first, "(here)"), what it's short of and what's plentiful (`renderMarkets`), and stall rows show the best trader offer (`stallBest`, `stallOffer`) with a Trader price button (`stallTraderMul`). A "Match the trader price every day" checkbox on the stall (`S.stall.autoTrader`, asked 2026-11-07) sets every good on display to that price each morning after the markets move (`stallAutoPrice`, a `mktDaily` wrapper) and prices new goods when the window is drawn; a − / + change holds for the rest of the day (`S.stall.autoDay`). It needs the market analysis too, and says when it's paused. Until then the Markets tab was free on the farm notice board, every town board and inn; it's gone from those. Buy and sell rows say "Scarce here" / "Plentiful here" (`mktNote`, `mktSellNote`).
- **The stall's percentage** is against the village price (passers-by are villagers). Each row also names the town that's short of the good and the most a trader would pay (its price less 15%), and whether your price is under it (`stallOffer`). Stall goods whose item no longer exists are dropped (`stallClean`).
- **Market stalls sell what the town made that day (asked 2026-11-04):** Kingsbridge's stalls (`SHOP_STOCK.kb_stall`) and a region market's "At the stalls today" (added to its Buy tab) list goods from `S.mkt.made` for that town (`marketPicks`: up to 16 / 14, most in stock first, none it's out of, nothing over 600g). Lowland stalls leave out the far regions' goods (`exoticGood`: their fish, forage, crops, woods, bars and anything made from them), and no stall sells another region's own goods. They used to be fixed lists.
- **Specialist buyers** (`BONUS` in x_realm.js: Saltmere fish, Ashford saw, Greyhelm supply, Kingsbridge market) pay their bonus only on goods they don't sell themselves.
- **Categories:** salt, kelp, clams, oysters, shells and pearls are sea goods whatever their item type, so Saltmere's discount covers them (`mktCat`).
- Region inn rests are once a day (`S.flags.restDay`, shared with the town inns). The Painterly crate uses its smoothed pixel sprite (`furn_crate` in `STYLE_SMOOTH`).

## What stays in storage (`public/js/x_keep.js`, asked 2026-11-04)
- The Storage Shed's bank window, storage crates and the storehouse ledger have a Keep tab (`renderKeep`): "Hired hands may not leave their haul here" (off by default; `S.flags.shedNoHands`, `o.noHands`, read by `dropSpot` in x_hire.js, which then goes on to the next storage) and a minimum per item (`S.bankKeep`, `o.keep`, all qualities together), plus "Every item: keep at least" (`keep['*']`, a floor for everything in that storage; an item's own higher amount still counts).
- Automation never takes an item below its minimum: `autoTick` (belts pulling, crates pushing, the shed), `craneTick` and the farmhand's fertiliser (`fhDo`, `farmhandFrame`, `fhCatchUp`) run inside `withReserve`, which sets the kept amounts aside (`hideKeep`) and puts them back after. Taking items out yourself still works, and so does your own crafting at a station from the shed (asked 2026-11-05: it ignores the minimums).

## Sprinklers, seeds back and crop breeding (`public/js/x_breed.js`, asked 2026-11-04)
- **Sprinkler reach:** holding a sprinkler draws the tiles it would water round the tile you aim at (tilled soil brighter) and, faintly, what the placed ones reach; on the farm and in the greenhouse (whose only automatic watering is sprinklers, plus the farmhand).
- **Seeds back:** a harvest gives a seed back with a chance of 5% + 0.25% per Farming level for a plain crop, and 40% + 0.3% per level for a strain (its own seed), so a line isn't lost (`afterHarvest`, from a `harvest` wrapper).
- **Genes (asked 2026-11-04):** a strain's traits are levels (`T.lv`, `GENE_MAX`): growth `g` 0-3 (20% faster a level, 60% at most; applied in an `endDay` wrapper), yield `y` 0-3 (one more per harvest a level; the first `give` of a strain harvest, `HARVEST_ST`), worth `v` 0-5 (sells 10% more a level, in the strain's colour), hardy `h` 0-4 (grows one more season after its own a level, every season for good at 4; `cropSeasons`, used when planting and at the change of season). `strainLv` works out `T.g/y/v/h` from the levels and converts strains from before levels.
- **Crosses:** harvesting a crop with a different crop or strain beside it (8 tiles, at least half grown, both with seeds) gives a cross seed 4% + 0.1% per Farming level of the time (`crossStrain`): the strain's crop when only one parent is a strain (70%), each trait's best level from either parent, and half the time one level more, 60% of the time in a trait the parents already have, so a line can be bred up gene by gene or two strains combined. A cross is never just the plain crop; one matching an existing strain is that strain; at most 500.
- **Strains** are `S.strains` (k, lv, gen, pa, col, name); `registerStrain` adds `<crop>_seed~<i>` (type `strainseed`, planted by hand in a `useItem` wrapper; the seed drill and hopper only take `seed`) and `<crop>~<i>` (the produce, worth x v, its colour) after `initMaps`; a planted strain carries `s.crop.st`. Their seeds are a seed sack in the strain's colour (`seedBagIcon`) and their produce the crop recoloured to it (an `itemIcon` wrapper). The name takes the two strongest traits (`strainName`); the rating is the levels out of 15 (`strainScore`, 1-5 `strainStars`), shown with the generation, traits and levels (`geneText`) in the descriptions, the cross toast and the farm notice board's Seed book. The Seed book lists only strains you still have (`strainsAlive`: seeds in the backpack, the bank, a farm crate or ledger, a hired hand's haul or stash, the stall, or a living plant on the farm, in the greenhouse or a plot) and says how many are gone; a lost strain comes back if bred again. Strain seeds are filed with the seeds (`TORD`, the shed's Farm category; asked 2026-11-07: one put in the shed seemed gone, filed under Treasure & trophies), and their description says where and how they grow against the plain crop (`strainGrowText`: seasons with the hardy trait, days, extra yield, price).

## The sailboat and the mystical isles (`public/js/x_isles.js`, asked 2026-11-04)
- **The boat:** Perrin's Chandlery in Saltmere has a Shipwright tab (`renderShipwright`, a `townMenu` wrapper): 15,000g, 80 hardwood, 40 mangrove wood, 12 cloth and 10 iron bars from the backpack (`BOAT_COST`); it's ready the next morning (`S.boat.ready`) and moored on the last tile of Saltmere's pier on the Wilds (`saltmerePier`, `mooring`: a `sailboat` object drawn with the ferry's sprite, put back after `initMaps` and on map changes). Using a moored boat opens the sea chart (`seaChart`): set sail to any isle (2 hours from Saltmere, 1 between isles, added to `S.time`), or home to Saltmere from an isle.
- **The isles** (`ISLES`, maps `isle_<id>`, 72x54, made by `genIsle` from the world seed before the saves are put back, in `PERSIST` so what you gather stays): Moonreef Isle (sand and grass, palms, tide ore and gems; moonpearls, star coral, moon kelp), Emberwhorl Atoll (ash and lava; obsidian, cinder ore, starmetal; ember coral, flamefruit), Mistveil Key (woods and ponds; mythril and gold; glowcaps, mistwood branches), Glasswater Cay (snow and ice; rime, frost ore, crystals; sea glass, frost pearls), The Sunken Crown (grass and old paving; gold, adamant; relic coins). Each has a pier with a moored boat on its south shore (`m.dock`, `m.entry`), stone ruins with a statue and a tier-6 chest, two more chests (`<map>_c<n>`, restocked a week after opening by x_wildregrow.js), and a guardian arena (`m.arenas`).
- **Creatures:** each isle is a biome (`isle_<id>` in `BIOMES`/`BIOME_EN`, levels 42-52) with three palette-swapped monsters (`isleFoe`: e.g. Reef Stalker, Moon Siren, Magma Crab, Mist Wraith, Glass Wolf, Drowned Knight, Coral Golem) and a guardian (`isleBoss`: the Moon Leviathan, the Atoll Drake, the Mist Queen, the Glass Heart, the Drowned King; drawn from existing bosses, their kits summoning the isle's creatures; back a week after they fall). New goods (`ISLE_ITEMS`) are trade goods and trophies for now.
- **Fish:** two per isle (`ISLE_FISH`, loc `isle_<id>`, with smoked versions); `fishLocs` returns the isle's loc and ocean on an isle. Soft motes drift over the isles in their colour (a `pcCursorDraw` wrapper).

## Windows don't pause the game (`public/js/x_nopause.js`, asked 2026-11-04)
- The clock, machines, crops, enemies and villagers keep going while a window is open. Only these pause (`windowPauses`, applied on open, on redraw and every 100 ms): the Options tab, the Pause key (`GPAUSE`), story dialogues and a shopkeeper's street chat (`DIALOG`, tab `t`), locked windows (`MODAL.lock`), the morning report, the character creator and the fishing minigames (`FG`).
- With a window open you stay put: movement keys are swallowed (`NOPAUSE_MOVE`; `MOVE_KEYS` is taken by x_court.js) and a click-walk stops.

## Hired hands (`public/js/x_hire.js`, asked 2026-11-04)
- **Hiring:** the farm notice board has a Hire hands tab (`renderHire`, added in a `farmNotices` wrapper; the window is full size on that tab). Woodcutter and forager need the Hunters' Lodge, the miner the Miners' Guild, the fisher the Anglers' Guild, the farmhand the Growers' Guild (`HIRE[k].g`); joining is enough, and each guild rank adds 10% to the haul (`hireMult`). Hired for 1, 3, 7, 14 or 28 days, paid up front (7+ days 5-15% off, `HIRE_DAYS`); Add extends, Let go pays back the days not worked.
- **Levels (asked 2026-11-04):** each hand is hired at level 1-4 (a picker on the card; fixed for the contract, `w.lv`). Level L opens at rank L in their guild (`hireLvOk`: rank index L-1; joining gives level 1). Fees per level are fixed (`HIRE_FEE_LV`; asked 2026-11-04: hiring is a convenience with a cost, not a money-maker): for the gatherers about 1.1x what a steady hand brings on an average day at base prices with the least rank bonus the level needs, never below the earlier higher-level fees (woodcutter 510/760/1220/1390, miner 510/560/1210/1750, forager 620/790/1020/1600, fisher 220/360/600/960); the farmhand 80/130/190/260. On average hiring loses a little (a level-1 woodcutter about 25g a day): a lazy hand never pays, a steady one on about 40% of days, a hard-working one on about 70%, an exceptional one by a lot. Higher levels bring rarer goods in smaller amounts (`HIRE[k].haul(lv)`): woodcutter wood and hardwood -> stonepine -> mangrove -> frostwood and charwood (45 items a day at level 1, 28 at 4); miner stone at every level, plus clay, copper, coal, sometimes salt -> iron, silver, gems -> gold, mythril, cobalt -> mythril, adamant, frost ore or obsidian, a regional ore, gems, rarely starmetal (51 items -> 16); the forager and fisher reach further (`forageLv`, `fishLv`: weighted picks, so wider finds and harder fish stay few). The farmhand adds jobs (`fhJobs(m, lv)`, `FH_DO`): 1 water, harvest, fertilise; 2 weeds and the tall grass within 4 tiles of the fields; 3 empties and re-sets crab traps (`trapReady`); 4 takes finished goods out of stations and machines (`fhHasOut`) into storage; up to 220/320/450/600 jobs a day (`FH_CAPS`). Jobs with nowhere to stand beside them (traps in water) are done from where they are. Once the greenhouse is repaired the farmhand works it too, at the same level (`fhWorkMap`, `ghOpen`): with the fields done they walk to its door, go in, do up to `GH_VISIT` (60) jobs and come back out, at most once a minute; the rest is done at 17:00 with the farm (asked 2026-11-04: only sprinklers watered it). The log and card show the level.
- **Luck and rank:** each guild rank adds 5% to what they bring (`hireMult`; it was 10%, which made hiring pay). What they bring is luck: each hand but the farmhand rolls a work ethic when hired (`rollEthic`, `ETHIC`: lazy 25% x0.35-0.6, steady 45% x0.8-1.1, hard-working 22% x1.2-1.5, exceptional 8% x1.7-2.2; `w.skill`, `w.ethic`, told after the first day and shown on the card with the last haul `w.lastHaul`), and every day is x0.5-1.5, 1 in 10 nearly nothing (`dayLuck`). The farmhand always works the same.
- **The day (`HIRE_T`):** at 7:00 they walk in from the village road (`walkIn`). The woodcutter, miner, forager and fisher (their goods by level, below); amounts are per resource, not by worth (asked 2026-11-04: prices change daily and dearer goods shouldn't come in smaller amounts), cross the farm and leave by the Wilds road; at 17:00 they come back (`settle`), put the haul in the Storage Shed (the bank), else a storage crate on the farm, else at the board (`S.hire.stash`, Collect); hay goes into your silos first while they have room (`S.silo`, 240 each), the rest with everything else, and walk off to the village. The farmhand works the farm 7:00-17:00 (`farmhandFrame`: harvest ripe crops, water dry ones, pull weeds, spread fertiliser from the shed or crates; up to `FH_CAP` 220 jobs; harvests go through `CAPTURE` with `addXP` muted), and whatever is left is done at once at 17:00 (`fhCatchUp`). Whenever the fields have nothing left to do and it carries something, the farmhand walks to the drop-off and puts the haul away (asked 2026-11-07; `deliver(k, w, true)` adds it to `w.dropped`, and the 17:00 delivery logs the whole day as one entry).
- **Walking apart:** each kind arrives and returns 7 game minutes after the one before (`hireAt`, by `hireIdx`), stands on its own tile at the drop-off (`hireSpot`) and walks at its own pace; several hired at once set off 3 s apart (`HLATER`). They used to come in on one tile, one path, one speed, and four looked like one.
- **Seen or not:** walkers (`HW`, runtime NPCs `hire_<kind>` in `MAPS.farm.npcs`, hidden from Friends) exist only while you're on the farm; otherwise everything happens on time unseen. Sleeping before 17:00 settles the day first (an `endDay` wrapper). Hired before noon they start the same day; later, they come to say hello and start the next morning. Talking to one says what they're doing and the days left (`k_hire`).
- **Workers' log:** a third notice-board tab (`renderHireLog`): every delivery of the last 112 days (`hireLog` in `deliver`, `S.hire.log`: day, kind, name, level, work ethic, how the day went `q` = work ethic x the day's luck shown as a lazy, average, good or exceptional day (`dayKind`), items, where they went, farmhand jobs), day by day newest first (the per-worker totals were dropped 2026-11-07); chips filter by kind.
- **Auto-renew:** a card checkbox (`w.auto`) renews the contract for its first length (`w.len`) at that level's price when it ends, if the gold is there; the morning report says so, or that it couldn't (`S.hire.notes`, a `showDayReport` wrapper).
- **State:** `S.hire = { w: { kind: { name, lv, len, auto, left, start, arr, del, carry, jobs, phase } }, stash, log, notes }`. A day counts when they deliver; after the last one the contract ends with a toast.

## Feature guides (`public/js/x_help.js`, asked 2026-11-03)
- Windows with a guide get an "i" button in the title bar beside the close button (`#mhelp`, added in a `drawModal` wrapper); it opens a short popup on what the feature is and how it works (`#helppop`; Esc or ✕ closes it first, closing the window closes it too).
- `HELP` holds the texts (title + paragraphs). `helpKey()` picks one by the window title, the Satchel tab, the station (`MODAL.opts.station`), the Markets tab, the town building (`TOWN_ACTS` + `actType`, guilds by `GUILDS`), the region market/inn/forge, or a machine's item name (artisan machines vs other machines).
- Covered: stall, bin, notice boards, markets, village shops (Mara, Brann, Hale, Pip, Corwin, Odile), manor, museum, altar, waystones, merchant, request board, elevator, silo, crates, build sites, machines, crafting stations, town shops, forges, inns, halls, banks, temples, barracks, guilds, and every Satchel tab. New windows need an entry in `HELP` (and in `helpKey` if their title isn't fixed); keep the texts in step when a system changes.
- **Guides from data (2026-11-05):** `helpKey` returns generated keys that `helpGen` writes when opened: `m:<kind>` for each machine (its recipes and times from `STATIONS` with `mult`/`yield`, fuel times from `FUEL` x `fuelx`, power sources, the `STATION_SKILL` XP, its `AUTOTIER` and `UPG` upgrade; hand-written ones in `HELP_MACH` for power sources, the hopper, golem and reaper), `b:<kind>` for each belt (`HELP_BELT` plus the general belt guide), `t:<act>` for each town building (`HELP_TOWN` per shop, the inn's dishes from `mealsAt`, then the guide for its kind), `g:<act>` per guild (fee, ranks, the hired hands it opens, store items and ranks from `GUILDS`/`HIRE`), `shrine:<biome>` (offering and blessing) and `fest:<name>`. Also: Home, Royal Bedchamber, Farewell, the building hammer, the story recap, region dungeons and your child.

## Round 3 fixes (findings in `docs/playtest/round3/SUMMARY.md`)
- **Economy:** the cottage needs 40 stone, not 80 (stone held it up to week three).
- **Fields:** water channels count as a barrier in `enclosedTiles` (x_gate.js) like fences, so a channel led through a fence line leaves no gap for the meadow.
- **Double harvests:** a crop gives one extra with a chance of Farming level × 0.2% + Abundance (10%) + Bountiful picked in Farming (+6% each, which only worked for gathering before; `harvest` in t_balance.js), plus the Life tree's Green Thumb (12% for one more).
- **Wild flowers are items (asked 2026-11-03):** picking a flower gives that species (`WILDFLOWERS` in x_world.js, in sprite order `flower.0-4`): Buttercup 5g, Foxglove 8g, Bluebell 6g, Daisy 4g, Marigold 7g, forage items with the recoloured flower icon. The season's forage flower (dandelion, sweet pea, ice bloom, cinderbloom) turns up instead 12% of the time, up to 50% with Foraging. No more fibre from flowers. The dandelion is 12g (was 40).
- **Code:** `h_pixel.js` `humanSpr`'s `if (K > 1) out.hi = K` had been hidden behind a `//` comment; it's on its own now.
- **Painterly, code only (no atlas rebuild):**
  - `STYLE_SMOOTH` adds `furn_sbench` (the painted bench was see-through) and the repaired greenhouse `bld_greenhouse_(6x5|8x6)(_w)?` (a blank glass box); `STYLE_SKIP` adds `en_troll` (a strip down its edge, washed out).
  - Birches `tree_birch_<s>_0` (s 0-2) use the `_1` painting (`STYLE_ALIAS`): the `_0` ones were painted to their blocky outline. A proper fix needs the birches repainted.
  - Dead trees (the Ashen Wastes) and charwood (the Emberwaste) were repainted on their own sheet with a description of what they are (`art/repaint_one.py`: free painting plus the words, cut as the build cuts, `review.png` to check): every old painting had bright leaves or a shrine and a 3D ground slab with ruins and water. The approved `tree_dead_1_0`, `tree_charwood_1_0` and `tree_charwood_1_1` are pinned (`art/pinned/painterly`) and were added to the Painterly atlas as page 10 without a rebuild; every other season and variant of them is aliased to those (`STYLE_ALIAS` in x_artstyle.js).
  - Adding a few frames without a rebuild: paint with `repaint_one.py`, pin the approved frames, then append them as a new atlas page (frame entries `x y w h k p ox oy` in `atlas.json`, `pages` + 1). A later full `--build` takes them from the pins.
  - Fence gate halves have an open, braced gate leaf beside each post (`gateSpr`); posts and a lintel read as an empty frame.
  - The character creator preview uses `smoothUp` like characters in the world.
  - Painted ground: natural layers plus dirt roads and paths (`d`, `p`) are smoothed with diagonal neighbours at half weight, and the per-pixel hash noise is gone from the border wobble (`paintChunkHiGen`), so borders curve without art-pixel ragging.
  - The sea's depth is a one-pixel-per-tile canvas drawn smoothly (`DEPTHC`), and swells sit at their own place and length in a tile (`waterDepthDraw`).
  - Winter caps of snow on the well, altar, notice boards, bin, signposts, lamp posts, workbench and crates (`snowCap` in an `objSprite` wrapper, x_fix6.js; not indoors or in the Emberwaste).
- **Region towns (`x_regionfolk.js`):** five townsfolk dressed for the region walk the town by day (two stay by the inn at night) and a stallholder stands at the market stall, opening the market when you talk to them. Runtime only (`rf_<region>_<i>`, `k_rfolk`).

## Weapons in the hand while walking (y_anim.js, asked 2026-11-03)
- A held weapon rides in the swinging hand: `walkHand(dir, f)` works out the weapon hand of walk frame `f` with the same arm maths as `walk()` in human.py (side view: the near arm from the shoulder at (15, 24), upper arm and forearm 7 art px; front and back: the outer arm), and `walkHeld` turns it into world coordinates and a blade angle that leans a little with the forearm. Sideways the weapon used to sit at a fixed point in the middle of the body and only rock.
- Knights and guards (Wilds allies in x_realm.js, Briarholt's armed court in x_court.js) use `npcSword`: the sword in the walk-frame hand, at the idle hand, or carried through a wind-up and strike; their body takes the `wind` / `strike` pose meanwhile (`n.pose`, drawn by f_render's NPC loop).


## Forging, cooking, tournaments, companions, bounties, pins and guides (asked 2026-11-05)
- **Minigame panel (`mgOpen`/`mgClose` in `x_forge.js`):** `#mgame`, a canvas drawn at 3x (`res`) in 360x150 units, its own rAF loop, pauses the game (`windowPauses` wrapper), Space/Enter/clicks go to `press(M, pt)` (pt in canvas units), Esc cancels. Shared by forging and cooking.
- **Forging (`x_forge.js`):** Make (one piece) of a weapon or armour at an anvil opens `forgeGame`: 10 hits (`FORGE_HITS`); a mark wanders over the work, turns often and shrinks as its ring runs out (`forgeR`; time `tw` 0.55-1.45 s and radius 8-12 grow with Smithing, time falls with tier). A click within 40% of its radius counts 1, elsewhere on it ½, beside it or a timeout 0. The sum → quality (`forgeQ`: under 4 Crude, 6.5 Standard, 8.5 Fine, 9.5 Masterwork, else Legendary; capped at Fine below Smithing 20 and Masterwork below 40; asked 2026-11-05 so Legendary stays rare; `QUAL`: stats ×0.9/1/1.08/1.16/1.25, price ×0.75-2.8, traits 0/0/1/2/3). Quick forge, batches and the hammers make Standard (the plain item). A catalyst (`CATALYST`, a monster part) makes its trait the first one. The scene (`forgeScene`) is drawn in code (hearth, anvil, tools, the piece glowing via `forgeWork`, sparks, `forgeHammer`); `art/forge_bg.py` paints a smithy from `art/src/forge_guide.png` with ComfyUI, and setting `FORGE_BG_FILE` to `art/ui/forge_bg.png` uses it.
  - **Forged items:** `S.forged[n] = { b, q, tr, mk, day, gen, from }`, item `<base>@<n>`, a non-enumerable IT entry with the base as prototype (`registerForged`, after `initMaps` and `succeed`), so shops and the encyclopedia don't list them; `itemIcon` and `playerPal` use the base.
  - **Traits (`GTRAITS`; `TRAITS` is the animal genes):** weapons Keen, Balanced, Heavy, Sharp, Vampiric, Swift, Lucky, Frostbite/Burning/Holy on some metals; armour Sturdy, Vital, Featherweight, Thorned, Warded, Regenerating, Lucky, Fireproof. Strength by quality (`TKM`). Applied in a `recalc` wrapper (PS stats, `maxHit`, `cd`), `actionHit` (lifesteal `PS.leech`) and `hurtPlayer` (`PS.ward`, `PS.thorns`).
  - **Forge work (`openForgeWork`, button atop the anvil's recipes):** Temper (+1 quality, bars and gold, chance `TEMPER_OK` + Smithing × 0.2%, failure keeps the piece) and Reforge (reroll one trait).
  - **Maker's mark and heirlooms:** your pieces carry `mk`/`day`/`gen`; kept by later generations they gain 3% stats a generation (max 30%).
- **Cooking (`x_cook.js`):** a kitchen recipe opens `cookGame` for the whole batch on the painted hearth (`mg_cook`): each ingredient (3-6 drops, icons on the worktop) is dropped into the pot by clicking while the heat dial's needle is in the green band (centre 1, band ½, else 0; a new band each drop, 6 s each). The average → Plain/Tasty/Delicious/Exquisite (`cookQ`, `COOKQ`; Delicious from Cooking 20, Exquisite from 40). The batch's job converts its output (`jobStep` wrapper, `JOB.cq`) into `<dish>@q<n>` items: non-enumerable IT entries with the dish as prototype and getters for `p`, `eat`, `buff` (duration ×1.5/2/3), registered for every food at DOMContentLoaded (`registerDish`). Every dish without a buff gets one by name (`DISH_BUFF`); eating replaces the same dish's buff at any quality.
- **Fishing tournament (`x_tourney.js`):** day 20 of every season at Finn's Fish (Tournament tab, 50g, sign up the day before or on the day). 8:00-16:00 every fish caught with a rod or harpoon (`give` wrapper while `fishing` or `FG`) is weighed (`fishKg`); the heaviest counts against four rivals (`tourneyRivals`, from the day's seed). At 16:00 the result toasts; the prize waits at Finn's (`S.tourney.prize`): 2500g + `anglers_cup` + title Champion Angler, 1000g, 400g. The morning report announces it 2 days ahead.
- **Companions (`x_companions.js`):** horses count tiles ridden (`a.rode`, on the tick) for stamina levels 1-10 (`HORSE_LV`), each +2.5% riding speed (`horseSpd`, in `g_ui.js`'s update). Pet hearts = affection / 10; a fish or meat treat once a day (+4, `S.pet.fed`) on top of petting; digs are likelier and reach rarer finds by hearts (`petDigChance`, `PET_FINDS`, used by x_world.js). The Animals tab shows both under Companions.
- **Bounties (`x_bounty.js`):** the Kingsbridge barracks' Bounties tab posts three a week (`bountyList`, from the seed: a Hollow Vale creature by biome, a lair tile in that biome, level, gold). Take one: an arrow at your feet points to the lair in the Wilds; within 30 tiles the elite spawns (8x health, 1.6x attack, gold ring and name). The kill marks it done (`killEnemy` wrapper); Claim pays gold, +5 Kingsbridge standing and a Fine or Masterwork piece with traits of the biome's metal (`BOUNTY_TIER`, "Taken from <name>"). State `S.bounty` per week.
- **Pinned recipes (`x_track.js`):** a 📌 on every recipe row (matched by name); up to 3 pins (`S.pins`) show in `#pins` on the left with have / need per ingredient, counting the bank when a Storage Shed exists.
- **Guides tab (`x_guides.js`):** a Satchel tab and dock button (key Y, code-drawn icon): topic guides (`GUIDES`: farming, crafting, forging, cooking, building, machines, animals, fishing, money, fighting, exploring, guilds, family) and every `HELP` entry, with search. It also extends the "i" guides for the station, recipe book, animals, barracks, forge, Finn's and Kingsbridge.
- **ComfyUI lives inside the Claude app's storage (2026-11-05):** the `comfyy` install and its models (Qwen Image Edit, ~31 GB) were set up from Claude's shell, so they sit in `AppData\Local\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Local\Comfy-Desktop\` and the user's own ComfyUI Desktop can't see them. ComfyUI 0.43 also rejects any input image stored there ("Invalid image file": its realpath check). Run the server directly with the input and output folders in the project: from `AppData/Local/Comfy-Desktop/ComfyUI-Installs/comfyy`, `ComfyUI/.venv/Scripts/python.exe -s ComfyUI/main.py --port 8189 --extra-model-paths-config "<Roaming>/Comfy Desktop/instance-model-paths/inst-1793571085799.yaml" --input-directory comfyui/live_in --output-directory comfyui/live_out`, and set `COMFY_HOST=http://127.0.0.1:8189` for `restyle.py` (art/forge_bg.py, style_free.py...).
- **The forge's smithy** is `public/art/ui/forge_bg.png`, painted freely (denoise 1) by `art/forge_bg.py` (seed 11 picked; `--pick <seed>` copies a try); `FORGE_BG_FILE` turns it on and `forgePiece` sets the piece on its anvil top (face y 76, x 226).
- **Painted minigame scenes (`art/minigame_bg.py`):** `mg_cook`, `mg_under`, `mg_reel`, `mg_harpoon`, `mg_haul` in `public/art/ui/` (a rough layout drawn in Python, painted freely by ComfyUI, `--pick <scene> <seed>`); `mgScene` / `mgDrawScene` (x_forge.js) draw them to cover a panel. The forge's `mg` panel, the harpoon and the trap canvases are drawn at 3x.
- **Rod fishing (`x_fishgame.js`, asked 2026-11-05):** a bite now opens an underwater view (`fishGame`, painted lake): 4-6 fish from `chooseFish` for that water (so only what can be caught there, by season, time and skill) swim about; the hook follows the mouse (speed by rod); shy fish (difficulty 3+) dart away, easy ones come for the bait; touching a fish's mouth hooks it (18 s limit). Then the old reel (same formulas as `updateFishing`, which is skipped while `fishing.phase` is 'mg') runs in the window with a painted gauge (`mg_reel`), net zone, treasure chest and catch bar. `fishing` stays set during the game so the tournament weighs the catch.
- **Fish art (`art/fish_paint.py`):** every fish (`art/src/fish_list.json`, exported from the game) is painted from a coloured side-view silhouette on magenta, keyed out and cropped to `public/art/fish/<id>.png` (256 px wide, facing right); `public/art/fish/fish.json` lists them so the game never requests a missing one. `drawFishArt` swings the back third as a tail; the harpoon uses it for the fish's shadow and the fight.

## Painted icons, UI, creatures and props (asked 2026-11-05; art playtest 4 in `docs/playtest/art4/`)
All of this is used only in painted styles (`SETTINGS.artStyle !== 'pixel'`); the pixel style is unchanged. Every script paints through ComfyUI (`COMFY_HOST`, see the ComfyUI note above), keys out a magenta card and writes to `public/art/...` with a JSON list the game fetches, so it never requests a missing file.
- **Item icons (`art/icon_paint.py`, `x_icons.js`):** every item (except the gear and tools the testers liked: swords, spears, hammers, staffs, shields, robes, hats, gems but pearls, rings, the big fish) is painted by name from its pixel icon (`art/src/icons`, exported with `export_icons`), with exact descriptions for items whose old icon was the wrong shape (`HINT`, no guide picture) and container hints for artisan goods (`SHAPE_HINT`). `--pack` writes `public/art/icons/icons.png` + `icons.json` (96 px cells). `itemIcon` returns the painting (`hi` 3, drawn smooth); forged gear and fine dishes use their base item's. Strains (`PSTRAIN`): produce is the crop's painting recoloured toward the strain colour (a 'color' blend, green leaves put back), seeds the crop's painted packet with a light wash of the colour and a round coloured tag with a star. Fish with a minigame painting (`FISH_LIST`) use that side view as their icon, slanted across the slot (`PFISH`; the icon painter worked from one flat pixel fish shape), and their smoked versions the same painting multiplied golden brown. When the atlas loads, `ICACHE` is cleared.
- **UI (`art/ui_paint.py`, `art/ui_finish.py`, `x_uiart.js`):** a carved dark-oak frame with brass corners (`ui_frame`, border-image slice 64), parchment (`ui_parch`), an oak-plank button (`ui_button`), a recessed wooden slot (`ui_slot`) and a dark oak dock tile (`ui_tile`), darkened in `ui_finish` (gold kept bright, magenta despilled, slot and tile masked to rounded squares). CSS under `body.styled` puts them on windows, panels, toasts, minigame panels, buttons, slots, dock tiles and tabs. Scrollbars are dark oak too (`::-webkit-scrollbar` rules in x_uiart.js: a sunken dark-wood track, an oak thumb with a brass rim; Chromium skips these on any element that sets `scrollbar-width` or `scrollbar-color`, so don't set those).
- **Creatures and animals (`art/creature_paint.py`, `art/animal_paint.py`, `x_artfix.js`):** one free painting per enemy key, animal coat and pet (`public/art/creatures/`, `public/art/animals/`, facing right), described by body type (`BODY`) so the model keeps the creature's build. `paintedFrame` builds every frame from it inside the sprite's own box, sized to the creature's drawn height (`alphaBox`) and bottom-aligned: walk frames have real legs (asked 2026-11-07: a still painting that hopped, tilted and squashed looked ridiculous): `legCut` cuts the painting's leg band into a back and a front half that swing in turn, full for four-legged creatures and farm animals (`LEGS_QUAD`), a little for upright ones (`LEGS_UP`, chickens and ducks), with no tilt or squash; fliers, slimes and ghosts only lift gently, and the game's own walk bob (`enemyAnim`, the pet's bounce) is off in painted styles, the wind-up leans back, the strike lunges in, a pet's sit squashes down; the game's recoil, flash and lunge play on top. Without a painting the atlas frames are used, with outlines rounded (`featherOf`) and broken frames aliased to good ones (`STYLE_ALIAS` entries at the top of x_artfix.js).
- **Single sprites (`art/object_paint.py`):** lamp posts (`lantern_off`), the table lamp, rugs (`dec_rug_*`, from above; the purple rug is painted crimson, since purple is too near the magenta card), the sailboat (`ferry`) and sprinklers are free paintings fitted into the sprite's world box (`ww`/`wh`, aspect kept, bottom-aligned, floor decals centred); `objcut` drops anything touching the picture's border.
- **Buildings are edits of their own Painterly painting, never free paintings** (asked 2026-11-05: freely painted barns came out isometric and lit, another style, and winter looks moved the building). `art/src/summer/<name>.png` holds the atlas paintings (exported with `OBJ_LIST` cleared). `EDITS` in object_paint.py (`--edits [names]`) makes the upgrade looks as word edits at denoise .72 (`edit_aligned`): barn `_l2` from the barn, `_l3` from `_l2`, `_l4` from `_l3`; coop `_l3`/`_l4` from `_l2`; stable fixed, `_l2`, `_l3`; the storage shed `bld_cabin_4x3` without snow (its atlas painting has snow the model keeps, so `art/desnow.py` takes it off in code first, then an edit tidies the roof, seed 11). `--winter-all [names]` makes every building's `_w` as a snow edit of its summer painting (or of its edit), at exactly the same size (`winter_aligned`; the Frostmere and Emberwaste are left out). `write_align` writes `public/art/objects/aligned.json` (painting -> the atlas frame it lines up with) and `objects.json`. In the game (`OBJ_ALIGN` in x_artfix.js) an aligned painting takes that frame's canvas size, `off`, `k`, `hi`, anchors, `meta` (windows, chimney) and `cast`, so it sits exactly where the summer building does. Paintings load on first use, so when one arrives `bldReload` clears `b.sprName` for every building using it and runs `refreshBuildings` (buildings keep their sprite in `b.spr`: a winter look asked for before its painting loaded kept the old atlas painting all season).
- **The shadow key (`art/magenta.py`, used by every painting script):** the model paints shadows on the magenta card as darker or greyer magenta, which keying bright magenta left as a baked-in patch under each painting (the game draws its own shadows). `alpha()` keys the card and then grows out from it into pixels whose red and blue stay about equal with green below them; maroon and purple parts never qualify, and nothing apart from the card is touched. `art/recut.py` re-cuts every finished painting (fish, animals, creatures, objects, icons, then re-packs the icons) from its raw output with it.
- **Projectiles, skill shots, hazards:** smooth arrows with fletching (`softArrow`), glowing orbs with trails (`softOrb`), shaded rocks, and gradient hazards (pools with moving hot spots, dashed rims while they telegraph, quake bands, lanes with sparkles, foam waves) in `drawSkp`, `drawEnt` (proj) and `drawHazards` wrappers. Gradients only, no canvas filters.


## Isle goods, heart scenes, interiors and double yields (asked 2026-11-07)
- **Isle goods (`x_islegoods.js`):** every isle good now has a use. Ten rings at an anvil (`ISLE_RINGS`: each guardian trophy makes the best ring of its kind, e.g. the Leviathan Ring and the Drowned King's Seal; pearls, relic coins, siren scales and mistwood make lesser ones). Thirteen dishes and elixirs at any kitchen from the isles' fish and forage (`ISLE_DISHES`, strong buffs, up to the Sunken King's Feast); each isle's recipes are learned the first time you land there (`ISLE_COOK`, `S.known`, on the `map` event). Cinder scales and coral cores are forging catalysts; mistwood branches are fuel (20 ticks). Their icons are the pixel ones until `icon_paint.py` paints them.
- **Heart scenes (`x_hearts.js`):** Mara, Brann, Pip, Odile, Hale, Elias and Corwin each have a scene at 2, 5 and 8 hearts (`HEART_SCENES`), played on the next greeting (shop, street window, festival): a gift at 2, a choice worth friendship at 5, a keepsake at 8 (Mara also teaches her honey cake). They sit between the romance scenes (4, 7, 10) and wait a greeting if one of those plays. Seen: `S.fam.seen['h<id><lv>']`.
- **Interiors (`x_interiors.js`):** every building has an inside. `IN_GEN` builds a room on entry for town houses (`k_house`), region houses (`r_house`), the village cottages, region inns and forges (`r_inn`, `r_smith`, with a keeper `rk_<region>_<kind>`), Lord Ashcombe's manor (`landowner`, keeper `ashcombe` at a Deeds desk, manor hours), the frozen cabin (a journal, `cabin_note`) and the farm tent (bedroll = Rest). The `genInterior` wrapper sends the exit back to the door you used (`nearestB`) and keeps the region as `m.inRegion`, lent as `cur.region` only while an inn or forge menu opens (a room with `m.region` set ran the region systems and crashed `checkPOIs`). Homes: three layouts (`HOME_PLANS`) picked from the building's place, furnished by town or region (`IN_STYLE`: walls, floor, trade pieces, names, lines; `WALLPAL.hide` for Emberwaste tents), one or two residents (`homefolk` runtime NPCs, talk `k_home`), doors barred 22:00-6:00. Stalls, mine and dungeon mouths, the greenhouse and the keep keep their own ways in.
- **Double yields (`x_fix7.js`):** Bountiful (+6% double yield, offered in every life skill from level 30) counted only for woodcutting, mining and farming. Now also forage pick-ups and wild flowers (Gatherer gives its promised 25%; it rolled 12%), rod and harpoon catches ("Two on the line"), and every unit made at a station by the recipe's skill (or the station's, `BOUNTY_SKILL`; gear excluded). `canCraft` marks the recipe for the `give` that follows in the same run (`BOUNTY_CTX`).
- **Spent fields go back to ground (`x_fix7.js`, asked 2026-11-07):** soil that has had a crop (`s.had`, set on the tick) and has none any more (the last harvest of a crop that doesn't regrow, or a withered plant cleared by hand or scythe) is removed on the tick, whatever took the crop. Regrowing crops keep their soil. Kept: soil within reach of a seed hopper (3) or an ember golem (6), which re-sow it (`SOWER_R`), and the greenhouse (not in `farmMaps`).
