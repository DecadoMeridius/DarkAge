# Playtest round 3: art direction and atmosphere

Persona: pixel-art director and atmosphere critic. Kingdom test, played only through the harness (about 125 commands).
Route: farm (the herald's procession) → village → Wilds meadow → Kingsbridge (south gate, plaza, inn at noon, north gate) → Whisperwood → cliff plateaus → goblin camp with an ogre → evening forest → Greyhelm at dusk and night (walls, rails, mine mouth, the inn at 11 pm, the Longhouse) → slept at the Iron Kettle → Greyhelm at dawn → waystone → Kingsbridge plaza and town hall at 9 am.
Screenshots: `scratchpad/playtest/c4_01.png` to `c4_76.png`.
Not reached: Briarholt (the throne story had only just started; the herald left after his lines), a guild hall interior (I couldn't find one in Greyhelm or Kingsbridge; see Places), Ashford, Saltmere, bandits.

## Summary

| | Score | Why |
|---|---|---|
| Consistency | **7/10** | Buildings, trees, props, characters and interiors share one clear style: top-left light, cel shading, 1px selective outlines. What pulls it down: the north-south town walls, flat turf roofs, the cliff-plateau tops, two paving textures that don't belong together, and the HTML UI layer (soft round buttons, big smooth-font labels). |
| Beauty | **8/10** | The village and Kingsbridge read as a real painted town. The time-of-day grades (dawn pink, amber evening, blue night with lit windows) are lovely, and the goblin camp and the Greyhelm mine mouth are strong pieces. |
| Lived-in | **7/10** | Kingsbridge's plaza at 9 am is busy (vendors, walkers, guards on the wall walk, patrols on the road), and the Greyhelm inn at 11 pm is full, some patrons seated. Against that: every inn uses the same room, the Kingsbridge inn at noon had two people standing, Greyhelm's streets were empty at 6-8 am, and all four market stalls and several vendors are clones. |

## Style breaks, ranked

1. **North-south town walls read as a footpath, not a wall** (c4_23, c4_28, c4_33, c4_60, c4_62, c4_70). East-west walls are tall, with a crenellated walk and a lit face. North-south runs are a 1-tile column of grey blocks at ground level with no height, no face and no shadow line, so they look like a paved strip. The contact shadow to the east (pieces with no east neighbour) helps a little but doesn't make the wall look tall.
   *Fix:* draw N-S runs as a raised wall top: the wall walk with merlons on both edges, a 1-2 px lit west edge, a dark east lip, and an 8-16 px shadow band on the east ground. Or show the west/east face as a narrow side face, as cliffs do. Towers at the ends already do this well.

2. **Night window lights float on the wall walk** (c4_56, c4_57). At Greyhelm the lit-window squares of buildings behind the south wall are drawn on top of the battlements, as bright yellow squares in a row on the wall. The `nightLights` pass doesn't know the wall covers those windows.
   *Fix:* skip a window light when the window's tile is covered by a wall or tower sprite drawn later (an occlusion check against `cwall`/town-wall footprints), or draw lights before the wall layer.

3. **Turf roofs are flat green rectangles** (c4_58, c4_59, c4_69, c4_73). The Highmarch-style turf roof on side-gabled houses is a solid dark green rectangle with white speckles and one thin line. There's no ridge, no slope shading, no eaves edge and no sod overhang. In daylight it reads as a lawn or billiard table, at night as a hedge box. The front-gabled Longhouse version (c4_70) is far better because the gable gives it form.
   *Fix:* give the turf two planes (lit near slope, darker far slope), a ridge line, a ragged grassy fringe hanging over the fascia, tufts and a few flowers, and a brown sod edge where it meets the gable.

4. **Cliff-plateau tops look like pits** (c4_36, c4_39, c4_41, c4_51, c4_53). Large plateaus are a darker green than the meadow around them, covered in a regular scatter of the same pale stone flecks. Only south edges get a rock face; east and west edges are a 1px line. Darker plus flat reads as *sunken*. Small 2x1 or 3x1 cliff blocks look like planters or crates (c4_53, c4_54). I also walked onto the plateau and got stuck on its edge for a moment (c4_41).
   *Fix:* make cliff tops *lighter* than the surrounding ground (raised ground catches the top-left light), add the lit rim on the north/west edges and a dark lip on the south/east, vary the stones (clusters, sizes, some grass tufts), and give side edges a 3-4 px rock face. Merge tiny cliff blocks into neighbours or remove them.

5. **The paving textures clash** (c4_27, c4_32, c4_75). The Kingsbridge plaza uses a flat, low-contrast grey noise that looks blurred next to the crisp, outlined village cobbles beside it. The fountain sits on a mossy cobble patch that is a third texture. The seams are hard straight lines.
   *Fix:* use one cobble family for the plaza (the village cobble with a larger flagstone variant in the centre), and draw a kerb or border tile where the plaza meets the street.

6. **The UI layer is a different art style.**
   - **Labels:** the tracker label ("to Emberhollow Village", "Elias · 16 m") and the signpost labels ("Greyhelm ↑ · Ashford ←…") are big, smooth, outlined web text over the world. They overlap buildings (c4_15, c4_76), are on screen almost all the time and are the loudest thing in every shot.
   - **Windows:** dialogue, shop and waystone windows use rounded orange gradient buttons on flat parchment (c4_06, c4_67, c4_74). The inn window is mostly empty parchment.
   - **Damage numbers:** "+60g" and "+1 Hide" stack into "+3+60g g" (c4_49).

   *Fix:* use a pixel bitmap font at 1x art scale for in-world labels, half the size, and fade the tracker label after a few seconds (keep the arrow). Give buttons a hard-edged pixel bevel like the dock tiles. Stack loot popups vertically with a delay.

7. **The canopy fade turns things into ghosts** (c4_19, c4_47, c4_51). Under trees, the canopy becomes a blurry translucent blob. An ogre under a tree is drawn half transparent with a red outline, wolves under a canopy look like smoke, and the effect looks like alpha blending, not pixel art.
   *Fix:* use an ordered dither cut-out (a checkerboard of the canopy pixels) in a circle around the player instead of global alpha, and don't fade enemies; draw their silhouette outline only.

8. **Clones.**
   - **Stalls:** all four Kingsbridge stalls are the same red-white awning with the same produce row (c4_27, c4_75).
   - **Vendors:** two vendors share the grey-haired apron look (c4_26).
   - **Inns:** the inn interiors in Kingsbridge and Greyhelm are the same room: bottles, two barrels, fireplace, one table on a rug (c4_29, c4_65).
   - **Signs:** the Greyhelm Longhouse (town hall) has a *mug* sign, so it reads as a tavern (c4_63).

   *Fix:* use 3-4 stall variants (fish on ice, cloth bolts, pots, bread) and an awning colour per stall. Give each town's inn a variant: Greyhelm a stone hearth hall with long tables and mining lamps, Kingsbridge a two-room inn with booths. Give the town hall a crest or scroll sign.

9. **Smaller issues.**
   - **The procession:** the "riders in purple and gold" walk on foot, and no horses or wagons appeared on the farm (c4_04, c4_05).
   - **The greenhouse ruin:** its cracked glass is a noisy checker of dark squares and reads as a pattern, not breakage (c4_02).
   - **The rails:** the horizontal track at Greyhelm stops against the vertical one with no curve or switch (c4_60, c4_69).
   - **The town hall:** its portico pediment cuts across the upper window row (c4_76).
   - **The Longhouse interior:** a mining town's hall has potted palms and a polished plank floor (c4_72); stone flags, a long table, banners and an ore display would fit better.

## New pieces judged

- **Goblins (c4_44-c4_49):** good. The hunched green silhouette with ears and a spear reads at a glance, and the wind-up wedge plus "!" is clear. Goblins are slightly small and low-contrast against forest grass: add a darker outline on the ground side or a dull red loincloth or bone accent for separation.
- **Ogre (c4_47, c4_48):** the weakest of the new creatures. It's a blocky, boxy green slab with little internal shading or anatomy (belly, tusks and club barely read), and under a canopy it turns into a translucent ghost. It needs a hand-drawn pass like the Pale Lich: a pot belly lit top-left, a heavy brow, tusks, a loincloth, a big club with a highlight, and a hard ground shadow.
- **Goblin shacks and camp (c4_47, c4_50):** one of the best new pieces. Hide-and-plank huts with a ragged thatch cone, a dark doorway and red trim, a dirt clearing with a dithered edge, a cooking fire on a spit, a carved lookout or totem with a goblin on it, and a loot chest. To make it feel inhabited: bedrolls, bone piles, drying hides, a crude palisade segment, and smoke from the fire.
- **Guild halls:** not found. The Greyhelm "Hall" on the map is the Longhouse (Chief Halvard, town jobs), Kingsbridge's "Hall" is the town hall, and no guild sign or interior showed up on my route. If guild halls exist, they need a sign icon (pick, bow, fish, sheaf) and a map label.
- **Bandits:** not met (the patrols I saw were the regent's knights). The knight patrols themselves look good: purple tabards, bucket helms, a plumed captain, and they read as a unit on the road at dusk (c4_54, c4_56).

## Places

- **Farm (c4_02-c4_09):** charming start. The tent, workbench, campfire and crate are clean. The procession knights (helms, purple surcoats, a gold plumed leader) look smart, but side-view helmets look like socks (c4_09). The farm is otherwise empty grass; that's fine for a new game.
- **Village (c4_10-c4_17):** the most finished place. Timber-frame cottages, slate and tile roofs, signs, flower boxes, a fountain and a well. People walk the plaza. The cobble plaza is busy but consistent.
- **Wilds meadow and forest (c4_19-c4_23, c4_35, c4_38, c4_43-c4_44, c4_51-c4_52):** lush and painterly. Biome title cards ("WHISPERWOOD") are a nice touch. The forest is so dense and repetitive (birch, oak, pine on a 1-2 tile grid) that pathing jams and the eye has no landmark. Add clearings, fallen logs and streams.
- **Cliffs:** see break 4.
- **Kingsbridge (c4_24-c4_34, c4_75-c4_76):**
  - **What improved:** the south and north gatehouses (twin round towers with conical roofs and a portcullis arch), the tall crenellated east-west walls with guards on the walk, joined corners, and only north and south gates.
  - **The gate arch** is narrow and sits low between the towers. A gatehouse block bridging the towers over the arch would give it mass.
  - **The town** is a real city: the plaza with its fountain, benches, rune stone and four stalls, a town hall with a portico and knight statues, a green-roofed emporium with a shop window, and many citizens at 9 am.
  - **Weak points:** the N-S walls, the plaza paving, and grass inside the walls behind houses, which feels rural for a capital.
- **Inns:**
  - **Kingsbridge at noon (c4_29, c4_30):** two patrons standing; nothing changed when 12:00 came.
  - **Greyhelm Iron Kettle at 11 pm (c4_65):** busy, eight people, two seated at stools, warm fire. This is the mood to aim for.
  - **Both:** the same room, and a small one.
- **Greyhelm (c4_56-c4_73):**
  - **At night:** atmospheric in the blue grade, with lit windows, lamp flames, mine carts on rails, coal heaps and the mine mouth (a timber-framed adit in a rock mound, with rails running in) as the best prop set in the game.
  - **By day:** the dawn grade is lovely. The streets were empty from 6 to 8:30 am apart from one walker, and turf roofs dominate (break 3).
- **Briarholt:** not reached.

## The bar (the best pieces, to match everything else to)

1. The Kingsbridge town hall facade with its portico and knight statues (c4_76).
2. The village's timber-frame and stone tavern, the Drowsy Drake (c4_14).
3. The Greyhelm mine mouth with rails and ore carts (c4_60, c4_69).
4. The goblin camp: shacks, spit fire, lookout (c4_47).
5. The Iron Kettle at night, full of people (c4_65).
6. The evening and night grades over the forest and Greyhelm (c4_52, c4_57).

## Top 5 fixes

1. Give north-south town walls height: a wall-walk top, a lit edge, a dark lip and a cast shadow (break 1).
2. Hide window lights that a wall covers (break 2).
3. Redraw turf roofs with two slopes, a ridge and a grassy fringe; make cliff tops lighter than the ground with lit rims, and remove tiny cliff blocks (breaks 3-4).
4. Restyle in-world labels in a small pixel font and fade the tracker label after a few seconds; fix the stacked loot text (break 6).
5. Variety pass: a hand-drawn ogre, stall variants, a second inn layout, a Longhouse sign and a mining-hall interior, and wagons and horses for the procession (breaks 8-9, ogre).

## `errors` output

```
None
```
No JS errors during the whole session.
