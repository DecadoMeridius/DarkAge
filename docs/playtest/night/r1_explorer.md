# Night playtest r1: the Explorer

Persona: explorer. Mode: Kingdom test (combat 30, iron gear, 23,000g). Port 9302, harness only, about 110 commands.
Screenshots are in the harness scratchpad as `s2_<n>.png`.

## Summary (where I went)
Mon. 1, 6:00 am to 11:30 pm in-game, about 20 real minutes.
- Farm, then north exit into the Wilds (6:40). Ancient Ruins, then a lake with plank piers.
- Reached **Kingsbridge** at 8:50 am, entering from the south-east (s2_21). Went into Garrick's Forge, the market/emporium and The Crowned Stag inn. Attuned the plaza waystone. Talked to Nell.
- Left by the west gate (signpost) and followed the road west through dense forest to **Ashford** (5:50 pm, s2_61). Went into the trading post (closed), knocked on a house, attuned the waystone and talked to the Village Watch.
- Waystone back to Kingsbridge, out of the north gate, across a lake bridge into the Greystone Highlands, and on to **Greyhelm** (11:00 pm, s2_78). Went into the Greyhelm inn.
- Not reached: **Saltmere** (far north-east, out of budget).

`errors` output, checked twice during the run and at the end: `none`.

## Bugs

1. **Town shop, inn and smithy menus never open (blocker for towns).**
   - **Where:** Kingsbridge Garrick's Forge (`in_kb_smith`, s2_29 to s2_32), Kingsbridge market (`in_kb_market`, s2_39 to s2_43), Kingsbridge inn The Crowned Stag (`in_kb_inn`, s2_48/49) and Greyhelm inn (`in_gh_inn`, s2_80).
   - **What I saw:** the prompt shows "E Shop", "E Talk" or "E Order" and the hint bar shows "RMB Shop"/"RMB Order". Pressing E, right-clicking the keeper or right-clicking the counter does nothing: no window, no toast, no JS error.
   - **Times:** 10:00 am to 1:50 pm, all inside opening hours. The Greyhelm inn was tried at 11:30 pm.
   - **The closed branch does work:** Ashford trading post at 6:40 pm says "Closed. Open 9 am to 6 pm." (s2_64). So the counter handler fires, and the open path (`storyTalk(...)` or `townMenu`) fails silently.
   - **Suspect:** `storyTalk(who || keeperOf(act))` in the `doorAction` wrapper (x_realm.js ~389) returns truthy without showing anything. The Kingdom test start has the herald story step active ("The royal herald has arrived. He waits by your door."). Worth checking first.
   - **Effect:** I could not buy, sell, eat, rest, use the bank, or reach the town hall or barracks jobs. The towns are scenery only.
2. **Player walks into and behind shop counters.** In the Kingsbridge market I walked straight around the counter and stood next to the keeper behind it (s2_39/40). In both inns and the market the player stands inside the counter sprite (s2_42, s2_48, s2_80). The counter isn't solid, or `counterNear` lets you path into it.
3. **Entering an inn spawns you on top of a table.** Kingsbridge and Greyhelm inns both put the player inside the centre table and stools (s2_47, s2_79).
4. **Walking out of a waystone jump gets you stuck.** After Ashford → Kingsbridge travel, I was placed overlapping the waystone. Holding W for 8 s didn't move me (s2_69); I had to step S and D first. Then I caught on a plaza bench.
5. **Signpost inside the Kingsbridge north gate blocks the gateway.**
   - The "Read" signpost sits in or just behind the gate arch, and the player stalled in the arch (s2_72). I got through only by sidestepping left.
   - Its floating label "Greyhelm ↑ · Ashford ⟵ · Saltmere ↗ · Emberhollow ↙" is drawn over the wall, and the sign is hidden behind it (s2_71).
   - Two guards stand on the gate road. I also overlapped one of them while trying to pass (s2_71).
6. **East and west gates of Kingsbridge read as solid towers.** The two gate towers overlap with no visible opening (s2_25 east, s2_46 west). You can walk through (shown see-through, s2_50), but it looks like a wall. Only the north gate has a proper arch (s2_71).
7. **Guards hidden inside towers and walls.** On arrival at the south-east I saw a floating sword and a health bar over a wall tower, with a damage "11" next to it (s2_21). A second loose sword was on the wall face. Guard sprites are drawn behind or inside wall pieces.
8. **The road north of Kingsbridge runs into a lake on a jumbled bridge.** The plank pieces are offset and overlapping, not a continuous bridge (s2_73). It is walkable, but looks broken. The same jumbled planks appear on the lake south-west of Kingsbridge (s2_15/17) and on a river bridge in the forest (s2_58).
9. **Clicking a building often doesn't take you to its door.**
   - Kingsbridge smithy: I arrived facing down and nothing happened, so I had to press W then E (s2_25 to s2_27). Ashford trading post: a click on the building walked me elsewhere (s2_62).
   - Arriving at a door never auto-enters; you must face up and press E.
   - Clicking a far tile on the Kingsbridge plaza walked me to the bank door instead (s2_34).
