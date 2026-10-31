# Playtest r3: Dangers of the Wilds (adventurer / combat tester)

Persona: Zelda and RuneScape fan. Kingdom test (combat 30, iron gear, 33,000g). About 130 harness commands, port 9303. Screenshots `c3_<n>.png` are in the playtest scratchpad.
Played Mon 1 6:00 am to Tue 2 7:30 am: farm, then the Wilds (Ashford and the forest north of it), a night in the forest, collapsing at 2 am, then back out.

## Summary
- **Alive: 6/10.** The forest at night is the best part: a wolf pack, a boar, a zombie and lone bandits all within a few screens (c3_61, c3_65). By day the meadows are fairly empty: slime trios and single wolves.
- **Fun: 6/10.** Clearing the goblin camp with its ogre was the highlight (c3_35 to c3_43). Getting places is the main problem. Rivers, lakes and solid forest sit between the roads, and WASD keeps catching on trunks. Over half my commands went on walking.
- **Fair: 5/10.** Bandits, wolves, slimes and zombies are easy at combat 30. The ogre is a big jump: a level 42 brute that took me from 268 to 29 HP in about 5 s. Trail Bread heals about 29 a piece, so food can't keep up with it.

## Bandits
- **What I met:** a lone Bandit (level 19, 110 HP) in the forest at 8:20 pm, another on a road at 12:40 am, then a pair on the same road at 1:30 am (c3_78). Each died in about 3 s of LMB and Cleave. The pair did about 80 damage in total, and the patrol paid +75g.
- **Look:** masked and vested, clearly human enemies. At night, though, their dark navy palette nearly disappears into the grade (c3_75, c3_78).
- **Map:** no red bandit marks appeared at any time, day or night, at any zoom, including right after I fought a patrol (c3_44, c3_51, c3_60, c3_68, c3_82). Either the marks are not drawn or they only show in some state I never reached.
- **Fights with others:** I never saw bandits fight knights, guards or monsters. A wolf pack stood about 10 tiles from the bandit pair and they ignored each other. Knight patrols showed as purple shields on the map, and I saw knights once on the Ashford road (c3_22), but never next to bandits.
- **Hidden attacker (c3_57, c3_58):** the first bandit attacked from directly above me, and the "to Hollowmere Farm" tracker label and arrow sat exactly over its body. I only noticed it because my HP was falling.

## Goblin camps
- **Map:** camps show as green triangles from the start, even at 0% explored. That works as a lure. After I cleared one it still shows, now with an orange diamond behind it.
- **First camp:** the nearest one (south-west, by the river) could not be reached on foot. Deep river on one side, solid forest on the other, and right-clicking across the river did nothing (c3_13, c3_14).
- **Second camp (north of Ashford):** reached through the forest, not by the road.
  - **Layout:** 4 thatched shacks, a cooking fire, a horned totem and a chest. Reads clearly as a camp (c3_40, c3_43).
  - **Defenders:** an ogre plus 2 goblins. The ogre and one goblin rushed me. I killed the goblin (+16g), then the ogre (level 42, 392 HP; +54g and 1 hide).
  - **Damage:** I went from 268 to 139 to 29 HP in two LMB-hold bursts. I needed 3 breads and some regen.
- **The last goblin never fought:**
  - It stayed inside the tree mass round the camp, faded under the canopies (c3_41, c3_42, c3_45, c3_46, c3_47, c3_48).
  - It followed me at 200-300 px but backed off whenever I came closer.
  - My swings toward it did nothing because it was out of reach. It looked like a rock-slinger keeping its distance, but it never threw anything.
- **Chest:** I could open it while that goblin was still alive. It held 282g, 1 Amethyst and 4 Strawberry Seeds. Seeds feel odd as goblin loot, and there were no goblin-themed items.
- **No spearmen fights:** I never fought spearmen or rock-slingers in a real fight, so I can't judge their wind-ups.

## Packs
- **Slimes:** groups of 3 in the meadows (c3_9, c3_84). Their green blends into tall grass and they hide behind the player sprite. On day 2 a trio near the road wandered off instead of engaging.
- **Wolves:**
  - Lone wolf at dusk (c3_49).
  - A pack of 3 at 7:20 pm (c3_53), about 2 damage a bite. Trivial at combat 30, but fine for a newer player. Cleave plus LMB cleared them.
  - **Stuck pack at night (c3_61 to c3_64):** two wolves stood stacked on exactly the same pixel and did not move for about 30 game minutes. They only reacted when I came round the trees. Their path to me was probably blocked by trunks, so they stood still instead of going round.
- **Boar:** stood idle beside the zombie until I engaged.

