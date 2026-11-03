# Round 2: Kingdom test (late game) - port 9305

Shortcuts used are named per finding (goMap, endDay, S.time).

## Game-breaking
- No crashes or stuck states in The Empty Throne from the herald to the siege (chapters 1-8 played; Isolde's council chapter started). Siege won without ballistae in ~45 s.
- **The Empty Throne ch. 4 "Riders on the Road" (6 kills beside a patrol) barely counts.** The story's `*assist` kill only counts if a knight itself hit the monster in the last 12 s (`e.allyHit`, x_story2.js:35), while the barracks job "Ride with a patrol" counts any kill with a knight within 120 px (x_realm.js:292). With Kingdom-test gear (iron sword) slimes die in one or two swings before any knight swings, so in 150 s of fighting right beside patrols the job counted **20/5** and the story **1/6** (only a wolf, which lasted long enough for a knight to hit it). A strong player is near-stuck here with no hint why (I got through only by luring monsters onto the knights so they hit first). Repro: Kingdom test, reach "Ride with Vey's patrols", fight slimes next to a patrol south-east of Kingsbridge; compare `S.realm.q.kb_patrol.n` with `S.story.q.throne.kills`. Fix idea: use the job's rule (ally within 120 px) for the story too. Shortcut used: goMap to Kingsbridge.

## Economy
- Barracks job "Ride with a patrol" (900g, one-off) is done within a minute with the job on (patrols arrive every 10 s, slimes everywhere near Kingsbridge); progress kept counting to 20/5. Generous but one-off, so not a loop.
- Briarholt deed is 30,000g; the Kingdom test starts with 30,000g (not the 20,000 the docs say) plus 1,500 from chapter 1, so it leaves 1,500g. In a normal game (~39k in year one by `simPacing`) that is about a year of income: reasonable as a late-game sink.

- **Staircase 27g and Warp Totem 25g at Greyhelm's Miners' Supply, 15 a day each.** Both items have `p: 0`, so the town `price()` falls back to 20g x 1.3. Fifteen staircases a day for ~400g lets you skip the mines; warp totems become near free. Repro: Greyhelm, Miners' Supply → Buy. Give them real prices (or drop them from `SHOP_STOCK.gh_supply`).
- **Town buy/sell is break-even, so friend prices make a small loop.** Town shops sell at 1.3x `p` (1.15x at 50+ standing) with the weekly ±10% drift, and the specialist shops buy at 1.15x (Finn's fish, Ashford sawmill), 1.1x (Greyhelm supply). Already at standing 0, Anchovy buys at 28g and Finn buys it back at 28g (tested: bought 5, sold 5, gold unchanged). At 50 standing in a -10% week Bluefin Tuna buys at ~350g and sells to Finn at 386g: ~+36g each, 15 a day (~500g/day, less as the demand drop kicks in). Not huge, but a loop. Fix idea: specialist bonus should not apply to items that shop itself sells, or keep buy ≥ 1.2x sell bonus.
- Smelting bought ore is mildly profitable: 5 iron ore (16g) + coal (21g) = 101g → iron bar sells 120g (3 bars a day from stock). Fine, it costs time.
- **Several town "bring" jobs pay less than just selling the goods:** Saltmere kelp 10 x 70g = 700g for a 350g job; Greyhelm miner's pie 3 x 380g = 1,140g for 650g; Kingsbridge "Mail for the knights" 10 iron bars (1,200g) for 1,100g; coal 30 x 18 = 540g for 500g. Only standing makes them worth it. Hardwood (300g of wood for 650g) and wheat are fine.
- Inn take-away food is pricey but sensible (Ashford: Country Bread 106g, Omelette 235g; a hot meal 60g).

## Art
- Briarholt grounds: one oak in front of the west wall looks blocky/pixel next to the painted trees around it (likely its sway frame or a pixel fallback). Shot R2_kingdom_3.png.
- Keep interiors (kitchen, throne room): floors are painted but most furniture reads as pixel art (stoves, tables, stools, armour stands, pillars, carpet, candelabras). The throne dais is a flat grey box. Shots R2_kingdom_4.png, R2_kingdom_5.png.
- Keep front: lamp posts and banner poles are crisp pixel art beside the painted keep; the cobble plaza has stair-stepped pixel edges against the grass. Shot R2_kingdom_6.png.

- Kingsbridge at night: windows glow well, but on the half-timbered house the glow covers the shutters too (bright yellow bars either side of each window). Shot R2_kingdom_9.png.
- Barracks interior: the three armour stands are covered in orange spots (look rusty/leopard-print). Shot R2_kingdom_8.png.
- Town interiors (Felled Oak, barracks, Miners' Guild) are still essentially pixel art: furniture, shelves, counters; only the floors look painted. Shots R2_kingdom_11.png, R2_kingdom_14.png.
- Saltmere pier reads as a palisade/fence of upright planks rather than a deck; lamp posts and drying racks are crisp pixel art. Shot R2_kingdom_12.png.
- Greyhelm: a black blob (a stray cast-shadow piece?) sticks out of the longhouse's east wall; the west town wall is a column of yellow-mossy pixel blocks. Shot R2_kingdom_13.png.
- Briarholt courtyard: the four stone benches (`furn_sbench`, 32/41 x 25/28) are drawn as faint see-through ghosts. Shot R2_kingdom_15.png.

- Highmarch town at night: windows lit; one house at the top left has an irregular yellow glow blob on its wall that isn't a window. Shot R2_kingdom_16.png.
- Sunken Forge (Highmarch dungeon) floor 2: the Stone Troll is drawn with a visible rectangular dark-green card behind it (the cut-out kept its box). Cliff blocks in the dungeon are hard square pixel blocks with brick faces. Shots R2_kingdom_17.png, R2_kingdom_18.png.

## Performance
- Keep kitchen on first entry: 118 fps, 18.7 ms work per frame (over the 16.6 ms budget) for a moment; the throne room later showed 165 fps / 1.0 ms. Probably the first paint of the keep's chunks. Shot R2_kingdom_4.png.

- Everywhere else 160-165 fps with 0.7-1.6 ms work (Kingsbridge plaza, Saltmere, Greyhelm, keep, dungeon).

## Other notes
- Console: two `Uncaught TypeError: Cannot read properties of null (reading 'lock')`. Almost certainly from my script clicking a guild window's tab after joining had closed the window (g_ui.js:21 tab handler reads `MODAL.lock` with `MODAL` null). A real player can't click a hidden window, but a `if (!MODAL) return` guard would be cheap.
- Story run used shortcuts: goMap to towns and story places, `S.time` set twice (to day for shops, to night for windows), helper scripts using `walkTo` + real right-clicks and Space for dialogue. No story state set directly. I stayed up past 2 am once and collapsed (667g fee): expected.
- Highmarch dungeon: floors 1-3 cleared/reached with iron gear at combat 30 (7 meals on floor 1). Not stuck; the troll on floor 2 was just unreachable from the start pocket, the ladder was.

## Top 5
1. **Empty Throne ch. 4 "Riders on the Road" only counts kills a knight hit first** (story 1/6 while the patrol job counted 20/5 in 150 s). Near-stuck for strong players; use the job's "ally within 120 px" rule. (x_story2.js:35 vs x_realm.js:292)
2. **Staircase (27g) and Warp Totem (25g) on sale at Greyhelm's Miners' Supply, 15 a day**: `p: 0` falls back to 20g. The guild store gates the staircase behind Hewer rank, so this is clearly unintended.
3. **Town buy/sell break-even → small loop at friend standing**: specialist shops buy at 1.15x what other shops (and the same shop) sell at 1.15-1.3x with ±10% drift. Anchovy already 28g in / 28g out at standing 0; Bluefin Tuna ~+36g each at 50 standing.
4. **Bring jobs pay less than selling the goods** (kelp 350g for 700g of kelp, miner's pies 650g for 1,140g, iron bars 1,100g for 1,200g).
5. **Painterly art gaps in the late game**: town and keep interiors are still pixel art apart from floors; Stone Troll has a visible rectangular backdrop; Briarholt benches are ghost-transparent; night window glow spills over shutters (Kingsbridge) and onto a wall (Highmarch); armour stands with orange spots; Saltmere pier looks like a fence.
