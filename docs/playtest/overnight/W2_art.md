# W2 — Art director, second pass (Painterly)

Kingdom test, developer mode, Painterly style (already on), FPS counter on. Port 9303, `[::1]`.

**Shortcuts used (please read):** I used the console for more than season, time and weather.
- **Season, time and weather:** `S.time`, `S.season`, `S.weather`, `refreshBuildings()`.
- **Teleports (`goMap`), outside what the brief allowed.** Walking 100+ tiles to each place would have used up the command budget, so I teleported to:
  - Greyhelm and Ashford;
  - the Wilds mine mouth, and mine floors 12, 22 and 32 (`S.mineFloor`);
  - sample points in the highlands, frost, ash and coast biomes;
  - the Briarholt grounds and all three keep floors. The way is still locked in the Kingdom test, so they're seen without the story having opened them;
  - Highmarch, Frostmere and Emberwaste (set `S.regions[r]`).
- **Reached the normal way:** the village interiors (smithy, Hale's, museum, tavern), by the waystone and on foot.
- **Not visited:** Saltreach; there is no swamp biome in this world's Wilds.

Shots: `docs/playtest/overnight/shots/W2_art_<n>.png`.

## Broken
- **The rooms show a mirrored copy of the back wall above them.** Every interior (smithy, carpenter, museum, tavern) has a second strip of the back wall, with its banners, pictures and shelves, floating above the room across a black band. The museum also repeats the floor below the room. It looks like the mirrored edge chunks ("past the top and bottom map edges, the edge chunks are drawn mirrored") are applied indoors too. Shots 8, 12, 15, 19.
- **The great hall's runner rugs are painted at a slant.** In the keep's great hall (`castle_in`), the purple runner is drawn tilted about 30°, both north of the doorway and south of it; it looks like a free painting that came back rotated. Where the runner sits under the tables, it's a torn, smeared strip with white gaps. Shots 43, 44.
- **The throne dais is isometric 3D.** `dec_dais` is a stone block seen at an angle, with steps in perspective and the runner and throne on it at a diagonal. It's the clearest 3D object in the game. Shot 45.
- **Lava has water foam.** In the Wilds ash biome, the plank bridge over the lava river has a strip of blue shore foam along its south edge, plus blue ticks on the bank. The foam pass treats lava like water. Shot 37.

## Night windows and glows (not found in part 1)
- **Greyhelm inn:** yellow leaf-shaped glows sit on the ivy and roof (four or five blobs along the roof line and gable) and on a stray strip of wall. Shot 26.
- **Greyhelm cottage:** at night only the lower-left corner of the left window glows, and the right window glows a faint green. Shot 25.
- **Emberwaste hall and forge:** a row of yellow dashes runs along the eaves of both buildings, above the windows. Shot 51.
- **Winter village:** the glows follow the summer window positions, not the winter painting's.
  - **Tavern:** the upper windows are lit only in their top-left corners, and two dots float over each dormer.
  - **Cottage:** the windows are lit only along their top edge.
  - Shot 53.
- **Daytime lit windows:** windows glow warm yellow in full daylight.
  - Greyhelm turf cottages at 8:20 and 8:40 am (shots 23, 24).
  - Odile's Stables at 2:50 pm (shot 18).
  - A Highmarch house at 11:20 am (shot 49).
  - They're painted lit, so they read as night at noon.
- **Tavern window:** the window by the hearth still shows a blue daytime sky at 9 pm. Shot 20.

## Art & feel, by place
**Village interiors** (shots 8, 12, 15, 19, 20)
- **Walls:** the back walls (grey brick in the smithy and museum, boards in Hale's) are flat and pixel-crisp next to the softer painted floors and furniture.
- **Plank floors:** there are lighter rectangles with hard edges, tile or chunk sized (Hale's, the tavern behind the bar, the keep's upper floor).
- **Rugs:** the museum and keep rugs are a fine cross-hatch that looks like noise or moiré.
- **Hale's lumber stack:** it pokes out past the room's right wall into the black. Shot 12.
- **Tavern patrons:** they stand on top of the bench and table instead of sitting. One stands in the middle of the table on the rug, another in front of the bench. Shot 20.

**Village buildings**
- **Hale's carpentry:** the log cabin's roof is drawn at an angle (3D gable). Shot 11.
- **Museum and Odile's Stables:** both have a flat, almost untextured navy hip roof. Shots 14, 18.
- **Plaza altar:** a flat grey pixel block. Shots 16, 52.

**Greyhelm** (shots 23-26)
- **Turf roofs:** flat green slabs with a faint grid, nothing painted on them.
- **Town wall:** a column of small repeated pixel blocks. Shot 24.
- **Rails and mine cart:** blocky.
- **Unexplained figure:** an all-brown humanoid, like a wooden mannequin, at the left edge of shot 23.
- **Small stuff:** a black blob at the longhouse's corner, a pine with orange fruit dots, and coal piles that are black pixel lumps.

**Ashford** (shots 27, 28)
- **Gabled buildings:** they read as 3D perspective roofs.
- **Gateway:** the gate is a hard-edged rectangle of cobbles on a dirt road.
- **Hay bale:** a flat yellow block.
- **Cliff ledges east of the gate:** flat outlined boxes.

**Cliffs everywhere** (shots 29, 30, 35, 36, 39, 48)
- **Raised ground:** plateaus are flat, outlined rectangles with a thin stone face, so they read as crates or boxes; there are single-tile pillars too (shot 35).
- **Snow cliffs:** the tops have a tiled pattern of brown dashes.
- **Highmarch:** green, grass-topped cliff blocks float on snow. Shot 48.

**Biome borders:** snow meets grass, and frost meets forest, along a hard stair-stepped pixel line with no blend. Shots 36, 39.

**Frost biome:** a summer-brown dirt road ends bluntly in the snow. Shot 36.

**Ash biome** (shot 37)
- **Lava:** blocky orange mosaic squares with stepped edges, the least painted surface I saw.
- **Charwood trees:** they stand on bright cyan, snow-like ground patches in a volcanic biome.

**Mine floors** (shots 31-34)
- **Walls:** on earth, ice and magma floors alike, the walls are horizontal brick courses, which read as masonry, not cave rock.
- **Earth floor:** its dirt shows visible pixel speckle.
- **Mossy rocks:** green mossy grey rocks appear on the ice, magma and void floors (theme mismatch).
- **Ice floor:** grey brick pillar structures.
- **Void floor:** small pixel-looking purple mushrooms.

**Briarholt grounds** (shots 40, 41)
- **Magenta fringe:** pink and magenta key colour shows in the mortar of the keep's entrance steps, and as pink outlines round both banner poles.
- **Benches:** thin grey stubs, nearly invisible.
- **Hedges:** flat green rectangles.
- **Keep facade:** painted and good.

**Keep interior** (shots 43-47)
- **Floors:** chequered marble and flagstones are very regular grids that read as tiles.
- **Upper floor:** the plank floor looks like orange brickwork.
- **Inner walls:** the north-south walls are thin dark strips with no face.
- **Small pieces:** pillars, cell bars, wall banners, the stained-glass window and the chapel pews look pixel-thin.
- **Wardrobe:** it has vines growing on it.
- **Candle flames:** on the hall tables they're pink cones.

**Winter** (shots 52, 53)
- **Snow roofs:** flat pale slabs with stair-stepped blocks, no texture, and huge light-blue icicle "drips" over the tavern's upper windows.
- **Not snowed on:** the well's roof stays red, and there's green grass under the bare tree.

**Frostmere:** the lodge has snow on its roof but the forge has none, and the street is bare brown cobble with hard edges in a snowy town. Shot 50.

**Autumn and rain:** the rain is barely visible, the twigs still carry green leaves, and the herald's horses are small and pixel-looking. Shot 54.

**Characters:** the player in iron armour is still a blocky pixel template everywhere (part 1 noted this).

## Quality of life
- **Clicking far away sometimes does nothing:** with the sword selected in the village plaza, with villagers nearby, clicking far ground did not walk. Shot 17.
- **Accidental tilling:** a left click on the farm with the hoe selected (the default slot 1) tills a tile when you only meant to walk.

## Balance
- Nothing checked (art pass only).

## Performance
- Steady 118-130 fps everywhere: interiors, towns, mines, regions, winter and night. "Work" stayed at 0.8-2.3 ms.
- No stutters seen, even right after a teleport.
- Errors: none from the game. There were five 404 resource loads (`Failed to load resource`); I couldn't tell which files.

## Liked
- The keep's front facade, the castle fountain, the painted autumn trees, the snow pines and the winter lodges all read as one painted world.
- The tavern hearth and the Greyhelm lamp posts at night look right.

## Top 5 fixes
1. **Mirrored rooms:** stop drawing mirrored edge chunks in interiors (the doubled back wall above every room). Shots 8, 12, 15, 19.
2. **3D and slanted keep pieces:** replace the isometric throne dais and the slanted, torn great-hall runners with flat, straight-on paintings. Shots 43-45.
3. **Window glows:**
   - Tie each building variant's glow to its own painting (winter glows are misaligned).
   - Remove the glows on roofs, ivy and eaves (Greyhelm inn, Emberwaste).
   - Stop windows looking lit in daylight.
   - Shots 18, 23, 26, 51, 53.
4. **Box cliffs and hard edges:** make cliffs read as natural raised ground, not outlined boxes, and blend biome edges instead of hard pixel steps. Shots 35, 36, 39, 48.
5. **Theme and key-colour leaks:**
   - Blue foam on lava.
   - Mossy rocks in ice, magma and void mines.
   - Cyan snow patches under charwood.
   - Magenta in the keep steps and banners.
   - Brick walls in caves.
   - Shots 31-34, 37, 41.
