# W3 — Calendar and long-run test (one in-game year)

Tester: W3_year (port 9301). New game "Yara", tutorial skipped ("I know my way around a farm"). Painterly + FPS counter
were already on in this profile. Time was moved mostly by console: a helper (`h9301_adv.mjs`) calls `endDay()` once per
day, waits 0.7 s, logs the morning report, farm/Wilds object counts, save size and JS heap, then closes the report.
Played by hand on festival days and a few others. A test patch of 8 crops (rhubarb, cabbage, corn, moonblossom,
strawberry, tomato, wheat, kale) was planted by console around a sprinkler next to the tent on Spring 1.

Note: the dev server was not running when I started; I started `npm run dev` myself (port 5173).

## Spring, Year 1 (days 1-28)

- Morning reports announce the stories one per day (Hollow Crown day 2, Lost Lanterns 3, Salt Smugglers 4, Ashcombe
  Signet 5, Ember Pilgrims 6) and Odile's stray hint on day 2. Good, but five story starts in five days on top of the
  getting-started list is a lot at once for a brand-new player.
- **Birthdays and festivals are not in the morning report.** Mara's birthday (Spring 8) gave "A quiet night"; Blossom Day
  morning (Spring 13) also said "A quiet night". Both are only toasts (`lifeMorning` in r_life.js), which pop while the
  report window is open and are easy to miss. They should be lines in the report.
- **Meadow grass ate the whole test field.** 7 of 8 crops were "choked" by grass in 28 days (only cabbage survived, then
  withered at Summer). Tiles go back to grass, crop lost, including the all-season moonblossom. At 4%/tile/day an
  unfenced plot loses about two thirds of its tiles over a season; a new player with 500g can't fence yet. This is
  far too punishing for the early game (suggest 0.5-1%/day, or only untended/unwatered/empty soil, or a grace period
  for crops that are growing).
- Blossom Day (played): villagers gathered round the plaza fountain, six lanterns and a row of flowers along the plaza's
  north edge, 14 eggs spread over the village. Picking up an egg with RMB works ("Egg 1!"). Talking to anyone opens the
  festival window; "Hand in eggs" after noon paid 1,200g for 10 eggs plus a Golden Egg. 120g/egg (up to 1,680g) on day
  13 is more than three times the starting gold: generous.
  - The festival window is a full-size window with a single button (could be a small window).
  - The eggs look like plain white eggs, not "painted" ones; on cobbles in the rain they are hard to spot.
  - My RMB on an egg hit Elias instead, who had walked onto that spot — fine, but the `!` bubble of a villager standing
    behind you is drawn over your body (shot W3_year_7).
  - It rained on the festival; there's no special festival weather rule (fine, just noting).
- Weather is only ever sun or rain (snow in winter). Spring: 7 rain days of 28. No storms, fog, wind or variety.
- Wandering merchant every Friday and Sunday, announced in the report. Meteor on Spring 25 (Frostpeak), announced.
- Character name: the family record keeps `S.fam.me.name = "You"` even though I named the character Yara.
- Per day `endDay` took 25-45 ms. Save grew from 75.7 KB (day 1) to 108.9 KB (Summer 1): ~1.2 KB per day.
- **Build-up:** the Wilds object count rises by exactly ~30 every day (20,160 → 20,976 by Summer 1) even though I never
  mined anything; `dailyWorld` respawns up to 30 rocks/ores per day whether or not any were mined. See the summary at the
  end of the year for the totals.
- Farm: weeds 104 → 158 and tall grass 59 → 162 in a month of not playing (5 weeds + 12 pasture grass per night).

## Summer, Year 1

- Summer 1 report: "1 out-of-season crops withered" (the last surviving cabbage) and "Summer has arrived!". Withering works.
  Every other test crop had already been lost to meadow grass.
- **Wilds ore build-up confirmed.** Diff of Wilds objects between Spring 12 and Summer 1, without me mining anything:
  rock 568→622, ore_frost 228→322, ore_obsidian 229→313, ore_silver 157→240, ore_gold 139→192, ore_adamant 58→95,
  crystalnode 175→216, ore_copper 100→124, ore_coal 35→52. `dailyWorld` (e_play.js) places up to 30 new ore/rock
  nodes every night with no cap and no link to what was mined; over a year that is ~10,000 extra nodes on the Wilds.
  Regions are probably the same (not checked). It should only replace mined nodes (there is already `S.respawn`), or
  stop when a biome is at its density.
