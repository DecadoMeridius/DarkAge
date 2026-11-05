# Art playtest 4: the farm in Painterly

Tester: farm and everything on it. Painterly style (`SETTINGS.artStyle = 'painterly'`), Test sandbox, zoom 4, 2026-11-05.
Setup: all 45 crops planted at stages 0-3 in two fields (rows alternately dry and watered), every farm tree, fruit tree and sapling stage, wild plants, rocks and ores, belts, channels, fences and a gate, sprinklers, implements, 3 coats of every farm animal (adults and babies), the pet dog, build sites, the shed, the silo, building levels 1-4, all four seasons, rain, snow, day and night.
Screenshots are in `shots/farm_<n>.png` (the `a`/`b`/`c` files are zoomed crops). Pages marked "gallery" (`farm_10`, `farm_11`, `farm_23`) draw atlas frames on a flat background outside the game. Gallery framing can be misleading: the windmill's sails look cut there but are whole in game. Every finding below was checked in game unless it says "gallery".
No console errors during the session.

Severity: **high** = broken, or obviously wrong or unpainted where every player sees it. **medium** = clearly pixel art, or mismatched next to painted neighbours. **low** = polish.

---

## 1. Crops by stage

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| C1 | Sprouts `crop_<k>_0` (all 45) | every field | Smoothed pixel sprites (`smoothUp`): soft blocky leaves, stair edges. They read fine but are plainly upscaled pixel art next to the painted ground and trees. | medium | farm_05d, farm_04a |
| C2 | Young `crop_<k>_1` and grown `crop_<k>_2` (all) | every field | Same as C1: smoothed pixel art, blurry square leaf clusters. Many stage-1 plants are an identical green blob (kale, cabbage, blueberry, sunberry, melon all look alike). | medium | farm_04a, farm_04b |
| C3 | Emberfruit stages 1-2, cinder melon stages 1-2 | field 2 | The young plant is a plain brown ball that reads as a rock or a dirt clod, not a plant. | medium | farm_05c |
| C4 | Ripe crops `crop_<k>_3` (crops2.py, painted to outline) | row 4 of each field | Somewhat painted but still small and pixel-edged at zoom 4. Several are hard to read: **potato** is a green turtle-shaped blob, **kale** a flat dark-green mat, **turnip** tiny, **red cabbage** a purple ball with two grey "wings", **poppy** red flowers on a grey stake. | medium | farm_05a, farm_05b |
| C5 | Peapod ripe, sea grape ripe | fields | A dark rectangular halo or box outline around the sprite (the cut-out edge shows). | medium | farm_05a, farm_05c |
| C6 | Corn and wheat ripe | field 1 | Corn and wheat look pixel-stiff: straight vertical stalks with ruled lines. | low | farm_05a, farm_05b |
| C7 | Crops in winter | field in winter | Green, flowering crops in snow (mostly gameplay, crops would have died), but there is also no frost or snow treatment at all. | low | farm_16 |
| C8 | Hover label | crop tooltip | Shows "day 3.06/9" when age is fractional (seen with JS-set ages; real ages are whole). Text, not art. | low | farm_04 |
| C9 | Strains (recoloured produce) | n/a | Not tested: no quick way to make a strain. | n/a | n/a |

## 2. Tilled and watered soil

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| S1 | Tilled soil texture (`soilSpr` fields) | all fields | Furrows are stair-stepped wavy pixel lines enlarged. They clearly read as pixel art, and the field is one big flat brown rectangle. | **high** | farm_05d |
| S2 | Field edge | all fields | Hard, straight, ruler-cut edge to the grass, with no lip, rim or soft transition. The painted ground elsewhere blends. | medium | farm_05d, farm_04 |
| S3 | Watered soil | wet rows | A darker band plus little blue dash marks at fixed spots, and a navy notch at the bottom-right of each plant's mound. They look like pixel artefacts, not wet earth. | medium | farm_05d |
| S4 | Soil in winter | farm_16 | No snow dusting or frost: bare warm-brown fields in a snow field. | medium | farm_16 |
| S5 | Soil in rain | farm_19 | Dry rows don't darken while it rains (gameplay waters them next morning), so rain has no visible effect on the fields. | low | farm_19 |

