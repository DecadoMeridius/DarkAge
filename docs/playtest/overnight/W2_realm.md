# W2 realm explorer: Kingsbridge and the roads (Kingdom test, Painterly)

**Setup:** Kingdom test, developer mode, Painterly style, FPS counter on. I played from Mon 1, 6:00 to Tue 2, 9:10, using about 120 harness commands.
**Scope:** I only reached Kingsbridge. It sits right above the farm. I walked around inside it and on the roads near it, but never made it to Greyhelm, Ashford or Saltmere in the budget. The main reason is in Broken #1: only one of Kingsbridge's gates works. I didn't try the mines or the regions, but the map does explain the region locks clearly.
**Console errors:** none (`errors` was checked three times).

## Broken
1. **Kingsbridge's west and east gates are walled shut.** In both places the road runs up to the city wall with two gate guards standing on it, and the wall carries on straight across. There is no opening and you can't walk through. Only the south gate works. The map shows roads leaving from those sides, so a player walks up to a "gate" that is a dead end. Clicking ground outside the wall does nothing (no red cross either). The town's roads to Greyhelm (NE) and Saltmere (E) start at the east side, so you have to go round through the south gate. Shots: W2_realm_59 (west), W2_realm_78 and W2_realm_80 (east).
2. **Stuck in the barracks back wall.** In `in_kb_barracks` I pressed Esc, clicked the floor and walked up. The player ended up standing inside the back wall, beside the armour stands. After that, WASD did nothing for about 10 s of input. Clicking an open floor tile freed me. Shots: W2_realm_63, W2_realm_64.
3. **The Smithy blacksmith won't talk.** In `in_kb_smith`, RMB on the smith standing beside the anvil did nothing. RMB on the anvil opened the anvil recipes. I found no way to reach the shop or forge menu (W2_realm_27-29). It may be the counter-less room: the keeper isn't behind a counter.
4. **Patrol job progress overshoots.** "Ride with a patrol" showed "Progress: 8/5" at hand-in. Cap it at 5/5.
5. **Woke up outside after sleeping at the inn.** After "Sleep here until morning" I woke on the street outside the Crowned Stag (`map wilds`), not inside. The brief says you wake at the inn. Also, **Enter didn't press "Start the day"** on the morning report.

## Quality of life
- **Getting stuck on plaza furniture.** Holding a direction key into a bench or the plaza fountain pins you there for 15 s or more with no sidestep. That happened twice in a row in the Kingsbridge plaza (W2_realm_75, W2_realm_76). Benches should be on the narrow-solid list or allow sliding.
- **The "to Hollowmere Farm" tracker label sits over the screen centre all the time.** It comes from the auto-tracked Empty Throne chapter 1. It covers the scene right above your head, even indoors. Kingdom test players won't want it on by default. A smaller label would help, or hiding it after the first 4 s, as the brief describes.
- **Entering Kingsbridge shows "THE WILDS" as the area title** at night, along with the "Night in the Wilds: stronger creatures roam" warning, even though you're inside a walled city (W2_realm_65). The city should announce itself as Kingsbridge.
- **Far clicks don't walk to buildings.** RMB on the Emporium walked me to the door without saying it was closed. Only pressing E showed "Closed. Open 9 am to 6 pm." The arrival should say so.
- **Finding buildings in town is hard.** Every building looks alike at night and only shops have signs. The barracks has no sign. I lost a few minutes going round in circles looking for the inn. The local map has labels, but there's no "you are here" at that zoom.
- **The map is good** (W2_realm_45, W2_realm_54). Towns are boxed and labelled with their buildings, roads are drawn, goblin camps show as green triangles, and the Regions list says exactly who holds each gate ("Closed. Bandit Warlord still holds the way."). It opens on the farm map by default, though, and you have to click "Back to the map of…" every time.
- **The inn has no Sell option.** Take-away food (Cheese Toast 317g, Pancakes 214g) costs 5-8 times the 40g hot meal, which makes "plain fare" feel odd.
- **Guilds work well.** I joined the Growers' Guild at Kingsbridge for 200g. The Ranks tab lists all five titles and their rewards, and the store shows what is locked by rank. It's clear. "Bring 10 Wheat (have 0)" is a nice touch.
- Talking to a guard (or a guildmaster) opens a huge window with a blurry, upscaled pixel portrait (W2_realm_25, W2_realm_79). It looks smeared in Painterly.

## Balance
- The patrol job paid 900g for about 2 minutes of following knights that killed slimes almost on their own. I barely hit anything and still got 8/5. It's easy money for 12 standing.
- The meal is 40g for full health and energy, cheaper than any take-away dish. Rest for 2 hours costs 120g, the same as a full night's sleep.
- Night came quickly (about 9 real minutes from noon to 7 pm). Exploring 440x330 Wilds on foot in that window feels short.

## Art & feel (Painterly)
- **Kingsbridge looks great by day.** The fountain plaza with market stalls, vendors, walkers and lamp posts feels alive (W2_realm_30, W2_realm_76). The walls and towers read well, and the road and wilderness transitions are pretty.
- **Knight patrols do walk and fight.** A patrol of 3 left the south gate, followed the road, cut down slimes and then gathered round me. Seeing them fight is good. But they then **follow you around** and stack on top of you (W2_realm_46-57). Wherever I walked, three knights crowded my sprite, and walking along a lake shore they stood in the water's edge. Is a patrol meant to escort the player?
- **People overlap:** two vendors drawn on top of each other at the red stall (W2_realm_76), and knights overlapping the player and the wall (W2_realm_48).
- **Night windows:** the barracks' outermost windows glow in odd half-pane or ivy shapes, not rectangles (W2_realm_61, W2_realm_66).
- **Signpost text floats over tree canopies** at the south gate crossroads. "Greyhelm ↗ · Ashford ↖ · Saltmere → · Emberhollow ↙" is drawn as one long line across two trees, and I couldn't see the post itself (W2_realm_60). It's hard to read at dusk.
- Characters are still crisp pixel sprites among the painted scenery. That's expected, but the knight armour reads as very blocky next to the painted trees.
- Interiors (guild, smithy, inn, barracks) look good: warm lamp light and painted floors. The barracks armour stands and beds are nice.

## Performance
- 116-131 fps everywhere: town plaza by day, roads, interiors, night, rain. Work was 1-4.5 ms per frame. The lowest reading was 116 fps in the dense meadow fighting slimes with the patrol. I noticed no stutters.

## Liked
- The map with towns, roads, camps and clear region-lock messages.
- Living town: walkers, stall vendors, guards on posts, knight patrols on the road that really fight.
- The guild windows (ranks, titles, store) and the barracks job flow (take it, track it in the journal with progress, hand it in).
- The inn's "Sleep here until morning" after 6 pm, the "Eat a hot meal" option and the rumour lines ("A wagon of royal silver went missing on the Greyhelm road").

## Top 5 fixes
1. **Open Kingsbridge's west and east gates.** The wall runs straight across both gate roads, so the town only has a south exit and the roads to the other towns dead-end at the wall.
2. **Stop the player getting stuck in walls and against furniture.** Barracks back wall; benches and the fountain in the plaza: sidestep or slide.
3. **Make the Kingsbridge smith talkable** (no shop or forge menu from him), and say "Closed" when you arrive at a shut shop by mouse.
4. **Show "Kingsbridge" instead of "THE WILDS" inside towns,** and skip the night-in-the-Wilds warning there. Tone down the always-on "to Hollowmere Farm" tracker label.
5. **Stop knight patrols escorting and stacking on the player.** Cap the patrol job at 5/5.
