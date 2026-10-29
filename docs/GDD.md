# Emberhollow — Game Design Document

## 1. Vision
You inherit a run-down farm at the edge of a valley. You start with an empty clearing, a tent and a wooden sword. You build the farm piece by piece, buy more land, raise and breed animals, master dozens of skills, and fight your way down an old mine where something wears a hollow crown.

The pillars are:
- **Build it yourself.** Nothing on the farm exists until you construct it.
- **Deep progression.** RuneScape-length skill grinds with Path of Exile-style choices at every step.
- **Readable, satisfying combat.** RuneScape tick-based combat with a small set of abilities.
- **A world worth exploring.** Procedural wilds full of secrets, bosses and resources.

## 2. Art direction
- **Style:** top-down 3/4-view pixel art at **32px per tile**, like Stardew Valley and the reference packs (village, blacksmith interior, glowing cave). Chunky readable shapes, hue-shifted shading (shadows lean blue/violet, highlights lean warm yellow), light from the top-left, 1px selective outlines (a darker shade of the colour each edge touches), small dithered transitions.
- **How art is made:** every sprite is drawn by a Python script in `art/` using the local pixelart-mcp library (ramps, form shading, outlines), then packed into one atlas. No hand-drawn image files and no AI image generation. Characters are palette-swapped templates so every outfit and equipment tier is automatic.
- **Palette:** saturated but warm. Grass `#74b048`/`#5a9a38`, dirt `#d6b17c`, stone `#9a9080`, water `#4a92c4`, wood `#8a5a34`, accent ember `#e0783a`. Keep each biome to about 6 core colours.
- **Lighting:** a cool ambient that darkens through the day/night cycle, with warm point lights (forge, torches, candles, windows, campfires) applied as a banded, lightly dithered light map, plus glow halos around flames. Mines and night use it most.
- **Animation:** frame-based. 4-frame walk cycles per facing, weapon swings, tree and grass sway, flickering flames, rippling water.
- **UI:** cream paper panels with soft shadows and rounded wooden frames, carried over from the mobile version's storybook UI. Fonts are Fredoka for UI text and Cinzel Decorative for titles (both SIL OFL; the woff2 files are in `reference/`).

## 3. Character and equipment
- **Character sprite:** a layered 32x64 template per facing (front, side, back; left is the side mirrored) with 4 walk frames. Layers: body, hair style (short, long, pony, bun, spiky, bald), beard, hood, helm + plume, hat, crown, robe, apron, belt, cape. Appearance is customised at game start: skin, hair style and colour, eye colour, starter outfit colours.
- **Equipment slots:** head, body, legs, feet, hands, cape, main hand, off hand, 2 rings, amulet. Every worn item shows on the sprite: armour recolours its layer with the tier's ramp and adds tier details (nose guards, horns, plumes, trims).
- **Tiers:** Bronze, Iron, Steel, Silver, Mythril, Frostsilver, Obsidian, Adamant, Dragonscale, Starforged. Each tier changes colour and shine and adds silhouette details such as nose guards, horns, spikes, capes and glowing trims.
- **Weapon types:** sword, spear, warhammer, dagger, bow, staff. Each has its own idle stance and attack animation.

## 4. Movement
- **Click-to-move:** A* pathfinding on a navigation grid (0.5 m cells) built from terrain slope, water and obstacles. A ground marker shows the destination. Clicking an enemy, NPC, station or resource walks you into range, then acts.
- **WASD:** direct movement in the four screen directions. Pressing any key cancels the current path.
- **Run and energy:** Shift toggles run. Running drains energy, which recovers while walking or resting.
- **Dodge roll (Space):** about 0.4 s of invulnerability on a cooldown.
- **Mounts:** horses from the breeding system increase speed. Their stats affect speed and stamina.