## 3. Trees and plants

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| T1 | Birch `tree_birch_*` (aliased to the `_1` painting) | farm trees | Canopy is big blocky pixel squares (stair edges, flat colour blocks). In autumn it's muddy green and orange blocks. The worst tree on the farm. | **high** | farm_06a, farm_15 |
| T2 | Cherry tree (fruiting), fruit trees without fruit (`tree_apple` etc., age 14+), apple in autumn | farm | Canopies are blocky or pixel-stepped. The code-painted fruit (`treeImg` wrapper) is flat red circles stuck on top. Peach, orange, plum and pomegranate are properly painted. | **high** | farm_06a, farm_07a, farm_15 |
| T3 | Apple tree (fruiting) | farm | Blossom and ripe fruit at the same time. | low | farm_06a |
| T4 | Ground "island" under painted trees (oak, birch, cherry, maple, fruit trees) | all seasons | Each tree stands on its own painted grass-and-soil slab with stones and flowers, a 3D-ish base that doesn't match the ground around it. In **winter** the slab stays green and brown under bare trees in the snow (pine is fine). | **high** (winter) / medium | farm_16, farm_07 |
| T5 | Fruit on bare winter branches | winter | Red, orange and peach dots float on bare branches when `o.fruit > 0`. Gameplay clears fruit out of season, so this is rare. | low | farm_16 |
| T6 | Saplings `sapling_<kind>.0-2` | farm | Smoothed pixel "lollipop" trees. They stay summer-green in autumn and winter. | medium | farm_06b, farm_15, farm_16 |
| T7 | Tall grass `tgrass` | farm | Smoothed pixel tufts (blocky). In autumn they are orange blocks. | medium | farm_07a, farm_15a |
| T8 | Wild flowers `flower.0-4` | farm | Smoothed pixel. **Foxglove** is two purple dotted sticks, crude. They bloom unchanged in autumn and snow. | medium | farm_07a, farm_15a, farm_16 |
| T9 | Fern, bramble | farm | Fern is a tiny pixel splat. Bramble is jagged red pixel zig-zags. | medium | farm_07, farm_06b |
| T10 | Bush (winter) | winter | Grey-blue blob with pixel edges. | low | farm_16 |
| T11 | Twig | winter | Keeps green leaves in snow. | low | farm_17 |
| T12 | Map-edge tree line (top) | farm top | A row of identical trunk bases with roots. The canopies are off-map, and a hard straight shadow band runs under them. It repeats visibly. | medium | farm_08, farm_09 |
| T13 | Map-edge trees (right) | farm right edge | Canopy cut off by a straight vertical line, then a black or dark void past the map edge. | medium | farm_12, farm_24 |

## 4. Rocks, ores, small finds

| # | What | Problem | Sev | Shot |
|---|---|---|---|---|
| R1 | `rock` (plain boulder) | Pixel stair edges, flat grey. | medium | farm_07b |
| R2 | `ore_copper` | Black rock with glowing red-orange veins. It reads as lava or magma rock, not copper (no orange or green copper colour). | medium | farm_07b |
| R3 | `ore_coal` | Grey rock with black pixel spots, pixel-like. | medium | farm_07b |
| R4 | `ore_silver` | Faceted grey with red specks; doesn't say silver. | low | farm_07b |
| R5 | `ore_gold` | One big solid gold crystal: reads as a gem or nugget, not ore in rock. | low | farm_07b |
| R6 | Stone, twig, mushroom, stump | Good, see the good list. | n/a | farm_07a |

## 5. Ground, paths and seasons

| # | What | Problem | Sev | Shot |
|---|---|---|---|---|
| G1 | Dirt road and dirt patches (`d`) | Edges are pixel staircases with a dark outline; the patches below the barn and stable are blotchy separate pieces. | medium | farm_08, farm_09, farm_13 |
| G2 | Pond shore | Shoreline has stepped pixel edges. | medium | farm_12b |
| G3 | Autumn grass | Uniform mustard leaf-litter all over; it reads as dirt rather than autumn grass and is busy and flat. | medium | farm_15, farm_15a |
| G4 | Spring and summer grass, winter snow | Painted well (see good list). The light shafts sometimes leave a hard vertical light/dark seam (beside the road). | low | farm_14 |
| G5 | Past the map edge (right side) | A dark, almost black band is visible when the camera reaches the right edge. | medium | farm_12, farm_24 |

## 6. Buildings