10. **Click-to-walk barely moves in forest or near water.** Clicking a far spot that is a pond or tree gives almost no movement (s2_54 to s2_58). Three clicks of 4.5 s each moved me less than a screen. There was no red "can't reach" cross.
11. **Weapon in hand turns walk-clicks into attacks.** With the sword out in the Highlands, every far click near a slime became a swing ("Block"), so I couldn't walk on (s2_75). Explorers have to remember to switch to an empty slot.
12. **The farm isn't shown on the Wilds map before you enter the Wilds.** From the farm, "Map of the Wilds" shows only fog and town labels, and "Centre on me" does nothing (s2_4 to s2_6). After entering, the "Farm" and "Village" labels sit at the bottom left, away from the actual farm exit (s2_10).
13. **The Satchel title shows a strange glyph:** "SATCꞪEL" (the H looks like a ligature; s2_3 and every Satchel). The window title in Nell's chat ("NELL") uses the same font and looks fine.
14. **The "Village Watch" dialog shows the name twice** (small and bold: "Village Watch / Village Watch", s2_66).
15. **Grammar:** "You are at a anvil." (s2_33).
16. **The start toast is confusing:** "Quest complete: Seasoned fighter (+3,000g)" pops at 6:00 am on day 1 (s2_2).
17. **The enemy wind-up wedge pointed away from me** while a crow was right next to me (s2_16). It is minor, but the danger looked to be somewhere else.
18. **A faded "ghost tree" appears when you walk under a canopy.** A see-through copy of a tree floats a tile below the real one (s2_20, s2_56).

## Confusing
- **Clicking a shopkeeper vs the counter:** walking to Garrick by RMB stood me right on his sprite, and nothing told me to use the counter or anvil instead.
- **The Kingsbridge "market" building looks like a general store,** while the plaza has four market stalls with no keepers (s2_37). I couldn't tell whether the stalls are usable.
- **The Ashford trading post let me walk in at 6:30 pm,** and only the counter said it was closed. A closed shop should keep its door shut (as the village does).
- **Signposts point the same way for everything.** In Ashford: "Kingsbridge ⟶ · Greyhelm ⟶ · Saltmere ⟶ · Emberhollow ↘" (s2_66). They are technically right since everything is east, but they don't help pick a fork.
- **Map scale is hard to judge.** I expected Kingsbridge to be far, but it was about 2 game hours from the farm.

## Towns

### Kingsbridge
- **How it looks:** it really feels like a city. Crenellated walls with round towers and purple pennants, cobbled streets with iron lamp posts, and a plaza with a two-tier fountain, benches, four striped market stalls and a waystone (s2_35/37).
- **Buildings:** a columned bank, a stone smithy with an anvil sign, red- and blue-roofed houses, and The Crowned Stag inn.
- **Interiors are good:** a forge with fire and a weapon rack (s2_28), a shop with shelves (s2_38) and an inn with a hearth and banners (s2_47).
- **Liveliness:** the plaza was **empty from 9 am to 1 pm** (no stall keepers, no strollers). In the evening a few townsfolk appeared (s2_70). Nell, a street kid, was wandering just outside the west wall.
- **Guards:** purple-tabard guards stand in pairs at each gate (s2_25, s2_46).
- **Problems:** none of the shops, the inn or the smithy work (bug 1). I didn't find the temple, town hall or barracks in the time I had.

### Ashford
- **How it looks:** a different style: log cabins and board-and-batten halls with shake roofs, a fenced perimeter, a dirt crossroads with lanterns that light up at dusk, a well, a brick pile and a waystone (s2_61, s2_67). It reads clearly as a woodcutters' village.
- **People:** one villager in red by a barrel, and a hooded Village Watch guard at the east gate. Knocking on a house gave a nice line: "A dog barks. A child shushes it. Nobody comes."
- **Trading post:** closed at 6:30 pm. Its interior is identical to the Kingsbridge market (same shelves, plant and rug; only the wall boards differ).

### Greyhelm
- I arrived at 11 pm. Stone houses with mossy roofs and warm lit windows, a cobbled main street, lamp posts and a well (s2_78).
- I did not see any town wall on the approach from the south.
- The inn interior is the same layout as the Kingsbridge inn, with a stone wall and a different keeper (s2_79).
- The menu doesn't open (bug 1).

### Saltmere
Not reached (far north-east). The signposts point to it.