## Zombies
- **Where:** one Zombie (level 11, 76 HP) in the forest at about 9 pm (c3_61, c3_65, c3_66). It walked toward me slowly, which feels right.
- **Look:** green-grey skin, dark clothes, hunched, spiky hair; it reads as a zombie. At night it is very dark: the grey-blue skin almost vanishes against the dark forest floor.
- **Fight:** died in a few hits. It came together with a boar, and both attacked at once.
- **Loot:** no gold or drop showed.

## Art (screenshot names)
- **Goblin camp:** the shacks, cooking fire and totem are good and readable (c3_40, c3_43).
- **Goblins:** small green figures with spears that read well in daylight (c3_34). Under a faded canopy they turn into ghosts (c3_41).
- **Ogre (c3_35, c3_36):** the weakest sprite I saw.
  - It reads as a flat green rectangle with a small head on top, more like a block or box than a brute.
  - The torso is a big flat slab with a darker band, and the arms barely separate from the body.
  - It has a red outline/rim while targeted.
  - Compared with the hand-drawn creatures, it needs real shoulders, a belly and a club silhouette.
- **Bandits:** good silhouettes with masks and vests (c3_75, c3_77, c3_78).
- **Zombie:** good shape, too dark at night (c3_65).
- **Wolves:** fine by day (c3_49). At night they turn into near-black blobs, and stacked wolves look like a single two-headed wolf (c3_61).
- **Wind-up markers:** the red wedges are readable by day. At night they are muted brown (c3_57, c3_76).
- **Tracker label:** "to Hollowmere Farm" and its arrow are always drawn on the player's head and cover enemies right above you (c3_57, c3_58).

## Bugs
1. **Bandit patrols are never shown on the map.** No red marks at any time over 25 game hours, even right after fighting a 2-bandit patrol on a road (c3_68, c3_82).
2. **Wolves stuck in place.** A 2-wolf pack stood stacked on one pixel behind trees and did nothing for about 30 game minutes until I moved (c3_61 to c3_64).
3. **Goblin that never engages.** It lives inside impassable forest next to its camp, can't be hit and never attacks. It shadowed me across the whole camp.
4. **Ashford's west gate leads nowhere.**
   - The paved road and bridge out of the west gate run into a wall of forest after about 6 tiles (c3_26, c3_27).
   - A tree trunk and canopy stand on the paved gateway itself.
   - The signpost there lists Kingsbridge, Greyhelm, Saltmere and Emberhollow, none of them west.
5. **Player drawn standing on water.** Twice the player sprite was drawn over deep river water, in mid-river (c3_15, c3_18, c3_32). Probably the feet are on the bank tile and the body overlaps, but it looks like walking on water.
6. **Camp unreachable.** The SW camp (map near the farm, west of the river) has no walkable approach from the road side, and right-click pathing across it does nothing.
7. **Talking instead of walking.** Right-clicking the north road in Ashford talked to a forager who had walked into the click spot. It opened a dialogue instead of walking, and the forager stood in the road and blocked it (c3_30).
8. **WASD snags on trunks** constantly in forest biomes, and sliding round them doesn't help. RMB far-click pathing works but often stops short.
9. **Slot 9 item is unclear.** Clicking with slot 9 selected (5 of something, looked like a food or seed packet) said "Till the soil first". The hotbar icon reads as food.

## Balance
- **Ogre vs the rest:**
  - Bandits (110 HP, level 19) and zombies (76 HP) are very easy at Kingsbridge-test strength.
  - The ogre (392 HP, level 42) does several times more damage per second than anything else in the meadows and forest.
  - That's good as a camp boss, but it needs a visible telegraph per slam. I mostly saw HP vanish while trading blows.
- **Healing:** Trail Bread heals about 29. Five breads can't cover one ogre exchange, so a melee player either kites or loses a life.
- **Gold:** about 16-54g per kill, and the camp chest gave 282g. The 2 am collapse cost 2,500g, which outweighed a whole night of fighting (about 400g).
- **Spawns:** I stood still for 80 game minutes (5:40-7:00 pm) and nothing came. Walking spawns things quickly. Nights in the forest are noticeably denser, which is good.

## Top 5 fixes
1. **Show bandit patrols on the M map**, or remove the legend line. Right now the feature is invisible.
2. **Unstick packs and goblins blocked by trees.** Path round obstacles or teleport them to an open tile next to the player, and make the camp goblins come out of the forest and fight (or throw rocks).
3. **Redraw the ogre** with a real brute silhouette and give its slam a clear wind-up wedge. Lower its burst or add one more food tier near camps.
4. **Make the routes to camps walkable:** fords or bridges over the river near the SW camp, a path from the road to each camp, and remove trees from paved town gates. Either give Ashford's west road a destination or remove it.
5. **Night readability:** lift enemy palettes slightly at night, or give enemies a thin light rim. Move the tracker label off enemies (fade it or offset it when a hostile is within 60 px).

## `errors` output
```
None
```