## 5. Combat (RuneScape-style)
- **Tick-based:** combat resolves on the 0.6 s game tick. Each weapon has an attack speed in ticks (for example, dagger 3, sword 4, warhammer 6).
- **Auto-attack:** click an enemy to target it. You walk into range and auto-attack every N ticks until it dies or you move away.
- **Three ability slots (keys 1–3):** chosen from abilities unlocked in the combat skill tree. Each ability has a cooldown in ticks and a resource cost (Focus). Example starters: *Cleave* (arc damage), *Lunge* (dash plus a strike), *Guard* (block 50% for 3 ticks, then counter).
- **Focus resource:** builds up from auto-attacks and is spent on abilities. It's the rhythm of the fight: auto, auto, ability.
- **Combat styles:** Melee, Ranged and Magic, each with its own XP skill. Defence and Constitution are trained by every style.
- **Hit calculation:** accuracy rating versus defence rating, then a damage roll from max hit. Show hit splats over enemies (red for damage, blue for blocked) like RuneScape.
- **Enemies:** aggressive or passive, with aggro radius, attack style, weaknesses (stab, slash, crush, fire, ice), drop tables and a combat level shown on hover.
- **Bosses:** telegraphed attacks drawn as red decals on the ground, distinct phases, and loot tables with rare drops. The mobile version's 8 bosses carry over.

### Combat skill tree (Path of Exile-style)
- One shared passive tree with three regions (Might, Precision, Arcana) that blend into each other. You earn 1 point per combat level (sum of combat skills divided by 3) and the tree has about 120 nodes.
- **Small nodes:** +% damage, +accuracy, +health, +Focus regeneration, and so on.
- **Notables:** bigger effects, such as "Abilities refund 20% Focus on kill".
- **Keystones:** build-defining trade-offs, such as "Berserker: +40% damage, cannot use Guard".
- **Ability unlock nodes:** taking one adds that ability to your pool of choices for the 3 slots.
- Respec costs gold at a village shrine. The tree is rendered as an interactive canvas UI.

## 6. Lifeskills (RuneScape and Path of Exile depth)
- **Levels 1–99** using the RuneScape XP curve: `xp(L) = floor(sum_{n=1}^{L-1} floor(n + 300·2^(n/7)) / 4)`. Level 99 is about 13 M XP.
- **Skills:** Farming, Husbandry, Foraging, Woodcutting, Mining, Smithing, Fishing, Cooking, Crafting (leather, cloth, jewellery), Carpentry/Construction, Herblore (potions), Melee, Ranged, Magic, Defence, Constitution, Agility.
- **Unlocks:** each level unlocks content. Example: Mining 15 for iron, 30 silver, 40 gold, 55 mythril, 70 frostsilver, 85 adamant, 99 starmetal.
- **Passive picks:** every 10 levels, choose 1 of 3 passives for that skill (9 picks per skill). Picks are respec-able at a cost. Examples for Woodcutting: *Clean Cuts* (10% chance of double logs), *Second Wind* (chopping restores energy), *Forest Sense* (rare nests drop more often).
- **Mastery at 99:** a cape item and a unique keystone passive for that skill.
- **Actions run on ticks:** for example, chopping rolls a success chance each tick, based on level, tool tier and the tree's difficulty.

## 7. Crafting at stations
The backpack menu no longer crafts. Every recipe belongs to a station that must be built or found:

| Station | Makes |
|---|---|
| Workbench | tools, fences, basic furniture, construction parts |
| Furnace | bars from ores |
| Anvil | weapons and armor from bars |
| Tanning rack and loom | leather, cloth, ranged armor |
| Kitchen stove and campfire | food |
| Herblore table | potions |
| Jeweller's bench | rings and amulets |
| Kegs, presses, smokers | artisan goods |

- **Workflow:** walk to the station, open its window, pick a recipe, set a quantity, and watch the character perform the animation each tick until the batch finishes. Ingredients come from your inventory or from storage chests linked to the station (built later).
- **Inventory (RuneScape-style, implemented in the starter):**
  - The backpack is a 28-slot grid. Coins, arrows, runes and seeds stack in one slot; everything else takes one slot each.
  - Left-click runs the item's default action (Wield, Wear, Eat, Use). Right-click opens a menu with Wear/Wield, Use, Drop and Examine. Use followed by a second item is item-on-item crafting (for example, knife on logs).
  - The Worn Equipment tab has 11 slots in RuneScape's layout and shows Attack, Strength and Defence bonus totals. Clicking a slot removes the item back into the backpack if there's space.
  - Two-handed weapons unequip the shield, and equipping a shield unequips a two-handed weapon. Both check backpack space first.
  - Dropped items appear on the ground and can be picked up by clicking them. Items on the ground despawn after 3 in-game minutes.
  - Bank: a constructible Storage Shed and the village bank give large stack-everything storage. Later, equipment presets (save and load a whole loadout) live in the bank.

