# Round 5: story player, aiming for chapter 4 and beyond

Persona: story player in "Kingdom test". About 135 harness commands. Screenshots are in the scratchpad `playtest/r5s1_*.png`.

## Summary (how far)
- **Chapters 1-3 of The Empty Throne are done.** Herald → Elias → Ashcombe's key → Briarholt → kitchen stove → Isolde ("I'll keep your secret") → treasury hoard (+5000g) → paid Ashcombe 30,000g → Isolde again (+2000g).
- **Chapter 4 ("Riders on the Road") started.** The journal says: "Find Captain Vey at the barracks in Kingsbridge. (in The Wilds)".
- **I did not reach Vey.** My command budget ran out about 50-58 m from him, in the forest north of the farm. Walking through the Wilds with the keyboard kept snagging on trees and bushes, and click-to-walk did nothing with the sword selected (see Bugs).
- Time was the real cost. Chapters 1-3 took about 110 commands, and most of those went on walking, not on story.
- `errors`: **none** all session.

## Bugs
1. **The tracker arrow often points the wrong way.** The label and distance are right, but the arrowhead is not.
   - In the village after Ashcombe, "to Briarholt Castle" pointed down into the southern tree line while the exit is west (r5s1_18/21).
   - In the kitchen, "The Empty Throne · 5 m" pointed down-right; the stove was up-left (r5s1_42).
   - In the great hall, "Princess Isolde · 18 m" pointed down-right; she was north (r5s1_44). In the throne room it pointed up when she was below me (r5s1_45).
   - In the Wilds, "Captain Vey · 59 m" pointed down-left (r5s1_94).
   - On the farm it pointed straight into the pond (r5s1_24). Outside Briarholt it pointed through the curtain wall instead of to the gate (r5s1_32-34).
   - Many arrows look like a fixed down-right cursor. It does not follow the walking route as described.
2. **Click-to-walk fails with a weapon selected.** LMB on open ground far away, with no enemies near, just swung the sword.
   - This happened outside the castle gate (r5s1_34) and in the Wilds (r5s1_97).
   - Right-click on a building or door did walk me there, which was the only reliable long-distance movement.
3. **The keyboard snags constantly.**
   - I stuck on a cottage corner in the village (r5s1_18/19, several tries).
   - I stuck on armour stands and benches in the keep (r5s1_88/89).
   - In the Wilds a small bush pinned me so that neither WASD nor clicks moved me (r5s1_95-97). I had to back off sideways.
   - Corner sliding seems weak against small round objects.
4. **The clock runs during dialogue and I collapsed mid-story.** I talked to Isolde from 1:30 to 1:50 am, and the 2 am collapse fired right after (r5s1_u1, u9).
   - There was no warning.
   - The morning report says "Someone carried you home… Sleep in your tent before 2 am next time", but the toast says "You wake in the royal bedchamber". The text contradicts itself.
   - The 350g fine landed right after a 30,000g purchase.
5. **Some court NPCs can't be talked to.** These were the robed elder and the farmer in a hat in the courtyard (r5s1_60/61), and the maid in the Solar (r5s1_83/84).
   - RMB and E did nothing and showed no prompt.
   - Guards do talk: "All quiet on the walls, my liege."
6. **Sprites overlap.**
   - The player stood inside Isolde's sprite while talking (r5s1_46).
   - The stove top was drawn over the player's head (r5s1_43).
   - The player was half-hidden behind the museum counter (r5s1_13).
   - A purple-robed courtier stood inside an armour stand (r5s1_88).
7. **The Isolde step was skipped by walking through the throne dais.** Walking north up the great-hall carpet put me *behind* the throne at the top wall (r5s1_45). The dais and throne don't seem solid from the south.
8. **The stairs are not on the keep maps** (Upper floor, Cellars). I had to search every floor for them. Inside the keep and cellar the tracker also vanished once the target was outside.
9. **The waystone window is a huge empty panel** for three rows (r5s1_66). It should be a small window.
10. **Space after a dialogue starts a new talk.** On the farm, extra Space presses opened the Knight-Captain: "You fight well, farmer. Have you thought about the oath?" That is an odd, spoilery chapter-10 hint in chapter 1.
11. **The Ashcombe deed purchase has no confirm step.** "Pay 30,000g" spent it at once. That is fine, but the brief expected a confirm.

