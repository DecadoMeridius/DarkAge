# Art & atmosphere, round 2: Briarholt and the Warrens

Persona: art and atmosphere critic. Played only through the harness: Kingdom test, port 9301, about 140 commands.
Screenshots are `b1_<n>.png` in the playtest scratchpad folder.

Route: the herald on the farm, then Elias, then Ashcombe. Next the south-east gap, the castle grounds, the keep, the kitchen stove and Isolde. Then back to Ashcombe to pay 30,000g, then Isolde again (the throne, 6:40 pm). After that the entrance hall, the stair down, the Wine Cellar and the hole into Warrens floors 1 and 2.

I collapsed at 2 am on Warrens floor 2 while looking for the hole down. I went back the next morning, but the Warrens had been rebuilt with a new layout and I was over budget. **I never reached floor 3 or the Rat King**, so the Rat King has no grade in this report.

## Summary

| | Score | Last round |
|---|---|---|
| Royal castle (day and dusk) | **7.5 / 10** | 5.5 |
| The Warrens (floors 1-2) | **4.5 / 10** | n/a |

Briarholt now reads as a castle from the front. The south curtain wall is a big improvement: tall, crenellated, with a twin-towered gatehouse and an arched portcullis (b1_26, b1_42). So are the keep façade (banners, ivy, a machicolated gatehouse) and the lived-in grounds (guards, steward, maids, gardener, lit lanterns at golden hour, b1_53).

The Warrens are a reskin of the earth mine. Same dirt floor, same brick-capped rock pillars, same boulders, same round ladder hole. Nothing on screen says "rat tunnels under a castle". The vermin read well, though.

## What improved since last round

- **The south walls and the gatehouse are real walls now.** They have a crenellated wall-walk, a face about twice as tall, two round towers with slate cones and pennants, and a stone arch with a portcullis edge (b1_26, b1_42, b1_51). The contact with the grass is clean.
- **The keep façade is the best building in the game.** It has arched windows with flower boxes, purple stag banners, a crest over the door, a machicolated gate tower, a corner tower with ivy, and lamp posts and banner poles framing the approach (b1_28, b1_53).
- **The grounds are lived in.**
  - Before purchase: a gardener in the beds, Aldous the steward on the plaza, a maid and a laundress (b1_27, b1_40, b1_52).
  - After purchase: two halberd guards at the keep door (b1_53) and two throne guards (b1_54).
  - The dummies, archery targets, hay, pavilion and statue in the training yard give the north side purpose (b1_41).
- **Dusk works.** At 6:20 pm the lantern posts are lit and the warm grade is pleasant (b1_53). The grade stays flat and doesn't muddy the pixels.
- **Interiors.**
  - The dark stone wall tops between rooms clearly separate kitchen, hall and corridors (b1_32, b1_33).
  - The great hall has laid tables with roasts, benches, armour stands, banners and a hearth (b1_30, b1_31).
  - The throne room has a tapestry of the castle, candelabras, armour, a dais with steps and a purple runner (b1_36, b1_54).
  - The wine cellar has wine racks, barrels and a stair with a purple runner (b1_59).
- **Writing.** The throne's "Sit" line got a smile: "You sit on the throne of Briarholt. It is very uncomfortable…" (b1_55).

## What's still off (castle)

1. **Guards behind the gate towers show floating swords.** Two swords hang in mid-air on the gatehouse tower faces. The guards' bodies are hidden by the towers, but their held weapons are drawn on top (b1_50, b1_51, b1_83). In b1_83 a guard's head also pokes out above the tower roof. This is the most visible art bug at the castle's front door.
2. **North-south walls still read as flat grey strips.**
   - The west and east curtain walls are two tiles of top-down paving with no face, no crenellations and no shadow (b1_22, b1_25, b1_27, b1_43).
   - Next to the tall south and north walls this is jarring. At the NW corner (b1_43) a tall tower and wall meet a ribbon of flagstones.
   - The east-side contact shadow from the CLAUDE.md notes isn't enough at this zoom.
