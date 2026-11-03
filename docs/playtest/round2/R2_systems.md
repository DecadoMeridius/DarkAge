# Round 2: systems tester (R2_systems, port 9303)

## Game-breaking

- **Reloading or closing the game during Lord Ashcombe's welcome loses the tutorial.** Start a New game, click Begin, and wait for Ashcombe to walk up and start talking. Before you pick "Show me around" or "I know my way around a farm", reload the page and press Continue. The welcome never comes back. The save has `tutWalk: 2` and `tutIntro: 0`, but no tutorial or skip flag, and no `welcome` story. Ashcombe stands on the farm and only says "Get on with it, farmer. The day won't wait.", so the choice and the whole "A New Start" tutorial are gone. He leaves on day 2. Reproduced twice (slots 2 and 3 on [::1]). The save made by the reload (or by the welcome itself) commits `tutWalk = 2` before the choice is made. Fix idea: keep `tutWalk` at 1 until a choice is picked, or let talking to him at `tutWalk 2` with no `tutorial`/`tutSkip` flag reopen `tutWelcome`. Shot R2_systems_14.png.

- **Drag-to-place lays fences on the player's own tile and can wall you in.** A single click refuses a tile that would trap you, but a drag doesn't. Dragging a fence ring round yourself (sandbox, fences in hand, hold LMB and draw a 3x3 square round the character) left the character boxed in and unable to move. You can get out by picking a fence up with the pickaxe, so it isn't a hard softlock. Dragging a line through your own tile put a fence under you and shoved you into the workbench. Shot R2_systems_4.png.
- **Drag-to-place can block the farm's map exits.** Dragging fences along the farm's top edge (x 24-30, y 0-1) filled the Wilds exit tiles (warp x 26-28, y 0): walking north stops at y 2.3. The drag doesn't check reach either, so you can wall off an exit from anywhere on screen. Again, the pickaxe gets you out. Shot R2_systems_5.png.
- (minor) **The drag keeps placing while a window is open.** Start a belt drag, press I (the Satchel opens and the game pauses), keep moving the mouse: 10 conveyors were laid behind the open window.
- (minor) **Two "Can make" chips at stations.** One is the old `ready` filter (g_ui.js:93), the other the new `rcan` filter (x_fix6.js:587), in the same window with different states. Clicking the first narrows the list, but the second still reads "Can make" (off). Shot R2_systems_9.png.
- (minor) **A blueprint in the hotbar does nothing on LMB**, though the hint says "LMB Use". Only the bag's Place button starts placing.
- (minor) **The hammer opened the well's Move/Remove menu with LMB but not with E** while standing beside the well and facing it.
- (minor) **"It doesn't fit there: clear the tgrass first."** shows the internal key instead of "tall grass" (the building placement message).
- (minor) **A build site removed with the hammer gives back its materials but not the blueprint item**, which placing it used up (x_fixes.js `demolish`).
- **Checked OK:** batch crafting (×100 rivets with 5 iron bars made exactly 5 batches = 100 rivets and used 5 bars). Hammer Move on the barn, then clicking Next day mid-move or walking off the farm mid-move, puts the barn back where it was. A moved well refills the can at its new spot. Running out of pieces mid-drag stops cleanly and frees the hotbar slot. Water, crops and existing objects are skipped.
- (minor) **Drop puts the stack at your feet, and it flies straight back into the bag** as soon as the window closes (5 stone dropped, 5 back 2 s later). Drop does nothing unless you're on the move.
- **Checked OK (saves and inventory):** "Save and quit to title" inside the tavern, then Continue, loads at the tent on the farm with the items kept. Swapping a weapon with a full bag works. Taking off a helmet with a full bag is refused ("Your backpack is full."). An equipment preset loads the helmet back out of the bank without duplicating it. Story items overflow to the bank (w_story.js:174) and `bring` steps count the bank. Crafting batches take materials per item, so a reload mid-batch loses nothing. Esc and the menu dock are blocked during dialogue, so you can't save mid-dialogue by hand (the welcome problem above comes from the save made on reload).
- **Map transitions:** 8 quick hops by walking onto warps with the Satchel opened and closed mid-walk (village → farm → Wilds → locked Highmarch/Frostmere/Emberwaste gates → farm → village → Wilds): no errors, no stuck PAUSED, the locked gates turned me back. Earlier, Next day and walking off the farm in the middle of a hammer Move both left a clean state. No console errors all session.

## Economy

- **Layer Cake is a big earner from shop-bought basics.** 2 flour (Mara 70g each) + 2 sugar (45g) + 1 butter (90g) + 1 milk (85g) + 2 eggs (35g) sells for **1,300g**. That's about 475g of inputs at sale value, so ~825g profit per 1.8 s kitchen job. Only the milk and eggs need animals. Shown by checking the recipe ratios of every recipe in `RC` (output sell price ÷ input sell price): cake 4.7x, sausage 4.9x (pork + salt + herb → 2 × 300g), salad 4.6x, mushroom skewer 4x. Most other food is 2-3x.
- **Small money loop: the Building Hammer.** 6 wood + 4 stone bought from Hale (10g each = 100g) → a hammer that sells for 120g, made at the workbench in 1.2 s, any number. +20g each until selling pushes the price down (~30 a day). Small, but it is a buy → craft → sell loop.
- **Mara's Pantry note is wrong about "cheaper to make yourself".** Butter costs 90g to buy but 2 milk (170g) to churn. Sugar costs 45g to buy but 2 beets (160g) to mill. Only flour (70g, or 3 wheat = 60-75g) is close. Nobody should make sugar or butter.
- Shipping bin: shipped 20 turnips (45g each with the sandbox's skill perks), Next day paid exactly +900g. Take 1 / Take all give items back correctly, and with a full bag it says "No room" and keeps them in the bin (no loss, no dupe).

## Art

- (systems tester, art seen in passing, Painterly) Characters stay crisp pixel figures among the painted props (known and by design). Water channels and placed fences are pixel-drawn pieces with a stone kerb, which looks fine next to the painted pond (R2_systems_6.png). A double row of dragged fences along the farm's north edge reads as a lattice (R2_systems_5.png). The "Furnace (forge)" in the sandbox yard is tiny next to its label (R2_systems_2.png).

## Performance

- A steady 155-165 fps (1.0-1.8 ms of game work) in the sandbox yard, the farm, the village, the tavern and the store, all in Painterly. No stalls on map hops.

## Top 5
1. A reload or quit during Lord Ashcombe's welcome dialogue loses the whole tutorial: he only says "Get on with it", and there's no choice and no "A New Start".
2. Drag-to-place ignores the player's own tile and reach, so you can fence yourself in or block the farm's exits (you get out with the pickaxe).
3. Economy: Layer Cake (1,300g) and Sausage (2 × 300g) are worth ~4.7-4.9x their inputs, which are mostly shop-bought. Layer Cake gives ~825g profit per 1.8 s kitchen job.
4. Economy: the Building Hammer is a small buy → craft → sell loop (100g of Hale's wood and stone → 120g). Mara's Pantry says making is cheaper, but butter and sugar cost about twice as much to make as to buy.
5. UI: two "Can make" chips at stations with separate states. Also a blueprint does nothing on LMB in the hotbar, and the drag keeps placing while the Satchel is open.
