# Art playtest 4: icons and UI in Painterly

Tester: icons-and-UI art pass. Test sandbox (developer mode), art style switched to Painterly (`SETTINGS.artStyle = 'painterly'`, body class `styled` confirmed, world painted).
Method: every one of the 810 `IT` items was rendered with the game's own `iconURL(id)` into contact sheets per item type (12 per row, 72 px as in the bag), with the id, the icon shape (`IT[id].sh`) and the width of the underlying `itemIcon(id)` canvas under each. **A 32 px canvas means the icon is still the 16/32 px pixel icon blown up; 96 means a styled (hi-res) icon.** Then the windows were opened in game: backpack, hotbar, bank, Encyclopedia, anvil recipes, smelter slot window, Mara's shop, forging and cooking minigames, farm and Wilds maps, creator, morning report, story dialogue, HUD, buffs, tooltips.

Screenshots are in `docs/playtest/art4/shots/`:
- in game: `ui_1` (HUD, dock, hotbar), `ui_2` / `ui_2z` (backpack), `ui_3` / `ui_3z` (anvil recipes), `ui_4`, `ui_5`, `ui_5z` (forging), `ui_7` (cooking), `ui_8` (smelter window), `ui_9` (bank), `ui_10` (Encyclopedia), `ui_11` (farm map), `ui_12` (Wilds map), `ui_13` / `ui_13z` (creator), `ui_14` (morning report), `ui_15` (tooltip), `ui_16`, `ui_17`, `ui_17z` (Mara's shop), `ui_18` (skills), `ui_19` (collections), `ui_20z` (HUD buffs), `ui_21` (story dialogue), `ui_dockz`, `ui_hotz`, `ui_hudz` (zooms)
- contact sheets (every item, by type): `ui_30_seed`, `ui_31_crop`, `ui_32_forage`, `ui_33_misc` (fruit, saplings, hay, fertiliser, ammo, paths, implements, blueprints, tools, canoe, fishing tools, hammer, special/story), `ui_34_c_mats` (materials, ores, bars, gems, artifacts), `ui_35_loot`, `ui_36_fish`, `ui_37_artisan`, `ui_38_food`, `ui_39_weapon`, `ui_40_armor`, `ui_41_c_anim` (animal products, rings), `ui_42_place` (placeables), `ui_43_tools` (every tool kind at levels 0-6), `ui_44_q` (quality stars, strain produce and seed sack), plus 3x zooms `ui_45_z_crop`, `ui_46_z_mats`, `ui_47_z_place`. Green labels = 96 px styled icon, red = 32 px pixel icon.

Counts from the sheet (styled 96 px / pixel 32 px): seed 0/47, crop 45/0, fruit 6/0, sapling 6/0, forage 43/0, mat 29/1, ore 13/0, bar 14/0, gem 13/0, loot 53/4, special 13/5, fert 1/2, ammo 2/0, animal 11/5, fish 45/11, artisan 109/2, food 24/16, weapon 97/0, armor 42/32, ring 28/0, place 0/52, artifact 10/2, path 2/0, implement 0/4, blueprint 8/0, tool 8/0, boat/fishtool/buildtool 4/0. **That's 181 of 810 item icons (22%) still pixel art at 32 px.** A "96" does not mean painted, though: most of the 96 px ones are template icons recoloured by `styledSwap`, and they still show blocky stair-stepped shapes (see "Template icons" below).

---

## 1. Item icons by category

### Seeds and saplings
| Item | Where | Problem | Severity | Shot |
|---|---|---|---|---|
| All 47 seed packets (`*_seed`, shape `seed`, 32 px) | bag, hotbar slots 8-9, Mara's Buy list, Encyclopedia | Pure pixel art: a hard-edged packet with a tiny crisp pixel crop on it. Next to the smooth painted tools on the hotbar they are the most obvious pixel art in the UI. | **high** | ui_30_seed, ui_hotz, ui_17z |
| Strain seed sacks (`<crop>_seed~<i>`, `seedBagIcon`) | bag | Crisp pixel sack with a pixel-stepped outline. | medium | ui_44_q |
| Saplings (`apple_sapling` ... `pomegranate_sapling`) | Encyclopedia | All six use the same generic green `leaf` icon (a pea pod shape); not a sapling, and the same for every tree. | medium | ui_33_misc |
| Field seeds (`meadowgrass_seed`, `flax_seed`) | Encyclopedia | Pixel packets, as above. | high (with the packets) | ui_30_seed |

### Crops, fruit, forage (template icons)
| Item | Problem | Severity | Shot |
|---|---|---|---|
| All 45 crops, 6 fruit, 43 forage | Styled templates: softened edges but still visibly blocky stair-stepped shading bands and pixel-sized leaf tops (turnip, potato, garlic: zoom in ui_45_z_crop). They read as "blurred pixel art", not painted. | medium | ui_31_crop, ui_32_forage, ui_45_z_crop |
| Crop shapes reused | Every `round` crop (potato, garlic, cabbage, tomato, melon, pumpkin, redcabbage, eggplant, glacier, emberfruit, cinder_melon) is the same blob recoloured; `long` crops (peapod, rhubarb, pepper, corn, wheat, amaranth, alpine_barley, dragon_pepper) the same streak. Wheat and corn look like carrots. The world has recognisable crops (`crops2.py`), the icons don't. | medium | ui_31_crop |
| Wild flowers `buttercup`, `foxglove`, `bluebell`, `daisy`, `marigold` plus `dandelion`, `sweet_pea`, `edelweiss`, `ice_bloom`, `cinderbloom`, `tulip`, `poppy`, `sunflower`, `starbloom`, `moonblossom`, `saffron`, `snow_lotus`, `frozen_rose` | All one `flower` template recoloured; foxglove and bluebell don't look like themselves (the world sprites do since `wildflowers.py`). | medium | ui_32_forage |
| `sea_urchin`, `snowcap`, `glowcap`, `moon_mushroom` | Sea urchin uses the mushroom shape (a purple mushroom). | medium | ui_32_forage |
| `coral`, `star_coral`, `moon_kelp`, `ember_coral`, `kelp`, `herb`, `mountain_thyme`, `frost_lichen`, `ember_moss` | All the same pea-pod `leaf` shape. Coral is not a leaf. | low | ui_32_forage |
| `clam`, `nautilus`, `pearl_oyster` | Egg shape. | low | ui_32_forage |
| `crystal_fruit`, `flamefruit`, `sea_glass` | Gem shape: flamefruit reads as an orange gem. | low | ui_32_forage |

### Materials, ores, bars, gems
| Item | Problem | Severity | Shot |
|---|---|---|---|
| `wood`, `hardwood`, `stonepine_log`, `mangrove_wood`, `frostwood_log`, `charwood_log`, `haft`, `mistwood_branch` (log bundle) | Very blocky: visible pixel staircase on every log end; the frostwood log is bright saturated blue blocks. | medium | ui_34_c_mats, ui_46_z_mats |
| `butter` (32 px, `wheel`) | Pixel art, and it's the cheese wheel shape: butter looks like a gold coin/cheese. | **high** (pixel + wrong) | ui_34_c_mats, ui_2z |
| `fiber`, `grip`, `bowstring` | All the same green/brown grass-tuft `fiber` icon; a cord grip and a bowstring look like weeds. | medium | ui_34_c_mats |
| `rivets`, `gear`, `cobalt_gear` | Ore-lump shape: a gear is a grey rock. | medium | ui_34_c_mats |
| `sugar`, `salt` | Goo shape: white splats. | low | ui_34_c_mats |
| `flour` | Bread loaf shape. | low | ui_34_c_mats |
| `padding`, `straps`, `leather` | Hide/cloth shapes; fine-ish, slightly blocky. | low | ui_34_c_mats |
| All ores (`copper_ore` ... `cinder_ore`) | Same lumpy template; stair-stepped specks. Acceptable but blocky. | low | ui_34_c_mats |
| All bars (`copper_bar` ... `cinder_bar`) | Smooth enough, but pixel-stepped bevels show at 2x (ui_46_z_mats). `obsidian_plate` and `star_ingot` same bar shape. | low | ui_34_c_mats |
| Gems | Mostly look good (diamond, prismatic brilliant, emerald step cut). `amethyst` crystal has a blocky silhouette; `pearl`, `moonpearl`, `frost_pearl` are cut gems, not pearls. | low | ui_34_c_mats |

### Monster parts and loot
| Item | Problem | Severity | Shot |
|---|---|---|---|
| `fang`, `imp_horn`, `mammoth_tusk` (shape `fang`, 32 px) | **Broken-looking**: a 1 px outline of a white shield/triangle, almost invisible on parchment; pixel art. A horn and a tusk use a fang outline. | **high** | ui_35_loot, ui_2z |
| `bone` (32 px) | Thin white pixel dog-bone outline; pixel art. | high | ui_35_loot, ui_2z |
| `dragon_tooth` (artifact, 32 px fang) | Same broken outline icon. | high | ui_34_c_mats |
| `hollow_crown`, `rime_crown` | `core` orb shape, not a crown (the `crown` icon exists and is used by `rat_crown` etc.). | medium | ui_35_loot |
| `captain_compass`, `drowned_crest` | Generic statuette (`artifact`) shape. | medium | ui_35_loot |
| `rat_tail` | Root (turnip) shape. | low | ui_35_loot |
| `anglers_cup` | Crown shape for a cup. | low | ui_35_loot |
| `slime_goo`, `ectoplasm`, `void_essence`, `jelly_gel`, `rime_essence`, `yeti_fur` | Goo/wool templates with very blocky outlines. | low | ui_35_loot |
| `dragon_scale`, `salamander_scale`, `bug_shell` | Four-blob "scale" icon is blocky. | low | ui_35_loot |

### Fish
| Item | Problem | Severity | Shot |
|---|---|---|---|
| `sunfish`, `bream`, `puffer` (`fish_round`, 32 px) | Pixel art: flat hard-edged blobs with a pixel fin row. | high | ui_36_fish |
| `pike`, `eel`, `frostpike`, `lavaeel`, `ice_pike`, `cinder_eel` (`fish_long`, 32 px) | Pixel art: flat rounded rectangles. | high | ui_36_fish |
| `halibut`, `obsidian_ray` (`fish_flat`, 32 px) | Pixel art. | high | ui_36_fish |
| Template fish (carp, perch ... 40 or so) | Soft but small, all one silhouette; blocky fins. | low | ui_36_fish |
| Big fish and shellfish (`tuna`, `swordfish`, `shark`, `manta`, `sturgeon`, `mud_crab`, `prawn`, `crayfish`, `rock_lobster`, `river_snail`) | Look painted and detailed: **good**, but now much bigger and more detailed than the other fish (style mismatch inside the category). `manta` icon is drawn so large it is cut at the cell edge; `prawn` is a pink ribbed worm. | low | ui_36_fish |

### Artisan goods and food
| Item | Problem | Severity | Shot |
|---|---|---|---|
| `cheese`, `goat_cheese` (`wheel`, 32 px) | Pixel art gold wheel with pixel cross; identical to butter. | high | ui_37_artisan |
| Pickles and jams (60 or so jars) | Same jar for every flavour; pickles all one pale green body, only the lid changes colour. Hard pixel steps on the glass highlight. | low | ui_37_artisan |
| Wines, ale, mead, oils | Small bottle template, blocky. | low | ui_37_artisan |
| Smoked fish (all) | A dark lump with a flat base: unreadable, looks like a rock. | low | ui_37_artisan |
| Food in `bowl` (16, 32 px): `veggie_stew`, `fish_stew`, `corn_chowder`, `frost_soup`, `truffle_risotto`, `ember_curry`, `dragon_stew`, `highland_stew`, `pearl_chowder`, `lotus_broth`, `meat_stew` ... | Pixel art: hard-edged bowls with pixel steam curls. | **high** | ui_38_food, ui_2z |
| Food in `roast` (32 px): `roast_feast`, `roast_poultry`, `steak`, `roast_pork`, `sausage`, raw meats `poultry`, `red_meat`, `pork`, `rabbit_meat` | Pixel art drumsticks with a 1 px bone outline. | high | ui_38_food, ui_41_c_anim |
| `bread`, `trail_bread`, `pancakes`, `cheese_toast`, `honey_cake`, `lichen_bread` | Styled but blocky loaf; trail bread is the starting hotbar item, so it's seen constantly. | medium | ui_38_food, ui_hotz |
| `layer_cake` | Pie shape, flat pink smear; doesn't read as a cake (the `ic_cake` hand icon exists). | low | ui_38_food |
| `truffle` (32 px) | Pixel art brown ball. | medium | ui_41_c_anim |

### Animal products
| Item | Problem | Severity | Shot |
|---|---|---|---|
| `egg`, `duck_egg`, `golden_egg`, `wool`, `rabbit_wool`, `golden_fleece`, `milk`, `goat_milk` | Fine, soft. Golden egg is a blocky orange blob. | low | ui_41_c_anim |
| `honey` | Same jar as the jams. | low | ui_41_c_anim |

### Special and story items
| Item | Problem | Severity | Shot |
|---|---|---|---|
| `treasure_map`, `ashcombe_letter`, `smuggler_ledger`, `morcant_orders`, `regent_letter`, `star_chart` (`map`, 32 px) | Pixel art parchment map; letters and a ledger use the treasure map with a red X. | high | ui_33_misc, ui_34_c_mats |
| `squire_locket`, `briar_key`, `greyhelm_horn`, `drake_egg`, `dragon_whistle`, `warp_totem` (`artifact` shape) | All one generic statuette, recoloured. A key, horn, egg and whistle should be themselves (story items players look at). | medium | ui_33_misc |
| `golden_oats` | Blocky pixel stalks. | low | ui_33_misc |
| `staircase` | A grey stone lump. | low | ui_33_misc |
| `ember_shard` | Good. | - | ui_33_misc |

### Placeables and implements
| Item | Problem | Severity | Shot |
|---|---|---|---|
| All 52 placeables (`fence` ... `merger`, `iconDraw('obj')` from `objSprite`, 32 px canvas) | The object sprite is squashed into a 32 px icon and stretched back to 64: pixel art ones (fence, conveyor, chute, sorter, fastbelt, runebelt, channel, storage, ledger, merger) stay crisp pixel art; painted ones (anvil, kiln, smoker, windmill) become blurry and pixelated at once. | **high** | ui_42_place, ui_47_z_place |
| `sprinkler` | **Broken**: a thin dark sliver on the left of the cell (the painted sprinkler is cut or offset). | high | ui_42_place, ui_2z |
| `windmill` | Top cut off at the cell edge. | medium | ui_42_place, ui_2z |
| `fence_gate` | Just two posts and a lintel (an empty frame). | low | ui_42_place |
| `forge` (the stone forge item) | Hard-edged grey pixel box. | medium | ui_42_place |
| `cart`, `plough`, `seeddrill`, `harrow` (implements, 32 px) | Pixel art. | medium | ui_33_misc |
| `compost`, `rich_compost` (`fert`, 32 px) | Pixel art sack. | medium | ui_33_misc |
| Blueprints `bp_cottage` ... `bp_silo` | All one scroll, nothing tells them apart. | low | ui_33_misc |

---

## 2. Gear

| Item | Problem | Severity | Shot |
|---|---|---|---|
| All 16 helmets (`*_helm`, `helm`, 32 px) | **Pixel art**: hard square pixels, crisp outline. Very visible in the bag next to painted swords. | **high** | ui_40_armor, ui_2z, ui_3z |
| All 16 body plates (`*_body`, `plate`, 32 px) | Pixel art. `leather_body` is a brown square with a diagonal line: doesn't read as armour. `cobalt_body` has a strange striped yoke. | **high** | ui_40_armor, ui_2z |
| Boots (16) | Styled (96) but blocky L shapes. | medium | ui_40_armor |
| Shields (16) | Mostly painted and **good** (iron, steel, dragon, tide, frost). `cinder_shield` and `adamant_shield` are flat rectangles; `star_shield` and `copper_shield` are glowing orbs. | low | ui_40_armor |
| Robes and hats | Painted, fine. `starweave_robe` is washed out, almost transparent. | low | ui_40_armor |
| Daggers: `copper_dagger`, `iron_dagger`, `silver_dagger`, `gold_dagger`, `mythril_dagger`, `frost_dagger`, `adamant_dagger`, `dragon_dagger`, `cobalt_dagger`, `tide_dagger`, `cinder_dagger` | **Wrong object**: painted as fat cylinders / cannons / vials with a red smear, drawn larger than the swords. Only `steel_dagger`, `obsidian_dagger`, `star_dagger`, `rime_dagger` read as daggers. | **high** | ui_39_weapon, ui_3z |
| `wood_sword` (also the empty-weapon `tool_weapon` icon and hotbar slot 7) | Reads as a wooden plank/stake. | medium | ui_39_weapon, ui_hotz |
| Bows | Thin, faint; several (`wood_bow`, `copper_bow`, `iron_bow`, `hunt_bow`, `ashford_greatbow`) are a hairline arc that disappears in a recipe row (Copper Bow in ui_3z). | medium | ui_39_weapon, ui_3z |
| Swords, spears, hammers, staffs | Painted and detailed: **good**. Small inconsistencies: `cobalt_sword` is a blue block, `adamant_sword` a pink tube, `gold_sword` a gold tube. | low | ui_39_weapon |
| Rings (28) | One template, painted and clean: **good** but identical except gem colour. | low | ui_41_c_anim |

## 3. Tools (every kind, levels 0-6)

| Item | Problem | Severity | Shot |
|---|---|---|---|
| **Ember Multitool** (`tool:multi:*`, every level) | Still the old blocky pixel template (grey/orange pick-and-axe), at the top tier of the game. | **high** | ui_43_tools |
| Level 6 hoe, can, axe, pick, rod, scythe (`tool:<k>:6`) | Old blocky template in bright orange-red; level 6 is the Ember tier. | high (if reachable) | ui_43_tools |
| Level 0 of every tool | Old blocky grey template (probably unused in normal play; check that the starter tools are level 1). | low | ui_43_tools |
| Pickaxe levels 1 and 2 | Painted as a claw hammer, not a pickaxe. | medium | ui_43_tools |
| Axe level 1 | A double-bit battle axe, unlike the other axe tiers. | low | ui_43_tools |
| Levels 1-5 of hoe, can, axe, rod, scythe | Painted, consistent, **good**. | - | ui_43_tools, ui_hotz |

## 4. UI frames, HUD, windows

| Element | Problem | Severity | Shot |
|---|---|---|---|
| Dock icon **Guides** (`ui_guides`) | Crisp pixel art book; every other dock icon is painted. | medium | ui_dockz |
| Dock icons (others) | Painted, readable: **good**. Slightly blurry at their 32 px size. | - | ui_dockz |
| Satchel tab icons (Items chest, Recipes, etc.) | Tiny (about 14 px); look like pixel art at that size. | low | ui_hudz |
| HUD frame, bars, window frames | Hard 3 px pixel borders and flat colour bars (`pc.css`, by design). In Painterly they are a pixel-art frame around painted art. If Painterly should feel fully painted, these need a softer frame variant (`body.styled`). | medium | ui_hudz, ui_20z |
| Lives hearts (`#lives`) | Pixel hearts. | low | ui_hudz |
| Buffs (`#buffs`) | Unicode glyphs (sword, shield, arrow) in boxes, no icons; look like placeholders. | medium | ui_20z |
| Weather icon on the clock | Unicode umbrella glyph. | low | ui_15 |
| Recipe rows (anvil and every station) | Item icon about 32 px and faded; ingredient icons about 12 px, unreadable (the copper bar is an orange dash, cord grip a speck). | medium | ui_3z |
| Station Make chips (smelter: Copper Bar, Iron Bar...) | Tiny dash icons, unreadable. | low | ui_8 |
| Station window | No picture of the machine; the slots are plain empty boxes. Not broken, but bare next to the painted world. | low | ui_8 |
| Encyclopedia card | The item icon on the card is small (about 30 px); the painted art can't be seen. | low | ui_10 |
| Shop keeper portrait (Mara in the Buy tab) | Crisp pixel character sprite, blocky. | medium | ui_17z |
| Story dialogue portrait | Full-body crisp pixel sprite (Mara). | medium | ui_21 |
| Character creator preview | Blocky pixel character blown up (soft but clearly pixel art) on a flat sky-blue and green backdrop. | **high** (first thing a new player sees) | ui_13, ui_13z |
| Morning report | A full-height window mostly empty under two lines; text glyph bullets (★, ♣). | low | ui_14 |
| Tooltip (hotbar) | Fine. The "Backpack full" tag overlaps the LMB hint label beside the tooltip. | low | ui_15 |
| Room title banner ("Mara's General Store") | Thin hollow serif text over the room art, hard to read. | low | ui_16 |
| Collections (Museum) | Silhouettes are plain flat blobs; fine for "not found". | - | ui_19 |
| Skills tab | Orange level discs, clean. **good** | - | ui_18 |

## 5. Minigames

| Element | Problem | Severity | Shot |
|---|---|---|---|
| Forging (`forgeScene`, `forgePiece`, `forgeHammer` in `x_forge.js`) | Hand-drawn in flat code shapes: a grey rectangle anvil, triangle flames, rectangle hearth, brick wall in flat blocks, a stick-figure hammer and tongs. The red-hot workpiece is the item icon blown up and blurred into an orange smear. Doesn't match either style. | **high** | ui_4, ui_5, ui_5z |
| Forging hit marker | Clean ring and cross, readable. **ok** | - | ui_5z |
| Cooking (`cookGame` in `x_cook.js`) | Placeholder art: a dark box with a heat bar, a grey rectangle pan with an orange rectangle, five orange squares as flames. No food, no fire. | **high** | ui_7 |

## 6. Map

| Element | Problem | Severity | Shot |
|---|---|---|---|
| Farm / local map (`localMapCanvas`) | A flat diagram: green field, brown boxes for buildings, dotted circles for trees and fences, and a pixel-stepped pond. Pixel art in feel. | medium | ui_11 |
| Wilds map (M) | The explored area is drawn as blocky pixel squares in a few flat browns (around the player); roads are 1 px lines on parchment. Town boxes with tiny overlapping labels ("Inn", "ShoGuild" for "Shop" and "Guild" running together, "Hall" over the town name). | medium | ui_12 |
| Map markers | Goblin camp triangles, waystone diamond: flat but fine. | low | ui_12 |

## 7. Other

- Quality stars on icons (silver / gold / ember) are vector and clean. **good** (ui_44_q)
- Strain produce (`turnip~0`) is the crop template recoloured; fine.
- Bank window: same icon problems as the bag; nothing extra (ui_9).

---

## What looks GOOD in Painterly (the target)

- Tools levels 1-5 (hoe, watering can, axe, pickaxe 3-5, rod, scythe): painted metal and wood, consistent per tier (ui_43_tools, ui_hotz).
- Swords, spears, hammers and staffs of every tier: detailed painted blades and hafts (ui_39_weapon).
- Most shields, the robes and wizard hats (ui_40_armor).
- Big fish and shellfish (tuna, swordfish, shark, sturgeon, crayfish, lobster, snail) (ui_36_fish).
- Gems such as the diamond, prismatic, emerald step cut and ruby (ui_34_c_mats).
- Rings, the ember shard, the trophy crowns (`rat_crown`, `mist_crown`), the relic and ancient coins.
- The dock icons (except Guides) (ui_dockz).
- Quality stars.

The target look is the painted weapons and tools: soft-shaded, slightly textured, no visible pixel grid, with a dark soft outline.

---

## Top 10 to fix first

1. **Seed packets** (47 items + strain seed sacks): pixel art, always on the hotbar and in Mara's shop. Paint a packet and put the painted crop on it. (ui_30_seed, ui_hotz)
2. **Helmets and body armour** (32 items): pixel art beside painted weapons in every bag and anvil list. (ui_40_armor, ui_2z)
3. **Daggers** (11 of 15): painted as cylinders/cannons, not daggers. (ui_39_weapon, ui_3z)
4. **Placeable icons** (52): squashed into a 32 px canvas, so pixel ones stay pixel art and painted ones turn to mush; the sprinkler is broken and the windmill cut off. Build the icon from the styled frame at full size. (ui_42_place, ui_47_z_place)
5. **Forging minigame scene**: flat code shapes and a blurred workpiece. (ui_5z)
6. **Cooking minigame**: placeholder rectangles. (ui_7)
7. **Food bowls and roasts, plus raw meat** (25 items, 32 px): pixel art on everything you eat. (ui_38_food)
8. **Broken loot icons**: `fang`, `imp_horn`, `mammoth_tusk`, `dragon_tooth`, `bone`: near-invisible 1 px outlines. (ui_35_loot, ui_2z)
9. **Ember Multitool and the level-6 tools**: the top tier still uses the old blocky template; pickaxe 1-2 look like hammers. (ui_43_tools)
10. **Character creator preview, shop portraits and dialogue portraits**: blocky pixel people, the first thing a new player sees. (ui_13z, ui_17z, ui_21)

Next after those: the remaining 32 px icons (cheese/butter wheel, the three 32 px fish shapes, parchment maps and letters, compost, truffle, implements), shared templates that make different items look the same (seed-less saplings, all flowers, all `round` crops, gears as rocks, grip/bowstring as grass, story items as one statuette), the Guides dock icon, the unicode buff icons, and the Wilds map's blocky explored area and overlapping labels.
