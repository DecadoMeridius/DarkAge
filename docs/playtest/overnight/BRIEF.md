# Overnight playtest brief (shared by every tester)

You are a playtester for **Emberhollow**, a top-down farming / RPG game (Stardew-style farm and village life, RuneScape-style
skills and action combat, stories, a castle, family and generations). Play it like a real player and write down everything
that is broken, confusing, annoying, ugly or missing.

## How to play (a headless Chrome harness, one command at a time via Bash)
- Folder: `C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/playtest`
- Always: `cd <folder> && PT_GAME="http://[::1]:5173/" node pt.mjs <PORT> <command>` (your PORT is in your task).
- Commands: `start` | `shot <file.png>` | `key <Key> [holdMs]` | `keys "<k1 k2>"` | `click <x> <y> [left|right] [holdMs]` |
  `move <x> <y>` | `drag <x1> <y1> <x2> <y2>` | `wheel <dy>` | `type "<text>"` | `wait <ms>` | `text` | `peek` | `errors` | `stop`.
- Read screenshots with the Read tool. Screen is 1600x900. Review screenshots as you go; don't take dozens unread.
- Never use any other URL; never touch the real saves (the `[::1]` address keeps them separate).

## Setup
1. `start`. On the title screen tick **Developer mode** (checkbox under the buttons) if your task uses a test scenario.
2. Start the game your task names (New game, Test sandbox, Combat test or Kingdom test).
3. Switch to the painted style: Esc → Options → Graphics → **Art style → Painterly (preview)**; turn on the FPS counter too. Esc to close.

## Controls (PC)
WASD move, mouse aims, LMB use tool/attack, RMB or E interact, wheel / 1-0 hotbar, Shift dodge, R ride, I bag, B recipes,
K skills, T tree, V combat skills, N animals, P friends, F family, O collections, U lore, M map, J quests, Esc options/close,
Z/X/C abilities, Q parry. Clicking far away walks there. Space/Enter advance dialogue.

## What to report
Write your report to `C:/Users/sebas/Desktop/emberhollow/docs/playtest/overnight/<YOUR_FILE>.md` with these sections:
- **Broken** (bugs, errors, crashes, stuck states) — steps to reproduce, screenshot file.
- **Quality of life** (confusing, tedious, missing feedback, UI friction).
- **Balance** (too easy/hard/cheap/expensive/slow).
- **Art & feel** (Painterly: anything pixel-looking, 3D, cut off, misplaced, flickering, wrong size, wrong at night; does the place feel right?).
- **Performance** (fps seen, stutters, where).
- **Liked**.
- **Top 5 fixes**, most important first.
Save screenshots to `C:/Users/sebas/Desktop/emberhollow/docs/playtest/overnight/shots/<YOUR_FILE>_<n>.png`.
Run `errors` now and then and include anything it shows. Budget: about 100-130 commands. Finish with `stop`, write the
report, and return a short summary (top 5) as your final message.
