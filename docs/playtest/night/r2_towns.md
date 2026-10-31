# Round 2: town and economy playtest

Persona: a player who cares about towns, shops and money. Game: Kingdom test (combat 30, iron gear, 23,000g). Harness on port 9302, screenshots `r2s2_<n>.png` in the playtest scratchpad.

## Summary
- Walked from the farm's north exit into the Wilds and headed north-east to **Kingsbridge**. It took about 3.5 in-game hours (6:20 to 9:50 am), with lots of snagging on bushes, rocks and flowers.
- Inside Kingsbridge I used:
  - the plaza market stall (bought an apple, saw the sell tab);
  - the waystone (attuned);
  - Wynna's Emporium (looked at stock, sold the apple);
  - the Barracks (talked to Captain Vey, took the patrol job);
  - the bank (deposited and withdrew logs);
  - the Town Hall (arrived after closing);
  - the Crowned Stag inn (bought Pancakes, paid for Rest).
- I tried to talk to a guard and looked at houses ("Knock").
- I didn't reach Greyhelm, Ashford or Saltmere. Getting around inside Kingsbridge and getting out of the shop rooms used up most of the budget, and the overland trip was slow. The temple, the smithy's town menu and handing in a job weren't tested. I saw no knight patrol on the road; the only fighting was a gate guard blocking a crow.
- Good news: the round 1 blocker is fixed. Town menus open and work: stall, emporium, barracks, bank and inn.

## Bugs
1. **Town walls can be walked on, and you can end up inside them** (Kingsbridge north and south walls). I went north-east toward the city, the player vanished, and the camera showed only the wall (r2s2_18, r2s2_21). Later the player was standing on top of the battlements with the head showing above them (r2s2_23), and walked along the wall to the gate tower (r2s2_24). Going south inside the town also ran me into the south wall, where I was invisible again (r2s2_49). A gate guard walked along the wall face too (r2s2_19).
2. **The north gate of Kingsbridge opens straight onto a lake.** The signpost "Greyhelm ↗ · Ashford ← · Saltmere → · Emberhollow ↙" sits above it, with no road out (r2s2_24).
3. **After a window closes, the first held movement key is ignored.** It happened every time (emporium, barracks, bank, town hall): Escape, wait 0.4-0.6 s, hold S for 2.5 s, and nothing moves. You have to let go and press again, so it feels like you're stuck in the shop. `INPUT_GAP` probably swallows the keydown and never picks up the key that's still held.
4. **Player spawns inside furniture.**
   - In the Kingsbridge Town Hall you appear inside the dining table (r2s2_59) and can't walk south out of it.
   - The bench under the table plus the table almost close off the exit. I needed about 5 tries going round the right side to get out (r2s2_63-66).
5. **Right-clicking a shopkeeper across the room does nothing in the inn.** In the Crowned Stag, RMB on Hollis twice did nothing: no walk, no menu (r2s2_70, r2s2_71). Walking up and pressing E worked. In the Emporium the same click worked from the doormat.
6. **You can walk behind shop counters.** Moving in Wynna's Emporium put me behind the counter next to her (r2s2_40).
7. **Player stands in the fountain basin.** Both in the Kingsbridge plaza (r2s2_33) and with a villager standing in the water (r2s2_30).
8. **The stallholder dialogue has no Browse button.** "Apples, cherries, honey from the hill farms! Browse the stall, friend." comes with only Close (r2s2_26). You have to know to right-click the stall itself.
9. **Rest (150g) at the inn takes the gold and does nothing visible.** At 9:30 pm with full HP and energy: no sleep, no new day, no message, and the clock didn't move. You either need a message ("You're already rested") or it should sleep until morning.
10. **Guards don't respond to Talk.** The prompt says "E Talk" / "RMB Talk" next to a gate guard (r2s2_19, r2s2_20), but nothing happens. Either give them a line or drop the Talk prompt.
11. **The Town Hall says "Closed. Open 9 am to 6 pm."** while the mayor is still standing behind his desk. That's fine for opening hours, but I'd already walked in through an open door at 5:50 pm. The door should refuse you, or the keeper should finish the visit.
12. **Wall corners and towers don't line up.** At Kingsbridge's south-east corner the east wall carries on north from beside the tower instead of out of it (r2s2_49).

