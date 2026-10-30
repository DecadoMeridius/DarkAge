# Playtest 2 (2026-10-30): combat and bosses, build 0.5.0

Four AI testers used the new Combat test mode (combat level 100, mythril gear), each in its own headless Chrome, with mouse and keyboard only. In total they made about 330 harness commands.

| Tester | Focus |
|---|---|
| Melee | Sword, dagger, spear and warhammer, combos, dash, the Blade tree, packs |
| Ranged / magic | Bow and staff, the Marksman and Arcane trees |
| Lowland bosses | Warden, Wyrm, Lich, Hollow King, Warlord, Snapper, Frost Giant |
| Regional bosses | Tyrant, Rime Queen, Cinder Drake, Ash Mother, with a quick look at the other four |

None of them saw a JavaScript error.

Note: each harness command takes about 1 second, so the testers react slower than a person would. Their damage numbers are a worst case, but the patterns they report are real.

## Critical (3-4 testers)
1. **You lose sight of your character.**
   - Enemies, bosses, tree canopies, fire pools and loot are drawn on top of the player.
   - The canopy fade is too weak. One tester was at 95 HP and couldn't find himself.
   - Fix: draw the player above enemies and effects, or show a silhouette outline when covered, and fade canopies much more.
2. **Enemies stack on you, and bosses walk onto you.**
   - Packs merge into one blob on your pixel, and their wind-up cones overlap with no gap to dodge through.
   - Big bosses overlap the player too, and then **melee swings stop connecting**: the Warlord stayed at 49% for 45 s, Snapper and Warden likewise. This is probably also why the Hollow King never lost health.
   - Fix: enemies keep a ring around you and push each other apart, only one or two wind up at a time, bosses have a solid body, and the hit check counts enemies overlapping you.
3. **Holding or clicking the mouse walks you.** Click-to-move kicks in when you click empty ground or a far enemy, so you drift into trees and away from the fight. In combat, an attack should never move you except for a small lunge.
4. **The dash ignores the mouse.** It goes the way you last moved or faced. Testers expected it toward the movement keys, or toward the mouse when no key is held. One dash also put a tester on river water.
5. **The HUD covers the fight.**
   - The ability and Focus bar and the hotbar sit in the play area and **swallow aim clicks** downward.
   - Bosses and telegraphs end up under them.
   - The boss health bar at the top covers bosses near the top edge.
   - The small enemy panel covers the boss bar.
   - Fix: let clicks pass through, move or shrink the bars in combat, keep the hover panel off the boss bar, and keep bosses off the screen edges.
6. **Bosses open with an attack before you can react.** Fire pools, rockfall and AOE rings start right under you as they spawn (Wyrm, Tyrant, Forge King, Captain, Tidecaller). Fix: a 1.5-2 s grace period, spawning 6-8 tiles away, and no ground effects under the player at the start.
7. **Combat test: a knockout ends the day,** costs gold and sends you to the farm. It should respawn you on the spot at full health.

## Bugs
- **Hollow King:** spawns in the tree line or under the HUD, never moves and can't be damaged. **Pale Lich:** teleports every 1-2 s with no tell, often off-screen.
- **Damage you can't trace.** Several hits had no visible telegraph or projectile: Lich bolts, the Frost Giant at night, the Wyrm. Enemy projectiles are tiny.
- **Regional bosses are far too strong.** Mythril and 600 HP still died in 3-5 s: the Tyrant took 600 → 193 in under 2 s, the Rime Queen 552 → 189 in about 3 s. Phase 2 was never reached. Fix: cut damage by 50-60% or scale it to gear, and cap a single hit at about 15-20% of max HP. Lowland bosses felt closer to right (Warden 3/10, Snapper 3/10, Warlord 4/10, Wyrm 6/10, Frost Giant 7/10).
- **The Warden's shockwave ring is huge** (about 500 px, fills the screen) and its damage is inconsistent (150 one time, a blocked 1 the next).
- **Skill slots:**
  - The Z/X/C buttons shift when a skill reaches rank 3, so clicks hit the wrong slot.
  - Slots are shared across weapons, so swapping weapons wipes your loadout.
  - Guard can't be used once the slots hold tree skills.
- **The boss bar** stays full when two bosses are out and you're hitting the other one, and normal enemies take over the big top bar.
- **Equipping** a bow or staff from the bag doesn't select it on the hotbar.
- **Staff bolts** fizzle at about 250 px with no range indicator. The bow uses fire arrows first with no choice.
- **Facing:** the character stops facing the mouse after shooting.
- **A ranged enemy** flickers between a goblin and a hooded human sprite.
- **Pathing:** some enemies get stuck on walls and logs, or never come at you.
- **Visuals:** the mythril chestplate shows a chest icon, and the full-mythril character is one flat teal block.
- **Burn** keeps ticking after Clear and Heal.
- **Spam:** "Your backpack is full" and "X is recharging" toasts flood the screen, and pickup texts stack on damage numbers.
- **Text:**
  - Double full stops in the staff and robe tooltips.
  - Tooltips give cooldowns in ticks while the tree gives seconds.
  - The robe's magic bonus isn't on the stats panel.
  - A gold-set bonus line appears on the robe.
  - The V intro says "rank 3, then slot it".
  - The mouse wheel doesn't scroll the V window.
- **Logs:** a sword swing aimed at a log shows the woodcutting label.
- **Console:** many "404 Failed to load resource" lines appeared (harmless so far; find out what they are).

## Feel
- **Good:**
  - Telegraphs read well in daylight: wind-up cones, rockfall circles, ice lanes and tidal lanes (Old Snapper was the best-feeling fight).
  - The ability effects look good, especially Meteor, Hunter's Mark and Chain Lightning, and the big damage numbers feel great.
  - Holding to auto-fire the bow works.
  - The spear thrust and warhammer overhead look right.
- **Weak:**
  - Basic attacks have almost no hit feedback, and the third combo hit doesn't stand out.
  - The dash has no trail.
  - Arrows and bolts are nearly invisible.
  - Ground Slam's cone is hard to see.
  - Blade Storm and Arcane Orbs look thin for big skills.
  - The idle pose is stiff.
  - Telegraphs are hard to read at night.
- **Balance:**
  - Skills do 5-10× a basic attack, and Focus is always full. Whirlwind refunds more Focus than it costs and can be spammed.
  - Chain Lightning and Meteor are overpowered.
  - Ground Slam and Piercing Shot feel weak.
  - Blade Dash and Leaping Strike overshoot the mouse.
  - Chain Lightning hits adds before the boss.
  - Stun and freeze do nothing to bosses.
  - Ranged enemies hit for 1 and never matter.
  - At the test levels, normal enemies die before their behaviour shows.

## Suggested fix order
1. Player always visible.
2. Spacing and solid bodies, plus hits that count overlapping enemies.
3. No click-to-move during combat; the dash follows movement or the mouse.
4. HUD out of the fight (clicks pass through, bars moved).
5. Boss spawn grace and distance.
6. Combat-test respawn.
7. Regional boss damage and a hit cap.
8. Hollow King and Lich fixes.
9. Visible projectiles and telegraphs for every hit.
10. Focus economy and skill balance (no Focus from ability hits, Whirlwind, Chain Lightning, Meteor, Ground Slam).
11. A skill loadout per weapon type, and stable slot buttons.
12. The smaller bugs and text.
