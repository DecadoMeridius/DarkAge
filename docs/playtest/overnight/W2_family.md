# W2 — Relationships, generations and leftovers (Test sandbox, Painterly, port 9304)

Played: Mara from the first chat to marriage, a child, the child as a teen, a forced death and succession as generation 2; the bank chips, Sort and search; Blossom Day (Spring 13); evening and night in the village and on the farm, in rain. FPS counter on the whole time.

**Shortcuts I used (console)** so I could cover the whole chain in one session:
- set `S.friends.mara.pts` to 1010, 2010 and 2510;
- `talkNPC('mara')` from the farm, twice, to open her shop window without walking;
- `S.time` to skip to 9:00, to noon on Blossom Day, and to 19:30 and 22:30;
- gave myself `bp_cottage` and `S.blue.cottage`. The site itself was placed, supplied and hammered through the normal UI;
- `talkFuture('mara')` once (after I had already tested the button);
- `festPrize` at noon;
- moved the kid's `d0` back to make them a teen, then an adult;
- `die('old')`.

Days were skipped with the sandbox **Next day** button (about 26 days).

## Broken

1. **The street-chat window's Chat button gives no friendship, and its Shop button isn't greyed when the shop is shut.** Steps:
   - At 7:40, right-click Mara on the street, then click Chat (several times).
   - What happens: `fr('mara').c` is never set, there's no "+15" toast, and the points don't change. Only the line rerolls.
   - At 8:10 (shop opens at 9:00), Shop isn't greyed. Clicking it gives no "We open at…" toast.
   - Likely cause: the `x_fix5.js:193` `drawModal` wrapper bails out unless `#modal` already has class `small`. That class is added by the *outer* wrapper (`x_fix5.js:491`) after it returns, so the Chat and Shop rewrites never run.
   - The CLAUDE.md promise of "+15 once a day" is therefore not true in play.
2. **Story and heart-scene dialogue with a speaker portrait fills the screen in Painterly** (W2_family_6, W2_family_15).
   - The portrait canvas is 128x256 and is shown at 256x512, so the "box along the bottom" becomes a 760x540 panel in the middle of the screen with a blurry, upscaled portrait.
   - The speaker's name is printed twice ("Mara / Mara").
   - Narrator-only lines are fine: a proper bottom box (W2_family_13).
   - Probably the styled `humanSpr` (4x after the Scale2x passes) is fed straight into `portrait`.
3. **The cottage's night window glow is broken** (W2_family_22, W2_family_24).
   - The four windows show disjointed glowing vertical bars and dashes around the frames ("I..lI..I") instead of lit panes.
   - The `styleGlow` glass detection seems to pick the frame and shutter edges on this painting. Village shops look fine.
4. **The Family tab says the wrong people can be courted after succession.**
   - As an 18-year-old heir, the tab lists Hale (35) and Brann (39) under "Could be courted".
   - The `greet` wrapper (`x_heirs.js:67`) hides them because they're more than 15 years older. So the tab promises romances the shop window won't offer. The list should use the same age and sex filter.
5. **The wedding text names Pip as a guest even when Pip is the spouse.** "Pip crying into a tankard" is hard-coded in `x_family.js`; I married Mara, but marrying Pip would read wrong.
6. **Enter doesn't press the main button on two windows** (CLAUDE.md says Enter presses a window's main button):
   - **Morning report:** after you click the sandbox **Next day** button it keeps keyboard focus. Enter then hits that button again instead of "Start the day". I pressed Next day 3 times and got 1 day.
   - **Baby naming:** Enter in the name box doesn't submit; you must click "Name them".
7. **The sandbox has no cottage, and it's very hard to place one.** The yard is so full of stations and labels that the cottage ghost was refused at 5 of 6 tries. Some reasons named objects I couldn't see under the ghost ("clear the butter churn first" while the visible red tiles were soil, W2_family_11). In the end I used `placeOk` in the console to find a valid tile. Suggest pre-building a cottage in the sandbox (it already pre-builds the coop, barn and stable), or leaving a clear lot.

