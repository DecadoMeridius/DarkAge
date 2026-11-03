# W3 — UI/UX review of every window (Test sandbox, Painterly)

Tester role: UI/UX reviewer. Harness port 9301, `http://[::1]:5173/`, developer mode on, Painterly + FPS counter.
The harness window was actually **1584x805** for most of the run (not 1600x900). Shots 34-35 are at **1280x720**.
Shots: `docs/playtest/overnight/shots/W3_ui_<n>.png`.

## Broken

1. **Dialogue portrait is huge and blurry in Painterly (W3_ui_32).** `storyDialog` (w_story.js ~203) sizes the portrait as `spr.width * 2` CSS px. In a styled mode `humanSpr` returns a 4x canvas (128x256), so the portrait comes out 256x512 CSS px. The "box along the bottom" grows to 760x540 and covers the whole scene, with a soft full-body figure on the left and two lines of text. Fix: size from world units (`spr.ww`/`spr.wh`, or a fixed ~128 px height). Better still, crop to head and shoulders (the top ~40% of the sprite) for a real portrait, and cap the box height (~180 px).
2. **The Key bindings popup comes back by itself (W3_ui_21, W3_ui_33).** Open Options → Key bindings… → press Esc. Esc closes the whole Satchel but leaves `KEYPOP = 1`, so the next time Options opens, the popup is already open. Fix: reset `KEYPOP = 0; REBIND = null` when the modal closes, or make Esc close only the popup first.
3. **The Load game list puts each save's details at the bottom of the screen (W3_ui_2).** The slot row's `<small>` ("Spring 2, year 1 · 485g · saved 3 Nov 2026, 01:37") picks up `#title small { position:absolute; bottom:10px }`, the rule for the controls hint. It lands on top of the hint at the bottom edge, and the two texts overprint into an unreadable line, while the slot row shows only "Wren". Fix: scope the hint rule to its own class (e.g. `#title > small.hint`), or add `.rtxt small { position: static }`.
4. **Enter doesn't close the morning report (W3_ui_17).** The Enter → main-button handler in x_fix3.js skips any window that contains `.list`/`.grid`/`.slots`, and the report's lines are a `.list`, so the case it was written for doesn't work. Fix: mark the report with a flag or class (e.g. `MODAL.opts.enterOk`) instead of guessing from the DOM.
5. **The title buttons jump when Load game opens.** Continue / Load / New / Sandbox move up ~45 px as the list appears (the click target for "Test sandbox" moved from y 468 to 423), so a second click lands on the wrong spot. Keep the button row fixed and let the list open below it.
6. **Right-clicking Brann inside the smithy doesn't open his shop (W3_ui_30).** You walk to a tile 2 away (9,6), next to the anvil, and nothing opens. Pressing E there does nothing either. I had to walk next to him by hand and face him. Mara's counter worked (W3_ui_28 → 29). The "keeper behind a counter is reached across it" rule seems to miss when the counter is the anvil.
7. **Unexplained sandbox gold.** Gold went from 1,000,000 to **1,055,500** while I clicked through the two sandbox intro messages with Enter (plus five spare Enters with no window open). There were no shipments or stats, and I couldn't reproduce it later. It might be the "Enter sold goods in the sandbox" problem that x_fix3 mentions coming back through another window. Worth a look.
8. `errors`: none in-game. The port log has five 404s for resources (probably shared with earlier runs on this port).

## Window by window (concrete fixes)

**Title / Load list (W3_ui_1, 2):** the slot row needs its date, gold and generation inline (bug 3). Delete is the same size and weight as Load, right next to it: make it smaller or an icon, and keep the confirm step. The title screen has no keyboard focus or Enter default.

**HUD (W3_ui_3, 35):**
- Dock labels are **9 px** ("Bag", "Collect", "Lore"): too small at 1080p. Make them 11-12 px or drop the labels and use tooltips with the key.
- The dock names don't match the tab names: Bag/Items, Tree/Passive tree, Combat/Combat skills, Collect/Collections, Lore/Encyclopedia. Pick one name for each.
- The key-help box (bottom left) overlaps the FPS counter.
- The health/energy panel has a mostly empty third row (just the three hearts). Put the hearts beside the bars and shrink the panel.
- At 1280x720 the world ground labels ("Oven", "Smelter", "Cheese", "Preserves Jar") run under the hotbar and the dock (W3_ui_35).
- The sandbox banner overlaps the top frame of every window (W3_ui_5-31) and the room walls. Push the windows down by its height, or put it inside the top-left panel.
- Ground station labels are very large (bigger than any HUD text) and get cut at the screen edge ("Kitchen (ca", W3_ui_3).
- The tracker label "to The Wilds" sits over the player's head even when nothing was tracked by the player (W3_ui_35).