## Confusing
- **The journal doesn't mention the treasury.** For the deed it says only "Buy Briarholt's deed from Lord Ashcombe (30,000g)". I had 26,500g. A real player wouldn't know about the 5000g hoard in the cellar unless Isolde or a hint mentions it.
- **The Briarholt waystone is easy to walk past.** It sits beside the road in, and you only attune by touching it. I missed it on the way in and had to walk back on foot later.
- **"Manor (land)" is confusing.**
  - The E prompt appears while standing at the crested manor door, but the label seemed to point at the neighbouring building.
  - The village map labels the building next to the Museum "Manor (land)".
  - I first took the urn-sign building for the manor.
- **Tracker labels name the story, not the object.** It showed "The Empty Throne · 33 m" when the target was the stove, so "Warm stove" would be clearer.
- **There is no tracker inside the keep cellar,** so I had to work out where the stairs were.

## Castle & court
- Before the deed, the courtyard had a robed elder and a farmer walking about, but neither responds.
- **After buying it the castle comes alive, which is a big improvement:**
  - Purple-and-gold door guards flank the keep. One says "All quiet on the walls, my liege."
  - Lookouts stand on the gate towers.
  - Two throne guards stand beside Isolde.
  - A maid in an apron walks the upper floor, and a purple-robed courtier stands in the entrance hall.
- You wake in the **royal bedchamber** (four-poster bed), which is lovely.
- The great hall tables are set with food but nobody eats at them. The kitchen had no cook while I was there, and I saw no scribe in the library.
- The NPCs that can't be talked to make the court feel like set dressing. One line each would do a lot.

## Story & dialogue (highlights)
- Herald: "You are the farmer who walked out of the mine with the Hollow King's crown in pieces? Good."
- Elias: "She fled the court when the crown began to hollow him out, and hid here as a farmer's wife."
- Ashcombe: "Look after her. I mean the castle. Obviously." He is the best character. Also: "…I didn't hear that. My hearing is terrible these days."
- Stove: "A pot of stew, a single bowl, and beside it a silver hairpin with a stag on it." This is a great hook.
- Isolde: "Hunters don't knock things over in kitchens." / "I would rather eat this hairpin." / "Margit would have said yes too, and then made me weed her beans."
- The chapter 4 hook (Nell, riders in Morcant's red asking for "a girl with copper hair") sets up the next arc well.
- The dialogue is short and witty, which suits the pace.

## QoL wishes
- Make click-to-walk work with any tool or weapon when the click is far from enemies, or add a walk modifier key. Better still, let the tracker auto-walk to its target.
- Add a "Travel to the nearest waystone" hint, or auto-attune waystones you walk past within about 3 tiles.
- Show stairs and doors on the interior maps.
- Pause the clock while a story dialogue is open, and warn at 1 am ("You're exhausted, find a bed").
- After paying the deed, offer "Rest here" or a bed in the keep before 2 am.
- Mark Kingsbridge's road on the ground better from the farm's north exit. The road splits and dead-ends in forest.

## Balance
- The Kingdom test gold (25,000 + 1,500 + 5,000 hoard) covers the deed with 1,500 left, which is about right.
- The 2 am collapse fine (350g) is harsh with only 1,500g left.
- Energy started at 60/120 the next morning after the collapse. That's fine.

## Looks
- The castle exterior (crenellated walls, towers with purple flags, gate arch, banners, glasshouses) is excellent. The night grade on the keep looks great.
- The keep interiors read well: checker floors, the purple carpet, portraits in the gallery, a four-poster bed and a wine cellar with racks.
- The treasury hoard reads clearly.
- The keep rooms are large and quite empty, especially the throne room and great hall, so walking through them is slow.
- The room-name overlays ("GREAT HALL", "THRONE ROOM") sometimes overlap the tracker label.

## Liked
- The procession and the herald scene, and the arc of the whole first three chapters.
- Waking in the royal bedchamber.
- The guards' "my liege" and seeing the court appear after the purchase.
- Ashcombe's lines and Isolde's voice.
- The treasury search toast: "Beneath the coins: Margit's old purse. +5000g, 3 ancient coins, 2 rubies."

## Top 5 fixes
1. **Tracker arrow direction:** point along the actual path, or at least at the target. It currently often points down-right or the opposite way.
2. **Click-to-walk with a weapon selected,** plus less snagging on bushes, stands and benches.
3. **Pause the clock during dialogue,** add a 1 am warning, and make the collapse text match where you wake.
4. **Make every visible court NPC talkable** (maid, elder, farmer, courtier). Also add a cook in the kitchen.
5. **Hint the treasury hoard** in the deed step or Isolde's lines, show stairs on keep maps, and make the waystone window small.

## errors output
`none` (checked three times during the session and at the end).
