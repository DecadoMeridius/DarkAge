# Night playtest, round 3: story player (Kingdom test)

Persona: the story player, moving fast. About 130 harness commands, headless Chrome on `[::1]`. Screenshots are `r3s1_*.png` in the session scratchpad `playtest/` folder.

## Summary (how far I got)
I reached **The Empty Throne, chapter 3, last step**: "Tell Isolde that Briarholt is yours. (in Briarholt Keep)". I ran out of command budget walking back to the keep, so I never saw the court after buying the deed, Captain Vey or Kingsbridge.

Steps completed, all on in-game day 1:
1. Herald procession on the farm. Talked to the Royal Herald.
2. Elias at the museum. He showed the journal page with Margit's seal.
3. Lord Ashcombe at the manor. He handed over the key.
4. Briarholt grounds through the farm's south-east trees, then the keep.
5. Searched the kitchen hearth: a warm stove and a silver stag hairpin.
6. Princess Isolde in the throne room. I chose "I'll keep your secret." and got +1,500g for the chapter.
7. Treasury hoard in the cellar: "Beneath the coins: Margit's old purse. +5000g, 3 ancient coins, 2 rubies."
8. Sold 6 Country Bread at the tavern to get past 30,000g.
9. Bought the deed from Ashcombe. I was left with 91g.

No softlocks, and `errors` reported **none** for the whole run. The story flows well. The friction is in finding things: tracker arrows, walls and gates, interact spots, and NPCs that won't stop to talk.

## Bugs
1. **Space or Enter after a story dialogue opens the building's shop window.** Pressing Space to advance Ashcombe's last line ("Mind the brambles.") and then Space again opened the full Ashcombe Manor land window, with orange **Buy** buttons for plots. Elias's dialogue did the same with the Museum window. Since Enter "presses a window's main button", mashing through dialogue could buy a 13,400g plot. Fix: swallow keys for a moment after a dialogue closes, or don't reopen the door's menu after a story talk. (r3s1_f6, r3s1_e6)
2. **The 30,000g deed is taken without confirmation, before the dialogue offers it.** Gold dropped from 30,091 to 91 on the first line ("The princess? At Briarholt? ...I didn't hear that"). Only the second line says "Thirty thousand, and Briarholt is yours." There is no confirm step for the biggest purchase in the game. (r3s1_82)
3. **The tracker arrow points in a straight line and ignores walls.** In the castle grounds, "to Briarholt Keep" pointed **up** (north, toward a solid wall) the whole way down the west road. The way in is south, then east, then north through the gate. Leaving the keep, "to Emberhollow Village" pointed up-left into the curtain wall. The same thing happens on the farm, where it points across the paddock fence. Point at the next exit or gate on the path instead. (r3s1_28, r3s1_30, r3s1_67)
4. **The tracker label covers other text.** "The Empty Throne · 26 m" covers the "GREAT HALL" room title (r3s1_41) and sits on top of "THRONE ROOM" (r3s1_52). Over the village it covers door signs and the tent.
5. **The castle steward can't be talked to.** He paces the courtyard. Right-clicking him twice walked me to the keep door instead. Pressing E right next to him did nothing, and he walked through my character. "A clicked villager waits" (`n.waitT`) didn't seem to apply to him. (r3s1_34 to r3s1_37)
6. **The kitchen story object is hard to trigger.** The "!" floats beside the hearth. Right-clicking the "!" did nothing, and pressing E facing it did nothing. Right-clicking the hearth opened **Kitchen recipes** (Grilled Fish...) instead of the story. The story's "Search" only appeared from one tile, partly inside the hearth's front, where the player sprite overlaps the hearth. The brief said the object "glints gold", but I saw no glint, only the "!". (r3s1_45 to r3s1_48)
7. **The tracker names Isolde before you meet her.** As soon as the kitchen scene ends, the label reads "Princess Isolde · 29 m". That spoils "find who hides in the throne room". Use "Someone in the keep" until you've met her. (r3s1_49)
8. **Isolde disappears right after her scene.** When I closed her dialogue she was gone from the throne room. The next step later says "Tell Isolde that Briarholt is yours (in Briarholt Keep)", so I hope she comes back. I couldn't verify it.
9. **Doorways in the cellar catch you.** Walking east from the wine cellar into the Treasury Vault stopped dead at the wall twice (r3s1_59). I had to step up a few pixels to fit. Right-clicking the gold pile from across the doorway also did nothing.
10. **Holding a seed packet indoors gives "Till the soil first."** I clicked the floor in the keep to walk there with slot 8 (seeds) selected. I walked, but got that toast. With seeds in hand, left-click on a floor that can't be tilled should just say "Walk".
11. **The HUD dock hides the player at the map's east edge.** On the farm's east side the camera stops scrolling and my character stood under the Options/Collect dock tiles (r3s1_71). The tracker label was cut off ("to Emb...").
12. **The keep map has no room names and no "You" marker in view.** M inside the keep shows grey boxes and the "!". I couldn't tell which box was the kitchen or where I was without scrolling. (r3s1_40)

