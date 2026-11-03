# Playtest round 2 brief (Emberhollow 1.0.0)

You are a playtester for **Emberhollow**, a top-down farming / RPG game (Stardew-style farm and village, RuneScape-style skills,
action combat, stories, a castle, towns, regions). This round looks for three things only:
1. **Game-breaking issues:** crashes, console errors, stuck states (can't move, can't progress a story, can't leave a map),
   lost items or gold, broken saves, softlocks, exploits that break the economy (money loops, duplication).
2. **Economy balance:** what things cost and earn. Note gold per hour/day, prices that are far too high or low, purchases
   that are impossible to afford or trivially cheap, money loops.
3. **Art:** in the **Painterly** style. Anything broken, pixel-looking next to the painting, 3D, cut off, misplaced,
   flickering, wrong at night or in winter.

Don't report: small click or tracker quirks, story text, weather variety, field overgrowth (intended), ore blocking dungeon
ladders (intended), boss tuning details. Keep each finding short and concrete.

## How to play (headless Chrome harness, one command at a time via Bash)
- Folder: `C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/playtest`
- Always: `cd <folder> && PT_GAME="http://[::1]:5173/" node pt.mjs <PORT> <command>` (your PORT is in your task).
- Commands: `start` | `shot <file.png>` | `key <Key> [holdMs]` | `keys "<k1 k2>"` | `click <x> <y> [left|right] [holdMs]` |
  `move <x> <y>` | `drag <x1> <y1> <x2> <y2>` | `wheel <dy>` | `type "<text>"` | `wait <ms>` | `text` | `peek` | `errors` | `stop`.
- To read game state (only to read, or for a shortcut you then name in the report): copy `js9302.mjs` to `js<PORT>.mjs`
  with your port and run `node js<PORT>.mjs "<expression>"` (output is cut at 8000 characters).
- Name any helper file with your port (e.g. `h9303_x.mjs`): other testers share the folder.
- Never use any other URL; never touch the real saves (the `[::1]` address keeps them separate).
- Screenshots: save straight to `C:/Users/sebas/Desktop/emberhollow/docs/playtest/round2/shots/<YOUR_FILE>_<n>.png` and read
  them back with the Read tool. You can only view about 30 per session, so choose them well.

## Setup
1. `start`. Tick **Developer mode** on the title screen if your task uses a test scenario.
2. Start the game your task names. Switch to **Painterly**: Esc → Options → Graphics → Art style; turn on the FPS counter.

## Report
Write `C:/Users/sebas/Desktop/emberhollow/docs/playtest/round2/<YOUR_FILE>.md` and **add to it as you go** (so nothing is
lost if you're stopped), with sections **Game-breaking**, **Economy**, **Art**, **Performance**, then **Top 5**.
Each finding: what happened, how to reproduce, shot file. Run `errors` now and then. Budget about 120 commands; finish with
`stop` and return your top 5 as your final message.
