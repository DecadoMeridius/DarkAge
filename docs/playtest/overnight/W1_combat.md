# W1 — Combat tester (Combat test, Painterly, FPS on)

Port 9302, `[::1]:5173`. About 110 harness commands. I fought all 7 bosses from the panel, plus the Wolf, Slimes, Ranged and Mixed packs. Weapons used: staff (golden and mythril), bow, warhammer, dagger and sword (steel). I learned and used Fireball and Frost Nova, and also used Cleave, Lunge, Guard (Q parry), Second Wind and the Shift dodge.
The fight ran from 10:00 am to 1:30 am in game, so I also saw dusk and night.
`errors` reported **none** for the whole session.

Note: early screenshots (W1_combat_1 to _23) were taken but I could not view them (image limit), so the Stone Warden and first Ember Wyrm notes below come from HUD text and HP numbers only.

## Broken
1. **Combat test bag starts almost full (26/28) and fills to 28/28 after one boss.** After that every kill shows "Your backpack is full." on repeat, and drops pile up on the ground. The scenario's job is to fight over and over, so it should start with free slots or send loot to the bank. (W1_combat_41, _43, _71)
2. **Loadouts for other weapons keep skills they can't use.** The staff loadout showed **Guard / Second Wind / Volley**, and Volley is a bow skill. After I learned Fireball and Frost Nova, slot C still said Volley. (W1_combat_32, _67)
3. **Combat test spawns Realm knight patrols and Void Knights in the middle of boss fights.** During the Hollow King, a group of Void Knights (level 68) joined in. Knights of the Realm walked in, and one "falls back to tend their wounds". It turned a clean boss test into a brawl, and the boss bar no longer showed who was hitting me. (W1_combat_45, _52, _54, _55, _79)
4. **Holding LMB on a boss drags the player a long way.** The fight with the Hollow King moved from the lake to the Wilds crossroads, and the boss was left far behind. (W1_combat_55)
   - With the dagger, holding LMB on a boss about 250 px away made me swing at air. I never walked in, because "foe within 200 px = attack" also applies to a boss you can't reach.
5. **"Block" and the damage number draw on top of each other** ("Bl-1ck"). Seen on every blocked hit, against the Lich, the Snapper and the wolves. (W1_combat_29, _61, _76)
6. **Learn buttons move after a click.** The Combat skills (V) page reflows after you learn a skill, so a second quick click lands on the wrong card. (W1_combat_65)

## Quality of life
- The Combat test gives skill points (Melee/Ranged/Magic 60) but **no learned skills**. A new tester has to know to open V, learn skills and slot them before anything beyond Cleave, Lunge and Guard works. Pre-learning one or two skills per tree would help.
- Ally health bars at night look **empty and black** (green outline, dark fill), so they read as "dead". (W1_combat_77, _79)
- The low-health toast "Low health! Eat something or get away." keeps popping during fights the scenario's lives cover anyway.
- The crossroads signpost label ("Kingsbridge ↖ · Greyhelm ↗ · Ashford ...") is wide and runs under the menu dock; it covers fights near the crossroads. (W1_combat_55, _56)
- It is hard to tell which bag item is which weapon. The staffs, spears and swords look alike at bag size: I equipped a Mythril Staff thinking it was a spear. Showing the weapon type on the icon, or a small letter, would help.
- Knockout in the Combat test works well: "Knocked out. (Combat test: you get straight back up.)", full HP, and the hearts stay at 3. (W1_combat_52)
- The Lich fight ran into dusk and night. The scenario clock keeps running, so tests late in a session are all at night, where wolves and slimes are very hard to see (W1_combat_72, _75). The Combat test could freeze time at noon.