## 8. Construction (nothing pre-built)
- You start with an empty clearing, a tent (bed and save point) and a campfire.
- **Blueprints** come from Hale the carpenter or from Construction levels. Placement mode shows a ghost sprite that turns green or red for valid or invalid spots, snaps to the grid and rotates 90°.
- **Build sites:** placing a blueprint creates a scaffold. Deliver the materials, then use a hammer for a number of ticks to raise it in visible stages (foundation, frame, walls, roof).
- **Buildings:** Farmhouse (tent → cottage → house → manor, unlocking rooms), Coop, Barn, Stable, Silo, Greenhouse, Well, Workshop (holds stations), Smithy, Kitchen, Storage Shed, Fish Pond, Beehives, Paddocks, Fences and gates, Paths, Decorations, Windmill (flour), Mill, Market Stall (sell goods for a premium on market days).
- **Upgrades:** each building has 3 levels with more capacity or bonuses.
- **Interiors (later):** the Farmhouse gets a separate interior scene with placeable furniture.

## 9. Farm expansion
- **Landowner NPC:** Lord Ashcombe at the manor in the village sells land deeds.
- **Plots:** the farm sits on a grid of plots. You own the centre plot at the start. Adjacent plots can be bought, and each plot is procedurally generated from the world seed plus its coordinates.
- **Each deed shows a preview:** terrain type (meadow, woodland, rocky, lakeside, hillside, marsh), soil quality (a growth and quality modifier), resources present (trees, ore rocks, a pond, berry bushes), special features (a ruin with a chest, a hot spring, a fairy ring, an ancient tree) and a price.
- **Options:** buy outright, lease (a weekly fee, cheaper up front), or survey (pay a little to reveal hidden features).
- **After purchase:** the plot's fence line opens and its content becomes part of your farm. Clear it, build on it and farm it.

## 10. Shops and economy
- **Shop window:** stock with quantities that restock daily, buy and sell tabs, and prices that shift with supply (selling 50 of something lowers its price, which recovers over days).
- **Shops:** General store (Mara), Smithy (Brann), Tavern (Pip), Stables (Odile), Carpenter (Hale, who sells blueprints), Museum (Elias), Fisher (Corwin), Landowner (deeds), Wandering merchant (rare rotating stock), Herbalist (new, potion supplies).
- **Market stall:** a building you construct. Stock it, and visitors buy over the day at better prices.
- **Shipping bin:** stays for overnight bulk selling at base price.

## 11. Systems carried over from the mobile version
These carry over as described in `reference/v3-mobile-source/c_data.js` and `e_play.js`:
- 36 crops, fruit trees, crop quality and fertilizers.
- Animals and genetics: 8 species, genes graded S–D, heritable traits, litters, horse racing.
- Artisan machines, fishing (30 fish, 5 legendary), cooking buffs.
- NPC friendships, gifts and heart rewards.
- The procedural Wilds with 6 biomes, POIs, secrets, lore pages, ember shards and shrines.
- The mine (40 floors, 4 themes, bosses on 10/20/30/40) and world bosses.
- Quests and collections.

## 12. Phased roadmap

### Phase 1: Foundation
- Game tick, event bus, data loader, save/load.
- Navigation grid plus A* click-to-move. WASD plus dodge.
- Done in the starter: 28-slot backpack, worn equipment tab, right-click menus, ground items, visible equipment for all slots. Still to do: level requirements enforced on equip, item-on-item Use, bank, equipment presets.
- Day/night cycle with lighting.
- Character creator.
- **Acceptance:** walk anywhere by clicking or WASD; equipping any armor piece changes the sprite; save and reload restores position, inventory and equipment.

### Phase 2: Combat
- Targeting, auto-attack on ticks, hit splats, health bars.
- Focus and 3 ability slots.
- 6 enemy types with AI (aggro, chase, leash), drops and loot pickup.
- Combat XP and levels.
- Passive tree UI with about 40 nodes to start.
- One boss with telegraphs.
- **Acceptance:** a full fight loop (target, auto, abilities, loot, XP); tree points spend and change stats; the boss is beatable and drops loot.

### Phase 3: Skilling and stations
- Woodcutting, Mining, Fishing, Smithing, Cooking and Crafting on ticks, levels 1–99 with unlocks and passive picks.
- Workbench, furnace, anvil, stove, tanning rack.
- Resource nodes that respawn.
- **Acceptance:** chop logs, mine ore, smelt bars, smith a sword at the anvil, equip it and see it on the character.