## Roads, map and travel
- **Crossing times:**

  | Route | Game time | Real time |
  |---|---|---|
  | Farm → Kingsbridge | ~2 h | ~1.5 min |
  | Kingsbridge → Ashford | ~3.5 h | ~4 min |
  | Kingsbridge → Greyhelm | ~2.5 h | ~3 min |

  That is fine on a road. It's tedious off-road, because WASD snags on every tree trunk and click-walk stalls in forest (bug 10).
- **Following roads:** roads are visible in open ground but vanish under the dense forest canopy between Kingsbridge and Ashford (s2_57). Several forks carry no signposts.
- **The map:**
  - It shows town names from the start (good). Roads appear only once explored, so you can't plan a route.
  - Inside towns the map shows building blocks but no names (s2_36).
  - Zoom and "Centre on me" work in the Wilds.
- **Waystones:**
  - Attuning gives "The rune wakes under your hand: Ashford."
  - The travel list is clear (s2_68) and travel is instant.
  - I missed the farm waystone because walking past doesn't attune it. Touch-to-attune isn't obvious.
- **Region banner:** "GREYSTONE HIGHLANDS" fades in nicely (s2_74).

## Guards and patrols
- **Kingsbridge:** pairs of armoured guards at every gate (s2_25, s2_46, s2_71). In the dark they look the same as knights.
- **Ashford:** the Village Watch says: "Move along, citizen. Well, stay if you like, it's a free town."
- **Fighting:** I didn't see any guard or knight fight a monster.
- **Patrols:** no knight patrol on any road I walked (Kingsbridge ↔ Ashford, Kingsbridge ↔ Greyhelm, about 9 game hours on roads).
- **Guards get in the way:** they stand on the gate roads and you can bump into or overlap them (bug 5).
- **Hit numbers:** the "11" splat on a tower (bug 7) suggests a guard was fighting something hidden.

## Quality-of-life wishes
- **Doors:** auto-enter on arrival when you click a door, or at least auto-face it.
- **Interacting:** let E or RMB on a shopkeeper open the shop (same as the counter).
- **Map:** show explored roads and, inside towns, label the shops (Inn, Smithy, Hall, Barracks).
- **Signposts:** put one at every road fork.
- **Waystones:** auto-attune within a tile or two. Mark unattuned waystones on the map.
- **Walking:** with a weapon in hand, still walk when the click is on open ground and the enemy is not targeted (or add a walk modifier key).
- **Opening hours:** show them on the door prompt ("Inn · The Crowned Stag (open)").

## Balance
- Iron gear and combat 30 trivialise crows, slimes and boars: they did 1 to 13 damage against 300 HP. Health regenerated to full between fights.
- Night in the Highlands spawned a slime that chased me for a long while. It wasn't dangerous.
- 23,000g couldn't be tested because no shop opened.

## Looks (art/UI)
- **Strong:**
  - building variety (city stone and plaster against Ashford logs against Greyhelm moss-stone);
  - fountain, market stalls and lamp posts;
  - dusk lantern glow and lit windows at night (s2_65, s2_78);
  - the warm evening grade;
  - shop and inn interiors.
- **Weak:**
  - the overlapping gate towers on the east and west gates;
  - jumbled plank bridges;
  - guards clipping into towers;
  - identical interiors reused across towns (only the wall material changes);
  - the floating signpost label over the wall;
  - the Satchel "SATCꞪEL" glyph;
  - a huge mostly empty window for a one-line chat (Nell, s2_45).

## What I liked
- Kingsbridge genuinely feels like a walled capital: the walls, towers and the plaza with its fountain gave a real "arrival" moment.
- Each town has a distinct material palette, so you know where you are at a glance.
- Signpost text that floats when you're near is very readable.
- Waystones make the big map bearable once attuned.
- The region title fade-in, the lanterns lighting up at dusk, and the knock flavour text ("A dog barks...").

## Top 5 fixes
1. **Town menus:** make shop, inn, smithy and bank counters actually open `townMenu` (check `storyTalk` returning true with the herald step active). Right now the towns have no gameplay.
2. **Counters and furniture:** make shop and inn counters solid, and don't spawn the player inside the inn table.
3. **Gates:** clear the Kingsbridge gateways. Move the north-gate signpost out of the arch, give the east and west gates a visible opening, keep guards off the gate tiles, and draw guards in front of the walls.
4. **Exploring:** make walking reliable. Click-walk to the nearest reachable tile when the target is water or a tree, show `NOPATH` when nothing is reachable, and walk instead of swing when there's no targeted enemy.
5. **Navigation:** add road and fork signposts plus map labels for town buildings. Fix the broken plank bridges. Make knight patrols visible on the main roads (I saw none in 9 game hours).
