# W2: robustness and settings (port 9303, `[::1]` only)

I ran about 110 harness commands, with Painterly on and the FPS counter on. To read state I used a small eval helper (`js9303.mjs`). That let me fingerprint the save (gold, backpack, soil and crops, a hash of the farm's objects, position, time, hotbar) and compare it before and after each save and load.

There were no crashes and no console errors in the whole session. The only failed request was `favicon.ico` (404). In every save/load round trip I compared, gold, items, crops, soil and placed fences came back exactly the same.

## Broken

1. **On the title screen's Load game list, each slot's details are drawn on top of the hint line at the bottom of the screen.** The details are "Spring 1, year 1 · 500g · saved …".
   - Steps: make 2 saves → Esc → Load another save. Look at the bottom of the screen: both slots' `<small>` captions sit at the same spot (646, 776, `position:absolute`, inside `.rtxt`). They overlap each other and the "WASD to move…" hint, so the line is unreadable. The rows themselves only show the name.
   - Shots: W2_robust_9.png, W2_robust_14.png.
2. **The key-bindings popup comes back after Esc.** With Options → Key bindings… open, Esc closes the Satchel and hides the popup. The next time you open Options (Esc), the popup is back on top. Only **Done** really closes it, even though the popup says "Esc always closes windows". Shot: W2_robust_24.png.
3. **Rebinding to a key that's already used gives no warning and silently kills the other action.** I bound Ride to `I`: the list then showed both Ride and Backpack on `I`. In game, `I` only said "Buy a horse from Odile…" and the bag never opened. Shot: W2_robust_18.png.
4. **"Save game" and "Save and quit" disagree.** Inside a shop room (`in_store`) or a mine, Options → Save game refuses with "Return to the surface to save." (odd wording inside a village shop). But **Save and quit to title** (`quitToTitle`) saves anyway, and Continue then puts you on the farm by the tent, not in the village or at the mine.
   - The progress is kept, so this is generous, but the two buttons are inconsistent.
   - A save in the Wilds reloads at the exact spot.
5. **The save-slot list reorders by last save, and two "Delete? Click again" buttons can be armed at once.** I clicked where "Second" had been and armed Robusta's delete instead. The two-click confirm saved it, but the armed (wider) button also shifts that row's Load button out of line with the other rows. Shot: W2_robust_14.png.

## Quality of life

- **Nothing is saved when the window closes or the page reloads.** No `beforeunload`/`pagehide` handler exists, and `electron/main.cjs` just quits. Everything since the last save is lost, up to 5 minutes since autosave. I reproduced it: I walked and gained 7g, reloaded, and both were gone.
  - Suggest saving on `pagehide`, or Electron `close` → `__save()`.
- **Options page layout:**
  - "Load another save / Save and quit" and "Combat: Action/Classic" sit above the Sound section with no heading.
  - "Music: on / Sound: on" toggles duplicate the volume sliders.
  - "Delete save" is the last item, under How to play.
  - "Painterly (preview)" still says preview.
- **Continue doesn't say which save it loads.** It loads the most recent, by name nowhere on the button.
- **Hotkeys while paused:** I opens nothing, and Esc unpauses instead of opening Options.
- **The key-help panel (H) comes back after every load.**
- **Ashcombe's intro arrives a few seconds after Begin.** Keys pressed in that time are lost, and you can walk off before he arrives.
- **HUD overlap:** in combat, the Focus bar covers the left edge of the Z/X/C ability bar (a stray "Z" box). Enemy health bars near the bottom-left are hidden behind the key-help panel. Shot: W2_robust_23.png.

## Balance

- Nothing in scope.
- My teleport sweep test dropped me on the coast at night next to a level 23 Drowned Pirate. It took me from 100 to 30 HP while I was spamming keys. It was an artefact of the test, but that coast is near the south roads.

## Art & feel

- **Style switching:** I switched Pixel ↔ Painterly 4 full times. I saw no blank or invisible sprites, the frame rate was unchanged (median 7.6 ms), and the JS heap stayed between 24 and 42 MB. Shot after the switches: W2_robust_19.png.
- **Zoom:** at 8x, the spring petal particles become large flat pale squares that read as debris on the painted grass. Shot: W2_robust_16.png.
- The top edge of the farm shows the mirrored edge-chunk strip (tree roots upside-down, a dark band) at 2x and 4x. Shots: W2_robust_15.png, W2_robust_19.png.
- The greenhouse ruin still looks pixel-blocky next to the painted tent and chest.

## Performance

| Test | Frame time (median / p95) | Hitches | Game work per frame | JS heap |
|---|---|---|---|---|
| Walking the Wilds, about 75 s and 9,800 frames | 7.6 / 8.5 ms | 5 frames over 33 ms; worst 254 ms and 180 ms, with 18-21 ms of game work | median 1.9, p95 5.8, max 22 ms | steady at 42 MB |
| Second walking run, 90 s | 7.6 / 8.5 ms | one 195 ms frame | – | – |
| Fast sweep at 250 px/s (about dragon-flight speed), 25 s | 7.9 / **15.6 ms** | 13 frames over 20 ms; worst **436 ms** at the start | p99 15.6 ms | 35 → 91 → 142 → 131 → 149 MB over 4 sweeps |

- Holding one key for 9 s in the Wilds mostly ends against water or trees, so walking alone barely loads new chunks.
- In the fast sweep, the heap levels off at roughly 130-150 MB. `CHUNK` stays capped at 72 and `CHUNK_JOBS` around 76-85.
- **`HC` (character sprites) is never trimmed.** It grew to about 1,240 canvases for 60 people, but that is only about 10 MB.
- Going to another map frees the heap (back to 43 MB).
- Crossing maps: 24 `goMap` calls between farm, village and Wilds took 0-8 ms each, with no errors, and the farm state was intact afterwards.
- **Menu spam:**
  - About 40 menu keys at 150 ms apart: no errors.
  - 400 random hotkeys at 15-45 ms apart, mixed with random LMB/RMB clicks: no errors and no stuck window or pause.
- **Pause:**
  - The Pause key and the Pause button both stop the clock (0.00 change over 2 s).
  - Blur (alt-tab) pauses, and focus stays paused until you click: correct.
  - Options open also freezes the clock.

## Settings checked

All of these work and are remembered after a page reload (`emberhollow_settings`):
- Volumes: master 0 sets that bus's gain to 0; music 100 sets its gain to 1.2.
- Zoom: Auto, 2, 4, 6 and 8 (`pixZoom` 2/4/6/8).
- Particles: Full, Low and Off (`PARTICLE_K` 1 / 0.4 / 0).
- FPS counter: on and off.
- Fullscreen toggles on and off, including in headless Chrome.
- Cursors: all 5 apply a CSS cursor.
- Combat: Action ↔ Classic.
- Rebinding: Move up → ArrowUp worked, and W was then suppressed. Reset works.

## Saves (all OK unless listed above)

- New game → play → Save and quit → **Continue**: identical state.
- A second New game went into slot 2 (a new world seed) and did not overwrite slot 1.
- **Load another save** → load slot 1: identical.
- Autosave fires at 500 ticks with an "Autosaved." toast and writes the new gold.
- Page reload → Continue: identical to the last save.
- Deleting from the title list takes two clicks and removes both `slot_2` and `slot_2_bak`. Options → Delete save takes three clicks, removes the slot and goes back to the title.
- Where you wake after loading: Wilds → same spot; shop room → farm by the tent; mine floor 3 → farm by the tent.

## Liked

- Saving is solid: every round trip was exact, and the `_bak` copies and slots are clean.
- No errors in any stress test.
- Style switching is live and doesn't leak.
- The frame rate holds 130 fps while walking.

## Top 5 fixes

1. **Save on close or reload** (`pagehide` / Electron `close`). Right now up to 5 minutes of play are silently lost.
2. **Load-game list:** show each slot's day, gold and time inside its row. They currently stack, absolutely positioned, on the hint line at the bottom.
3. **Key rebinding:** warn about or swap conflicting keys. A clash silently disables an action (Ride on `I` killed the Backpack).
4. **Key-bindings popup:** close it on Esc and when the Satchel closes. It reappears every time Options opens until you press Done.
5. **Make Save game and Save and quit consistent** inside rooms and mines (both save, or both refuse). Also look at the 200-440 ms hitches when moving fast through the painted Wilds (the fast-sweep p95 is 15.6 ms), which will show when flying the dragon.
