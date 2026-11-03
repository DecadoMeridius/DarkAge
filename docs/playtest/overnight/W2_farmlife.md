# W2 — Farm life (Test sandbox, Painterly)

Tester: mid-game farmer. Test sandbox (developer mode), Painterly style, FPS counter on. About 120 harness commands over 3 in-game days (Mon 1 to Wed 3, Spring).
Shots: `shots/W2_farmlife_<n>.png`.

What I got to: buying at Odile's, petting, the Animals tab, daily animal products, riding, plough, seed drill (and making all four horse tools), water channel watering, fence and gate crafting, a fence run, the rod at the farm pond, the Family tab.
What I did **not** get to (ran out of budget): breeding (Breed/Pair), riding a plough through a Fence Gate, harrow and cart in use, canoe and harpoon on water, crab traps, sea fishing, Hale blueprints, building-hammer Move/Remove, the pet, gifts/Chat. The canoe, harpoon, crab traps (x5), harrow, cart and hammer were all crafted fine.

## Broken
1. **Enter doesn't press "Start the day" on the morning report** (shot 82). After clicking the banner's **Next day**, that button keeps keyboard focus (it has a focus ring). Enter then goes to it, not to the report's main button. The report stays open and pressing Enter again does nothing. Repro: sandbox → click Next day → press Enter. The first time it seemed to work, but from day 3 on it didn't. Fix: blur the banner button, or let the modal's main button handle Enter first.
2. **E "Cast" with the rod does nothing** (shots 87-89). The prompt panel shows `E Cast` while I stand at the pond with the rod selected. Pressing E (mouse over water) never casts. LMB on the water casts at once (shot 90).
3. **Far LMB on water with the rod walks to the shore but doesn't cast** (shot 87). CLAUDE.md says far water with the rod should walk to the nearest shore and act. It walked but didn't cast.
4. **Odile purchases: unclear whether every Buy gave an animal.** Gold went from 1,055,500 to 1,043,270 during my visit to Odile (about 12.2k). The Animals tab later shows only 2 chickens, 2 cows (the sandbox's) and 1 horse (stable 1/3). The morning report says "2× Egg, 2× Milk" every day. I clicked Buy on the Chicken row, then bought a horse (4,140g), but I can't account for the other ~8k. Please check that Buy in the Animals tab with a full coop/barn either refuses clearly or adds the animal. In the sandbox the coop/barn are 2/4, so there was room. (Unverified; the toast may have scrolled by.)
5. **Overgrowth not reported (maybe not happening).** About 70 unfenced tilled tiles stayed overnight twice. The morning report never mentioned overgrown soil. At 4% per tile I'd expect about 3 a night. A few edge tiles look darker with grass streaks (shot 84-85, left column of the field). Either they were overgrown and the report missed it, or the sandbox field counts as enclosed. Worth a quick check in the sandbox.
6. **Clicking far with a placeable drags the camera, so a run of clicks goes astray** (shot 81). I clicked a fence line in screen space: the first far click walked me there, the camera followed, and the next clicks landed somewhere else. I placed 6 fences scattered north of the field instead of a row. Once you know it this is expected, but laying fences by click is fiddly. A drag-to-place line for fences and channels would help a lot.
7. Minor: after getting off the horse I couldn't see it beside me (shot 78). It may have stood off-screen behind me.
8. Console: only 404 resource errors (errors-9305.log). No JS errors (`errors`: none).

## Quality of life
- **The fishing reel bar is at the far bottom-left** (shot 91), about 800 px from the player and the bobber. The bite "!" is over your head, but the minigame appears at the screen edge. Put it beside the player.
- The bite comes fast (~1.5 s after the cast) and the 2 s window is short when you also have to find the bar.
- **Recipe search box keeps its old text** between visits. I had to Backspace before each new search; the × is small. Select-all on focus would help.
- **Horse tools take two dismounts.** Selecting the plough in the bag while mounted says "Get off the horse to set it down, then ride up and hitch it." So it's get off, set down, get on, interact. Allowing "Set down" while mounted (dropped behind the horse and hitched at once) would save four steps per tool swap.
- After Make, the backpack-to-hotbar flow is clunky. "Put on hotbar 7 8 9 0" sometimes does nothing visible. Dragging works.
- The Animals tab is clear: hearts, genes graded S-D, "Needs 2 ♥" on Breed, room counts ("Coop 2/4, barn 2/4, stable 1/3"). Good.
- Odile shows "closed, opens 10 am" at 7 am. That's fine, but in the sandbox you wait ~3 real minutes. A sandbox "skip to 10:00" or shops open at all hours in the sandbox would help testing.
- Hover label on crops ("Turnip · day 0/4 · needs water") is great.
- The prompt panel for hitched implements (G Lower/Raise, E Unhitch here, R Get off) and the bar above the hotbar ("Horse Plough · working | Raise (G) | Unhitch") are clear.
- Bag slots keep their holes when items leave (stable positions). Good, but after the seed drill used up the seeds the hotbar showed empty 8/9 slots until I dragged new things in.

## Balance
- Animal income in the sandbox: 2 eggs + 2 milk a day from 2 chickens + 2 cows (~5,400g of animals at shop prices). CLAUDE.md targets a 3-4 week payback, which looks plausible. I didn't sell to check exact values.
- Horse 4,140g (genes D/C) next to cow 1,500 and pig 5,000 seems fine.
- Plough + seed drill is very strong: about 60 tiles tilled and 20 seeds sown in about 30 in-game minutes. That's appropriate for a tier-2 iron tool.
- Fence ×4 for 4 wood + 1 fibre is cheap. Fence Gate 6 wood + 2 fibre is fine.
- Water channel ×5 for 6 stone + 2 clay is cheap for what it does (permanent watering of both sides). Fine as a mid-game reward.

## Art & feel (Painterly)
- **Tilled soil reads as separate rounded tiles, not a field** (shots 76, 77, 85). Every soil tile is a rounded square with grass showing in the four corners between tiles. A big ploughed field looks like a chocolate bar or a tiled floor. Connected soil (joined edges, rounded only on the outside of the patch) would look much better. This is the most visible art issue on a farm.
- Seedlings on soil are tiny green blobs, hard to read at play zoom.
- **The water channel** (shot 80, 85) is a small stone-kerbed square of water. It reads OK, but it's crisp pixel-ish next to the painted ground and slightly smaller than a soil tile. It doesn't feel like it belongs to the painted world.
- **The plough, seed drill and harrow on the ground** look small and pixel-art crisp (shots 74, 77). The hitched plough and drill read fine behind the horse.
- **The horse and rider** are crisp pixel art (Painterly keeps characters pixel by design). The horse looks fine and the mounted pose reads well. At painted scale the rider looks a little stiff.
- **Animals** (cow, chicken) in the world and in the Animals tab look like smoothed pixel sprites, not painted. Acceptable, but they stand out against the lush painted trees.
- **Painted trees and the pond** look lovely (shots 66, 68). Long soft shadows and blossom read well. The forest edge is dense and pretty.
- Station labels on the ground (sandbox) are big and readable.
- Stations (keg, jar, cheese press, loom, oil press, furnaces, kiln, oven) are consistent and nice (shots 70, 71).
- Night not checked.

## Performance
- 114-131 fps at 1600x900 throughout (farm, village, pond, stations yard). Game work 1.0-1.6 ms a frame. No stutters noticed, including riding at speed across the farm and with the bag open.

## Liked
- Plough and seed drill feel great: G to lower, ride, and the field appears behind you. Very satisfying.
- The prompt panel always tells you what keys do right now.
- The channel instantly fills with water from the pond, and the neighbouring soil is visibly wet the next morning.
- The animal genetics card is a nice touch.
- The sandbox "Get / Get ×5" buttons at stations make testing fast.

## Top 5 fixes
1. **Enter on the morning report**: make it press "Start the day" (the focused banner Next day button swallows it).
2. **Connected tilled soil**: draw soil as a joined field (rounded only at the patch's outer edge), not rounded tiles with grass in every corner.
3. **Rod: E "Cast" and far-click-to-shore should cast**; and move the reel bar next to the player.
4. **Check Odile's Buy and the overnight overgrowth report in the sandbox**: about 8k spent with no visible new animal, and no "overgrown" line after two nights of a large unfenced field.
5. **Easier placement of fences and channels**: drag to lay a line (or keep the camera still while clicking a run), and allow setting horse tools down while mounted.
