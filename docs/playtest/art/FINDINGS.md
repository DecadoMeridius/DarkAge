# Art and feel playtest: findings

On 2026-10-31, four AI testers played a snapshot of the game, judging feel and looks, not bugs. Their full reports are in this folder:

| Report | Tester | Score |
|---|---|---|
| `castle.md` | Briarholt atmosphere | 5.5/10 as a royal castle |
| `towns.md` | the towns and the Wilds | Kingsbridge 7 alive and 6 distinct; Greyhelm 5 and 4 |
| `home.md` | the farm and village, as a Stardew fan | 6/10 cozy and alive |
| `consistency.md` | a pixel-art director's style audit | consistency 6.5, beauty 7.5 |

`consistency.md` has its screenshots in `a4/`.

**The shared verdict:** the pixel art is close to Stardew quality, but places are **empty by day**, the castle is **dark at night**, and some walls **don't read as walls**.

## Fixed after the round (in 0.6.0)

- **People everywhere** (`x_crowds.js`):
  - Eight village folk walk the streets and plaza by day (Old Bertram, Nell, Tam, Rosie, Gil, Maud, Corin, Ada), each with their own lines.
  - Patrons sit at the tables and stand at the bar of the Drowsy Drake and of every town inn: two at lunch, up to seven in the evening.
  - Brann and Hale spend their evenings inside the tavern. They used to stand facing its wall.
- **Briarholt before you own it:** Old Jory the gate porter, Bess the laundress, Wat the groom and Kit the scullery maid keep the place. At night everyone except the guards and the porter goes indoors; Aldous and Wenna used to stand at the keep door until 2 am.
- **Briarholt at night:**
  - The keep's windows always light up; they were one of the 15% of "asleep" households. Inns do too.
  - Torches stand by the keep door and inside the gate.
  - Indoors, candelabras, fireplaces and lamps glow.
- **The keep's walls between rooms** are dark stone coping with block joints instead of black voids.
- **The ghost player:** the see-through copy is only drawn when something really overlaps you. Before, any tall object within two tiles below triggered it, which made the player look pale.
- **The tracker label** shows for 4 s when the target changes and for a moment when you stop, and no longer stays up while you stand.
- **Market vendors** stand beside their stall's counter, not up behind the awning.
- **Enter** only presses a window's button when the window has just that one main button and no list. In the sandbox, Enter had been selling goods.
- **The Kingdom test** starts with 30,000 gold, enough for the deed.

## Fixed in the second pass (0.6.1)
- **#1 and #2, walls:** castle and town walls are about 4 tiles tall, towers a head taller, and the gate a proper gatehouse with a tall arch. North-south runs have raised parapets and a wide cast shadow.
- **#3, cliff mazes:** every walled-off pocket is joined to the map, and thin ridges have regular 2-wide gaps.
- **#4, roads:** one clean Z-shaped road per route. Roads merge, and side paths branch off the nearest road, so the map shows a tree instead of a grid.
- **#5, town character:**
  - Greyhelm: a mine mouth, rails, carts, slag heaps and stony ground.
  - Ashford: log piles.
  - Saltmere: rowboats and fish-drying racks.

## Still open (ranked)

1. **Castle walls:** north-south curtain walls look like flat paths with no face or battlements. All walls are low (about 2.5 tiles), and the gate arch is barely taller than the player. Needs taller walls, a battlement edge on the north-south runs, and a real gatehouse.
2. **Town walls:** the same flat north-south runs. Kingsbridge's west gate is just a gap; the side gates need gatehouses.
3. **Cliff plateaus:** boxy mazes with no ramps west of Kingsbridge and around Greyhelm. The towns tester was walled in 8 times. Cliff tops are flat with no side walls, and the rock face tile repeats.
4. **Roads:** braids of parallel, stair-stepped strips. Each route needs one clean road.
5. **Each town its own character:**
   - Greyhelm: a mine mouth, rails, carts and slag, and stony ground.
   - Ashford: sawdust and log piles.
   - Saltmere: nets and boats.
   - All towns: a wall style per town, different market stalls, animals, carts and clutter.
6. **Smooth text in the pixel world:** world labels, floating numbers and the tracker arrow are anti-aliased. Labels overlap, for example at Kingsbridge's north gate.
7. **UI widgets:** browser-default sliders, scrollbars and dropdowns in Options and the passive tree, gradient badges on the Skills page, and rounded buttons.
8. **Ground tiling:** the 64x64 repeats are visible (dirt blotches, meadow flowers); the Kingsbridge plaza reads as mud; the village cobbles are busy.
9. **Under-detailed sprites:**
   - one bowl icon shared by about 25 dishes;
   - grey-box stone furnace, smelter and oil press;
   - flat side-gable roofs;
   - the greenhouse ruin, which reads as a checkerboard and glows electric blue at night;
   - the plank bridge;
   - plate armour seen from the side.
10. **Castle rooms:** big and bare (the solar and bedchamber). The great hearth is a small stove, there's one portrait design, the fountain is the village one, and the cellars are as bright as the throne room. The player can stand on north wall faces in the kitchen and cellars.
11. **Clipping:**
    - the player inside town walls and towers, and wedged at Greyhelm's south gate;
    - townsfolk stacked on one tile;
    - the priest overlapping the altar;
    - a stall touching a house roof;
    - a knight inside a campfire;
    - see-through wagon wheels.
12. **Home:**
    - the day-1 farm is flat with evenly spread debris, a tiny tent and a barely visible campfire;
    - tree-line borders are identical trees;
    - tilled soil has square edges;
    - thatch roofs are noisy;
    - the letter, report and creator windows are huge;
    - talk windows have no face portraits;
    - the "click ×5 again" confirm sits where the next click lands.
