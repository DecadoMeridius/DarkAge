# W3 far regions: Saltreach, Frostmere, Emberwaste (Kingdom test, Painterly)

**Setup:** Kingdom test, developer mode on (already ticked in this profile). Painterly and the FPS counter were already on. I played the regions in the order of their dungeon levels: Saltreach (26), Frostmere (32), Emberwaste (36).

**Shortcuts** (each is a console call, not normal play):
- **Saltreach** (the cobalt tier): Combat 40 in all styles, life skills 45 (mining, woodcutting, smithing, fishing, foraging, crafting), cobalt sword and armour equipped, 20 bread. `S.regions.saltreach = 1`, then `goMap('wilds', ...)` onto the dock next to Corwin's ferry. Took the ferry with a real right-click.

## Running log
- **Start state:** the Kingdom test starts with 33,000g. It showed 36,000g a few minutes later with no reason I could see (CLAUDE.md says the test has 20,000).
- **Corwin's ferry** works: a right-click on the boat at the dock takes you to the Saltreach (W3_regions_2). You land at the south edge on a dirt road that runs out of the sea. There's no jetty or boat on the Saltreach side, so the arrival doesn't read as a landing (W3_regions_3).
- **Port Saltreach:**
  - **Waystone:** it attunes when you walk up to it (toast "The rune wakes under your hand"). The waystone sprite is crisp pixel art among painted buildings (W3_regions_5).
  - **Tracker arrow:** the gold arrow sits right on top of the "PORT SALTREACH" area banner (W3_regions_4).
  - **Forge:** right-clicking the door opens the forge menu directly; there's no room to walk into (W3_regions_6).
    - **Forge tab:** Furnace + Anvil. In the Kingdom test every row has Get / Get ×5 sandbox buttons. Is that intended outside the Test sandbox?
    - **Patterns tab:** Tidesteel pattern 18,000g.
    - **Plans tab:** only T4 (15,000g, "Needs Construction 40 and tier 3 first"); the Buy button is greyed. OK, but a tier-1 player gets no hint where T2 and T3 are sold (W3_regions_7).
  - **Market:**
    - **Buy:** Sea Grape seeds 72g, Saffron bulbs 199g, Mangrove Wood 93g, Tidestone 318g, Kelp 143g, Treasure Map 837g, Salt 5g.
    - **Sell:** only Country Bread (100g each) and Trail Bread (8g). The header reads "Traders **up here** pay well for food from the lowlands", which fits the Highmarch, not a port.
  - **Inn:**
    - **Meals:** Pearl Chowder 1,023g, Saffron Paella 1,552g, Sushi 481g, plus Rest (300g) and a Cookbook tab.
    - **Rumour:** "Rumor: Cut tall grass with your scythe…", a generic farm tip again, spelled "Rumor" (the towns use "Rumour").
    - **Sleeping:** no "sleep here until morning", unlike the Wilds town inns.
- **Resources (Saltreach):**
  - **Tidestone:** with Mining 45 and the Kingdom test's Basic pickaxe, a click on a tide vein says "You need a better pickaxe (Iron)". The hover gave no warning: the cursor stayed normal and the hint said "LMB Mine". The locked-node label only checks the skill level, not the tool tier (W3_regions_9).
    - With `S.tools.pick = 4` (gold; shortcut) one vein gave 6 ore in about 10 s.
  - **Other gathering:** mangrove (Woodcutting 40) gave 12 wood. Kelp is a forage pickup (it came out silver quality, which still counts for the bar recipe).
  - **Seashells** (218 on the map) are pure decoration (`OBJ.shell = {}`). Right-clicking one does nothing, though they look like pickups.
