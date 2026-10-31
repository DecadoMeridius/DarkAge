# Round 5: newcomer playtest (casual, impatient)

Port 9304, about 125 harness commands. Screenshots are `r5s4_<n>.png` in the playtest scratchpad folder. I played Mon 1 to Tue 2 midday, so I did not reach day 3.

## Summary
New game → creator → letter → planted and watered 4 turnips and 1 potato → tried fishing at the farm pond (gave up after 10+ casts) → walked to the village → bought garlic from Mara and sold 1 wood → looked at Pip's tavern menu → made 4 fences at the workbench → slept in the tent. On day 2: watered → attuned the farm waystone → went north into the Wilds → killed 2 slimes (and lost 61 HP doing it) → crossroads signpost and waystone → found a lost journal page in the ruins → reached Kingsbridge (busy plaza, guards, a knight patrol) → attuned its waystone → travelled home → read the farm notice board. **No JS errors all session.**

What worked best: the crossroads signpost and the trip from Kingsbridge home by waystone. What hurt most: fishing, the HP cost of slimes, and walk-clicks landing on the wrong tile because the camera moves.

## Bugs
1. **Click targets drift while the camera follows** (farm, day 1, shots 42-43). When you click a far tile you walk, the camera re-centres, and the next queued click lands on a different tile. I tilled two tiles I didn't mean to and planted on the wrong one. Any "click, click, click" farming row breaks.
2. **Right-clicking a shopkeeper behind the counter does nothing** (Drowsy Drake, Pip, shot 36). Right-clicking Pip's sprite did nothing. Right-clicking the counter opened the menu (shot 37). The same click on Mara worked.
3. **The Wilds map has no "you" marker on first entry** (shot 57). On the farm map you're a red dot, but on the Wilds map I couldn't find myself, even after Centre on me. Later, at the ruins, a small red dot did appear (shot 69). It may only show once explored, but on entry it's missing.
4. **Right-clicking the Wilds crossroads waystone didn't open the travel list.** It attuned on arrival, and the next Esc then opened Options (shot 63). At Kingsbridge it was the same: the first RMB only attuned ("The rune wakes…") and I had to press E again to get Travel.
5. **Fishing: no feedback on the hook window** (pond, shots 10-20). The "!" and "Hook!" appear for a short time and then "It got away…". If you click before it, you get "You reel in early. Nothing." After a hook, a bar minigame opens ("Hold to reel") with no explanation, and the fish escaped within a second. Over about 12 casts I caught nothing and spent ~30 energy. Partly this is harness latency, but a newcomer with a slow reaction would hit the same wall.
6. **Combat HUD shows out of combat** (every shot with the sword selected). "Focus 0 / Cleave / Lunge / Guard" sits bottom-left whenever the sword is held, even in the village and in the tent area, and covers the crop plot (shot 79). CLAUDE.md says it shows only when fighting.
7. **Weapon clicks don't walk** (in the paddock and the tavern, shots 22 and 38). With the sword out, clicking far empty ground with no enemy near only swings. Per the playtest-3 fix it should walk.
8. **Arriving in the village puts you inside the well** (shot 26). The player is drawn standing in the plaza well's opening.
9. **Getting stuck in fenced or walled areas.** WASD walked me into the paddock and the ruins, and it took several tries to find the one-tile gap back out (shots 21-25 and 70-71). It isn't a real trap, but it's annoying.

## Confusing
- Fishing (see bug 5). Nothing tells you to click on "!", then hold to keep the fish in the box.
- The hotbar has no empty slot, so there's no "just walk" option. Every click does something: Attack, Cast, Till.
- The waystone attunes on the first interaction and lists destinations only on the second.
- Small dialogs are huge: Nell's greeting (shot 74), the tent's Home window (3 buttons, shot 47) and the character creator all fill the whole screen with empty parchment.
- Talking to a townsperson (Nell) gives one line and Give a gift: no Chat, no quest hook.
- The Wilds map is a big beige sheet, so it's hard to judge distance. Kingsbridge looked very far but took about 1 in-game hour on foot.
- The well/fountain and the waystone overlap the player sprite oddly at times (the waystone sits behind your head on arrival, shot 77).

