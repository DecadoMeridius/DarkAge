# Art & atmosphere playtest: realm towns and the Wilds

Persona: an art and atmosphere critic. I played only through the harness (mouse and keyboard). I started from "Kingdom test", left by the farm's north exit and played from 6:00 am to about 1:40 am on Day 1 (Spring).
Screenshots are `a2_<n>.png` in the playtest scratchpad (`.../scratchpad/playtest/`).

**Coverage:** I covered Kingsbridge well, including the temple, bank and inn interiors, and Greyhelm well, by day, at dusk and at night.
**I did not reach Ashford or Saltmere.** Getting between towns over land took most of my ~120 commands. I got stuck in cliff mazes, wedged against walls and guards, and lost in dense forest at night. I ended about 40 map pixels from Ashford. That failure is a finding in itself; see "The world between towns".

## Summary

| Town | Alive | Distinct | Notes |
|---|---|---|---|
| Kingsbridge | **7/10** | **6/10** | Busy plaza with fountain, stalls, vendors, walkers and guards. Gorgeous north gate. Away from the plaza it is rows of the same three houses on lawns. |
| Greyhelm | **5/10** | **4/10** | Turf roofs and a stone palette help. Otherwise it is a smaller copy of Kingsbridge (same walls, same gate, same houses), and nothing says "mining town". |
| Ashford | not reached | – | – |
| Saltmere | not reached | – | – |

The building and character art is good: crisp, consistent and warm. The places do not yet feel distinct. Both walled towns are "wall + gate towers + 4 lamps + grid of houses on grass". The capital earns its feel from the plaza alone. Between towns, roads are a tangle of parallel, stair-stepped strips, and the cliff plateaus are a maze. The world reads as procedural rather than travelled.

## Populated?

### Kingsbridge (a2_16 to a2_36)
- **Seen:**
  - Market vendors behind 3–4 striped stalls.
  - 6–10 walking townsfolk in varied outfits: a priestess in a purple robe, a monk, apron-wearers, a red-haired woman.
  - Paired gate guards (purple tabards) at every gate.
  - A guard in the streets.
  - A knight patrol (red-plumed leader + 2) just outside the west gate (a2_34). It is the best "world" moment of the session.
  - Lamp posts, benches, a fountain with spray and a waystone.
- **Interiors:**
  - Temple (a2_23): lovely stained glass, candelabras, a purple runner and the priest.
  - Bank (a2_24): banner, armour stands and a counter.
  - Inn (a2_33): bottle shelves, barrels, a fireplace, a table on a rug and a barkeep.
- **Missing:**
  - **Patrons in the inn.** At 12:20 pm the capital's inn had only the barkeep.
  - Carts, horses, dogs, cats, chickens and pigeons. I saw no animal at all in town.
  - Crates and barrels by shops, washing lines, flower boxes on houses, gardens and fences around the lawns.
  - The barracks (a2_31) is a plain stone house with two banners. It has no training yard, dummies or weapon rack, though Briarholt already has those sprites.
  - No street sounds or smoke. I did not see chimney smoke on houses in daylight.
  - Most of the town outside the plaza is grass lawns between houses. It reads like a suburb, not a dense walled capital.

### Greyhelm (a2_48 to a2_63)
- **Seen:**
  - 6 townsfolk, many in wide-brimmed hats (nice touch), at 5 pm.
  - Gate guards in brown, distinct from Kingsbridge's purple (good).
  - A well with a roof, crates, a barrel, a coal pile by the forge, lit lamps at dusk and a waystone.
  - Turf-roofed stone houses (a2_49).
- **Missing:**
  - **Anything that says mining:** no mine mouth, ore carts, rails, slag heap, scaffolding or pickaxes leaning on walls. The ground is the same grass as everywhere else; Greyhelm should be grey (gravel, rock and stone paving).
  - The forge (a2_53) has no outdoor anvil, glowing hearth or smoke.
  - The longhouse and hall are indistinct.
  - At night (a2_60, a2_62) the streets were completely empty. Windows were lit, but nobody was out: no night watch with a lantern and no tavern spill.

## Art consistency and beauty

### Lovely
- **Kingsbridge north gate (a2_20):** twin round towers with conical slate roofs and flags, a portcullis arch and crenellated walls. Storybook quality.
- **Building variety in Kingsbridge** (a2_16 to a2_18):
  - a half-timbered inn with dormers;
  - a green-roofed shop with an awning and a display window;
  - brick and plaster houses with shutters;
  - a temple and hall with columned porticoes (a2_22).
- **Interiors:** the temple's stained glass (a2_23) and the inn's fireplace and bottle wall (a2_33) are warm and readable.
- **Time of day:** the dusk amber grade over Greyhelm (a2_56, a2_57) and the night grade with lit windows (a2_60) are beautiful and stay pixel-crisp.
- **Wilds foliage** (a2_7, a2_9): the trees, flowers and grass tufts are rich. The early meadow is very pretty.

### Off-style, repetitive or broken
1. **The N–S town walls are flat grey strips** (a2_29, a2_31, a2_35, a2_51). The E–W walls have a battlemented face, but the west and east walls are a one-tile band with no height, shadow or crenellation, so they read as paving.
   - The **west gate of Kingsbridge** (a2_34 to a2_36) is just a gap in that strip: no towers and no arch.
2. **Copy-paste towns.** Greyhelm's walls, towers and gate are identical to Kingsbridge's (a2_48 vs a2_20). The houses are the same 3 sprites with different roofs.
   - All 4–6 Kingsbridge market stalls are the same red-and-white awning with the same produce row (a2_21).