- No birthday line for Brann (Summer 14) or Pip (Summer 22) in the report (toast only, see Spring).
- Lantern Night (played, Summer 11): everyone is round the plaza fountain. "Release a lantern" works from 6 pm and gives
  +40 friendship to every villager with the toast "The lanterns drift over the pond". But:
  - The 6 pm start is broad daylight in summer (sunset ~20:30), so "at dusk" isn't dusk (shot W3_year_9).
  - The lanterns are about 40 tiny coloured specks that rise for 3 s; no lantern sprites, nothing that stays in the sky.
    For the summer's festival it's a very small moment. Floating paper-lantern sprites that drift up over the fountain
    for the rest of the night would sell it.
  - The text says "over the pond", but the plaza pond is now a fountain.
  - The plaza at night looks lovely: lamp posts lit, warm grade (shot W3_year_10).
- Weather: 8 rain days out of 28. Still only sun/rain.
- Save: 108.9 KB (Su 1) → 142.3 KB (Fa 1). Heap 35-62 MB, no upward trend. `endDay` 25-30 ms.
- Request board changes daily (Fall 1: 5 coal for 153g). Shop stock (`S.stock`) is empty until a shop is opened and is
  reset every night, so nothing to drift; fine. `weekDrift` hashes only an item's name length and first letter, so all
  items with the same length and first letter drift together (e.g. "copper_bar"/"cheese_bar"-style pairs).
- The morning report is a full-screen window holding one or two lines ("Fall has arrived!") and a button (shot
  W3_year_11). It should be a small window.

## Fall, Year 1

- The ground goes a strong orange-brown all over the farm in autumn (shot W3_year_12); it reads well as autumn but is
  very dark and saturated at 6-7 am. The greenhouse ruin's ivy stays summer green.
- Odile's birthday (Fall 5) and Hale's (Fall 19): again no report line.
- Harvest Fair (played, Fall 16, with 3 gold pumpkins and 2 carp in the bag): "Enter my best item" picks the most
  valuable eligible item for you (no choice), takes one, and pays at once: "Your Gold Pumpkin scored 85. Second
  prize! +1500g". Works, but:
  - No choice of entry and no judging moment, other entries or ranking; it's a toast.
  - The village looks exactly like Blossom Day and Lantern Night: the same six lanterns, the same flower row, villagers
    on the same fountain spots (FEST_SPOTS) every festival (shot W3_year_13). No stalls, no produce displays, no
    autumn decorations. Each festival needs its own dressing.
- Weather: 9 rain days of 28.
- Fall 28: "Meadow grass crept into a tile of your fields" fired although by then I had no living crops (the only soil
  left was the dead cabbage tile). Message is fine, but it says "choked what grew there" when nothing grew.
- Save 142 KB → 166 KB (Winter 1). Heap 44-80 MB, no trend.

## Winter, Year 1, and into Year 2

- Weather: 7 snow days, the rest clear. No rain in winter at all, and no other weather.
- Elias's birthday (Winter 10) and Corwin's (Winter 24): no report lines.
- **Winter art (Painterly):**
  - Village (shot W3_year_14): the half-timbered house's snow roof is a flat white slab with blocky, pixel-looking
    light-blue patches and a single icicle; it has lost the roof's shape. The brick house next to it is good (rounded
    snow, icicles), but the snow at its foot has green and red specks. Snow ground shows straight-edged rectangles where
    terrains meet.
  - The plaza fountain (W3_year_15) keeps flowing blue water with green grass tufts all winter, while the farm pond is
    frozen. The plaza's winter cobbles are a very busy grey-white speckle, like static. Lamp posts, well and notice
    board get no snow.
  - Farm pond (W3_year_16): the ice is nice, but the sand shore stays bright yellow with no snow, and its outline is
    stepped/jagged like pixel art. Bare winter trees (and the oak) keep bright summer-green grass skirts at their foot;
    weeds stay lush green and twigs keep green leaves in the snow.
