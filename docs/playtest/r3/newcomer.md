# Playtest r3: the newcomer (Ashcombe's tutorial)

Persona: a cozy-game fan who has never seen the game and is a bit impatient. Played through the harness only (port 9301), about 130 commands, from New game to the morning of day 2.

## Summary

- **Tutorial: 7/10.** The steps are short and in a sensible order, and each line names the hotbar key (scythe (6), hoe (1), seeds (8 and 9), can (2), axe (3), pickaxe (4)). Every step finished on the first real try. Most of the friction came from the controls around it: inputs swallowed after a dialogue closes, the auto-tool switching away from your tool, and an arrow that leads into fences.
- **Immersion: 7/10.** Ashcombe walking up the road is a lovely opening: "So you're the grandchild. You have her chin." The grandmother thread (the workbench, the fences, the smell of thyme in the tent) is warm, and the morning note pinned to the tent flap is a great way to end. What breaks it: he says "Walk with me to the village", then never walks with you. In the village he says "Here we part" while he isn't there, and on day 1 he stands in the campfire.
- No JS errors (`errors`: none).

## Step by step

1. **New game → creator.** The creator is clear and attractive. I typed a name and picked "pony" and a green shirt. On the farm my character looked short-haired from the front (the ponytail only shows from behind, as designed), so I couldn't tell whether the pick took. Begin worked. **There was no arrival letter:** a toast at the bottom right says "Footsteps on the road: an old gentleman in a dark red cape is walking up from the village." That is nice and subtle, though easy to miss.
2. **Ashcombe arrives** (about 10 s later, 6:10). He stops right on top of the campfire stones: his head overlaps the fire, and he stays there for the whole farm tutorial. The dialogue is portrait + name + Continue, and Space advances it. Being impatient, I pressed Space five times and skipped the whole introduction before the choice. Nothing says Space skips, and there's no back-log. The choice "Show me around / I know my way around a farm" is good.
3. **Weeds (scythe, 6).** The line says "close to the tent", but there were no weeds near the tent; the nearest were 3-4 tiles south. I clicked a weed, walked to it and cut it, and the step finished immediately. Clear, apart from "close to the tent".
4. **Till (hoe, 1).** "Break a few tiles of ground." I pressed 1 and clicked grass. My first clicks landed on or near a pebble, and the **auto tool switched me to the pickaxe and started "Mining... (move to stop)"** instead of tilling. A newcomer told to use the hoe will be confused. On the second try one tile was tilled, and that already finished the step ("a few" = 1).
5. **Plant (8).** **The first hotbar key after closing the dialogue was ignored** (input gap): I pressed 8, clicked the soil, and nothing was planted while slot 1 stayed selected. Pressing 8 again worked.
6. **Water (2).** Worked on the first try. "Fill it at the pond" names a pond I never saw on screen; nothing points to it.
7. **Chop (axe, 3).** "Take the axe (3) to a tree, or to the twigs." I clicked a twig with the can still selected: the first click after the dialogue was half-eaten (I walked but didn't act), and the second click **watered the ground next to the twig** because the auto tool keeps a can you picked yourself. Only pressing 3 by hand worked. This cost three tries.
8. **Mine (pickaxe, 4).** It finished the instant I clicked, without a swing: the stone I had mined by accident in step 4 counted. That's convenient, but it made the step feel like it skipped itself.
9. **Workbench.** "Walk up to it and press E." A right click walked me there and opened the recipe list. Fence x4 was at the top with Make lit, so it was easy. Ashcombe's reaction line about the grandmother's fences is charming.
10. **Village.** "The road east, past the signpost." After I closed the dialogue a big yellow arrow said "to Emberhollow Village", which really helps. But the arrow points in a straight line: following it with WASD walked me into the paddock fence, and it pointed *into* the fence. I had to find the road myself and click along it. Partway the label disappeared and only the arrow stayed. **Ashcombe walked off on his own and was never seen again**, even though he said "Walk with me".
11. **Plaza.** Entering the plaza triggers a narration box ("a fountain, a few shopfronts, smoke from the tavern chimney...") and then Ashcombe's farewell, "Here we part. The manor's on the hill...", with no Ashcombe in sight. The arrow then says "Mara · 15 m" and points west and then north, to a shop with a "!". It was clear, but the arrow pointed through the well and I had to find the door myself (I was standing at the window).
12. **Mara.** Inside the room (lovely interior), a right click on Mara opened her story lines and then the shop. She says "Come back when you've coin", but I had 500g in my pocket. That's a small mismatch. Buying 5 turnip seeds (115g) was easy, and the rows show grow days and sell prices, which is great.
13. **Sleep.** The journal (J) was clear: "Sleep in your tent (before 2 am)", tracked. **No arrow was shown on the farm for this step** (I saw none on the road back), so I walked home from memory, got stuck on the greenhouse, and went round it. Right-clicking the tent opens "Home" with "Sleep until morning / Cook / Save". I slept at 11:20 am. Nothing stops you sleeping before noon, and the tutorial doesn't suggest using the rest of the day.
14. **Day 2.** The morning report: rain waters the crops, a new story (The Hollow Crown, Elias), and Odile's stray. Then a note pinned to the tent flap from "A." explains the shipping bin, warns that the Wilds are north and invites you to the manor. That's an excellent close. My gold went from 385 to 635 and my bread from 5 to 8 without any message I noticed (presumably the tutorial reward), so a "+250g, +3 bread" line would help.

## Bugs

- **Input swallowed after closing a dialogue.** The first hotbar number key, and sometimes the first world click, does nothing (step 5 and step 7). It happened at almost every step, because every step starts by closing a dialogue and pressing a number. The `INPUT_GAP` / post-dialogue block seems too long, or it also catches keys.
- **The auto tool fights the tutorial.** With the hoe selected, a click on a pebble switches to the pickaxe and starts mining (step 4). With the can selected, a click on a twig waters instead of switching to the axe (step 7). The tutorial names a key, the player presses it, and the game then does something else (pickaxe) or the opposite (no switch).
- **Ashcombe stands inside the campfire** (his sprite overlaps the fire stones) for the whole farm tour.
- **Ashcombe doesn't escort you.** He says "Walk with me to the village", walks off, and then delivers "Here we part" in the plaza without being there.
- **The quest arrow ignores obstacles.** It points straight into the paddock fence on the way to the village, and through the well in the plaza. CLAUDE.md says the tracker follows the walking route, but on the farm-to-village leg it didn't.
- **No arrow for "sleep in your tent"** while I was walking back from the village (the step was tracked in the journal).
- The combat strip (Focus 0, Cleave / Lunge / Guard) shows on the farm as soon as the sword is selected, with no enemy about.
- The mining step finished at once because a stone mined earlier counted (it's a `have` check), so the step never asks you to swing.

## Confusing bits

- "Close to the tent": there were no weeds there.
- "A few tiles": one is enough, so the instruction overstates the task.
- "The pond": I never saw it, and nothing points to it.
- Space skips the dialogue lines with no warning, and I lost the whole introduction.
- Mara's "come back when you've coin" while you hold 500g.
- The tutorial reward (gold and bread) arrives silently.
- The "Getting started" checklist in J repeats the tutorial (till, plant, water, sleep...), so two systems are teaching the same thing.
- With a pickaxe selected the hint said "LMB Walk" on open ground, but "LMB Mine" near anything. That's fine, but it switches a lot.

## Looks

- The farm is pretty: clean pixel art, a ruined greenhouse with ivy, the tent, a workbench with tools on it, a lit campfire, scattered stones, twigs and grass tufts, and a paddock fence. Rain on day 2 gives a darker grade with fine streaks. It reads as rain, but faintly.
- The village plaza is big and lively: cobbles with moss, a well, a three-tier fountain, lamp posts, and four or five villagers walking about by 9:00. The shopfront row (Mara's green roof and awning, a stone smithy with an anvil sign, a half-timbered house with flower boxes) looks great. Mara's interior (shelves, a fern, a rug, barrels, a lamp) is cosy.
- The dialogue box with the portrait is clean and readable. The story title ("A New Start") above the speaker is a nice touch.
- Small: the player sprite overlapped the well's edge in the plaza, and Ashcombe overlaps the campfire.

## Top 5 fixes

1. **Make inputs land right after a dialogue closes.** Don't swallow number keys at all, and shorten the click block. During the tutorial every step starts with a number key.
2. **Keep the tutorial's tool.** While a tutorial step names a tool, turn off auto-tool switching (or make it switch *to* the named tool), so "hoe (1)" never turns into mining and "axe (3)" works when a can is in hand.
3. **Have Ashcombe actually walk with you to the village** (or reword it to "I'll meet you in the village" and have him waiting at the plaza for "Here we part"). Also move him off the campfire.
4. **Make the tracker arrow follow the route on the farm** (the road east, round the paddock), and show it for the "sleep in your tent" step too.
5. **Small wording and feedback:** point out weeds that are really near the tent (or say "nearby"), say "a tile or two", point to the pond, show the tutorial reward ("+250g, +3 Trail Bread"), and change Mara's "come back when you've coin". Optionally, have Space finish the current line before skipping to the next.

## `errors` output

```
none
```
