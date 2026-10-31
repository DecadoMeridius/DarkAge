# Art consistency audit (pixel-art director persona, agent a4)

Played through the harness only (port 9304), about 125 commands: Test sandbox (the station yard, coop, barn and stable, bag, encyclopedia, options), then Save and quit, then Kingdom test (farm, the herald's procession, Emberhollow village, the Wilds meadow and highland cliffs, Kingsbridge with its walls, plaza and inn interior), a slime fight and the satchel tabs. I did not reach Briarholt (the way is still locked at the start of the Kingdom test), and the game stayed in daytime, so the night grade was not checked.

Screenshots are in `docs/playtest/art/a4/`. Files named `a4_*` are full frames at 1584x805. Files named `z*` are nearest-neighbour crops of those frames, enlarged.

## Summary

- **Consistency: 6.5 / 10.** The world sprites mostly agree with each other: one pixel scale, light from the top-left, selective outlines, flat cel shading. The weak spots are four groups that each follow a different, softer style:
  - the HTML/CSS UI layer (smooth vector font, gradient badges, browser widgets);
  - the floating world labels and the tracker arrow;
  - a few big low-detail surfaces (cliff plateaus, flat roofs, the bridge);
  - generic item icons (food).
- **Beauty: 7.5 / 10.** At its best (the trees, the wagon, the inn interior, the station sprites, the dock icons, the slime) it is attractive, coherent pixel art. What drags it down is repetition: tiled ground patterns, identical cliff faces, and roughly 25 dishes that share one bowl icon.

## Style breaks (ranked by how much they stand out)

1. **Floating world text and the tracker arrow are smooth vector art drawn over the pixel world.** This is the most visible break, because it is on screen almost all the time.
   - What I saw:
     - "to Hollowmere Farm", "+1 Slime Goo", "Block -1" and the crossroads sign text ("Greyhelm ↑ · Ashford ↖ …") use the rounded sans font at a large size with an anti-aliased outline.
     - The station labels in the sandbox ("Furnace (forge)", "SUPPLY: every ingredient") are the same.
     - The yellow tracker arrow is an anti-aliased vector triangle (`z14.png`).
     - Labels also collide. At Kingsbridge's north gate the sign text is printed over the tracker label, and neither can be read (`a4_38.png`).
   - Fix:
     - Render world labels with a bitmap pixel font at the art-pixel grid. Use a 1px dark outline, no anti-aliasing, and snap to `pixZoom`.
     - Redraw the arrow as an atlas sprite with 2-3 tones and a 1px outline.
     - Run a label-avoidance pass that stacks or hides labels that overlap (the village map already has one).

2. **The UI chrome mixes three styles.** The wood-and-parchment frames are close to the target. Several things inside them are not:
   - The Skills page level badges are smooth radial-gradient circles (`z26.png`).
   - The orange buttons are soft and rounded with gradients (Continue, Learn, Travel, the title screen).
   - Options uses the browser's default range sliders and scrollbars.
   - The passive tree's ability slots are native `<select>` dropdowns.
   - The passive tree is a dark charcoal panel set inside the parchment window, with tiny low-contrast labels (`a4_47.png`).
   - The body text is a rounded geometric sans, the headings are Cinzel Decorative, and none of it is a pixel font. The `pc.css` frames are hard-edged, but the content is not.
   - Fix: give buttons, badges, sliders and selects 9-slice pixel borders (sprites in `ui_icons.py`, set as CSS `border-image`) with flat two-tone fills. Restyle the scrollbars, and put the tree on a parchment or dark-wood pixel panel. Consider a pixel font for body text (or at least numbers and labels), keeping Cinzel only for titles.

3. **Cliff plateaus read as flat carpet, not raised ground.** These are the big highland areas north of Kingsbridge (`a4_40.png`, `z22.png`).
   - What I saw:
     - The plateau top is one dark olive fill with scattered stone dashes and no form shading.
     - Rock faces appear only on south edges, as small identical blocks with a visible seam every tile.
     - East and west edges are a single light 1px line, so a 10-tile plateau looks like a painted rug.
     - The repeated face tile is obvious over long runs.
   - This weakens pixel-art rule 7 ("anything solid must look solid").
   - Fix:
     - Shade the top toward its edges: a lit rim on the north and west, darker toward the south and east.
     - Draw a 2-3 art px side wall on east and west edges, darker on the east because the light comes from the top-left.
     - Make 3-4 variants of the face tile and choose one by a position hash.
     - Break up the top with large clusters (moss, scree, a few boulders) rather than evenly scattered dashes.

4. **Ground textures show their 64x64 tiling.**
   - Where:
     - Farm dirt has a regular checker of dark blotches (`z3.png` in the scratch folder; `a4_9.png`).
     - Meadow grass repeats its pink, white and purple flower dots at the same offsets in every tile (`z24.png` in the scratch folder).
     - The Kingsbridge plaza paving looks like muddy dirt with twigs, not paving (`z20.png`).
     - The village cobble texture is high-contrast and busy, so it competes with the sprites on it (`a4_23.png`).
   - Fix:
     - Add 2-4 variants per ground key and choose one per tile by a hash, or offset the texture per chunk.
     - Lower the contrast of the large blotches.
     - Paint plaza paving as flagstones with mortar lines (the `fl` floor from the keep would suit).
     - Calm the cobbles: reduce the mid-tone spread and lower the contrast of the mortar.

5. **Flat roofs with no ridge or form.**
   - Where:
     - The sandbox stable's slate roof is a flat blue rectangle with no ridge, no light side and no overhang shadow (`z4.png`).
     - Brann's smithy and several Kingsbridge houses are drawn the same way (`z16.png`).
     - The barn beside it has a proper gambrel with shading, so the stable looks unfinished next to it.
     - The orange tiled roofs are dense vertical streaks that read as noise.
   - Fix: give `side` gable roofs a lit upper slope, a darker lower band, and a ridge line or capping. Add a cast shadow under the fascia, and fewer, larger tile courses on clay roofs.

6. **The ruined greenhouse on the farm reads as a pastel bathroom wall** (`z10.png`). Its glass panes are a flat pinkish white with thin diagonal glints, and the broken panes are black-green blobs with rounded corners. There is no mullion depth, frame shading or interior.
   - Fix:
     - Draw a dark iron frame with a lit top-left edge.
     - Make the glass a cool, slightly blue-green two-tone with dithered reflections.
     - Show broken panes as jagged shards with the dark interior and plants behind, not blobs.

7. **The bridge on the title screen and farm is placeholder-like** (`z8.png`). It is twelve identical vertical planks: no rails, no posts, no wear, no light side and no shadow on the water. It also does not span bank to bank cleanly.
   - Fix: vary the plank tones, add knots and nails, rails or kerbs on both sides, a lit north edge, and a dithered shadow strip on the water downstream.

8. **Semi-transparent pixels inside sprites.** The herald's wagon wheels are see-through: the grass shows through the spokes in a grey wash (`z13.png` in the scratch folder). The faded-canopy and "see-through player" effects turn the player into a pale green translucent ghost (`a4_25.png`, `a4_6.png`). Both bring in alpha blending that the flat palette avoids elsewhere.
   - Fix: make the wheel interiors opaque, or cut real holes. For occlusion, use a 1px pixel silhouette outline of the player over the canopy instead of fading the whole tree and tinting the player.

9. **Side-facing armoured characters are pillars** (`z14.png`, `a4_22.png`). In full plate seen from the side, the body is a strip about 6 art px wide with no arm and no shoulder, under a helmet box wider than the torso, so it looks like a mailbox.
   - The front-facing knights' bucket helms are wider than their shoulders and have flat, unshaded black legs (`z12.png`).
   - Fix:
     - Add a side arm or pauldron layer to the side helmet and armour.
     - Taper the side helmet.
     - Give the legs and greaves a 2-tone ramp.

10. **Small staging and layering issues that break the illusion:**
    - Kingsbridge market vendors stand a full tile above their stalls instead of behind them (`z20.png`).
    - A herald's knight stands inside the campfire (`a4_21.png` in the scratch folder).
    - A slime is drawn sitting on top of a cliff face (`z25.png` in the scratch folder).
    - The village north edge shows a flat dark void you can walk into (`a4_28.png` in the scratch folder).
    - The story "!" next to the herald is a flat orange UI square, not a sprite.

## Scale and detail mismatches

- **Stations, low detail next to high detail:**
  - The Stone Furnace and the Smelter are plain grey boxes with a black opening (`z2.png`).
  - The Blast Furnace and Charcoal Kiln beside them have brick courses, arches and banding.
  - The Oil Press is a flat grey block with a lever.
  - The Mill is a millstone floating in a frame.
  - Bring the furnace and smelter up to the kiln's level: stone courses, a lit fire mouth, soot and a chimney cap.
- **Tent and campfire:** the tent is three flat triangles with no seams, pegs or contact shadow, next to a richly textured workbench (`a4_18.png`).
- **Ember Core:** the crystal floats with a big gap above a tiny dark base, so it reads as two unrelated sprites.
- **Inn bar counter:** the front is one flat brown slab under the detailed shelves, fireplace and stools (`a4_36.png`).
- **Fountain:** the basin rim is flat grey with little form, and the column looks pasted onto the water. It is used twice (village and Kingsbridge), which is fine, but it is the weakest landmark prop.
- **Kingsbridge gate:** the archway has no shadowed depth; you see the street cobbles straight through it. The round towers show a horizontal seam halfway up where two pieces meet (`z19.png`).
- **Village trees vs farm trees:** the village broadleaves are a much brighter lime than the farm and Wilds trees, in the same season (`a4_24.png` vs `a4_18.png`). Either the grade differs or the ramp does.
- **Brown-olive spring trees:** a dull olive-brown broadleaf with a grey trunk keeps appearing among bright green ones in spring (`a4_30.png` in the scratch folder). It reads as dead or autumnal.

## UI and icon consistency

- **Dock icons (top right) and hotbar tool icons:** consistent, crisp and attractive. The dock's labels use the smooth sans and are tiny.
- **Ability bar (Z/X/C):** text-only buttons with no icons, though every other HUD element has one.
- **Skills page and Combat skills page:** no skill icons at all, and the Combat skills page is a wall of text.
- **Food icons, the biggest icon issue** (`z6.png`): about 25 of 35 dishes share the same bowl-with-three-steam-wisps template. Only bread, the baguettes and the bottles differ.
  - Give each dish its own silhouette: pie, tart, stew pot, skewer, cake slice, salad, fish plate and so on. Recolouring alone is not enough.
- **Weapon icons:** they vary in size. Daggers and some tier icons are tiny next to the swords, and the arrow bundle is drawn at a different, much more detailed scale (`z7.png`).
- **Resource icons:** largely consistent palette swaps. Bars are bare trapezoids, the fang or tooth item is minuscule, and the hearts (Red Heart, cyan heart) look like UI hearts rather than items.
- **Map tab:**
  - The farm map is flat vector colour blocks with dotted tree rows.
  - The Wilds map has tiny overlapping labels ("Inn", "Forge", "Barracks" over each other).
  - Neither matches the parchment pixel style. A pixel-drawn parchment chart would.
- **Friends tab:** portraits are shrunken full-body sprites, and the hearts are text glyphs. Head-and-shoulders crops at 2x and pixel heart sprites would match better.
- **Title screen:** the logo and buttons use the soft rounded web style over a pixel-art backdrop (`a4_1.png` in the scratch folder).

## The bar (best-looking pieces)

- **Trees:** the broadleaf and pine canopies, the birch trunks, and the ash and maple variety. Lovely clusters, good top-left light, clean outlines (`a4_28.png` in the scratch folder).
- **The herald's covered wagon and horse.** Strong silhouette, nice purple trim, crisp outline (`z13.png` in the scratch folder).
- **The Kingsbridge inn interior.** Bottle shelves, the stone fireplace with embers, the banner, the stools and the rug (`a4_36.png`).
- **The artisan stations:** preserves jar, cheese press, loom, smoker, bread oven, butter churn, trip hammer (`z1.png` in the scratch folder).
- **Mara's shop front.** The awning, the hanging trade sign and the display window (`z17.png` in the scratch folder).
- **The slime** (clean outline, soft cel shading and a face), and the workbench.
- **The top-right dock icons and the hotbar tool icons.** The UI icons should all reach this level.

## Top 5 fixes

1. **World labels and the tracker arrow in pixel art:** a bitmap font at the art grid, an atlas arrow sprite, and label-collision avoidance.
2. **Cliff plateaus:** edge shading on the tops, side walls on east and west edges, 3-4 face-tile variants, clustered surface detail.
3. **UI widgets:** pixel 9-slice buttons, badges, sliders, selects and scrollbars, and a parchment or wood panel for the passive tree. Add skill and ability icons.
4. **Break the visible tiling:** ground texture variants chosen by hash (dirt, grass flowers, cobbles), plus proper plaza flagstones.
5. **Under-detailed sprites:**
   - unique food icons;
   - stone furnace, smelter and oil press;
   - flat side-gable roofs (stable, smithy);
   - the greenhouse glass;
   - the bridge;
   - the side-view plate armour.

## Other notes

- In the sandbox, pressing Space or Enter to clear the intro dialogs raised gold from 1,000,000 to 1,055,500 with no visible action. Enter probably triggered some window's main button (sell or confirm). Worth checking.
- Brann's Smithy was closed at 8:20 (it opens at 9). This is correct.

## `errors` output

```
None
```
