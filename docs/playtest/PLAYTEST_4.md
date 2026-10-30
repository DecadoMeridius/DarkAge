# Playtest 4 (2026-10-30): six areas on build 0.5.2, fast-forwarded

Six AI testers each played their own headless Chrome with mouse and keyboard only, about 100 commands each. The game ran 2–4× faster through the test-only `?speed=N` switch:

| Tester | Speed | Played |
|---|---|---|
| Combat and bosses | 2× | Combat test, then a new game |
| Farming and economy | 4× | New game, Spring 1–4 |
| Animals, horses, building | 3× | Test sandbox |
| Quests and village | 3× | New game, Spring 1–3 |
| Exploration and fishing | 2× | Test sandbox: canoe, harpoon, traps, the Wilds |
| Art and UI | 2× | New game, every window, then Combat test |

None of them saw a JavaScript error.

## Critical
1. **Placeables duplicate from the hotbar.** A hotbar slot whose count reaches 0 keeps placing the item. Reproduced with the Horse Plough three times; it probably affects every placeable.
2. **Bought animals never appear** in the sandbox: chickens and cows were missing from the yard and the coop, yet they produced eggs and milk.

## Across several testers
1. **Clicks do the wrong thing:**
   - The hoe clicked on far ground walks you there but doesn't till, and each walk shifts the camera.
   - The auto tool switch takes over from the watering can (a pebble switches you to the pickaxe), and from the rod near trees.
   - Left-clicking water with the can says "can't reach" instead of walking there and refilling.
   - Clicks on the Combat test panel go through and walk the player.
   - Space after a minigame closes, and typing in a search box before its window opens, reach the game.
2. **Interacting misses:**
   - The request board only opens if you click its legs.
   - Right-clicking a walking villager doesn't start a chat.
   - Right-clicking Mara inside her store walks you behind the counter.
   - The farm notice board does nothing.
3. **Getting stuck:**
   - WASD stops at tree lines and fence corners, after getting off the horse, and in the paddock fence gaps (click-to-move still works).
   - Player boxed in by a boss, its minions and trunks.
   - A hitched horse freezes when the plough snags on something.
4. **Not seeing things:**
   - Enemies under tree canopies hit you unseen.
   - Bosses spawn off screen or under the HUD.
   - Damage numbers are dark at night.
   - The menu dock covers the player at the map's right edge.
   - The tracker arrow is drawn over the player.
   - Slimes draw on top of the player.
5. **Time:**
   - The clock keeps running in every window (shops, quests, gifts, map, placement).
   - Refilling the can at the far pond costs half a day; a village trip costs a day.
6. **Story notices a day late:** a new story appears as a toast after the morning report, and the next morning's report announces the previous one again.
7. **Overlapping labels:** on the village map ("The Drowsy Drake" over "Odile's Stables"; "ur tent" on the farm), damage and pickup numbers, "Block" over "-1".

## Combat
- **Combat test:**
  - You start in the river.
  - Packs spawn on top of you.
  - Clear doesn't remove the Frost Giant or hazards; knockouts repeat with no enemy visible, and a red tint stays until reload.
  - The mouse wheel over the boss list scrolls the hotbar.
  - Quests and level-ups fire.
  - The bag starts full.
- **Damage keeps landing while the Satchel is open** after a fight.
- **Bosses hurt right after spawning**, despite the 1.8 s grace.
- **Balance:**
  - Bosses hit far too hard and die too fast (the Stone Warden took 600 → 14 HP in 6 s and died in 3 bursts).
  - The Ranged pack knocks you out in 2 s.
  - Normal packs are trivial.
  - Focus fills within a few hits.
  - The Wilds at night are brutal for a day-2 farmer.
- **Loadouts:** the bow's default loadout is melee (Cleave/Lunge/Guard), and V lets you learn and slot skills for other weapons.
- **Tooltips:** the bow still says "Attacks every 4 ticks" (classic mode).
- **Effects:** quake rings, wind-up cones and Lich orbs are smooth vector shapes; the Warden's spawn circle and the Wyrm's fire pool at night are faint.

## Farming and economy
- **Water access** is the bottleneck: the pond is far from the tent.
- **Margins:** early crops make about 2–6g a day; fiber gates the early workbench recipes.
- **Shops:** Hale stands behind his counter after closing, and Mara's shop opens from the plaza after hours.
- **Passing out** isn't explained in the morning report.
- **Village paths** lead to the backs of the south-row buildings.
- **Navigation snags** at the oaks south of the farm road, the greenhouse wall and Hale's roof corner.
- **Typos:** the tent text ("like her old house: of thyme") and an outdated rumour about cutting grass with a sword.
- **Two "Sells for" numbers** (the seed in the bag, the crop in the shop) confuse.
- **No exploits found.**

## Animals, horses, building
- **Display bugs:**
  - "Riding" shows while you're on foot.
  - Horses with 2 hearts say "Needs 2 ♥".
- **Wrong texts:**
  - "Tap 🐎 to ride" is the old mobile wording.
  - The shop's "grown in 3 days" is wrong for store-bought animals.
- **Breeding:**
  - The window never says how to get the hearts.
  - Both store animals can be the same sex.
- **The mounted horse is drawn through solid objects.**
- **Ploughing:** it tills blocks around your path, not a clean three-wide strip.
- **Placement and moving:**
  - The building-placement ghost has no clear green/red.
  - A Move was refused with no reason.
  - Implements have no Set down button.
- **Sandbox intro:** clicking through it landed clicks in the world: gold jumped 55,500 and a window opened.

