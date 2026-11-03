# Round 3 — Wilds, towns, caravans (Kingdom test, Painterly) — port 9303

## Game-breaking
- **Caravans vanish on the spot after ~12 s.** A Wilds caravan is a knight patrol whose path is short (logged: 20 path nodes, `P.age` 12.6 s); when the path ends `x_realm.js:580` sets every member `gone`, `caravanFrame` sees no guards and drops `CARAVAN`, so wagon, horse and both guards pop out of existence mid-road. In my log it vanished 74 px from the player, in full view. Natural caravan on day 3 (village > Kingsbridge) also disappeared within ~2 s of my teleport next to it at the crossroads. Repro: `node h9303_cv.mjs 20` (pushes `{from:'village',to:'kingsbridge',...,goods:{iron_bar:30}}` into `S.mkt.cv`, `CARAVAN_T=0`) and log once a second. Shots R3_wilds_4 (wagon), R3_wilds_5 (same spot 2 s later: gone). Not a crash, but it reads as broken.

- **Wagon pops out when looted.** With both guards down and a bandit within 40 px, `caravanFrame` sets `W.lost` and then `CARAVAN = null` straight away, so the wagon disappears instead of standing there looted (the `!W.lost` stop in the movement code never gets used). Repro: `node h9303_loot.mjs 25 6` (pushes a caravan, spawns 6 level-25 bandits as a bandit patrol on it, player 190 px off).
- Region inn rest isn't once a day: `doorAction('r_inn')` in u_regions.js has no `restDay` check (Highmarch Hold: rested twice in a row, 300g each, full HP both times). The lowland inns are fine (below). Low impact, since it's paid.
- No console errors all session (`errors` = none after shops, endDay x2, caravans, looting, story kills, 5 maps).

## Economy
- **Specialist buyers pay less than the shipping bin.** The "Pays 15% over the usual price for what they deal in" shops are in the towns that make those goods, so the cheap-here factor wins: Saltmere fishmonger paid **30g** for a sardine (base/bin 32), Ashford sawmill **2g** for wood (base 3), Greyhelm supply **11g** iron ore (base 12). The note is misleading; a player who hauls fish to the fishmonger loses money against the bin at home. Repro: give fish/wood/ore, `node h9303_shop.mjs sm_fish|af_trader|gh_supply`.
- **Town prices follow the description.** Factors (`mktF`, first unit): ore Greyhelm 0.80 vs 1.10 elsewhere; fish Saltmere 0.80 vs 1.0-1.15; wood Ashford 0.80 vs 1.0-1.15; bread 1.25 in all four region towns. Shops: Greyhelm iron ore 14g, copper 7g; Ashford wood 4g, hardwood 23g; Saltmere sardine 37g; Highmarch market buys Country Bread at 95g vs 88g in Kingsbridge. Every region market sells coal (0.80 there).
- **Saltmere's "sea goods" discount doesn't reach kelp or clams.** `mktCat` returns `forage` for them before the salt/kelp/shell regex, so only salt gets the 0.75. Saltmere fishmonger sells Kelp at 102g (base 70) and Clam at 73g (base 50). Its own delivery job (10 kelp for 950g) costs more than 1,020g to fill from its own shop.
- **Buying stock out works and recovers.** Saltmere sardines: 48 in stock at 37g → ×5 buys → 46g "Scarce here" → 66g "Very scarce here" with 3 left → "Sold out: traders will bring more", ×5 button refuses with "Only 3 left." 48 cost 2,548g; selling all 48 back at once paid 2,112g (no loop). After `mktDaily()` (shortcut) stock went 0 → 26.6 → 30.9 → 34 → 37 → 54 over 5 runs.
- No cross-town loop found at normal stock: ore Greyhelm 14g → Kingsbridge smith pays 13g; iron bar Greyhelm forge 73g → Kingsbridge pays 59g; sardine 37g → bin 32g. Thin margin only at friend prices (rep 50, 1.3x markup) or during a glut event (Saltmere fish at 1.8x stock sells for ~26g against the 32g bin until stock falls to ~1.3x): tens of gold, not a loop worth chasing.
- **Caravans only exist when stocks are out of balance.** Day 2 (after my sardine trade) produced only Saltreach > Saltmere caravans (regions are skipped in the Wilds); day 3 got lowland ones only because of a random Kingsbridge ore shortage. A player who doesn't trade may rarely see one. News and "Where prices stand" read well; looted text says "30 iron bar" (no plural, `cvSay`).
- **Regression checks (round 2): all pass.** Empty Throne ch. 4 `*assist` kills: set `S.story.q.throne={c:3,i:2}` (shortcut), spawned 6 wolves by a knight patrol (`SPAWN_RAW`), killed them: step advanced to "talk to Vey". Kingsbridge inn: hot meal second time "You've had your hot meal today", rest second time "You've rested here today already". Delivery jobs pay over base worth (kb_iron 1,100g vs 590g, af_hard 650g vs 300g, gh_pie 1,650g vs 1,200g) and are one-shot.

## Art
- **Caravan wagon is drawn in the overlay pass** (`pcCursorDraw`), so it sits on top of everything: a guard standing in front of (below) the wagon is covered by its wheel (R3_wilds_7), and the wagon covers a tree canopy that should overlap it (R3_wilds_6). It should go through the normal depth sort.
- **Lead guard stands on the horse's head.** The wagon follows 20 px behind the leader, but the horse reaches ~25 px forward of the wagon centre, so the lead knight overlaps the horse in every shot (R3_wilds_4, _7, _13). Facing is right: horse in front both ways (dir -1 and the mirrored dir 1). At night it takes the grade correctly (R3_wilds_13).
- **Painterly crate (`furn_crate`) looks like a placeholder:** a flat orange square with one diagonal, no shading or shadow (Greyhelm and Saltmere, R3_wilds_10, _12).
- Saltmere pier reads as an upright palisade (vertical planks with dark gaps) more than a deck (R3_wilds_12). Minor.
- Greyhelm turf roofs are flat green slabs with a tile pattern; some house windows look lit (yellow) at 11:00 (R3_wilds_10). Minor.
- Kingsbridge plaza, Ashford, Highmarch Hold look good (R3_wilds_2, _11, _3).

## Performance
- 150-165 fps in towns and Wilds, 120 fps beside the caravan at the Kingsbridge gate; FRAME_MS 1.5-5 ms. No stutter noticed.

## Top 5
1. Caravans vanish in plain view about 12 s after appearing (the escort patrol's path ends and every member is set `gone`); looted wagons vanish too.
2. Wagon drawn in the overlay pass: on top of guards in front of it and of tree canopies; lead guard overlaps the horse.
3. "Pays 15% over" specialist buyers (Saltmere fish, Ashford wood, Greyhelm ore) pay less than the shipping bin, because their towns' cheap-here factor wins.
4. Kelp and clams count as forage, not sea goods: dear at Saltmere (102g / 73g), and the 950g kelp job costs more than that to fill there.
5. Painterly `furn_crate` is a flat orange placeholder square; region inn rest has no once-a-day limit (minor). Regression checks (ch. 4 assist kills, inn meal/rest once a day, delivery jobs) all pass; no console errors.