## Confusing
- **The arrow glyph.** It's a chevron that often reads as pointing at your head rather than away from you. Combined with bug 3, I couldn't trust it and switched to the map (M) every time.
- **Getting into the castle grounds.** You arrive on a road on the west side, outside the curtain wall. The keep is east but walled off. The ground map doesn't draw the walls or the gate, so it looks like you can walk straight to the keep. Draw walls and the gate on the castle map.
- **"Riders in purple and gold are coming"**, but the procession arrives on foot. I saw no horses and no wagons, although the design mentions two wagons.
- **The herald vanishes instantly** after his last line, and his knights walk off.
- **The village blocks you behind buildings.** You come out of the museum or manor onto a strip of grass between a building and the tree line. Walking "north" runs into the building, and the only ways out are thin cobble paths between houses.
- **The kitchen `Get` / `Get ×5` buttons** show in the Kingdom test because it's a sandbox. A real player won't see them, so that's fine.

## Castle & court
- **Exterior: genuinely royal.** The ashlar keep has purple stag banners, a gatehouse with a portcullis arch, vines and corner towers. The courtyard has a fountain, benches, lamps, a well, topiary and flower beds, and there are glasshouses. In the evening grade, with the lamps lit, it's lovely (r3s1_33, r3s1_67). Clear highlight.
- **Curtain wall.** The towers and wall-walk look good. The gate arch is tiny for a royal gate: about one character wide, drawn as a small dark arch in a flat wall.
- **Interior: full of furniture, empty of people.**
  - Entrance hall: suits of armour, pillars, candelabra and a carpet.
  - Great hall: long laid tables with roast fowl.
  - Kitchen: hearth, stoves, shelves of jars, barrels.
  - Wine cellar: racks.
  - Treasury: chests, gold piles, a rug.
  - Throne room: a big tapestry of the castle, a throne, candelabra and armour stands.
- **The throne** stands in the middle of a very large, bare floor rather than on a dais against the back wall. The room feels like a gym hall. A dais, a step, banners behind the throne or a second rug would make it read as a throne room.
- **The carpet** from the entrance hall into the great hall breaks at each doorway (r3s1_51).
- **Court before purchase:** a gardener in a straw hat outside and a steward in a long robe. Both were only walking, and the steward wouldn't talk. Inside the keep I met **no one** except Isolde. The great hall's laid tables with nobody at them feel eerie. That's maybe right for an abandoned castle, but it doesn't feel "alive".
- **Court after purchase:** not reached (budget).
- **Treasury chests** open the Bank/Storage window. That's useful, but surprising: I expected loot.
- **Searching the hoard twice** gives "Old coins and a few dull gems. You've already taken what matters." That's a good line. The second gold pile in the vault did nothing.

