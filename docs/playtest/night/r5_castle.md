# Playtest r5: castle owner (Briarholt)

Persona: rush the deed, then live in Briarholt. I played "Kingdom test" through the harness on port 9302, using about 150 commands. Screenshots are `r5s2_<n>.png` in the playtest scratchpad.

## Summary
**I owned the castle by Tue. 2, 10:30 am, after about 95 commands.** The route was:
1. herald (Mon 7:40)
2. Elias at the museum
3. Ashcombe
4. Briarholt keep
5. kitchen stove
6. Isolde
7. treasury (+5,000g, now 31,500g)
8. walked back to the village and paid 30,000g
9. walked back and told Isolde (+2,000g)

That is well over the ~45-command target. Two things cost the time:
- There is no waystone at Briarholt or by its road that I could find, so both legs were walked.
- Leaving the village at midnight made me collapse at 2 am on the farm (-150g, half HP and energy).

After the deed, the castle comes alive in a way it did not in r4:
- two door guards at the keep;
- gate-tower guards with swords on the turrets;
- throne guards flanking the dais;
- a door warden in the entrance hall;
- the maid Pell, the stable hand Cobb and steward Aldous wander the courtyard;
- scribe Orrin is in the library, Father Cuthbert in the chapel, and Tansy (I think) in the entrance hall;
- Isolde stays in the throne room.

The lines are short and charming, for example: "We are not supposed to wave back. We do."

The furniture now does things:
- the wardrobe opens the appearance editor;
- the bed sleeps you and you wake in the bedchamber;
- the chapel altar restores you;
- the library gives a lore snippet;
- the harp plays;
- the war table gives a line and opens the keep map;
- the treasury chest is the bank.

The western glasshouse accepts tilling, planting and watering.

It feels like a home now, but a quiet one. Nobody reacts to you as the new owner beyond Isolde's one line and "my liege". The court has one line each, and there is no daily rhythm or reason to come back other than the bed and the bank.

## Bugs
1. **Aldous's line is stale after you have met Isolde.**
   - He said "So. You have met her. Then you know why the keep receives no visitors" at 9:50 pm on Mon (r5s2_66).
   - That fits pre-deed. I didn't re-talk to him after the deed, so I couldn't check whether he updates.
2. **The war table opens the keep map, not the world map.**
   - The toast says "Valdmark, painted on oak: every road, town and river" (r5s2_118).
   - The window that opens is the Upper floor plan of the keep. You expect the realm map; the "Map of the Wilds and regions" button is right there, so open that view instead.
3. **The tracker label sits on the HUD.**
   - At the right screen edge, "to Emberholl…" and "Princess Isolde · 25" are clipped under the menu dock (r5s2_70, r5s2_104).
   - At the north edge of the farm, "to Briar…" is cut off (r5s2_76).
4. **The tracker points at the wrong target once the step is done.**
   - After I talked to Isolde post-deed, the tracker still read "Princess Isolde · 20-36 m" everywhere in the keep, even while I stood next to her (r5s2_97: "5 m" with the arrow pointing right, away from her).
   - It keeps sending you back to her with no new hint, which reads as "you still have to do something".
5. **The tracker arrow often disagrees with the route.**
   - Leaving the keep, "to Emberhollow Village" pointed up and right while I stood in the wine cellar and in the great hall (r5s2_54, r5s2_55, r5s2_56). The exit was down.
   - In the throne room, "Princess Isolde · 35 m" pointed straight up while she was below (r5s2_92).
6. **The story stove covers the player.** In the kitchen, standing under the stove, the stove draws over the player's head (r5s2_45-47, same as r4).
7. **The sword hilt clips through the player.**
   - With the sword selected and the player facing left or right, the blade is drawn across the torso as a grey bar (r5s2_54, r5s2_61, r5s2_99).
   - When facing up, the hilt pokes out beside the leg.
8. **The room name is ghosted.** "WINE CELLAR", "ENTRANCE HALL" and "CHAPEL" linger as faint text behind the tracker label (r5s2_63, r5s2_64, r5s2_104). This is the same as r4.
9. **The farm map doesn't show the Briarholt exit.**
   - The farm map (M) marks the Wilds and the Village exits, but not the south-east gap to Briarholt (r5s2_78).
   - It is also not labelled "Briarholt" even after the castle opens.
