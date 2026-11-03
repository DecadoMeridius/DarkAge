# W3 — Automation engineer (Test sandbox, Painterly, port 9301)

Setup: Test sandbox (developer mode), Painterly style (already on in this profile). I crafted 20 conveyors at the workbench through the UI (Get ×5 → ×5). I placed the first line by hand: crate, chute, stone furnace, rotating with RMB. The other lines I put down by script, with the same objects the placement code creates, to stay inside the command budget. Inputs went in through the crate window or by script. I inspected state with `S`/`getO` and used **Next day** for overnight catch-up. The sandbox's Ember Core (17,25, radius 18) powers almost the whole yard, so I built the power test (reaper and windmill) at x 38-43, outside its range.

## Results per line
| # | Line | Result |
|---|------|--------|
| 1 | crate → chute/conveyor → stone furnace (coal) → conveyor → crate | **Works.** 30 copper ore → 6 copper bars. Stone furnace takes 16 ticks (~9.6 s) a bar, so it is the bottleneck; the chute keeps up with it. |
| 2 | wheat crate → mill → oven (+ salt/coal crate from below via an up-belt) → crate | **Works.** 40 wheat → 10 bread, salt and coal from the side crate. The mill is the bottleneck (one bread per 12 ticks, ~7 s). |
| 3a | Sorter, filter copper ore (later iron ore, set in the UI by pressing E while holding it) | **Works.** The filtered item goes straight and the rest turns right. The filter toast is clear. |
| 3b | Splitter into two crates | **Works, but see Balance.** Fed with one item it splits 15/15. Fed by a crate holding two items, it sorted them by kind instead of splitting them (all stone one way, all clay the other). |
| 4 | Keg loaded and emptied by belts | **Works.** Grapes go in by belt, and the wine comes out onto the belt and into the crate. The next grape loads by itself. Wine took ~3.5 in-game days. |
| 5 | Trip hammer set to Iron Gear | **Works.** 2 iron bars → 6 gears, 12 ticks (7.2 s) a craft. It **jams** if anything else reaches the input belt (see Broken). |
| 6 | Upgrade in place | **Works.** Chute → conveyor → cobalt belt → rune belt, and stone furnace → smelter → blast furnace → ember forge, all done with E and the next piece in hand. Contents were kept (ore, fuel, progress) and the toast is clear. |
| 7 | Crane | **Works.** It moved 10 stone and 5 wood from crate to crate within a few seconds. |
| 8 | Seed hopper, reaper, ember golem | **Work.** The hopper sowed 10 turnips in the morning. The golem sowed 17 turnips, watered them every day, and harvested 16 on day 4 (quality turnips waited inside it, since no belt was next to it). It only replants with the seeds it has left, so with 3 left the field went down to 3. The reaper cut nothing while unpowered. After I placed a windmill it cut one crop a tick (4 turnips in 3 s). |
| 9 | Pickaxe pick-up returns contents | **The logic works:** a crate gave back 10 bread, and the ember forge gave back the 13 coal it was hiding. **Through the mouse it often doesn't happen** (see Broken). |

Console errors (`errors`): none.

## Broken
1. **A far LMB with the pickaxe on a belt rotates it instead of picking it up.**
   - Repro: hold the pickaxe, LMB a conveyor 2+ tiles away. You walk there and the belt turns (d 2 → 0). It happened twice: (13,27) and (34,29).
   - In reach, LMB picks it up correctly.
2. **LMB with a placeable acts on the belt under your feet instead of placing on the hovered tile.**
   - Repro: stand on a chute, hold a conveyor and LMB the empty tile next to you.
   - Nothing was placed there. The chute I stood on was **upgraded** to a conveyor, and the next clicks **rotated** it.
   - Cause: `act()` runs `findInteract()` (Upgrade/Rotate) before `useItem`.
   - This breaks the natural way to lay a line: walk along it, placing the tile ahead.
3. **You can't pick up a crate or a station with the pickaxe through the mouse.**
   - LMB, even held, on an adjacent storage crate or ember forge opens its window ("Open").
   - Calling `useTool()` directly removes it and returns everything, so only the input route is wrong.
   - As a player, I found no way to take a crate back.
4. **Belts jam silently.**
   - Any item the next machine doesn't accept stops the line for good:
     - a smelter item clicked into the ore crate by mistake;
     - a copper bar in the trip hammer's iron crate.
   - Crates push their contents round-robin, so one stray item in a source crate kills the line.
   - The station window just says "Idle" with an empty input. Nothing on screen marks the jammed belt, and a belt's only interaction is Rotate, so you can't clear it except by pickaxing the belt.
5. **Fuel is stranded when a furnace becomes an ember forge.**
   - Upgrading keeps the coal (13), but the ember forge has no fuel slot.
   - The coal is invisible in its window and only comes back if you pick the forge up.
6. **The crate window reflows under the cursor.**
   - Clicking a stack moves it, and everything after it shifts, so a second quick click stores a different item.
   - That is how a Smelter ended up in my ore crate and jammed line 1.
   - Recipe rows do the same: after **Get ×5**, the row's buttons become Make/×5/×10/×100, so a second click at the same spot started a batch I didn't mean to.

