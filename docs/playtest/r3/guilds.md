# Playtest r3: the guild climber

Persona: a RuneScape fan who likes ranks, titles and unlocks. I started from **Kingdom test** (about 33,000g, combat 30, iron gear, every life skill at 1). I played only through the harness, using about 125 commands over one and a half in-game days.

## Summary: guilds 6/10

- **The structure is good.** Each guild has five ranks with named titles, and each rank has a clear "for the rank of X" checklist with have/need counts.
- **The journal works well.** It has a Guilds section showing every guild you've joined and what the next rank needs. That was the best part of the session.
- **Store unlocks are a strong hook.** Locked store rows read like "Fire Arrow · Stalker rank". They are exactly what this kind of player wants to chase.
- **Finding the halls was the weak part.** The Wilds map labels Greyhelm's buildings "Hall / Forge / Shop", with no "Miners' Guild". Ashford and Kingsbridge were the same. I found halls by walking into buildings.
- **Promotion never happened.** I met every Hunters' Lodge requirement for Tracker (8 wolves, 6 hide), but Ashford was far behind me by then. Nothing told me I was ready.
- **The Miners' Guild gate is steep for this start.** It needs Mining 10, and the Kingdom test character has Mining 1. My first rock gave 1 XP.
- **What I did:** joined three guilds (Growers, Hunters, Miners), got 8/8 wolves and 9/6 hide, and wore the Initiate title. I was refused at the Guild Seam, which is correct.

## Finding them