### Phase 4: Construction and farm
- Blueprints, ghost placement, scaffolds and build stages.
- Tent → farmhouse. Coop, barn, well, fences, paths.
- Farming with soil, watering, growth on ticks and seasons.
- **Acceptance:** build a coop from nothing and see it rise in stages; plant, water and harvest a crop.

### Phase 5: Land and economy
- Landowner, deed previews, procedurally generated plots, buy, lease and survey.
- Shops with stock, restock and dynamic prices.
- Market stall.
- **Acceptance:** buy a lakeside plot, see it join the farm, and fish in its pond.

### Phase 6: Life
- Animals and genetics (port), NPC schedules and friendships, festivals.
- **Acceptance:** buy two chickens, breed them, and see the offspring's genes.

### Phase 7: World
- The Wilds with chunk streaming and biomes (port from `d_world.js`), POIs and secrets.
- Mine floors as separate scenes.
- World bosses.

### Phase 8: Automation and production
Everything is produced at stations, and stations can be chained and automated like a small Factorio, with medieval technology only (no engines, no tractors).
- **Fuel:** furnaces, smelters, kilns, ovens and boilers burn fuel (wood, charcoal, coal, peat). Fuel goes in a fuel slot by hand or by conveyor. A station with no fuel stops.
- **Stations with input, fuel and output slots:** furnace (ore → bars), charcoal kiln (wood → charcoal), anvil bench (bars → parts), mill (wheat → flour; grass and weeds → fibre), compost bin (weeds, grass, scraps → compost), loom, press, smoker, oven. Each runs its recipe on game ticks while it has inputs and fuel, and holds its output until it is taken out.
- **Storage:** crates and chests that hold items; a chest can be the start or end of a line.
- **Conveyors:** placed on the ground tile by tile with a direction. They carry items one tile at a time on the tick. A conveyor pointing into a station or chest inserts; a station or chest with a conveyor leading away pushes its output onto it.
- **Mechanical power:** waterwheels and windmills (and later treadwheels with animals) power mills, presses and conveyors. Conveyors need power from a nearby wheel or mill.
- **Sorting:** splitters and filter gates send chosen items left or right.
- **Example chain:** mine ore → drop it in a chest → conveyor → furnace (fuelled with charcoal from a kiln on its own line) → conveyor → anvil bench or a storage chest.
- **Farm automation:** horses (from husbandry) pull tools that work several tiles at once: plough (till a 3-wide row), seed drill (plant a row), harrow (clear weeds and grass, which drop as fibre), cart (carry a big load to a chest). Water channels from a well or pond water connected fields. Scarecrows and sprinklers stay.
- **Acceptance:** build a chest → conveyor → fuelled furnace → conveyor → chest line that turns ore into bars while you are away; plough and plant a field with a horse.

### Phase 9: Balancing pass
The game is meant to be played slowly, bit by bit, over months.
- **Economy:** quality tiers (silver, gold, ember) are worth a modest premium (about +15%, +35%, +70%), not double. Prices are tuned so early cash comes from many small sales, and big purchases (plots, buildings, horses) take weeks of play.
- **Skills:** XP rates tuned so the first levels come in an evening, level 50 takes weeks and 99 is a long-term goal. Passive picks are modest (+5-10%), never doubling income.
- **Gear, crops and animals:** tier stats, crop growth and sell values, animal production and gene effects all re-tuned together.
- **Pacing targets:** written down per season (what a player should have by the end of each season of the first two years) and checked with simulated play.
- **Done:** `public/js/t_balance.js`. Spring year 1 ≈ 7k earned, summer ≈ 19k total, year one ≈ 39k (simulated, 40 tiles of the best crops). Cottage 1600g, coop 2400g, barn 5000g, plots ~11-13k. Skills: ~5h of one skill to 30, ~18h to 50, ~200h to 99. Gold quality is ~16-25% of harvests at level 99.

### Phase 10: Building art
- Redraw building exteriors so roofs fit their walls: proper eaves, gable ends, ridge lines and overhangs, chimneys sitting on the roof, varied materials and detail (beams, shutters, flower boxes, weathering, moss).
- Farm buildings upgrade visibly with each level. Every building has its own look instead of shared templates.
- **Done:** every building is drawn from a roof form (side gable, hip, front gable, gambrel) and its own materials and details; doors and windows are sized for the characters; coop, barn and stable have a look per upgrade level.

