# W3 — Farm life, second pass (Test sandbox, Painterly)

Tester: farm-systems, second pass after W2. I played the Test sandbox (developer mode) in Painterly style with the FPS counter on, from Mon 1 to Fri 5 in Spring, using about 130 harness commands. Screenshots are `shots/W3_farmlife_<n>.png`.

**Console shortcuts used (so you can judge the results):**
- **Travel:** `goMap(...)` to jump to the village, Odile's and the Wilds coast. I also set `S.time` to shop hours, so I didn't wait for opening times.
- **Fence ring:** I placed it with `putObj`, 24 fences, to save about 40 clicks. The **gates were placed by hand** with LMB.
- **Crafting:** recipe rows were clicked through the DOM (Get, then Make).
- **Animal affection:** I set it to 45 so I could test Breed the same day. I had petted all 6 animals by hand first.
- **Minigames:** the trap haul, the harpoon and the rod reel were played by a small script that reads the marker positions and presses Space or the mouse. I didn't edit any game state for them.

## What I covered (all of W2's gaps)
| Task | Result |
|---|---|
| 1. Breeding: Breed → Pair → wait | **Works.** Chickens bred on day 1 ("due in 3 days"), and two chicks were born overnight into day 4 (report: "Born overnight: Nugget, Henrietta!"). The cow pair is "due in 5 days" and counts down correctly. |
| 2. Plough through Fence Gates (E-W and N-S) | **Works** in both orientations. I rode south through a gate in an east-west fence and west through a gate in a north-south fence, with the plough lowered. The gate tiles stayed untilled, there was no snag, and the field was tilled on both sides (shots 32, 33). |
| 3. Harrow / cart / crate | The harrow works (it cleared 3 of 11 weeds on a short pass and gave fibre). **The cart is broken** (see Broken 1). |
| 4. Canoe, harpoon, crab trap, sea fishing | Everything works: canoe on the farm pond and at the Wilds coast; harpoon landed a Bluefin Tuna at the coast; trap set, then hauled the next day (1 Crayfish); rod at sea caught a Halibut. |
| 5. Hale blueprint → workbench → site → deliver → hammer; building hammer Move / Remove | Well: plans 250g, blueprint made at the workbench, site placed, materials pulled from storage, hammered to done in about 8 s. Move on the coop worked: the ghost showed, refusals gave reasons, and RMB put it back. Remove is correctly refused while animals live there. **The hammer can't touch the Well** (Broken 3). |
| 6. Pet | The sandbox has no pet. Odile's "The stray" tab appears after the day-2 hint. I adopted a dog for 2 fish, and it wanders, sits and comes over on the farm. |
| 7. Unfenced overgrowth | Open field 27 tiles, fenced field 28 tiles. Over 4 nights: open field lost **2** tiles, fenced field lost **0**. **The report comes a day late** (Broken 2). |
| 8. Odile's gold | **All accounted for.** Chicken ×2 (400 each), cow ×2 (1,500 each), Bay mare 2,200, Black mare 9,560 = 15,560g, which matches the gold change exactly. The likely cause of W2's "missing" gold is under Broken 4. |

## Broken
1. **The horse cart never collects anything you pick up** (shot 36). Steps: set the cart down, ride up, E to hitch (toast: "What you pick up now goes in the cart"), then mine stones and scythe weeds next to it while mounted.
   - Every stone, fibre and hay went to the **backpack**. The bar showed "Horse Cart · 0 / 400".
   - Cause in code: `give` in `s_auto.js:310` checks `selKind() === 'cart'`. The `x_implements.js` wrapper puts `asKind('cart')` around `give`, but the gather and scythe code calls the inner `give` captured at load (`_giveA` / `_giveH` order), or picks up through `updateDrops` / `GIVE_NO_DROP`. In practice only a direct `give()` from the console filled the cart.
   - Worse: interacting with a crate while hitched opens the **Crate window**, not "Unload cart". `findInteract`'s label uses `selKind() === 'cart'`, which is false outside `asKind`. So a loaded cart (1 stone after my console `give`) could not be unloaded at all.
   - So the "cart load/unload at a crate" loop doesn't work in play.
