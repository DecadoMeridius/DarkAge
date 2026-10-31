# Playtest round 2: story player (The Empty Throne, Kingdom test)

Screenshots: `C:/Users/sebas/AppData/Local/Temp/claude/C--Users-sebas-Desktop-emberhollow/fa185991-22ce-4f9b-bebc-32e568c2d357/scratchpad/playtest/r2s1_*.png`

## Summary (how far)
- **Session A (old build, about 60 commands):** I was **softlocked at chapter 1, step 1** ("A Rider from Kingsholt"). The procession arrived and parked. Talking to the visible Royal Herald (E, RMB, from every side) only gave generic guard chatter, labelled "Guard". The quest "!" floated over an empty tile next to him. Waiting, sleeping and leaving and re-entering the farm did not fix it. I also hit an invisible wall south of the campfire (r2s1_33-35).
- **Restart:** the coordinator said the arrival bug was fixed, so I ran `stop`, `start` and clicked Kingdom test again.
- **Session B (fixed build, about 40 commands):**
  - About 30 s in, the toast "The royal herald has arrived. He waits by your door." appeared, the prompt said "E Talk", and the herald's story dialogue played.
  - Elias at the museum completed his step.
  - Lord Ashcombe at the manor gave the key. The toasts read "Chapter complete: A Rider from Kingsholt" and "New chapter: Smoke over Briarholt".
  - I walked through the south-east gap into the `castle` map and explored outside the walls until my budget ran out.
- **Furthest point:** chapter 2 step 1, "Go through the south-east trees of your farm to Briarholt Castle". I was already on the castle map, but the step had not completed. I never found the gate, so I did not reach the keep, the kitchen, Isolde, the deed or the vault.
- **Errors:** `errors` returned "None" both times.

## Bugs
1. **[Fixed per coordinator, session A only] Story herald never became talkable.**
   - **What I saw:** after the procession parked, the visible herald answered with ally lines. The dialogue box had "Guard" as its subtitle: "Move along, citizen. Well, stay if you like, it's a free town.", "Captain Vey says we're to watch for strangers. You're not strange. Probably." The yellow "!" hung over the empty tile beside him (r2s1_7, r2s1_11, r2s1_21, r2s1_27).
   - **How it got worse:** leaving and re-entering the farm replayed the whole procession, horses and wagons included, from the village road (r2s1_19-20).
   - **Toast timing:** the toast "Riders are coming up the village road…" appeared after they had already arrived.
   - **After the restart:** this works.
2. **Invisible walls on the farm.**
   - In both sessions the player could not move east (D) or south (S) from a spot about 2 tiles east of the dirt path, just south of the camp. W and A worked, and walking around the spot worked (r2s1_33-35, r2s1_53-55).
   - In session B the procession had just left. This is likely leftover collision from the wagons or knights, or the wall the coordinator mentioned. Please re-check on the fixed build.
   - Click-to-walk to far ground from that spot did nothing either. There was no red cross.
3. **"New story: The Hollow Crown" is announced in Kingdom test.** The morning report on day 2 (session A) said "New story: The Hollow Crown. Elias at the museum wants a word." The Hollow Crown is supposed to be finished already in this mode. Elias then only opened his museum window.
4. **The "go to Briarholt" step does not complete on arrival.** I entered map `castle` through the south-east gap, walked the west road and then along the south wall. The journal still said "Go through the south-east trees of your farm to Briarholt Castle". If the target is the gate, the text should say so, or the step should complete on entering the map.
5. **Track does not stick.** I pressed Track in session B, but after chapter 2 started the journal showed "Track" again, not "Tracking". There was no arrow over my head on the way to Briarholt, which is exactly where it was needed.
6. **Kingsholt vs Kingsbridge.** The chapter is titled "A Rider from Kingsholt", but the city on the map and in the docs is Kingsbridge. Is it a typo, or two places?
7. **The story dialogue goes straight into the shop window.** When Elias's last line ended, his museum window opened immediately (r2s1_66). Lord Ashcombe's land window did the same. It feels abrupt. A Space press left over from the dialogue can also hit the window.
8. **Elias shows 0 hearts in Kingdom test,** although the mode assumes you finished his long questline with him.

