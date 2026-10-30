# Combat overhaul: from tick auto-attack to action combat (Hades-like feel)

## Why the current combat feels goofy
- **No direct control.** You click an enemy and the game attacks for you every 2–6 ticks (0.6 s each). Your clicks and timing don't change the outcome.
- **Dice instead of skill.** Hits miss on an accuracy roll, so a well-placed attack can do nothing, and enemies hit you on a timer you can't see.
- **No weight.** There's no hit-stop, little knockback, and no wind-up to react to, so neither side's attacks read clearly.
- **Movement and combat are separate.** You stand still while the tick plays out, and dodging barely matters.

## What makes Hades feel good (the parts we take)
1. **Instant, directional attacks.** The button attacks right now, toward the cursor, with a visible arc. Holding the button chains a **3-hit combo** whose last hit is heavier.
2. **A dash that's always there.** It's short, fast, invulnerable while dashing, has a short cooldown, and cancels recovery.
3. **Every enemy attack is telegraphed.** There's a wind-up you can see (a red marker on the ground), then the strike, then a recovery window where you punish.
4. **Juice.** Hit-stop (a 40–70 ms freeze), knockback, enemy flash, sparks, screen shake scaled to the hit, readable damage numbers, and a short invulnerability window after you're hit.
5. **Build variety.** Weapons play differently (fast dagger, wide hammer, long spear, ranged bow, magic staff). Skills come from trees with their own effects.

## What we keep
- **Progression:** the RuneScape-style skills (Melee, Ranged, Magic, Defence, Constitution, 1–99), gear tiers and requirements, and the passive tree all stay. Levels and gear now scale damage and survivability instead of hit chance.
- **Abilities and resources:** Focus and the Z/X/C abilities stay, now aimed with the mouse instead of needing a target.
- **Choice:** Classic mode stays available in Options for anyone who prefers it.

## Phases
| Phase | What | Status |
|---|---|---|
| D1 | **Movement and dash:** dash on Shift (invulnerable, 0.45 s cooldown, aimed by movement or facing) | Phase 1 |
| D2 | **Directional attacks:** LMB attacks toward the mouse; per-weapon range, arc, speed and knockback; 3-hit combos; arrows as real projectiles; no misses (a weak hit instead); hit-stop, knockback, sparks, shake | Phase 1 |
| D3 | **Enemy attacks:** wind-up with a red ground marker, a strike you can dash through, recovery; a parry window on Guard | Phase 1 |
| D4 | **Bosses:** a pattern per boss with phases (for example, the Stone Warden's rock rings and slam combos, the Frost Giant's ice lanes, the Ash Colossus's fire pools) | Next |
| D5 | **Skill trees:** a tree per style (Blade, Marksman, Arcane), each with active skills that have their own visual effects (whirlwind, piercing shot, ground slam, chain lightning...); AOE skills | Next |
| D6 | **Magic:** staffs (projectile and charged AOE), spells fed by Focus, robes and hats as magic armour per tier | Next |
| D7 | **Animation:** limbs with joints for walking, attacking and dashing (an arm/weapon pivot and leg swing in `human.py` frames) | Next |

## Tuning numbers (phase 1)
| Weapon | Swing cooldown | Range | Arc | Knockback | Damage |
|---|---|---|---|---|---|
| Dagger | 0.2 s | 17 | 90° | low | 0.75× |
| Sword | 0.3 s | 22 | 125° | medium | 1× |
| Spear | 0.38 s | 32 | 50° | high | 1.05× |
| Warhammer | 0.52 s | 22 | 160° | very high | 1.5× |
| Bow | 0.42 s | arrows at 280 px/s | — | — | — |

- **Combo:** the third hit does 1.6–2× damage and staggers.
- **Enemies:** wind-up 0.4–0.6 s, strike reach their radius + 16, cooldown 1.1–1.7 s.
- **Taking a hit:** 0.9 s of invulnerability and a knockback.