2. **The overgrowth line in the morning report is one day late.** `x_gate.js:93` wraps `endDay` as `f.apply(...)` first (which builds and shows the report), **then** `fieldsOvergrown()`.
   - Night Wed→Thu: 2 open tiles became tall grass (`OVERGROWN_NEWS` = 2 after the call), but Thursday's report said nothing.
   - Friday's report then said "Meadow grass crept into 2 tiles…" (shot 60), on a night where nothing grew over.
   - This is very likely why W2 "never saw" the line. Fix: run `fieldsOvergrown()` before `f.apply`, or add the line to that day's report.
   - The mechanic itself works: 0 losses inside the fence with a gate, about 0.5 per night in the 27-tile open field. That is slightly below the expected 4% (about 1.1 a night), but plausible over 4 nights.
3. **The building hammer can't move or remove a Well.** The finished well is an object (`fwell`), not an entry in `cur.bld`, so `bldAt` doesn't find it. LMB or RMB on it with the hammer just says "Watering can refilled." Wells, sheds and silos can be built many times (`BP_MULTI`), so you can't undo a badly placed well.
4. **A Horses-tab Buy can easily turn into two purchases, with no confirmation** (shots 12-14).
   - When you buy a horse, it leaves the list and the next horse's row and Buy button slide up under the cursor. A double-click, or a second click to "check", buys the next horse too.
   - Horses cost up to 9,560g and there is no confirm here, though the shops have a big-buy confirm.
   - This is the most likely explanation for W2's ~8k "vanishing" at Odile's: every gold change I made matched what I bought.
5. **The hammer's coop Move ghost is red almost everywhere near the tent.** Every refusal is valid ("clear the weed first", "another building is in the way"), but in a sandbox full of weeds and stations I found no green spot on screen in three tries.
   - Not a bug as such. A "clear weeds and stones under the footprint" option (the wagons in the procession already do this) would help.
6. **Enter on the morning report still doesn't press "Start the day"** (confirmed from W2). After clicking the banner's Next day, `document.activeElement` is the Next day button. Enter goes to it, `endDay` is skipped because a modal is open, and the report stays up.
7. **Implements: "Set down" fails with "Something is in the way." even when the ground looks clear.** `faceTile()` uses the *facing direction*, not the mouse. After riding, the player still faced south onto a tall-grass tile.
   - The bag window hides the world, so you can't see what is "in the way".
   - Fix: say what blocks it ("tall grass in front of you"), or use the tile under the cursor / any free tile beside you.
8. **Console:** 4× `Uncaught TypeError: Cannot read properties of null (reading 'opts')`. I couldn't pin down the action; it was somewhere among the Animals tab Pair, the Hale plan purchase, the build-site window and the crate. A handler reads `MODAL.opts` after `closeModal()`. The rest are only 404s (`errors-9305.log`).

## Quality of life
- **Breed flow is clear.** The "Choose a mate for Clover" panel, a single Pair button on valid mates, the "expecting in N days" line on the card and the birth line in the report all work well. Two hearts for breeding means about 5 days of petting at +4.6 a pet. That's fine in a real game; the sandbox could start animals at 2 hearts to save testers time.
- **Petting needs pixel-exact right clicks on a moving animal.** My first four RMBs a tile off did nothing, with no feedback. A larger click box, or "Pet" in the prompt panel when one is near, would help.
- **Odile's "Coop full" buttons** on the Animals tab are clear.
- **The stray quest takes "two fish" without asking which.** It took my Halibut (silver) and my only Crayfish and left the Bluefin Tuna. A chooser, or the cheapest fish first, would be nicer. The crayfish probably shouldn't count as a fish for this.
- **The building site's "Took 27 stone from your storage"** auto-pull is great; delivering and hammering are quick and clear. The Well site placed on the farm road (shot 49) was allowed. Fine, but it blocks the path.
- **Hammer "Remove? Click again" then "Move or sell the animals living there first."** is good feedback.
- **The crab trap haul** (shot 39) is readable. The hint line says what to do and how many pulls are left.
- **The harpoon** (shot 44): the aiming ring, the dark fish shadow and the "Throws left" count are clear, and the fight phase is fair. I landed the tuna on the first throw.
- **Harpoon at the farm pond:** "Nothing big enough lives here. Try the sea, a river or a lake." Good. A new player won't know where the sea is, though. Naming "the Wilds' east coast" would help.
- **The canoe** pushes off and climbs out at the shore automatically, with a clear toast. Paddling across the pond and the sea felt good.
- **Placing items from the bag** has inconsistent buttons:
  - implements have **Set down**;
  - blueprints have **Place**;
  - the storage crate, crab traps and the hammer have **no** use/place button (only "Recipes & uses"), so you must drag them to the hotbar.
  - A "Place" button for every placeable would be consistent.
