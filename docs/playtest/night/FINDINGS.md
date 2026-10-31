# Overnight playtests: findings log

AI testers drive the game through a headless Chrome, using only the mouse and keyboard. They play a snapshot build on `http://[::1]:5174`, so they never touch your saves.

- Their raw reports are in this folder: `r<round>_<persona>.md`.
- This file collects everything they said, grouped, with what was done about each item.

Status marks:
- **FIXED**: done and checked in the game.
- **FIXED?**: done, not yet confirmed by a later round.
- **OPEN**: not done yet.
- **NO**: deliberately left alone, with the reason.

## The night in short (6 rounds, 24 AI testers)

The new content went from not playable past the first step to playable through chapter 4:
- **Round 1:** no town menu opened, the castle kitchen read as a softlock, and Ashcombe's closed manor stopped the story.
- **Round 2:** the herald never arrived.
- **Round 3 onwards:** testers finished chapters 1-3 on day one.
- **Round 5:** chapter 4 began.

**Fixed: about 140 of the 253 items below.** The main ones:
- **Town and room menus:** every keeper and counter works; you're reached across counters; doorways are cleared.
- **The story:**
  - the herald's procession (wagons, spacing, arrival);
  - the castle step;
  - a confirmed payment for the deed;
  - auto-tracking, with a tracker that follows the walking route;
  - dialogue input that no longer leaks into the world;
  - Isolde living in the keep.
