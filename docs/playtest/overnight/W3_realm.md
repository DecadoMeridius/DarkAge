# W3 realm explorer, second pass (Kingdom test, Painterly)

**Setup:** Kingdom test, developer mode. Painterly and the FPS counter were already on in this profile. I played from Mon 1, 6:00 to Wed 3, 6:00 and used about 110 harness commands.

**Shortcuts I took to fit the budget** (each one is a console call, not normal play):
- **Moving around:** I set `S.p.x/S.p.y` or called `goMap('wilds', ...)` to jump between towns, building doors, the goblin camp, the Warlord arena, the Highmarch gate, the dungeon mouth and the mine. I also used it to place myself next to mine ladders.
- **Miners' Guild:** for the Hewer rank I used `give('copper_ore',20)`, `give('coal',10)` and set Mining XP to level 5.
- **Skipping days:** `endDay(false)` twice, to reach day 3 for the bandits.
- **Fighting:** the Bandit Warlord, the goblins and the dungeon fight were all done with real clicks (LMB and X).

**Console errors:** none in-game. The harness log has 5× "Failed to load resource: 404" (the resource wasn't named).

## Broken
1. **Kingsbridge W/E gates are removed on purpose, but the town still leads you to them.** `x_terrain.js:136` deletes `TOWNS.kingsbridge.gates.W/E`, because the tall wall hid the passage. So the stamped town has only N and S exits (`MAPS.wilds.towns[0].exits` = N, S).
   - **What's left behind:**
     - the full-width east-west main street (`st [1,21,54,4]`);
     - two guards on each side, standing against the blank wall (`guard_kb` at 206,248/251 and 255,248/251);
     - lamp posts flanking the dead end.
   - **North gate:** it works, but its road outside is a short stub (W3_realm_4, W3_realm_5).
   - **Gate status:** N open, S open, W walled shut, E walled shut (W3_realm_6 west, W3_realm_7 east).
   - **The fix is in the town plan:** end the street before the wall or turn it, and move the side guards. The W2 report's "the roads start at the east side" claim is wrong: `findPath` from the N and S exits reaches Greyhelm (28 tiles), Ashford (74) and Saltmere (184-243).
2. **Ashford and Saltmere town jobs can't be taken.** Jobs are only offered by a `hall` building (`actType` → `renderJobs`). Ashford (tavern, trader, saw, guild) and Saltmere (tavern, fish, chandler, guild) have no hall. So four jobs never show up anywhere: `af_wolves`, `af_hard`, `sm_crabs`, `sm_salt`. Put the board in the tavern, or give each town a notice board.
3. **An off-duty shopkeeper on the street opens the full shop outside opening hours.** In Greyhelm at 7:40 am (hours 9-18), Kessa was standing by the inn door. Pressing E there opened Miners' Supply with Buy/Sell straight away, not the small street window with Shop greyed out (W3_realm_9). It also took priority over the inn door I was trying to use.
4. **Shopkeepers without a counter can't be reached by mouse.** RMB on Borek (Greyhelm forge), from two tiles away, did nothing: no walk and no talk. The forge room has no counter, and the keeper is a solid `keeper` object. E works only when you stand right beside him. This is almost certainly W2's "Kingsbridge smith won't talk". RMB on the keeper (not the counter) also did nothing at the Greyhelm inn. RMB on a counter always worked.
5. **E interacts with whatever the mouse is aiming at, not the way you last walked.** Standing under the guild counter after pressing W, E did nothing, because the mouse was to the right (`dir` 2). It happened in several rooms: the hall, the guild, the dungeon "E Climb" prompt. The on-screen prompt says "E", so a player expects E to hit what they just walked into.
6. **The promotion and join dialogue says "Here's what we ask of you before you rise", then closes** without showing the tasks (W3_realm_14). You have to reopen the guild window to read them.
7. **Enter doesn't press "Start the day"** on the morning report. I tried it twice; W2 saw the same.
8. **Knight patrols spawn closer than designed.** One spawned 22 tiles from me (`PATROLS`, spec 25-90). A first patrol of three also disappeared within 6 s of spawning, about 78 tiles away. The second one then walked the road normally.

## Quality of life
- **Room scenery:** each interior shows a second copy of its back wall floating in the black above it, and one below. That's the "mirror chunks past the map edge" rule applied to rooms (W3_realm_10, W3_realm_13, W3_realm_23). It looks like a glitch indoors.
- **Guild greeting:** the Hunters' Lodge and Anglers' Guild greet you as "Ah, Hewer Tester." That's another guild's title, and it reads oddly before you've even joined.
- **Map labels overlap** (W3_realm_27): "InSaltmere", "ShopGuild", "HallGreyhelm". On the 4%-explored chart, everything except roads, towns and camps is blank beige.
- **The tracker label "to Hollowmere Farm" is always on** and sits on top of area banners and landmarks: the Highmarch waystone (W3_realm_36) and "THE SUNKEN FORGE" (W3_realm_38).
- **The LMB hint ("LMB Attack") is hidden behind the Focus bar and the ability buttons** whenever they're visible (W3_realm_41, W3_realm_46).
- **Copper and iron veins look almost the same** in the mines and the Seam. Only the hover label ("Iron vein · Mining 15") tells them apart.
- **Region inn:** "Rumor" in Highmarch, "Rumour" in the towns. Highmarch's rumour ("Rain waters every crop on your farm") is a generic tip, not local gossip.
- **Name clashes with the story:** Ashford's tavern keeper is **Rudd** (also the Empty Throne bandit leader in ch. 5), and Greyhelm's chief is **Halvard** (also the highland raiders' leader in ch. 7). If that's intended, the story should acknowledge it.
- **The Guild Seam doesn't suit Hewer rank (Mining 5).** 28 iron and 6 silver of its 68 nodes need Mining 15 or more. Fine as a goal, but at that rank most of the "rich" seam is locked.
- **The goblin camp is right next to Greyhelm** (camp 5 at 173,173, about 20 tiles from town). On arrival I was jumped by goblins and an ogre. Green goblins on green grass are hard to see.

## Balance
- **Region dungeon floor 1 is a wall right after the Warlord.**
  - **The Warlord fight:** at Combat 30 in iron, with the Warlord just beaten (it took 2 of 3 lives in about 2 minutes, a fair fight), Highmarch opens.
  - **Floor 1 of the Sunken Forge:** level-30 Stone Trolls with 1,222 HP, magma slimes and firebats. A magma slime and a firebat cost me a life and took me to 16 HP in about 15 s.
  - **Suggestion:** scale dungeon floor 1 for players who just opened the region, or warn at the door.
- **Mine floors 3-4 hit hard for their depth.** Level 3-4 skeletons (atk 18) and bats took me from 287 to 150 HP in a few seconds at Combat 30 in iron. Fine for a veteran; it seems steep for a new player arriving at floor 3.
- **Town food prices:**
  - **"Plain fare" is dearer than the hot meal:** Miner's Pie is 407g, Country Bread 106g at Greyhelm and 173g in Highmarch, while the hot meal is 50-60g.
  - **The Greyhelm job "A miner's lunch"** pays 650g for 3 Miner's Pies that cost 1,221g at the next-door inn.
  - **The Highmarch inn** sells Highland Stew at 929g and Edelweiss Tea at 714g.
- **Price gaps between towns:** coal is 21g at Miners' Supply and 41g at the Highmarch market. Steel Plate is 4,341g at Borek's, a big jump on Iron Plate at 1,914g.
- **Rewards:** the Bandit Warlord gave about 2,600g. Mine floor 5 gave +500g (milestone). Both feel right.

## Art & feel (Painterly)
- **Towns look good.**
  - **Greyhelm:** stony paving, mine carts and slag (W3_realm_8).
  - **Ashford:** log cabins, a fence with gaps, log piles and walkers (W3_realm_22).
  - **Saltmere:** sand, palms, stilt houses, beached rowboats and a drying rack (W3_realm_26).
  - **Highmarch:** a pine road and a turf-roof town (W3_realm_35).
- **Greyhelm's turf roofs read as flat green slabs** from above. There's no ridge or texture at this zoom (W3_realm_8).
- **The ore rocks look faceted, like low-poly 3D,** in the Seam, the mines and the Wilds (W3_realm_19, W3_realm_41). The gold node looks like a cut gem, unlike the painted boulders next to it.
- **The Greyhelm guild and the inns:** the weapon rack hangs past the right wall into the black (W3_realm_13).
- **Overlaps and hidden sprites:**
  - the player is drawn over the counter when walking into it (W3_realm_17);
  - Stone Trolls overlap each other at the dungeon start (W3_realm_39);
  - at Kingsbridge's west wall, a teleport left the player invisible behind the wall face (W3_realm_6).
- **A black rectangle** about 450x120 px sat at the bottom right inside Kingsbridge (W3_realm_6). It's probably a ground chunk not yet painted, or a building's blank shadow.
- **Characters are crisp pixel sprites,** as expected. The Warlord is a large blocky pixel knight among painted tents (W3_realm_32).
- **Guild welcome portraits** are big, blurry upscaled pixel art (W3_realm_14).

## Performance
- **Everywhere I played** (towns, Wilds, Seam, mines, dungeon, Highmarch): 100-131 fps, 1-7 ms work.
- **Fighting the Warlord:** 100-102 fps.
- **The Wilds map window open:** 99 fps, 10.9 ms work.
- No stutters noticed.

## Liked
- **Every town has its own character.** Inn, shop and guild all work, and the guild rank tasks show "(have N)" with ✓ marks.
- **The Guild Seam is a satisfying reward** (68 ore nodes on a 30x22 map), and the Hewer promotion flow worked end to end.
- **"Iron vein · Mining 15"** labels on locked nodes are very clear.
- **The Warlord fight and region unlock:** a boss bar with "SHIELDED", the Warlord comes out to meet you, and on the kill `regionOpen('highmarch')` is true and the north gate lets you through.
- **Mine flow:** ladders with a bobbing arrow, gem veins from floor 5, and the elevator remembering floor 5.
- **Goblin camps** (fire spit, totem, chest, shacks) and bandit patrols (a chief with three men) both appear as designed. Knight patrols walk the roads at night.

## Top 5 fixes
1. **Kingsbridge W/E:** either really open the side gates, or remove the dead-end street, the four gate guards and the lamp posts at the walls. Make the north gate's road continue past its stub.
2. **Give Ashford and Saltmere a job board** (tavern or notice board). Their four town jobs can't be taken today.
3. **Make keepers reachable by mouse and respect opening hours.** RMB on a counter-less keeper (forge smiths) should walk there and talk. An off-duty keeper on the street should open the small window with Shop greyed out, not the full shop at 7:40 am.
4. **Make E use the movement direction** (or the prompt's target), not the mouse direction. Make Enter press the morning report's "Start the day".
5. **Retune the region dungeon's floor 1** for players who just beat the Warlord (Combat ~30, iron gear). Hide the mirrored back wall above rooms. Fix the map label overlaps and the LMB hint hidden under the ability bar.