- **The cart's prompt** says "interact with a crate to unload", but the crate opens its normal window (see Broken 1).

## Balance
- Horses at Odile's range from 2,200g (rating 43) to 9,560g (rating 66, Black mare). That's steep next to a 1,500g cow, but fine for racing stock. It needs a confirm (Broken 4).
- Well plans 250g plus 30 stone and 10 wood is cheap and quick (about 8 s of hammering). Good for an early convenience.
- Crab trap: 1 crayfish from one trap after a day. That's modest for 8 wood + 10 fibre, though it's reusable, so fine.
- Harpoon tuna: one easy fight, about 14 s. The fish is valuable. I'd make sea big fish a little harder (more runs) or rarer per day.
- Chicken breeding gives 2 chicks in 3 days. Coop capacity 4 caps it fast ("Coop full" right away). Sensible.

## Art & feel (Painterly)
- **Fence gates** (shots 25-27, 32): the east-west gate reads as an open frame with a top bar. The north-south gate is two thin posts and almost invisible from above. With the plough hitched, the horse passing through looks right.
- **Tilled soil** is still separate rounded tiles with grass in every corner, a chocolate-bar look (shots 32, 33). Same note as W2.
- **Implements on the ground** (harrow, cart; shots 34, 35, 37): small, crisp pixel art next to painted stations and trees. The hitched harrow behind the horse reads fine.
- **The canoe** (shots 41, 46) is a small crisp pixel sprite on painted water. It reads, but at 4× zoom it's tiny next to the rider.
- **The crab trap buoy** in the water is a small red dot and easy to lose on the painted pond.
- **The finished Well** (shots 51, 52) is painted and lovely. The **well build site** (shot 50) is a tiny pixel stack of planks and stones on a grey slab, which looks unfinished next to the painted world.
- **The Move ghost** of the coop (shots 56-58): a translucent painted coop with per-tile red squares. Clear.
- **The Wilds coast** (shot 43) has a big lava pool beside the sea, palm trees and obsidian rocks. The lava is a square-patterned tile texture with visible repeats, the least painterly thing on screen.
- **The night farm** (shot 37) looks moody and readable.

## Performance
- Farm: 126-131 fps, 1.0-1.9 ms of work a frame.
- **Wilds coast on arrival: 108 fps, 16.0 ms work** for the first frames (shot 43), settling to 128 fps / 1.4 ms. That's the ground-chunk painting on a map change. It's a hitch, but a short one.
- Interiors: about 130 fps, under 1 ms.
- **Headless-harness note (not a game bug):** the first visit of the session showed an all-black world, with no ground or objects, only the HUD, until I reloaded the page (shots 2-9). The canvas was 1584×805 because of a `setViewport` / window mismatch, and `CHUNK.size` stayed 0. After a reload it rendered normally. Worth a look if real users ever report a black screen after resizing.

## Liked
- Riding the plough through a fence gate and watching the field appear on both sides.
- Breeding is understandable end to end: Breed, then Pair, then "expecting in 3 days", then born overnight.
- The build site pulling materials from storage, then hammering through stages.
- The harpoon's aim-then-fight is a nice break from rod fishing; the crab trap haul is quick and fair.
- The adopted dog wanders, sits and trots over.
- Refusal messages tell you why: "clear the weed first", "another building is in the way", "Move or sell the animals living there first", "Coop full".

## Top 5 fixes
1. **Horse cart:** pickups while hitched must go into the cart, and interacting with a crate while hitched must say and do "Unload cart". Today neither works, so the cart is useless.
2. **The overgrowth report is a day late:** run `fieldsOvergrown()` before `endDay` builds the report, so the line reports the same night.
3. **No confirm on Odile's horse Buy, and the rows reflow:** add the big-buy confirm, or keep the sold row as "Sold" so the next Buy doesn't slide under the cursor. This likely explains W2's lost gold.
4. **Building hammer on Wells (and other object buildings):** let the hammer move or remove `fwell` (and check sheds and silos).
5. **Enter on the morning report**, plus clearer "Set down" failures for implements: name what's in the way, or use any free tile beside you.