## First days
- The creator is quick and clear. Spiky hair and purple shirt applied correctly.
- The letter tells you exactly what to do (Mara's seeds, sleep before 2). Good.
- The workbench appeared on the first tick beside the tent.
- Planting info on hover ("Turnip · day 0/4 · needs water", then "watered") is great.
- Mara's store: clear rows (price, stock, grow days, sell price). Buy x5 has no confirmation, which is fine for casual players.
- The day-2 report announced The Hollow Crown and Odile's stray. Nice hooks.
- At 1-2 pm on a Monday the village plaza had **no villagers at all**. It felt empty.

## The Wilds
- Right outside the farm: flowers, tall grass and slimes. The first green slime died in ~3 swings, but **two slimes took me from 100 to 39 HP** within ~3 seconds. A new player with a wooden sword can nearly die to the first two slimes. Trail Bread (2 eaten) brought me back to 91.
- Slimes behind ruin walls hit me while hard to see and click (shot 66).
- The crossroads signpost with arrows to every town and the waystone next to it are excellent orientation.
- Seeing a knight patrol on the road (shot 64) made the world feel alive.
- Kingsbridge's west gate is easy to miss: the wall and tower art looks closed until you walk into it.
- Kingsbridge plaza (fountain, benches, stalls, many townsfolk, guards) is the best-looking scene I saw.
- Travelling home by waystone (Kingsbridge → farm) was instant and clear.

## QoL wishes
- An empty hotbar slot, or a modifier (Alt+click), to walk without using the held tool.
- A tutorial toast the first time you fish: "Click when you see ! · then hold to keep the fish in the green bar".
- Open the waystone travel list on the same interaction that attunes it.
- Size small dialogs to their content.
- Hide the combat ability bar unless an enemy is near or you're in combat.
- A clearer "you are here" marker on the Wilds map (pulsing, centred on open).
- Easier openings in fenced paddocks and ruins (wider gaps, or a click-to-path that finds them).

## Balance
- Slimes hit too hard for day-1 gear (about 30 HP per slime in a short exchange).
- Tavern meals are very expensive next to everything else: Country Bread 144g, Ale 308g, Veggie Stew 561g. Trail Bread sells for 8g and you start with 500g.
- Seeds look fair: turnip 23g → ~45g in 4 days; garlic 33g → ~60g.
- Energy: fishing attempts cost ~2-3 energy each with nothing to show for it.

## Looks
- Lovely pixel art everywhere: the plaza fountain, Kingsbridge stalls, shop interiors (Mara's shelves, the tavern hearth), knights.
- The broken greenhouse glass reads as a black-and-white checkerboard from a distance. It's a little noisy.
- The floating signpost labels are long one-liners that overlap the sign sprites (shot 64).

## Liked
- Clear crop hover text and the letter's instructions.
- The crossroads signpost and waystones.
- Lost journal pages tying into the story.
- Kingsbridge feels like a real city: guards, townsfolk and stalls.
- The farm notice board (weather, festival countdown, birthday, request).
- No errors and smooth performance.

## Top 5 fixes
1. Fishing onboarding: a clearer and longer hook window, plus a one-time explanation of the reel bar.
2. Day-1 slimes: lower their damage or give the starter sword more reach and knockback, so two slimes can't take 60% HP.
3. Clicks shouldn't land on the wrong tile while the camera recentres. Resolve each click target when it's issued, or block clicks during the walk.
4. Right-clicking a shopkeeper (Pip) behind the counter should open their menu, as it does for Mara.
5. Waystone: the first interaction should attune and open Travel. The Wilds map should always show the player.

## `errors` output
```
none
```
(checked mid-session and again at the end)
