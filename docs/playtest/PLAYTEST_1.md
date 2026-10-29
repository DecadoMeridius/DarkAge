# Playtest 1 (2026-10-29): four AI playtesters on build 0.4.3 + multitool/regrowth

Four personas played a new game each in their own headless Chrome, using only mouse and keyboard and judging only from screenshots. They were stopped early, after about 45-65 commands each, so most of them only saw day 1.
- **Newcomer:** farming and the first day.
- **Adventurer:** Wilds and combat.
- **Crafter:** gathering, workbench and the sandbox.
- **PC critic:** menus and options.

None of them hit a JavaScript error. Performance was a steady 164 fps.

## Critical (reported by 3 or 4 testers)
1. **Nobody could find the way from the farm to the village.**
   - The east road runs into a solid tree wall with no gap, sign or arrow.
   - Two testers never got there. The other two lost most of day 1 finding it (one got through only by clicking the exact path end).
   - Fix: a visible gap in the trees, a signpost, a wider exit trigger, an "Entering Emberhollow village" banner.
2. **The map (M) is useless on the farm and in the village.** It shows an empty parchment with "Farm" and "Village" printed at the bottom. It needs a real farm and village layout, a you-are-here marker and shop labels.
3. **Clicks don't act on the clicked tile.**
   - The action tile is always the one in front of you, never a diagonal one.
   - Seeds got planted on the tile next to the tilled one, and hoe clicks tilled the path.
   - Fishing says "can't reach" 3 tiles out, yet the bobber lands 3 tiles out.
   - Fix: act on the hovered tile when it is in reach (including diagonals); otherwise walk to it.
4. **The opening letter doesn't match the game.** It promises a "crooked cottage, empty barns, a sword above the hearth", but you start with a tent and nothing built.
5. **The recipe button is labelled "C" on the HUD.** C is Guard; recipes are on B.

## Bugs
- Getting stuck: wedged between tree trunks in the dense Wilds forest and at map edges; only one direction gets you out. At the start the workbench spawns beside the tent and campfire and boxes you in. Movement should slide along obstacles.
- The campfire is drawn over the character's head when you stand just below it.
- The player sprite disappears while the game is paused.
- Knocked out by something unseen at low HP, with no hit splat and no faint animation (the adventurer saw only the next-morning window).
- The village request board can't be opened, though the quest log sends you to it.
- Clicking a locked tree from a distance walks you there and then does nothing, with no message. Holding the mouse button stacks the "Needs Woodcutting 10" toast 4 times.
- E doesn't open the workbench (right click does).
- Right-clicking the stables door walks you to the wrong spot.
- The default name is "Wren" (a story NPC). Clicking the name field doesn't select it, so typing appends ("WrenRobin").
- The character creator shows a "500g" counter and a close button.
- Item tooltips stay stuck on screen after a drag.
- The Encyclopedia doesn't actually dim items you haven't owned yet.
- Track shows no direction when the target is on another map.
- Fishing gives no clear bite cue, and the reaction window is very short.
- Trees look like they grow out of the stables and store roofs.
- **Sandbox:**
  - Health and energy start at 100/600 and 120/330 instead of full.
  - Get only moves one craft's worth.
  - The signs under the stations are blank.
  - There are three intro dialogs.
- **Text:**
  - Options → How to play is still the old mobile text (dragging, ⚔ button, horse button).
  - Friends says "tapping".
  - "Took 1 items", "Bring 4 Potato".
  - Double full stops ("site..", "tier 1..").
  - Two recipes are both called "Haft".
  - Two toasts for one craft ("Crafted Fence ×4." + "Fence done.").
  - "LMB Cast RMB Cast".
- The heading font joins "OO" into one glyph (BOOTS, WOOD).
- "New game" creates a save slot even if you back out of the character creator.

## Onboarding and clarity
- Nothing says what to do first. The quest log opens with 5 "Not begun" stories and late-game milestones. Add a short first-day guide: buy seeds at Mara's, till, plant, water, sleep.
- Stories don't say how they start (The Hollow Crown only began on day 2).
- Shops have no outside name signs, and doors face away from the plaza. Shops that are closed should say so at the door.
- The ruined greenhouse isn't explained (one tester also read its dark panes as missing tiles).
- There's no watering-can level indicator.
- The combat HUD (Focus bar, Z/X/C) is always on screen, even indoors and while farming. It covers doors and the bottom of rooms.
- The recipe book and workbench are one flat list of 60+ recipes. Blueprints sit at the very bottom, and the mouse wheel didn't scroll it. It needs category tabs (Blueprints, Machines, Parts, Tools, Farming) and a search box.
- Red maples (Woodcutting 10) are very common around the start, so first tree clicks get refused. In spring they also read as autumn trees.
- One window name: "Satchel" vs "Backpack". The backpack grid is only 4 columns, with half the window empty.

## Balance
- Time runs too fast for new players: exploring the village took all of day 1. Gathering costs 20-30 game minutes per tuft or pebble once walking is included.
- Wilds wolves next to the farm are level 9 versus combat level 4. Each wolf takes 55 HP, there's no starting food and no health regeneration out of combat. Fix: weaker enemies near the farm, a few starting meals, slow out-of-combat regen, and a low-HP warning.
- Early requests pay too much (8 Rhubarb for 2825g, 4 Potatoes for 578g).
- Shops have no quantity picker or confirmation, and ×5 on expensive seeds empties your wallet. The Sell tab offers your seeds.

## What they liked
- The pixel art: trees, the red maples, interiors, the title screen.
- The character creator.
- The warm evening light.
- The parchment UI.
- Auto tool selection when clicking resources.
- The have/need counts in recipes.
- Drag and drop onto the hotbar.
- Auto-attack combat feels tense.
- Plenty of systems, and excellent performance.

## Not covered yet (for the next run)
- Sleeping, harvesting and selling across several days.
- The mine.
- Building a blueprint end to end.
- Automation.
- Villager gifts and dialogue.
- Save and load after a restart.
- Regions.
- The night look.
