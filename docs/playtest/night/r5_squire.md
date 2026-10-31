# Round 5: the Knight's Squire (patrols and town jobs)

Persona: Kingdom test (combat 30, iron gear). About 145 harness commands. Screenshots are in the playtest scratchpad as `r5s3_<n>.png` (numbers below).

## Summary
I walked from the farm to Kingsbridge, took **Ride with a patrol** at the barracks (Captain Vey) and **Wolves on the royal road** at the town hall (Mayor Osric), and hunted around the city.
- **Patrol job: 0/5.** In about a day and a half of game time I never saw a knight patrol on a road outside a town, and never fought beside one. The one patrol I found (a gold-helmed Knight-Captain and two knights) stood jammed against the east side of Garrick's Forge, just inside the east gate, from about 2:50 pm to at least 6 pm on day 1 (shots 42, 53-56). On day 2 a pair of knights walked inside the walls (82). The map showed one or two purple shields early on (11, 40), then none at all (47, 51, 52, 68) while the job was active.
- **Wolves job: 4/10** when I ran out of budget. Each kill showed a clear toast ("Wolves on the royal road: 2/10") and the journal tracks progress. Kills in the palm/crab area south-east of the city did not count, with no message saying why.
- Kingsbridge looks great: a walled city, a fountain plaza, market stalls, guards at the gates, and nice interiors for the barracks, inn and hall. Getting in and out of it is the main pain. Three of its four road approaches run into solid wall or cliffs.
- No JS errors.

## Bugs
1. **Patrol stuck inside Kingsbridge, east gate** (High). The Knight-Captain plus 2-3 knights stood clumped at the east wall of Garrick's Forge for more than 3 in-game hours (shots 42, 53, 54, 56). They never left. Talking to the captain works ("Stay close if you're heading our way"). They also overlap the player and the guards.
2. **No patrols on the roads while the patrol job is active** (High). The map showed none after the first hour (47, 51, 52, 68, 71). I waited about 30 s on the west road and on the north-east road and none came by. The job could not be progressed at all.
3. **Roads dead-end at the city wall.**
   - East road: the dirt road runs straight into the wall about 2 tiles from it (87, 94). The real east gate is a 1-tile gap further north, with no arch or gate sprite.
   - North road: the dirt road from Greyhelm meets solid wall about 10 tiles west of the north gate (74, 75).
   - West: the gate is a narrow gap with no gatehouse art (25-27). I pushed against the wall several times before finding it.
4. **North gate opens into a cliff pocket** (High). Through the arched north gate you land in a strip between the wall and raised cliff blocks. I could not move left, right or north (82, 83), so the "Greyhelm ↑" signpost points into rock.
5. **LMB on far ground with a sword never walks**, even with no enemy on screen (6, 13, 62). The guide says it should walk there. RMB on a building does walk to the door (30, 37, 64, 78). RMB on the innkeeper from across the room did nothing (65).
6. **The story tracker arrow points the wrong way.** The "Royal Herald 17 m" arrow pointed north while the herald stood south-west (9). Later "to Hollowmere Farm" pointed north-east while the farm was south-west (14, 20). The tracker text also overprints the region title "AMBER MEADOW" (17) and the signpost labels at gates (23, 41).
7. **WASD movement often stalls.** Many 3-7 s holds moved only 1-3 tiles. I was caught on lamp posts, tower corners, villagers (one walked into and stuck to the player, 62) and patrol knights. A long walk took many tries.
8. **Kill counting is hidden.** The crab kill near the road south-east of Kingsbridge (palms, 92-93) did not count for "meadows around Kingsbridge", and nothing said so.
9. Small text issues:
   - Captain Vey says "My knights ride the roads in fours", but the barracks text says "patrols of two to four".
   - The door prompt reads "Town hall · Town Hall" (58).
   - The job is called "Wolves on the royal road" but it is "10 monsters" (all slimes in practice).
   - On the Wilds map, the town building labels overlap the town name ("Shop" under "Kingsbridge", "Bank"/"Forge" run together) (28, 40).
   - The bank and the town hall use the same crest sign, so I walked into the bank looking for the hall (37).