| # | What | Problem | Sev | Shot |
|---|---|---|---|---|
| B1 | Barn levels `bld_barn_7x6_l2/_l3/_l4` | In game, l4 looks exactly like l1: no windows or trim, stone footing, cupola, weathervane, lanterns or flower boxes. In the gallery l2-l4 are squatter with the doors cut at the bottom. | **high** | farm_14, farm_11 (gallery) |
| B2 | Coop levels `bld_coop_6x5_l2/_l3/_l4` | l3 and l4 are identical to l2 (windows and shutters only): no footing, cupola, weathervane or flower boxes. | **high** | farm_10 (gallery), farm_21 |
| B3 | Stable `bld_stable_6x5` (+_l2, _l3; no _l4 exists) | A flat front elevation: roof and wall as two stacked rectangles with no roof form or overhang, and the right-hand stall door cut off by the frame edge. All levels identical; level 4 falls back to level 1. | **high** | farm_09, farm_10 |
| B4 | Barn in winter `bld_barn_7x6_*_w` | The gambrel roof becomes a big boxy pale-blue "ice block" with abstract light-blue blotches; the shape is lost. | **high** | farm_18, farm_17 |
| B5 | Stable winter `_w` | Snow on the roof is blocky pixel-stepped grey lines and patches. | **high** | farm_18, farm_11 |
| B6 | Cottage winter `bld_cottage_5x5_w` | Blocky pixel snow patches on the roof. | medium | farm_11 (gallery) |
| B7 | Storage shed (uses `bld_cabin_4x3`) | **Snow on its roof in spring**: the base painting has snow and icicle drips. Also a tiny frost-cabin-style log hut that doesn't match the other farm buildings. | **high** | farm_22a |
| B8 | Cottage, 7x5 at build stage 3 | Flat roof rectangle with a small front gable. The top rows of the roof tiles are smeared and streaked horizontally. The 7x5 cottage (`bld_house_7x5`?) and the 5x5 `bld_cottage_5x5` are different designs. | medium | farm_22b |
| B9 | Build-site scaffolding (`siteSprite`) | Thin crisp pixel poles and diagonal braces over the painting. At stage 1 it's just an empty frame on grass. The foundation strip is orange and pink smeared blotches. | medium | farm_22, farm_22b |
| B10 | Greenhouse ruin `bld_greenhouse_6x5_ruin` | Ivy has blocky pixel edges; the box is cut straight on the right; a slightly 3D gable. No snow, and bright green ivy in winter. | medium | farm_08, farm_17 |
| B11 | Repaired greenhouse (STYLE_SMOOTH) | Smoothed pixel glass grid, plainly pixel. No snow in winter. | medium | farm_11 (gallery) |
| B12 | Silo winter, stall winter | No snow at all (identical to summer). | low | farm_11 (gallery) |
| B13 | Coop cast shadow | A hard-edged dark rectangle on the ground below the coop. | low | farm_08 |
| B14 | Coop at night | Windows are bright white glass, not lit and not dark. | low | farm_21 |

## 7. Machines, stations, belts

| # | What | Problem | Sev | Shot |
|---|---|---|---|---|
| M1 | Sprinkler `sprinkler` | **Broken**: only the right half shows in game, a grey shape with a red smear. In the gallery it's a thin black pole. | **high** | farm_12a, farm_23a |
| M2 | Quality and iridium sprinklers | Yellow and cyan cylinders with caps, like paint cans or candles; they don't read as sprinklers. | medium | farm_12a |
| M3 | Idle stations: blast furnace, ember forge, kiln, bread oven, stone furnace | Fire burns in the mouth while idle (empty sandbox stations), so lit and unlit can't be told apart. At night they don't glow either. | medium | farm_05e, farm_20 |
| M4 | Smelter, stone furnace | Smoothed pixel grey boxes, flat. | medium | farm_05e |
| M5 | Belts (conveyor, cobalt, rune, chute; `beltPx`) | Clean, but plainly code-drawn pixel art, smoothed. Faint lighter seams between tiles on straight runs. Items on belts are tiny red pixel blobs. | medium | farm_12b |
| M6 | Splitter, sorter, merger | Dark bars or a box over the belt; crude, unclear. | medium | farm_12b |
| M7 | Windmill | 3D grass slab with steps under it (perspective), unlike the flat look. Sails are whole in game. | medium | farm_24 |
| M8 | Ember core | The crystal floats detached above its dark pedestal. | low | farm_23a, farm_04 |
| M9 | Crane | A glowing blue rod lying flat; unclear. | low | farm_12a |
| M10 | Campfire at night | The flame is a small bright square. | low | farm_21 |

## 8. Placed props

| # | What | Problem | Sev | Shot |
|---|---|---|---|---|
| P1 | Fences `fence_<mask>` (STYLE_SMOOTH) | Smoothed pixel. Vertical runs are a thin column of posts. No snow on fences in winter. | medium | farm_09, farm_18 |
| P2 | Fence gate `fgate` | Posts and lintel read as an empty doorframe, with small leaves beside. | low | farm_12 |
| P3 | Scarecrow | Simple smoothed figure with a flat blue body; crude. | medium | farm_12a |
| P4 | Implements (plough, cart) | Small, smoothed pixel. | low | farm_24 |
| P5 | Crab trap on land | A tiny red and white bobber-like dot. | low | farm_24 |
| P6 | Water channels | Good (see list). | n/a | farm_12 |

