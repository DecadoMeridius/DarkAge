# Art playtest 4: what still looks pixel-like in Painterly (2026-11-05)

Four testers went through the Painterly style after 1.8.0. Their full lists, with screenshots in `shots/`, are:
- [ICONS_UI.md](ICONS_UI.md): every item icon, gear, tools, HUD and windows (about 95 findings).
- [FARM.md](FARM.md): crops at every stage, soil, trees, buildings, machines, animals, seasons (about 75).
- [WORLD.md](WORLD.md): village, interiors, Wilds, towns, regions, isles, castle, people (about 49).
- [CREATURES.md](CREATURES.md): enemies, bosses, hazards, projectiles, skills, combat UI (about 100).

The forging and cooking minigames they flagged are already redone (painted scenes, new systems), and so are the fishing, harpoon and crab-trap minigames.

## Grouped by the kind of work

### A. Repaint batches with the existing pipeline (biggest visible gain)
1. **Item icons still pixel art (181 of 810):** all seed packets and seed sacks (47), placeables (52, squeezed into 32 px; the sprinkler is a sliver, the windmill's top is cut), helmets and body plates (32), food bowls, roasts and raw meats (25), some fish, implements, special items. Daggers (11 of 15) came out as cylinders.
2. **Wrong-shape icon reuse:** saplings as leaves, all flowers one template, gears as rocks, grip and bowstring as grass, butter as a cheese wheel, story items as one statuette, sea urchin as a mushroom, crowns as orbs. Broken: `fang`, `imp_horn`, `mammoth_tusk`, `dragon_tooth` and `bone` are near-invisible outlines.
3. **Ember Multitool, level-6 tools, pickaxes 1-2** (look like claw hammers).
4. **Farm animals, the pet and the drakeling:** upscaled pixel art (the black pig is a silhouette, the cream sheep comes out salmon).
5. **Crops stages 0-2** are smoothed pixel art; potato, kale and red cabbage are hard to read ripe; peapod and sea grape show a dark box edge.
6. **Building variants:** barn level 4 = level 1, coop 3-4 = 2, the stable has no level-4 art and its right door is cut; winter barn roof is an "ice block"; the storage shed (`bld_cabin_4x3`) has snow in spring.
7. **Bosses shown as smoothed pixel art:** Frost Giant, Old Snapper, Ash Colossus; human-art enemies and the Hollow King, Warlord and guards.
8. **Broken creature paintings:** `stonetroll` blob; frame 0 of `iceelemental`, `glassling`, `glacierheart`, `glassheart` (brown sticks), `flameslime`, `lavaspirit`; card slabs on the Stone Tyrant's and Forge King's wind-up frames; Rime Queen and Mist Queen walk as cardboard; Ember Wyrm's walk and strike frames don't match.
9. **World props:** lamp posts, rugs (the royal bedchamber rug looks like a grate), Greyhelm's flat roofs, brick walls in the Sunken Forge and Sunken Crown, keep props (wine racks, throne and dais, hearth, cell bars, hoard), the sailboat (the ferry sprite, no sail).

### B. Drawing code (no repaint needed)
10. **Tilled soil:** enlarged pixel furrows with ruler edges and blue pixel dashes when watered; it covers more screen than anything on a farm.
11. **Cliffs and terrain borders:** grid-aligned cliff tops with dashed faces; stair-stepped borders with a dark rim; shore foam a dotted pixel line.
12. **Castle walls (`cwall`)** show a seam per tile; keep floors `fl`/`mb` are a strict checker.
13. **Creature outlines:** every creature keeps a stair-stepped pixel silhouette (painted frames are cut to the pixel outline). Feathering or smoothing the outline mask would fix most of the "still pixel" look in one go.
14. **Projectiles and skills:** skill arrows are dark pixel diamonds; enemy orbs, rocks and arrows are square boxes with square halos; hazards are flat untextured shapes (cyan ice lanes, orange fire pools).
15. **Smaller:** idle furnaces, kiln and oven show fire when empty; build-site scaffolding is thin pixel lines; ground slabs under painted trees stay green in winter; the target frame covers the lives hearts; death flash is a flat white silhouette; the canoe shadow is a hard rectangle; the "to Hollowmere Farm" tracker label floats on most maps.

### C. Characters (a bigger decision)
16. **Player, villagers and portraits stay pixel templates** by design (repaints gave a different person per frame). The testers found them the most pixel-looking thing next to the painted world, especially the character creator preview and the dialogue portraits. Plate helmets read as a white box.

## Suggested order
1. Item icons in batches (A1-A3): the most-seen art, and the pipeline already works for icons.
2. Creature outline feathering (B13) plus the broken creature frames (A8): one code change fixes most creatures, then repaint the few broken ones.
3. Tilled soil, cliffs and borders (B10, B11): they cover most of the screen.
4. Farm animals and buildings (A4, A6), then the world props (A9).
5. Projectiles and hazards (B14).
6. Decide on characters (C16).