## Quests and village
- **Pages:** the counts disagree ("find 3" vs "page 1 of 12"), and the first page doesn't read as Grandmother's.
- **The tracker:**
  - no distance or name;
  - the arrow swings;
  - no marker over the target indoors;
  - the zoomed Wilds map loses the player and the "!".
- **Chat and gifts:** Chat has two lines and gives no friendship, gift reactions are flat, and the gift picker is the whole Satchel.
- **Museum:** the cases show items at "0 donated".

## Exploration and fishing
- **The canoe:**
  - it's defenceless: flyers follow you, and every hit cancels the cast;
  - a land creature attacked from under it;
  - no line or bobber when casting from it;
  - it crosses a lake in one press and silently drops you on the far shore;
  - the pose reads as standing and punting.
- **Harpoon:** no hit or miss feedback, and the dark fish is hard to see at night.
- **Crab traps:** one missed pull loses the catch, and traps don't stack.
- **Other:**
  - Right-clicking water auto-casts and the fish escapes unseen.
  - Get ×5 fetched the wrong amounts.
  - Nothing points to the coast or the mine.
  - Map wheel zoom didn't work.

## Art and UI
- **Character creator:** clicking a swatch wipes the name; the ponytail is invisible from the back; the scarf shows as a red patch at the cheek.
- **Out of style:**
  - soft chimney smoke;
  - vector combat effects;
  - the crude Pale Lich;
  - flat mint mythril armour (a cyan silhouette);
  - the smooth passive tree with native dropdowns.
- **Icons:**
  - all seed packets look the same;
  - wood looks like a sausage;
  - the pickaxe and scythe are confused;
  - the plough looks like a hammer and the conveyor like a bookshelf;
  - Collections uses one icon for every artifact and one for every mineral;
  - the boots icon is a "U".
- **World:**
  - the plaza pond is a rimless square, and the plaza is one repeating texture;
  - a street lamp stands inside Mara's store, and the village lamps are lit at 1 pm;
  - tilled soil looks like wooden planks;
  - red maples in spring read as autumn;
  - side-facing sprites are paper-thin;
  - the manor crest reads as a heart;
  - Elias's robe looks black.
- **UI:**
  - the Satchel tab row overflows (Lore and Options hidden);
  - several windows are mostly empty;
  - the bag grid uses half its window;
  - Skills is a bare single column;
  - Recipes has two chip rows that both start with "All";
  - the heading font's ligatures garble words ("BꝎTS");
  - labels are pale or small;
  - "Wood 15/4" reads as a fraction;
  - small dialogs are full-screen.

## What testers liked
- **Presentation:** the shop signs and buildings, the interiors, the consistent outdoor art, the menu dock and its icons, and the night grade with lit windows.
- **Interface:**
  - the key prompt panel (hitch, G, unhitch);
  - the Building Hammer flow;
  - crop hover text, and Mara's shop rows with grow days and prices;
  - the shipping bin list;
  - the workbench recipe window.
- **Content:**
  - five stories with clear "begins on day N" hints;
  - the heart bar;
  - Odile's gene cards;
  - the sandbox supply crate and Get buttons.
- **Combat and fishing:**
  - responsive combat with the dash, parry, Whirlwind and Ground Slam;
  - the Warden's quake rings;
  - the red cone with "!";
  - seamless canoeing;
  - clean minigame panels.
- **Stability:** no errors in about 600 actions.

## Suggested fix order
1. **Critical:** the placeable duplication; bought animals appearing.
2. **Clicks and input:** walk-then-act for every tool (hoe, can on water), no auto-tool override of a hand-picked can or rod, UI panels swallowing their clicks, input ignored briefly after minigames close, whole NPC and board sprites clickable with walking villagers stopping.
3. **Stuck and visibility:** sliding at trees, fences and after dismount; enemies visible under canopies; bosses spawn on screen; no damage from bosses during the grace; the dock off the player at map edges; the tracker arrow above the head.
4. **Time and water:** pause the clock in windows; a water source near the tent.
5. **Combat test and balance:** spawn on land at a distance, a full Clear, the red tint, quests off in the sandbox; retune boss and Ranged-pack damage; loadouts per weapon tree.
6. **Stories:** announce on the day they start; fix the page counts; tracker distance, name and indoor marker.
7. **Canoe and fishing:** line and bobber in the canoe, enemies kept off water and hits not cancelling casts, a seated paddle pose, harpoon feedback, softer trap misses, stacking traps.
8. **Art:** pixel combat effects and smoke; the Lich; shaded armour; distinct seed, tool, wood, artifact and mineral icons; the plaza fountain; furrowed tilled soil; lamps only at night and none indoors; the creator fixes.
9. **UI:** Satchel tabs that fit; windows sized to their content; the Skills screen; map labels; heading-font ligatures; "4 Wood (have 15)".

## Status after the fix pass (2026-10-30, `x_fix5.js`)
Fixed in this pass: everything in the fix order except the water distance (kept on purpose).

**Done but not playtested at full length:**
- the balance numbers (hit cap, Focus gain);
- the new art.

**Second pass (the rest of the list):**
- **World:** the plaza paving has wear and moss patches; signposts at both Wilds entrances point to the Old Mine and the coast.
- **Art:**
  - template outlines take the creature's own colours (no more reddish rim on the grey horse);
  - the rider has a tall riding boot;
  - side-facing bodies are a pixel deeper front and back;
  - the passive tree is drawn in pixel blocks;
  - enemy orbs and rocks are pixel squares.
- **Small issues:** slimes sort behind you when overlapping; the LMB hint says Walk where a tool has nothing to work on; the sandbox's Next day keeps you in place.
- **Economy:** cheap crops sell 25% higher, and a new farm starts with 20 fibre.

Specific snags at single trees and roof corners are covered by the general sliding; reopen them if a playtest still hits one.
