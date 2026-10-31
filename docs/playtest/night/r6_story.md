# Round 6 – Story player, chapters 4-6 (Kingdom test)

## Summary (how far)
- Played the Kingdom test through **The Empty Throne chapters 1-3**, then reached **chapter 4 (4/13, "Riders on the Road")**: found Captain Vey at the Kingsbridge barracks and took the patrol job. I did not get to ride with a patrol, reach the hunters' camp (ch 5) or Saltmere (ch 6). The ~150-command budget ran out.
- Chapters 1-3 took about 110 commands, not the ~50 I aimed for. The main causes:
  - The tracker arrow often pointed the wrong way.
  - The Briarholt grounds are hard to walk.
  - I was 1,000g short for the deed (see Bugs 1).
- The session also sat idle for a while during a pause on my side. In that time the game ran past 2 am on the farm and I collapsed. That cost 2,500g, which is why I ended up short.
- `errors`: **none**.

## Bugs
1. **Collapse fee can soft-block chapter 3.**
   - The Kingdom test starts with 25,000g. The deed costs 30,000g, and the treasury hoard gives 5,000g, so the budget is exact.
   - One collapse ("Someone carried you to bed and took 2,500g for the trouble") left me at 29,000g after the hoard.
   - I had to sell the hoard's 2 rubies and 3 ancient coins at Mara's to reach 30,420g.
   - A real player with no spare loot is stuck. Suggestions: lower the price, raise the hoard, or have Ashcombe accept a small IOU.
2. **The tracker arrow points the wrong way, often.** Seen many times (r6s1_7, _8, _39, _64, _76, _91):
   - In the village it pointed north-west toward "Elias" when the museum is south-east.
   - In the throne room it pointed up-left at "Princess Isolde · 7 m" while she stood down-right (r6s1_39).
   - Just after the waystone hop to the village it pointed up-left to "Lord Ashcombe · 29 m" (manor is south).
   - In Kingsbridge it pointed left while the barracks door was straight below me (r6s1_91).
   - Outside Briarholt's south wall it pointed east past the gate that was behind me (r6s1_76).
   - The distance number is useful. The arrow is not, or it follows a "route" that does not match where you can actually walk.
3. **The tracker label sometimes shows the story name, not the target.**
   - Inside the keep it read "The Empty Throne · 33 m", then 24 m, then 27 m (r6s1_31-33). That was the kitchen step, and walking north made it worse.
   - Later steps showed "Princess Isolde · 19 m" and "Captain Vey", which is clear. Steps that point at objects should name the object ("Kitchen stove").
4. **Esc and J are not blocked during a choice dialogue.**
   - At Isolde's "Will you keep my secret?" choice, pressing J then Esc opened the Satchel's Options tab *behind* the dialogue (r6s1_42-43).
   - I had to pick the answer by clicking over the Options window.
5. **Several sprite overlaps:**
   - Kitchen: the player is drawn inside the stove, which covers his head (r6s1_37).
   - Throne room: the player stood on top of Isolde's head while talking (r6s1_40).
   - After the waystone hop the player stands inside the village waystone (r6s1_64).
   - Village plaza: the well's roof is drawn over the player's head while he stands in front of it (r6s1_7).
6. **Walkable tree lines.**
   - Twice in the village (south of the museum and the manor) and twice south of the Briarholt walls, WASD walked me *into* the tree line, with the trees fading around me (r6s1_14, _68, _75).
   - On the castle map's west edge I also ended up deep in the trees (r6s1_61).
   - This looks like leftover gaps or exits with no purpose.
7. **Walked into a wall in the cellars.** Pressing W in the treasury vault put me inside the dark wall band between the cellar rooms (r6s1_53).
8. **The museum shop opens right after the story dialogue.**
   - After Elias's last line, the museum donation window opened by itself (r6s1_d6).
   - This is harmless but surprising. Ashcombe's land window did the same after his lines.
9. **Two different patrol counters.**
   - The barracks job reads "Fight beside a knight patrol until they've felled **5** monsters".
   - The journal step reads "(0/**6** monsters felled together)".
   - Pick one number.
10. **The camera is off-centre near map edges** (farm east edge r6s1_6, castle west edge r6s1_61): the player sits far to one side. This is probably edge clamping, but it hides the way ahead.

## Confusing
- **The Briarholt waystone is easy to miss.** The brief said "a few tiles east of where you arrive". It actually sits west of the road, near the north-west corner. I only found it on the way out (r6s1_62). Neither the castle map nor the farm map shows waystones (only the Wilds map does). The farm map does not mark the castle gap or sign either.
- **Getting from the arrival road to the keep is a maze.**
  - You arrive on a road outside the west curtain wall. The only way in is the south gate.
  - My first click-to-walk led to the training yard, then the West Glasshouse ("Locked · West Glasshouse"), then a fountain that blocks the keep road.
  - I walked through the courtyard about four times over the session.
- **The castle map does not show the walls or the gate**, so you cannot plan the route in.
- **I could not find the cellar stairs from the map.** They are in the east part of the entrance hall, and the grand stair up is in the west. Neither is labelled on the keep map.
- **Kingsbridge at night:** the Crowned Stag counter worked at 1 am ("Sleep here until morning (120g)"), which saved me. But the barracks next door has beds with no prompt, and the 1 am warning gives no hint that the inn is a choice.
- **Sell "All" has no confirmation.** I sold my rubies and coins in one click. Fine for me, risky for gems.