3. **The way in from the farm is confusing.**
   - You enter on a road outside the west wall, and the tracker arrow pointed up-left, away from the castle (b1_22 to b1_25).
   - The only gate is on the far south side. RMB pathing walked me all the way round, about 40 s.
   - Each return trip (waystone outside the NW corner, then south, then round to the gate, then north across the whole courtyard) took about 6 commands.
   - Fix: a postern gate in the west wall by the farm road, or a waystone inside the courtyard.
4. **The throne has no seated pose.** "Sit" leaves you standing in front of the throne (b1_55). You can also walk straight through the throne, because it isn't solid (b1_54). Approaching Isolde put me on the dais edge, overlapping her, with her "!" drawn over my chest (b1_37).
5. **Floors are loud.**
   - The cream and grey checkerboard marble is very high contrast and uses the same tile in every hall (entrance, great hall, throne room). It fights the furniture and characters (b1_29, b1_36).
   - A darker, lower-contrast marble for the throne room and flagstones for the entrance would give the rooms identity.
6. **The keep is empty before purchase.** At noon the great hall had no people (b1_31) and the kitchen had no scullery maid. I saw only the steward, gardener and maids outdoors. If the "old household" lives here, show the scullery maid at the stove and the porter at the door.
7. **Room labels collide with the tracker.** The "GREAT HALL" and "ENTRANCE HALL" banners overlap the tracker arrow and label (b1_30, b1_57).
8. **There is no bedchamber wake-up after a collapse.** I owned Briarholt and collapsed in the Warrens (under the keep), but woke at the farm tent (b1_82).
9. **Night is untested.** I didn't see full night above ground. I only saw dusk, at 6:20 to 6:50 pm with lanterns lit. The torches and lit windows at night still need a look.

## The Warrens

### Art and atmosphere: 4/10

- **It's the earth mine.** It has the same brown dirt texture with dark diamond dithering, the same rectangular rock blocks capped with brick courses, the same scattered grey boulders and the same round ladder-hole sprite (b1_60, b1_63, b1_66, b1_68).
  - It doesn't read as narrow rat tunnels or as old cellar foundations under a royal keep.
  - The space is a wide open field with pillar blocks, not tunnels.
  - The only nod to the theme is the hay or cheese blocks. They read as hay bales, so the "something has been eating the cheese" joke doesn't land.
- **The entrance hole doesn't look broken.** The flavour text says "broken floor", but the cellar shows a tidy round manhole with a ladder (b1_59). It needs cracked flagstones, rubble and a dark jagged gap.
- **No sense of depth or dread.**
  - The lighting is flat and the same brightness as a mine (fine per the no-lightmap rule).
  - There are no droppings, gnawed bones, nests of straw and rags, old masonry, sewer channels, roots or broken barrels from the cellar above.
  - Floor 2 looks identical to floor 1.
- **It doesn't tie to the castle.** Nothing says "under Briarholt": no old foundation arches, no fallen wine racks, no crypt stones.

### Vermin art: 6.5/10

- **Cellar rats** read as rats: grey-brown body, pink ears, a long pink curling tail, and a good side profile (b1_60, b1_63).
- **Plague rats** use a green recolour that reads as diseased at a glance (b1_68, b1_72).
- **Giant rats** are bigger and darker. The silhouette works, and the size step is clear (b1_70, b1_72).
- **Roaches** are dark brown ovals with feelers and read as beetles or roaches (b1_68, b1_71). They are small and low contrast against the brown floor, so in a melee they disappear under the player (b1_74).
- **General:** all four are brown or grey on a brown floor. Contrast is the main problem. A cooler, greyer floor would help, or a light rim on top edges.

### The fight: 6/10

