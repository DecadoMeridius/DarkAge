# W1 — Systems / UI tester (Test sandbox, Painterly, port 9304)

Session: Test sandbox (developer mode), Painterly art style and the FPS counter on. Played Mon 1 to Wed 3 of Spring with "Next day" twice. Covered: every Satchel tab, the bag and hotbar (drag and right click), workbench, anvil and smelter windows, Get / Get x5 / Make / x5 batches, conveyor placement, water channels (including a clog and clearing it), fences and a Fence Gate, the hammer's Move/Remove on the barn, the key bindings popup and the cursor choice.
`errors` showed **no console errors** all session.

Note: the harness hit an image limit, so screenshots 2-68 were saved but I couldn't view them. My notes for that stretch come from the text dumps only. Screenshots 69-109 were reviewed.

## Broken
1. **Esc doesn't close the Key bindings popup.** Options → Key bindings… → press Esc (twice): the popup stays open, but its own header says "Esc always closes windows". Clicking outside closes it. (shots 95-97)
2. **The wheel doesn't scroll the Key bindings list.** The list is cut off after "Ability 3" (more actions below); wheeling over it did nothing (shot 96). I had to guess the rest is reachable only by dragging the tiny scrollbar.
3. **The smelter's slots have no "put in" from the supply.** In the sandbox, opening the Smelter says "Nothing in your backpack fits here", and its window has no Get button, unlike the crafting stations. To test the automation line you have to go to the supply crate yourself, and nothing says so (text dump at 8:40am). Minor for players, but a dead end in the sandbox.
4. **Getting-started checklist in the sandbox** shows "Sleep in your tent before 2 am" ticked after using **Next day** (shot 92). It's harmless, but the sandbox counts toward the checklist and the stories ("New story: The Hollow Crown") as if this were a real game.
5. **Passive tree "Respec (0g, at the altar)"** is greyed out and says 0g (shot 106). Either the cost is wrong (it should be 250g per point) or it should read "no points spent".

## Quality of life
- **Station recipe lists are huge and unfiltered.** The anvil opens with every tier from Copper to Frostsilver… (dozens of rows) all at "(have 0)". Defaulting to **Can make**, or folding by tier, would help. The search box does work well (typing "gate", "conveyor" or "channel" filters at once).
- **Clearing the search box is fiddly.** The search keeps its text between uses ("gate" was still there next time). There is a ✕, but keyboard users need many Backspaces. Select-all on focus would fix it.
- **"Get" then "Make" takes two clicks per recipe.** In the sandbox a "Get & make" button, or Make fetching what's missing, would speed testing a lot.
- **Placing with the hotbar is unclear at first.** After crafting, a new item lands in the bag, not the hotbar, and the Items-tab drag is the only way to place it (or the "Place" button). A "Place" toast right after crafting a placeable would help.
- **Conveyor direction** follows where you face, which isn't obvious with the mouse-facing controls. The first conveyors I placed pointed "<<" (west) because I'd just walked west. A rotation preview on the ghost, or R to rotate while placing, would help.
- **Fence Gate:** a 2-tile gate placed OK, and the ghost shows the full width (shot 87). But with a fence item in hand, the LMB hint over a gate still says "Place", and clicking a tile next to the gate's posts said "Something is in the way" with no reason (shot 81/89 toast). `tileWhy` should name the blocker ("a gate post").
- **Water channel clog:** the morning report says "Leaves and debris choked one of your water channels" but not *which*. On a long network you'd have to hover each tile. The clogged tile's art (orange leaves on brown) is visible up close (shot 75), and E "Clear debris" plus its toast work well (shots 78-79). Please add a location ("near the pond") or a map marker.
- **"Meadow grass crept into 2 tiles of your fields"** in the sandbox yard (the stations sit on unfenced ground). It's fine in a real game, but unexpected in a test yard.
- **Hammer on a building:** LMB on the barn with the hammer only walked to the door. E then opened Move/Remove. CLAUDE.md says LMB on it should also open it.
- **Hammer Move ghost:** red/green tiles and the "It doesn't fit there: clear the board first" reason are clear (shot 103). The right-click cancel returns the barn with a toast (shot 105). Good.
- **Combat skills (V):** Piercing Shot and Fireball show an enabled **Learn** button while "✗ Hold a bow/staff to use it" is listed. It's ambiguous whether you can learn now; if you can, mark that line as "to use", not as a requirement.
- **Passive tree:** the LIFE label sits off to the right of the bottom keystone, while the other three labels are centred on their branches (shot 106).
- **Combat level 100** is shown in the Items stats (sandbox skills at 60, so (5×60)/3 = 100). That's over the 1-99 scale everything else uses.

## Balance
- Sandbox only, so not much. The Water Channel recipe (6 stone + 2 clay for 5) and the Fence Gate (6 wood, 2 fiber) feel cheap and fine.
- Batch timing: a ×5 fence batch took about 3-4 s with the window open, which is good. Fence ×4 per craft means "x5" gives 20, but the button text doesn't say so.

## Art & feel (Painterly)
- The world looks lovely in Painterly: trees, the pond, the barn and the stables read well, and the spring palette is warm (shots 69, 99).
- **Water channels** are drawn as plain square pixel tiles with a grey rim. Next to the painted pond they look like pixel art (shots 72, 80). They do join as one full-width trough at the corner, as intended.
- **Tilled soil, the stone path and fence posts** next to painted grass look crisp and pixel-styled, not painted (shot 81). The soil squares look like flat brown stamps.
- **Conveyor crates** ("<<" boxes) look pixel-flat and are hard to read as belts. They look more like crates with an arrow (shots 85, 90).
- **Station labels** (Workbench, Furnace (forge), Anvil…) are large and overlap each other and the hotbar hint ("Anvi[LMB] Place", shot 90). The Kitchen label is cut off at the right edge.
- **The character** stays a crisp pixel sprite over painted ground. This is expected per the docs, but noticeable.
- The night/evening tint wasn't reached (the day ended via Next day).

## Performance
- A steady **127-131 fps**, 1.0-1.7 ms of work, everywhere I went (yard, pond, barns). One frame showed 5.7 ms right after the barn was put back (shot 105). No stutters seen.

## Liked
- The Get / Get ×5 buttons with "Took 8 items from the supply crate" make the sandbox fast to test.
- Recipe rows with "(have N)" in red/green, the category chips and search.
- Clear morning report cards with icons, and the channel-clog mechanic with its own E prompt and toast.
- The building hammer flow: a small Move/Remove/Cancel window, a ghost with per-tile red, and a reason when it's refused.
- The dock with labelled icons, and the Satchel tabs showing their key letters.
- No console errors in the whole session.

## Top 5 fixes
1. Make **Esc close the Key bindings popup** and let the **wheel scroll** its list.
2. Station windows: default to **Can make** (or group by tier) so the anvil and workbench aren't a wall of "(have 0)". Clear or select the search text on reopening.
3. Say **which channel** is clogged (location or map marker) in the morning report.
4. Placement feedback: show the **conveyor direction** on the ghost (and allow rotating while placing), and give a reason ("a gate post", etc.) instead of "Something is in the way".
5. Painterly pass for **water channels, tilled soil, conveyors and fence posts** (they read as pixel art), and keep the **station labels** from overlapping each other and the hotbar hint.
