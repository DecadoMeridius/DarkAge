# Round 2 — Art & UI critic (Kingdom test)

Port 9303, about 115 harness commands. Screenshots are in the playtest scratchpad as `r2s3_<n>.png`.

## Summary
I never reached Briarholt. **The Empty Throne stalls at step 1.** The procession arrives with five knights, the herald and both wagons. It parks and then never counts as "arrived":
- The story marker (`!`) beside the herald only gives the prompt **"E Wait"**, and the toast keeps saying "Riders are coming up the village road...".
- Talking to the herald himself (RMB, or E from two sides) brings up the generic **guard** chatter, labelled `Guard / Royal Herald`. Examples: "Move along, citizen...", "Keep to the roads after dark...", "Captain Vey says we're to watch for strangers...".

I waited about 3 in-game hours (6:00 to 9:00+) and nothing changed. The farm's south-east tree gap stays shut and gives no message. I could not see the Briarholt sign there either. So the castle, the keep floors, the court and Kingsbridge were **not reviewed** this round. The art notes below cover the procession, the farm and the HUD.

## Blockers / story
1. **The herald is still an ally/guard NPC after the procession parks** (s8, s9, s10, s14, s17). His dialogue is guard lines, and the story herald never takes his place.
   - Suspects: the procession herald stopped one tile short of his parking spot, next to the campfire and the `!` (s6/s7). Or the "arrived" check waits on a wagon: both wagons parked on the grass beside the road, not on it (s20).
   - Fix: when the procession has been still for N seconds, swap the ally herald for the story herald. Also route `npcInteract` for `herald` to the story before ally lines.
2. **The `!` marker floats about a tile left of and above the herald** (s5–s19), over empty grass. Interacting there says "Wait".

## Art issues
| What | Where | Shot | Suggested fix |
|---|---|---|---|
| The player's full-plate helm in side view is a flat light-grey slab with one black slit and no ramp. It reads as a white rectangle and is brighter than every other metal in the scene. | Farm, facing left/right | s12, s17, s20, s26 | Give the side helm the same 3–4 step ramp as the front view: lit top-left, darker back of the head, a 1px darker outline, and a visor bump or rivet. Pull the base value down to match the knights' armour. |
| Player armour (bright flat grey) and the escort knights (shaded steel, purple tabards) look like two different art passes. | Procession | s7 | Use the knights' steel ramp for the player plate. |
| The knight captain's gold helm has a "T" visor that reads as a letter. | Procession | s6, s7 | Narrow the T into a cross-slit with a dark interior and add 1px of shading under the brow. |
| The wagon horses are small next to the wagons (horse head at about 60% of wagon height). The supply-wagon canopy is one flat brown with almost no ramp. | Wagons | s20, s21 | Scale the horse up by about 15% or the wagon down. Give the canvas a lit top-left fold and darker ribs. |
| Wagons park on the grass beside the road, not on it. | Village road / farm | s20 | Park them on the road tiles. |
| Grass tufts and weeds sometimes draw over the player's head or torso (a tuft at head height while standing still). | Farm | s28, s29 | Sort ground tufts by foot y, or always draw them under entities. |
| The campfire flame draws over the player's head when the player stands just above/behind it. The player also overlaps the campfire tile. | Camp | s14 | The campfire should be solid, or sorted by base y. |
| The tree-line gap fades its canopies when you walk in, but there's no sign, path or gate. It looks like you're walking into a wall of trees. | Farm SE | s33, s34 | Add the Briarholt signpost and a cut path or stumps so the closed way reads as a place. |

## UI issues
- **The tracker arrow points the wrong way.** It is drawn pointing down-right in almost every spot, whichever side the herald is on.
  - s21–s29: herald up-left, arrow down-right.
  - s31: herald north-west at 30 m, arrow down-right.
  - It only pointed correctly once (s30, straight up).
  - Fix: use `atan2(target - player)` for the rotation.
- The tracker label "Royal Herald · 45 m" overlaps the menu dock when you're near the right edge (s32). Clamp it to the play area left of the dock.
- **The Satchel title "SATCHEL"** renders the C-H pair as a strange glyph (looks like a merged CH ligature) in s4 and s15. Ligatures are still on for the title font; set `font-variant-ligatures: none` on the window titles too.
- The Map tab can't be scrolled with the wheel. There are two nested scrollbars and the bottom of the farm map is cut off (s15, s16). Use one scroll container, or fit the map to the panel.
- Kingdom test opens with "Getting started" (buy seeds, till...) above the stories in Quests (s4). The kingdom tester has to scroll past farming tasks. Put Stories first, or hide Getting started in the test.
- The interact prompt says "E Wait" (s5), which doesn't mean anything to a player. Use "The herald is still arriving..." or hide the prompt.
- The herald dialogue box's speaker line reads "Guard" above "Royal Herald" (s8), so the role label is wrong.

## Draw order / collision
- **Invisible wall:** for several in-game minutes, I could not move left (A) or up (W) from about 9 m south-east of the herald (s21–s29). D and S still worked. The world didn't scroll at all on A, even after a dash. After moving south about 3 tiles I was free again (s30).
  - It's most likely an invisible collider: the hidden story herald, or a knight's separation ring pushing me back.
  - While it happened, the tracker read "9 m" without changing, as if the target were stuck to me.
- The player and herald overlap with no separation at the campfire (s14).

## Looks great
- The title screen and the farm's ground textures, pines and round canopies are consistent and crisp, with no smoothing.
- The ruined greenhouse (broken panes, ivy, brick footing) is lovely.
- The royal wagon reads well: cream canopy, purple trim, pennant and gold crest.
- The escort knights' purple tabards and red plumes give the procession a clear royal colour identity.
- Menu dock icons and hotbar frames are readable; the pond shore foam is nice.

## Royal / full ideas
- Banners on the wagons, a drummer or trumpeter at the front, and petals or dust puffs as they pull in.
- The herald unrolls a scroll (a pose) when you talk to him; the knights turn to face you.
- The closed Briarholt gap: a fallen-log barricade with a royal notice nailed to it.

## Top 5 fixes
1. Make the parked procession hand over to the story herald (and stop the guard chatter on him), so The Empty Throne can start.
2. Fix the tracker arrow rotation, and clamp its label away from the dock.
3. Find the invisible collider near the parked procession that blocks A/W.
4. Re-shade the side-view plate helm (a ramp and outline instead of a flat white slab) to match the knights.
5. Turn off ligatures in window titles ("SATCHEL") and give the Map tab a single scroll container.

## `errors` output
```
none
```
