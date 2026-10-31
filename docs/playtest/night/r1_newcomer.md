# Playtest r1: brand-new player (first day and a half)

Tester persona: someone who has never played. New game → creator → letter → day 1 farm → village → Wilds → Kingsbridge → lost in the forest → home → day 2 morning. About 105 harness commands, port 9304, origin `[::1]:5174`. Screenshots are in the playtest scratchpad as `s4_<n>.png`.

## Summary
The first 30 minutes on the farm and in the village are smooth and nice to look at. The tilling, planting and watering flow, the crop hover labels ("Turnip · day 0/4 · needs water"), the closed-shop messages and the shop rows (grow days, sell price) are all clear. Once I went into the Wilds it got rough fast. Kingsbridge is a few steps north of the village gate, which is a great landmark. But a level-11 Wild Boar and a level-9 Grey Wolf sit right outside it, and I was combat level 5 with a wooden sword. I lost all 3 lives in about 2 minutes of game time. The Wilds' dense forests then had me walking in circles, the crossroads sign doesn't point home, and the world map's Farm/Village labels are in the wrong place. I only got home by using the Kingsbridge waystone and walking south. JS errors: **none** for the whole session.

## Bugs
1. **World map: Farm and Village exit labels are misplaced** (s4_28, s4_29, s4_48, s4_59). On the Wilds chart the "Village" label sits at about 45% of my real entry x (I entered from the village at x≈221 tiles, the label sits at ≈100). The ratio is exactly 2.2, so the labels still use pre-`WK` coordinates. "Farm" is off by the same factor.
2. **Getting-started steps done out of order are never ticked** (s4_72). I watered my turnips on day 1 before buying seeds. On day 2 "Sleep" was ticked but "Water your crops" wasn't, until I watered again on day 2. It looks like a step only counts when it is the current one, or the check is "a watered crop exists now", which resets overnight.
3. **Signpost blocks the Kingsbridge south gate** (s4_63). After using the Kingsbridge waystone I held S for 9 s and stayed stuck in the gateway. The signpost stands on the tile straight south of the arch, so I had to sidestep. It's the only exit a newcomer from the village uses.
4. **E doesn't open the shop at Mara's counter** (s4_20). Standing at the counter facing Mara, E did nothing and there was no prompt panel. RMB on Mara opened the shop (s4_21).
5. **x5 purchase confirm bought 1** (s4_22, s4_23). I clicked x5 Potato Seeds and got "Buy for 235g?". Clicking the confirm bought **one** packet (gold 500→449, stock 40→39). Also 235 ≠ 5×51 = 255, so the price on the confirm doesn't match the row. Right after, x5 Garlic bought 5 with no confirm at all, so the confirm is inconsistent.
6. **Street greeting shows Shop as active while the store is closed** (s4_17). The button is orange; it greys out only after you click it and Mara says "We open at 9 am". The prompt "E Shop · Mara's Store" also shows on a closed door (s4_16).
7. **Wild boar standing on deep water** (s4_39, s4_40). The boar was drawn in the middle of a pond bay, and my swings from the shore did nothing to it.
8. **Crossroads signpost has no "Emberhollow" arrow** (s4_61). The Wilds crossroads sign lists Kingsbridge, Greyhelm, Ashford and Saltmere, but not home. The Kingsbridge gate sign says "Emberhollow ←" (pointing west), but the village is due south of that gate (s4_30).
9. Minor: in the creator, "BOOTS" renders as "BꝎTS" (Cinzel ligature, s4_2). The ligatures-off fix doesn't cover the creator labels.

## Confusing
- **Slot 9 looks like bread but is Potato Seeds.** The potato-seed packet icon reads as a loaf at hotbar size. In my first fight I pressed 9 to "eat" and got "Till the soil first." The real Trail Bread was only in the backpack, not on the hotbar. A new player in their first fight can't find their food.
- The checklist says "Buy seeds at Mara's", but you start with 15 turnip and 5 potato seeds, so step 1 isn't needed to start farming.
- The checklist lives only in J → Quests. There's no HUD widget, so after the letter there's no visible "next step".
- Clicking a building or gate with the sword selected does nothing (no walk). I had to switch to an empty slot to click-walk through the Kingsbridge gate. The auto-walk-with-weapon rule (no enemy within 200 px) didn't trigger next to the gate.
- The farm and village waystones aren't attuned until you touch them, and nothing tells you to. When I was lost, the waystone list only had Kingsbridge and the crossroads.
- The town gate graphic: the arch is drawn at the foot of the wall while you walk over the wall-walk band (s4_32). It reads as walking over the wall.
- The shipping bin lists your seeds and your last Trail Bread at the top, so they're easy to sell by accident.