## Quality of life

**Romance**
- Heart scenes only trigger from the **shop** greeting. The street window (which is what you get by clicking a villager) never plays them. My 4-heart scene only appeared once I pressed Shop.
- Neutral gifts toast "Mara liked it (+20…)", the same word as a real liked gift (+45). Use "accepted it" or "thanked you" for neutral gifts.
- The gift picker shows the full Items tab: the Hotbar strip with its "drag items here" instructions, plus Worn equipment (W2_family_4). The comment in `x_fix5.js` says it should be the bag only.
- Clicking a bag item in the gift picker only selects it; you then need a second "Give to Mara" button at the far right. One click to give, or the button next to the item, would be smoother.
- At home the married spouse still uses shop greeting lines: "I keep a jar of your honey **behind the counter**" (I had no honey). Spouse lines at home should be their own.
- **The spouse lives outside.** She stands on the grass outside the cottage at 23:30 in the rain and at 00:50 (W2_family_22). The wedding says she "moves into the farmhouse", but she's never inside the house.
- **The wedding is very low-key:** three text lines while you stand in your bedroom at 6 am. Nothing is staged in the plaza.

**Family**
- **Chores:** spouse chores fall through to "cleared N weeds and stones" about 80% of the time, so it was the same chore 7 mornings running. Typos in the chore toasts: "cleared 1 weeds and stones", "made you omelette" (no article).
- **Baby naming:** you can name the baby after the spouse ("Mara"), so the Farewell window offers "Carry on as Mara" twice with nothing else to tell them apart.
- **The Family tab in generation 1** has no family tree (it only appears after a death). It also has no "romance candidates" or "parent" rows, and says "You have family, so the wilds can claim you now." That's an odd, ominous way to say that knockouts can now be fatal; spell it out.
- **The Farewell window:**
  - It shows a ✕ close button but can't be closed (✕ and Esc do nothing). Hide the ✕ on locked windows.
  - It has no portraits, and doesn't say what each heir keeps (spouse 35% of life skills, the child's taught skills).
  - The death line "died peacefully at 26 … of old age" is the forced cause, fine, but the Family tree then says "Died at 26 of old age". The text should guard against an impossible age.
- **The Will** says "Three days later, the family gathers" but plays the next morning. The morning report after a death doesn't mention it; it only gives the weather and "4 new faces have settled in the village".
- **The Family tab romance hint** says "At 8 hearts, ask them out from their shop", but suitors (Freya, Isla, Mira, Sabine) have no shop.