## 9. Animals, pet, horse

| # | What | Problem | Sev | Shot |
|---|---|---|---|---|
| A1 | Cows, pigs, sheep, goats, horses, ducks (`an_<sp>`) | Still upscaled pixel art with soft edges: stair-stepped outlines, pixel-noise wool on the black sheep, the horse mane in steps. | **high** (seen all day on the farm) | farm_13a, farm_13b |
| A2 | Rabbit and chicken (STYLE_SKIP, smoothed pixel frames) | Blurry; the grey rabbit is a soft blob lying down. | medium | farm_13a |
| A3 | Black pig | Near-black silhouette with almost no detail. | medium | farm_13b |
| A4 | Sheep "cream" coat | Comes out salmon or orange, not cream. | medium | farm_13b |
| A5 | Pet dog | Tiny, blurry, smoothed pixel. | medium | farm_19a |
| A6 | Ridden horse and rider, with tack | Horse pixel-edged. The rider is a stiff pixel figure sitting high, with the leg mostly hidden. Saddle and bridle are crisp pixel art. | medium | farm_25a |
| A7 | Hearts over animals | Flat vector hearts; fine, but every animal shows one at once and it gets busy. | low | farm_13 |

## 10. Weather and light

| # | What | Problem | Sev | Shot |
|---|---|---|---|---|
| W1 | Rain | Very faint thin streaks and almost no tint; it hardly reads as rain. | low | farm_19 |
| W2 | Night | Good flat grade, but idle stations show fire without glow (M3), and the coop has no lit windows (B14). | low | farm_20, farm_21 |
| W3 | Snow | Flakes and snowy ground are good. Buildings: see B4-B6, B12. | n/a | farm_16 |

---

## What looks GOOD in Painterly
- **Ground:** spring and summer grass is rich and painted with no visible repeat. Winter snow ground is soft with grass showing through. Painted water channels with stone kerbs, and their L-joins (farm_12).
- **Trees:** oak, maple, pine, peach, orange, plum and pomegranate are properly painted, with nice long soft sun shadows (farm_07). Autumn oak and maple colours are lovely. Bare winter trees with snow on the limbs and the snowy pine are excellent (farm_16).
- **Small finds:** the stump, red mushrooms, twig and small stone cluster are well painted (farm_07a).
- **Buildings:** the barn (level 1, summer) is well painted (farm_09). The coop with windows (l2+) is charming. The notice board, waystone, storage chest and tent are fine. The well with its red roof and the silo look good.
- **Stations:** the blast furnace, ember forge, kiln, oven, workbench, anvil, keg and preserves jar paint well (farm_02, farm_05e).
- **Belt curves:** the curves join cleanly (farm_12b).
- **Ripe crops:** pumpkin, carrot, eggplant, strawberry, tomato, sunflower, grape, beet and blueberry read well.
- **Animals:** the goats, spotted and highland cows and white sheep are the best of the animals.
- **Light:** the long soft shadows from the sun, and the coop's winter snow roof with icicles (gallery).

---

## Top 10 to fix first
1. **Sprinkler sprite is broken** (half cut off in game, a black pole in the atlas) (M1).
2. **Tilled soil texture** is enlarged pixel furrows, a hard-edged flat rectangle with blue pixel "wet" marks (S1-S3). It covers the most screen on a farm.
3. **Farm animals** are still pixel art (A1-A5), on screen all day.
4. **Building upgrade levels don't show:** barn l2-l4 and coop l3-l4 look identical to lower levels, and the stable has no level art and is a flat, cropped box (B1-B3).
5. **Winter buildings:** barn roof becomes a blue ice block, and the stable and cottage have pixel-stepped snow (B4-B6).
6. **Storage shed has snow on its roof in spring** (`bld_cabin_4x3`) (B7).
7. **Birch and cherry trees and fruit trees without fruit** have blocky pixel canopies; fruit is stuck-on flat dots (T1-T2).
8. **Green ground slabs under trees in winter** (and the 3D slab look generally) (T4).
9. **Crop growth stages 0-2 are smoothed pixel art**, and some ripe crops are unreadable: potato, kale, red cabbage, brown-ball emberfruit and cinder melon (C1-C5).
10. **Idle stations show fire** (lit and unlit look the same) and don't glow at night (M3).
