# Round 3 – brand-new player (port 9304)

Screenshots: `C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/playtest/r3s4_<n>.png`

## Summary
I started a new game, made a character and read the letter. On day 1 I tilled, planted and watered 8 tiles near the tent and on the farm road, made fences at the workbench, walked to the village, talked to Mara and Brann, bought seeds once Mara opened, chopped a tree and slept in the tent at noon. On day 2 I watered, attuned the farm waystone and went into the Wilds. I lost the road, fought 2 slimes, a rat-like thing and a crow, and reached the Kingsbridge walls at about 10:00. The crow nearly killed me (I lost a life and used all 5 breads). I walked along the east wall, entered through the east gate, found the plaza waystone and travelled home with it. There were no JS errors.

The farming loop and the village are clear and look lovely. The first hours in the Wilds are not beginner-friendly. A level-1 crow next to the capital took about 200 HP off me and was very hard to hit. Slimes are hard to see in tall grass. The roads are easy to lose with WASD.

## Bugs
1. **Crow is nearly impossible to hit; its sprite floats far from its hitbox** (Wilds, south-east of Kingsbridge, `r3s4_55`–`70`). The crow sprite flies 60–90 px above the dashed red ground marker. Clicks on the sprite mostly missed and clicks on the marker missed too: the crow stayed at 18/18 for about 10 clicks, then sat at 1/18 for many more. It kept hitting me for 4–6 each time. At one point it was out of sight on the wall or tower roof (`r3s4_56`, `62`) and still hurt me ("invisible attacker"). It finally died to Lunge (X).
2. **Holding or clicking LMB with the sword seems to walk me toward the target.** The camera shifted 1–3 tiles between clicks during the crow and slime fights (`r3s4_48`, `65`, `67`). So the spot I clicked was no longer where the enemy was. The guide says "weapon clicks never walk you". Part of this may be harness timing, but the drift was large and consistent.
3. **Map labels are clipped**: "Fa m" and "Vill ge" at the bottom of the Wilds map (`r3s4_41`, `43`, `53`).
4. **Ligature or glyph problems persist**: "BꝎTS" in the character creator (`r3s4_2`), and "SATCHEL" has an odd H. "Year 1" shows as "YEAR I" in the morning report (Cinzel numeral).
5. **Typo**: request board says "Bring 8 **Potatos**" (Quests tab).
6. **Mara's street Shop button looked enabled (orange) at 7:30 am.** Clicking it then said "We open at 9 am" and greyed it (`r3s4_14`, `15`). It should be greyed from the start.
7. **Waystone drawn on the player's head** after travelling home: the stone sprite sits on top of the character (`r3s4_76`). This is a z-order problem.
8. **RMB on the tavern door walked me beside the door (to the left of it), not in front.** I needed an extra E (`r3s4_18`).
9. **RMB on a new waystone only attunes** (toast). The list needs a second interaction (`r3s4_75`). Not a bug exactly, but surprising.
10. **The Home (tent) window is huge** for 3 buttons (`r3s4_34`). The morning report window is mostly empty space too (`r3s4_35`).
11. **Buying seeds**: the x5 confirm ("Click x5 again to buy for 255g") seemed to expire. My second click on Potato x5 bought nothing. Turnip x5 (115g) needed no confirm, so two quick clicks bought 10 turnips by accident.

## Confusing
- **Day 1 morning, nothing is open.** You start at 6:00, the checklist's first step is "Buy more seeds at Mara's", and every shop (Mara 9, Brann 9, tavern 12) is shut until 9. I wandered for 3 in-game hours. Starting at 8:00, or a line in the letter ("Mara opens at 9"), would help.
- **Finding Kingsbridge's gate.** Seen from the north, the east road appears to run straight into a tower and wall (`r3s4_71`). The gate is just a gap with two guards and no arch, so it doesn't read as a gate from outside. The map shows the city as a tiny square and doesn't draw its walls or gates.
- **The road out of the farm into the Wilds** is easy to lose. I left it in the first minute. Trees block WASD with no sliding around trunks (`r3s4_44`), and I ended up wading through bush and pond edges.
- **Enemies in tall grass**: green slimes are almost invisible in green tall grass. I took 30–60 damage before seeing them (`r3s4_49`, `50`).
- **Lives**: I lost a life without noticing. The only feedback was the hearts turning grey and HP jumping to 96. A clear "You were knocked down – 2 lives left" banner would help.

