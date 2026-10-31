# Art direction: consistency audit, round 2

Persona: pixel-art director. Played through the harness only (port 9304, Kingdom test), about 125 commands.
Route: farm (dawn and rain) -> village -> waystone -> the Wilds meadow -> Kingsbridge (plaza, west gate) -> highlands cliffs -> Greyhelm (mine, rails, walls, inn) from day to night -> forest at night -> Ashford at night (collapsed at 2 am, woke on the farm) -> farm in the rain -> Kingsbridge west gate again -> UI (Items, Encyclopedia, Options, Map, Passive tree).
Screenshots are `b4_<n>.png`, zoomed crops are `z<n>.png`, all in the playtest scratchpad.

## Summary

| | Round 1 | Round 2 |
|---|---|---|
| Consistency | 6.5 | **7** |
| Beauty | 7.5 | **7.5** |

The world sprites are now one coherent style. That covers trees, the hand-drawn props, the fountain, inn interiors, the knights, the town houses and the Greyhelm north gatehouse. The night grade with flat lit windows reads really well (b4_33, b4_35, b4_45). What still breaks the style:

1. Overlay drawing that isn't pixel art: the tracker, world labels, rain streaks and alpha fades.
2. A few world pieces that lose their 3D reading: cliffs, the north-south town walls and turf roofs.
3. A handful of staging slips.

Consistency goes up half a point because vendors now stand beside their stalls and the new props match the house style. It doesn't go up more because most of last round's top breaks are still there.

## Fixed since last round

- **Vendors beside stalls:** fixed. Kingsbridge stallholders stand to the side of their stalls (b4_18, z9).
- **Tall walls with parapets:** done well on east-west runs. Greyhelm's north wall has a tall cream ashlar face, a crenellated wall-walk and a round tower with a slate cone and pennant (b4_31). The Greyhelm north gate, two towers and an arch, is the best architecture in the game (b4_38).
- **Lit windows at night:** they work. They are flat warm panes with mullions, one grade, no glow blur (b4_33, b4_35, z16). Lamp posts light as flat squares.
- **Indoor glow:** the inn hearth and table lamps read warm without a gradient (b4_34, z18).
- **Passive tree:** drawn in crisp pixel blocks with pixel connecting lines (z22). This is good.
- **Dropdowns:** half fixed. The frame is now themed wood, but the native OS chevron is still inside it (z23).

## Not fixed from last round

- The tracker arrow and its "Royal Herald · 5 m" label are anti-aliased vector shapes in Fredoka (z1, z20).
- World labels and signpost text are still smooth (b4_15, b4_19, b4_51).
- Sliders are browser defaults: an orange accent track with a round thumb (z3).
- Scrollbars are default Chrome grey, and the map nests two or three of them (z4, b4_16).
- Food icons: about 20 of the 35 dishes still share one steaming-bowl icon (b4_8).
- Cliff plateaus are flat, and the cliff face is one 32px tile repeated with seams (z11).
- Wagon wheels are still see-through: grass shows through the upper spokes where the wagon bed should be (z6).
- The furnace and the grey-box stations weren't checked this round.

## Style breaks still there (ranked)

1. **Smooth overlay drawing (tracker, labels, rain).**
   - Where: the tracker arrow and label (z1, z20), signpost labels ("Greyhelm ↑ · Ashford ←…", b4_19), area labels and "Old Mine: north…" (b4_15).
   - Rain is new and makes it worse: soft, semi-transparent anti-aliased streaks (z19).
   - These sit on top of perfect pixel art and they're on screen all the time.
   - Fix:
     - Draw the arrow as a hand-pixelled sprite (an `ui_arrow` grid with 8 rotations, or rotate in 45° steps with nearest).
     - Render world text with a bitmap pixel font at an integer scale, snapped to the art grid. Or bake labels to an offscreen canvas at 1 art px and scale up with smoothing off.
     - Draw rain as 1×3 art-px opaque dashes on the grid, in one or two palette colours.
