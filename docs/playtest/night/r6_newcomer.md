# Round 6: methodical newcomer

Persona: a brand-new player who reads everything. Played through the harness only (port 9304, headless Chrome, 1600x900). Covered Day 1 and the start of Day 2: character creator, letter, getting-started list, tilling, planting and watering, fishing, Mara's store, a gift, the Wilds, a slime fight, an ember shard, Kingsbridge (waystone, market stall, inn meal), the waystone home, a workbench craft, sleep and morning watering.

Screenshots are in the session scratchpad as `r6s4_<n>.png`. `C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/playtest/`

## Summary
The first day feels warm and readable:
- The letter is clear and the getting-started list tells you what to do.
- Hovering a crop shows "Turnip · day 0/4 · watered".
- Shop rows say how long a crop takes to grow and what it sells for.
- Mara's gift reaction tells you how much friendship you gained.

Kingsbridge is a real step up and feels like a town: walls, towers, guards, a plaza with a fountain, stalls and an inn. It is also close to the village, which is good. The waystone loop works well: touch a stone to attune it, then pick Travel.

The weak points are input and movement:
- Several WASD holds did nothing at all.
- Once I was frozen in place in the inn until I clicked to walk.
- Fishing has a very short reaction window.
- Right-clicking a keeper behind a counter sometimes does nothing.

No JS errors at any point.

## Bugs
1. **WASD holds sometimes ignored (high).**
   - A held movement key often produced no movement at all, while the clock kept running.
   - Steps:
     - After closing the Wilds map with Esc, `w` held 6 s twice did nothing (r6s4_35/36). `a` and `s` then worked, and so did `w` after that.
     - Leaving the inn: after Esc, `a`/`s`/`d` holds did nothing twice in a row. The player stood frozen beside the corner table (r6s4_59/60).
     - Clicking the door tile to walk there freed me.
   - Likely causes: INPUT_GAP after closing a window swallowing a key that is already held, or being wedged against a stool or the road edge. Either way, the player sees "my keys don't work".
2. **Possible invisible block on the Wilds road just north of the village exit (medium).** I stood in the middle of the road below the "Old Mine: north" signpost and could not move north. After stepping sideways, north worked. r6s4_35/36.
3. **RMB on the innkeeper behind the counter did nothing (medium).** Hollis in The Crowned Stag: no walk and no menu, even from a few tiles away. Walking up and pressing E worked. Mara's counter worked with RMB. r6s4_56/57.
4. **RMB on a far waystone walks you there but doesn't open it (low).** On arrival I had to press E. Doors and counters act on arrival, so waystones should too. r6s4_51.
5. **A sword-click on far ground doesn't walk (low, may be intended).**
   - With the sword selected, clicking open ground out of reach did nothing, twice outside Kingsbridge with no enemy visible (r6s4_46, r6s4_49).
   - CLAUDE.md says a weapon with no enemy within 200 px should walk. Maybe an off-screen slime counted as nearby.
6. **Potato planted and watered at 6:40 pm still showed "day 0/6" the next morning (unclear).** Turnips planted that morning moved to day 1/4. Either the evening water didn't land (no energy was spent) or late-day planting doesn't count. Neither case gives the player any feedback. r6s4_68/70.
7. **The Wilds' first slime hit me before I saw it (low).** -3 while walking north on the road; the slime was beside a tree canopy. r6s4_39.
8. **The innkeeper was out in the plaza at 5:40 pm (low).** I left Hollis behind his counter at 5:20 and found him outside 20 minutes later, at dinner time. An inn keeper probably shouldn't go off duty in the evening. r6s4_62.

## Confusing
- **The signpost outside the Kingsbridge gate:** "Greyhelm ↑ · Ashford ↖ · Saltmere ↗ · Emberhollow ←". On the map Emberhollow is south, not west. It also doesn't say that you are at Kingsbridge.
- **The first Wilds signpost** names only the Old Mine and the coast, not Kingsbridge. Kingsbridge is the nearest and most interesting place, and I only found it through the map.
- **The world map at town scale is cramped.** Kingsbridge's labels (Inn, Shop, Kingsbridge, Forge) overlap, and zooming in barely helps. The town interior shows as fog/blocks until explored. r6s4_53/54.
- **The milestone wording:** "Bring 58 Woods to the request board" ("Woods" should be "Wood").
- **Forge recipe gating:** the Forge needs Smithing 10, but a newcomer doesn't know how to train Smithing without a forge. The recipe should say "train at Brann's smithy".
- **Rod hint indoors:** "LMB Cast" is shown in Mara's store with the rod selected. With the sword it says "LMB Attack" inside the inn, and with seeds "LMB Plant" on town cobbles. Hints should be context-aware: Walk or nothing when the action can't happen.
- **The fishing bite window is very short.** The first bite came about 1.5 s after the cast and I missed it. Clicking early says "You reel in early. Nothing." and still costs energy. With only the visual cue, timing is hard. A sound plus a slightly longer window would help a lot.
- **The gift picker** is the full bag window: hotbar, its drag instructions, worn equipment and stats. For "pick a gift" it's cluttered, and the hotbar instructions don't apply there.
- **The fiber icon** (green, many-legged) reads as a spider or bug.