**Satchel frame (all tabs):**
- 14 tabs on two rows, and the rows reflow with window width: at 1280 "Map" drops to row 2 (W3_ui_34), so tab positions move. Use a fixed two-row order, or a left-hand vertical tab list with the dock icons.
- Esc on a sub-view (story recap, key popup) closes everything. It should go back one level.
- Tab is taken by the passive tree, so a second Tab closes the Satchel. There's no keyboard focus or tabbing through controls anywhere.
- Fixed full-size window even for two lines of content (Animals, morning report, recap). Use the `SMALL_WIN` treatment more widely.

**Items (W3_ui_5, 34):** this one works.
- Empty equipment slot labels ("Head", "Ring") are pale on tan and barely readable.
- The backpack shows four full rows of empty slots, with the help text in a wide empty column. Put the stats panel there.
- At 1280x720 the stats panel is cut off and the window scrolls.

**Recipes book (W3_ui_6):**
- Furnace/Anvil/Tanning rack station chips are greyed with no explanation (they look disabled).
- Rows are ~60 px tall for one line of ingredients. Use a compact two-column list.
- The disabled "Make" on Campfire is near invisible: pale orange on pale tan.
- FPS dipped to 33 for a moment on opening.

**Station windows (workbench W3_ui_22, anvil W3_ui_23-24):**
- A station opens the whole Satchel with its tab renamed. Fine, but the filter chips are not station-aware: Blueprints / Machines / Farming / Food show at the anvil and forge.
- ~60 workbench recipes in one flat list with no section headings. Blueprints sit at the bottom.
- Duplicate names with no hint of the difference: "Haft" (4 Wood) and "Haft" (1 Hardwood), and "Padding" twice. Add "(from hardwood)".
- "Can make" wraps onto its own line.
- The craft-progress bar is inserted *between* the search/chips and the "Can make" chip, so the list jumps down 60 px when a job starts (W3_ui_24), and the bar has no visible fill at 0/1. Pin it to the top or bottom of the window.
- Toasts ("Took 5 items from the supply crate") sit over the row buttons on the right (W3_ui_23).
- Spelling: "Defense 2" on armour vs "Defence" in Skills and stats. Pick British "Defence" everywhere.
- Weapon rows say only "Sword". Show damage/speed so you can compare.

**Skills (W3_ui_7):**
- The heading reads "COMBAT — LEVEL 100" in a game whose levels cap at 99. Either "Combat level 100" in body text, or explain it.
- No progress bars or skill icons on the cards. XP text like "126,022 to level 76 · next passive at 80" wraps.
- The bottom third of the window is empty.
- Cinzel Decorative's capitals make "LIFE SKILLS" read as "IIFE SKIIIS" and "YEAR 1" as "YEAR I". Use plain Cinzel or Fredoka for headings that contain L or digits.

**Passive tree (W3_ui_8):**
- Branch labels (MIGHT, PRECISION, ARCANA, LIFE) are ~9 px. LIFE floats off to the side of its branch.
- Nodes have no visible names (only a hover tip).
- "Respec (0g, at the altar)" is shown as a disabled button with no reason.
- The dark canvas on parchment is fine, but the canvas fills only ~60% of the width.

**Combat skills V (W3_ui_9):**
- **Learn is enabled for Piercing Shot and Fireball while a red ✗ "Hold a bow/staff to use it" is listed under "To unlock".** Either it's not a requirement (move it under "To use") or the button is wrong.
- Cards are very tall. Collapse the checklist once it's all met.

**Animals (W3_ui_10):** the empty state is two lines in a full-screen window. Add a picture or icon, a "Visit Odile" hint with the map direction, and use a small window.

**Friends (W3_ui_11):**
- One villager per full-width row: about five visible and 3,500 px of scroll. Use two or three columns.
- Hearts are ~11 px.
- The header says gifts are given "in their shop", but the street window also has gifts.

**Family (W3_ui_12):**
- The Romance row is greyed (it looks disabled) and says "ask them out from their shop", but the suitors (Lotte, Clara, Freya, Sabine) have no shop.
- No family tree at generation 1. Show "you" as the root anyway.

**Collections (W3_ui_13):** good silhouettes. The native `title` tooltip names undiscovered items ("Ember Idol"), unlike the styled `#tip` used elsewhere. Use the styled tip, and maybe "???" until found.

