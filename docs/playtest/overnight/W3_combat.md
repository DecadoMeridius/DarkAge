# W3: Combat in real play (Kingdom test, Painterly, FPS on)

- **Setup:** port 9303 at `[::1]:5173`, about 95 harness commands.
- **Scenario:** Kingdom test (developer mode was already on). Painterly was already selected and the FPS counter was on.
- **Fights played:**
  - the Stone Warden on mine floor 10, in action and classic mode;
  - a Wilds goblin camp (twice), wolves, a boar, two bandit patrols and a night zombie;
  - the Frost Giant, the Bandit Warlord and the Ash Colossus in their arenas;
  - the Frostmere dungeon (Hall of Rime), floors 1-3;
  - the bow and the staff against wolves and a goblin camp.
- **Harness:** a fight driver, `h9303_fight.mjs` in the playtest folder. It sends real mouse clicks at the nearest foe and walks there with `walkTo` when the foe is far. When HP gets low it eats by pressing the hotbar key and clicking.
- `errors`: **none**. The console log had 11 × "Failed to load resource: 404" with no file named.

## Console shortcuts used (none of these exist in normal play)
- Skill levels: `S.csk.<skill>.xp = XPT[L]; recalc()`.
  - Warden reference: Melee 20, Defence 15, Constitution 20. Ranged and Magic were left at the scenario's 30, so the combat level showed 38.
  - Wilds: everything at 30.
  - Dungeon floors 2-3: Melee, Defence and Constitution 50.
  - Ranged and Magic: 40.
  - Colossus: 45.
- Hotbar and food: `S.hot[9] = 'bread'`, plus `give('bread', 20)` twice.
- Health and lives: `S.p.hp = maxHP()` and `S.lives = 3` before most fights.
- Mine: `S.mineFloor = 10; goMap('mine')`, twice.
- Combat mode: `SETTINGS.combat = 'classic' / 'action'` (set back to action at the end).
- Wilds travel:
  - `goMap('wilds', x, y)` and `S.p.x/y = openTileNear(...)` to reach the camp at (99,186) and the arenas (frost 89,56; highlands 204,112; ash 407,68).
  - `walkTo(...)` to walk to the patrols.
- Clock: `S.time = 21*60` (night) and `10*60`.
- Frostmere dungeon: the gate was opened legitimately by killing the Frost Giant. I jumped to the floors with `S.dgFloor = {frostmere: n}; S.dgBest = ...; goMap('dg_frostmere')`.
- Gear:
  - `give('iron_staff')`, `give('apprentice_robe')`, then `equip(...)` for those and the iron bow/sword;
  - emptied materials from the backpack into `S.bank` once, after the bag hit 28/28.
- `camX = 0` once, to fix a camera NaN. My own `goMap('wilds')` without coordinates caused it; see Broken 8.