## Confusing
- There is no hint about where patrols are or when they leave. The job says "fight beside a knight patrol" but gives no tracker, and you can't track town jobs in the journal.
- The town hall is closed after 6 pm. I arrived at 6:40 and had to sleep at the inn (120g). The closed message is fine, but the barracks was open, so I didn't expect it.
- Finding the gates. The walls are long and the gaps are only one tile.
- "Kingdom test" has no horse. Without one, the walk farm → Kingsbridge takes several real minutes, and a squire should ride.

## Patrols
- Looks: purple surcoats and gold or silver helmets, the same look as the guards. I couldn't tell patrol knights from gate guards except by the captain's gold helmet.
- Visible: rarely. Early on I saw a few purple shields on the map, then none. A patrol was stuck in town for hours.
- Helpful: I never saw one fight. Gate guards didn't react to a slime about 10 tiles outside their gate (48).
- Fun: unknown. The feature as tested doesn't work.

## Jobs
- Barracks: Ride with a patrol, 900g. Town hall: Wolves on the royal road 700g, Bread for the garrison (20 wheat) 600g, Mail for the knights (10 iron bars) 1100g.
- Clear descriptions with progress in both the job window and the journal ("Hand it in at the town hall"). The kill toasts are good.
- Pay seems fair for 10 slime kills. The patrol job is unpayable while patrols don't come.
- Standing 0/100 with a "friend's price at 50" note is a nice hook.

## Combat & allies
- Iron gear vs. meadow slimes is trivial: slimes die in 1-2 swings, about 4 damage per hit taken. A crab hit harder (about 40 damage in one exchange). It was easy without allies.
- I can't judge fighting with allies; I never fought with one.

## Towns
- Kingsbridge: the plaza with fountain, benches and stalls is lovely and busy, and the waystone attuned on touch ("The rune wakes under your hand: Kingsbridge.", 36). The barracks (weapon racks, armour stands, banners), the inn (Crowned Stag) and the town hall (checkered floor, portrait, hearth) are pretty.
- The inn menu's prices are odd for a traveller: Harvest Roast 972g, Knight's Feast 1959g, Layer Cake 1534g, Country Bread 111g (66). A meal costs more than a job pays.

## QoL wishes
- Track town jobs (marker or arrow), especially "find a patrol": point at the nearest patrol.
- Give patrols a fixed timetable shown at the barracks ("next patrol leaves the north gate at 10:00"), or let the captain say "Ride with us" and have the patrol wait for you.
- Gatehouse arches on all four gates, with roads that line up with them.
- Allow LMB walking with a weapon when no enemy is near, as documented.
- A horse in the Kingdom test.
- Tell the player when a kill doesn't count ("not in the meadows").

## Balance
- Slimes around Kingsbridge are far below a combat-30 squire. Fine for a town job, but there is no tension.
- Inn take-away food costs 2-3x a job reward.
- Job rewards (600-1100g) are sensible for early-mid game.

## Looks
- Kingsbridge walls, towers with purple pennants, the north gatehouse arch, the fountain and stalls are all good pixel art.
- The east and west gates are bare wall gaps. Patrol knights clip into tower sprites (42).
- Tracker labels overprint signpost text and region titles.

## Liked
- Arriving at the fountain plaza with a crowd of villagers.
- Clean job windows with keeper portraits and a quote; kill toasts with counts.
- Building interiors and the "walk to door" on RMB.
- The Knight-Captain's line.

## Top 5 fixes
1. Make patrols actually leave town and travel the roads, and fix the patrol stuck at Garrick's Forge (east gate).
2. Keep patrol shields on the map, and add a tracker for the patrol job.
3. Line up the roads with the Kingsbridge gates and give every gate a visible arch. The north gate must not open into cliffs.
4. Let LMB walk with a weapon when no enemy is near, and let RMB on an NPC walk to them.
5. Fix the story tracker arrow direction and keep its label off signposts and region titles.

## `errors` output
```
none
```
