# Round 2: newcomer (second opinion)

Persona: a brand-new player. New game, creator ("Wren", pony hair, green shirt), arrival letter, then day 1 from 6:00 am to 10:30 pm. About 115 harness commands on port 9304. Screenshots are `r2s4_<n>.png` in the playtest scratchpad (`.../scratchpad/playtest/`).

## Summary
The first 30 minutes work well. The creator, the letter, the Getting started checklist (J), tilling, planting, watering, Mara's x5 buy, Hale's plans and the workbench all do what you expect, and the checklist ticks off steps 1-4 on its own. Then two things went wrong:
- **Moving around is the main problem.** I was stuck in the north tree lines of the farm and the village (the player walks *into* the border trees and is hidden or stuck there). Room exits only work if you line up with the door. Far clicks with a tool walk off and act somewhere I didn't mean, because the camera has re-centred by the next click. A click on the dock opened the Bag.
- **The Wilds at dusk are very punishing for a newcomer.** A level-1 crow took me from 100 to 2 HP and cost me a life. A wolf on a bridge then took me from 92 to 5 HP. For a long stretch my hits seemed to land on nothing, and once the attacker was invisible (possibly drawn under the bridge planks). I never reached Kingsbridge: the road north from the farm-side lake leads north, not toward Kingsbridge in the east, and the map doesn't show which road goes where.

No JS errors all session.

## Bugs
1. **Player walks into the north border tree line and gets stuck or hidden** (village north exit area, farm north edge). In the village, the player was drawn above the visible area at the top edge (r2s4_18/19). On the farm, the player stood inside the trees; S barely moved them, and a far click with the sword did nothing (r2s4_53-57). The way out was to switch to the rod and click-walk.
   *Steps:* farm, walk W into the top tree line north of the tent, then try to walk S or E.
2. **Exiting rooms (Mara's store, Hale's) with S fails unless you line up with the door.** No corner sliding into the 2-tile doorway. I needed D+S or a click on the doorway (r2s4_29, r2s4_34). Leaving Hale's with S also walked me straight into the tree line south of the building (r2s4_35).
3. **Invisible attacker.** On the bridges north of the farm (night), HP dropped 28 → 2 and later 34 → 5 with no enemy visible (r2s4_68, r2s4_71). Earlier, a wolf was visible standing on the planks (r2s4_70). My guess is that enemies under or among bridge tiles are drawn beneath the bridge.
4. **My attacks on a crow did no damage for about 10 seconds.** Holding LMB and clicking right on it left it at 9/18 while it took ~50 HP from me (r2s4_64-67). The crow hides under tree canopies and darts about, and the wind-up wedge shows, but nothing landed.
5. **Clicking the dock area to walk opens windows.** A click at 1450,160 (meant for the road) hit the Bag tile. The dock covers a big strip of playfield on the right.
6. **Clicking the already-selected hotbar slot opens the Satchel** (r2s4_73). Twice I tried to "click the bread to eat" and got the bag instead. Food is eaten with LMB on the world (hint "LMB Eat"), which I only found by accident.
7. **Pressing the 0 key did not select slot 10** (the status line still said slot 7). Clicking the slot worked. This may be the harness, but worth checking.
8. **The street Shop/Smithy button is orange (active) before opening hours.** It only says "We open at 9 am" after you click it, and only then turns grey (r2s4_14/15, r2s4_17).
9. **Arriving in the Wilds from the village north road puts you in tall grass beside the road** rather than on it (r2s4_21).
10. **Far clicks with the hoe or seeds scatter the work.** After the first click walks you, the camera re-centres, so the next clicks (same screen coordinates) land on different tiles. I ended up with 4 lone tilled squares spread over the field (map r2s4_45). Mostly my fault, but a newcomer will do exactly this.

## Confusing
- I didn't know how to eat. RMB on yourself does nothing, and clicking the slot opens the bag. "LMB Eat" only appears at the bottom once the bread is selected.
- **Tall grass blocks walking.** In the meadow south of the farm I spent a while unable to walk north (r2s4_44-47). It looks like decoration.
- **Mara's line in sunny weather:** "Rain saves you a whole morning of watering". It reads as a hint that it's raining.
- **Talking to a shopkeeper behind the counter:** RMB on Hale did nothing. RMB on the counter opened the shop.
- **Shops open at 9.** You arrive at 7:30 and nothing tells you beforehand (the letter could mention it).
- **The Wilds map is almost blank.** Towns are shown, but not the roads between them or which exit leads where. The road I found went north and away from Kingsbridge.
- **Weapon logic:** the Wooden Spear costs 4 wood while the Wooden Sword costs 16 wood. Why would anyone make the sword?
- **The arrival letter window is huge for its text,** with the big empty parchment below it.