- **Smelting and smithing (Saltreach):**
  - **Tidesteel Bar** (5 ore, 2 coal, 1 kelp) needs Smithing 50; I set it to 50 (shortcut). Coal isn't sold anywhere in Port Saltreach; I gave 10 (shortcut).
  - **The pattern:** I bought the Tidesteel pattern for 18,000g. It was taken at once with no confirmation, though town shops ask before big buys.
  - **The dagger:** made 2 bars, then smithed a **Tidesteel Dagger** (2 bars + Cord Grip; the grip was given as a shortcut). There's no workbench in the town, so parts (grip, haft, padding, straps, rivets) must be brought from home. The forge window doesn't tell you this.
  - **Forge window:** the "Furnace ✓ / Anvil ✓" chips look like two ticked filters, but only one shows at a time; I first thought the anvil list was empty (W3_regions_10).
  - **The Kingdom test runs with `SANDBOX = true`.** So every pattern is already known, the Get buttons show, and the 18,000g pattern purchase changed nothing. Pattern gating can't be tested in this scenario.
- **The Drowned Grotto (Saltreach dungeon), Combat 40, cobalt gear:**
  - **The door window** says "Floors you've reached (3 and 5) can be taken straight from here" on a first visit, before you've reached either.
  - **Floor 1:** enemies are level 28 (Reef Lobster 542 HP / atk 81, Tide Jelly 497 / 77, Drowned 678 / 95). Cleared in about 1 min, lost about 250 HP over two fights and ate 2 steaks. Fair for cobalt.
    - **A Tide Jelly ended up inside a wall tile** (`dg_saltreach` f1 at 34,17, `x` on all four sides). It reset to full health and could only be reached once it drifted out.
    - **The area banner "THE DROWNED GROTTO, FLOOR 1" is drawn under the ore rocks,** so it's half hidden (W3_regions_12).
  - **The rooms are packed with ore** (18% of floor tiles): the faceted gem-like gold, silver and gem rocks read as low-poly 3D next to the painted boulders (W3_regions_12, W3_regions_13).
  - **Camera:** on these 36-wide floors the camera clamps at the side edges, so the player stands under the top-right menu dock (W3_regions_13).
  - **Target frame:** it shows "Reef Lobster (level 84)" for a level-30 enemy (`EN.hp/10 + lvl*2`), next to my combat level 40. It reads as hopelessly over-levelled, but the fight was easy (W3_regions_15).
  - **Floor 2:** 9 enemies at level 30, cleared in about 25 s of fighting. The tier-5 chest held a diamond, 4 obsidian and a nautilus.
    - **One Reef Lobster sat in a pocket sealed by ore nodes.** At 24/564 HP it went home and healed to full.
  - **BUG (progress blocker):** on floor 2 **the ladder down was sealed off by rocks and ore.** A flood fill from the up-ladder reached 392 tiles, but none of them was next to the ladder at 33,22. You must mine one of rock@30,13, ore_gem@31,13, rock@29,14, ore_silver@32/33,14 or rock@24,20/21.
    - Nothing tells you this. `genDungeon` places the ladder with `bfsFar` and then scatters ores on 18% of the floor with no reachability check.
    - The mines do this on purpose, but here it looks like a dead end.
  - **Floor 3: you arrive trapped.** The start tile is carved one tile below the up-ladder (`setT(m, sx, sy+1, 'c')`), and here it was a 1-tile notch in the wall. The pocket around the ladder was 14 tiles, closed by 4 rocks (W3_regions_16).
    - The ladder down and every enemy were sealed off. I mined two rocks to get out (a flood fill then reached 406 tiles).
    - **Three enemies were inside the top wall rows** (Tide Jelly at 26,1 and 22,0, bat at 22,1).
    - **In the screenshot the Drowned stand on the dark wall tops** (W3_regions_16).
    - **Suggestion:** after scattering ores, make sure the up-ladder, the ladder and the chest share one open region; keep spawns off `x` tiles.
  - **Floor 3 fight:** 8 level-32 enemies (Drowned 732 HP). They took me from 440 to 190 HP with one meal. Cleared.
  - **Then the clock hit 2 am inside the dungeon:** collapsed, carried to the farm, charged 2,134g. A day goes very fast in a dungeon, about 20 in-game hours in roughly 45 minutes of my (slow) play. I never saw a 1 am warning, though my fights were automated. Dungeon floors have no clock pressure hint.
  - **Floor 3, second visit** (rebuilt): **the ladder was sealed again**; one rock mined opened it. 10 enemies cleared in 31 s, 5 meals.
  - **Floor 4:** 13 enemies (level 34, Drowned 759 HP) in 50 s, but it cost **12 meals** (bread heals little at this point).
    - **The tier-5 chest** held 496g, 5 Adamantite Ore, a Diamond and a Diamond Ring.
    - **Food ran out:** the Kingdom test's 40 bread and 15 steaks were all eaten by the end of floor 4. I gave myself 12 Pearl Chowder (shortcut) to stand in for food a player would bring or buy at the inn for about 1,000g each.
  - **Floor 5, The Tidecaller** (level 36, 4,978 HP, kit: tidewave, ring, slam, summon jellies, spiral):
    - **First try** (my bot hits whatever is nearest): the summoned Tide Jellies (576 HP each) kept pulling it away. It lost all 3 lives in 85 s with the boss at 1,778/4,978.
    - **Knockout:** carried home, charged **2,299g**, and the rest of the day was skipped to the next morning. The report says "Sleep in your tent before 2 am next time", which is the wrong advice for a combat knockout at 1 pm.
    - **Second try,** focusing the boss: down in **34 s** with 9 Pearl Chowders. Fair for cobalt at Combat 40, if you bring good food. The boss is a jelly the size of a normal Tide Jelly, so it doesn't read as a boss (W3_regions_17).
  - **Tier-6 chest:** 475g, Kraken Ink, 2 Pearls, **5 Tidesteel Bars, 6 Adamantite Bars**, an Ember Shard. A strong reward.
    - **My bag was full** (the Kingdom test starts with a full iron set, 300 arrows and seeds in the 28 slots). Everything spilled into one stacked pile under the chest, which looks like a single red blob (W3_regions_19).
    - **Pickup:** after I freed slots (deleted the iron set; shortcut), walking over the pile picked it all up.