**Encyclopedia (W3_ui_14):** the best window.
- "Used in (11)" is plain small text. Make the names clickable to jump.
- Dimmed vs owned icons are hard to tell apart in Painterly.

**Map (W3_ui_15):**
- Two scrollbars (inner and outer).
- Flat bright green with brown boxes: clashes with the Painterly world. A parchment-toned chart would match.
- The many orange and grey dots aren't in the legend.
- "Your tent" label overlaps the Coop.
- The sandbox stations aren't shown.

**Quests / story recap (W3_ui_16, 18, 19):**
- The sandbox shows the full Getting-started list, which pushes Stories below the fold. Collapse finished or irrelevant steps, or put stories first.
- The recap opens as a separate window with no Back (Esc closes everything) and a full-size empty page for one chapter. Add "← Journal" and a small window.

**Morning report (W3_ui_17):** two lines in a full window. Use a small window, add yesterday's shipping total, and fix Enter (bug 4).

**Options (W3_ui_20, 21):**
- Combat mode and Load/Save-and-quit sit above and outside the Settings frame.
- Orange means both "selected" (Painterly, Auto, Full) and "action button" (Load another save, Key bindings…, Change appearance). Use a different style for actions.
- Old "Music: on / Sound: on" toggles repeat the volume sliders.
- Sliders are narrow (~160 px).
- The How-to-play text omits V, N, P, F, O, Z/X/C and Q.
- Key bindings: single-column tall rows, no "Reset to defaults", Done only after scrolling to the bottom, and no dimmed backdrop.

**Crate (W3_ui_25):**
- 170 stacks with no categories or sort, while the bank has both.
- The "Your backpack (click to store)" section is **below** the whole crate grid, so depositing means scrolling past everything. Use the bank's side-by-side layout.
- The hover tip stays stuck over a slot.

**Bank / storage (W3_ui_26):** good layout, categories and sort.
- The bank list scrolls in a ~290 px box, while the empty space under the backpack is unused. Move the presets to the left column.
- "Keep hotbar items" reads like a toggle but is an action.

**Shops — Mara (W3_ui_29), Brann (W3_ui_31):**
- The price is buried mid-sentence ("23g. 40 in stock. Grows in…"). Use a right-aligned price column.
- Only ×1/×5, with no quantity field.
- Shop tabs are plain text, unlike the Satchel tabs with icons and keys.
- Mara puts the greeting card at the top. Brann puts it *below* search and chips, and opens on **Forge** (crafting) instead of Buy/Sell. Open shops on Buy, and keep the greeting card in one place.
- At Brann's, the "Furnace ✓ / Anvil ✓" chips look like filters but are stations, with mixed selected styles.
- No confirm when selling a weapon with "All".

**Rooms (W3_ui_28, 30):** above every room there's a mirrored copy of the room's top wall strip (the past-the-edge mirroring), floating over the black void. Don't mirror indoors.

## Quality of life (summary)
Inconsistent naming between the dock and tabs; Esc closes everything instead of going back a level; Enter works only in some windows; small content in full-size windows; no keyboard navigation; filter chips that ignore the station; long single-column lists (Friends, recipes, crate).

## Balance
Out of scope for this role. The copper sword sells to Mara for 173g.

## Art & feel
The parchment-and-wood frames suit the Painterly world well. The weak spots:
- the bright flat green Map;
- 9 px dock labels next to huge painted ground labels;
- Cinzel Decorative capitals (L→Ꝉ, 1→I);
- the blurry giant dialogue portrait;
- the floating mirrored wall strips over rooms.

## Performance
~128-130 fps everywhere; one dip to 33 fps on opening the Recipes tab (it recovered at once).

## Liked
The Encyclopedia card layout, the bank categories and sort, recipe rows that name each ingredient with "(have N)", the Collections silhouettes, the hand-pixelled dock icons, and the shop greeting card with its friendship bar.

## Top 5 fixes
1. Dialogue portrait: size it in world units and crop to the head, so the box stays a strip along the bottom (W3_ui_32).
2. Load game slot details pinned to the screen bottom, overprinting the hint (CSS `#title small`) (W3_ui_2).
3. Key bindings popup reopens after Esc (reset `KEYPOP` on close), and Esc should step back one level in sub-views (W3_ui_21/33, 19).
4. Enter doesn't close the morning report (the `.list` check in x_fix3), and the morning report and other short windows should use the small window (W3_ui_17, 10, 19).
5. Consistency pass: dock vs tab names, 9 px dock labels, station-aware chips, shops opening on Buy with the greeting card in one place, crate deposit side by side like the bank, Defence/Defense spelling (W3_ui_3, 23, 25, 31).