## First days
- **Creator:** quick and clear. The window is very wide with lots of empty space on the right. Name, hair and shirt worked; Begin is easy to find.
- **Letter:** lovely tone. It says the Wilds include peaks and ashen wastes, which are actually separate regions, a small mismatch.
- **Farming:**
  - Hoe, seeds and can worked first time on adjacent tiles.
  - The workbench appeared beside the tent a moment after I started.
  - Crop hover text is great.
  - The can holds 40 and you start at 20/40, which is fine.
- **Fishing:** cast, bite after ~1.5 s, missed it twice, then "reeled in early". No fish caught, so I couldn't cook at the campfire. (Part of this is harness latency, but a real player who looks away for a second will miss it too.)
- **Mara's store:**
  - Clear rows with grow days and sell price, ×1/×5, and instant purchase.
  - Fence stock is only 4 a day.
  - Country Bread is 116g, which feels steep next to the 8g Trail Bread.
- **Friendship:** gave Trail Bread: "Mara liked it (+20 friendship, 220 to the next heart)". Clear and rewarding.
- **Workbench:**
  - Recipes show "(have N)" and greyed requirements.
  - Made Fence ×4 instantly ("Fence done.").
  - The category chips are nice.
- **Sleep:** the tent offers Sleep / Cook / Save. The morning report announced The Hollow Crown and Odile's stray.

## The Wilds
- **Entering the Wilds:** the village exit is a dark gap in the trees, and walking off the side of the road leads into a black void strip at the top of the village (r6s4_32).
- **Combat:** a slime hit me for 3, then 11 more while I held LMB on it. It died; Focus went to 10. Fine for a wooden sword.
- **The ember shard:** inside a ring of bushes just south of Kingsbridge's wall. "You can't reach that" at first; chopping one bush with the axe opened it. Picking it up started The Ember Pilgrims at once. A neat little puzzle.
- **Kingsbridge:**
  - Strong first impression: walls, towers with flags, guards on the wall-walk, a gate with a portcullis, a fountain plaza, stalls, many houses.
  - The market stall's prices are steep (Apple 119g, Goat Cheese 561g).
  - The inn's takeaway menu is wildly priced for day 1 (Knight's Feast 1,959g, Layer Cake 1,534g). The 40g hot meal is a great deal and fully restored my health and energy.
  - The rumour line ("the regent hasn't slept in the palace...") is a nice hook.
- **Waystones:** attuning by touch and the Travel list are clear. Kingsbridge → farm worked instantly. The farm stone was already attuned without me touching it, which is fine but undocumented.

## QoL wishes
- Make held keys work right after a window closes (or keep the gap shorter than a key hold).
- A sound and a bigger visual cue for a fishing bite, and a slightly longer window for the first few catches.
- Waystones open on arrival after RMB, like doors.
- "Kingsbridge" on the first Wilds signpost; fix the Emberhollow arrow at the gate.
- A cleaner gift picker (bag items only).
- Context-aware LMB hints indoors.
- Labels on the world map that don't collide at town scale.

## Balance
- Day 1 money: 500 → 345 after 5 turnip seeds (115g) and a 40g meal. A comfortable start.
- Inn takeaway, stall goods and fruit saplings (643-1,134g) are far out of reach for the first week, which is fine as long-term goals, but none of the inn's food is affordable early.
- Slimes near the road hurt a little (3-11 per hit) but are manageable at 100 HP.

## Looks
- Lovely pixel art throughout:
  - the farm, the greenhouse ruin, Mara's store interior, the inn with its fireplace and banner;
  - Kingsbridge's walls and towers;
  - the gate and the plaza fountain.
- The ability bar (Focus / Cleave / Lunge / Guard) sits over the scenery on the left, mid-height, and looks detached from the HUD.
- In the store's tooltip, the Trail Bread name box overlaps the Sort button. In the inn window, "Rest two hours" overlaps the bottom border of the last menu row.

## Liked
- Crop hover text and the grow/sell info on seeds.
- The gift reaction with exact friendship numbers.
- The ember shard in the bush ring: a tiny discovery moment that starts a story.
- Kingsbridge's scale and life (guards, stallholders, villagers walking).
- The waystone travel loop, and the cheap inn meal.

## Top 5 fixes
1. Held WASD ignored after closing windows, and the frozen player in the inn (bug 1).
2. The innkeeper behind the counter doesn't respond to RMB (bug 3); waystones should open on arrival (bug 4).
3. Fishing bite feedback: sound plus a longer window, and no energy cost for an early reel.
4. Signposts: name Kingsbridge on the first Wilds sign and fix the Emberhollow arrow at the gate.
5. Feedback when an evening-planted crop doesn't count as watered (or a fix if it's a bug, see bug 6).

## errors output
```
none
```
(checked mid-session and at the end)