## Quality of life
- **There is no idle reason anywhere on screen.**
  - The stone furnace sprite shows a fire even when `on: 0`.
  - The reaper window says nothing about power, though it cut nothing until I placed a windmill.
  - Belts outside power just stop.
  - Wanted: a small badge over a machine (no power / no fuel / output full / missing X) and a "Not powered" line in every window.
- The smelter window's power text says "Needs a windmill or waterwheel within 7 tiles". It leaves out the treadwheel, tide mill and ember core, and their different radii. The windmill/waterwheel Inspect toast always says "7 tiles" (the waterwheel's is 9).
- **Belt direction comes from facing.** To lay a line pointing right you stand to its left and place the tile ahead. Placing from beside the line gives the wrong direction, and fixing it takes up to 3 RMB rotations. Wanted: a direction preview on the ghost (an arrow) and R to rotate before placing.
- The conveyor, sorter and splitter icons are almost the same in the recipe list and the bag. The bag/crate grid has no names (only hover tooltips).
- **The trip hammer's "Make" dropdown is unusable.** It lists 206 unsorted recipes with duplicates ("Rivets" twice: copper and iron), and has no search or ingredient info. It also has no "put in from backpack" like the other stations.
- You can't see what's in a machine from the world: the reaper's or golem's harvest and a crate's contents need the window. A hover tooltip (contents, progress %, fuel) would help a lot.
- On a test layout the sandbox's ground labels ("Seed Hopper", "Reaper", "Ember Golem") float over pieces placed in the row below them.
- The sandbox gives quest-complete toasts and gold (1,000,000 → 1,055,800) and story announcements. Combat test turns quests off; the sandbox should too.
- The Next day button doesn't close the morning report, so pressing it twice does nothing until you dismiss the report.

## Balance
- **Splitter + mixed crate = a sorter.**
  - The crate pushes kinds in turn (A, B, A, B) and the splitter alternates, so every A goes one way and every B the other.
  - It's unlikely anyone wants that from a "splitter". Alternate per item kind, or randomise the crate's round-robin.
- Throughput feels right for small lines:
  - belt 1 tile/tick (cobalt 2, rune 3);
  - stone furnace 9.6 s a bar (5 ore);
  - mill 3.6 s a flour;
  - bread one per ~7 s (mill-bound);
  - trip hammer 7.2 s a craft.
- Wine in a keg ~3.5 days, which is fine for an artisan good.
- The golem's 6-tile radius with no seed refill means it replants only as many as it has seeds. That's fair, but it should say "out of seeds".
- **Automated fields are lost to "meadow grass".** Within 4 days two tiles of the hopper field and one of the golem field turned to grass, losing the crop. The hopper and golem then skip those tiles for good. That's intended with the fence rule, but nothing near the machines says so. The morning report does explain it.

## Art & feel (Painterly)
- **Belts carrying an item look like pixel art.** The baked `beltSprite` tile is drawn crisp, with a hard rectangular edge and different wood shading, next to the soft painted empty belts. It's most visible on the belt next to the keg and on the chute/conveyor next to the furnace (shots W3_auto_11, W3_auto_19). Items on belts are tiny crisp pixel icons.
- At normal zoom, belt chevrons read as "> <" (inward), so the direction isn't readable. At zoom 6-8 they read as ">>" (W3_auto_10 vs W3_auto_11).
- The lever crane is a tiny sprite (a blue tip on a stick) that's hard to spot between two crates. The sorter is a dark post that is hard to tell from a belt.
- The windmill, ember forge, mill, oven, seed hopper, reaper and golem are lovely painted sprites (W3_auto_17).
- A lit fire is drawn on idle furnaces.

## Performance
128-130 fps, 1.1-1.5 ms of game work per frame in the yard with all lines running (Painterly). No stutters seen.

## Liked
- Upgrade in place is great: one key and everything is kept.
- The Get / Get ×5 sandbox buttons and batch crafting with a progress bar make setup fast.
- The sorter filter by holding the item and pressing E is quick and clear.
- The golem is a satisfying late-game toy.
- Night catch-up works.

## Top 5 fixes
1. Make LMB with a placeable place on the hovered tile, and a far LMB with the pickaxe pick up. Never let LMB fall through to Rotate/Upgrade on the belt underfoot or the one you walked to.
2. Let the pickaxe pick up crates and stations with a mouse click: the tool action should win over "Open" when a pickaxe is held.
3. Stop belt jams, or at least show them:
   - mark a stuck item (a red "!" on the belt);
   - give belts a "Take item" interaction;
   - have crates only push items that the belt's destination accepts.
4. Show why a machine is idle (no power / no fuel / output full / missing input or wrong item), both as a world badge and in the window. Don't draw a fire on an idle furnace.
5. Painterly belts: draw belts carrying items with the same painted belt plus a soft item, not the crisp baked pixel tile. Make the chevrons read as one direction at normal zoom.

Shots: `docs/playtest/overnight/shots/W3_auto_1.png` … `W3_auto_19.png`. Key ones:
- 8: first placement;
- 10/11: lines and the belt-with-item art;
- 12: station window says only "Idle";
- 14: upgrades;
- 15: the trip hammer dropdown;
- 17: windmill, hopper/reaper field and golem field;
- 19: belts at zoom 6.
