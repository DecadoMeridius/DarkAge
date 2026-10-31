# Round 6: the Knight's Squire (patrols retest)

Screenshots: `scratchpad/playtest/r6s2_*.png` (session fa185991). Kingdom test start, about 125 harness commands, one in-game day (6:00 to 19:50).

## Summary
Patrols are now **visible on the map**: purple shields that move along the roads around Kingsbridge, Ashford and Greyhelm. I saw a real patrol on screen once, two purple knights on the road west of the river north of Kingsbridge (r6s2_66). But in a whole in-game day I never managed to fight beside one. **"Ride with a patrol" stayed at 0/5.**

The promised "a patrol rides near you about every 10 s while the job is active" did not happen that I could see. Patrols ride past faster than I can walk, the map shields jump around and disappear, and twice I reached a spot the map marked and found nobody there.

The Town Hall job works: kills near the city counted, 4/10 by the end. Navigation (walls, river, trees, market stalls) used up most of my time.

## Bugs
1. **No patrol came to me while the job was active.** I took the job at 7:40 and stood on roads for 10-20 s several times: at the crossroads waystone, outside the south gate, on the east road and on the north forest road. No knights came. The shields stayed 20-80 tiles away. (r6s2_28/29, 38/39, 48/49, 78/79)
2. **Map shields don't match where knights are.** Twice the map showed one or two shields parked just outside the Kingsbridge south gate (r6s2_20, r6s2_39). When I got there (r6s2_46/48), nobody was there except the two gate guards inside the wall.
3. **Patrols vanish from the map.** Four or five shields in the morning (r6s2_27), then one or two by evening (r6s2_74, r6s2_79). A patrol north of Kingsbridge at 568,430 was gone about 15 s later. If they despawn when far away, the map shouldn't show them as if they're still riding.
4. **Patrols move about as fast as or faster than a walking player** (about 60 tiles in 30 s, judged from the map). Once you've seen one there's no catching it on foot. In r6s2_66 two knights were 8 tiles away; 3 s later they were gone (r6s2_67).
5. **Patrol shields off the roads.** Shields at about (607,403), (673,385) and (584,494) on the map are in open land or forest with no road nearby (r6s2_27, r6s2_29, r6s2_69). Either the patrols leave the roads or the map position is wrong.
6. **The east road from the crossroads dead-ends at the city's east wall**, with no gate visible (r6s2_40). A right-click inside the city still got me through, so the pathfinder found a gap I couldn't see.
7. **The road north of Kingsbridge dead-ends at the river with no bridge** (r6s2_70). The pathfinder then crossed the river anyway (r6s2_71). Either there's an invisible ford or the water isn't solid there.
8. **Standing inside the wall:** after sliding past the gate guard I was drawn in the city wall's face, east of the right gate tower (r6s2_45).
9. **WASD gets stuck on single tree trunks, benches and market stalls** with no sliding: 4-6 s of key hold and almost no movement (r6s2_34, r6s2_52, r6s2_55, r6s2_75, r6s2_76). It's worst in the forest north of the city and in the plaza.
10. The story tracker arrow labelled "to Hollowmere Farm" points north and north-east while the farm is south (r6s2_7, r6s2_10, r6s2_17). It may point at the nearest exit, but it reads as wrong.
11. **Map zoom buttons:** Zoom in twice then Zoom out once left the view barely changed (r6s2_16).

## Confusing
- Nothing tells you where to find a patrol. The Barracks and the job text say "fight beside a knight patrol" but give no road, time or direction, and the job has no tracker. A "Track" button pointing at the nearest patrol would fix most of this.
- The job is titled "Wolves on the royal road" but the text says "meadows around Kingsbridge", and I killed slimes in a forest. It's unclear what counts as the meadow.
- The kill-progress toast for town jobs was easy to miss; I only saw progress in J.
- The room label "THE BARRACKS" is painted faintly over the wall art (r6s2_12).

## Patrols
- **Visible:** yes on the map, rarely in the world (one sighting).
- **Reliable:** no. They teleport or despawn, park at gates that are empty when you arrive, and don't come near you.
- **Fun:** couldn't judge. I never fought beside one, so I couldn't test whether they ride whole roads, get stuck, fight or talk. On the map the pair that passed me went from the Greyhelm road to the Kingsbridge south gate and back, which looks like a real route.

## Jobs
- Barracks "Ride with a patrol" (900g): took it easily; 0/5 after a full day. Can't be finished in practice right now.
- Town Hall "Wolves on the royal road" (700g, 10 kills): 4/10 at the end from slimes outside the walls. It counts properly. The other two jobs are fetch jobs (20 wheat, 10 iron bars) and look fair.
- Standing 0/100 at both. "At 50 standing, friend prices" is clear.

## Combat & allies
- Slimes die in a few swings with iron gear at combat 30; I took 3-10 damage per fight. It's easy, as expected near a city.
- The gate guards stand in place; they never fought anything near me.
- I couldn't test the knights as allies.

## QoL wishes
- Track a patrol from the job (arrow plus distance), or have the patrol actually spawn near the player while the job is active.
- Patrols should ride at walking pace or slower near the player, or stop and wait when you're within about 10 tiles ("Ride with us, squire?").
- Let the player join a patrol: interact with a knight, and the patrol escorts you or you follow it.
- Better sliding around trunks and benches, the way click-to-walk paths around them.
- Make the map's "Centre on me" and zoom levels step clearly.

## Balance
The 900g patrol job is fine if patrols are findable. 700g for 10 easy kills is generous next to farming, but fine for a kingdom test.

## Looks
- Kingsbridge is lovely: the walls, towers with flags, gatehouse arch, plaza fountain, market stalls and a busy crowd (r6s2_51). The Barracks and Town Hall interiors are nicely furnished.
- The knights and gate guards in purple tabards read clearly.
- The evening grade on the forest is pleasant.
- The canopy fade over the player plus the see-through outline made the player and slimes hard to read in the forest (r6s2_73).

## Liked
- The city and its signposts ("Greyhelm → · Ashford ↑ ...").
- The crossroads waystone attuning as I walked by.
- Clear job windows with progress in the Quests tab.
- The map shows towns, building labels and patrols at a glance.

## Top 5 fixes
1. Actually bring a patrol to the player (within about 15 tiles) every so often while "Ride with a patrol" is active, and keep it there long enough to join.
2. Make map shields match where the knights really are, and keep a patrol on the map rather than despawning it.
3. Slow patrols near the player, or let you interact with them to join and follow.
4. Add a gate or bridge where roads meet the city's east wall and the northern river, and make walls and water consistently solid.
5. Slide along trunks, benches and stalls when walking with WASD.

## `errors`
none