10. **Walking at night has a harsh hidden penalty.**
    - After buying the deed at midnight, the walk home collapsed me at 2 am (-150g, half HP and energy).
    - The game never warned that 2 am was close. The clock shows the time, but there is no "you're getting tired" toast at 1 am.
11. **"Deposit all" sits right under the backpack in the treasury bank** (r5s2_60). One misclick dumps the hotbar items too, unless you use "Keep hotbar items". It's minor, but worth a confirm.

## Confusing
- **No waystone at Briarholt.** The brief says waystones cover "Briarholt once open", but I found none on the road or in the courtyard, before or after the deed. The castle↔village walk is about 3 in-game hours, and you have to do it three times for the deed.
- **The gate-tower archway** sits right next to a solid tower on the south wall. From the outside road the gate is easy to walk past, and I clicked the tower twice.
- **The keep map** is a big improvement: rooms are named and "You" is shown (r5s2_52, r5s2_57, r5s2_116). But the ground floor shows only the top six rooms; the entrance hall row is cut off below the fold and the wheel doesn't scroll it (r5s2_53).
- **The chapel "Pray" has no feedback beyond a toast.** I was already at full HP, so "You feel restored" did nothing visible. A blessing buff with an icon would make it feel meaningful.
- **The wardrobe is the full "Who are you?" creator**, including the Name field. In a castle, a smaller "Wardrobe" title with just the clothes rows would fit better.
- **Clothes don't show under armour.** I changed the shirt to purple and saw no change, because the iron armour covers it.