## Confusing
- **Session A:** the "!" floated next to the herald instead of over his head, so it looked like an invisible NPC stood there. Two "Royal Herald" entities, one of them a guard, is confusing in any case.
- **Interior exits:** in the museum the exit is at the middle of the bottom wall, but you are placed beside the counter. Pressing S does nothing until you move left first (r2s1_43, r2s1_70).
- **Farm map:** the minimap cuts off at the bottom. The south-east gap to Briarholt and its sign are not on the map without scrolling, and the wheel did not scroll it for me. Elias says "beyond your south-east trees", but the map does not show where.
- **Castle grounds:** I came in on the west road, outside the west wall. Going south only led along the outside of the south wall, with tents and archery butts on the other side (r2s1_97-98). I could not see a gate within a few screens. Even a signpost saying "Gate →" at the entry would help a lot.
- **Prompts:** the interaction prompt said "E Wait" near the herald before he arrived, which is unclear. "Look" on the wagons worked well: "A supply wagon heavy with crates and the knights' kit."

## Castle & royal feel
- **What I saw:** only the grounds from the outside. They look good:
  - stone curtain walls with crenellations;
  - round towers with slate cone roofs and purple pennants;
  - a purple heraldic banner on a pole;
  - formal flower beds and a clipped hedge;
  - a topiary cone in a pot;
  - glasshouses peeking in;
  - purple and white striped pavilions;
  - an archery target and a weapon rack;
  - a gardener in a straw hat working inside (r2s1_96-98).
- **Overall:** it reads "royal estate" at once.
- **Not seen:** the keep, the court and the interiors were out of my budget.
- **The procession itself is the highlight:** a herald in purple, a Knight-Captain with a gold helm, purple-tabarded knights and two wagons (a supply wagon and a covered purple wagon with a pennant) parking on your farm (r2s1_20, r2s1_30). The knights' idle lines are charming. One example: "The council sends us farther out every month. Something is stirring."

## Story & dialogue
- **The opening hooks well**, with the herald's first line: "You are the farmer who walked out of the mine with the Hollow King's crown in pieces? Good."
- **The handoffs are short and clear:**
  - Elias: "A herald? Then it's time I showed you this. The last page of your grandmother's journal…" Then: "She was born at Briarholt, the old summer castle beyond your south-east trees. Lord Ashcombe keeps its keys for the crown. Ask him."
  - Ashcombe: "I've kept Briarholt's keys for forty years. Margit made me promise." Then: "Take the key. The way in is through the trees at the south-east corner of your farm. Mind the brambles."
- **Directions:** every NPC tells you the next place in plain words, which works well.
- **Story gating at doors:** the story speaks first when you click a door (Ashcombe met me at his door), which works nicely.
- **Pacing:** chapter 1 went fast once it worked. It took about 30 s for the herald, then the museum and the manor, all in one morning.
- **Small nit:** "Kingsholt" (see bug 6).

## QoL wishes
- Keep the Track state across chapters, or auto-track the main story in Kingdom test.
- Put the Briarholt gap on the farm minimap, plus a signpost in the castle grounds pointing to the gate or keep.
- Make the "!" sit on the NPC's head, and only on the story NPC.
- Put interior spawn points in line with the exit door.
- Pause or close the shop window that follows story dialogue until Space is released, or let the player open it themselves.
- Use a small window for tent "Home": it is a full-screen panel with three buttons (r2s1_24).
- Make the farm minimap scroll with the wheel.

## Balance
I didn't get far enough to judge the deed price (30,000g against my 23,000g). In Kingdom test a "Quest complete: Seasoned fighter (+3,000g)" toast fires at start-up.

## Looks
- **Strong:**
  - the procession sprites, wagons and horses;
  - the museum interior: pedestals with urns, a shelf of pots, a blue banner, display cases and a purple rug;
  - the manor with its crest sign;
  - the castle walls and towers, gardens and pavilions;
  - the village fountain and the well.
- **Minor:** at the farm's tree lines the player walks "inside" the trees with a faded canopy (r2s1_94-95). That is fine, but it makes it hard to see where the gap actually is.

## Liked
- The procession as a set piece.
- The knights' idle banter.
- Direct, warm dialogue with clear directions.
- The story intercepting at doors.
- How the castle grounds look.

## Top 5 fixes
1. Check that no invisible collision stays on the farm after the procession leaves (bug 2). Also check that re-entering the farm does not replay the procession.
2. Complete "go to Briarholt" when you enter the castle map, or add a clear gate signpost and a minimap marker (bug 4 and Confusing).
3. Keep Track across chapters (bug 5).
4. Don't announce or restart The Hollow Crown in Kingdom test (bug 3).
5. Make the spelling Kingsholt or Kingsbridge consistent, and make the story dialogue → shop window transition less abrupt (bugs 6 and 7).

## `errors` output
- Session A: `None`
- Session B: `None`
