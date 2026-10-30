# Ideas: kingdoms, knights, princesses and more questing

A brainstorm of what could come next. Each idea says how it fits the systems the game already has, so it's easy to see what is cheap and what is a big job.

## Decisions and build plan

What we decided:
- The princess (Isolde) doesn't hide on the farm. She hides in **Briarholt Castle**, a plot next to the farm (through its south-east fence). You can own it.
- The castle is complete:
  - **outside:** curtain walls, towers, a keep, two greenhouses that grow anything in any season, and a courtyard you can farm;
  - **inside:** a castle interior with several connected rooms.
- **The Empty Throne** starts only once **The Hollow Crown** is complete. The main story already drops hints about the next chapter (Margit's royal seal, King Oswin, Briarholt), and a sign at the farm's south-east fence points to the locked castle.
- **Sieges** come to the castle in waves, with a tower-defence layer: you place defences on the walls and courtyard between waves.
- **Dragon riding** is in, through the Greyfang dragon and its egg.

Build phases:

| Phase | Contents | Status |
|---|---|---|
| K1 | Main-story hints, Briarholt (walls, towers, keep, glasshouses, courtyard), The Empty Throne chapters 1-3, Isolde at the castle | built |
| K1b | A Wilds 4.8× as big, with four towns (Kingsbridge city, Greyhelm town, Ashford and Saltmere villages): roads, signposts, shops with rooms, 18 villagers, town jobs, standing, guards and knight patrols. The herald's procession. The keep on three floors with hand-pixelled furniture. | built |
| K2 | Sieges: waves through the gate, Vey's knights, ballistae and barricades. The Empty Throne chapters 4-13 (patrols, the hunters' camp, Saltmere, proof, Greyhelm, the siege, the council, the knight's oath, the drake egg, flying). | built |
| K3 | Heraldry and titles (a coat of arms on shield, cape and banners; "Sir"/"Dame" after the oath) | next |
| K4 | The capital Kingsholt, the council of three, Morcant, the tourney | |
| K5 | More flying: landing on peaks, fire breath, dragon races | |
| K6 | Isolde's romance, the bloodline's consequences, factions and decrees, sieges on other towns | |

---|---|---|
| K1 | Main-story hints, the Briarholt plot (walls, towers, keep, greenhouses, courtyard), the castle interior, The Empty Throne chapters 1-3 (herald, Margit's seal, the key, finding Isolde, buying the deed), Isolde living at the castle | built (`public/js/x_kingdom.js`, `art/sprites/castle.py`) |
| K2 | Sieges: the royal hunters' assault as the next chapter. Waves come through the gate and over ladders; between waves you build ballistae, braziers, barricades and archers' posts. Damaged walls and buildings are repaired with materials. | next |
| K3 | Knighthood (Oath of the Ember Stag), heraldry and titles | |
| K4 | The capital Kingsholt, the council of three, the tourney | |
| K5 | The Greyfang dragon, eggs, a drake pet, then **dragon riding** (fly over the map, land on peaks, fire breath) | |
| K6 | Isolde's romance, the bloodline choice, factions and decrees | |

---

## 1. The big picture: a kingdom above the valley

Today the world is a valley, the Wilds and four regions. There is a lord (Ashcombe) and a dead king (the Hollow King), but no living kingdom. Proposal: make them part of one realm.

- **The realm of Valdmark.** The valley, the Highmarch, the Frostmere, the Emberwaste and the Saltreach are its old provinces. They drifted apart after the last king, **Oswin**, put on the cursed crown and became the Hollow King.
- **The capital, Kingsholt:** a fifth region, a walled city on a river.
  - It opens after the Hollow Crown story, when word reaches the court that the curse is broken.
  - Generated like the other regions (`genRegion`) but with a big town: market streets, a cathedral, a tourney field, a harbour and the castle on a hill.
- **The regent and the empty throne.** Oswin had no living heir that anyone knows of. The realm is ruled by a regent council, and three claimants are circling the throne. This is the frame for most of the stories below.

> **The twist that ties it all to your farm:** Sir Aldren calls you "my sister's grandchild", and Lord Ashcombe talks about "old Margit". What if Margit was more than a farmer? She was Oswin's younger daughter. She fled the court with her brother's help when the crown started to change her father, and hid as a farmer in the valley. That makes **you the last of the royal line**, and it explains why she tore her journal up.

---

## 2. Storylines

Each one is written as chapters, like `STORIES` in `w_story.js`. Most steps use the step types that already exist (`talk`, `bring`, `meet`, `use`, `go`, `boss`, `kill`, `cond`). The **new** tag marks where something new is needed.

### 2.1 The Empty Throne (the second main story)
*Starts after the Hollow King is beaten. About 7 chapters.*

1. **A Rider from the Capital.** A royal herald arrives at your farm with a summons: whoever broke the curse must come to court. The road to Kingsholt opens.
2. **The Council of Three.** Meet the claimants:
   - **Princess Isolde**, Oswin's great-niece: clever, distrusted, raised in exile in the Saltreach;
   - **Duke Morcant of the Highmarch**: a war hero who wants to march on the Emberwaste;
   - **Lady Rhosyn**, the regent: she says she wants no crown, and she is lying.

   Each one asks you for a favour.
3. **Three Favours.** One quest per claimant. You can do all three, but the order matters (**new:** `S.story.flags` records who you helped first).
   - Isolde: find proof of her birth in the royal crypt (a dungeon).
   - Morcant: clear a border fort.
   - Rhosyn: deliver a "gift" that turns out to be poison. You can notice this with a high Cooking or Herblore level (**new:** a skill-check line in dialogue).
4. **Margit's Locket.** Elias finds the last page of your grandmother's journal. It carries the royal seal.
5. **Blood and Claim.** You can **reveal** your bloodline or **keep it hidden**. This is the big choice (see 2.6).
6. **The Siege of Kingsholt.** Whoever lost raises an army. Defend the walls (see 3.6 Sieges), then go through the castle to a final boss in the throne room.
7. **Coronation, or a Kingmaker's Reward.** Depending on your choices:
   - you are crowned;
   - you crown Isolde (and may marry her);
   - you crown Morcant (war, and the Emberwaste gets harder);
   - or you expose Rhosyn and the council rules as a republic.

Each ending changes taxes, prices, guards on the roads and which festivals are held.

### 2.2 Oath of the Ember Stag (become a knight)
*Starts when you hold Aldren's Blade. About 5 chapters.*

Aldren's knightly order died with him. Bring it back.

1. **The Empty Chapterhouse.** Aldren's ghost points you to the order's ruined chapterhouse in the Wilds. Rebuild it with **Construction** (a build site, like `BP`).
2. **Squire's Trials.** Three trials, each in a different skill:
   - **Valour:** beat a world boss without losing a life.
   - **Mercy:** spare a defeated bandit leader (**new:** a "yield" state for some enemies).
   - **Service:** deliver food to five villagers in need.
3. **The Vigil.** Kneel all night at the village altar. The night has a short event: spirits of the old order test you with questions about the stories you've played.
4. **The Accolade.** You are knighted by whoever rules (the regent, a claimant or Aldren's ghost). You get:
   - a **title** ("Sir" or "Dame", chosen in the creator);
   - **heraldry** (see 3.2);
   - a squire companion (see 3.4).
5. **Recruit the Order.** Find five knights scattered across the regions, each with a short side quest. Each one stands at the chapterhouse afterwards and teaches something: a combat skill, a parry style, a mount trick.

### 2.3 The Princess Who Wasn't in the Tower
*A romance and adventure story. Isolde, or a new character.*

It plays with the "princess in a tower" cliché.

1. You hear that a princess is locked in a tower in the Frostmere. You go to rescue her, and the tower is empty. She climbed out weeks ago and left a rude note.
2. She is hiding as a farmhand on **your farm**, under a false name. A new hand turned up after your last story chapter. Did you notice?
3. **Royal hunters** search the valley. Hide her (lie at the door, change her clothes with the character creator, or smuggle her to the Saltreach by canoe).
4. She asks you to teach her a skill. This uses the "teach a teen" code from `x_family.js`, reused for a companion.
5. **The romance route**: she becomes the sixth `ROMANCE` candidate, with heart scenes at 4, 7 and 10. Marrying her has extra effects:
   - **royal children** (they start with the "royal blood" family bonus);
   - a castle wedding instead of the village one;
   - Ashcombe gives you a grudging bow.

A **prince** version for players who prefer it: Prince Caedmon, Isolde's twin, with the same story.

### 2.4 The Dragon of Greyfang Peak
*A late-game hunt. Opens at combat level 80.*

The Emberwaste Drake was a juvenile, and its mother is very angry.

- The dragon raids farms across the realm. Some mornings, crops are burnt in one corner of your field until you deal with it (`endDay` hook). Make this mild and easy to fix.
- Prepare for the fight:
  - a dragonbone shield, forged from the Drake's trophy;
  - fire-resistance potions (Herblore);
  - a ballista built at the foot of the peak (Construction plus automation parts).
- A multi-phase boss on the mountaintop: on the ground, in the air (fire rain from `HAZ`), then wounded in its cave.
- Reward: **dragon eggs**. Hatching one is a very long Husbandry project; the result is a small drake pet, then a mount.

### 2.5 The Tourney of Seven Banners
*A yearly event, the summer festival of the capital. See 3.3 for the minigames.*

- Knights from every region compete. Each has a personality, a crest, a horse and a rival story across years.
- Enter jousting, archery, the melee and the **harvest pavilion** (for farming players who don't want to fight).
- Winning the joust earns **the Queen's Favour** (or the King's): one wish from a short list, such as a free plot, a rare animal, a royal recipe or a new title.

### 2.6 Blood of Oswin (a family story across generations)
Uses the generations system (`x_family.js`), so it's unique to this game.

- If you **reveal** your bloodline, your family becomes a royal house, and each heir inherits the claim.
  - Court NPCs treat each generation differently. Some don't trust the "farmer kings".
  - A rival house plots against your children: kidnap attempts, duels, false heirs.
- If you **hide** it, the secret passes down. One random generation, a descendant finds Margit's locket and must decide again.
- The **royal crypt** gains a tomb for each ruler of your line, with an epitaph built from what they did: their best skill, their spouse and how they died.

### 2.7 Smaller quests and side stories
Short chains of one to three chapters. Good for filling the capital and the regions.

- **The Jester's Last Joke.** The court jester was murdered, and every suspect lies. A detective quest: ask questions and present evidence.
- **The Black Knight of the Bridge.** A knight blocks a bridge in the Highmarch and fights everyone. It's Rowan Ashcombe, testing himself; it links to the Ashcombe story.
- **The Ghost Queen of the Frostmere.** The Rime Queen's spirit can't rest until her crown shard is returned to her tomb.
- **The Kingsholt Baker's Strike.** The bakers stop work and the city is hungry. Supply bread from your farm's oven line (automation) to break the strike, or take their side.
- **The Witch of Mirefen.** A witch who curses travellers is a former court alchemist. Learn potion recipes from her, or turn her in for a bounty.
- **The Stolen Regalia.** The sceptre, orb and ring are stolen before a coronation. They're hidden in a dungeon, a smugglers' ship and a festival crowd.
- **The Wandering Minstrel.** A bard sings songs about *your* deeds, made up from `S.story.flags`. Some are badly exaggerated. Pay him for better verses.
- **The Cursed Knight.** A knight trapped in his armour for a century. Remove the curse piece by piece (helm, gauntlets, cuirass), each one a fight.
- **The Royal Menagerie.** The castle's beast keeper lost a griffin, a white stag and a mimic chest. Catch them with the animal and pet systems.
- **The Pilgrim Road.** Continues the Ember Pilgrims: a pilgrimage to every shrine on foot, without waystones, for a relic.

---

## 3. New systems that would support these stories

### 3.1 Titles and rank
A progression path next to skills and combat.

| Rank | How you earn it | What it gives |
|---|---|---|
| Commoner | start | – |
| Freeholder | own the farm and one plot | vote at the village meeting, cheaper deeds |
| Knight (Sir or Dame) | Oath of the Ember Stag | heraldry, squire, access to the tourney |
| Baron or Baroness | serve a ruler, own 3 plots | collect small taxes from tenants, a banner on the farm |
| Count or Countess | finish The Empty Throne on a ruler's side | a keep (see 3.5), retainers, court seat |
| Monarch | claim the throne | royal decrees (see 3.8) |

The title is shown in the HUD, in dialogue ("Good morning, Sir ...") and on the save slot.

### 3.2 Heraldry
`S.fam.crest` already exists. Expand it into a full coat of arms:

- a field colour, a division (per pale, per bend, quartered), a charge (stag, ember, wheat sheaf, anvil, fish...) and a motto;
- shown on your **shield**, a **cape**, **horse barding**, banners on the farm and the family tab;
- palette-swap art: the crest channels, like the outfit channels in `human.py`.

Children inherit the arms and can add a small mark of difference.

### 3.3 Tourney minigames
- **Jousting:**
  - Ride down the list on your horse (the riding code), aim the lance with the mouse (a shrinking target circle on the opponent's shield) and time the brace.
  - Three passes; points for hits, broken lances and unhorsing.
  - Horse stats (genetics from Odile's breeding) affect speed and steadiness, which gives the horse-breeding system a purpose in combat.
- **Archery:** moving targets at three distances, wind shown by pennants. Uses `PSHOTS`.
- **The Melee:** a ring fight against 2-4 knights at once, using action combat. No lives used.
- **The Harvest Pavilion:** judged like the Harvest Fair, but with categories: largest pumpkin, best cheese, best horse.

### 3.4 Companions and retainers
- **Squire:** follows you, carries 10 extra slots, picks up drops, hands you food at low health, and can be sent home with loot. Levels up with you.
- **Knights of the Order:** take one with you into dungeons. Each has a fighting style (shield wall, archer, healer-monk, berserker) and **banter** lines tied to places and stories.
- **Retainers at the keep:** guards, a steward (sells produce for you), a master-at-arms (combat training), a falconer (finds forage).
- Engine: these are `NPCS` entries that use `npcWalk` and `enemyAttackAI` to fight on your side. They need a "friendly" team flag, which is the largest new piece here.

### 3.5 The keep: a castle you build
The GDD already plans tent → cottage → house → manor. Add a last stage:

- **Keep:** a large build site on the farm or a plot, built in stages (motte, walls, tower, great hall, gatehouse).
- **Rooms** (using `ROOMS` in `i_interior.js`): great hall (feasts), armoury (gear display and presets), solar (family), chapel, dungeon (keeps bosses' trophies), library (recipe book and lore).
- **Walls and towers** as placeable pieces like fences, which matter in sieges.
- Art is a big job but follows the `STY` recipes in `buildings.py` (stone, battlements, banners).

### 3.6 Sieges and defence
- A rare world event, or a story chapter: raiders, the dragon or a rival army attack the village, a town or your keep.
- Prepare beforehand: build walls, place ballistae and braziers (automation power can run them), stock arrows and food, and hire guards.
- The fight runs in waves using action combat. Defenders are companions.
- Losing isn't a disaster: buildings get "damaged" sprites and need repair materials. No save is lost.

### 3.7 Factions and reputation
Track standing (−100 to 100) with:

- the Crown;
- the Order of the Ember Stag;
- the Highmarch clans;
- the Frostmere elders;
- the Emberwaste tribes;
- the Saltreach guilds;
- the Smugglers;
- the Church of the Ember.

Effects:
- shop prices and stock (`S.stock`);
- which quests are offered;
- guards who are friendly or hostile;
- special recipes, gear tiers and titles at high standing.

The Salt Smugglers story already has a choice, so it could feed this from day one.

### 3.8 Royal decrees (if you become monarch)
Pick one decree per season. Examples:

- "Harvest Tithe": +10% to sell prices, less friendship;
- "Open Roads": regional markets buy from anyone;
- "Royal Hunt": world bosses respawn twice a week;
- "Peace of the Realm": fewer enemies, less combat XP;
- "Great Works": building costs −25%.

A small decision with visible effects, without a full strategy game.

### 3.9 Mounted combat
- A **warhorse** breed from Odile, or bred for strength. **Barding** made at the anvil per metal tier, drawn with your heraldry.
- Lance charge: a straight line attack at speed that knocks enemies down. A sword can be swung from the saddle at reduced speed.
- Fits the existing riding code and `horse_tack`.

---

## 4. Other cool stuff (outside the kingdom theme)

- **Seasonal world events:** a meteor shower (star metal falls in the Wilds), a blood moon (stronger enemies, better drops), a fog week (ghosts on the roads), a comet festival.
- **A bestiary:** fill in a page per enemy by defeating it. Pages reveal weaknesses and drops, with a reward at 100%.
- **Fishing tournaments** at the Saltreach, with legendary fish that only bite on the tournament day.
- **Pet abilities:** the dog digs up artefacts, a cat catches pests in the crops, a hawk scouts the map. Pets level up.
- **A trading caravan** that goes between regions: give it goods to sell, and it returns a week later with profit, or a bandit story.
- **Your farm in the story:** villagers visit and comment on your farm, and the museum shows your family's history.
- **Archaeology:** dig sites with a brush minigame, adding Valdmark's history to the museum.
- **A bard skill:** play songs (a short rhythm minigame), with buffs at the tavern and a part in the tourney.
- **New Game+ by generation:** after the last story, the next heir faces a new "age" of the realm: different rulers and new threats.

---

## 5. Suggested order

| # | What | Size | Why first or later |
|---|---|---|---|
| 1 | Heraldry (3.2) and titles (3.1) | small | visible quickly, uses the crest that already exists |
| 2 | Oath of the Ember Stag (2.2) | medium | uses Aldren's Blade and the existing step types |
| 3 | A few side quests (2.7) | small each | fills the world, tests new step ideas |
| 4 | Kingsholt region and The Empty Throne (1, 2.1) | large | the backbone everything else hangs on |
| 5 | Tourney minigames (3.3, 2.5) | medium | needs the capital; gives horses a purpose |
| 6 | Princess romance (2.3) | medium | slots into `ROMANCE` and the family system |
| 7 | Companions (3.4) | large | a "friendly team" in combat is new ground |
| 8 | Keep and sieges (3.5, 3.6) | large | a lot of new art; needs companions |
| 9 | Factions, decrees, the dragon, Blood of Oswin | medium to large | late-game depth |

## 6. Open questions

- Should the player be able to become king or queen, or should it always be "kingmaker"? Becoming monarch is a strong fantasy but harder to keep small.
- How dark should the court story get (poison, betrayal, war), given the cosy farming tone elsewhere?
- One princess character (Isolde) for both the throne story and the romance, or two separate ones?
- Should sieges be able to damage the player's own farm, or only towns?