- **What works:** the telegraphed wedge with "!" on the giant rat is clear (b1_72). Hit numbers, Cleave, Lunge and Focus all work, and the target frame names the enemy and its level ("Giant Rat (Level 23)", "Plague Rat (Level 18)").
- **Arrival ambushes:** on both floors rats spawn on the arrival ladder and hit you before the screen has settled (−5 on floor 1, b1_60; three enemies on floor 2, b1_68).
- **Clustering:** enemies pile directly under the player sprite, so you can't see what is hitting you (b1_74). Floor 2 drained 300 HP to 77 against one giant rat, one plague rat and two roaches with iron gear and combat 30. That is tough for "vermin" but fine as a challenge.
- **Enemies on solid blocks:** a giant rat stood on top of a rock-pillar block and wouldn't engage (b1_70). The player also walked along the top of a brick pillar row on floor 2 (b1_80).
- **Camera and HUD:**
  - The camera clamps at map edges, so the player arrives at x ≈ 1390 under the right-hand menu dock (b1_68, b1_86).
  - On floor 2 the hole down sat exactly under the Options button (b1_80), and I clicked the button instead of the hole.
- **No floor map:** M opened the Wilds map, and "Back to the map of The Warrens" didn't switch back (b1_62, b1_76). With no way to see the floor layout and a 2 am collapse, finding the hole down was the hardest part of the dungeon.
- **Rebuild on re-entry:** the Warrens were regenerated after the collapse, which cost all progress. With no floor selector I had to start from floor 1 again.

### Rat King

Not reached (see above). I can't judge whether it is impressive.

## Concrete ideas, ranked

1. **A Warrens tileset of its own.**
   - Narrow winding tunnels (1-3 tiles wide) carved into packed earth with root tangles.
   - Patches of old castle masonry (arched brick, broken flagstones) on floor 1, turning to raw earth and sewer channels deeper down.
   - Nests of straw and rags, gnawed bones, droppings, and gnawed cheese rinds as props (not hay blocks).
   - A cooler grey-brown floor so the brown rats pop.
2. **A broken-floor hole in the cellar:** a jagged dark gap, cracked flagstones radiating out, rubble and a fallen barrel, and a rope instead of a tidy ladder hole.
3. **A floor map for the Warrens** (fix the M toggle), and keep the hole down out of the right-hand HUD column. At least nudge the camera so the player is never under the dock.
4. **Give the north-south curtain walls a readable side.** A 1-tile lit inner face, crenellation nubs along both edges, a dark outer drop shadow, and towers at the midpoints.
5. **Fix the floating swords:** draw held weapons in the same depth pass as their owner, so they occlude together.
6. **A west postern gate by the farm road, or a waystone in the courtyard.**
7. **A seated throne pose, and make the throne solid.** Use the `ride` sit pose, drawn in front of the throne back.
8. **Varied keep floors:** dark veined marble for the throne room, flagstones for the entrance and corridors, the checkerboard only for the great hall.
9. **Rat King presentation:** a throne of junk, a crown of bottle caps or a ring of knotted tails, minions spilling from holes, and a boss intro card. I can't verify any of this; it is a wish.
10. **Keep a "deepest Warrens floor reached"** so a collapse doesn't force a restart from floor 1, the way regional dungeons let you pick floors 3 and 5.

## Top 5 fixes

1. **The Warrens look like the earth mine.** Give them their own tunnel tileset and props, and use a cooler floor for contrast (b1_60, b1_68).
2. **Floating guard swords on the gatehouse towers** (b1_51, b1_83).
3. **North-south walls are flat paving strips** next to tall walls (b1_43, b1_27).
4. **Warrens navigation:** no floor map (M shows the Wilds), the hole down can sit under the HUD dock, ambush spawns land on the arrival ladder, and the floors regenerate after a collapse (b1_76, b1_80, b1_68).
5. **The castle approach and the throne.** Add a postern or courtyard waystone. Make the throne solid with a seated pose, and stop the player overlapping Isolde on the dais (b1_22, b1_37, b1_55).

## errors output

```
None
```
(No JS errors during the whole session.)