## The court
| Who | Where I found them | Line / feel |
|---|---|---|
| Briarholt Guard (×2) | Flanking the keep door | "The gate is barred at sundown. Knock twice if you're late." It's good, but both share it. |
| Door Warden | Entrance hall | "All quiet on the walls, my liege." The "my liege" is a nice ownership touch. |
| Throne Guard (×2) | Either side of the dais | "The princess walked the walls at dawn. She waves to us. We are not supposed to wave back. We do." This is the best line. |
| Gate-tower guards | Sword sprites on the gate turrets | Decorative only. They're nice at a glance, but look like swords stuck in the roof (r5s2_82). |
| Pell (maid) | Courtyard, by the fountain | The queen walking the gravel at night. It's good, and a little spooky. |
| Cobb (stable hand, wide hat) | Courtyard | He kept walking off and I never managed to talk to him. |
| Aldous (steward) | Courtyard | Pre-deed line only (bug 1). |
| Master Orrin (scribe) | Library | "Four hundred years… half of it is grain accounts." Lovely. |
| Father Cuthbert | Chapel | The vigil line ("Bring a cushion"). It's good, and sets up chapter 10. |
| Tansy? (red-haired maid) | Entrance hall, by the candelabrum | Seen, not talked to (out of budget). |
| Blonde woman in purple | Upper-floor gallery doorway | Probably Bryony. She walked into the doorway and away. |
| Not found | | Cook Hilde (I didn't revisit the kitchen after the deed), gardener Wenna (not seen on day 2), and the guard walking the grounds (only a patrolling knight on the south road, r5s2_86). |

- **They are alive in motion.** Guards stand posts, and the servants walk between the fountain, the well and the door.
- **But they all have one line**, and it doesn't change with time of day or story progress.
- **Nobody greets you as lord or lady** except the warden's "my liege".
- **Wandering NPCs are still hard to click.** Cobb and Pell moved out of the clicked spot. Pell worked only once she was adjacent.

## Rooms & furniture
- **Royal bed:** Sleep until morning works; you wake in the bedchamber with full HP and energy and the morning report. It is still a full-screen window holding a single button (r5s2_123).
- **Wardrobe:** opens the character creator (r5s2_122). It works; the window should be framed as the wardrobe.
- **War table (map room):** shows the flavour toast and opens the keep map (bug 2).
- **Library shelf:** lore about Margit's book of hours (r5s2_102). This is charming. Is there more than one snippet? I only tried one shelf.
- **Chapel altar:** "Pray" → "The ember on the altar flares. You feel restored." A heal or energy restore.
- **Harp (solar):** "You pluck a few notes. The hall answers with an echo." It is a toast only.
- **Treasury:**
  - The first gold pile gives +5000g, 3 ancient coins and 2 rubies.
  - A chest opens Storage (the bank and presets, r5s2_60). It's useful, but the brief says the bank chest is in the armoury; I found it in the treasury.
  - The second pile and the second chest still do nothing.
- **Not tried:** the bath, Isolde's chamber, the crypt, the dungeon cells, the kitchen post-deed, and the armoury racks.

## Glasshouses
- The west glasshouse door now enters `cgh_W`: a grass bed inside a plank floor.
- I tilled, planted a turnip and watered it; the crop label read "Turnip · day 0/4 · watered" (r5s2_112). It works.
- The interior is very bare: one big grass rectangle, plank border, no glass walls, no benches, pots or fruit trees. The exterior shows fruit trees through the glass, but the inside has none. Add the trees, some potted plants, a water trough to refill the can, and glass panes on the walls.

## Looks
- **Courtyard by day is gorgeous:**
  - the keep with banners, ivy and a crest;
  - the fountain, benches and lamps;
  - the flower beds and topiary;
  - the training yard with archery targets, dummies, a weapon rack and striped tents (r5s2_89, r5s2_109, r5s2_110).
- **Night grade on the courtyard** reads well, with lit lamp heads (r5s2_65). The keep windows aren't lit at night, though, which makes an owned castle look empty.
- **The interiors are strong:**
  - the throne room with a tapestry of the castle, portraits and candelabra (r5s2_94);
  - stained glass in the chapel (r5s2_104);
  - the library walls of books;
  - the portrait gallery (r5s2_120).
- **The keep has wide dark wall bands** between rooms (3 tiles thick). The doorways are narrow dirt-coloured strips, so they look like holes in the wall rather than doors.
- **The candelabra are never lit**, even at night.
- **The south curtain wall's crenellated band** overlaps the bottom of the tents, so the tents look like they stand on the wall-walk (r5s2_109).
- **Gate-tower swords** are drawn on the turret roofs and look stuck in the slates (r5s2_82).

## QoL wishes
1. **A Briarholt waystone**, or let Aldous sell the deed at the castle. The three walks dominate the rush.
2. **The war table opens the realm map**, and the bed gets a small window, or sleeps directly with a confirm.
3. **Make the court reactive.**
   - Give each member 3-4 lines that rotate by day and time, plus a post-deed greeting ("Welcome home, my lord").
   - Let the cook offer a daily meal, and the gardener tend the glasshouse while you're away.
4. **Lit windows and candelabra at night** once the castle is owned.
5. **Make the second gold pile and the extra chests either do something or look inert.** Ideally the treasury chests are castle storage.
6. **Make the tracker accurate.** Clear it once a step is done, and point it to the right stair or door when the target is on another floor.
7. **Show the Briarholt exit on the farm map.**
8. **A tiredness warning** around 1 am.

## Liked
- The court is finally there. Guards at every door, servants crossing the courtyard and the throne guards' line make it feel inhabited.
- The wardrobe opens the creator.
- You wake in the royal bedchamber.
- The chapel altar and the library lore.
- The named keep maps with a "You" dot. They're a big fix since r4.
- Isolde's "It's yours? Then it's ours to defend." and the +2,000g.
- Ashcombe's "I didn't hear that. My hearing is terrible these days."
- A working glasshouse in spring, with planting and watering.

## Top 5 fixes
1. **Add a waystone at Briarholt** (or a deed sale at the castle). The rush is about 95 commands and 2 in-game days, mostly walking.
2. **Fix the tracker.** It points the wrong way across floors, stays on finished steps, and its label clips under the HUD (bugs 3-5).
3. **Make the court react to ownership,** with rotating lines (bug 1, the court section).
4. **Furniture polish:**
   - the war table opens the world map;
   - a small bed window;
   - the extra gold pile and chests do something or look inert;
   - lit candelabra and windows at night.
5. **Furnish the glasshouse interior**, and fix the draw order of the stove and the sword over the player (bugs 6-7).

## `errors` output
```
none
```