## Results by fight
| Fight | Player | Time | Food | Lives / KOs | Notes |
|---|---|---|---|---|---|
| Stone Warden, action mode | M20 / D15 / C20, full iron | **20 s** | 5 bread | 0 lost in the fight (I lost 1 earlier standing idle beside it while setting up) | The reference says ~60 s and ~14 bread. Action mode is ~3x faster. |
| Stone Warden, classic mode | same | 78 s, then KO | 1 (eating failed, see Broken 4) | **all 3 lives + a full knockout**; Warden still at 433/798 | Single-click auto-attack did about 69 dmg in 20 s. Re-clicking every 0.4 s did 206 dmg in 20 s. At about 4.7 dps the fight would need about 170 s and about 65 bread. Classic is now far **slower and harder** than the reference. |
| Goblin camp (3 goblins, slinger, ogre) + 4 wolves | combat 30, iron | ~35 s | 0 | 0 | Lost 44 HP in total. Trivial. Loot: 4 hide, 2 fang, 110 g. The camp chest had 13 iron ore, 5 compost and 306 g. |
| Bandit patrols (chief, 3 bandits, 2 archers ×2) | M33 | ~45 s | 0 | 0 | Lost 45 HP. Loot: 475 g, leather, 7 arrows, 2 iron ore, 1 gold ore. |
| Zombie (night, forest) | M33 | ~6 s | 0 | 0 | 76 HP; fine as a night trash mob. |
| **Frost Giant** (2320 HP) + 4 ice wolves | M33-36 / D33 / C33 | ~55 s of fighting | ~6 bread | **2 lives lost** | Then a yeti, wraiths, bandits and a zombie joined at night (10 foes at once). The third life went too. Reward: 4,088 g, giant heart, diamond, 13 frost ore, 7 ice shards, ember shard. |
| **Bandit Warlord** (980 HP) | M35 / D35 / C35 | **~10 s** | 0 | 0 | No escort; lost ~130 HP. Reward: quest +1,500 g, Warlord Banner, 5 steel bars, ember shard. |
| **Ash Colossus** (4188 HP) | M45 / D45 / C45 | 110 s | 17 bread | **3 lives gone** | **Unreachable on a cliff** (Broken 1). |
| Frostmere dungeon F1 (2 frost wraiths 759, ice elemental 1417, ice slime) | M38 / D33 / C33 | ~55 s | 16 bread | 2 lives | Huge jump from the Frost Giant that opens it. |
| Frostmere F2 (3 wraiths, elemental, 2 bats, slime) | M50 / D50 / C50 (500 HP) | ~70 s | 4 eaten (35 attempts) | 2 lives | |
| Frostmere F3 | M50 | ~25 s + stuck | 3 | 1 life | 2 frost bats could never be hit (Broken 6). |
| Bow, wolves | Ranged 40 | wolves die in 2 shots | 0 | 0 | Stuck 25 s on a boar behind trees (Broken 7). |
| Staff, whole goblin camp + ogre | Magic 40 | **9 s** | 0 | 0 | |

## Broken
1. **The Ash Colossus can stand inside cliff tiles, where you can't reach it.**
   - It sat on `r` tiles at (409,59), 9 tiles from the arena centre (407,68). Clicks said "You can't reach that." with a red cross.
   - It still hit me for 28 or more and dropped fire pools. It healed back to full 4188 HP (leash) and took all 3 lives in 110 s.
   - The arena pull (`e.arena`, only beyond 150 px) doesn't bring it back, because it was 144 px out. Bosses (and knockback on them) must never end up on solid ground, and the arena clearing shouldn't leave cliff blocks inside the boss's range.
   - Screenshots: W3_combat_23, _24.
2. **Cleared goblin camps never count as cleared, so the tribe is back as soon as you return.**
   - In `campTick` (x_goblins.js) the "cleared" check needs `m.ents.some(e => e.camp === C.i)`. Killed goblins are already gone from `m.ents`, so `st.cleared` is never set and the "camp is cleared" toast never shows.
   - After I killed the whole camp, `S.gcamp[2]` stayed `{here:1}`. Then I went more than 70 tiles away, which sets `here = 0`. When I came back the same evening a new tribe and ogre had spawned. I cleared it three times in one day.
3. **Clicking a foe you can't reach directly only swings at air.**
   - The "foe within 200 px = attack" rule ignores walls, water and trees. I clicked a visible goblin 110 px away across a pond: no walking, just swings, for 75 s. The path round was 48 tiles. RMB set the target but didn't walk either.
   - In the Wilds forests this happens all the time. If the foe has no straight line, the click should walk (W1 saw the same with a far boss).
   - Screenshot: W3_combat_9.