- **Route:** farm → Wilds (north exit). The Wilds map shows the towns, roads and green goblin-camp triangles. I visited Kingsbridge first, then Ashford, then went north to Greyhelm.
- **Kingsbridge (Growers' Guild):** I found it by trying doors.
- **Ashford (Hunters' Lodge):** my first guessed door was the Lodge, by luck.
- **Greyhelm (Miners' Guild):**
  - I entered by the north gate at night, at 11:30 pm.
  - Doors I tried first: the Iron Kettle inn, the Miners' Supply (closed, "Open 9 am to 6 pm") and the Longhouse (Chief Halvard, town jobs).
  - The Miners' Guild turned out to be a small stone house in the south-east block, near the mine mouth.
  - The door prompt does say "Shop · Miners' Supply" etc. when you stand at a door, but the map and the street don't.
- **What would fix it:**
  - Put the guild name on the town map label instead of "Hall"/"Shop".
  - Give each guild hall a distinct trade sign: a pick for Miners, antlers for Hunters, a sheaf for Growers, a fish for Anglers.
  - Have Halvard or the inn keeper mention the guild.
- **Saltmere (Anglers' Guild):** not visited. It was too far for the budget.

## Each guild

### Growers' Guild (Kingsbridge)
- **Joining:** 150g. Joining gives the Initiate title.
- **Next rank, Planter:** harvest 40 crops (0/40) and bring 10 wheat.
- **Fit:** this is a farm guild, so a combat-focused Kingdom test start has nothing toward it. That's fine.

### Hunters' Lodge (Ashford)
- **Joining:** 150g. The counter-and-shopkeeper room was much like the Growers' hall.
- **Rank rewards:**
  - Tracker: the Huntsman's Bow.
  - Stalker: the Tracker's Charm (+10% critical hits).
  - Huntsman: the Ashford Greatbow.
  - Huntmaster: the Antler Ring (+6 attack, +8% speed).
- **Store (all locked):** Arrow and Leather (Tracker), Fire Arrow and Huntsman's Bow (Stalker), Ashford Greatbow (Huntmaster).
- **Tracker task:** slay 8 wolves since joining, and bring 6 hide.
  - I met three wolf packs between Ashford and Greyhelm, so the task came to me naturally on the road. This is a good design.
  - Killing wolves at night was punishing: one pack of 3 took me from 300 to 76 HP in iron gear.
- **Fairness:** good. The kill counter only counts kills after joining, and the journal showed ✓ on both lines.

### Miners' Guild (Greyhelm)
- **Hall and master:** the hall has nice dressing (coal heaps, anvil, ore cart, pick rack, red banners). The master is Dorrik Stonehand, who greets you as "Ah, Initiate Tester."
- **Joining:** 150g.
- **Hewer needs:**
  - 20 copper ore (I had 2) and 10 coal (I had 0).
  - Mining level 10 (mine was 1).
  - Reward: 300g, and the Guild Seam opens.
- **Rank rewards:**
  - Delver: the Delver's Band (+4 defence, +1 luck).
  - Master Miner: your pickaxe reforged one tier up.
  - Guildmaster of Stone: the Greyhelm Crest (+15% gold, pulls loot to you).
- **Store:** Staircase and Coal (Hewer), Delver's Band and Mythril Ore (Master Miner), Diamond (Guildmaster).
- **Fairness:** from a Kingdom test start, Mining 10 is the wall. It takes about 1,150 XP, and a stone gave me 1 XP. With a normal mining character it would be fine. Greyhelm's own town job asks for 30 coal, which fits the guild nicely.

### Anglers' Guild (Saltmere)
Not reached.

## Promotion and titles

- **Titles tab:** shows ✓ Initiate "on joining". The guild window's header line says "Wearing: Initiate. Guild folk greet you by it", and Dorrik used it.
- **The journal** heading reads "GUILDS · WEARING THE TITLE INITIATE". This is a lovely touch.
- **I never promoted.** When the Tracker requirements went ✓/✓, there was no toast, no sound and no journal highlight. I only found out by opening J.
  - Ashford was by then a long walk back across the Wilds.
  - A "Ready for promotion: return to the Hunters' Lodge" toast, plus a tracker arrow, would turn this into a satisfying moment.
- **Joining three guilds** only gives three identical "Initiate" titles. The title isn't qualified by guild ("Initiate of the Lodge"), so it doesn't feel like it belongs to any one guild.

## Guild Seam

- **The gate works.** Standing at Greyhelm's mine mouth shows "E Enter · The Guild Seam". Pressing E as an Initiate gets: *"Hewers and above, Initiate. Dorrik will tell you what it takes."* This is clear and in character.
- **I couldn't go in.** I didn't reach Hewer, so I couldn't test the inside.

## Bugs

1. **A far left-click on a rock with the pickaxe walked a long path into a boss area.**
   - I clicked a grey rock about 6 tiles away, east of Greyhelm.
   - I ended up in the ash and lava area by the Frostpeak sign, with the **Ash Colossus** awake (boss bar up). I was burned to 204 HP and lost a life.
   - Earlier, two clicks on rocks just outside the wall also walked me well past them without mining.
   - The click target or path seems to pick a different, far tile.
2. **No feedback when guild requirements are met** (see Promotion).
3. **The coal heaps around Greyhelm's mine look mineable,** but the LMB hint says "Walk". Either make them minable for coal, which the guild and Halvard both want, or make them look clearly decorative.
4. **The story tracker label "to Hollowmere Farm" sits over important things,** such as the Guild Seam mouth and shop doors. It was on screen the whole session, because the Empty Throne herald story was tracked by default.
5. **The Ash Colossus arena seems very close to Greyhelm,** only a screen or two east. A new player leaving the mining town east walks straight into a world boss.

`errors` output: **none** (no JS errors all session).

## Balance

- **Wolves:** fair by day. At night a pack of three hit hard: 300 → 76 HP in iron, with Cleave used. Bread healed me fine.
- **Hide drops:** generous. I had 9 hide after 8 wolves, so that part is fine.
- **Mining:** 1 XP per stone is slow for a guild that demands level 10 before you can even enter its mine. It is especially slow for the Kingdom test, which is the obvious way to try guilds.
- **Costs:** 150g to join is trivial at 30k gold. Ranks pay 300g plus items, and the rewards are attractive.
- **Inn:** sleeping costs 120g; the Greyhelm inn and Miners' Supply keep normal hours.

## Ideas ranked

1. **Promotion-ready toast and tracker arrow** to the guild master when a rank's checklist is complete.
2. **Name guild halls** on the town map and on their trade signs.
3. **Guild-qualified titles** ("Hewer of Greyhelm") shown on hover or over the player, and a chosen title kept per guild.
4. **A "starter seam" or practice rocks inside the Miners' Guild yard** for Initiates, or lower Hewer to Mining 5. That way the first rank is reachable in one sitting.
5. **A guild notice board in each hall** with small repeatable contracts. These would give reputation toward ranks, not just the one-off checklist, and make it feel like ongoing membership.
6. **Guild NPCs in the hall** (other members, apprentices) who greet you by rank. That would give a sense of belonging; right now each hall is one keeper behind a counter.

## Top 5 fixes

1. Fix far click on rocks or nodes pathing to a distant wrong tile (it walked me into the Ash Colossus).
2. Notify when a rank is ready ("Return to Dorrik / the Lodge") and let the tracker point there.
3. Label guild halls on the town maps and give them unique signs.
4. Ease the Hewer gate for Kingdom test players, or give the test some Mining XP, or make Greyhelm's coal heaps minable.
5. Keep story tracker labels from covering doors and mine mouths. Fade them when near another prompt.
