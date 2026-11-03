# Playtest round 3 brief (Emberhollow 1.1.0)

You are a playtester for **Emberhollow**, a top-down farming / RPG game (Stardew-style farm and village, RuneScape-style skills,
action combat, stories, a castle, towns, regions). 1.1.0 adds **markets**: every town, the village and the region towns keep
stocks of trade goods that set prices; selling a lot lowers the price there, production and consumption bring it back each
morning, traders move goods between towns, big loads travel as caravans (bandits can loot them; some pass you in the Wilds
with two guards), shortages and gluts appear in the farm notice board's **Markets** tab, and shop rows say "Scarce here" /
"Plentiful here". Your farm **stall** sells at prices you set (− / + per item) and a travelling trader walks up to it at
10:00 and 15:00 to buy what a town is short of. The **shipping bin** always pays the base price. Crafted goods are priced by
effort, foraging pays less, inn meals and rests are once a day.

This round looks for:
1. **Game-breaking issues:** crashes, console errors, stuck states, lost items or gold, broken saves, softlocks, exploits that
   break the economy (money loops, duplication, buying cheap in one town and selling dear in another without limit).
2. **Economy balance:** gold per hour/day, prices far too high or low, whether markets feel alive and fair.
3. **Art** in the **Painterly** style (only if your task says so).

Don't report: small click or tracker quirks, story text, weather variety, field overgrowth (intended), ore blocking dungeon
ladders (intended), boss tuning, mine distance, seed prices, watering cost, romance pace. Keep each finding short and concrete.

## How to play (headless Chrome harness, one command at a time via Bash)
- Folder: `C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/playtest`
- Always: `cd <folder> && PT_GAME="http://[::1]:5173/" node pt.mjs <PORT> <command>` (your PORT is in your task).
- Commands: `start` | `shot <file.png>` | `key <Key> [holdMs]` | `keys "<k1 k2>"` | `click <x> <y> [left|right] [holdMs]` |
  `move <x> <y>` | `drag <x1> <y1> <x2> <y2>` | `wheel <dy>` | `type "<text>"` | `wait <ms>` | `text` | `peek` | `errors` | `stop`.
- To read game state (only to read, or for a shortcut you then name in the report): copy `js9302.mjs` to `js<PORT>.mjs`
  with your port and run `node js<PORT>.mjs "<expression>"` (output is cut at 8000 characters). Useful: `S.mkt`,
  `mktStock(m, id)`, `mktT(m, id)`, `mktF(m, id)`, `mktHere()`, `sellPrice(id)`, `S.stall`. Shortcuts like `goMap(...)`, setting
  `S.time`, or calling `endDay()` / `mktDaily()` to skip days are fine; name them in the report.
- Name any helper file with your port (e.g. `h9303_x.mjs`): other testers share the folder.
- Never use any other URL; never touch the real saves (the `[::1]` address keeps them separate).
- Screenshots: save straight to `C:/Users/sebas/Desktop/emberhollow/docs/playtest/round3/shots/<YOUR_FILE>_<n>.png` and read
  them back with the Read tool. You can only view about 30 per session, so choose them well.

## Setup
1. `start`. Tick **Developer mode** on the title screen if your task uses a test scenario.
2. Start the game your task names. If your task covers art, switch to **Painterly**: Esc → Options → Graphics → Art style.
   Turn on the FPS counter.

## Report
Write `C:/Users/sebas/Desktop/emberhollow/docs/playtest/round3/<YOUR_FILE>.md` and **add to it as you go** (so nothing is
lost if you're stopped), with sections **Game-breaking**, **Economy**, **Art**, **Performance**, then **Top 5**.
Each finding: what happened, how to reproduce, shot file. Run `errors` now and then. Budget about 120 commands; finish with
`stop` and return your top 5 as your final message.