- **World boss: The Drowned Captain** (arena at 19,101, level 25, 6,375 HP; W3_regions_20).
  - He comes with Drowned adds and purple orb hazards scattered over the beach.
  - **Painterly:** he is a crisp pixel sprite (tricorn, green coat), as are all creatures. The arena is plain sand with a pond; nothing marks it as an arena.
  - **The fight:** won by focusing him. It cost **all 3 lives and 12 Pearl Chowders**, so he is harder than the dungeon boss despite his lower level.
  - **Drops:** Captain's Compass (the ring trophy), an Ember Shard, a Treasure Map and about 1,200g.
  - **Knocked out afterwards:** with 0 lives the harpies and jellies around the arena kept chasing me, and I was knocked out about 1 pm on the way to the cache: −2,296g and the day skipped again.
  - **Cost of losing:** three knockouts in three in-game days cost about 6,700g. Losing all lives in a region always sends you home to the farm (the ferry or the waystones bring you back).
- **Hidden cache** (33,104, the isles biome): 547g, a Prismatic Ring and 2 Adamantite Bars. Good.
- **Toast:** "Defence is now level 49! (Combat 79)". With Combat at 66-79, the "level 84" Reef Lobster label is less off than I first thought. Still, a level-28 dungeon enemy labelled 84 and a level-25 world boss is confusing.