## First hour
- 6:00: till 2 tiles, plant 3 turnips, water. The checklist ticks steps 2-4 at once, which is nice.
- Road east to the village (8 s of walking). Mara and Brann are on the street; Chat works and gives a heart-bar nudge.
- Shops shut until 9. I wandered to the Wilds gate, then came back.
- 9:30: Mara's store. **x5 turnip seeds worked instantly** (115g, stock 40 → 35, no confirmation). Garlic x5 also worked. x5 is greyed when you can't afford it (good). The Pantry tab is clear.
- Hale's workshop: blueprints are explained well. Prices (Cottage 1600g, Coop 2400g) look far off from 500g starting money, but that's a goal.
- Workbench: recipe rows "4 Wood (have 15)" are very clear, the "You are at a workbench" line helps, and I made a Wooden Spear ("Wooden Spear done.").
- Tried to plant 10 more seeds. The camera-shift problem scattered them, and tall grass blocked my way back.

## The Wilds for a beginner
- I went north from the farm around 6:20 pm. Lakes, then a road. I picked up an ember shard on the road, which started The Ember Pilgrims (good surprise).
- **Monsters near the roads are too strong for day 1:**
  - A Crow (level 1, 18 HP) dealt about 98 damage over ~90 seconds and cost a life.
  - A wolf on the bridge did 8 per hit and took me to 5 HP.
  - With a wooden sword (Attack 4) the fights felt unwinnable. The crow is fast, and my hits mostly whiffed.
- The lives system saved me (revived at 92 HP, "♥♥" left). That's good, but nothing explained it.
- Night falls around 8 pm; I didn't see the "night warning on the first trip".
- I didn't reach any town. Getting home would mean walking back, because I found no waystone on the way.

## QoL wishes
- Push the player out of border trees, or make tree lines solid at their trunks so you can't walk in.
- Corner-slide into doorways in rooms.
- Show roads on the Wilds map once seen, and add a "nearest town" arrow or signpost from the farm-side exit.
- Right-click on food in the hotbar (or press F) to eat. Clicking the selected slot shouldn't open the bag.
- Grey out the street Shop button before opening hours ("Opens 9:00").
- Keep tool clicks relative to the world: queue several far clicks on the same area, or warn when the camera moves.
- A first-time tooltip for tall grass ("cut with scythe") when it blocks you.

## Balance
- The Level 1 Crow is far too strong against a fresh character, mainly because hits rarely land. Either make crows easier to hit, give them less damage, or keep them out of the first meadow.
- Wolves next to the starting lake/bridge road: 8 damage per hit is a lot at 100 HP with 5 bread.
- Wooden Spear (4 wood) vs Wooden Sword (16 wood).
- Seeds: turnip 23g → sells ~45g; cabbage 102g → 152g over 10 days. Reasonable.

## Looks
- The farm, village, store and carpentry interiors look lovely. The fountain plaza, signs, waystones and the dusk/night grade are great.
- **The bridges north of the farm look broken:** a jumble of plank stacks at different orientations, with disconnected pieces and pieces floating in the water (r2s4_70-72).
- The arrival letter window has a big empty area.
- Faint village tree line: the player is drawn translucent behind the trees, which helps but also shows you're somewhere you shouldn't be.

## Liked
- The creator, the letter tone and the world seed.
- The Getting started checklist and story start dates in J ("Begins on day 3. Pip at the tavern...").
- Shop rows with grow days, season and sell price; working x5 buttons; recipe rows with "have N".
- The farm map (M) with "You", the tent and exits is great for orientation.
- The ember shard pickup that starts a story, and the "Defence is now level 3!" pop-up.
- The lives system as a safety net.

## Top 5 fixes
1. Stop the player walking into border tree lines (farm north edge, village north and south edges), and free them if they're already inside.
2. Make early Wilds enemies hittable and softer: the crow especially, and wolves near the first roads. Check the invisible attacker on bridges.
3. Let room exits slide into the doorway, so S out of a shop always works.
4. Make eating discoverable (right-click food, or a key), and don't open the bag when you click the selected slot.
5. Wilds map: draw explored roads, and point newcomers to Kingsbridge (signpost at the farm-side Wilds entry, or a road from there).

## `errors` output
```
none
```
(checked twice, mid-session and at the end)