## Confusing
- **No way to find a shop.** The M map shows Kingsbridge as a blob with no building names. Houses and shops look alike, and only some have small trade signs. I knocked on two houses first ("No hawkers, no knights, no geese." is a good line). A town map with labels, or name plates over shop doors, would fix it.
- **Leaving a building often puts you somewhere you don't expect** (after the bank I came out near the plaza's south-east houses). Hard to keep your bearings.
- **"My knights ride the roads in fours"** (Vey) against "patrols of two to four" in the job text right under it.
- **The journal's story title is "The Empty Throne: A Rider from Kingsholt"**, but the city is Kingsbridge. Intentional?
- **"Seeds from every season"** (Wynna), but she only sells spring seeds.
- **The hint says "LMB Plant" in the Wilds when seeds are selected.**
- **The clock keeps running in the stall and emporium windows** but seemed to stop in the inn window. I couldn't tell which windows pause it.
- **The barracks wall has a faint "THE BARRACKS" text painted over the stones** behind the banners (r2s2_42). It looks like a decal that's half visible.

## Each town
- **Kingsbridge.**
  - Looks: it does feel like a city. Battlements, round towers, an arched gate with guards, a plaza with a fountain, benches, four striped market stalls, a waystone, lamp posts, a big town hall with a pillared portico, a stone barracks, a bank with a crest sign, a smithy with an anvil sign, and many timber and brick houses.
  - Life: lots of townsfolk walking about, all different.
  - Problems: it's small but confusing because so many buildings look the same.
  - Rooms: interiors fit each place well (the emporium's shelves, the barracks' weapon racks and armour stands, the hall's tapestry and fire, the inn's barrels and hearth).
- **Greyhelm, Ashford, Saltmere:** not reached. On the world map they're far off: Ashford far west, Greyhelm far north, Saltmere east of Kingsbridge.

## Shops & prices
- **Market stall** ("Fresh from the farms around Kingsbridge"):
  - Prices: Apple 119g, Cherry 104, Peach 168, Orange 120, Plum 106, Honey 180, Cherry Jam 264, Plum Jam 272, Grape Wine 306, all 15 in stock.
  - Odd item: a Cheese Press for 389g (4 in stock) at a fruit stall.
  - Selling: it buys apples back at 100g, so you lose only 16%.
- **Wynna's Emporium:**
  - Stock: spring seeds (Turnip 30g "sells for about 45g", Potato 66/72, Garlic 43/60, Kale 73/88, Cabbage 133/152, Strawberry 96/68, Pea 58/51, Rhubarb 147/192, Tulip 25/40), saplings at 835-1354g, compost, Growth Tonic, Flour 49, Sugar 32, Salt 11, Butter 79, Lantern 108.
  - Selling: "Pays 5% over the usual price for what they deal in." Apple sold for 105g. It also offered 105g for Country Bread.
  - The seed info line (grow days and sell price) is really useful.
  - Pea Pod and Strawberry are listed as selling for less than the seed costs. That's fine for regrowing crops, but it reads as a loss at a glance.
- **Crowned Stag inn:**
  - Prices: Harvest Roast 1,353g, Knight's Feast 2,726g, Cheese Toast 461g, Pancakes 312g, Country Bread 154g, Layer Cake 2,134g, Rest 150g.
  - These are very high. Bread at 154 that sells back at 105 is a fair markup, but 2.7k for a feast is a lot for a meal, and there's no "eat here now" option (meals go into the bag).
  - Nice touch: the rumour line ("They say the regent hasn't slept in the palace since the king died.").