## Story & dialogue (highlights)
- **Elias:** "A herald? Then it's time I showed you this. The last page of your grandmother's journal…" and "She fled the court when the crown began to hollow him out, and hid here as a farmer's wife." A strong hook.
- **Ashcombe:** "So the curator finally worked it out. Yes. I've kept Briarholt's keys for forty years. Margit made me promise." Lovely. Later: "Thirty thousand for Briarholt: walls, glasshouses, the keep and all its keys. Shall we settle it?"
- **Kitchen** (italic narration): "The kitchen stove is still warm. A pot of stew, a single bowl, and beside it a silver hairpin with a stag on it." A great clue beat.
- **Isolde:**
  - "Stop right there! …Oh. You're not one of Morcant's hunters. Hunters don't knock things over in kitchens."
  - "The council means to marry me to Duke Morcant and rule through him. I would rather eat this hairpin."
  - "Thank you. Truly. Margit would have said yes too, and then made me weed her beans."
  - She is the best-written character so far.
- **After the deed:** "And Morcant's hunters will come for me. When they do, we'll be ready for them." This line also adds two knights to the throne room.
- **Vey:** "Briarholt? The old summer castle? Who lives there now… no. Don't tell me. Better I don't know." His greeting: "Wolves, bandits, worse. The Wilds grew teeth while the crown was hollow."
- **Hollis** at the Crowned Stag: "Knights drink here on their way north. Keep your voice down near the corner table." The rumour: "A wagon of royal silver went missing on the Greyhelm road." A nice seed.
- **Dialogue text is not in the page text** (the harness `text` command did not see it). I had to read every line from screenshots. That may also matter for screen readers.
- **Space skips too fast.** Holding or repeating Space skipped the whole herald conversation before I could read any of it, with no way to replay it. A "previous line" option or a log would help.

## Castle & court
- **Exterior:** the keep looks great: the gatehouse with portcullis, banners, ivy on the tower, flower beds, the well and topiary. The courtyard has a fountain, benches, lamp posts, a training yard with dummies, archery targets, striped tents and an armour stand. The glasshouses with fruit trees inside are charming.
- **Interior:** the throne room is great: a dais, a carpet, two candelabra, armour stands and a castle tapestry. The great hall has long banquet tables. The kitchen, armoury, wine cellar and treasury all read well.
- **Room names** fade in as you enter ("GREAT HALL", "THRONE ROOM", "KITCHEN"). Nice, but they overlap the tracker label (r6s1_32, _33).
- **The court comes alive** after chapter 3: two purple knights flank the throne. An old robed man walks the courtyard; it was not clear who he is, and he has no name plate.
- **The treasury has two hoards.** Only one could be searched; the other did nothing visible. The two chests are empty storage. The hoard message: "Beneath the coins: Margit's old purse. +5000g, 3 ancient coins, 2 rubies."

## QoL wishes
- Fix the arrow direction, or replace it with an arrow that points at the next doorway or exit on the route.
- Show waystones (and the castle gap and walls) on local maps.
- Put a waystone right outside the keep door, or say "Waystone: north-west of the grounds".
- Lock the Satchel hotkeys while a story dialogue is open.
- Add a dialogue log, or "Back" on lines.
- Let the barracks beds work as a rest spot for story players who arrive late.
- A "Return to keep" shortcut when you use the Briarholt waystone.

## Balance
- The deed money is too tight for the Kingdom test (see Bugs 1).
- Inn takeaway prices look very high next to the starting purse: Harvest Roast 972g, Knight's Feast 1,959g, Layer Cake 1,534g. A hot meal is 40g and a bed 120g, which is fine.
- Collapsing costs 10% of your gold (2,500g of 25,000g). That is heavy for an early rich-start test save.
- **Combat:** a night slime in the Wilds south-west of Kingsbridge died in about 2.5 s of held LMB with the starting sword. I took 5 damage. Fine.

## Looks
- Night grading and rain look good. Kingsbridge at night has lit windows and lantern posts.
- Town signposts float a readable list, "Greyhelm ↗ · Ashford ↖ · Saltmere ↗ · Emberhollow ↙". Excellent.
- The Wilds map shows the towns with building labels (Barracks, Inn, Temple, Hall, Forge) and a purple patrol marker. Very helpful.
- **Sprite overlaps:** see Bugs 5.

## Liked
- The herald's procession arriving on the farm with knights in purple.
- How tightly the Elias, Ashcombe, Isolde chain is written.
- Talking at the manor door without going in.
- The throne room and the castle's scale.
- The waystone travel menu: clear, with "You are here".
- Town signposts and the regional map.

## Top 5 fixes
1. Fix the tracker arrow's direction, and name the target object in the label rather than the story title.
2. Make chapter 3 affordable after a collapse: raise the hoard or lower the deed price, or offer credit.
3. Block Satchel hotkeys (Esc, J…) while a story dialogue or choice is open.
4. Make the way into Briarholt obvious: put the waystone near the arrival road or the keep, show walls, the gate and waystones on the local map, and clear the fountain that blocks the keep road.
5. Close the walkable gaps in the tree lines and the cellar wall, and fix the draw order (stove, waystone, NPC overlaps).

## `errors` output
```
none
```