- Ember Feast (played, Winter 25): the gift window is the full backpack window ("Gift for Brann"): pick an item, then
  "Give to Brann". A Gold Pumpkin (256g) got "Brann gives you country bread in return" (+24 friendship). The return gift
  is cheap compared with what you give, and there's no feast: same six lanterns, flowers and fountain gathering as every
  other festival (W3_year_17), no tables, food or fire.
- **New year:** Year 2 Spring 1 report says only "Spring has arrived!". No "Year 2" moment, no birthday for the player.
  Aging works: the player is 30 after one year (25 + 5); suitors aged too (Mira and Talia 30 -> 35).
- **Odile's stray (Year 2):** Odile -> Animals -> "The stray" tab, "Adopt the dog" took my 2 carp: "Biscuit the dog is
  coming home with you!". **Bug:** the tab stays open with both buttons, and "Adopt the cat" then worked with no fish
  in the bag: the dog was replaced by "Ember the cat" for free (`S.pet` overwritten). The tab should redraw after
  adopting, and adopting should check `!S.pet` and the fish. The cat appears by the tent (W3_year_22).
- **Autosave works:** on the farm with no window open, the slot's timestamp updated ~2.8 min after I started watching
  (the 500-tick counter had been running before). The in-game clock ran 381 min in 327 s (0.7x), as designed.
- Wilds at the crossroads in Year 2 (W3_year_20): 165 fps, 1.6 ms work. Bandit patrols appeared within a minute (2 -> 5
  bandits, an archer and a chief) and stayed bounded; slimes 4. Goblin camps: state for 6 camps, none spawned near the
  crossroads. No drops piled up anywhere I looked.
- Story objects don't pile up: one story NPC on the Wilds, one resolved place.

## Long-run numbers (Spring 1 Y1 -> Spring 1 Y2, 112 days)

| | Spring 1 | Summer 1 | Fall 1 | Winter 1 | Spring 1 Y2 |
|---|---|---|---|---|---|
| Save (chars) | 75,747 | 108,903 | 142,313 | 166,023 | 194,690 |
| Wilds objects | 20,160 (day 2) | 20,976 | 21,816 | 22,656 | 23,496 |
| Farm weeds / tall grass | 104 / 59 (day 2) | 158 / 162 | 197 / 191 | 231 / 219 | 252 / 244 |
| JS heap (MB) | 49 | 51 | 44 | 46 | 72 |

- `endDay` took 25-45 ms every day, flat over the year. Heap moved between 29 and 97 MB with no upward trend. FPS stayed
  at the 165 cap (1-1.6 ms work) on the farm, village and Wilds. No console errors in the whole run.
- **Save growth:** ~1 KB per in-game day. 180 KB of the 195 KB is `mapsave`; 114 KB of that is the Wilds delta
  (`mapsave.wilds.d`), which grows every night because `dailyWorld` places 60 forage, 14 dig spots and up to 30 new
  ore/rock nodes in new random places, and each of those is a change from the base map. Each slot is also stored
  twice (`_bak`): after one year, slot 2 + its backup = 400 KB. At this rate a 10-year farm is ~1.2 MB per copy;
  several long saves would approach the ~5 MB localStorage quota (and a failed write could lose the save). Forage and
  dig spots don't need saving (they are re-rolled each morning), and the ore spawns should be capped.
- **Wilds build-up:** +3,336 objects in a year (+16%), all rock/ore/crystal nodes (see Summer). Not a frame-rate issue
  yet, but it never stops and it fills the Wilds' open ground.
