# Round 3: Towns player (Kingdom test)

Harness port 9302, about 120 commands. Screenshots are `r3s2_<n>.png` in the playtest scratchpad.

## Summary
I walked from the farm into the Wilds and followed the crossroads sign ("Kingsbridge ↗ · Greyhelm ↑ · Ashford ↖ · Saltmere → · Emberhollow ↙") to Kingsbridge. There I attuned the waystone, took a Town Hall job, ate a hot meal at The Crowned Stag, browsed and bought from a plaza market stall, got a blessing at the temple and looked inside the bank and the smithy. Then I walked east to Saltmere, attuned its waystone, bought take-away food and rested at The Salty Gull. The tavern let me stay past 2 am, I collapsed, and the game took **2,261g** and sent me home.

**I never found the Kingsbridge barracks.** I spent about 40 commands walking every wall and street. The map draws buildings as unlabelled brown squares and doesn't draw the walls. Doors only name the building once you're next to them. So the patrol job, the main goal of this round, wasn't done. Knight patrols were visible on the roads, though: a group of four near the crossroads and bridges, and guards at every gate.

Towns look great and feel alive, with many townsfolk, vendors at stalls, guards and lamps. Getting around inside them is the weak point.

## Bugs
1. **No way to find the barracks (Kingsbridge).** There are no labels on the map or the buildings, and doors only say what they are at close range. I found the temple twice, the inn twice, the bank, the town hall, the smithy, the emporium and several "Knock" houses, but no barracks. (r3s2_39, r3s2_58)
2. **Collapsed inside a tavern at 2 am, charged 2,261g.** I was at The Salty Gull in Saltmere at 1:10 am with a keeper present. The inn only sells "Rest two hours (120g)" and there's no bed for the night. The morning report said: "You stayed up past 2 am and collapsed (around 2 am). Someone carried you home and took 2,261g for the trouble. Sleep in your tent before 2 am next time." Collapsing inside an inn shouldn't happen, and 10% of 22k gold is a huge penalty. (r3s2_84)
3. **"Rest two hours" rested 1.5 hours.** It went from 11:30 pm to 1:00 am.
4. **Stuck spot at the Kingsbridge west wall towers.** Next to the round towers by the west gate and at the SW corner, the player stands half on the wall with the tower drawn over the legs. Holding S for 14 s did nothing; I had to step sideways. (r3s2_53, r3s2_56, r3s2_57)
5. **Stuck at the east gate.** Walking east from just inside the gate is blocked by the tower; I needed to go 1 tile down first. (r3s2_66)
6. **Player inside the fountain basin.** Walking north into the plaza fountain from the south, I ended up drawn inside the water ring. (r3s2_19)
7. **Player overlaps shop counters.** In the Saltmere fishmonger and the Salty Gull, the player stands on or inside the counter sprite. (r3s2_76, r3s2_83)
8. **Closed shops let you in with no feedback.** The Saltmere fishmonger at 10 pm and the Kingsbridge smithy at 6:10 pm: the door opens, the room is empty and E at the counter does nothing. There's no "closed, opens at 8:00" message (unlike the village).
9. **Monsters right outside the Kingsbridge east gate.** Two bats, a slime and later a crab attacked within about 4-6 tiles of the wall. The design says no spawns within 10 tiles. The biome there is labelled "SALTMARSH COAST". (r3s2_67)
10. **Wrong region banner inside Kingsbridge.** Walking near the north part of town showed "GREYSTONE HIGHLANDS". (r3s2_31)
11. **Name doesn't match the sprite.** A "Noblewoman" is drawn as a bearded old man in a tan shirt. The Noblewoman and the "Courier" also use the same line: "Fresh bread at the inn before nine. After nine, fresh opinions." (r3s2_49, r3s2_62)
12. **Title font glyphs.** "TOWN HALL" shows a broken H that looks like "TOWN ꞤALL". "SATCHEL", "TEMPLE OF THE EMBER" and "THE CROWNED STAG" show a TH/CH ligature-like glyph. Cinzel ligatures are still on in window titles. (r3s2_33, r3s2_27)
13. **Map labels cut by road lines.** "Fa m" and "Vill ige". (r3s2_13)
14. **The tracker label covers the signpost text** at the crossroads ("to Hollowmere Farm" sits on top of the sign readout). (r3s2_11)
15. **Can't reach a keeper behind the counter from across the room.** RMB on Hollis from mid-room did nothing; I had to walk up to the counter and press E. (r3s2_45)
16. **E at a waystone from directly below did nothing**; RMB on the stone opened Travel. (r3s2_87)
17. **Wrong plural in the journal.** "Bring 28 Hays to the request board".

## Confusing
- **Town jobs don't appear in the journal (J)** and have no tracker. "Wolves on the royal road: Clear 10 monsters from the meadows around Kingsbridge" gives no progress toast, and I couldn't tell whether my kills outside the east gate counted, because that area is "Saltmarsh coast", not meadow.
- **There's a mess of bridges and boardwalks along the river west of Kingsbridge.** Several bridges overlap or run along the river instead of across it. (r3s2_14)
- **Clicking ground with a sword attacks instead of walking** while a friendly guard is near. (r3s2_65)
- **The Wilds map draws dozens of parallel road lines** in a tangle north of Kingsbridge, so it's hard to tell which road leads where. (r3s2_5)
- **Walls are thin 1-tile strips.** Seen end-on (east and west walls), they look like a paved path rather than a wall. The north and south walls with crenellations look right.