**Festivals and birthdays**
- **Not in the morning report:** Blossom Day and birthdays (Mara's birthday on Spring 8, when she was my spouse) are only short toasts at day start. The report modal covers those toasts and they're gone when you close it. Put the festival and birthdays in the report itself.
- **Egg hunt:**
  - The eggs are plain cream shells that read as pebbles, not "painted eggs" (W2_family_18).
  - Picking one up gives no toast or counter.
  - The prize toast says "You found 1 eggs!".
  - Leftover eggs stay on the ground into the evening.
- **Wishing well:** E on the village well silently takes 100g ("The water shimmers. You feel lucky."). The toast should say it cost 100g, or ask first. It also stole my E press meant for the villager next to it.

**Bank**
- The chips filter correctly (Materials 64), Sort cycles type → name → amount → value → type, and search works and combines with the chip (W2_family_26).
- The chip counts don't follow the search: "All 189" stays while 8 items show.
- In name, amount and value sort the category headings disappear, which is fine, but nothing on the grid says what the sort is apart from the button.

**Other**
- **Anvil search:** after opening the anvil, typing straight away went to the game. Typing "pendant" opened Friends, Family… and finally the Passive tree. The station search box did *not* take focus (`activeElement` was BODY). Clicking into it first works.
- **Placement hint:** while placing a building, the hint still reads "LMB Till / RMB Smith".
- **Entering the house:** E with the mouse over the cottage roof doesn't enter, even though the prompt panel says "E Home · Your house". You have to aim at the door.
- **Sandbox gold:** gold jumped from 1,000,000 to 1,055,500 in the first minute from milestone quests completing at once (skills 75). Harmless, but confusing.

## Balance
- **Romance pacing** feels fair to slightly quick:
  - Points needed: 250 per heart, 2500 for 10 hearts.
  - Daily gains: a loved gift is +80 a day, Chat +15 (once fixed), and a date +40 once dating.
  - From 0 to 8 hearts is about 21 days. Dating, then 8 to 10 hearts, is about 4 more days.
  - Then the wedding comes 3 days after the proposal, and you can ask for a child after 7 days of marriage; the baby takes 14 days.
  - So you can be married with a baby in about two in-game months.
- **One gift a day** with no weekly cap makes loved gifts the whole story. A Stardew-style 2 gifts a week would stretch it to about a year.
- **The Ember Pendant** (3 gold bars, ruby, diamond at an anvil) and the 300g bouquet are trivial costs by mid-game. Fine as gates, not as sinks.
- **Hammering the cottage** took about 15 s at Construction 75 in the sandbox, so the sandbox can't tell us the normal pace.

## Art & feel (Painterly)
**Good**
- The cottage reads well by day (W2_family_12), and the Blossom Day decorations in the plaza look festive (W2_family_17).
- The heart bubble over the spouse is clear.
- The teen is drawn smaller than adults (W2_family_29).

**Evening and night**
- The 19:30 village grade is a heavy, uniform orange-brown, and the cobbles look muddy (W2_family_19).
- At 22:30 the lamp posts glow nicely as warm squares (W2_family_20).
- Mara's store's lit windows are flat cream shapes with jagged, wavy tops spilling over the frames (W2_family_21). The smithy and the cottage-style village houses are fine.

**Other**
- **Campfire at night in rain:** the flame is a single small glowing square and reads like a lantern, not a fire (W2_family_23).
- **The village well:** the player stood inside its footprint and was drawn over it (W2_family_20); its collision box looks too small.
- **The village plaza** is a very large, uniform cobble field with a visible repeat.

## Performance
- 128-131 fps everywhere: farm, village, rain and night, the house interior. Work per frame 0.7-1.8 ms.
- No stutters noticed.
- Console: no errors, only two 404s for `/favicon.ico`.

## Liked
- The romance chain works end to end:
  - heart scenes at 4, 7 and 10;
  - the bouquet;
  - dates with a speed buff;
  - the pendant;
  - the cottage gate ("a tent is no place for two");
  - the wedding;
  - "barely unpacked" before day 7;
  - pregnancy, naming;
  - the teen's skill choice with highlighting;
  - succession with the will;
  - the generation 2 tree and the +10% bonus.
- The writing in the heart scenes is warm and specific (Mara's "a garden that's ours, not a shop that's mine").
- Build sites pulling materials from storage, and the clear "Deliver" / "Hammer" steps.
- The bank chips, Sort and search all work.

## Top 5 fixes
1. **Street-chat window:** Chat gives no friendship and Shop isn't greyed when shut. Fix the `drawModal` wrapper order (`x_fix5.js:193` vs `:491`) so these rewrites run. Also let heart scenes play from that window.
2. **Portrait dialogue box in Painterly:** cap the portrait's size so the dialogue sits along the bottom again, and drop the duplicated name.
3. **Cottage night windows:** the glow shows as frame-edge bars; fix `styleGlow` for `bld_cottage` (or pin a glow frame).
4. **Family tab after succession:** filter "Could be courted" by the same age and sex rules as `greet` (it shows Hale and Brann for an 18-year-old), and fix "ask them out from their shop" for suitors.
5. **Morning report:** put festivals, birthdays and a death in it. Make Enter press "Start the day" (not the focused sandbox Next day button) and submit the baby name. Hide the ✕ on the locked Farewell window.