- **Farm build-up:** 358 of 608 grass tiles in the lower field area (x 3-34, y 22-40) are weeds or tall grass after a
  year away (W3_year_23). Weeds never die back in winter and nothing caps them. That may be intended ("the farm goes
  wild"), but combined with grass choking crops it makes the farm feel like it fights you.

## Broken

1. **Stray pet can be swapped for free** (Odile's Stables -> The stray): after adopting one, the other "Adopt" button
   still works with no fish and replaces your pet. Steps: carry 2 fish, Adopt the dog, then click Adopt the cat.
2. **Festival and birthday announcements are not in the morning report.** Every birthday (7) and every festival morning
   reported "A quiet night"; they are only toasts (`lifeMorning` in r_life.js) that show under the open report window.
3. **Lantern Night "at dusk" starts at 6 pm**, full daylight in summer (sunset ~20:30); the text also says "over the
   pond" although it's a fountain now.
4. **The plaza fountain doesn't freeze in winter** (flows blue with green tufts while all other still water is ice).
5. "Meadow grass crept into a tile of your fields and choked what grew there" also fires when nothing grew there.
6. `S.fam.me.name` stays "You" after naming the character in the creator.

## Quality of life

- The morning report, festival talk and gift picker are full-size windows for a line or a button; make them small.
- Harvest Fair gives no choice of entry; let the player pick (or confirm) what to enter.
- A "Year 2" / your-birthday line on the first morning of a new year would make aging visible.
- Five stories announced on days 2-6 back to back is a lot for a new player.
- Weather is only sun/rain (snow in winter). Storms, fog, wind or a heatwave would give the year more texture.

## Balance

- **Meadow grass is far too aggressive**: 7 of 8 unfenced crops lost in one spring (4%/tile/day). A starting player
  can't fence yet. Suggest 0.5-1%/day, sparing tiles with a growing, watered crop, or a first-season grace period.
- Blossom Day pays 120g per egg (up to 1,680g on day 13, over 3x the starting gold).
- Ember Feast return gift (a country bread for a 256g gold pumpkin) feels stingy.
- Harvest Fair prizes (3,000 / 1,500 / 600) seem fine; a gold pumpkin got second.

## Art & feel (Painterly)

- Seasons read clearly: blossom spring, orange autumn ground, snow winter with snowy pines and bare trees; the plaza at
  night with lit lamps is lovely (W3_year_10).
- Winter gaps: flat pixel-patchy snow roof on the half-timbered house, specks at the brick house's foot, green grass
  skirts under bare/snowy trees, green weeds and leafy twigs in snow, yellow unsnowed pond shore with a jagged outline,
  unfrozen fountain, static-like winter cobbles, rectangular terrain edges in snow.
- Autumn ground is very dark/saturated in the morning; the greenhouse ruin's ivy stays green all year.
- Festivals all look identical (same six lanterns + flower row + fountain gathering). Lantern Night has no lanterns in
  the sky (specks for 3 s); the Harvest Fair has no stalls or produce; the Ember Feast has no feast.
- Villager `!` bubbles draw over the player when the villager stands behind you (W3_year_7).
- The dialogue portrait (Lord Ashcombe) is a blurry enlargement of the pixel sprite (W3_year_4).

## Performance

- 165 fps (the cap) everywhere visited, 1.0-1.6 ms work per frame, after a full simulated year. `endDay` 25-45 ms flat.
  Heap 29-97 MB, no leak trend. No console errors in the whole run.
- The long-run risks are data, not frames: save growth (~1 KB/day, doubled by `_bak`) and Wilds node accumulation.

## Liked

- The calendar holds together: seasons turn, out-of-season crops wither with a report line, aging ticks to 30, the
  merchant comes every Friday and Sunday, meteors are announced, the board rolls daily, autosave works.
- Blossom Day's egg hunt and Lantern Night's friendship-for-all are good ideas; villagers really do gather.
- The plaza at night and the snowy village are atmospheric.
- No errors and no slowdown after a year.

## Top 5 fixes

1. Tone down meadow grass choking (4%/tile/day wipes out an unfenced starting field in one season).
2. Stop the save and the Wilds from growing forever: don't save daily forage/dig spots, and cap or tie ore respawns to
   mined nodes (`dailyWorld` adds ~30 nodes every night; save +1 KB/day, x2 with `_bak`).
3. Put festivals and birthdays in the morning report (they're only toasts now).
4. Fix the stray adoption (free pet swap via the stale tab).
5. Give each festival its own look and moment (lanterns rising at real dusk, fair stalls, a feast table), and fix the
   winter art gaps (fountain freezing, green grass under winter trees, flat snow roof, unsnowed shore).

(Screenshots: `docs/playtest/overnight/shots/W3_year_1..23.png`. Day-by-day log: scratchpad `playtest/h9301_days.log`.)
