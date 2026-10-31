# Art and feel playtest, round 2 (0.6.1): findings

Four testers played 0.6.1. Their reports are in this folder: `castle_warrens.md`, `towns.md`, `home.md` and `consistency.md`.

## Scores (round 1 → round 2)

| Tester | Round 1 | Round 2 |
|---|---|---|
| Castle | 5.5 | 7.5 |
| Warrens (new) | — | 4.5 |
| Greyhelm, alive / distinct | 5 / 4 | 7 / 8 |
| Kingsbridge, alive / distinct | 7 / 6 | 5 / 7 (seen only at night and in rain) |
| Ashford, alive / distinct | — | 7 / 8 |
| Home | 6 | 7 |
| Consistency | 6.5 | 7 |
| Beauty | 7.5 | 7.5 |

## Fixed after the round (0.7.0)

- **Walls and towers:** walls join towers and gates with no gaps, and tower drums fill both tiles.
- **Kingsbridge's side gates** are gone. A gap in a tall north-south wall can't read: the wall south of the gap was drawn over the passage.
- **Guards' swords** hide when the guard is behind a tower, wall or building.
- **Night window glow** skips windows that someone stands in front of.
- **Village folk** greet you with their own lines instead of "undefined". Brann and Hale chat in the tavern instead of opening their shops.

## Still open (ranked)

1. **The Warrens look like the mine:** they need their own tunnel tileset, gnawed walls and nests, a broken-floor hole (it reads as a manhole), and a local map. Rats also spawn at the arrival ladder.
2. **Pixel text and overlays:** world labels, sign text, the tracker arrow and the rain are smooth and anti-aliased.
3. **UI widgets:** browser sliders, scrollbars and dropdown chevrons; the map has three nested scrollbars.
4. **North-south walls** still read as paths (crenels on one side only). Castle and town walls need visible sides.
5. **Cliffs:** a single repeating face tile, flat plateaus and stair-step shapes.
6. **Inns:**
   - every inn uses the same room;
   - patrons block the counter;
   - patrons stand instead of sitting;
   - the lunch crowd is thin;
   - windows show daylight at night;
   - the Ashford keeper is missing at night.
7. **Waystones:** the Ashford one wouldn't open; they should open from any neighbouring tile.
8. **Gates:** Ashford's west gate is a dead end. The castle's only gate is far from the farm road.
9. **Staging:**
   - rail joins, and carts sitting off the rails;
   - slag heaps read as puddles;
   - the log pile blocks the Ashford tavern door;
   - Greyhelm's south roofs have no fronts;
   - the throne isn't solid and has no seated pose.
10. **Food icons:** about 20 dishes still share one bowl icon.