## First hour
- The character creator is quick and clear. Its window is oversized.
- The letter is good and gives clear direction.
- The Getting-started checklist is helpful.
- Till, plant and water work well. The "Turnip · day 0/4 · watered" hover text is excellent.
- The hotbar hint ("LMB Till / Water / Walk / Eat / Attack") is great for a newcomer.
- The workbench window is clear: the "4 Wood (have 15)" rows and greyed "Needs Farming 10" rows are good.
- The village is charming and easy to read with the M map. Door prompts with building names work well.
- Shop rows tell you grow days, season and sell price, which is ideal for planning.
- Eating is clear: select the bread and LMB shows "Eat".
- Sleeping in the tent and the morning report work well. The story announcement is nice.

## The Wilds for a beginner
- The road from the farm to Kingsbridge is short (I arrived about 3 in-game hours after leaving). The city is a great sight.
- **Too dangerous for day 2 with a wooden sword and 5 Trail Breads.** In about 6 in-game hours I lost about 330 HP: rat 16, two slimes about 60, crow about 200+. I used all 5 breads and lost one life.
- A level-1 crow should not be the deadliest thing a newcomer meets, least of all next to the capital's walls. Make crows easier to hit, or lower their damage or attack rate. At minimum, put the hitbox where the sprite is.
- Slimes beside the road in tall grass hurt a lot (-4 to -6 per hit, frequently).
- The region within ~10 tiles of the road should be calmer, or roads should be a safe corridor.
- The waystones are great: attuning the Kingsbridge one and travelling home was instant and clear.

## QoL wishes
- An "on the road" indicator, or roads drawn more strongly on the minimap, plus signposts at forks (I didn't see one on the way).
- Show the player's facing or path on the Wilds map, and let a map click set a waypoint marker.
- Sliding around tree trunks when walking with WASD.
- A visible hint when a shop opens ("Opens in 1h 50m").
- The Home window should be small.
- Show which hotbar slot has food when HP is low ("Low health! Eat something" appeared, but slot 0 was already empty).

## Balance
- Starting food (5 Trail Bread, about +11–27 HP each) is too little for the Wilds encounter rate on day 2.
- Starting gold (500) went fast: 230g bought 10 turnip seeds by accident. It's fine, but the double-buy is easy.
- Crow: 18 HP but effectively immortal for a newcomer. Rat and slime are OK one at a time, harsh in groups.

## Looks
- The pixel art is lovely throughout: the village, the shop interior, Kingsbridge's fountain plaza, stalls and guards.
- The greenhouse ruin changes look between grades (pinkish at dawn, glassy at noon). That's fine.
- Problems: the waystone overlaps the player's head after travel, and a ghostly translucent circle appears near trees (canopy fade, `r3s4_42`, `52`). The player walks over the edge of the farm's west tree line (`r3s4_33`).

## Liked
- Hover text on crops, the hotbar action hints and the door/name prompts.
- Mara moving from the street into her shop at opening time.
- The Kingsbridge plaza, the guards at the gate and the waystone attune message ("The rune wakes under your hand").
- "A life came back (3/3)" after travel.

## Top 5 fixes
1. Fix crow combat: align the hitbox with the sprite, make it hittable, no attacks while invisible, and lower its damage or attack rate near roads.
2. Make the area near roads and towns safer for days 1–3, and make slimes readable in tall grass (outline or shadow).
3. Make weapon clicks never move the player or camera, so aimed clicks land where you clicked.
4. Make Kingsbridge's gates readable: an arch or gatehouse sprite, and walls and gates drawn on the map.
5. Day 1 onboarding: start at 8:00 or say that shops open at 9; grey the shop buttons before opening; make the tent and morning windows small.

## `errors` output
```
None
```
