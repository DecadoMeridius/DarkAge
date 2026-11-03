# R2 art: outdoors in Painterly (tester R2_art_world, port 9304)

Setup: Test sandbox (developer mode was already on), art style was already Painterly, FPS counter on.
Console shortcuts used (named here as required): `S.season`, `S.day`, `S.time`, `S.weather`, `goMap(id, x, y)`, `S.p.x/y` teleports.

## Game-breaking

## Economy
(not in scope for this role)

## Art

### Farm (sandbox yard, spring, noon)
- **Tilled soil reads as flat tile squares.** The field (all 45 crops planted at rows 21-23 via `cur.soil`) is one flat brown slab with hard straight edges on the grass, and every wet tile is a darker exact 64 px square, so a mixed wet/dry field is a checkerboard of squares. No furrow texture visible at this zoom, no soft edge like the painted dirt paths. Shot R2_art_world_4.png (also _3).
- **Farm animals look like pixel art.** Goats, sheep, pigs, ducks, chickens, rabbits in the paddock are crisp blocky sprites (hard stair-step edges) beside the painted grass and the painted barn; next to the painted horse/cow they stand out. Coats do vary (speckled/black chicken, white/grey duck, black-and-white cow, brown and pink pig). Shot R2_art_world_6.png (crop), _5.png.
- **Animal shadows are long dark streaks at 12:50.** Every animal has a soft dark blob trailing 40-60 screen px straight down below it at midday, which reads as a smear/reflection, not a noon shadow (noon should be short). Shot R2_art_world_5.png (pig, horse, cow).
- **Dirt patch edges are stair-stepped.** The large dirt area bottom-right of the paddock (farm ~x 46-55, y 17-19) has a jagged pixel-step outline at the grass border. Shot R2_art_world_5.png bottom right.
- Crops: the per-crop drawings read well and are distinct (flowers, corn, wheat, berries, regional crops); growth stages are tiny sprouts until late. They sit fine on the soil. Shot R2_art_world_4.png.