## Balance
- **Combat level 100 with 40 defence makes every pack trivial.** Wolves, slimes and archers hit for -1 or -2, and Ranged/Mixed packs die in a few swings. That's fine for a sandbox, but packs say nothing about real balance at this level. A level selector (or packs scaled to the player) would make them useful.
- **Bosses felt uneven:**
  - Stone Warden and the first Ember Wyrm went down in about 10-20 s each. Old Snapper and Frost Giant took about 8-10 s with a staff plus Fireball and Frost Nova. These are too easy for gear at this level.
  - **The Pale Lich was the real fight.** It took about 3 minutes and I needed several Heals:
    - it shields itself constantly;
    - its 62-damage bolts come in pairs;
    - it summons skeleton waves (up to 8 on screen) and orb hazards.
    The skeletons hit hard as a group (HP went 506 → 39 in seconds).
  - The Hollow King also hurt: an 84-damage hit through Guard (W1_combat_51), then a knockout. Its quake ring is a clear, readable telegraph.
- The Bandit Warlord died to bow fire in about 8 s without moving.
- The dagger has very short reach against the Ember Wyrm, which moves around a lot. I chipped about 10% in 10 s. The dagger feels weak against mobile bosses.

## Art & feel (Painterly)
- **Bosses look like scaled-up pixel art, not painted.** Old Snapper (a flat red crab), Frost Giant, Ember Wyrm and the Hollow King are big blocky low-res sprites with soft (smoothed) edges. Next to the painted trees and ground they look blurry and out of place. (W1_combat_60, _67, _80, _44)
  - The Pale Lich and the skeletons are crisper but still clearly pixel. The Stone Warden I couldn't view.
- **Frost Giant turns almost white or grey when hit.** The hit flash or freeze tint washes out the whole sprite, so it looks like a grey patch. (W1_combat_68, _69)
- **The Pale Lich turns brown/maroon** while it is shielded or hit. It looks like a different colour palette rather than a tint. (W1_combat_34, _36, _39)
- Hazard telegraphs:
  - Lich orbs are bright purple squares with a glow and read fine.
  - Frost Giant ice lanes are wide, flat blue bands with tick marks and are very readable. (W1_combat_69)
  - The Old Snapper tide wave showed as a pale-blue translucent column with hard edges; readable but plain. (W1_combat_60)
- Telegraph wedges and ring zones (red fill, "!") read clearly. The Hollow King's red wedge and quake ring were the best telegraphs. (W1_combat_50, _51)
- The held weapon is barely visible on the player in Painterly: the warhammer and dagger were hard to see in the hand. The bow shows as a thin outline. (W1_combat_57, _72)
- The see-through player behind tree canopies sometimes hides most of the character during fights. (W1_combat_47, _74, _82)
- **Night:** the grade is very dark. Slimes and wolves (dark green and dark grey) almost vanish, and only the player and the boss bar stand out. (W1_combat_72, _75)

## Performance
- **Steady 126-131 fps, about 1.4-2.7 ms of work per frame**, through every fight. That includes Lich waves with 8 skeletons plus about 15 orbs, Frost Giant ice lanes, Hollow King quakes and Void Knight brawls.
- No freeze or stutter was visible on the FPS counter at any time.

## Liked
- The Lich fight is genuinely tense: summons, a shield and orb hazards with a clear target.
- The Hollow King's quake ring and wedge telegraphs are big, red and fair.
- The Frost Giant ice lanes are clear.
- The "Knocked out (Combat test: you get straight back up)" message is a nice touch. The Heal and Clear buttons work instantly.
- The V page's ✓/✗ unlock list is clear about what each skill needs.
- Damage numbers are colour-coded: orange for crits, red for damage taken, white for normal.

## Top 5 fixes
1. **Painterly bosses:** Old Snapper, Frost Giant, Ember Wyrm and the Hollow King look like blurry upscaled pixel blocks next to painted scenery. Also fix the Frost Giant's white wash-out and the Lich's brown recolour on hit or shield.
2. **Keep the Combat test clean:** no realm patrols, Void Knights or knights during boss tests, and freeze the clock at day.
3. **Combat test inventory:** start with free slots, or send loot to the bank, so the "backpack full" spam stops.
4. **Loadouts:** remove skills from a weapon's Z/X/C loadout when that weapon can't use them (Volley on the staff). Pre-learn a skill per tree in the Combat test.
5. **Melee holding LMB on a far boss:** walk into range (or stop) instead of swinging at air or drifting across the map. Also fix "Block" overlapping the damage number.