- **The court:** guards, servants, knights and nobles who walk, stop for you and dine in the great hall.
- **Getting around:**
  - waystones (walk-up attuning, Briarholt's own stone, landing beside the stone);
  - roads, town outlines, building labels and patrols on the map;
  - straight bridges;
  - gateways paved and kept open;
  - unsticking;
  - held keys kept after a window closes.
- **Towns:**
  - Kingsbridge always exists, with townsfolk and stall vendors;
  - inns with hot meals and overnight stays;
  - town jobs in the journal with progress;
  - a knight escort for the patrol job;
  - solid walls.
- **Balance:** a gentle ring near towns and the home roads, softer slimes and crows, a day-one fish dish, Trail Bread on the hotbar.
- **Art:**
  - redrawn castle walls and keep;
  - orangeries, gardens, the training yard and pavilions;
  - flagstone and marble floors;
  - the throne dais;
  - a distinct Kingsbridge temple;
  - helm details;
  - uppercase headings, which fix Cinzel Decorative's ornamental lowercase.

**Most-repeated open items:**
- standing inside props and NPCs (throne, stove, Isolde, campfire);
- snagging on trunks, benches and stalls;
- the tracker label covering titles;
- local maps without waystones, walls or stairs;
- inn take-away prices;
- whether the sword's left click should walk or attack (testers disagreed).

**Needs your decision:** the Cheese Press placeable and the Cheese food share the item key `cheese` (#164). Fixing it means a save migration.

---

## Round 1 (4 testers, Kingdom test and New game)

Testers:
- **story:** The Empty Throne, played as far as possible.
- **explorer:** the big Wilds and its towns.
- **art:** the picky art and UI critic.
- **newcomer:** a fresh New game.

### Blockers
| # | Found by | What they said | Status |
|---|---|---|---|
| 1 | explorer | No town shop, inn, smithy or bank menu ever opens. "E Shop / Order" does nothing, inside opening hours too. | **FIXED.** Keepers and counters in every room called an old copy of `doorAction` from before the towns existed (`i_interior.js`). They now call the current one. Checked: every Greyhelm, Ashford and Saltmere keeper and counter, and Mara's, Brann's and Pip's. |
| 2 | story | Softlock at "Search the keep… Try the kitchen": the `!` sits by the hearth with nothing to use. | **FIXED?** The story stove is there, but it looks exactly like the two ordinary kitchen stoves. Story objects now glint gold (the stove also steams), and E reaches them from any tile next to them. |
| 3 | art | The story stopped at "Ask Lord Ashcombe": his manor shuts at 5 pm. | **FIXED.** A story waiting on a shopkeeper now speaks even while the shop is closed. |
| 4 | (found while checking #1) | In some worlds Kingsbridge was never placed: its spot rules (85% meadow, under 6% water, 56×46) failed. | **FIXED.** Town placement falls back to the best spot it saw. Worlds that already had all four towns are unchanged. |

### Story and quests
| # | Found by | What they said | Status |
|---|---|---|---|
| 5 | story, art | Space or a click after the last dialogue line re-interacts and opens the campfire kitchen, the museum or a shop window. | **FIXED.** Closing a dialogue now blocks world input for 0.4 s, as closing a window already did. |
| 6 | story | The tracker for "Ask Lord Ashcombe" is labelled "The Empty Throne" instead of his name. | **FIXED.** Story characters (`SCAST`) are now named in the tracker. |
| 7 | story, art | Indoors the tracker says "to Emberhollow Village" while you are already in the village, and points at the wall. | **FIXED.** Inside a room it now says "Go outside". |
| 8 | story | The keep door needs the exact tile, and there's no Enter prompt from the path in front. | **FIXED.** Doors of wide buildings (8+ tiles) also open from the tiles either side of the door tile. |
| 9 | story | The herald never says to tell Elias, but the next step is "Tell Elias". | **FIXED.** The herald now ends: "Your curator, Elias, served the old royal house. Tell him I came." |
| 10 | art | Chapter "A Rider from Kingsholt" vs the city Kingsbridge: are they the same place? | **FIXED.** The herald says he rides on to "Kingsholt, the capital, three days north". |
| 11 | story | The farm map labels the south-east exit "↑ Briarholt Castle", the arrow points the wrong way, and you have to scroll to see it. | **FIXED.** South-edge exits now show ↓ on the local map. The sign reads "Briarholt Castle ↓ (through the gap in the trees)". |
| 12 | art | No Briarholt sign was found at the farm's south-east tree line. | OPEN. Check the sign's visibility. |
| 13 | story, art | The tracker label covers the top-right dock, signpost labels and the LMB hint; the chevron arrow is hard to read. | OPEN |
| 14 | art | The quest list doesn't scroll with the wheel; the active story is listed last, under 12 other entries. | **FIXED (order).** The tracked story comes first, then running, not begun and finished ones. Wheel scrolling: nothing found blocking it; round 2 to confirm. |

### Herald's procession
| # | Found by | What they said | Status |
|---|---|---|---|
| 15 | story, art | The wagons never show up. | **FIXED?** They only parked on spotless ground, and a new farm has weeds and stones by the road. Now they clear light debris and try more rows. |
| 16 | story, art | Knights park in overlapping pairs ("a two-headed sprite"); a knight stood on top of the player. | **FIXED?** Each rider gets their own tile with a free ring around it. |
| 17 | art | The herald parks on top of the campfire. | **FIXED?** The `farm:home` spot now needs a free 3×3 area. |

### Castle (Briarholt)
| # | Found by | What they said | Status |
|---|---|---|---|
| 18 | story, art | The grounds and the keep are empty of people, rooms are huge and bare, the throne room is mostly empty. | **FIXED (before the reports came in).** The court of Briarholt (`x_court.js`): about 30 guards, servants, knights, nobles, a bard, cook, scribe, chaplain and maids, arriving with the story. Fountain plaza, gardens, banner poles, training yard, pavilions. |
| 19 | art | Ideas: chandeliers, a throne dais with tapestries, courtiers, the wagons parked in the courtyard. | Partly done (courtiers, training yard). Chandeliers and a dais: OPEN. |

### Towns and the Wilds
| # | Found by | What they said | Status |
|---|---|---|---|
| 20 | art, explorer | Kingsbridge feels empty: 4 identical stalls with no vendors, blank grass lots, the plaza empty 9 am to 1 pm; the village is livelier. | **FIXED?** Townsfolk now walk the streets by day (Kingsbridge 12, Greyhelm 6, Ashford 4, Saltmere 5, each with their own look, role and lines), and every Kingsbridge stall has a vendor. |
| 21 | art | The temple and the town hall are near-mirror copies; interiors are reused across towns. | **FIXED (temple).** The Temple of the Ember now has a front gable in ember red over stone walls with orange banners; the hall keeps its slate hip roof and cupola. Reused interiors: OPEN. |
| 22 | art, explorer | North-south walls are a one-tile grey strip with no face; gates are bare gaps between towers (no arch or portcullis); the east and west gates look like solid overlapping towers. | **FIXED?** Side gates are no longer hidden by towers. Every wall piece with no east neighbour casts a hard contact shadow, so north-south runs read as raised walls. Gateways are paved through to the road. The N/S gate arches were already there; they're small next to the towers. |
| 23 | explorer, newcomer, art | Guards are drawn inside towers and walls, or on tower roofs (a floating sword and health bar); a guard is cut off by the wall at the east gate. | **FIXED?** The south-gate guards of Kingsbridge and Greyhelm stood inside the tower sprites; their posts moved beside the towers. |
| 24 | explorer, newcomer | A signpost stands in the Kingsbridge north gate arch / on the tile below the south gate and blocks you (9 s of walking). | **FIXED.** Gate signposts now go beside the road (across it for north and south gates, above or below it for side gates), never in the gateway. |
| 25 | explorer, art | Plank bridges are jumbled and offset ("staircase shapes"); the north road runs into a lake; piers stand on dry land. | **FIXED?** Realm roads are laid in long straight runs that only turn on dry land (`realmRoad`), so bridges are straight. Piers on dry land: not found yet. |
| 26 | explorer | Roads disappear under the forest canopy. | **FIXED?** Trees whose canopy would hang over a royal road are cleared when the road is laid. |
| 27 | explorer, art | Stuck on the waystone after travelling (you land on top of it); the crossroads waystone plus a pier trapped the art tester. | **FIXED.** Waystone travel lands on the first open tile below or beside the stone (`wayLand`). |
| 28 | explorer | No knight patrol seen in about 9 game hours on the roads; no guard fighting anything. | **FIXED?** Patrols spawn on a road end 25-90 tiles from you, and ride past where you are. |
| 29 | explorer | The map shows roads only once explored, and no building names; touch-to-attune isn't obvious, and the farm stone was missed. | OPEN |
| 30 | newcomer | A level-11 boar and a level-9 wolf 20 tiles west of Kingsbridge: lost 3 lives on day 1 as combat 5. | **FIXED.** Within 28 tiles of a town, and along the south edge where the home roads come in, only meadow creatures spawn, at level 0-1. |
| 31 | newcomer | Got lost: roads fork with no signs, and the crossroads sign has no Emberhollow arrow. | **FIXED (crossroads).** The crossroads sign now has an Emberhollow arrow. Fork signs: OPEN. |
| 32 | newcomer | On the Wilds map, the Farm and Village labels sit at 1/2.2 of their real x (they skip the `WK` scaling). | **FIXED.** The labels use `WIN_F`/`WIN_V`. |
| 33 | newcomer | The farm and village waystones aren't attuned from the start. | **FIXED.** The farm and village stones are attuned for everyone (new and old saves). |
| 34 | newcomer | A boar stood on deep water. | OPEN |
| 35 | explorer | Travel: farm to Kingsbridge about 1.5 min, to Ashford about 4 min, to Greyhelm about 3 min. Fine on roads, tedious off them. | Noted |
| 36 | explorer, newcomer | The Kingsbridge fountain's water spills past its rim ("a foam puddle"). | **FIXED.** No loose water any more: the tiles under the basin are paved and solid, like the village fountain. |

### Rooms and clicks
| # | Found by | What they said | Status |
|---|---|---|---|
| 37 | explorer, art | Click-to-talk walks you behind shop counters; in the museum it trapped the tester. | **FIXED?** Clicking a keeper object in a room now targets the counter in front of them (`counterNear`). |
| 38 | explorer | Entering an inn puts you inside the centre table. | **FIXED.** Loose furniture on the two tiles inside a room's door is cleared. |
| 39 | art | The bank shows a "Vault" prompt, but E and RMB do nothing. | **FIXED** (same cause as #1). |
| 40 | art | Room floors use the outdoor ground texture; the town hall inside is far smaller than the building. | OPEN |
| 41 | newcomer | E at Mara's counter does nothing (RMB works). | **FIXED** (same cause as #1). |
| 42 | explorer | Click-walk barely moves when the target is water or trees, with no "can't reach" cross. With a weapon out, a far click becomes an attack if an enemy is within about 200 px. | **FIXED (weapon).** With a melee weapon, a far click (over 140 px) walks unless a foe is within 70 px; bows and staffs still aim. Click-walk on water and trees: OPEN. |

### UI and small things
| # | Found by | What they said | Status |
|---|---|---|---|
| 43 | art | The waystone and museum windows are full size for one or two rows. | **FIXED.** "Waystones" and "Museum" open as small windows. |
| 44 | art | Next to the map edge (Wilds south, village west) the player ends up under the hotbar or off screen. | **FIXED?** The camera may scroll up to 11% of the screen past the bottom edge and 5% past the top. |
| 45 | explorer, newcomer | The Cinzel ligature shows as "SATCꞪEL" and "BꝎTS". | **FIXED?** The headings turned ligatures off, but not Cinzel's contextual alternates (`calt`), which produced Ꝏ and Ɦ. Those are off now too. |
| 46 | explorer | The "Village Watch" dialog shows its name twice. | **FIXED.** Guard, knight and townsfolk dialogs now show where you are (the town, or "On the road") as the title. |
| 47 | explorer | "You are at a anvil." | **FIXED.** "You are at an anvil." |
| 48 | explorer | "Quest complete: Seasoned fighter" pops at 6:00 am on day 1 of the Kingdom test. | NO. The test starts at combat 30 on purpose. |
| 49 | explorer, newcomer | A see-through ghost copy of the tree under canopies; wolves nearly invisible under faded canopies. | OPEN |
| 50 | newcomer | The getting-started steps don't tick when done out of order (watered before buying seeds). | **FIXED.** The steps are checked in the background every 3 s, so they latch whenever they happen. |
| 51 | newcomer | The x5 buy confirm said "Buy for 235g?" (5 × 51 = 255), then bought only 1; the next x5 bought 5 with no confirm. | **FIXED.** The confirm no longer rewrites the button: the wider "Buy for…" text shifted the layout, so the second click hit ×1. It now asks with a toast and an orange button, using the row's real price. |
| 52 | newcomer | The street Shop button looks active while the store is closed. | OPEN. Check it, it was meant to be greyed. |
| 53 | newcomer | The potato-seed icon reads as bread; Trail Bread isn't on the hotbar; pressing 9 to eat said "Till the soil first". | **FIXED (bread).** Trail Bread starts in hotbar slot 0. Potato-seed icon: OPEN. |
| 54 | newcomer | The checklist says "buy seeds" although you start with turnip and potato seeds; it's only under J. | **FIXED.** Reads "Buy more seeds at Mara's store". |

### What they liked
- **story:** the dialogue writing; the castle exterior (walls, towers, banners, glasshouses).
- **art:** the new art matches the old style; Kingsbridge buildings, the fountain, the bank and hall interiors, the herald's portrait; the flat dusk light.
- **explorer:**
  - the three towns look distinct: walled Kingsbridge with its fountain plaza, log-cabin Ashford, mossy stone Greyhelm;
  - waystones work well once attuned;
  - the Kingsbridge guard line works.
- **newcomer:** till, plant and water worked first try; the cursor labels; the village map; the shop rows; the opening-hours messages.

---

## Round 2 (4 testers on the fixed build: story, towns, art, newcomer)

### From the art critic (r2_art.md)
| # | What they said | Status |
|---|---|---|
| 55 | **Blocker:** the procession parks, but the herald never counts as arrived. "E Wait" by the `!`, generic guard lines from the walking herald, the story stuck at step 1 for 3+ game hours. | **FIXED.** My round-1 fix sent the walking herald to the exact story tile, where the (then invisible) story herald already stood, so he could never get there. He now stops in front of it. Any rider who makes no progress for 5 s steps into place. Checked: he arrives in about 27 s, and Talk moves the story on to "Tell Elias". The story tester was told to restart on the fixed build. |
| 56 | An invisible wall near the parked procession blocked A/W for minutes. | **FIXED** (same cause: the hidden story herald object is solid). |
| 57 | The tracker arrow almost always points down-right. | **FIXED** (same cause: it pointed at the hidden story spot, not at the walking herald). |
| 58 | "E Wait" means nothing to a player. | **FIXED.** It now reads "Riders are coming…". |
| 59 | Kingdom test shows "Getting started" above the stories. | **FIXED.** The Kingdom test marks those steps done. |
| 60 | In side view the player's plate helm is a flat light-grey slab, unlike the knights' shaded steel. | **FIXED.** The iron helm's side view gets breathing holes, a hinge rivet and a lower rim line (`armor.py`). |
| 61 | The captain's "T" visor reads as a letter; the wagon horses look small; the supply wagon's canvas is flat. | **FIXED (visor).** The gold helm (the captain's) has an eye slit and breathing holes instead of the T. Horses and canvas: OPEN. |
| 62 | The wagons park on the grass, not on the road. | NO. They park beside the road on purpose, so they don't block it. |
| 63 | Grass tufts and the campfire flame draw over the player. | OPEN |
| 64 | "SATCHEL" still shows a CH ligature glyph. | **FIXED?** This build had the `calt` fix, but the tester's Chrome may have kept the old CSS. Check in round 3. |
| 65 | The Map tab won't scroll with the wheel: two nested scrollbars, and the bottom is cut off. | OPEN |
| 66 | The tracker label overlaps the menu dock near the right edge. | OPEN (same as #13) |
| — | Liked: the ruined greenhouse, the royal wagon (canopy, purple trim, pennant), the knights' purple and red livery, the crisp farm ground and trees. | |

### From the story player (r2_story.md; restarted on the fixed build halfway)
| # | What they said | Status |
|---|---|---|
| 67 | Chapter 1 works on the fixed build: the herald arrives after about 30 s, then Elias, then Ashcombe gives the key. "Story dialogue is short, warm and always names the next place." | — |
| 68 | **Blocker:** "Go through the south-east trees… to Briarholt Castle" never completed; the tester walked outside the walls and never found the gate. | **FIXED.** The step needed you within 4 tiles of the gate. It now completes anywhere on the castle grounds. Checked. |
| 69 | Track doesn't stick: after a chapter change the journal showed "Track" again, so no arrow on the way to Briarholt. | **FIXED.** The story you advance is tracked automatically when nothing else is. The Kingdom test tracks The Empty Throne from the start. |
| 70 | An invisible wall on the farm about 2 tiles east of the dirt path (in both runs). | **FIXED.** They were weeds: solid, but drawn as small flat tufts that read as ground. Weeds are walk-through now; the scythe and hoe still clear them. A scan of the farm found no other blocker without a sprite. |
| 71 | The morning report said "New story: The Hollow Crown" in Kingdom test. | **FIXED.** That story is marked announced in the test. |
| 72 | When story dialogue ends, Elias's and Ashcombe's shop windows open at once, so a leftover Space lands in them. | Could not reproduce. Talking to Elias at the museum counter for the story: no window opens after the last line. Probably a second press after the 0.4 s gap, which is normal input. |
| 73 | "Kingsholt" vs Kingsbridge. | **FIXED** in round 1 (#10): the herald now says Kingsholt is the capital, three days north. |
| 74 | Elias at 0 hearts in Kingdom test; the museum exit spawns you beside the counter. | NO (test game) / OPEN |
| 75 | No route shown to the castle: the minimap doesn't show the gap, and the grounds have no signpost to the gate. | **FIXED?** The exit is labelled ↓ on the local map (#11), and the step completes on arrival anyway. A gate signpost: OPEN. |
| — | Liked: the procession "is a strong set piece"; the knights' banter; the royal-looking grounds with a gardener at work. | |

### From the town player (r2_towns.md)
| # | What they said | Status |
|---|---|---|
| 76 | The round-1 blocker is fixed: the stall, emporium, barracks, bank and inn menus all work; keepers have names, portraits, hearts, gifts and rumours. | — |
| 77 | **The Kingsbridge walls are walkable**: you vanish inside them or stand on the battlements. | **FIXED.** A wall piece's body also covers the tile north of it (it's drawn 56 px tall), and a tower's the rows above it (`wallBodies`, castle and towns). Gate tiles stay open. Checked. |
| 78 | **The first move after a window closes is lost**: the held key did nothing until pressed again. | **FIXED.** The 0.2 s input gap after a window or dialogue no longer swallows WASD, arrows or Shift. |
| 79 | In the town hall you appear inside the dining table; the bench nearly blocks the exit. | **FIXED.** Doorway clearing now removes whole furniture pieces (`mainOf`) in a 4×3 area. |
| 80 | No knight patrol was ever seen, so the patrol job stayed "0/5". | **FIXED?** A patrol now enters its road about 24 tiles before the point nearest you, so it rides by within a minute. |
| 81 | The stallholder says "Browse the stall, friend", but the box only has Close. | **FIXED.** The button reads "Browse the stall" and opens the stall. |
| 82 | "Rest" at the inn takes 150g and does nothing visible. | **FIXED.** "Rest two hours (120g)" now passes two hours, restores health, energy and lives, and says so. |
| 83 | Inn food is very expensive (Knight's Feast 2,726g, bread 154g) and only goes into the bag. | **FIXED.** A new "Eat a hot meal here" (40-70g) restores health and energy on the spot. Take-away meals are 1.15× instead of 1.6×. |
| 84 | Walking behind the emporium counter; right-clicking the innkeeper across the room does nothing. | **FIXED?** (#37) Keepers are reached across the counter; round 3 to confirm. |
| 85 | The player and villagers can stand in the fountain basin. | **FIXED** (#36, built after this round started). |
| 86 | Guards show "Talk" but don't reply. | Could not reproduce: `talkNPC('guard_kb')` opens their line. OPEN, to watch. |
| 87 | Shops look like houses; the map has no building names; no road or signpost from the farm toward the towns. | **FIXED (roads).** The royal roads are drawn on the Wilds map, explored or not. Building names: OPEN. |
| 88 | The farm to Kingsbridge took about 3.5 game hours, snagging on bushes and flowers. | Partly: weeds no longer block (#70). |
| 89 | The emporium is "basically Mara's seeds +5%"; the fruit stall buys apples at 100g against its 119g price. | OPEN (balance) |
| 90 | The north gate opens straight onto a lake. | OPEN (that world's placement) |
| — | Liked: walls and towers, the arched gate, the fountain plaza with striped stalls, the varied houses, the distinct shop interiors. | |

### From the newcomer (r2_newcomer.md)
| # | What they said | Status |
|---|---|---|
| 91 | Onboarding works: the creator, the letter, and the checklist ticking itself. The x5 buy worked and greyed out when unaffordable. | — |
| 92 | **Walks into the border tree lines and gets stuck or hidden** (farm north edge, and drawn off-screen at the village top edge). | **FIXED (village).** The tester's screenshot shows the player at the top of the village's north exit road, drawn above the screen. The camera now goes at least 40 px past the top and bottom edges. Checked: the player is fully visible there. Farm tree line: watch in round 3. |
| 93 | Leaving Mara's or Hale's with S only works when lined up with the door. | **FIXED.** Walking toward an exit while slightly off to one side slides you onto it. |
| 94 | At dusk a level-1 crow took 98 of 100 HP and a life; a wolf on the bridge took more. | **FIXED (crow).** The crow's attack is down from 7 to 4. |
| 95 | Possibly an invisible attacker on the bridges north of the farm, and the bridges look broken (plank pieces floating). | **FIXED? (bridges).** All Wilds paths now use the straight road layout. The attacker: OPEN. |
| 96 | Eating is hard to find: clicking the selected bread slot opens the Satchel. | **FIXED.** Clicking the selected food slot again eats it. |
| 97 | The street Shop/Smithy button looks active before 9 am. | OPEN (#52) |
| 98 | Clicking at the right edge of the screen hit the menu dock; the 0 key didn't select slot 10. | OPEN |
| 99 | After a far click-walk the camera re-centres, so the next tool clicks land on scattered tiles. | OPEN |
| 100 | The Wilds map shows the towns but not the roads; the road from the farm-side lake leads north, away from Kingsbridge. | **FIXED (map).** The roads are drawn (#87). |
| 101 | The Wooden Spear costs 4 wood and the Wooden Sword 16, so the sword makes no sense. | **FIXED.** Both cost 10 wood. |

---

## Round 3 (4 testers: story, towns, castle art, newcomer)

### From the newcomer (r3_newcomer.md)
| # | What they said | Status |
|---|---|---|
| 102 | Day 1 to Kingsbridge and back worked: farmed 8 tiles, crafted fences, shopped, reached Kingsbridge by its east gate, attuned the waystone and travelled home. "Farming is clear"; the crop hover text, the hotbar hints, the checklist and the plaza art helped. | — |
| 103 | **The crow:** nearly unhittable. Its sprite flies 60-90 px above its ground marker, it hit from out of sight over the wall and tower, and it took about 200 HP, all the bread and a life. | **FIXED.** Swooping flyers circle closer (32×26 px instead of 50×40), so a sword reaches them between dives; flyers hover 6 px up instead of 10; near towns and the home roads only slimes spawn now. |
| 104 | Clicking or holding LMB with the sword moved the player or camera 1-3 tiles, so aimed clicks missed. | **FIXED.** That was round 1's far-click walk (#42). It's back to: any foe within 200 px means a click attacks. |
| 105 | Green slimes are nearly invisible in tall grass and did about 60 damage; 5 breads is too little for day 2. | OPEN |
| 106 | Roads are easy to lose; WASD sticks on tree trunks with no sliding. | OPEN |
| 107 | The Kingsbridge east gate looks like a dead end from the north (a gap, no arch). The map shows the city as a small square with no walls or gates. | **FIXED (map).** The map now draws each town's footprint (stone grey for walled towns, brown for fenced ones). Side-gate arch: OPEN. |
| 108 | You start at 6:00, but every shop opens at 9 or later; Mara's street Shop button looked enabled at 7:30. | OPEN (#52) |
| 109 | The Home and morning-report windows are huge for their content. | OPEN |
| 110 | Map labels clipped ("Fa m", "Vill ge"). | **FIXED.** My new road drawing painted over them; they're redrawn on top with an outline. |
| 111 | "BꝎTS" in the creator, "YEAR I" in the morning report. | **FIXED?** The `calt` fix (#45) was in this build, so this tester may have seen a cached copy. "YEAR I" is Roman numerals: NO. |
| 112 | The "Potatos" typo. | Not found in the code. OPEN, to look for in game. |
| 113 | The waystone draws over the player's head after travel. | OPEN |
| 114 | The seed x5 buy confirm seemed to expire, and the tester bought 10 turnips by accident. | OPEN. The confirm lasts 3 s; maybe make it a clear yes/no. |

### From the story player (r3_story.md)
| # | What they said | Status |
|---|---|---|
| 115 | Reached the last step of chapter 3 ("Tell Isolde that Briarholt is yours") on day 1, with no softlocks: herald → Elias → Ashcombe → keep → kitchen → Isolde (+1,500g) → cellar hoard (+5,000g) → sold bread → bought the deed. | — |
| 116 | Space after story dialogue opens the building's window (Ashcombe's land window with Buy buttons, the museum). With Enter pressing a window's main button, you could buy a plot by mashing. | **FIXED?** After a story dialogue closes, world input is held for 0.9 s (movement still passes). |
| 117 | The 30,000g deed is charged on Ashcombe's first line, before he names the price. | **FIXED.** A story step that costs gold now asks first: "Thirty thousand for Briarholt: walls, glasshouses, the keep and all its keys. Shall we settle it?" with "Pay 30,000g" / "Not yet". |
| 118 | The tracker arrow points in a straight line through walls ("to Briarholt Keep" pointed north into the curtain wall); its label covers the room titles. | **FIXED (route).** On the same map the arrow now points along the walking route (a path re-planned about once a second, aiming 5 steps ahead), so it leads round to the gate. Label overlap: OPEN. |
| 119 | The kitchen story spot: right-clicking the `!` or the hearth opens the recipes; "Search" only from one tile; no glint seen. | **FIXED?** The great hearth now stands against the wall instead of floating in the room. The story stove glints and works from all 8 neighbouring tiles (#2); the tester may have had a cached copy. |
| 120 | The castle steward can't be talked to: he keeps walking, and E/RMB do nothing. | **FIXED?** Walking court members stop and face you when you're within 28 px, so E reaches them. |
| 121 | The tracker names "Princess Isolde" before you've met her; she vanishes after her scene; cellar doorways catch you; seeds indoors say "Till the soil first"; no room names or "You" dot on the keep map; the dock covers the player at the farm's east edge. | OPEN |
| 122 | The inside of the keep is well furnished but empty of people before the purchase. | As designed: the court arrives when you own it (guards, servants, cook, scribe…). The tester ran out of budget just before. |
| — | Liked: the dialogue ("the best part of the run"): Ashcombe's "My hearing is terrible these days" and "Look after her. I mean the castle. Obviously.", Isolde's "I would rather eat this hairpin"; the royal exterior and the evening light. | |

### From the castle art critic (r3_art.md)
| # | What they said | Status |
|---|---|---|
| 123 | Best: the keep facade ("the best building in the game"), the south wall with its slate-roofed towers, the glass orangeries, the striped pavilions, the training-yard props. | — |
| 124 | North-south walls read as a flat paved strip, with no crenellations or shadow; the gate is a small arch with no portcullis, door leaves or gatehouse. | Partly (#22: shadow). OPEN: a bigger gatehouse, stronger merlons. |
| 125 | Village props reused (fountain, well, plaza cobble); hedges are flat bars; flowers sit in a loose row with no beds. | OPEN |
| 126 | Indoor floors reused: the museum's blotchy stone everywhere; the kitchen and cellar use the outdoor road cobble. | **FIXED.** Two new hand-patterned floors: flagstones (`fl`: kitchen, armoury, pantry, guard room, every cellar room, town forges and barracks) and chequered marble with veins (`mb`: throne room, great hall, entrance hall, chapel, bath, gallery, town temple, bank and the Kingsbridge hall). |
| 127 | The throne room is huge and bare: a small throne, no dais, thin columns. The great hearth is a small black box standing in the middle of the kitchen floor. | **FIXED (dais, hearth).** The throne stands on a painted three-step stone dais with a purple, gold-edged carpet; the hearth sits against the kitchen wall. Columns: OPEN. |
| 128 | Farmhouse beds; hall tables repeat their legs every tile; 4 gallery portraits from 2 designs. | OPEN |
| 129 | Collision: the player can walk onto the north wall faces indoors; clips into the throne; the story `!` is drawn over the player's face. | OPEN. Probably the usual overlap of a sprite in front of a wall; to look at. |
| 130 | The tracker seems stuck on one diagonal in Briarholt; the castle's local map shows no walls; the library floor is coloured like grass on the keep map; left-click walking with bread selected ate 4 Trail Bread; the camera lets the player sit under the top-right dock. | **FIXED (bread).** With food selected, a click more than 40 px away walks there; eating is a near click or the selected slot again. The rest: OPEN. |
| 131 | Ideas: a parterre knot garden, guards at the gates and keep door, courtiers and servants, bunting between towers, lean-tos against the inner wall, a minstrels' gallery and high table. Ashcombe's manor needs its own building. | Guards, courtiers and servants: done (the court). The manor already has its own recipe (`manor` in buildings.py). Rest: OPEN |

### From the towns player (r3_towns.md)
| # | What they said | Status |
|---|---|---|
| 132 | Never found the Kingsbridge barracks (about 40 commands searching); the map shows unlabelled brown squares. | **FIXED.** Town buildings are labelled on the Wilds map: Inn, Shop, Forge, Fish, Bank, Temple, Hall, Barracks. |
| 133 | Did: crossroads signpost → Kingsbridge, attuned the waystone, took "Wolves on the royal road (700g)", ate a hot meal (40g), bought at a stall, got a blessing, walked to Saltmere and rested there, waystone travel lists both towns. A 4-knight patrol seen on the road. | — |
| 134 | **Collapsed inside an inn:** at 1 am the only choice was "Rest two hours"; at 2 am "collapsed… took 2,261g", woke on the farm. | **FIXED.** Inns are open all night; after 6 pm the choice is "Sleep here until morning", and you wake at that inn's door. |
| 135 | Town jobs aren't in the journal and show no kill progress. | **FIXED.** Taken jobs are listed in the journal with progress; each kill toasts "Wolves on the royal road: 3/10", and "Done: hand it in at Kingsbridge". Kill jobs also count anything killed within 60 tiles of their town, since the land round a town is mixed. |
| 136 | Closed shops (fishmonger, smithy) open at night onto empty rooms, with no message. | **FIXED.** A town shop's door stays shut out of hours: "Closed. Open 9 am to 6 pm." |
| 137 | The banner said "GREYSTONE HIGHLANDS" inside Kingsbridge. | **FIXED.** No biome banner inside a town. |
| 138 | A "Noblewoman" drawn as a bearded old man shares a line with a Courier. | **FIXED.** The role follows the look (Nobleman / Washer for men). |
| 139 | Title fonts broken ("TOWN ꞤALL", odd TH/CH glyphs). | **FIXED (for real).** The game's "Cinzel" is the Cinzel Decorative file, whose lowercase letters are ornamental capitals. Every Cinzel text is now set in uppercase, which uses its plain capitals. |
| 140 | Stuck at the Kingsbridge west-gate and SW-corner towers and at the east gate; walked into the fountain basin; stood inside counters. | Partly: solid wall bodies (#77) and the fountain (#36) are now in. Stuck at towers: OPEN. |
| 141 | Bats, a slime and a crab attacked 4-6 tiles outside the Kingsbridge east gate (Saltmarsh Coast). | Could not reproduce: 40 crab and pirate spawns just outside the east gate all became slimes (inside 10 tiles none spawn at all). Bats only live in caves and mines. Something else put them there; watch in round 4. |
| 142 | "28 Hays" in the journal. | OPEN (plural) |
| 143 | Inn take-away food 111-1,959g against a 40-70g hot meal; stall fruit 104-180g each. | OPEN (balance) |
| 144 | The Saltmere tavern room is a copy of the Kingsbridge inn's. | OPEN |
| — | Liked: "Towns feel alive: crowds, stallholders, guards at every gate, a 4-knight patrol"; Kingsbridge and Saltmere "look excellent". | |

---

## Round 4 (4 testers: story past chapter 3, castle life, Greyhelm and Ashford, newcomer)

### From the story player (r4_story.md)
| # | What they said | Status |
|---|---|---|
| 145 | Chapters 1-2 done, the deed paid (with the new confirm), one step short of chapter 4: telling Isolde. Stalled on travel time and a 2 am collapse. | — |
| 146 | Kingdom test gold came to exactly 29,500, 500 short of the deed. | **FIXED.** The test starts with 22,000g (with the herald's 3,000g and the hoard, enough). |
| 147 | Owning the castle isn't home: collapsing carried them to the farm tent. | **FIXED.** Once Briarholt is yours, a day that ends in the castle (sleep or collapse) wakes you in the royal bedchamber. |
| 148 | Wished for a waystone at Briarholt (four long walks farm → village → castle). | **FIXED.** A waystone "Briarholt Castle" stands by the road in, as soon as the way is open. |
| 149 | The tracker arrow points straight at the target, wrong way round walls. | **FIXED** after this round's build (#118): it follows the walking route. |
| 150 | The tracker label in the keep says "The Empty Throne · 33 m". | OPEN (check the "meet Isolde" step's name lookup) |
| 151 | The last dialogue click goes through to the world: the player walks off, or the deeds or museum window reopens. | **FIXED.** During the post-dialogue gap, pointer-up and click on the world are swallowed too, not just mouse-down. |
| 152 | Ashcombe says "Thirty thousand, and Briarholt is yours" after you've paid. | **FIXED.** He says the price in the confirm; after paying: "There. Briarholt is yours." |
| 153 | The player is drawn over the stove and in front of the throne, and can step onto the bottom of the back walls. | OPEN (#129) |
| 154 | The keep map has no room names and no "You" marker on the ground floor; the castle map doesn't show walls or the gate; the up and down stairs look the same. | OPEN |
| — | Liked: the castle art, the stove → hairpin → Isolde chain, Ashcombe's "My hearing is terrible these days"; two armoured guards at the keep door after buying. | |

### From the newcomer (r4_newcomer.md)
| # | What they said | Status |
|---|---|---|
| 155 | Onboarding reads well: the letter, the self-ticking checklist, crop info, seed rows with days and prices, gift feedback, waystones. "The pixel art is excellent everywhere." | — |
| 156 | Stuck three times: on a bush where the farm→Wilds exit drops you; in a tree pocket at the village's south-west corner (a click did nothing and showed no red cross); a tree trunk by the Kingsbridge west wall. | **FIXED (exits).** Arriving on a map inside something solid moves you to the nearest open tile. Tree pockets: OPEN. |
| 157 | The Kingsbridge west gate has no visible arch, just a gap; the road along the wall ends at the north-west tower. | OPEN |
| 158 | Right-clicking the innkeeper says "You can't reach that" (the counter works); E at Mara's counter did nothing; her door prompt says "Shop" while she's closed. | OPEN |
| 159 | The camera re-centres after each click-walk, so the next click lands on another tile; a planting click on grass swapped the seeds for the scythe (auto tool). | OPEN |
| 160 | Two meadow slimes took 71 of 100 HP against a wooden sword. | **FIXED.** The slime's attack is down from 6 to 4. |
| 161 | Nothing cookable on days 1-3: every campfire recipe needs salt, fish, flour, herbs or mushrooms, and nothing says where to get them. | **FIXED.** Grilled Fish needs just one fish now (no salt), so with the starting rod there's a day-one dish at any campfire. |
| 162 | Oversized creator, tent and waystone windows; the gift picker shows the hotbar and worn gear; village villagers are unlabelled dots on the map; Kingsbridge map labels overlap; no "you" dot after "Centre on me". | OPEN |
| 163 | "56 Woods" on the request board; "Emberhollow village / Emberhollow Village" in the waystone list. | OPEN (plurals) |
| 164 | The Kingsbridge market stall sells a "Cheese Press". | **FIXED (stall).** It sells goat cheese instead. **Found while checking: an old data bug.** The Cheese Press placeable and the Cheese food share the item key `cheese`, and the press (defined later in `c_data.js`) overwrites the food. So a cheese press's output, and every "cheese" in shops, recipes and gifts, is really a Cheese Press. Fixing it means renaming one key in saves: **needs your OK** (save format rule). |
| — | Liked: the onboarding, the crop and seed info, the waystones, the art. | |

### From the frontier explorer (r4_frontier.md)
| # | What they said | Status |
|---|---|---|
| 165 | Route: farm → Ashford (sawmill, tavern: hot meal, rest, sleep until morning all work) → Greyhelm (supply, inn, Longhouse job "Raiders" 5/12) → Kingsbridge (barracks job, waystone) → east road. All three towns "look distinct and lively"; interiors are rich except the sawmill. | — |
| 166 | Patrols are nearly impossible to find: one knight in 1.5 game days; the patrol job stopped at 1/5; patrols aren't on the map. | **FIXED?** While the patrol job is on, a patrol joins a road near you every 10 s (up to 4 at once). Patrols show on the Wilds map as purple shields. A kill counts for the job if any knight or guard is within 120 px, not only when one struck it. |
| 167 | Waystones attune only from one exact spot or facing; walking over them does nothing. | **FIXED.** Walking up to a waystone from any side attunes it, with the toast. |
| 168 | The Kingdom test spawns you inside the workbench. | **FIXED.** If you're inside something solid for over a second (outside a canoe, flight or the saddle), you're set on the nearest open tile. The farm's workbench is placed on the first tick, on top of you. |
| 169 | RMB on Rudd behind the tavern counter does nothing (the counter works). | OPEN (#158) |
| 170 | Greyhelm's Longhouse has the same mug sign as the inn; the sawmill is a generic shop room. | OPEN |
| 171 | The hotbar flips back to the sword near enemies; with a weapon out, clicks don't walk if an enemy is within about 200 px. | As designed (round 3 asked for attacking near foes). The auto-switch: OPEN. |
| 172 | Gold went up 500g with no visible source. | OPEN, to look into (a job or quest reward toast missed?) |
| 173 | The roads are a tangle of parallel bands and odd bridges, with no fork signs; walking snags on every tree. | OPEN |
| 174 | "to Hollowmere Farm" tracker all game with no obvious untrack. | **FIXED.** The journal button reads "Tracking (click to stop)". |
| 175 | A bandit and a slime took 108 of 300 HP at combat 30 in full iron; take-away inn food costs 3-6× the hot meal; the coal and pie jobs pay less than buying the goods; a Warp Totem at 25g. | OPEN (balance) |

### From the castle life player (r4_castle.md)
| # | What they said | Status |
|---|---|---|
| 176 | Got the deed on day 2 (treasury +5,000g, sold rubies) but ran out of budget before telling Isolde, so never saw the court arrive. "The keep is the best interior in the game." | — |
| 177 | Only Aldous and Wenna met; Aldous still says the keep is "not receiving visitors" after you've met the princess. | **FIXED.** Aldous has lines for after you've met her ("So. You have met her. Then you know why the keep receives no visitors."…). The rest of the court arrives with ownership, as designed. |
| 178 | Isolde vanishes when her chapter ends. | **FIXED.** Once you've met her she lives in the keep, on her daily round (throne room, map room, library, her chamber), except while a story scene places her. |
| 179 | The tracker arrow often points the wrong way on the grounds and in the hall. | **FIXED** after this round's build (#118). |
| 180 | The kitchen story stove is drawn over the player; the upstairs stair sprite covers the player's legs; next to the curtain wall the player seems to stand in the wall-walk. | **FIXED (stairs).** Stairs sort as if they sat 30 px further back, so anyone on or in front of them is drawn over them. The stove and wall-walk: OPEN. |
| 181 | A dark void above the castle's north tree line. | As designed: the camera now goes 40 px past the edges so the HUD never hides you (#92). |
| 182 | Esc on a story box opens the Satchel. | **FIXED.** The dialogue stops the key entirely (`stopImmediatePropagation`), for Space, Enter and E too. |
| 183 | Wandering court NPCs are hard to click, and the wrong one gets talked to. | Partly: they stop when you're close (#120). OPEN |
| 184 | The locked glasshouse prompt still says "Enter". | **FIXED.** The glasshouse doors say "Locked" until the castle is yours. |
| 185 | The bed opens a huge window for one button; the wardrobe, both chests and the second gold pile do nothing; the harp and war table only give text. | **FIXED.** The bed window is small; the wardrobes open the appearance editor; the war table opens the world map; every other royal chest opens your storage (locked until you own the castle). |
| 186 | The keep and cellar maps show plain green blocks with no room names. | **FIXED.** Keep maps name every room, and the floors have their own colours (planks, flagstones, marble, dark walls). |
| 187 | Doorways and the south gate are easy to miss; the castle-to-village round trip is very long. | **FIXED (travel).** The Briarholt waystone (#148). |

---

## Round 5 (4 testers: story chapter 4+, owned castle and court, patrols and jobs, casual newcomer)

### From the casual newcomer (r5_newcomer.md)
| # | What they said | Status |
|---|---|---|
| 188 | Worked end to end: creator, letter, planting, watering, Mara's shop, the tavern, crafting fences, sleeping, slimes, a journal page, finding Kingsbridge with the map and signposts, travelling home by waystone. | — |
| 189 | Fishing: nothing caught in about 12 casts; the "Hook!" window is short and "Hold to reel" opens with no explanation. | **FIXED.** The bite window is 3 s (was 2), and the first reel explains itself: "hold the mouse button to lift the green bar, let go to let it fall. Keep the fish inside it…". |
| 190 | Two slimes took 100 → 39 HP in seconds. | **FIXED (again).** Slime attack 3 (was 6, then 4), blue slime 6 (was 9). |
| 191 | A far click walks you there and the camera re-centres, so the next click hits another tile. | OPEN. The cursor stays put while the world moves under it; maybe a short camera ease or snapping the click target. |
| 192 | Right-clicking Pip behind the tavern bar does nothing (the counter works); the same on Mara works. | **FIXED?** "Reach across the counter" now searches 3 tiles round the keeper (Pip's bar sits further from him). |
| 193 | Waystones: the first touch only attunes, a second E shows Travel; no "you" marker on the Wilds map at first entry. | Walking up now attunes it (#167), so E opens Travel. The map marker: OPEN. |
| 194 | The combat bar shows whenever the sword is held, even in town, and covers the crops; clicking empty ground with the sword swings. | OPEN |
| 195 | Small dialogs (Nell's greeting, the tent) fill the screen; fences and ruin walls are easy to get stuck behind; arriving in the village puts you inside the well. | The well: **FIXED?** by the unstick (#168). The rest: OPEN. |
| 196 | Tavern meals are very expensive (Country Bread 144g, Ale 308g) against 500g starting gold. | OPEN (balance) |
| — | Liked: the crossroads signpost with arrows to every town, the knight patrols, the busy Kingsbridge plaza, the farm notice board, the crop hover text, the lost journal pages, the art. | |

### From the knight's squire (r5_squire.md)
| # | What they said | Status |
|---|---|---|
| 197 | No knight patrol travelled a road in 1.5 game days, so "Ride with a patrol" stayed 0/5. A Knight-Captain and 2-3 knights stood jammed against Garrick's Forge, just inside the east gate, for 3+ game hours; after the first hour no purple shields were on the map. | **FIXED.** A patrol whose member got stuck waited for it forever, and since it still counted toward the limit, no new ones came. Now stragglers catch up after 3 s, a leader with no headway for 3 s steps on to the next point of the road, and a patrol retires after 6 minutes. Checked: with the job on, by Kingsbridge, 2 patrols in 14 s and 4 in 34 s, all moving along their roads. |
| 198 | The east and north roads run into solid wall; the real gates are 1-tile gaps; only the north gate has an arch. | **FIXED (gaps).** Round 4's solid-wall-body fix (#77) also blocked the tile north of north-south wall runs, which closed half of each side gate. Only east-west runs extend now, so side gates are 2 tiles again. Side-gate arches: OPEN. |
| 199 | The arched north gate opens into a cliff pocket you can't leave, and the "Greyhelm ↑" sign points into rock. | **FIXED?** Gateways are now paved 6 tiles out, through cliffs as well. |
| 200 | Left click on far ground with a sword never walked, even with no enemy near; right click on a person across the room did nothing. | OPEN. In action combat the left button always swings (rounds 1 and 3 disagreed on this). The keeper reach is wider now (#192). |
| 201 | The story tracker arrow pointed the wrong way, and its label overprints signposts and titles. | Route-following was built after round 4 (#118); this tester likely saw it. The label overlap: OPEN. |
| 202 | A crab killed in the palm area near the city didn't count toward the job, with no reason given. | OPEN. Kills count within 60 tiles of the town or on the job's biome. |
| 203 | WASD stalls on lamp posts, tower corners, villagers and knights. | OPEN |
| 204 | The town hall closes at 6 pm. | **FIXED.** Town halls are open 8 am to 9 pm. |
| 205 | Inn take-away food costs more than jobs pay. | OPEN (balance, #143) |
| 206 | Vey says patrols ride "in fours", the barracks says "two to four"; the door prompt reads "Town hall · Town Hall"; the "Wolves" job is any 10 monsters; map labels overlap; the bank and hall share a crest sign; no horse in the Kingdom test. | **FIXED:** Vey says "in twos, threes and fours"; the inn, hall, temple, bank and barracks prompts read "Enter · <name>". The rest: OPEN. |
| — | Liked: Kingsbridge "looks great"; the barracks, inn and hall interiors; clear job windows and kill toasts; the waystone attuning on touch. | |

### From the story player (r5_story.md)
| # | What they said | Status |
|---|---|---|
| 207 | Chapters 1-3 done and chapter 4 begun ("Find Captain Vey at the barracks in Kingsbridge"): the furthest so far. About 110 commands went on walking. | — |
| 208 | The tracker label and distance are right, but the arrowhead often points the wrong way: into the farm pond, through the castle wall, away from Isolde. | **FIXED (for real).** The route arrow (#118) only worked when a path to the target tile existed, but targets are nearly always solid (a person, a door, the tree border at an exit), so it fell back to a straight line. Now it paths to a free tile beside the target, for exits to other maps too, and indoor targets lead to the building's door or the keep's stairs (`exitToward`). Checked: farm → village follows the road east; outside Briarholt's west wall it leads south round to the gate; in the keep it leads up through the entrance hall. |
| 209 | Clicking far ground with the sword selected just swings it. | OPEN (#200) |
| 210 | WASD snags on bushes, armour stands, benches and cottage corners; a small bush pinned the player. | Partly: the unstick (#168). Snagging: OPEN |
| 211 | The clock kept running while talking to Isolde; collapsed at 2 am with no warning. The morning report said "carried you home… sleep in your tent", but the toast said the royal bedchamber. | **FIXED.** Warnings at 1 am and 1:45 ("Find a bed before 2…"). The report now says "carried you to bed" and "Sleep in a bed" once you own the castle. The clock in dialogue: OPEN, to check. |
| 212 | The maid, the robed elder and the hat-wearing farmer give no prompt; guards do talk. | Partly: walking court members stop when you're near (#120, built after this round). OPEN to confirm. |
| 213 | Standing inside Isolde; the stove drawn over the player's head; walked through the dais from the south; stairs missing from the keep maps; the waystone window a huge panel; no hint at the treasury though the deed needs that money. | OPEN (the waystone window was made small, #43, so this may be a cached build) |
| 214 | After buying, the castle "comes alive": door guards, lookouts on the towers, throne guards, a maid, a courtier, waking in the bedchamber. No cook or scribe seen, and nobody at the great hall's tables. | **FIXED.** At noon (12:00-13:30) and in the evening (18:00-20:00) the court dines in the great hall: Lord Edric and Lady Rosamund (after the council), Ser Bram and a knight (once the knights come), Aldous and Tansy, each with table talk. The cook works in the kitchen and the scribe in the library. |
| — | Liked: "the dialogue is the highlight": "Look after her. I mean the castle. Obviously.", "I would rather eat this hairpin." | |

### From the castle owner (r5_castle.md)
| # | What they said | Status |
|---|---|---|
| 215 | Owned Briarholt by Tue 2, 10:30 am, after about 95 commands. Walked all three legs ("found no Briarholt waystone") and collapsed at 2 am on the farm with no warning. | The waystone stands a few tiles east of where you arrive (10,4); a late warning now comes at 1 am and 1:45 (#211). Watch in round 6 whether the waystone is noticed. |
| 216 | After the deed the court is present: keep-door guards, a door warden, throne guards, sword-bearers on the turrets, Pell, Cobb and Aldous in the courtyard, Orrin in the library, Cuthbert in the chapel, Isolde in the throne room. The lines are charming ("We are not supposed to wave back. We do."), but each has one line, and only "my liege" acknowledges ownership. | Lines rotate on each talk; the named staff have 2-4 each. More reactions to ownership: OPEN. |
| 217 | Cobb kept walking away from clicks. | Walking staff now stop when you're close (#120, after this round's build). |
| 218 | The wardrobe opens the creator; the bed wakes you in the bedchamber, but its window is still full-screen for one button; the altar restores you, the library gives lore, the harp plays a toast; a treasury chest is the bank. | **FIXED.** Windows like the bed's are drawn without going through the `drawModal` wrapper, so the "small" class never landed. It's now applied when a window opens too, for every short window (Waystones, Museum, Home…). Checked. |
| 219 | The war table opens the keep floor plan instead of the realm map. | **FIXED.** It opens "The Map of Valdmark" with the realm chart. |
| 220 | The tracker points the wrong way across floors, stays on "Princess Isolde" after that step, and its label clips under the dock. | **FIXED (direction)** (#208: the keep's stairs and doors). The rest: OPEN. |
| 221 | The kitchen story stove draws over the player; the held sword draws across the torso when facing sideways. | OPEN |
| 222 | Faint room names linger behind other labels; the farm map doesn't mark the Briarholt exit. | OPEN |
| 223 | The glasshouse: tilling, planting and watering work, but inside it's a bare grass rectangle on planks, with none of the fruit trees seen through the glass outside. | **FIXED (decor).** Potted plants line the back wall and topiaries stand at the corners of the beds (placed on entry, so older saves get them too). Fruit trees inside: OPEN. |
| 224 | The keep maps name the rooms and show "You": "a big fix since r4", though the ground floor's bottom row is cut off. The keep's windows and candelabra stay dark at night; the tents overlap the south wall. | OPEN |

---

## Round 6 (4 testers, cut short by a usage limit and resumed: story, squire, art, careful newcomer)

### From the careful newcomer (r6_newcomer.md)
| # | What they said | Status |
|---|---|---|
| 225 | Covered day 1 and the start of day 2: creator, letter, checklist, planting, watering, fishing (no catch), Mara's store and a gift (+20), the Wilds, slimes, an ember shard (started The Ember Pilgrims), Kingsbridge, the waystone home, a fence, sleep. | — |
| 226 | **Held WASD ignored** after closing a window with Esc, several times, while the clock ran; once frozen by the inn's corner table until a click. | **FIXED.** Pausing (windows pause the game) cleared all key state, so a key held through it counted as released. Physically held keys are now tracked apart, and movement keys come back when a window closes or the game unpauses. |
| 227 | Right-clicking Hollis behind the inn counter did nothing (E up close worked); right-clicking a far waystone walks there but doesn't open it; a far click with the sword didn't walk. | OPEN (#192, #200) |
| 228 | Fishing: the first bite came about 1.5 s after the cast with only a visual cue; clicking early ("You reel in early") still costs energy. | Partly (#189: a 3 s bite window and a reel tip). OPEN: a bite sound or shake, and no energy for an early reel. |
| 229 | A potato planted and watered at 6:40 pm still showed day 0/6 the next morning, with no feedback. | OPEN, to look into |
| 230 | The first Wilds signpost doesn't name Kingsbridge; the gate sign's "Emberhollow ←" points west though the village is south; Kingsbridge map labels overlap. | OPEN |
| 231 | "58 Woods"; "LMB Cast" hints in the store and "LMB Attack" in the inn; the gift picker is the whole bag; the fiber icon looks like a spider; small overlaps. | OPEN |
| — | Liked: crop hover text, seed rows with grow days and price, exact friendship numbers, finding an ember shard in a bush, Kingsbridge's walls, gate, plaza and guards, the waystone loop, the 40g hot meal. | |

### From the knight's squire (r6_squire.md)
| # | What they said | Status |
|---|---|---|
| 232 | "Ride with a patrol" stayed 0/5 for a whole game day. Shields move on the map, but knights were seen once, for 3 seconds; they ride as fast as the player and the job gives no hint where to look. | **FIXED (for real).** While the job is on, Captain Vey sends a squad: three knights ride up to you ("Captain Vey sent us. Lead on, we will keep at your side."), follow you everywhere outside the towns and fight beside you; they leave when the job is done. Checked: they arrive within seconds, keep 12-38 px from you as you move, and a kill beside them counts (1/5). |
| 233 | Map shields "parked" outside the south gate but nobody was there; shields vanish, some sit far from any road. | OPEN (road patrols are kept, but the escort makes the job independent of them) |
| 234 | The Town Hall job works: slime kills outside the walls counted (4/10). | — |
| 235 | The east road dead-ends at the city's east wall with no gate; the north road ends at a river with no bridge. | OPEN (that world's layout; roads join the nearest gate's exit) |
| 236 | WASD sticks on single tree trunks, benches and stalls with no sliding. | OPEN |
| 237 | The tracker "to Hollowmere Farm" points north though the farm is south; the map zoom buttons barely change the view; the player is hard to see under tree canopies. | The arrow follows the route now, which can lead north first round water or walls (#208). The rest: OPEN. |
| — | Liked: the Kingsbridge walls, gate, plaza, stalls and crowd; the Barracks and Hall interiors; the purple knights. | |

### From the art critic (r6_art.md)
| # | What they said | Status |
|---|---|---|
| 238 | Didn't reach Kingsbridge (too far to walk in budget). Covered: the procession, the village, Briarholt's grounds, all three keep floors, the story through Isolde's choice. | — |
| 239 | Looks great: Briarholt's walls, towers and gatehouse, the keep front with ivy and banners, the orangeries, both fountains, the great hall, throne, wine cellar, treasury, stained glass; rain stays crisp. | — |
| 240 | **Every doorway inside the keep is painted with dirt or rubble**, cutting through the marble and carpet. | **FIXED.** Doorways and the keep's base floor were `st`, which became natural rock in phase 7. Both are flagstones now. |
| 241 | The player can stand in the campfire, the throne, armour stands, plants and candelabra; the garden well draws over the player; Isolde's head and the `!` draw over the player on the dais. | OPEN |
| 242 | Space/Enter spills into shop windows after dialogue (museum after Elias, land window after Ashcombe). | **FIXED** after this tester's snapshot (#116, #151: a 0.9 s gap, and pointer events swallowed). |
| 243 | The local map is cropped (the farm's south edge, Briarholt's south half); the castle map shows no walls; world-map labels overlap; the museum window, morning report and Throne Room line are full-size windows. | OPEN (the small-window fix #218 came after this build) |
| 244 | The tracker flips between "13 m right" and "39 m left" in the keep, and its label covers furniture and titles. | OPEN (label); the route fix (#208) came in this build. |
| 245 | Village houses open straight into a wall of trees; vertical keep walls are bare black strips; the hearth, dais and hedges look flat; a dirt blob in the village cobbles; the side-facing armoured player is very thin. | OPEN |
| 246 | No waystones attuned in the Kingdom test, and none shown on the farm or castle map. | The farm and village stones are attuned from the start (#33), and the castle's comes with the story. Showing waystones on local maps: OPEN. |

### From the story player (r6_story.md)
| # | What they said | Status |
|---|---|---|
| 247 | Chapters 1-3 done and chapter 4 begun: found Captain Vey and took the patrol job; chapters 5-6 not reached (about 110 commands for 1-3). | — |
| 248 | The game ran on while the tester was paused by the usage limit: collapsed after 2 am, lost 2,500g, and ended 1,000g short of the deed; got past only by selling the hoard's rubies and coins. | Partly a test artefact (the harness can't pause). The lost gold is the normal collapse cost; the 1 am and 1:45 warnings now come first (#211). |
| 249 | The tracker often points the wrong way; in the keep the label said "The Empty Throne · 33 m" instead of naming the stove. | **FIXED (label).** For a search step it reads "Search here", for a go step the place's name. Direction: the route arrow (#208) was in this build; the cases reported (museum, Isolde, barracks door) may be the route leading round walls. Watch. |
| 250 | J or Esc during Isolde's choice opened Options behind the dialogue; holding Space skipped the whole herald conversation. | **FIXED.** During a dialogue no other key reaches the game (number keys stay for choices), and a held key's auto-repeat never advances lines. |
| 251 | The Briarholt waystone is west of the arrival road (not east as briefed), found only on the way out; local maps show no waystones, walls or gate; a fountain blocks the road to the keep; the stairs aren't labelled on the keep map. | OPEN (show waystones and the stairs on local maps) |
| 252 | The player is drawn inside the kitchen stove, on top of Isolde, inside the waystone after travel; WASD walks into tree lines and once into the cellar wall band. | OPEN (#241) |
| 253 | The barracks job says 5 monsters but the journal says 0/6. | That 0/6 is chapter 4's own story step (fight beside patrols ×6), not the job. Could be clearer: OPEN. |
| — | Liked: "the Elias → Ashcombe → stove hairpin → Isolde chain is excellent", Isolde's "I would rather eat this hairpin", the castle interiors, the knights in the court, the town signposts. | |