2. **Wall runs that cross roads with no gate (Kingsbridge west gate).**
   - The north-south wall is drawn straight across the cobbled road. You walk through it, and the player vanishes under it (b4_19, b4_20, z10).
   - A narrow crenellated segment is also stacked over the wider tower with no join.
   - Greyhelm's east wall overlaps the bottom of its round tower, in a different stone palette: grey wall against a cream tower (z15).
   - Fix:
     - Stamp a `cgate`-style arch or an open gap with gateposts wherever a road crosses a wall run.
     - Let wall masks end at a tower instead of drawing through it.
     - Use one stone ramp for walls and towers per town.
3. **North-south walls read as paths.**
   - Seen from above they're a strip of brick-face texture, with crenels on one edge only (z14).
   - There's no east cast shadow, though CLAUDE.md says pieces with no east neighbour cast one; I couldn't see it in Greyhelm or Kingsbridge.
   - East-west walls have no contact shadow at their foot either (b4_31).
   - Fix:
     - Give the walk a top-surface texture (flags) instead of a face texture.
     - Draw crenels on both sides.
     - Add a 4-6 art px hard shadow band on the east side and a 2 px dark lip at the foot of the faces.
4. **Cliffs still flat and tiled.**
   - The face is one 32px block repeated, with dark vertical seams every tile. It reads as a dry-stone wall, not rock (z11, b4_21, b4_25).
   - Plateau tops are the same grass, a shade darker, with scattered flat stones. A large highland plateau reads as a dark carpet (b4_37).
   - Fix:
     - Use 3-4 face variants picked by hash, with no seam column, plus a taller face (two rows) where the drop is bigger.
     - Break up the lit top rim.
     - Add an occasional boulder or crack on the tops.
5. **Turf roofs (Greyhelm) are a flat noise rectangle.**
   - A uniform speckled green with no slope shading, no ridge and no eave (b4_28, b4_32).
   - The cross-gable shows only as two bright green lines.
   - Fix: give turf a light near slope and a dark far slope, a thicker overhanging sod edge with a dark drip line, and tufts on the ridge.
6. **Browser-default widgets.**
   - Sliders (z3), scrollbars (z4; the map has three), and native select chevrons (z23).
   - The search inputs are plain white rounded boxes (b4_6, b4_7).
   - Fix: style range inputs with a pixel track and a square thumb, and scrollbars with `::-webkit-scrollbar` (a wood track and a square thumb). Use `appearance:none` and a pixel chevron on the selects.
7. **The Wilds/town map is a vector chart.**
   - It has smooth Fredoka labels that overlap ("Inn", "Shop", "Forge" pile up on Kingsbridge, b4_16 and b4_48) and anti-aliased dots on the farm map (b4_4).
   - Fix: a pixel font, labels that avoid each other (already done for the village map), and square pixel markers.
8. **Food icons.**
   - 20 or more dishes share the steaming bowl (b4_8).
   - Fix: about 8 more templates (pie, skewer, plate with a fillet, cake slice, jar, mug, roll, salad), assigned by ingredient.
9. **Alpha fades on pixel art.**
   - Canopy fade at 0.25, the ghost player behind buildings and trees, and NPC overlap all blend translucent pixel art. That produces muddy mid-tones (b4_13, b4_57).
   - A semi-transparent square floats in front of the hearth fire (z18).
   - Fix: dither the fade (a 50% checker of opaque pixels) instead of alpha, and drop the soft square at the hearth.
10. **Greenhouse ruin.**
    - Huge dark square "broken panes" in a regular checker. Saturated blue 1px lines run on the left edge and the ridge, outside the palette (z20).
    - Fix: smaller, irregular broken panes and a glass-edge colour from the frame ramp.
11. **The player's knight helm.**
    - From the front it's a grey box with a visor slit and dots. From the side it's a "bin" with no arm or shoulder break (z2, z8).
    - It's the most-seen sprite in this persona and the weakest.
    - Fix: rounded crown rows, a plume or crest channel, a darker gorget step, and a shoulder pauldron that breaks the silhouette.
12. **Slag heaps** read as flat puddles: a dark ellipse with orange flecks and no height (z13). Fix: a cone silhouette, a lit top-left, a darker base and a contact shadow.