## Story & dialogue
Liked a lot. It's short, warm and funny, and each scene ends on a clear next step.
- Herald: "You are the farmer who walked out of the mine with the Hollow King's crown in pieces? Good." A great cold open.
- Elias: "Margit wasn't just a farmer. She was the king's younger daughter." A clean reveal.
- Ashcombe: "my gamekeeper swears he saw smoke from the castle chimneys last week." This sets up the kitchen nicely.
- Kitchen: "A pot of stew, a single bowl, and beside it a silver hairpin with a stag on it." Evocative.
- Isolde:
  - "Hunters don't knock things over in kitchens."
  - "I would rather eat this hairpin."
  - "...and then made me weed her beans."
  - All three are charming.
- Ashcombe again: "The princess? At Briarholt? ...I didn't hear that. My hearing is terrible these days." / "Look after her. I mean the castle. Obviously." The best lines of the run.
- Small points:
  - The herald says the capital is **Kingsholt**, but the town list has **Kingsbridge**. If these are different places, that's confusing. If the same, it's a typo.
  - Isolde's choice ("I'll keep your secret." / "The council is looking for you.") is the only choice so far. Good. It would be nice to see it matter later.

## QoL wishes
- An "Open map to target" button on the tracker, or a dotted route.
- Room names and a "You" dot on interior maps.
- A confirm window for the 30,000g deed that shows "You have X / 30,000".
- Don't open the shop or door menu after a story conversation ends.
- A visible glint or sparkle on story objects. The brief said gold, but I couldn't see one.
- A waystone near Briarholt's gate. The walk from the keep to the village takes 1-2 in-game hours each way.
- The quest text says "(in Emberhollow Village)". Name the building instead: "Ashcombe Manor, south row".

## Balance
- Start 23,000 + 1,500 (Isolde chapter) + 5,000 (hoard) = 29,500. That's still 500 short, so I sold 6 Country Bread at the tavern. The first sold for 100g, then less each time; six brought 591g in all. Selling 20 starter Country Bread (worth about 2,000g) makes the gap trivial in the Kingdom test, so the "earn it with town jobs" intent is bypassed. In a real save this gap is fine.
- The tavern charges 144g for Country Bread and 682g for Miner's Pie. That's expensive, but it's evening and the Kingdom test may skew prices.
- Time: the whole day-1 run went from 6:00 am to midnight. Most of it was walking between the farm, the village and the castle. The story beats themselves are quick.

## Looks
- The castle exterior, village night lights (lit windows, lanterns), evening amber grade and throne-room tapestry are all excellent.
- Isolde's portrait (crown, red hair, purple gown) is clearly a princess. The herald's purple and gold uniform matches the banners. Nice cohesion.
- The leading knight's gold "bucket" helm with a red plume looks like a box (r3s1_4/5).
- The steward and gardener sprites read well.
- In the kitchen, the player sprite overlaps the hearth front when standing on the "Search" tile.
- Interior vertical walls are plain black strips, while horizontal walls have brick faces. The keep plan looks a bit like a diagram from above.

## Liked
- Dialogue writing and pacing. Every beat ends with "who to see next".
- The kitchen to throne room mystery beat.
- The castle facade and courtyard.
- The treasury's "Margit's old purse" twist.
- Dialogue pauses the game, and portraits show.
- The village and castle look great at night.
- No JS errors at all.

## Top 5 fixes
1. **Swallow Space/Enter after a dialogue closes**, and don't reopen the door's shop menu after a story talk. One Space press opened the manor's land-buying window, and Enter "presses a window's main button" (Buy).
2. **Confirm the 30,000g deed purchase**, and charge it when the line offering it is shown, not before.
3. **Make the tracker route-aware**: point to the next gate or exit, not through walls. Don't overlap room titles.
4. **Make story objects clickable where the marker is.** Right-clicking the "!" or the hearth should run the story step, not open kitchen recipes. Add the gold glint.
5. **Let castle NPCs stop and talk** (steward, gardener). Put someone in the empty keep before the purchase too: Isolde glimpsed fleeing, a cat, a ghostly servant.

## `errors` output
```
none
```