- **Bank:** opens the shared Storage window straight away. The banker never greets you, so the bank has no character (no interest, loans or vault). "The bank / is empty." wraps onto two lines.
- **Verdict:** the emporium is a worse Mara's (same seeds plus 5% on sales). The stall is a handy place to sell fruit and artisan goods. Towns aren't yet worth the trip just for the shops.

## Jobs
- **Barracks, "Ride with a patrol (900g)":** "Fight beside a knight patrol until they've felled 5 monsters with your help." Take is instant. Then it shows "Progress: 0/5" and a greyed Hand in (good).
- **Standing** is shown as "0/100".
- **Pay:** 900g for 5 kills alongside knights looks fair.
- **Not tested:** I never found a patrol in about 14 in-game hours (one trip along the north-west, then only in town), so I couldn't progress the job. The Town Hall board was closed when I got there.
- **Wish:** the job should show where patrols ride. I couldn't tell whether the journal (J) lists it; the stories filled the part I read.

## Guards & patrols
- **Gate guards** stand in pairs at the north and east gates and fought a crow next to me ("Block -1", health bar shown).
- **Talking:** guards don't talk (see bugs).
- **Patrols:** none seen. A group of knights and the herald were standing around the farm at the start (the procession), but none on the Wilds roads.

## Travel
- **Farm to Kingsbridge** on foot: about 3.5 in-game hours and many stops on single bushes, flowers and rocks. WASD movement into a small bush simply stops.
- **No road from the farm:** I only hit a north-south dirt road halfway. A signposted road from the farm or village gate toward Kingsbridge would help a lot.
- **Map:** the world map starts with all four towns marked, which is good, but there's no "you are here" until you've explored, and no roads drawn.
- **Waystone:** the plaza waystone attunes on touch ("The rune wakes under your hand: Kingsbridge."). That fixes the return trips once you've visited.

## QoL wishes
- Name plates or icons over shop doors, and labelled buildings on the local town map.
- A clearly visible road from the farm and village to the nearest town, with a signpost at the Wilds entrance.
- Inn: "Eat here" (eat on the spot), and Rest that sleeps until morning, or at least explains itself.
- Stall dialogue: a Browse button.
- Keep a held movement key working after closing a window.
- Show in the journal where the active town job happens.

## Balance
- Inn food costs 5-10x what the same food is worth. Fine as a gold sink with 23k, but a normal player won't touch the inn menu.
- The stall's buy-back at 84% of its sell price comes close to an exploit for anyone who can carry goods between towns with price drift. Keep an eye on it.
- The patrol job at 900g is decent early, but it depends on finding a patrol.

## Looks
- Town art is the high point: the walls and towers, the arched gate with portcullis, the fountain, striped stalls, the varied roofs, and lamp posts that light up at dusk.
- Night grading in town looked good (r2s2_67, r2s2_68).
- The shop interiors are lovely and each one is different.
- The camera framing on walls (an invisible player) is the main visual problem.

## Liked
- Shops finally open, and each keeper has a name, a portrait, a friendship bar, lines that change and a gift button.
- The seed rows tell you grow time and resale value.
- The barracks job flow is clean (Take, then progress, then a greyed Hand in).
- The rumours, and the "no geese" door.
- The waystone in the plaza.

## Top 5 fixes
1. Make town walls and towers solid all the way through (no standing on battlements or inside the wall), and don't let the north gate open onto a lake.
2. Keep a held movement key working after a window closes. Right now every shop visit ends with "am I stuck?".
3. Exit and entry spots: don't spawn players inside furniture (town hall table), keep room exits clear (hall bench), and stop players walking behind counters.
4. Label shops: name plates over doors and a town map with building names; give the stallholder a Browse button.
5. Make RMB on a keeper always walk there and open the menu (it fails in the inn), and make Rest at the inn sleep or explain itself.

## `errors` output
```
none
```