## Frostmere (the Tidesteel tier)
**Shortcuts:** Combat 50 in all styles, life skills 57, tidesteel sword and armour equipped (Melee/Defence 45), 20 + 10 Pearl Chowder. `S.regions.frostmere = 1`, then `goMap('wilds', gate x 88, y 5)`. I walked through the north gate myself.
- **Rimehold:**
  - **Inn:** Lotus Broth 1,578g, Lichen Bread 637g, Frost Soup 703g, Rest 300g.
    - **Rumour:** "Rumor: Gold sprinklers water a 5×5 square every morning", generic again.
  - **Market:**
    - **Buy:** Ice Turnip seeds 90g, Snow Lotus 318g, Frostwood Log 124g, Rimestone 375g, Snowcap 430g, Frostsilver Ore 257g.
  - **Forge:**
    - **Plans tab:** shows T4 again; the same plan as Saltreach.
- **Art:**
  - **Rimehold's town square:** the ground ('sn') reads as dusty pink-beige with saturated orange dirt blobs, not snow (W3_regions_21). Outside town the snow is right: white-grey with snow-dusted pines (W3_regions_22).
  - **The roads** in the Frostmere are bright orange dirt ribbons across the snow. They look pasted on; a trodden-snow or grey gravel road would fit better.
  - **The forge** is the same grey stone-and-slate smithy as Port Saltreach; only the houses are regional log lodges.
  - **The "RIMEHOLD" banner** is drawn behind the lodge and under the tracker arrow.
- **Gathering:**
  - **A rime vein was hidden behind a frostwood canopy** (86,99, with the tree at 86,100): it was invisible on screen.
  - **BUG/QoL:** clicks on the tree and the vein did nothing at all, no tool switch and no message. An ice slime pack and a Rime Wolf were 184-240 px away, off screen, so the "any foe within 200 px means a click attacks" rule ate every gathering click. You can't gather when an unseen enemy is that far away, and nothing tells you why.