### Farm and village at night (S.time=1290)
- **Store display-window glow is a ragged blob.** Mara's store (village, building at x 4-9, y 6-10): at night both shop windows under the striped awning fill with flat pale-yellow shapes with torn, lumpy top edges and dark wedges cut into them; reads like paper cut-outs, not lit glass. Other houses' 4-pane windows glow fine. Shot R2_art_world_9.png (left building), also _8.png.
- The barn on the farm at night has no lit window and its painting is very flat (plain red planks, flat gambrel roof), close to the pixel look next to painted houses. Shot R2_art_world_7.png. (Minor.)
- **Grass/cobble edges in the village are tile staircases.** Where the plaza cobbles meet grass, the border is a jagged staircase with tile-sized spikes (e.g. the cobble paths that poke up toward the store and smithy doors) and a pixel-stepped fringe of loose grass blocks. Shot R2_art_world_9.png (centre, x 480-560 and 920-980), R2_art_world_11.png (crop of the plaza's south edge).
- Plaza paving: straight seams where the three texture copies switch are visible as horizontal/vertical cut lines through the stones. Shot R2_art_world_12.png (3x crop next to the well). Minor.

### Village plaza in winter (S.season=3)
- **The plaza in winter turns into speckled terrazzo.** The cobblestones disappear; the whole plaza becomes a uniform beige-and-white blotch noise, the busiest thing on screen and not readable as snowy stone. Shot R2_art_world_13.png.
- **Winter fountain keeps green grass tufts** at the basin's foot (three bright green tufts at its left, right and bottom) and the basin rim stones have no snow while the ground and roofs do. The frozen bowl itself and the frozen streams read well. Shot R2_art_world_14.png (1.5x crop).
- The round bushes along the plaza's south edge turn into flat grey-blue blobs in winter (no snow cap, no branches). Shot R2_art_world_13.png bottom left.
- The stone building top-right of the plaza and the well have no snow on top while the cottage roof is snowed. Shot R2_art_world_13.png.

### Festivals in the village plaza (S.season/S.day set, then `festSetup()`)
- **Ember Feast (Winter 25, 17:40): feast tables and benches are pixel art**, crisp blocky planks next to the painted plaza and fountain, and each candle has a large flat salmon-pink triangular glow over it that reads as a paper shape, not light. Shots R2_art_world_15.png, R2_art_world_16.png (2x crop of the east table).
- Ember Feast at 17:40: long diagonal shadows of every table, bench and lamp post cross the whole plaza in parallel dark bands; with 4 tables, 8 benches and 6 lamp posts the plaza is striped. Shot R2_art_world_15.png.
- **Blossom Day (Spring 13, 10:00): the festival flowers on the cobbles are crisp pixel sprites** (bluebells, daisies, orange marigolds) stuck on painted paving; the hidden eggs are soft pale blobs (fine). Two lamp posts stand nearly touching north of the fountain (x ~720 and ~790 px). Shot R2_art_world_17.png.
- Lantern Night (Summer 11, 21:00): lamps lit, fine; the plaza turns rust red-brown under the dusk grade (paving looks like brick-red mud). Shot R2_art_world_18.png.
- **Harvest Fair (Fall 16, 11:00): hay bales are flat yellow rectangles** with almost no shading (one at the top by the well, one at the plaza's south edge), and the crate has flat orange panels; they read as pixel/placeholder next to the painted barrels. Shot R2_art_world_19.png.

### Wilds: meadow (biome 0, tile ~249,298; teleport `S.p.x/y` via `openTileNear`)
- Noon and golden hour (18:40) look good: painted trees, long soft tree shadows at golden hour falling right. Shots R2_art_world_20.png, R2_art_world_23.png.
- **Pond shore is a pixel staircase.** The meadow pond (left of 249,298) has a blocky 1-art-px stepped foam fringe and a jagged sand rim; it reads as pixel art around a painted water body. Shot R2_art_world_21.png (1.5x crop).
- **Tall grass sits in a rigid grid**: tufts one per tile in straight rows and columns, so meadows look tiled. Shot R2_art_world_20.png.
- **New wild flowers are crisp pixel sprites** with hard dark outlines (daisy clump, bluebells, yellow cups) on the painted grass. Shot R2_art_world_22.png (1.5x crop).
- **Rain barely shows** (S.weather='rain', 14:00): a few faint streaks, no darkening or wet look; the scene is as bright and saturated as sunshine. Shot R2_art_world_24.png vs _20.

### Wilds: forest (biome 1, tile ~40,223)
- **Birch trees are blocky.** The painted birch frames (`tree_birch_1_0`, `tree_birch_1_1`) have pixel-stepped canopies (square blocks of colour) and the small one's trunk is a thin ruler-like stick; in the forest the birches read as pixel art next to the smooth painted oaks and pines. Shots R2_art_world_25.png (canopies right of the player), R2_art_world_26.png (1.5x crop), R2_art_world_28.png (sprite sheet: birch, birch, maple, pine).

### Wilds: highlands (biome 2, tile ~253,155)
- **Cliffs are pixel art in Painterly.** Every cliff block is a flat lime-green top with a hard 1-art-px stepped edge, a thin lit rim strip, and a front face made of identical one-tile rock segments with a dark vertical seam between each tile; the "loose stones" on cliff tops are identical brown dash pairs in a regular scatter. Next to the painted trees and boulder they look like a different game. Shots R2_art_world_29.png, R2_art_world_30.png (2x crop of the ledge south-east of the player). Same in the frost biome (R2_art_world_33.png left half) and the ash biome (R2_art_world_34.png, _35.png).
- Grey rock ground patches have stair-stepped edges against grass. Shot R2_art_world_29.png (around the player).

### Wilds: coast (biome 3, Saltmere at ~417,200)
- **Sea shows a faint tile grid and a pixel-stepped shoreline.** Faint vertical/horizontal seams every tile in the open water, and the foam along the sand is a blocky 1-art-px staircase in light blue. Shots R2_art_world_31.png, R2_art_world_32.png (1.5x crop of the shore east of the player).
- The beached rowboat left of the player is a flat, almost unshaded pixel-like shape. Shot R2_art_world_31.png. (Minor.)

### Wilds: frost (biome 4, ~60,53)
- Snowy pines are lovely. Cliffs as above; the frozen pond at the top has a jagged pixel edge; the blue crystal node at the right edge is crisp pixel art. Shot R2_art_world_33.png.

### Wilds: ash (biome 5, lava at ~386,47)
- **Lava is a dull, pixel-dithered orange patch with no glow.** By day it is orange noise with stair-stepped edges (top centre); **at night (22:00) it turns muddy rust-brown**, darker than you'd expect and giving off no light, and no sparks were visible. Shots R2_art_world_34.png (noon), R2_art_world_35.png (night).
- **Ash-biome trees have neon-green spring leaves.** The `dead` trees in the Ashen Wastes show bright lime pixel-blocky leaf clumps (and teal glowing roots) in spring, which clash with the burnt setting and look pixel-ish. Shots R2_art_world_34.png (trees around the player), _35.png.

### Biome borders
- **Frost/highland border is a hard pixel staircase**: snow meets bright green grass in a diagonal 1-art-px stepped edge with no blend, plus snowy cliff ledges abutting green ones. Tile ~180,89. Shot R2_art_world_36.png.

### Winter (S.season=3, `refreshBuildings()`)
- **Wild flowers keep blooming in winter.** In the snowy meadow (Wilds ~249,298, snowing) bluebells, yellow cups, daisies and lupins stand on the snow; the twig on the ground still has green leaves; bare winter trees stand on green grass islands. Shot R2_art_world_37.png.
- Tilled soil stays bare dark brown in winter with a hard square edge on the snow; an empty tile in the field is a hard white snow square. Shot R2_art_world_38.png (farm, 19:00).
- **Tavern night windows are misaligned in winter.** On the snowed tavern (`_w` sprite, village ~28-34,5-10), each window's glow sits on the upper part of the frame or above it, leaving the glass dark, and the two right-hand windows glow as odd white "i" slivers. In summer the same windows are lit properly. Shots R2_art_world_40.png (winter, 19:30) vs R2_art_world_41.png (summer, 22:00).

- **Store window glow floats outside the building in winter.** Mara's store with its snowed `_w` sprite at 20:00: a bright, ragged white-yellow band lies across the awning and the top of the windows and runs past the store's east wall into the snow (about 1 tile beyond the building). Shots R2_art_world_42.png, R2_art_world_43.png (2x crop). (In spring it's inside the windows but ragged, see above.)
- The plaza well has no snow on its roof in winter. Shot R2_art_world_42.png bottom right.

### Villagers
- Village walkers and suitors (women's body included: the red-haired walker, the blonde in red, the long-haired woman in teal) read well and in proportion; they are pixel characters by design. Shots R2_art_world_45.png, R2_art_world_46.png.
- Saltmere at night (22:00): one stilt house's window glows as a broken "2-" shaped fragment instead of the full pane. Shot R2_art_world_44.png (left house).

Note: festival decor seen on later days in the village (flowers, hay, lamp posts in R2_art_world_39/42/45) is left over from my `festSetup()` shortcut without an `endDay`, not a game bug.

## Game-breaking
No console errors in the whole session (`errors` checked 4 times). No stuck states (I only teleported).

## Performance
FPS counter (1584x805 window): farm and village 160-165 fps at 1.2-2.3 ms work; Wilds meadow 164 fps / 1.9 ms; forest 141 fps / 2.0 ms; coast 134 fps / 1.8 ms; ash 121 fps / 5.0 ms; **highlands 118 fps / 5.5 ms and frost 118 fps / 6.7 ms** (the heaviest: cliff-dense areas; fresh chunks were being painted after a teleport, so part of this is the first-paint cost). Nothing near the 60 fps budget.

## Top 5
1. **Night window glow is misplaced on winter buildings.** Mara's store (`_w`) gets a ragged white-yellow band across its awning that runs a tile past its east wall into the snow; the winter tavern's glows sit above the glass and the right windows are white slivers. Summer is (mostly) right, so the winter sprites' glow masks are off. Shots R2_art_world_43.png, R2_art_world_40.png vs _41.png (also the store's ragged glow in spring, _9.png).
2. **Cliffs are pure pixel art in Painterly**: hard stepped tops, one-tile repeated rock faces with seams, identical stone dashes. Every highland/frost/ash view is dominated by them. Shots R2_art_world_30.png, _29.png, _33.png, _36.png.
3. **Lava has no glow and goes muddy brown at night**, pixel-dithered with stair-stepped edges. Shots R2_art_world_34.png, R2_art_world_35.png.
4. **Pixel-looking pieces next to painting**: birch trees (blocky canopies, `tree_birch_1_*`), farm animals (goats, sheep, pigs, ducks, chickens), the new wild flowers, festival tables/benches and hay bales, tilled soil as flat tile squares, water/sand shorelines and biome borders as pixel staircases. Shots R2_art_world_28.png, _6.png, _22.png, _16.png, _19.png, _4.png, _21.png, _32.png, _36.png.
5. **Winter is incomplete outdoors**: wild flowers keep blooming on snow, the winter fountain keeps green tufts and a bare rim, bare trees stand on green grass islands, the plaza cobbles become a noisy speckled terrazzo, bushes turn into grey blobs, the well has no snow. Shots R2_art_world_37.png, _14.png, _13.png, _42.png.
