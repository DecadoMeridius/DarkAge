# Art playtest 4: the world, places and people (Painterly)

Tester: world/places/people art pass, 2026-11-05. Kingdom test save (castle owned, knights and bloodline flags set), Painterly confirmed (`SETTINGS.artStyle === 'painterly'`), dev server on `[::1]:5173`, 1584x805 window. Screenshots in `docs/playtest/art4/shots/` (`world_*.png`; `world_z_*.png` are zoomed crops).

Severity: **high** = clearly pixel art or broken next to the painting, seen everywhere; **medium** = noticeable; **low** = small.

Note: a few places were captured but only looked at in passing (the meadow, forest and coast of the Wilds, the ruins, shrine, wreck and goblin camp, Kingsbridge by day, Ashford, Saltmere's town, the Frostmere, the museum, carpenter and farmhouse rooms). Their shots are in the folder (`world_w_meadow/forest/coast/shore/bridge/lava/ruins/shrine/wreck/camp/mine.png`, `world_t_kb/af/sm.png`, `world_r_frostmere.png`, `world_in_museum/carpenter/house/stablemaster.png`). Look at them in a later pass.

---

## Village

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| V1 | Grass to cobble edges (ground layer border, `pixGroundHi`) | Plaza edges, every road | The grass/paving border is a staircase of art-pixel steps with a dark 1 px rim. The textures on each side are painted, but the edge is clearly pixel. | high | world_rain.png, world_n_village.png |
| V2 | Iron lamp posts (`lantern`, 26 in the village) | Plaza, streets | Thin, crisp, almost black pixel posts with a small square lamp. Pixel art next to the painted well and fountain. Also used in towns, the castle and on the Saltmere pier. | high | world_rain.png, world_z_plaza.png |
| V3 | Altar (`altar` + `part`, 30,17) | North-east of the plaza | Reads as a flat grey brick box with one orange dot. Hard pixel bricks, no form, no hint that it's an altar. | medium | world_fest_harvest.png, world_z_plaza.png (top right) |
| V4 | Cobble paving (`ground_p`/plaza) | Plaza | Painted, but every stone has a hard dark outline and they're all the same size, so up close it reads as a tiled pixel texture. A slight grid repeat shows in the Harvest Fair shot. | low | world_z_plaza.png |
| V5 | Festival hay bales (`haybale`) | Harvest Fair | Bright yellow blocks with square holes. Pure pixel art. | medium | world_fest_harvest.png |
| V6 | Festival sacks | Harvest Fair | A blurry blob with a soft edge. Reads as an upscaled small sprite. | low | world_z_plaza.png |
| V7 | Lantern Night grade | Plaza at dusk | The whole scene goes a muddy orange-brown and the cobbles lose all contrast. Sky lanterns hardly show. | medium | world_fest_lantern.png |
| V8 | Fountain (`fountain`) | Plaza | **Good.** It's painted, the water is lovely and it freezes in winter. | ok | world_z_plaza.png |
| V9 | Well, notice board, village buildings by day | Plaza | **Good.** Painted plaster, shutters, timber and roofs. The well's red roof is a little flat. | ok | world_rain.png |

## Interiors (village rooms)

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| I1 | Rugs (`dec_` rug decals) | Store (green), tavern (red), bath (blue), royal bedchamber | Crisp diamond-lattice rugs with hard pixel edges. The bedchamber rug is a see-through dark net that looks like a floor grate. | high | world_7.png, world_in_tavern.png, world_k_bed.png, world_k_bath.png |
| I2 | Plank floors | Store, tavern | The plank pattern repeats every tile, so a tile grid shows. The planks are crisp with hard dark seams. | medium | world_7.png, world_in_tavern.png |
| I3 | Bookshelves / goods shelves | Store, tavern | Rows of bright red, green and yellow pixel bottles in a strict grid. They look like pixel art. | medium | world_7.png |
| I4 | Back wall faces (`pixRoomWalls`) | Every room | Flat plaster or brick bands with ruled lines and hard edges. The room sits in a black void with hard rectangular corners. | medium | world_in_smith.png |
| I5 | Smithy coal heaps, weapon rack, anvil | Smithy | Small crisp pixel pieces (the coal is black pixel lumps, the rack is thin lines). The forge itself is fine. | medium | world_in_smith.png |
| I6 | Tavern hearth, kegs, bar | Tavern | **Good.** The fire, carved bar and stone hearth read as painted. | ok | world_in_tavern.png |

## Briarholt (grounds and keep)

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| C1 | Curtain walls, east-west (`cwall`) | Castle grounds, Kingsbridge | Every tile repeats the same crenellation and brick pattern, with visible tile seams and ruled pixel bricks. It reads as tiled pixel art next to the painted keep. | high | world_c_gate.png |
| C2 | North-south wall runs (`cwall` vertical) | West side of the grounds | A blue-purple tint, a 1-tile block repeated down the run with a hard seam each tile. It looks broken (a stack of cubes) rather than a wall. | high | world_z_nswall.png, world_c_glass.png |
| C3 | Gatehouse arch (`cgate`) | South gate | The arch opening is filled with the cobble road texture, so it looks bricked up rather than open. The towers have pixel arrow slits. | medium | world_z_gate.png |
| C4 | Keep floors `fl` / `mb` | Entrance hall, throne room, bath | A strict checker of square tiles, one per world tile, with hard grout lines. It looks like bathroom tiles, not flagstones. Very visible. | high | world_k_in.png, world_k_throne.png, world_k_bath.png |
| C5 | Purple runners and banners | Throne room, entrance | Flat purple with yellow pixel diamonds and hard edges (`STYLE_SMOOTH`, but it still reads as pixel). | medium | world_k_throne.png |
| C6 | Throne and dais (`furn_throne_h`, `dec_dais`) | Throne room | The throne is small, blurry and low-res. The dais is flat grey rectangles with ruled lines. | high | world_k_throne.png |
| C7 | Slim pillars, candelabras, armour stands | Entrance hall, bath | The pillars are tiny grey pixel columns that read as radiators. The candelabras are crisp gold lines. The armour stands are pixel (they look fine but don't match). | medium | world_k_in.png |
| C8 | Keep wall tops and coping | All three floors | Dark navy pixel brick bands with hard lines. They dominate the screen. | medium | world_k_kitchen.png, world_k_cellar.png |
| C9 | Kitchen hearth (`furn_hearth`), stoves, copper pots | Kitchen | The hearth is a black box with a tiny pixel fire. The pots are flat brown circles, the stoves are pixel. | medium | world_k_kitchen.png |
| C10 | Wine racks (`furn_winerack`) | Cellar | Grids of flat red-brown circles with outlines. Pure pixel. | high | world_k_cellar.png |
| C11 | Keep stairs (`k_down`) | Cellar | Grey and purple stripes with hard edges. | medium | world_k_cellar.png |
| C12 | Cell bars (`furn_cell`), hoard (`furn_hoard`) | Dungeon cells | The bars are thin grey 1 px lines. The hoard is a yellow block with pixel coins that looks like a hay bale. | medium | world_k_cells.png |
| C13 | Bedchamber floor | Upper floor | An orange brick pattern that reads as a brick wall laid flat, not a wood floor. The royal bed is blurry. | medium | world_k_bed.png |
| C14 | Training yard: dummies, targets, weapon rack, hay bales | Castle grounds | Crisp pixel props: the dummies are stick figures and the bales are yellow blocks. | medium | world_c_glass.png, world_c_gate.png |
| C15 | Keep exterior, glasshouses, hedges, fountain plaza | Grounds | **Good.** The keep's ivy and stone, and the glasshouses with citrus showing through, are painted. | ok | world_c_keep.png, world_c_glass.png |

## The Wilds

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| W1 | Cliffs (`r`, `cliffTop`, natural face) | Highlands | Low brown rock strips with straight hard tops and rows of dashed pebble marks. The cliff tops follow the tile grid exactly. This is the most pixel-looking terrain in the game. | high | world_w_high.png |
| W2 | Cliffs in the ash and frost biomes | Ash, frost | Pale beige or grey blocks with rectangular tile edges and dashed rows. | high | world_w_ash.png, world_z_ashcliff.png, world_w_frost.png |
| W3 | Biome borders: snow to grass, ash to snow | Highlands and ash edges | Jagged art-pixel staircases (natural layers are said to be smoothed, but these still step). | medium | world_w_high.png (top left), world_w_ash.png |
| W4 | Shore foam | Coast, isles | A dotted cyan line of pixel squares that follows the stepped shore. | medium | world_w_shore.png, world_i_moonreef.png |
| W5 | Ore and gem rocks | Highlands, ash | **Mostly good.** Painted and shiny. The silver/iron ore (cracked grey with red veins) is a little noisy. | low | world_w_high.png |
| W6 | Pines, dead trees, palms | Frost, ash, isles | **Good.** They're painted and seasonal, with snow, and the dead trees are fine. | ok | world_w_frost.png, world_i_ember.png |
| W7 | Mine walls and ledges (natural rock) | Mine floor 3 (earth) | The walls are a dark cobble texture with hard rectangular tile edges. Ledge faces are small block strips. The floor is fine. | medium | world_mine_earth.png |
| W8 | Mine rocks | Mine | **Good.** Painted, with moss. | ok | world_mine_earth.png |

## Towns

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| T1 | Turf and slate roofs | Greyhelm | The green turf roofs are flat green rectangles with hard pixel edges and almost no painting. The slate roof is a flat ruled grid. | high | world_t_gh.png, world_z_turfroof.png, world_z_ghroof.png |
| T2 | Rails (`furn_rails`), anvil sign | Greyhelm | Crisp pixel rails. The anvil by the forge is tiny pixel art. | medium | world_t_gh.png |
| T3 | Waystone | All towns | A grey pillar with a slightly blurry upscaled look. Acceptable. | low | world_t_gh.png |
| T4 | Pier planks | Saltmere, isles | Repeating vertical planks with hard dark seams and pixel nail dots. Tiled pixel. | medium | world_sailboat.png |
| T5 | Market stalls | Kingsbridge | **Good.** Painted awnings and goods. | ok | world_n_kb.png |
| T6 | Saltreach town (inn, stilt house, slate house) | Saltreach | **Good.** Whitewashed inn and shutters. The paving border still steps (V1). | ok | world_r_saltreach.png |

## Regions and dungeons

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| R1 | Dungeon brick walls | `dg_highmarch` (Sunken Forge) | Brick wall chunks with hard square outlines in a dark void. Very pixel. | high | world_dungeon.png |
| R2 | Ground borders, sand patches on ash | Emberwaste town | Stair-stepped edges (as in V1). | medium | world_r_emberwaste.png |
| R3 | Highmarch hall, Emberwaste basalt halls, hide tent | Region towns | **Good.** The stone, turf roof and tent read as painted. | ok | c23 (Highmarch crop), world_z_tent.png |

## Isles

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| S1 | Ruin walls | Sunken Crown | Dark grey pixel brick columns with ivy pixels, made of tile blocks. | high | world_i_sunken.png |
| S2 | Pier and shore foam | Moonreef | See T4 and W4. | medium | world_i_moonreef.png |
| S3 | Palms, beaches, Glasswater pines, Emberwhorl dead trees and obsidian | Isles | **Good.** | ok | world_i_*.png |

## People, riding, boats

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| P1 | Player in plate (helm + cuirass) | Everywhere | The helmet is a featureless white rectangle and the body is a grey box. Next to painted scenes it's the most visibly pixel thing on screen. Gear colours didn't show: with an adamant helm, gold body and cobalt sword equipped the player still looked plain white and grey (maybe a cache; check it). | high | world_z_player.png, world_gear.png |
| P2 | Villagers, townsfolk, guards, knights | Everywhere | Pixel templates as intended, but blocky (square heads, flat colours). They read as sprites pasted on a painting. The knights' purple tabards and the square helmets look worst. | medium (by design) | world_c_keep.png, world_k_throne.png |
| P3 | Rider | Wilds | The horse is smoothed and fine, but the rider is a square pixel figure in a white bucket helmet. The red saddle shows. Fits poorly. | medium | world_z_ride.png |
| P4 | Canoe | Coast | The hull is small and the paddle is a flat orange stick. A hard dark rectangle under the canoe is the shadow or wake, and it looks like a glitch. | medium | world_z_canoe.png |
| P5 | Sailboat (drawn with the ferry sprite) | End of the Saltmere pier | It reads as a wooden bench or raft: no sail, no mast, blurry and low-res, and smaller than a person. It doesn't look like the 15,000g sailboat. | high | world_z_sailboat.png |

## Light and weather

| # | What | Where | Problem | Sev | Shot |
|---|---|---|---|---|---|
| L1 | Night window glow (`styleGlow`) | Village, towns | Works and looks cosy. On some buildings the glow is a bright yellow blob in the lower panes while the upper panes stay blue, so the windows look half-lit. | low | world_z_nightwin.png |
| L2 | Lamp light at night | Village, Kingsbridge | Only a small orange square on the post with a faint halo. Lamps hardly light the ground. | low | world_n_village.png, world_n_kb.png |
| L3 | Rain | Village | The rain streaks are barely visible. Otherwise fine. | low | world_rain.png |
| L4 | Winter snow ground and borders | Village | **Good:** snow textures, snow caps and bare trees. The snow/paving border steps hard (V1). | ok/medium | world_winter.png |
| L5 | Tracker label "to Hollowmere Farm" | Castle, keep, isles, towns | The label floats in the middle of the screen in big text on almost every map, covering the art. It's probably the tracker's 4 s label stuck on. A UI issue, but it's in every art shot. | low | world_k_throne.png |
| L6 | Daylight shafts and dapple | Outdoors | **Good**, warm. Sometimes very strong diagonal bright bands across walls (castle gate). | low | world_c_gate.png |

---

## What looks good in Painterly
- Trees everywhere: oaks with blossom, pines with snow, palms, dead and charwood trees.
- Village and regional buildings: plaster cottages, the Highmarch turf hall, the Saltreach whitewashed inn, the Emberwaste tent.
- The village fountain (also frozen in winter), the well and the notice board.
- The keep exterior with ivy, and the glasshouses with citrus trees inside.
- The tavern (bar, hearth, kegs) and the smithy forge.
- Ore and gem rocks, and the mine rocks with moss.
- Snowy ground, winter snow caps and bare trees.
- Painted sea with swells, beaches, and Kingsbridge's market stalls.
- Night window glow overall, and the warm daylight.

## Top 10 to fix first
1. **Cliffs in every biome** (W1, W2): the tile-grid cliff tops and dashed block faces are the most pixel-looking terrain.
2. **Terrain borders** (V1, W3, W4, R2): stepped grass/paving/snow/sand edges and the dotted shore foam need smooth curves.
3. **Castle curtain walls** (C1, C2): the repeating tiles, and the broken-looking blue north-south runs.
4. **Keep floors `fl`/`mb`** (C4): the bathroom-tile checker on every keep floor.
5. **Player in armour and gear colours** (P1): a white box helmet, and equipped tiers don't show their colour.
6. **Sailboat sprite** (P5): reads as a bench; needs a real boat with a sail.
7. **Lamp posts** (V2): crisp black pixel posts in every town and on the castle grounds.
8. **Rugs** (I1): lattice pixel rugs, and the see-through net rug in the bedchamber.
9. **Greyhelm roofs** (T1): flat green and slate rectangles.
10. **Dungeon and ruin brick walls** (R1, S1), plus the keep props (wine racks, throne and dais, hearth: C6, C9, C10).