4. **Eating in a fight is unreliable, and there is no eat key.** With bread selected, the LMB click lands on whatever is under the cursor:
   - In classic mode it lands on the target or boss: 53 tries, 1 bread eaten.
   - It can hit a mining node, which turns into "Frostsilver vein · Mining 70" (W3_combat_18).
   - It can hit a villager: on the farm it opened a Knight of the Realm's dialogue (W3_combat_5).
   - In the dungeon, 35 tries gave 4 breads and 60 tries gave 17.

   Eating should work from the hotbar key alone (press the food's number twice, or a dedicated Eat key), or LMB with food should always eat.
5. **The knockout report blames bedtime.**
   - Being beaten in a fight at 9 am says "You were knocked out (around 9 am). Someone carried you to bed and took 2,500g… **Sleep in your tent before 2 am next time.**" (x_fix5.js:374 always appends the bedtime line.)
   - The KO also throws away the whole rest of the day (Mon 9 am to Tue 6 am).
   - Enter doesn't press "Start the day" on that report.
   - Screenshot: W3_combat_4.
6. **Frost bats in the Hall of Rime (floor 3) could not be hit for 40 s.** They hovered where neither swings nor walking reached, and the floor couldn't be finished.
7. **Bow arrows into trees fail silently.** In the forest I shot at a boar 94 px away behind trunks for 25 s with no hits and no "blocked" feedback, and the bow kept firing.
8. **The camera can get stuck at NaN for good.**
   - `render()` only snaps when `|camX - tx| > 160`, and that is false for NaN. Once `camX` is NaN (in my case from `goMap('wilds')` with no coordinates, which left `S.p` undefined), the screen shows only light shafts until a reload.
   - It was my console misuse, but a `!isFinite(camX)` guard would make it unbreakable.
   - Screenshots: W3_combat_6, _7.
9. **The staff loadout keeps Volley**, which is a bow skill (Guard / Second Wind / Volley; same as W1). Screenshot: W3_combat_20.
10. **"Block" and the damage number overlap** ("Bl-6ck"), and stacked numbers (-28, +25, -2) pile on one spot (same as W1). Screenshots: W3_combat_11, _23, _24.
11. **The backpack fills fast in real play.** It reached 27/28 after the giant and 28/28 by dungeon floor 3, with a repeating "Your backpack is full." Dungeon loot was lost to the ground.

## Quality of life
- **Lives get spent while you're not fighting.** I lost a life standing idle about 70 px from the Stone Warden during setup (rockfall). Its waking grace is short, and the rockfall squares are small dark squares that are easy to miss (W3_combat_2).
- In classic mode, re-clicking the target does 3x the damage of a single click (206 vs 69 in 20 s), so it pays to spam-click. Either clicks shouldn't speed it up, or single-click auto-attack is too slow.
- The tracker arrow ("to Hollowmere Farm", from the Kingdom test's herald) sits over the player's head in every fight. It hides incoming hits and is nearly invisible at night (W3_combat_14, _19). Hide it during combat.
- The LMB hint ("LMB A…") is half hidden behind the Focus bar and ability bar (W3_combat_10).
- "That's a long way round from here." stops you walking to a bandit 117 path tiles away on a rock shelf, but nothing tells you how to get there.
- On day 2 four Knights of the Realm stood on the farm next to the tent. Their lines are about riding the royal road, and clicking near yourself talks to them.
- The low-health toast fires constantly in boss fights.

## Balance
- **Action mode is about 3x faster than the CLAUDE.md reference:** Stone Warden 20 s and 5 bread, against ~60 s and ~14 bread. **Classic** is the other way round: it would need about 170 s and about 65 bread, and I lost all 3 lives at 45% boss HP. The reference needs updating, or the tuning does, for each mode.
- **Wilds at combat 30 in iron is trivial.**
  - A full goblin camp plus 4 wolves cost 44 HP, and two bandit patrols cost 45 HP. Wolves (L2) and goblins (L4) don't scale.
  - Loot is fine for the effort (~750 g a camp, ~475 g a patrol), and because of Broken 2 the camp is farmable.
- **The world bosses are very uneven:**
  - Warlord (980 HP): 10 s, no threat.
  - Frost Giant (2320 HP, plus 4 ice wolves, plus night spawns): 2-3 lives at combat 33.
  - Colossus: unwinnable because of Broken 1.
  - The Warlord, which guards Highmarch, should be about as hard as the Giant.
- **Region dungeon difficulty jumps too far.** Beating the Frost Giant (biome level 10) at combat 33 opens the Frostmere, whose dungeon floor 1 has level-34 ice elementals with 1417 HP and wraiths with 759.
  - Floor 1 cost 2 lives and 16 bread at combat 35.
  - At Melee/Defence/Constitution 50 (500 HP), floors 2-3 still cost 2 lives each.
  - `PS.def` stayed 19 from Defence 15 to 50 (gear only?), so Defence levels didn't seem to reduce incoming damage.
  - Dungeon loot (ice shards, ectoplasm, 0 gold) is poor for that risk.
- Magic at 40 with an iron staff kills a whole camp and an ogre in 9 s. The staff outclasses the sword (about 35 s for the same camp at Melee 30).
- Ranged at 40: wolves die in 2 arrows. That's fine.
- Bosses give big rewards. The Giant gave 4,088 g plus a diamond and the Warlord 1,500 g plus 5 steel bars. That's generous next to camps.

## Art & feel (Painterly, night)
- **Night Wilds look good.** The camp's fire glow and the dusky forest read well (W3_combat_14, _20). The day forest and the goblin camp look excellent (W3_combat_8, _10).
- **Bosses at night:**
  - The Frost Giant is pale blue on blue snow and the Ash Colossus is near-black on black ash. Both are smoothed pixel sprites and almost vanish (W3_combat_15, _23).
  - The Colossus fire-pool telegraphs are thin orange ring outlines that overlap, and are hard to read at night (W3_combat_24).
  - Bosses need a rim or outline at night.
- **The Frost Wraith looks exactly like a blue map-location pin** (W3_combat_18). I took it for a quest marker.
- The zombie reads as a dark-clothed villager, not a zombie (W3_combat_14).
- In the Hall of Rime the teal crystals are crisp pixel art among painted rocks, and the frost ore veins look like low-poly gems (W3_combat_17, _18). The black ore rocks in the Wilds (dark faceted, red veins) look 3D too (W3_combat_11, _12).
- The Stone Warden is painted and reads well. The name bar sits over its head (W3_combat_2).
- Staff bolts are a single purple square: weak magic feedback (W3_combat_20). The held bow shows (W3_combat_19); the staff is hard to see.
- The see-through player under trees in a fight is fine, but the player is often fully under canopy in forest fights.

## Performance
- 110-131 fps everywhere, with 0.8-7 ms of work a frame. The highest was 7.1 ms when the Warlord died with loot popping.
- Busy night fights with 10 foes stayed at about 120 fps. No stutters were seen.

## Liked
- Action combat feels punchy. Bow and staff are satisfying at a mid level.
- Goblin camps (huts, spit fire, totem, chest) look great and give a nice loot burst.
- The loot pop-ups ("+1 Ember Shard / +1 Warlord Banner / +5 Steel Bar") and the boss toasts are rewarding.
- Lives give you a second and third try without a load screen; the shockwave revive is good.

## Top 5 fixes
1. **Ash Colossus (and any boss) inside cliff tiles:** keep bosses off solid tiles, pull them back to the arena, and stop the leash healing them while the player is in the arena. The fight can't be won as it is.
2. **Goblin camps never clear:** fix the `campTick` cleared check (count kills, or track the camp's spawn ids) so the "cleared" state and the 2-day timer work.
3. **Clicking an unreachable foe within 200 px only swings at air:** require line of sight or a short path for "click = attack", otherwise walk there. Also tell the player when an arrow hits a tree.
4. **Eating in combat:** an eat key, or the food's hotbar number eats straight away, never handing the click to targets, nodes or NPCs. Also fix the knockout report's "sleep before 2 am" line for combat knockouts.
5. **Retune and re-document combat balance:**
   - The Warden is 20 s in action mode and about 170 s in classic.
   - The Warlord is too easy and the Frost Giant much harder.
   - Frostmere dungeon floor 1 is far beyond the gate that opens it.
   - Defence levels don't seem to change `PS.def`.
   - The staff out-damages the sword.