- **Rime Wolf packs:** a pack of **7** Rime Wolves (level 26, 608 HP, atk 87) roams **20-30 tiles west of Rimehold**.
  - With Combat 50 and full Tidesteel (the tier you'd have here) my bot lost 3 lives over about 3 minutes, ate 15 Pearl Chowders and **killed none**.
  - **The leash makes it worse:** wounded wolves (176/608) ran back to their den 20 tiles away at the 280 px leash and came back at full health.
  - **Knocked out at noon** (−2,066g, day skipped).
  - **My bot hits the nearest enemy and never dodges,** so a careful player will do better. Still, 7 wolves with 608 HP each beside the first town is a wall, and the healing leash turns a near-win into a loss. Rime Essence (needed for every rime bar) only drops from these wolves (20%) or frost wraiths.
- **Getting to the Hall of Rime:** I took the waystone to Rimehold and let the auto-path (`walkTo`) take me to the dungeon (24,60).
  - **An Ice Elemental** caught me on the way and took me to **28/530 HP** right at the door ("Low health!" toast).
  - **The dungeon clearing** is a hard-edged grey-brown square stamped onto the snow, with an orange road leading in (W3_regions_23).
  - **The dungeon mouth** is a nice icy cave.
- **The Hall of Rime** (level 34 on floor 1; Frost Wraith 759 HP), with Tidesteel and Combat 50. **Much easier than the wolves outside.**
  - **Floor 1:** 4 wraiths in 19 s, no meals.
  - **Floor 2:** 10 enemies in 34 s, 9 meals, 1 life lost.
  - **Floor 3:** 6 enemies, no meals. Again a Frost Wraith IN-WALL at 16,6, and a frost bat sealed in rock on floor 1.
  - **Frost Wraiths drop Rime Essence 60% of the time,** but none reached my bag: **the bag was full, the drops lay on the ground, and the "backpack full" toast is suppressed after the first** (quieter toasts). A dozen kills looked like zero drops until I checked `cur.ents`. After I deleted junk (shortcut), walking over them gave 5 essences and 2 rime ore.
    - A full-bag warning that never repeats is a trap in a dungeon, where every kill drops something. Suggestion: a small "bag full" badge on the bag tile, or a counter on the ground pile.
  - **Floor 4:** 11 enemies in 39 s, 3 meals. The tier-5 chest held 547g, a Mythril Bar and 4 Obsidian.
  - **Floor 5, Heart of the Glacier** (level 42, 6,647 HP, kit: spiral, ice lane, ring, summon ice slimes): down in **37 s with 5 meals**, no lives lost (W3_regions_24).
    - **The boss looks like a plain Ice Slime,** the same size as the summons, and the boss bar sits over it. Like the Tidecaller, it doesn't read as a boss.
    - **Drops:** Glacier Core, 3 Rime Bars, an Ember Shard.
    - **The tier-6 chest was thin:** 409g, 2 Adamantite Bars, 1 Prismatic Shard, against 5 Tidesteel + 6 Adamantite Bars in the Saltreach one. Tier-6 rolls swing a lot.
  - **Difficulty curve:** the Hall of Rime (level 34-42) was **easier than the overworld wolf pack beside Rimehold.** The dungeon is fair for Tidesteel; the overworld is not.
- **World boss: The Rime Queen** (arena 107,35, level 30, 8,225 HP, with a Rime Wolf pack).
  - **The fight:** killed at midnight in about 40 s, using 12 Pearl Chowders and 1 life. She drops the Rime Crown.
  - **The 2 am cutoff caught me again** on the way out (−1,986g).
  - **Painterly at night:** the snowy pines and the blue night grade look lovely. The Queen herself is a big blocky pixel figure whose robe is a flat blue triangle (W3_regions_25).
- **Smelting and smithing (Frostmere):**
  - **Rimesteel Bar** needs **Smithing 70**, while the ore needs Mining 57 and the gear needs Melee 57. The 13-level smithing gap is the steepest of any tier. I set Smithing to 70 (shortcut).
  - **Made:** 1 bar, then a **Rimesteel Dagger** (with a grip I gave; shortcut).
- **Bag full again:** the grip I was given went to the ground because the bag was full. The recipe row just said "Cord Grip (have 0)" and the Make button did nothing visible: no toast, no message.
- **Loot that follows you:** about 40 drops (hides, ice shards, yeti fur, a mammoth tusk, rime essence) from the wolf and Queen fights had "homed" across the map and lay piled at my feet in Rimehold the next day. Good that nothing was lost, but it's a surprise to find a heap of loot beside the forge.

## Emberwaste (the Rimesteel tier)
**Shortcuts:** Combat 60, life skills 72, Rimesteel sword and armour (Melee/Defence 57), 25 Pearl Chowder, `S.regions.emberwaste = 1`, `goMap` to the north gate at x 387. Smithing set to 80, coal ×8 and a grip given.
- **Cinder Camp** (W3_regions_27): ash ground, hide tents and a brick forge. It reads well as a badlands camp.
  - **Market:** Dragon Pepper seeds 148g, Cinder Melon seeds 372g, Charwood 175g, Cinderite 493g, Fire Pepper 465g, Obsidian 256g.
  - **Inn:** Dragon Chili 1,846g, Melon Sorbet 1,966g, Ember Curry 997g. The rumour is generic again ("Gold shows up past floor nine").
  - **Forge Plans:** T5 Ember arcana 40,000g (Construction 55, tier 4 first).
- **Gathering and fighting:** a Hellhound (level 30) blocked gathering the same way (an enemy within 200 px eats clicks).
  - **The fights:** killed it and a Cinder Imp (759 HP) with 11 meals. They gave 2 Hound Embers and 3 Salamander Scales.
  - **Mining:** two Cinderite veins gave 7 ore.
- **Smithing:** **Cindersteel Bar needs Smithing 80** (ore Mining 72, gear Melee 75) and 4 coal. **No coal is sold in the Emberwaste,** and the Frostmere doesn't sell any either.
  - **Bars:** 7 ore made one bar; I bought 3 Cinderite (493g each, no confirmation) for the second.
  - **Made:** a **Cindersteel Dagger**.
- **Getting to the Molten Vault:** walking from Cinder Camp went without trouble. The lava pools look blocky, a pixel checkerboard rather than painted lava (W3_regions_28).
- **The Molten Vault** (level 38 on floor 1: Cinder Imp 813 HP / atk 141, Flame Slime 921 / 130, Obsidian Golem 2,168 / 163), with Rimesteel at Combat 60:
  - **Floor 1:** cleared in 38 s with 2 meals. The ladder was sealed again.
  - **Floor 2: sealed for Mining 72 players, nearly.** The arrival pocket was 91 tiles, and the ladder and every enemy were behind ore. The ores nearest the ladder were **Obsidian (Mining 75), Adamantite and Starmetal**, all locked at the region's own ore level (Cinderite is 72).
    - **The way out:** 8 plain rocks also bordered the pocket, and mining two of them opened it. A player who swings at the obsidian gets a lock label and wastes time. My digger kept hitting an obsidian vein that never broke, and about 4 in-game hours passed.
  - **Painterly:** the dark brick walls and the dark brown floor are very low in contrast, so it's hard to see where you can walk (W3_regions_29).
  - **Floors 3-4:** I dug through and descended without fighting, to beat the clock.
  - **Floor 5, The Ash Mother** (level 46, 7,982 HP, atk 107, kit: fire pools, circle, spiral, summon Cinder Imps): **5,700 damage in 18 s**, a good pace.
    - **BUG:** on this 30×24 boss floor the camera clamps, and **the boss stood under the top-right menu dock** (screen 1387,270). **Clicking to attack her clicked the "Collect" tile** and opened the Satchel (Collections) mid-fight (W3_regions_30).
    - **Lost the fight:** after that I couldn't hit her (she stayed back), and the 5 Cinder Imps (921 HP) took my lives. Then **2 am collapse number three.** Not finished.
  - **The Emberwaste world boss (Cinder Drake) and its caches were not reached:** the run was out of time.

## Broken
1. **Dungeon floors are often sealed** (all three regions, 7 of 9 normal floors I visited): the ladder down, and sometimes the whole arrival pocket, is closed off by ores and rocks.
   - **Saltreach f3:** the start was a 1-tile notch below the up-ladder (W3_regions_16).
   - **Emberwaste f2:** the closest blockers were veins above the region's own Mining level.
   - **Cause:** `genDungeon` scatters ore on 18% of the floor after placing the ladder, with no reachability check. Nothing tells you to dig.
   - **Fix:** flood-fill after placement and clear one path from the up-ladder to the ladder and the chest. Never use level-locked ores as the only bridge.
2. **Enemies inside walls:** Tide Jellies and bats at Saltreach f1 and f3, and a Frost Wraith at Frostmere f3, stood inside `x` tiles or the top wall rows, sealed and unreachable. One reset to full health.
3. **The boss is under the HUD on small floors.** Camera clamping on 30-36-wide dungeon floors puts the player and the boss under the top-right dock (W3_regions_13, W3_regions_30). An attack click on the boss opened the Satchel mid-fight. The camera should be allowed past the side edges, as it already is for top and bottom.
4. **Gathering clicks silently do nothing** when any enemy is within 200 px, even off screen (Frostmere: slimes at 184-240 px; Emberwaste: a hellhound). There's no message and no tool switch. Limit the weapon rule to enemies on screen or near the cursor, or say "Enemies nearby".
5. **Full bag in dungeons:** drops go to the ground and the "backpack full" toast is suppressed after the first, so a dozen kills look like no drops. The tier-6 chest spilled into one unreadable pile (W3_regions_19). A grip given to a full bag fell to the floor, the recipe said "have 0", and Make did nothing.
6. **The knockout report says "Sleep in your tent before 2 am next time"** for a combat knockout at 1 pm.
7. **Enter doesn't press "Start the day"** (seen again, as in W3_realm).
8. **The Kingdom test runs with `SANDBOX = true`:** Get buttons show and every pattern is already known, so buying an 18,000g pattern changes nothing. Pattern and recipe gating can't be tested there.

## Quality of life
- **Tool-tier locks aren't shown on hover.** The red cursor and node label check only the skill level. A tide vein with a Basic pick showed "LMB Mine", then "You need a better pickaxe (Iron)" (W3_regions_9).
- **Big buys:** the 18,000g pattern purchase has no confirmation.
- **Inns:** rumours are generic farm tips everywhere ("Rumor", spelled differently from the towns' "Rumour"). No inn offers sleeping until morning, unlike the Wilds inns.
- **Wrong wording:** the Saltreach market says "Traders up here…". The dungeon window says "Floors you've reached (3 and 5)" before you've reached any.
- **Missing supplies:** no workbench or parts in any region town, and no coal sold in the Saltreach, Frostmere or Emberwaste. Every regional bar needs coal (2-4) and every regional item needs grips, hafts or padding from home. Nothing in the forge window says so.
- **Chips:** the forge's "Furnace ✓ / Anvil ✓" chips look like two ticked filters but show one list at a time.
- **Seashells:** 218 on Saltreach beaches, and they can't be picked up.
- **Waystones:** the list offers "Travel" on the stone you're standing at.
- **Ferry:** the Saltreach arrival has no jetty or boat; the road runs out of the sea (W3_regions_3).
- **Time:** a full in-game day goes by in about 2-3 dungeon floors. I collapsed at 2 am three times and was knocked out three times: about 13,000g lost in 7 days, and each loss skips the rest of the day.
- **Hidden ore:** a rime vein sat hidden behind a frostwood canopy.

## Balance
| Region (tier, Combat) | Dungeon f1 | Dungeon boss | World boss | Overworld |
|---|---|---|---|---|
| Saltreach (cobalt, 40) | lvl 28, fair | Tidecaller 4,978 HP: 34 s, 9 meals | Drowned Captain lvl 25, 6,375 HP: won, 3 lives + 12 meals | fine |
| Frostmere (tide, 50) | lvl 34, easy (no meals) | Heart of the Glacier 6,647 HP: 37 s, 5 meals | Rime Queen 8,225 HP: ~40 s, 12 meals + 1 life | a 7-wolf pack (608 HP each) beside the town: lost |
| Emberwaste (rime, 60) | lvl 38, easy (2 meals) | Ash Mother 7,982 HP: 70% in 18 s, then the dock bug | not reached | hellhound/imp: 11 meals |

- **Overworld vs dungeon:** overworld packs near the region towns are harder than the region dungeons. The healing leash makes it worse (wolves at 30% went home and came back full).
- **World bosses** are lower level than the dungeon bosses but cost more. The Drowned Captain (level 25) took all my lives; the Tidecaller (level 36) took none.
- **Smithing gaps:** the regional bars need Smithing 50 / 70 / 80 against ore Mining 45 / 57 / 72 and gear Melee 45 / 57 / 75. Rimesteel's +13 smithing gap is the odd one out.
- **Food:** the inn meals (1,000-2,000g each) are the only big heals, and a dungeon run ate 30+ meals. Bread from the Kingdom test heals almost nothing at 500 HP.
- **Target frame:** it shows enemy "level" as `hp/10 + lvl*2` (a level-28 crab shows as 84), and a "level 25" world boss looks easy.
- **Tier-6 chests vary a lot:** Saltreach gave 5 Tidesteel + 6 Adamantite Bars; Frostmere gave 409g, 2 Adamantite Bars and a Prismatic Shard.
- **Shortcuts I took** (all by console):
  - **Region access and travel:** opened the regions and moved by `goMap`.
  - **Skills and tools:** set combat and life skills, Smithing 50/70/80, and the pickaxe/axe to tier 4.
  - **Items:** gave gear sets, grips, coal and Pearl Chowder.
  - **Bag space:** deleted junk to free it.
  - **Fights:** run by a click bot that never dodges and hits the nearest enemy.

## Art & feel (Painterly)
- **Towns:**
  - **Good:** Port Saltreach (stilt houses, a whitewashed inn, sand) and Cinder Camp (hide tents, ash) feel right (W3_regions_5, W3_regions_27).
  - **Rimehold's square** reads as pink-beige dust with orange blobs, not snow (W3_regions_21).
  - **Every region's forge** is the same grey stone smithy.
- **Roads:** Frostmere roads are saturated orange dirt ribbons over snow. The dungeon and arena clearings are hard-edged stamped squares (W3_regions_23).
- **Ore:** ore rocks in the dungeons (gold, silver, gem, obsidian) look faceted, like low-poly 3D crystals, beside the painted boulders.
- **Lava:** Emberwaste lava is a blocky pixel checkerboard (W3_regions_28).
- **Bosses:**
  - **Dungeon bosses** are just their pool creature (the Tidecaller is a jelly, Heart of the Glacier an ice slime), the same size as their summons, with the boss bar drawn over them (W3_regions_17, W3_regions_24).
  - **The Rime Queen and the Drowned Captain** are big crisp pixel sprites; the Queen's robe is a flat blue triangle (W3_regions_20, W3_regions_25).
  - The pixel creatures were expected.
- **Waystones** are crisp pixel art in every region.
- **The Molten Vault's** walls and floor are nearly the same dark colour (W3_regions_29).
- **Area banners** ("THE DROWNED GROTTO, FLOOR 1", "RIMEHOLD") are drawn under ore rocks and buildings, and the tracker arrow covers them.
- **The Frostmere at night** (snowy pines under the blue grade) is the best-looking place I saw (W3_regions_25).

## Performance
- **Frame rate:** 152-165 fps everywhere: Port Saltreach, the dungeons, Frostmere at night, Cinder Camp. Work was 0.7-2.6 ms per frame, also during the boss fights. No stutters.
- **Console:** no in-game errors (`errors`: none). The harness log has the same five "Failed to load resource: 404" lines as earlier passes.

## Liked
- **Corwin's ferry and the waystones** made the far regions easy to reach and to return to. Floors 3 and 5 being selectable at the dungeon door is a good shortcut.
- **Every region has its own crafting chain:** regional ore + monster part + regional extra (kelp, rime essence, hound ember) → bar → gear. Bars and a dagger worked in all three regions.
- **Rewards feel big:** boss trophies (Captain's Compass, Glacier Core, Rime Crown), Tidesteel and Adamantite bars in chests, a Prismatic Ring in a hidden cache.
- **Dungeon combat** at the right tier is snappy: floors clear in 20-50 s.
- **Cinder Camp and Port Saltreach** have real character.

## Top 5 fixes
1. **Make dungeon floors connected:** after scattering ores, carve a guaranteed path from the up-ladder to the ladder and the chest. Never leave the arrival tile in a notch. Keep enemies off wall tiles.
2. **Let the camera pass the side edges on small maps,** so the player and the bosses aren't under the top-right dock. Make world clicks on a dock-covered spot never open menus mid-fight.
3. **Gathering vs the weapon rule:** don't let an off-screen enemy within 200 px eat gathering clicks silently. Show tool-tier locks on hover like skill locks.
4. **Bag-full feedback** in dungeons and chests (a persistent badge, ground piles that show their contents), plus a correct knockout message.
5. **Retune the overworld around the region towns** (7-wolf packs with a healing leash beat a fully geared player who clears the dungeon easily). Close the Rimesteel Smithing 70 gap. Sell coal and basic parts in the region towns. Give dungeon bosses their own size and look.