## Each town
- **Kingsbridge.** The best-looking place in the game. It has a fountain plaza with four stalls and stallholders behind them, benches, lamps, a green-roofed emporium, a columned town hall and temple, a stone smithy with an anvil sign, an inn, a bank and many timbered houses. There are guards at the north, east and west gates, and plenty of townsfolk walking about (about 10 on screen in the plaza). Walls, towers and arched gates look solid from the south. Navigation inside is hard: the walls aren't on the map, nothing is labelled, and cobble paths sometimes end in grass. The temple was found from two different doors and looks different from outside each time.
- **Saltmere.** A fishing village on stilts with a pier and lamps. It has brown-hooded guards, a fishmonger, a chandlery, the Salty Gull tavern, a waystone, net racks and crates, and lit windows at night. It looks good. Inside, the tavern is a copy of the Kingsbridge inn's room (same shelves, kegs and fireplace), with only the banner changed.
- **Greyhelm and Ashford.** Not reached; I ran out of budget.

## Patrols and jobs
- **Patrols.** I saw a group of four knights (purple tabards) on the road north of the crossroads and walking along the bridges west of Kingsbridge. They were clearly visible on the roads. I never fought next to them because I couldn't take the patrol job.
- **Guards.** Two at each Kingsbridge gate, plus brown-hooded guards at Saltmere.
- **Town Hall jobs** (Mayor Osric, "Town jobs · Standing 0/100"):
  - "Wolves on the royal road (700g)": 10 kills. Taken; progress unknown.
  - "Bread for the garrison (600g)": 20 wheat.
  - "Mail for the knights (1100g)": 10 iron bars.

  "Job taken: Wolves on the royal road" was shown as a toast. The Hand in button is greyed out.

## Shops and prices
- **Kingsbridge market stall** ("Fresh from the farms around Kingsbridge"):
  - Apple 119g, Cherry 104g, Peach 168g, Orange 120g, Plum 106g, Honey 180g.
  - Cherry Jam 264g, Plum Jam 272g, Grape Wine 306g.
  - A Cheese Press for 389g (odd at a fruit stall).

  The stall buys back an apple for 100g, which is 84% of the 119g buy price. That spread is so narrow it invites arbitrage between towns. A single 119g apple is very expensive.
- **The Crowned Stag (Kingsbridge):**
  - Hot meal 40g, which fully restores health and energy: "A bowl of the house stew and fresh bread. Health and energy restored."
  - Take-away: Harvest Roast 972g, Knight's Feast 1,959g, Cheese Toast 331g, Pancakes 224g, Country Bread 111g, Layer Cake 1,534g.
  - Rest two hours 120g.

  The hot meal is great value. The take-away food is extremely expensive next to it.
- **The Salty Gull (Saltmere):**
  - Hot meal 70g.
  - Take-away: Fisher's Stew 433g, Pearl Chowder 684g, Grilled Fish 113g (bought one), Sushi Roll 332g, Corn Chowder 426g.
- **Temple:** "Ask for a blessing" gave no visible feedback, no toast I could catch and no buff icon. "Give 100g to the poor" is also offered.
- **Bank** (Kingsbridge): I entered but didn't open the menu.

## Travel
- Farm to Kingsbridge on foot took about 2 game hours (6:50 to 8:40 am); Kingsbridge to Saltmere was about 1.5 hours walking at night. That feels fine.
- The crossroads signpost and the signs at the town gates are very helpful.
- Waystones:
  - Attuning gives a clear message: "The rune wakes under your hand: Kingsbridge."
  - The farm waystone's Travel list showed Kingsbridge and Saltmere.

## QoL wishes
1. Label buildings on the town map (Inn, Barracks, Town Hall...) and draw the walls and gates.
2. Put town jobs in the journal, with a tracker and kill progress toasts ("Wolves 3/10").
3. Inns should offer "Sleep until morning" (a room for the night) and should never let you collapse indoors.
4. Closed shops: keep the door shut with "Closed, opens 8:00", as in the village.
5. A name plate when hovering a door from a distance, not only up close.
6. Keepers behind counters should be reachable by RMB from anywhere in the room (walk to the counter).

## Balance
- The 2 am collapse penalty of 2,261g (about 10% of gold) is brutal and, in an inn, unfair.
- Take-away food at 1-2k gold vs a 40g hot meal; stall fruit at 104-180g each.
- A crab outside Kingsbridge did 13-40 damage a hit to an iron-armoured combat-30 character; bats and slimes were trivial.

## Looks
- Kingsbridge and Saltmere are beautiful: stone and timber variety, trade signs, lamp posts, stalls with produce, stained-glass temple windows and a lit Saltmere at night.
- Interiors are nice but reused: the inn and tavern are the same room.
- End-on walls look like paths. The tower tops are drawn over the player at the west towers.

## Liked
- Arriving in the Kingsbridge plaza with the fountain, stalls and a crowd.
- Gate guards and knights on the roads give the realm a lived-in feel.
- Signposts that point to every town.
- The cheap hot meal that refills everything.
- Waystone travel worked once attuned.

## Top 5 fixes
1. Make the Kingsbridge barracks findable: map labels for buildings, plus walls and gates on the map.
2. Never collapse inside an inn or tavern; add an overnight room. Reconsider the 10% gold penalty.
3. Put town jobs in the journal with progress, and say clearly which areas count as "the meadows around Kingsbridge".
4. Fix the stuck spots at the wall towers (west gate, SW corner, east gate), the walk-into-fountain, and standing on shop counters.
5. Show "Closed" on shop doors after hours; keep monsters out of the 10-tile ring around Kingsbridge (east gate).

## `errors` output
```
none
```