## Staging slips

- Mine rails don't join: the north-south track stops above the east-west one with no junction (z13).
- Mine carts sit beside the rails, not on them (z13, b4_36).
- In Ashford a log pile blocks the tavern's front door (z21).
- In the Greyhelm inn:
  - the player can walk onto the back wall in front of the banner (b4_39);
  - the window shows a bright blue daytime sky at 8:30 pm (z18);
  - the chimney breast covers half of the painting (z18);
  - a patron sits on nothing behind the bench (z17).
- Two Kingsbridge townsfolk stand on the same spot (z9); the player and patrons also stack in the inn (b4_41, b4_42).
- On the farm, seven identical rocks sit in an evenly spaced row south of the camp (b4_2, b4_53). They look grid-placed.
- At the Kingsbridge west gate the cobble road ends in grass and doesn't meet the dirt road a few tiles west (b4_56).
- The farm notice "!" bubble is a flat orange square, not a speech bubble (b4_53).

## New pieces judged

| Piece | Verdict |
|---|---|
| Taller walls and towers (east-west) | Good. The tower cone roof, pennant and ashlar match the keep style; the Greyhelm north gatehouse is a highlight. They lose points for no foot shadow and for the palette clash with the north-south runs. |
| North-south wall runs | Weak. They read as a path, have no shadow, overlap towers and block gates. |
| Mine rails | Good. Clean ties and two-tone rails, but they don't join and the carts aren't on them. |
| Mine carts | Good. A small, readable silhouette, ore with an orange highlight, and wheels. |
| Slag heaps | Weak. Flat ellipses. |
| Log piles (Ashford) | OK. Round log ends with rings, but flat and badly placed. |
| Mine entrance mound | OK. Soft cel shading, a cut-off bottom edge with no ground blend, and the timber frame is nice. |
| Lit windows and night | Very good. Flat panes, one grade, and lamps as flat squares; it matches the rules. The windows could be a touch more amber than cream. |
| Inn interior | Very good overall: bottles, barrels, hearth, rug and banner. It has the staging slips listed above. |
| Vendors by stalls | Fixed. The stall goods are still plain coloured blocks. |
| Knights and procession | Good. Tier helmets with plumes, purple tabards, and the wagons and horses. The wheels are still see-through. |
| Rats, roaches and the Rat King | Not reached (Warrens). |
| Rowboats and fish racks | Not reached (Saltmere is far east; I collapsed on the way to Ashford at 2 am). |

## The bar

These pieces are the bar: the Greyhelm north gatehouse (b4_38), the Kingsbridge fountain (z8), the inn interior (b4_34), the knights (z19), the trees in every biome (b4_15, b4_47) and the night grade with lit windows (b4_35). They share:

- hand-placed clusters;
- three or four step ramps;
- a clear top-left light;
- dark selective outlines;
- hard shadows.

Everything listed above as weak falls short in one of two ways. Either it was made by a renderer instead of by hand (text, arrows, rain, alpha, sliders), or it is a repeated texture tile with no form (cliff faces, north-south walls, turf roofs, slag).

## Top 5 fixes

1. **Pixel overlay layer:** a bitmap font for every world label, signpost and the tracker; a hand-pixelled arrow sprite; rain as opaque 1×3 art-px dashes; dithered fades instead of alpha.
2. **Gates and wall joins:** stamp a gate wherever a road crosses a wall run, end runs at towers, use one stone ramp per town, and give north-south walls a top surface, crenels on both sides and an east cast shadow.
3. **Cliffs:** face variants without seams, a taller face for bigger drops, and broken rims with boulders on the plateaus.
4. **Themed widgets:** sliders, scrollbars, selects and search inputs; then the map's labels and markers in pixel form.
5. **Staging pass:**
   - put the rails' junctions in and the carts on the rails;
   - keep log piles and other props off door tiles;
   - make the inn back wall solid and give its windows a night variant;
   - move the painting clear of the chimney;
   - un-grid the farm rocks;
   - extend Kingsbridge's cobbles to meet the dirt road.

## `errors` output

```
None
```