## First hour flow
1. New game → creator (fine, but a huge mostly empty window) → letter (good tone, clear directions: "follow the road east", "north lie the Wilds").
2. The farm starts at 6:00 with tent, campfire, workbench and bin. The workbench pops in a second later. Hoe → till, seeds → plant, can → water: all worked first try, with good hint labels ("LMB Till / Plant / Water"). The can starts at only 20/40.
3. East along the road to the village: easy. The village map (M) is excellent: labelled buildings, "You" dot, exits.
4. Mara's opens at 9; arriving at 8:20 meant waiting. Opening hours are shown clearly.
5. North to the Wilds at 10:30, then straight to Kingsbridge (about 30 s walk). Attuned the waystone and saw the market stalls and fountain.
6. Went west to explore and immediately fought a level-11 boar and a level-9 wolf. Lost all 3 lives, ate 4 of 5 breads, and spent the rest of the day lost in a dense forest.
7. Got home at about 21:00 via the Kingsbridge waystone and a long walk south. Slept; the morning report announced The Hollow Crown and the stray. Tracking it shows a nice "to Emberhollow Village" arrow on the farm.

The checklist helped for farming. It doesn't cover "where to go / what's dangerous" at all.

## The Wilds for a beginner
- **Too dangerous right outside town.** The meadow 15-20 tiles west of Kingsbridge had a level-11 Wild Boar (76 HP; my wooden sword did about 4-12 a hit) and a level-9 Grey Wolf (60 HP). They take about 10-15 HP per hit and chase faster than I walk. The 3-lives system kept me alive, but on day 1 that's all it did. There's no early hint that the area west of Kingsbridge is not a starter zone.
- **Getting lost:** the old-forest band is a wall of overlapping canopies. You can walk under canopies but trunks block, so WASD keeps snagging and click-walk often refuses (s4_49, s4_54). Roads fork without signs (s4_58). The map fog only shows what you've seen, and the misplaced Village label sent me the wrong way.
- **Way home:** no home arrow on the crossroads sign and no auto-attuned home waystone. Without knowing that the village is directly south of Kingsbridge, I'd still be out there.
- **The good side:** Kingsbridge being visible and named on the map from the start, a short walk away, is a strong landmark. Walls, towers, guards and the plaza look impressive.

## Quality-of-life wishes
- Show the current getting-started step on the HUD (one line under the clock).
- Put Trail Bread on the hotbar at the start, or give food a distinct hotbar icon. Make the seed packet icon not look like bread.
- Attune the farm and village waystones from the start, or add a "Home" button in the waystone window.
- Give every Wilds signpost an "Emberhollow / Farm" arrow, and show the village and farm entrances as yellow exits on the Wilds map.
- Level badges or colour on enemy nameplates before engaging (red when far above your combat level).
- Let a selected weapon click-walk to gates, doors and ground when no enemy is near (it worked in the village with an empty slot only).
- Make E work at shop counters the same as RMB.
- Size the small windows (Home tent, Waystones, Shipping bin, creator) to their content; they are full screen with three buttons.

## Balance
- Wild Boar lv11 and Grey Wolf lv9 in the meadow ring around Kingsbridge on day 1 are far above a combat-5 starter with a wooden sword. Each fight cost me a life.
- Bread heals about 25 HP; 5 breads aren't enough for one boar fight.
- Starting can at 20/40 is fine. Seed prices look sane (turnip 23g → ~45g).

## Looks
- Farm, village, store interior, Kingsbridge plaza, walls and towers all look great; the evening amber and night blue grades read well.
- The Kingsbridge fountain's water pool spills past the stone rim as a rectangle of water on the paving (s4_33).
- The plank boardwalks near Kingsbridge form odd staircase shapes over the lake (s4_37, s4_38).
- Guards are drawn standing on the tower roofs (s4_30, s4_32).
- Canopy fade over a faded wolf makes enemies very hard to see in the forest (s4_51, s4_54).

## What I liked
- The farming loop's on-cursor labels and hints are excellent for a newcomer.
- Closed-shop messages with hours, and Mara's chat window.
- Shop rows that say grow days and sell price.
- The village map.
- The morning report.
- The story tracker arrow with the destination name.
- The waystone UI.
- No JS errors at all.
- The 3-lives system saved me three times; the hearts refill visibly.

## Top 5 fixes
1. Make the starter area around Kingsbridge and the village gate safe: low-level enemies only within about 40 tiles. Boar 11 and wolf 9 belong deeper in.
2. Fix the Wilds map Farm/Village labels (multiply by `WK`) and add home arrows to every signpost; auto-attune the farm and village waystones.
3. Put Trail Bread on the hotbar and make the potato-seed icon distinct from bread.
4. Tick getting-started steps whenever they happen (out of order too), and show the next step on the HUD.
5. Move the Kingsbridge south-gate signpost off the gate tile, and fix the x5 buy confirm that buys 1 at the wrong price.

## errors output
```
none
```
(checked twice, mid-session and at the end)