3. **Interiors reuse props:** the temple and the bank share the same chequered floor, gold candelabras and potted ferns (a2_23 vs a2_24).
   - The inn interior is small for a building with six upper windows. A two-storey exterior opens into one small room.
4. **Clipping and sorting:**
   - The player is drawn inside or over wall towers and wall segments (a2_29, a2_34, a2_57, a2_61, a2_62). He stands "in" the battlement, with the see-through outline on.
   - The player overlaps gate guards (a2_20, a2_50).
   - Two townsfolk stood stacked on the same spot at the Greyhelm gate (a2_50).
   - The priest stands overlapping the altar (a2_23).
5. **A market stall butts straight against a house roof** (a2_18). Stall placement ignores the buildings around it.
6. **Plaza ground** (a2_17, a2_21) is a flat grey-brown fill with no pattern, beside richly textured cobbles. It looks unfinished next to them.
7. **The "to Hollowmere Farm" tracker label** floated over my head all day (from the herald story) and covered the scenery in nearly every screenshot. An atmosphere player will want to hide it.
8. **A tooltip stayed stuck on screen** (the "Guard" ability, a2_69 to a2_70) while the mouse rested over the ability bar.

## The world between towns
- **Roads are a tangle** (a2_11 to a2_15, a2_41, and the map in a2_5 and a2_46):
  - Several parallel strips run side by side, with stair-stepped turns and 3–4 lane-wide junctions.
  - On the Wilds map the road network looks like circuit-board traces: dozens of parallel lines.
  - In game it feels like dirt fields, not one road with a direction.
- **Bridges:**
  - A staggered two-piece plank bridge (a2_71).
  - Huge plank platforms covering whole ponds (a2_13, a2_15, a2_35).
- **Signposts** have blank boards; the text floats above them (a2_11, a2_34). The crossroads waystone plus sign is a good landmark, though.
- **Cliff plateaus west of Kingsbridge and around Greyhelm** (a2_37 to a2_45, a2_64 to a2_68) are rectilinear mazes:
  - Box-shaped raised blocks with 1-tile gaps, and vast dark-green featureless tops.
  - Roads pass between them without ramps.
  - I was stuck or walled in about 8 times. This is the single biggest thing that stopped me seeing the realm.
- **Life on the road:**
  - Only one knight patrol (a2_34). No travellers, merchants' carts, pilgrims or wagons.
  - At night: a level-19 bandit just outside Greyhelm (a2_65, a2_66) and a cluster of 7 slimes right at its south gate (a2_63). That contradicts the "safe ring" feeling.
- **Dense forest at night** (a2_72, a2_74) is pretty but a wall: canopies overlap so tightly that I could barely move.

## Concrete ideas per town (ranked)

### Kingsbridge
1. Fill the lawns: cobble the whole intramural area, or add fenced gardens, washing lines, wells, hand carts, crates, hay and a stable yard.
2. Give the N–S walls a real face and give the west and east gates the twin-tower arch of the north gate.
3. Add a barracks yard with dummies, a weapon rack and drilling knights (reuse Briarholt's `dummy`, `target`, `rack`).
4. Put patrons in the inn (2–4 sitting at tables at lunch and in the evening) and a bard.
5. Vary the market stalls: fish, cloth, pottery, meat on hooks, flowers, and blue, green and yellow awnings.
6. Add animals: pigeons in the plaza, a stray dog, a cat on a wall, a horse tied by the inn.
7. Make the temple exterior read as a temple: a bell tower or spire and a rose window.

### Greyhelm
1. A mine mouth in the town wall or just outside, with rails, ore carts, a winch and a slag heap.
2. Grey ground: gravel and stone paving instead of grass, plus soot near the forge.
3. Forge yard: an outdoor anvil, a glowing hearth (night light), a smoking chimney and a quench barrel.
4. Its own wall style: rough fieldstone or timber palisade on a stone base, not the Kingsbridge ashlar.
5. Miners in helmets with lanterns walking at dawn and dusk shift changes. A night watchman with a lantern.

### Ashford and Saltmere (not reached)
From the design I would expect:
- **Ashford:** log piles, a sawpit, a working saw mill and cut stumps.
- **Saltmere:** nets on racks, gulls, boats at the pier and a fish-drying line.

Please verify that these exist; I could not.

### Between towns
1. One clean road per route: a single 2–3 tile lane, curves instead of stairs, one bridge per crossing.
2. Cliff ramps or stairs where roads meet plateaus, and break up the boxy plateau shapes.
3. Travellers: a merchant cart with a horse, a peddler, pilgrims, a shepherd with sheep. Wayside shrines, milestones and inns.
4. Carved signposts with arrows on the board, not blank boards with floating text.

## Top 5 fixes
1. **The cliff-maze terrain in the Wilds** (west and around Greyhelm). It blocks travel and looks boxy. Add ramps, smooth the shapes, and keep plateaus off the road corridors.
2. **Roads:** collapse the braided parallel strips into one clear road per route, with sane bridges.
3. **Make towns distinct:** a wall style, ground material, signature landmark and props per town. Greyhelm today is a mini-Kingsbridge.
4. **The N–S wall face and the side gates:** give them height, crenellation and gatehouses. Fix the player being drawn inside walls, towers and guards.
5. **Fill the empty lawns and interiors:** clutter, gardens, animals and inn patrons. Then the towns feel lived in at every hour, not only in the plaza.

## `errors` output
```
none
```
(No JS errors over the whole session; checked twice.)