### Phase 11: World regions
- The world grows to several large regions (about four times today's land), each with its own biomes, a town or camp, dungeons and a world boss: the Hollow Vale (farm, village and today's Wilds), the Highmarch (mountains and mines), the Saltreach (coast and islands), the Emberwaste (volcanic badlands), and the Frostmere (frozen north).
- Regions are generated from the world seed; roads connect them, travel unlocks through the storylines, and later fast travel by waystones and horse.
- **Done:** `public/js/u_regions.js`. The four regions, each with a town, a five-floor dungeon with its own boss, a world boss and hidden caches; gates open by beating the Wilds boss that guards each road until Phase 12 storylines take over (`S.regions`); waystones for fast travel; Corwin's ferry to the Saltreach.

- **Regional identity (done):** every region has its own creatures and bosses, building style, ore and gear tier (Cobalt, Tidesteel, Rimesteel, Cindersteel), wood, forage, fish, crops, dishes, monster parts and trophy rings, so each region is a step up in progression.

### Phase 12: Storylines
- Several questlines that run side by side, each with chapters, a cast of characters and a reward. Examples: the Hollow Crown (main story through the mine), the Ashcombe inheritance (the landowner's family), the Lost Lanterns (the village's history and festivals), the Salt Smugglers (the coast), the Ember Pilgrims (the shrines and ember shards).
- Quests are written against roles, not coordinates ("the nearest ruin in the Highmarch", "a cave in a frost biome"), so they place themselves in each procedurally generated world. A quest that needs a place that doesn't exist yet creates it.
- A journal tracks active chapters, clues and map markers.
- **Done:** `public/js/w_story.js`. The five storylines (Hollow Crown in 6 chapters, Ashcombe Signet 2, Lost Lanterns 3, Salt Smugglers 3, Ember Pilgrims 4) with seven new characters, role-based places that create a site in the right biome when needed, a bottom-of-screen dialogue box with choices, journal tracking with map markers, and story chapters that open the four regions.

### Phase 13: Relationships and generations
- **Romance:** eligible villagers can be dated after enough hearts (a bouquet), with heart events and dates. A pendant proposes marriage; the spouse moves into the farmhouse, helps with chores and has their own schedule.
- **Children:** a married couple can have children who grow up over the years: baby, child (helps a little), teen (learns skills), adult.
- **Aging:** time passes in years; characters age, and their stats slowly change with age.
- **Generations:** when your character dies (old age, or death in danger), you continue as your spouse or an adult child, inheriting the farm, money and buildings; the heir starts with their own skills plus a family bonus. **Without a spouse or child you cannot die:** a fatal blow only knocks you out, and you don't die of old age either.
- Family tree screen and a family crest.
- **Done:** `public/js/x_family.js`. Five romanceable villagers with heart scenes, dates, the Ember Pendant and a wedding; the spouse's home schedule and morning chores; up to three children who grow through four stages; aging that changes stats; death only with an heir; succession with inherited farm and a growing family XP bonus; a Family tab with crest and tree.

### Phase 14: Animation
- **Characters:** more frames per walk cycle (6-8), run and idle breathing, turning, tool-use animations per tool (chop, mine, till, water, cast and reel), carrying, eating, sitting and riding poses, emotes for villagers.
- **Combat:** wind-up, strike and recovery frames for every weapon type (sword slash arcs, spear thrusts, warhammer overhead smashes, dagger flurries, bow draw and release), hit reactions and knockback flashes on enemies, dodge rolls, block poses for Guard, ability effects (Cleave sweep, Lunge dash trail, Rend bleed), and death animations.
- **Creatures:** proper walk, attack and hurt frames for animals, enemies and bosses; boss telegraph animations that match their attacks.
- **World:** swaying crops and trees, flowing water, smoke, sparks from forges and anvils, turning windmills and wheels, belt items sliding smoothly between tiles.
- **Acceptance:** every action the player can take has its own animation, and every weapon's attack reads clearly in a fight.
- **Done:** `public/js/y_anim.js` and new frames in `human.py`: 8-frame walk, idle breathing, poses for tools, weapons, eating, fishing, Guard, hurt and the dodge roll; per-weapon wind-up/strike/recovery with trails; ability effects; enemy walk bob, attack lunges, hit recoil, telegraph crouches and death fades; water and lava glints, forge sparks, sliding belt items, villager emotes. Still open: crop/tree sway, hand-drawn enemy frames, carrying/sitting/turning, a knockout fall.

### Phase 15: Polish
- Sound and music, settings menu (graphics quality, keybinds).
- Windows installer.
- Performance pass.
