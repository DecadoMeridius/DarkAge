# W3 art detail (small parts, Painterly) — tester on port 9303

Setup: Test sandbox (developer mode), art style already Painterly, FPS counter on. Contact sheets are drawn into a canvas overlay from the console (noted per shot); world checks use console spawns where noted.

## 1. Item icons (all 761 `IT` keys)

Console: `iconURL(k)` for every key, drawn in rows by `IT[k].t` (red bar + label = start of a category). Shots: `W3_artdetail_icons0..3.png` (all items), `W3_artdetail_3.png` (50 keys enlarged 2.25x, nearest-neighbour, canvas size in brackets).

Measured: 610 icons are styled paintings (96x96 canvas), **151 are still the 32x32 pixel icon** (no painting in the painterly atlas):
- all 47 seed packets (`turnip_seed` ... `flax_seed`, `alpine_barley_seed` ...),
- every helmet and cuirass: `leather_helm/body`, `copper_`, `iron_`, `steel_`, `silver_`, `gold_`, `mythril_`, `frost_`, `obsidian_`, `adamant_`, `dragon_`, `star_`, `cobalt_`, `tide_`, `rime_`, `cinder_` (helm + body = 32 icons),
- almost every placeable machine: `fence sprinkler qsprinkler isprinkler campfire forge beehive scarecrow lantern keg jar cheese_press loom oilpress smoker anvil tanrack conveyor sorter splitter oven triphammer treadwheel channel storage smelter kiln mill compostbin windmill waterwheel chute stonefurnace churn seedhopper fastbelt crane blastfurnace reaper filtercrane tidemill powerhammer ledger runebelt emberforge embercore golem workbench fence_gate ballista barricade`,
- implements `cart plough seeddrill harrow`,
- loot/other: `fang bone imp_horn mammoth_tusk truffle cheese goat_cheese compost rich_compost treasure_map dragon_tooth star_chart butter ashcombe_letter smuggler_ledger morcant_orders regent_letter`.
These read as hard pixel art next to the painted ones (shot 3: `leather_helm`, `iron_body`, `cheese`, `compost`, `keg`, `fang`, `truffle`).

No icon is blank or a letter fallback; nothing errored.

Specific problems (shot 3 unless noted):
- **Helmets don't read as helmets.** `gold_helm` looks like a mustard bottle, `star_helm` is a yellow box with a "T", `cinder_helm` an orange jar, `leather_helm` a brown box (icons0, row 6-8). Same template for every tier, only the colour changes.
- **Dishes are cut in half.** Every bowl/plate dish (`omelette`, `sushi`, `roast_poultry`, `steak`, `meat_stew`, `veggie_stew`, `corn_chowder`, `frost_soup` ...) has a hard vertical seam about 60% across where the right part is a darker, offset copy — it looks like a sliced sprite. Nearly all 60 foods are the same plate in a different tint (icons0 last row, icons1 row 1), so foods are unreadable in the bag.
- **Raw meat uses the cooked plate.** `poultry`, `red_meat`, `pork`, `rabbit_meat` (animal products) look like the cooked dishes `roast_poultry`, `steak`, `roast_pork`.
- **Meat dishes have a broken type:** `roast_poultry`, `steak`, `roast_pork`, `meat_stew`, `sausage` have `t` = 160 / 220 / 200 / 420 / 300 (the price ended up in the type field: `I('roast_poultry', 'Roast Poultry', 160, 'food', ...)` in `x_world.js:21` passes one argument too many/too few compared to `I`'s signature). They sort as their own category at the end of icons3, and anything that filters by `t === 'food'` (bag category chips, encyclopedia, Harvest Fair, eat logic?) may miss them. Worth checking.
- `bread` and `trail_bread` are the same icon; `corn` and `wheat` are the same orange streak; `egg` and `wool` are both a white blob; `smoked_carp` (and every `smoked_*`) is a flat brown/coloured pile that reads as dirt.
- **Small fish are tiny and identical.** All ordinary fish (`carp`, `bream`, `perch`, `eel`, `trout` ... about 40) are one ~20 px silhouette recoloured, while `tuna`, `swordfish`, `shark`, `manta`, `sturgeon` are big detailed paintings — very inconsistent scale in the same row (icons1 rows 8-10). `eel` is not long.
- Rings: all 28 rings are one gold band with a different gem colour (icons0 row 9-10), fine for a set but `ring_lucky`/`ring_tyrant`/guild rings are indistinguishable.
- Saplings: all 6 (`apple_sapling` ... `pomegranate_sapling`) are the same green leaf (icons1 row 7).
- Artisan: all pickles are one jar, wines one bottle, jams one jar (colour only). Acceptable but plain.
- Blueprints: all 8 `bp_*` are one identical scroll (icons3 row 5) — no hint which building.
- Story letters (`ashcombe_letter`, `smuggler_ledger`, `morcant_orders`, `regent_letter`) reuse the treasure-map icon with a red X.
- Good: weapons, staffs, ores, gems, bars, the loot trophies and the big fish are clearly painted and readable.

## 2. Crops and fruit trees

Console: soil + crops placed directly (`m.soil[i] = {wet, crop:{k, age}}`) in the sandbox yard, 12 crops x 4 stages (shot 6); `cropSpr(k, 3)` gallery of every ripe crop (shot 11); fruit trees placed with `setO(..., {k:'ftree'})` (shot 8) and a `treeImg(kind, season, fruit)` gallery (shots 9, 10).

- **Fruit trees never show fruit in Painterly.** `tree_<kind>_<s>_f` frames exist in the painterly atlas but are pixel-identical in look to `tree_<kind>_<s>_0` for apple, orange and plum in all four seasons (shot 10, left/right pairs), and cherry/peach/pomegranate in spring (shot 9). A tree with 3 fruit (shot 8) is indistinguishable from an empty one, so the player can't see when to harvest. The fruit "word edit" seems to have changed nothing.
- **Fruit kinds are not distinguishable:** apple, cherry, peach, orange, plum, pomegranate are generic round broadleaf trees; apple's spring blossom is the only hint (shot 9).
- **Saplings** (`SPR.sapling[0..2]`, shot 9 bottom-left, shot 8 top) are three sizes of the same tiny stacked-leaf stick that reads as a little conifer, with a hard pixel look. A sapling of 0 days is nearly invisible.
- **Every crop looks the same until it's ripe.** Stages 0 and 1 are one shared sprout for all crops, stage 2 is one leafy bush (or bamboo-like canes for `long` crops) (shot 6 rows 1-3, shot 11 first 4 cells).
- **Root crops shrink when they ripen.** Stage 2 is a big bush filling the tile (`crop_leafy_2`, 66x60 painting, drawn full tile), ripe `turnip`, `radish`, `carrot`, `beet`, `yam`, `frostleek`, `ice_turnip` are a small blob on the soil (shot 6 bottom row: turnip at far left, carrot 9th). It reads like the crop died or was harvested.
- **Ripe crops share 7 templates, so many are indistinguishable:** `corn` = `wheat` = `alpine_barley` (orange canes); `rhubarb` = `pepper` = `amaranth` (red canes); `kale` = `artichoke` = `bokchoy` (green ball); `strawberry`, `blueberry`, `cranberry`, `grape`, `hops`, `sunberry`, `mountain_berry`, `sea_grape` are a diagonal chain of beads on a stalk (strawberry reads as a chilli string); `potato` and `garlic` are both pale puffs (shot 11).
- Wheat in particular should be a golden grain head, not orange cobs.
- Good: `pumpkin`, `melon`, `glacier`, `sunflower`, `tulip`, `poppy`, and the dead crop read well; tilled soil and wet soil look good.

## 3. Animals and the pet

Console gallery of `animalSpr(species, coat, frame)` for all 4 walk frames (shot 12), every coat at frame 1 (shot 13), and close-ups (shot 14); pets are `PIX.get('pet_<dog|cat>_<0-2>')`. Species: chicken, duck, rabbit, goat, sheep, cow, pig, horse (no other farm animals exist).

- **Size is steady**: every species keeps one canvas size over its 4 frames (chicken 108x108, cow 186x144, horse 210x180 ...), no flicker between frames, and no grey card patches anywhere.
- **But the animals still read as pixel art**, not painted: hard stair-stepped outlines and flat cel blocks at the size they're drawn (shot 13, e.g. `pig black`, every horse). Next to the painted trees and buildings they're the most "pixel" thing in the farm after the player.
- The walk cycle hardly moves: frames 0-3 differ by a leg pixel or two, so walking animals look like they glide (shot 12 rows).
- **Rabbit tail floats off the body**: the cotton tail is a separate blob a few pixels left of the rump with a beige/yellow smear, and `rabbit brown` has a dark brown bar floating under it (shot 14 top-left two). Visible on all rabbit coats in shot 13.
- **Rabbit ears clipped**: `rabbit brown` frame 2 has the ear tips cut flat by the top of the canvas (shot 14, second cell).
- **Chicken legs** are broken white/dark dashes that don't meet the body (shot 14, `chicken white 0`).
- **Coats that don't look like their name** (shot 13): `pig spotted` has no spots (same as `pig pink`); `horse dapple` is plain grey with no dapples (shot 14); `cow belted` is black with one white blotch, no belt; `sheep silver` is light blue; `chicken speckled` is just a white/brown two-tone.
- **Pets** (`pet_dog_*`, `pet_cat_*`, shot 14 bottom-left and top-right) are a blurry smoothed low-res sprite (`STYLE_SMOOTH`): soft mush with no detail, and much smaller in detail than the farm animals. The dog's red collar is a floating line across the neck; the cat's spots are three dots in a row like buttons. They look out of place in both styles.
- Good: duck coats (royal, mallard), horse chestnut/palomino/ember, the goat and the cows' shapes read well.

## 4. Enemies (Hollow Vale and a few others), day and night

Console: `enemySpr(k, f)` gallery of every non-boss enemy at frame 0 (shot 15), close-ups at frame 1 and attack (shot 16), frames 0-3 + wind-up of the big ones (shot 17). In the world: teleported to the Wilds crossroads (`goMap('wilds', ...)`), spawned rows with `spawnEnemy(cur, k, ...)`, paused the game (`setPause(true)`, pause overlay hidden) and set `S.time` to noon / 22:30-23:00. Shots 19 (day) / 20 (night) for slime ... magma, shots 21 (day) / 22 (night) for ogre, shade, bats, skeleton, void knight, frost wraith, stone troll, obsidian golem, ice elemental, rats, roach, flame slime, zombie.

- **BROKEN: frame 0 (the standing/idle frame) is a garbled painting for `stonetroll`, `ogre` and `obsidiangolem`** (shot 17, first cell of each row; shot 15). Frames 1-3 and the attack frames are fine, frame 0 is a half-cut smear: a pale translucent rectangle with a fragment of the creature (ogre: a big pale-green slab with a small ogre in the corner; troll: grey blotch with one arm; golem: a purple slab). Frame 0 is what `enemyFrame` shows whenever the enemy stands still, so idle ogres in goblin camps and trolls in the Highmarch show the broken art. `goblin` frame 0 is also sheared/stretched compared to frames 1-3 (shot 17 row 2 last cell). Checking every enemy's frame 0 against frame 1 visually is worth doing; I only spotted these four.
- **Frost Wraith (`frostwraith`, `en_wisp`) is literally a map pin**: a blue teardrop with a black hole, point down, with small sparkles (shots 15, 16, 21). Confirmed; needs a new design (a wisp/cloak/flame shape with a face, no hard teardrop).
- **Zombie looks like a villager** (shots 15, 16, 19, 21): a normal human template in brown clothes with a green face and spiky hair, upright and still. At night (shot 22) it's a dark villager. Needs a shamble pose, torn clothes, arms forward, or a hunched silhouette. The `pirate` (shot 19 lower-left) also reads as a townsperson in a hat.
- **Green-on-green:** `slime` (green, translucent) all but disappears in long grass by day and is invisible at night (shot 19 top-left vs 20). `goblin` and `goblin_slinger` (also green, and small: 114x108) blend in the grass (shots 19/20 top-right). `goblin` and `goblin_slinger` are the same sprite; the slinger has a spear, not a sling.
- **Dark-at-night:** `crow`, `voidbat`, `bat`, `boar`, `obsidiangolem`, `roach`, `rat` become dark blobs on dark ground at night (shots 20, 22). `crow` is already near-black by day.
- **Fire and ice creatures don't glow at night**: `flameslime`, `magma`, `firebat`, `imp` and `iceelemental`, `frostwraith`, `wraith` are graded down with everything else (shot 22). A flame creature that's as dull as a rock reads wrong; an additive glow or exemption from the night multiply (like `nightLights` flames) would also fix their readability.
- **Odd shadows:** every flying enemy (bats, crow, hawk, frost wraith) and several walkers have a long, soft, vertical grey streak running from the sprite down the screen at noon (shot 21, under each bat and the wraith). At noon the sun shadow should be shortest; these read as drips.
- Ogre and stone troll look washed-out/pale grey-green in daylight (shot 21) next to the saturated painted world; the troll is grey on a grey stone backing.
- `icetroll` is drawn as a mammoth (`art: mammoth`, shot 17) — the name and the sprite disagree.
- Characters and human enemies (bandit, archer, bandit chief, skeleton, void knight, pirate, zombie, drowned) are pixel templates with a soft filter; next to painted creatures they look like a different game (shot 19).
- Good: `wolf`, `icewolf`, `boar`, `yeti`, `wraith`, `shade`, `imp`, `crab`, rats, `griffin`, `hellhound`, `cinderimp`, `harpy`, `tideslime` are readable and animate without flicker; enemy frame sizes are constant.

## 5. People: creator, gear tiers, riding

Shots: creator (23, opened with `openCreator()` from the console), every hair style for both sexes front + side (25, `humanSpr` with edited `S.look`), all 16 armour tiers (helm + body + boots) front and side (24, `playerPal()` with `S.eq` swapped), riding in steel (27; horse added from the console with `newAnimal('horse', ...)`).

- **Characters are pixel templates with a soft blur**, as designed, but in a painted world they're the biggest mismatch on screen (shots 19, 21, 27). The creator preview (shot 23) is the same tiny sprite blown up with smoothing: soft, blurry pixel blocks, not crisp pixel art and not painted. It is also the first thing a new player sees.
- **"A woman" and "A man" give the same body** (shot 25, rows 1 vs 2: identical shoulders, waist, legs). Only hair and colours differ, so with short hair the two choices look identical.
- Front views of `short` and `pony` are identical (the ponytail only shows from the side/back); `spiky` reads as a crown. Six hair styles, no facial hair, no face options beyond eye colour.
- The creator window is half empty (bottom 40% blank) and the preview background is a flat sky + green strip.
- **Armour tiers are mostly flat recolours** of 2-3 shapes (shot 24): `adamant` is hot pink, `star` pale cream with a "T" visor, `gold` a mustard block, `cinder` a solid orange block. Helmets are boxy buckets that read as cans/bottles (same as the icons in section 1). `cobalt` has a straw-coloured fringe/collar that looks like a hay skirt. Side views of plate tiers have a flat brick head.
- **Riding** (shot 27): the horse is drawn noticeably smaller than the rider's scale (horse back at the rider's waist, rider perched high), and the rider + horse are both pixel templates. Readable, but the pair looks like a toy on the painted ground. No issue with the seat or tack.
- (Not a game bug: a horse created from the console without genes threw `Cannot read properties of null (reading 'spd')` every frame; my fault, fixed by giving it genes. Worth noting that `newAnimal(sp, null, ...)` isn't guarded.)
- Side note in shot 27: the crossroads signpost's floating destination labels ("Kingsbridge ↑ Greyhelm ... Emberhollow") are drawn right through the Focus bar and ability buttons when you stand near it.

## 6. Effects, particles and weather

Shots: 28 (first attempts, no hits), 29 (6 frames: two sword hits on wolves, a third, then Z Cleave, X Lunge, C Guard; enemies spawned with `spawnNear('wolf', 3, ...)` and `spawnNear('slime', 2, ...)`), 30 (rain day, winter snow, summer night, autumn day; set from the console with `S.weather` / `S.season` / `S.time`).

- **Hit feedback is a full white silhouette flash** of the enemy (shot 29 frame 1: the wolves become flat white cut-outs). In a painted world this reads as a missing texture rather than an impact. Hit sparks themselves are tiny and get lost under the damage boxes.
- **Damage numbers cover the action**: red/gold boxed numbers stack on top of the player and target (shot 29 frames 1-2: "-2", "16", "42", "55" boxes over the player's head and the wolves), and loot pickup text ("+2 Hide / +1 Fang / +1 Slime Goo") piles up in the same spot and overlaps the "Guard" ability label (frame 6).
- **Skill effects are faint**: Cleave is a thin pale ellipse on the ground, Guard a faint blue ring with a few dots (shot 29 frames 4 and 6). They're hard to see on grass and don't feel painted (thin 1-art-px lines).
- The wind-up wedge (red translucent fan) and the "!" read well (shot 29 frame 3).
- **Rain**: with `S.weather = 'rain'` the scene shows no rain streaks or splashes at all, just the normal day (shot 30 top-left). Either rain is drawn somewhere I didn't trigger (e.g. only set up at day start) or rain particles are missing in Painterly. Worth checking with a real rainy day.
- **Snow**: winter swap is good (snowy ground, frozen pond, bare trees with snow), but falling snow motes are barely visible (shot 30 top-right). The first winter frame cost 41.9 ms of work (74 fps) while ground chunks repainted.
- Autumn (shot 30 bottom-right): ground goes a flat mustard yellow everywhere, tall grass the same, so trees pop but the ground looks like a filter was laid over it.
- Night (shot 30 bottom-left): fine, readable, no light holes; see section 4 for enemies at night.
- Side effect noted: changing the season from the console announced four new stories at once in toasts (stories start by date) — not a bug in normal play.

## Broken (summary)
1. Painted enemy **frame 0 is garbled** for `stonetroll`, `ogre`, `obsidiangolem` (and `goblin` is sheared) — the idle frame (shot 17).
2. **Fruit trees never show fruit** in Painterly: `tree_<kind>_<s>_f` looks the same as `_0` (shots 9, 10).
3. **Meat dishes have type and price swapped**: `x_world.js:21-25` calls `I('roast_poultry', 'Roast Poultry', 160, 'food', 'food', ...)` but `I(id, n, t, p, sh, c, c2, ex)` takes the type before the price, so `IT.roast_poultry.t = 160` and `.p = 'food'` (same for `steak`, `roast_pork`, `meat_stew`, `sausage`). Their sell price is a string and they aren't in the food category (icons3, last row: categories "160", "220", ...).
4. Raw meat (`poultry`, `red_meat`, `pork`, `rabbit_meat`) uses the cooked-dish plate icon.
5. Rain shows no rain particles when set from the console (unconfirmed for a natural rainy day).
6. `newAnimal(sp, null, ...)` with no genes makes riding throw `reading 'spd'` every frame (only reachable from the console, but unguarded).

## Quality of life
- Many items are indistinguishable in the bag: foods (one plate), saplings, blueprints, story letters, rings, small fish (section 1).
- Crops look identical until ripe, and root crops shrink at ripeness, which reads as a problem (section 2).
- Destination labels at the crossroads signpost draw over the Focus bar and ability buttons (shot 27).

## Balance
- Nothing balance-related checked here. (Gold went from 1,000,000 to 1,055,500 in the sandbox at some point during my console tile edits/clicks; I couldn't pin down from what, probably a click on the sandbox crate/stall while closing the intro dialog.)

## Art & feel
See sections 1-6. Overall: the world (trees, ground, buildings, weapons, ores, gems) is convincingly painted; the small parts are not yet: 151 item icons, all characters, all farm animals, pets and crop stages still read as pixel art, and several placeholders (helmets, dishes, fish, frost wraith, zombie) need real designs.

## Performance
- 160-166 fps in the farm and the Wilds, work 1-2 ms. Dips: 60 fps / 11.8 ms once when walking into the fruit-tree area (shot 7, first sight of new painted trees and their cast shadows), 74 fps / 41.9 ms on the first winter frame (shot 30), 111-116 fps on the first night/autumn frames. All recovered within a second.

## Liked
- Weapons, staffs, ores, bars, gems, trophies and the big fish icons are lovely and readable.
- Painted trees in all seasons, the frozen pond, the autumn canopy.
- Wolves, ice wolves, yeti, griffin, hellhound, imp, shade animate cleanly with constant frame sizes; the red wind-up wedge with "!" is clear.
- Duck, goat and horse coats read well.

## Top 5 fixes
1. **Fix the garbled frame 0** of `en_troll`/`ogre`/`basalt` (stonetroll, ogre, obsidiangolem) and goblin in the painterly atlas — idle enemies show broken art (shot 17). Then eyeball frame 0 of every creature.
2. **Show fruit on painted fruit trees** (`tree_<kind>_<s>_f`) and make the six fruit trees distinguishable (shots 9, 10); also give saplings a painted look.
3. **Fix the meat dishes' `I()` arguments** in `x_world.js:21-25` (type/price swapped) and give raw meat its own icon.
4. **Redesign the worst placeholders**: Frost Wraith (map pin), zombie (villager), helmets (bottles/boxes), dish icons (sliced plate, all the same), small fish (one tiny silhouette); make slimes/goblins readable on grass and let fire/ice creatures glow at night.
5. **Paint the remaining 151 pixel icons** (seeds, helmets, cuirasses, placeables, implements) and give crops distinct stage-2/ripe sprites (no shrinking root crops; wheat ≠ corn; berries ≠ chains).
