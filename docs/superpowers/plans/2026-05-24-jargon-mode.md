# Jargon-modus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a second study mode "Jargon" alongside the existing GVB-vragen mode, with its own card deck (~85 Dutch golf terms), separate localStorage progress, and a segmented control on the home screen to switch between modes.

**Architecture:** Generalize `useProgress` to accept a storage key. Instantiate it twice in `App.jsx`. Add `mode` state in `App` driving which dataset/progress is fed into Home/Study/Done. Add a segmented control above the topic list in `Home.jsx`. No new components; `Study.jsx`, `Card.jsx`, `Done.jsx` are reused as-is.

**Tech Stack:** React 18, Vite, vanilla CSS. No test framework or linter in this project — verification is `npm run build` (catches syntax/import/JSX errors) plus the user's manual smoke test at the end.

**Spec:** `docs/superpowers/specs/2026-05-24-jargon-mode-design.md`

---

## File Structure

**New:**

- `src/data/jargon.js` — exports `jargonTopics` and `jargonCards` (same shape as `flashcards.js`)

**Modified:**

- `src/hooks/useProgress.js` — accept `storageKey` as a parameter; remove the hardcoded constant
- `src/App.jsx` — add `mode` state, two `useProgress` instances, per-mode `selectedTopics`, route mode-specific data into Home/Study/Done
- `src/components/Home.jsx` — accept `mode`/`onModeChange`/`modes`/`cards`/`topics` props, render the segmented control, drive everything from props
- `src/App.css` — add `.mode-switch` + `.mode-switch__btn` styles using existing CSS variables

**Untouched:** `src/components/Study.jsx`, `src/components/Card.jsx`, `src/components/Done.jsx`, `src/main.jsx`, `vite.config.js`, `deploy.sh`, `index.html`, `src/data/flashcards.js`.

---

## Task 1: Generalize `useProgress` to accept a storage key

**Files:**

- Modify: `src/hooks/useProgress.js`
- Modify: `src/App.jsx` (the one existing callsite of `useProgress`)

- [ ] **Step 1: Rewrite `useProgress.js` to take `storageKey` as a parameter**

Replace the entire contents of `src/hooks/useProgress.js` with:

```js
import { useState, useCallback, useEffect } from 'react';

function readStorage(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function useProgress(storageKey) {
  const [progress, setProgress] = useState(() => readStorage(storageKey));
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    try {
      const testKey = '__golfregels_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
    } catch {
      setStorageAvailable(false);
    }
  }, []);

  const mark = useCallback((cardId, status) => {
    setProgress((prev) => {
      const next = { ...prev, [cardId]: status };
      writeStorage(storageKey, next);
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    setProgress({});
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [storageKey]);

  return { progress, mark, reset, storageAvailable };
}
```

Note: the previous module-level `STORAGE_KEY = 'golfregels.progress.v1'` constant is removed; the key now comes from the caller.

- [ ] **Step 2: Update the existing callsite in `App.jsx`**

In `src/App.jsx`, change the line:

```js
const { progress, mark, reset, storageAvailable } = useProgress();
```

to:

```js
const { progress, mark, reset, storageAvailable } = useProgress('golfregels.progress.v1');
```

Nothing else in `App.jsx` changes in this task.

- [ ] **Step 3: Build to verify nothing is broken**

Run: `npm run build`
Expected: build succeeds, `dist/` written, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useProgress.js src/App.jsx
git commit -m "$(cat <<'EOF'
refactor(progress): parametriseer useProgress met storageKey

Maakt het mogelijk om meerdere onafhankelijke voortgangs-stores
naast elkaar te draaien (voorbereiding op jargon-modus).
EOF
)"
```

---

## Task 2: Add jargon data file

**Files:**

- Create: `src/data/jargon.js`

- [ ] **Step 1: Create the data file**

Create `src/data/jargon.js` with the following content. The file exports `jargonTopics` (six topics, distinct colors from the GVB topics) and `jargonCards` (85 cards, prefixed `jrg-<topic>-NN`).

```js
export const jargonTopics = {
  baandelen:  { label: 'Baandelen',           color: '#7cb342' },
  slagen:     { label: 'Slagen',              color: '#26a69a' },
  clubs:      { label: 'Clubs & uitrusting',  color: '#ffb300' },
  spelvormen: { label: 'Spelvormen',          color: '#ab47bc' },
  score:      { label: 'Score & handicap',    color: '#ec407a' },
  regels:     { label: 'Regels & procedures', color: '#42a5f5' },
};

export const jargonCards = [
  // ─── Baandelen ─────────────────────────────────────────
  { id: 'jrg-baan-01', topic: 'baandelen', front: 'Fairway',
    back: 'Het kort gemaaide deel van de hole tussen tee en green, bedoeld als ideale landingszone voor je bal. Engels: fairway · Zie ook: rough, semi-rough' },
  { id: 'jrg-baan-02', topic: 'baandelen', front: 'Rough',
    back: 'Het langere gras langs de fairway. Slagen vanuit de rough zijn lastiger omdat het gras de club afremt. Engels: rough · Zie ook: semi-rough, fairway' },
  { id: 'jrg-baan-03', topic: 'baandelen', front: 'Semi-rough',
    back: 'De strook iets langer gras tussen fairway en rough; iets moeilijker dan fairway maar makkelijker dan rough. Engels: semi-rough / first cut · Zie ook: rough' },
  { id: 'jrg-baan-04', topic: 'baandelen', front: 'Green',
    back: 'Het zeer kort gemaaide oppervlak rond de hole, bedoeld om op te putten. Engels: green · Zie ook: fringe, apron' },
  { id: 'jrg-baan-05', topic: 'baandelen', front: 'Fringe',
    back: 'De smalle rand iets langer gras direct rond de green; vaak nog puttable. Engels: fringe / collar' },
  { id: 'jrg-baan-06', topic: 'baandelen', front: 'Apron',
    back: 'De korte aanloopstrook voor de green, tussen fairway en green; iets langer dan green maar korter dan fairway. Engels: apron' },
  { id: 'jrg-baan-07', topic: 'baandelen', front: 'Collar',
    back: 'Synoniem voor fringe: de smalle rand iets langer gras direct rond de green. Engels: collar · Zie ook: fringe' },
  { id: 'jrg-baan-08', topic: 'baandelen', front: 'Tee (afslagplaats)',
    back: 'De vlakke plek waar elke hole begint, gemarkeerd met twee markers. Je moet je bal tussen en max. 2 stoklengtes achter de markers afslaan. Engels: teeing ground / tee box' },
  { id: 'jrg-baan-09', topic: 'baandelen', front: 'Bunker',
    back: 'Met zand gevulde hindernis. Je mag je club niet groundden (zand raken) vóór de slag. Engels: bunker · Zie ook: waste area' },
  { id: 'jrg-baan-10', topic: 'baandelen', front: 'Waterhindernis (penalty area)',
    back: 'Gemarkeerd water- of terreingebied (gele of rode palen) waaruit je met één strafslag relief mag nemen. Engels: penalty area · Zie ook: lateral hazard' },
  { id: 'jrg-baan-11', topic: 'baandelen', front: 'Dogleg',
    back: 'Een hole die in zijn lengte afbuigt naar links of rechts, zodat je niet rechtdoor naar de green kunt slaan. Engels: dogleg left / dogleg right' },
  { id: 'jrg-baan-12', topic: 'baandelen', front: 'Out of bounds (OOB)',
    back: 'Gebied buiten de baan, meestal aangegeven met witte palen of een hek. Bal OOB = slag + afstand straf. Engels: out of bounds · Zie ook: provisional ball' },
  { id: 'jrg-baan-13', topic: 'baandelen', front: 'Ground under repair (GUR)',
    back: 'Door de baan als beschadigd aangemerkt gebied (vaak blauwe palen of witte lijn). Je mag er gratis uit droppen. Engels: ground under repair' },
  { id: 'jrg-baan-14', topic: 'baandelen', front: 'Casual water',
    back: 'Tijdelijke plas water op de baan (bv. na regen) die niet bedoeld is als hindernis. Je mag gratis relief nemen. Engels: temporary water / casual water' },
  { id: 'jrg-baan-15', topic: 'baandelen', front: 'Aanvliegroute',
    back: 'De ideale lijn waarlangs je de green of fairway wilt benaderen. In het Engels meestal "approach line". Engels: approach line' },

  // ─── Slagen ────────────────────────────────────────────
  { id: 'jrg-slag-01', topic: 'slagen', front: 'Drive',
    back: 'Lange afslag vanaf de tee, meestal met de driver. Bedoeld om zo ver mogelijk te komen op de fairway. Engels: drive · Zie ook: driver' },
  { id: 'jrg-slag-02', topic: 'slagen', front: 'Chip',
    back: 'Korte, lage slag rond de green; de bal rolt het grootste deel van de weg uit. Engels: chip · Zie ook: pitch, putt' },
  { id: 'jrg-slag-03', topic: 'slagen', front: 'Pitch',
    back: 'Korte, hoge slag naar de green; meer vlucht dan rol. Meestal met een wedge. Engels: pitch · Zie ook: chip, lob' },
  { id: 'jrg-slag-04', topic: 'slagen', front: 'Putt',
    back: 'Slag met de putter op de green, bedoeld om de bal rollend naar of in de hole te krijgen. Engels: putt · Zie ook: putter' },
  { id: 'jrg-slag-05', topic: 'slagen', front: 'Lob',
    back: 'Zeer hoge, korte slag met een lob wedge; de bal valt vrijwel verticaal en rolt nauwelijks. Engels: lob shot · Zie ook: lob wedge' },
  { id: 'jrg-slag-06', topic: 'slagen', front: 'Bunkerslag',
    back: 'Slag uit een bunker, meestal met een sand wedge; je raakt eerst het zand achter de bal en het zand werkt de bal eruit. Engels: bunker shot · Zie ook: sand wedge' },
  { id: 'jrg-slag-07', topic: 'slagen', front: 'Fade',
    back: 'Gecontroleerde balvlucht die voor een rechtshandige speler licht van links naar rechts buigt. Engels: fade · Zie ook: draw, slice' },
  { id: 'jrg-slag-08', topic: 'slagen', front: 'Draw',
    back: 'Gecontroleerde balvlucht die voor een rechtshandige speler licht van rechts naar links buigt. Engels: draw · Zie ook: fade, hook' },
  { id: 'jrg-slag-09', topic: 'slagen', front: 'Slice',
    back: 'Ongewenste balvlucht die voor een rechtshandige speler sterk naar rechts buigt. Engels: slice · Zie ook: fade, hook' },
  { id: 'jrg-slag-10', topic: 'slagen', front: 'Hook',
    back: 'Ongewenste balvlucht die voor een rechtshandige speler sterk naar links buigt. Engels: hook · Zie ook: draw, slice' },
  { id: 'jrg-slag-11', topic: 'slagen', front: 'Push',
    back: 'Bal die rechtdoor maar naar rechts van de target vliegt (rechtshandige speler), zonder zijwaartse curve. Engels: push · Zie ook: pull, slice' },
  { id: 'jrg-slag-12', topic: 'slagen', front: 'Pull',
    back: 'Bal die rechtdoor maar naar links van de target vliegt (rechtshandige speler), zonder zijwaartse curve. Engels: pull · Zie ook: push, hook' },
  { id: 'jrg-slag-13', topic: 'slagen', front: 'Top',
    back: 'Slechte slag waarbij je de bovenkant van de bal raakt; bal rolt laag en kort verder. Engels: topped shot' },
  { id: 'jrg-slag-14', topic: 'slagen', front: 'Shank',
    back: 'Slechte slag waarbij de bal de hosel van de club raakt en bijna haaks weg schiet (voor rechtshandige speler scherp naar rechts). Engels: shank' },
  { id: 'jrg-slag-15', topic: 'slagen', front: 'Mishit',
    back: 'Algemene term voor een slecht geraakte bal — niet op de sweet spot. Engels: mishit · Zie ook: top, shank' },
  { id: 'jrg-slag-16', topic: 'slagen', front: 'Sclaff (vetjes)',
    back: 'Slag waarbij je eerst de grond raakt vóór de bal; bal vliegt veel korter. Engels: fat shot / chunk · Zie ook: thin shot' },
  { id: 'jrg-slag-17', topic: 'slagen', front: 'Provisional',
    back: 'Voorlopige bal die je slaat als je vermoedt dat je vorige bal verloren of OOB is, om tijd te besparen. Engels: provisional ball · Zie ook: lost ball, OOB' },
  { id: 'jrg-slag-18', topic: 'slagen', front: 'Approach',
    back: 'Slag richting de green vanaf de fairway of rough, meestal binnen 150 meter. Engels: approach shot' },

  // ─── Clubs & uitrusting ────────────────────────────────
  { id: 'jrg-club-01', topic: 'clubs', front: 'Driver',
    back: 'De club met de laagste loft (≈9–12°) en de langste shaft; voor lange afslagen vanaf de tee. Engels: driver / 1-wood' },
  { id: 'jrg-club-02', topic: 'clubs', front: 'Fairway wood',
    back: 'Wood met meer loft dan de driver (3-, 5-, 7-wood); voor lange slagen vanaf fairway of tee. Engels: fairway wood' },
  { id: 'jrg-club-03', topic: 'clubs', front: 'Hybrid',
    back: 'Kruising tussen een wood en een iron; vergevingsgezinder dan een lange iron, vaak gebruikt ter vervanging van 3- of 4-iron. Engels: hybrid / rescue club' },
  { id: 'jrg-club-04', topic: 'clubs', front: 'Iron',
    back: 'Genummerde club (3 t/m 9) voor middellange tot korte slagen; hoe hoger het nummer, hoe meer loft en korter de afstand. Engels: iron' },
  { id: 'jrg-club-05', topic: 'clubs', front: 'Wedge',
    back: 'Iron met veel loft (45–64°) voor korte, hoge slagen naar de green of uit de bunker. Engels: wedge · Zie ook: PW, SW, LW' },
  { id: 'jrg-club-06', topic: 'clubs', front: 'Pitching wedge (PW)',
    back: 'Wedge met ≈44–48° loft; voor pitches op middellange afstand (80–120 m). Engels: pitching wedge' },
  { id: 'jrg-club-07', topic: 'clubs', front: 'Sand wedge (SW)',
    back: 'Wedge met ≈54–58° loft en brede sole, speciaal ontworpen voor bunkerslagen. Engels: sand wedge' },
  { id: 'jrg-club-08', topic: 'clubs', front: 'Lob wedge (LW)',
    back: 'Wedge met ≈58–64° loft voor zeer hoge, korte slagen die snel stoppen op de green. Engels: lob wedge' },
  { id: 'jrg-club-09', topic: 'clubs', front: 'Putter',
    back: 'Club met platte slagvlakte (loft ~3–4°) voor het rollen van de bal op de green. Engels: putter' },
  { id: 'jrg-club-10', topic: 'clubs', front: 'Loft',
    back: 'De hoek van de slagvlakte van een club t.o.v. verticaal. Meer loft = hogere balvlucht en kortere afstand. Engels: loft' },
  { id: 'jrg-club-11', topic: 'clubs', front: 'Lie',
    back: 'De hoek tussen shaft en sole van de club. Bepaalt hoe de club op de grond ligt en heeft invloed op de balrichting. Engels: lie angle' },
  { id: 'jrg-club-12', topic: 'clubs', front: 'Shaft flex',
    back: 'De stijfheid van de shaft (L, A, R, S, X). Sneller swingen = stijvere shaft nodig. Engels: shaft flex' },
  { id: 'jrg-club-13', topic: 'clubs', front: 'Grip',
    back: 'Het rubberen of leren handvat van de club. Ook gebruikt voor de manier waarop je de club vasthoudt (overlapping, interlocking, baseball). Engels: grip' },
  { id: 'jrg-club-14', topic: 'clubs', front: 'Tee (peg)',
    back: 'Het houten of plastic pennetje waarop je je bal plaatst op de afslagplaats. Engels: tee / peg' },
  { id: 'jrg-club-15', topic: 'clubs', front: 'Ballmarker',
    back: 'Klein plat voorwerp (vaak een muntje) waarmee je de positie van je bal op de green markeert vóór je hem oppakt. Engels: ball marker' },
  { id: 'jrg-club-16', topic: 'clubs', front: 'Pitchfork',
    back: 'Tweepuntig vorkje om pitchmarks op de green te repareren door rond de rand te prikken en naar binnen te duwen. Engels: divot tool / pitchfork' },
  { id: 'jrg-club-17', topic: 'clubs', front: 'Maximum aantal clubs',
    back: 'Je mag tijdens een ronde maximaal 14 clubs in je bag hebben. Méér clubs = straf (2 slagen per hole, max 4 in strokeplay). Engels: 14-club rule' },

  // ─── Spelvormen ────────────────────────────────────────
  { id: 'jrg-spel-01', topic: 'spelvormen', front: 'Strokeplay',
    back: 'Spelvorm waarbij elke speler zijn totaal aantal slagen over 18 holes telt; laagste totaal wint. Engels: stroke play / medal play' },
  { id: 'jrg-spel-02', topic: 'spelvormen', front: 'Matchplay',
    back: 'Spelvorm hole-voor-hole: per hole wint of verliest een speler/team; eindstand uitgedrukt in holes voor/achter. Engels: match play · Zie ook: strokeplay' },
  { id: 'jrg-spel-03', topic: 'spelvormen', front: 'Stableford',
    back: 'Spelvorm met puntentelling per hole op basis van score t.o.v. par (2 voor par, 3 voor birdie, etc.); hoogste totaal wint. Engels: Stableford' },
  { id: 'jrg-spel-04', topic: 'spelvormen', front: 'Foursome',
    back: 'Teamspel: twee spelers spelen om-en-om met één bal — speler A slaat af op oneven holes, speler B op even, daarna afwisselend. Engels: foursomes · Zie ook: greensome' },
  { id: 'jrg-spel-05', topic: 'spelvormen', front: 'Fourball',
    back: 'Teamspel: twee spelers per team spelen elk hun eigen bal; per hole telt de beste score van de twee. Engels: fourball / better-ball' },
  { id: 'jrg-spel-06', topic: 'spelvormen', front: 'Greensome',
    back: 'Teamspel: beide spelers slaan af, kiezen daarna de beste bal, en spelen die om-en-om uit. Engels: greensome · Zie ook: foursome' },
  { id: 'jrg-spel-07', topic: 'spelvormen', front: 'Scramble',
    back: 'Teamspel: alle spelers slaan elke slag; team kiest de beste bal en speelt vandaar verder. Engels: scramble' },
  { id: 'jrg-spel-08', topic: 'spelvormen', front: 'Texas scramble',
    back: 'Variant op scramble waarbij minimum aantal drives per speler verplicht is om te voorkomen dat alleen de longest hitter telt. Engels: Texas scramble' },

  // ─── Score & handicap ──────────────────────────────────
  { id: 'jrg-score-01', topic: 'score', front: 'Par',
    back: 'Het verwachte aantal slagen waarin een goede speler een hole speelt (par 3, 4 of 5). Engels: par' },
  { id: 'jrg-score-02', topic: 'score', front: 'Birdie',
    back: 'Score van één slag onder par op een hole (bv. 3 op een par-4). Engels: birdie · Zie ook: eagle' },
  { id: 'jrg-score-03', topic: 'score', front: 'Eagle',
    back: 'Score van twee slagen onder par op een hole (bv. 3 op een par-5). Engels: eagle · Zie ook: birdie, albatross' },
  { id: 'jrg-score-04', topic: 'score', front: 'Albatross',
    back: 'Score van drie slagen onder par op een hole (bv. 2 op een par-5). Zeldzaam. Engels: albatross / double eagle' },
  { id: 'jrg-score-05', topic: 'score', front: 'Bogey',
    back: 'Score van één slag boven par op een hole. Engels: bogey · Zie ook: double bogey' },
  { id: 'jrg-score-06', topic: 'score', front: 'Double bogey',
    back: 'Score van twee slagen boven par op een hole. Engels: double bogey · Zie ook: triple bogey' },
  { id: 'jrg-score-07', topic: 'score', front: 'Triple bogey',
    back: 'Score van drie slagen boven par op een hole. Engels: triple bogey' },
  { id: 'jrg-score-08', topic: 'score', front: 'Hole-in-one (ace)',
    back: 'Score van één slag op een hole — direct vanaf de tee in de hole. Meestal alleen op par-3 holes. Engels: hole-in-one / ace' },
  { id: 'jrg-score-09', topic: 'score', front: 'Handicap (exact)',
    back: 'Cijfer dat je speelsterkte aangeeft. Lager = beter. In Nederland gebruikt men het WHS-systeem; je exacte handicap (Handicap Index) gaat tot ongeveer 54. Engels: Handicap Index' },
  { id: 'jrg-score-10', topic: 'score', front: 'Playing handicap',
    back: 'Je handicap zoals die op deze specifieke baan, vanaf deze tees, geldt — basis voor je slagen-ontvangen in een wedstrijd. Engels: playing handicap' },
  { id: 'jrg-score-11', topic: 'score', front: 'Course handicap',
    back: 'Het aantal extra slagen dat je krijgt op een specifieke baan vanaf specifieke tees, berekend uit Handicap Index, Slope Rating en Course Rating. Engels: course handicap · Zie ook: slope' },
  { id: 'jrg-score-12', topic: 'score', front: 'Slope rating',
    back: 'Cijfer (55–155) dat aangeeft hoe moeilijk een baan is voor een gemiddelde amateur t.o.v. een scratch-speler. 113 = standaard. Engels: slope rating' },
  { id: 'jrg-score-13', topic: 'score', front: 'Course rating',
    back: 'Het aantal slagen waarin een scratch-speler de baan onder normale omstandigheden zou moeten spelen. Engels: course rating' },
  { id: 'jrg-score-14', topic: 'score', front: 'Stableford-punten',
    back: 'Per hole: 0 punten ≥2 boven netto par, 1 = +1, 2 = par, 3 = birdie, 4 = eagle, etc. Engels: Stableford points · Zie ook: stableford' },
  { id: 'jrg-score-15', topic: 'score', front: 'EGA / WHS',
    back: 'EGA was het Europese handicap-systeem; sinds 2020 vervangen door het wereldwijde World Handicap System (WHS). Engels: World Handicap System' },
  { id: 'jrg-score-16', topic: 'score', front: 'GVB',
    back: 'Golfvaardigheidsbewijs: Nederlands certificaat dat aantoont dat je de basisregels, etiquette en veiligheid van golf beheerst. Engels: (NL-specifiek)' },
  { id: 'jrg-score-17', topic: 'score', front: 'Qualifying kaart',
    back: 'Een ronde gespeeld onder wedstrijdcondities waarvan de score telt voor handicap-aanpassing. Engels: qualifying round' },
  { id: 'jrg-score-18', topic: 'score', front: 'Scratch-speler',
    back: 'Speler met handicap 0,0 — speelt onder normale omstandigheden de course rating. Engels: scratch golfer' },

  // ─── Regels & procedures ───────────────────────────────
  { id: 'jrg-regel-01', topic: 'regels', front: 'Drop',
    back: 'De bal vanuit kniehoogte op de juiste plek laten vallen om hem weer in het spel te brengen na relief of straf. Engels: drop' },
  { id: 'jrg-regel-02', topic: 'regels', front: 'Relief',
    back: 'Verlichting krijgen van een ongewenste situatie (GUR, casual water, obstakel, etc.) door op een toegestane plek te droppen. Engels: relief' },
  { id: 'jrg-regel-03', topic: 'regels', front: 'Nearest point of relief',
    back: 'Het dichtstbijzijnde punt waar de hindering volledig is opgeheven, niet dichter bij de hole, zonder de bal in het spel te brengen. Vanaf daar drop je binnen 1 stoklengte. Engels: nearest point of relief' },
  { id: 'jrg-regel-04', topic: 'regels', front: 'Lateral hazard (rode penalty area)',
    back: 'Penalty area met rode palen — naast de bovenstaande relief-opties mag je ook binnen 2 stoklengtes droppen op de plek waar de bal de rand kruiste. Engels: lateral penalty area (red)' },
  { id: 'jrg-regel-05', topic: 'regels', front: 'Yellow penalty area',
    back: 'Penalty area met gele palen — je mag terug op de lijn tussen hole en kruispunt droppen, of opnieuw vanaf de vorige plek slaan. Engels: penalty area (yellow)' },
  { id: 'jrg-regel-06', topic: 'regels', front: 'Provisional ball',
    back: 'Bal die je extra slaat als je vermoedt dat je oorspronkelijke bal verloren of OOB is. Moet je aankondigen ("ik speel een provisional"). Engels: provisional ball' },
  { id: 'jrg-regel-07', topic: 'regels', front: 'Lost ball',
    back: 'Een bal is verloren als je hem niet binnen 3 minuten zoeken vindt. Straf: slag + afstand (terug naar plek van vorige slag, +1 strafslag). Engels: lost ball' },
  { id: 'jrg-regel-08', topic: 'regels', front: 'Unplayable',
    back: 'Je mag op elk moment (behalve in een penalty area) verklaren dat je bal onspeelbaar ligt. Kost 1 strafslag; daarna drie drop-opties. Engels: unplayable lie' },
  { id: 'jrg-regel-09', topic: 'regels', front: 'Free drop',
    back: 'Drop zonder strafslag, bv. uit GUR of bij een vast obstakel. Engels: free relief drop' },
  { id: 'jrg-regel-10', topic: 'regels', front: 'Penalty drop',
    back: 'Drop met strafslag(en), bv. na waterhindernis of unplayable. Engels: penalty drop' },
  { id: 'jrg-regel-11', topic: 'regels', front: 'Gimme',
    back: 'In matchplay: een korte putt die je tegenstander "geeft" — je hoeft hem niet uit te putten. Bestaat niet in strokeplay. Engels: gimme' },
  { id: 'jrg-regel-12', topic: 'regels', front: 'Ready golf',
    back: 'Speel-volgorde-conventie in strokeplay: degene die klaar is en veilig kan slaan, slaat — i.p.v. strikt op "eer" te wachten. Versnelt het spel. Engels: ready golf' },
  { id: 'jrg-regel-13', topic: 'regels', front: 'Eer (honour)',
    back: 'Het recht om als eerste af te slaan op een hole. Heeft de speler met de laagste score op de vorige hole. Engels: honour / honor' },
  { id: 'jrg-regel-14', topic: 'regels', front: 'Marker (score)',
    back: 'De medespeler die jouw scorekaart bijhoudt en aan het einde van de ronde tekent. Niet te verwarren met ballmarker. Engels: marker (scorer)' },
  { id: 'jrg-regel-15', topic: 'regels', front: 'Verkeerde bal',
    back: 'Slaan met een bal die niet de jouwe is. Straf: 2 strafslagen (strokeplay) of verlies van de hole (matchplay). Engels: wrong ball' },
  { id: 'jrg-regel-16', topic: 'regels', front: 'Strokes & distance',
    back: 'Standaardstraf voor verloren of OOB-bal: 1 strafslag plus terug naar de plek van je vorige slag. Engels: stroke and distance' },
  { id: 'jrg-regel-17', topic: 'regels', front: 'Pin (vlaggenstok)',
    back: 'De stok in de hole met een vlag eraan. Sinds 2019 mag je putten met de pin in de hole. Engels: flagstick / pin' },
  { id: 'jrg-regel-18', topic: 'regels', front: 'Pitchmark',
    back: 'Inslagkrater van een bal op de green. Verplicht meteen repareren (mag van jou én van anderen). Engels: pitch mark / ball mark · Zie ook: pitchfork' },
  { id: 'jrg-regel-19', topic: 'regels', front: 'Plag (divot)',
    back: 'Stuk gras dat je losslaat van de fairway. Verplicht terugleggen of het gat opvullen met zand-zaadmengsel. Engels: divot' },
];
```

- [ ] **Step 2: Build to verify the file parses**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/data/jargon.js
git commit -m "$(cat <<'EOF'
feat(jargon): voeg dataset met 85 jargon-kaarten toe

Zes onderwerpen (baandelen, slagen, clubs, spelvormen, score,
regels) met Nederlandse definities en Engelse term per kaart.
EOF
)"
```

---

## Task 3: Wire mode switching into App + Home + CSS

This task contains coupled changes (App state, Home props, segmented control UI, CSS). They are committed together because intermediate states would render a broken home screen.

**Files:**

- Modify: `src/App.jsx`
- Modify: `src/components/Home.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Rewrite `src/App.jsx`**

Replace the entire contents of `src/App.jsx` with:

```jsx
import { useState } from 'react';
import { flashcards, topics } from './data/flashcards.js';
import { jargonCards, jargonTopics } from './data/jargon.js';
import { useProgress } from './hooks/useProgress.js';
import Home from './components/Home.jsx';
import Study from './components/Study.jsx';
import Done from './components/Done.jsx';

function shuffle(arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const MODES = {
  gvb: {
    label: 'GVB-vragen',
    cards: flashcards,
    topics: topics,
    storageKey: 'golfregels.progress.v1',
  },
  jargon: {
    label: 'Jargon',
    cards: jargonCards,
    topics: jargonTopics,
    storageKey: 'golfregels.jargon.v1',
  },
};

export default function App() {
  const [view, setView] = useState('home');
  const [mode, setMode] = useState('gvb');
  const [selectedTopics, setSelectedTopics] = useState(() => ({
    gvb: new Set(Object.keys(topics)),
    jargon: new Set(Object.keys(jargonTopics)),
  }));
  const [pool, setPool] = useState([]);
  const [doneStats, setDoneStats] = useState({ learned: 0, practice: 0 });

  const gvbProgress = useProgress(MODES.gvb.storageKey);
  const jargonProgress = useProgress(MODES.jargon.storageKey);
  const progressByMode = { gvb: gvbProgress, jargon: jargonProgress };

  const activeMode = MODES[mode];
  const activeProgress = progressByMode[mode];
  const activeSelected = selectedTopics[mode];

  const toggleTopic = (id) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev[mode]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { ...prev, [mode]: next };
    });
  };

  const startSession = () => {
    const ids = activeMode.cards
      .filter((c) => activeSelected.has(c.topic))
      .map((c) => c.id);
    if (ids.length === 0) return;
    setPool(shuffle(ids));
    setView('study');
  };

  const startPracticeAgain = () => {
    const practiceIds = Object.keys(activeProgress.progress).filter(
      (id) => activeProgress.progress[id] === 'practice'
    );
    if (practiceIds.length === 0) return;
    setPool(shuffle(practiceIds));
    setView('study');
  };

  const completeSession = (stats) => {
    setDoneStats(stats);
    setView('done');
  };

  const goHome = () => setView('home');

  const hasPractice = Object.values(activeProgress.progress).some(
    (s) => s === 'practice'
  );

  return (
    <div className="app">
      {view === 'home' && (
        <Home
          mode={mode}
          onModeChange={setMode}
          modes={MODES}
          topics={activeMode.topics}
          cards={activeMode.cards}
          selectedTopics={activeSelected}
          onToggleTopic={toggleTopic}
          onStart={startSession}
          progress={activeProgress.progress}
          onReset={activeProgress.reset}
          storageAvailable={activeProgress.storageAvailable}
        />
      )}
      {view === 'study' && (
        <Study
          pool={pool}
          cards={activeMode.cards}
          onMark={activeProgress.mark}
          onExit={goHome}
          onComplete={completeSession}
        />
      )}
      {view === 'done' && (
        <Done
          stats={doneStats}
          onPracticeAgain={startPracticeAgain}
          onHome={goHome}
          hasPractice={hasPractice}
        />
      )}
    </div>
  );
}
```

Notes:
- `mode` is only mutable from the Home view (the segmented control). Once a session starts, the active mode stays put through Study and Done.
- `selectedTopics` is now an object keyed by mode so switching modes preserves your last selection in each.
- `MODES` is declared once at module scope; both progress hooks always run unconditionally (required by Rules of Hooks).

- [ ] **Step 2: Rewrite `src/components/Home.jsx`**

Replace the entire contents of `src/components/Home.jsx` with:

```jsx
export default function Home({
  mode,
  onModeChange,
  modes,
  topics,
  cards,
  selectedTopics,
  onToggleTopic,
  onStart,
  progress,
  onReset,
  storageAvailable,
}) {
  const topicIds = Object.keys(topics);

  const stats = topicIds.reduce((acc, id) => {
    const topicCards = cards.filter((c) => c.topic === id);
    const known = topicCards.filter((c) => progress[c.id] === 'known').length;
    const practice = topicCards.filter((c) => progress[c.id] === 'practice').length;
    acc[id] = { total: topicCards.length, known, practice };
    return acc;
  }, {});

  const selectedCount = cards.filter((c) => selectedTopics.has(c.topic)).length;

  const handleReset = () => {
    const label = modes[mode].label;
    if (window.confirm(`Weet je zeker dat je alle voortgang van "${label}" wilt wissen?`)) {
      onReset();
    }
  };

  const modeIds = Object.keys(modes);

  return (
    <div className="home">
      <h1>GVB Oefenen</h1>

      <div className="mode-switch" role="tablist" aria-label="Studie-modus">
        {modeIds.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            className={`mode-switch__btn ${mode === id ? 'mode-switch__btn--active' : ''}`}
            onClick={() => onModeChange(id)}
          >
            {modes[id].label}
          </button>
        ))}
      </div>

      <p className="home__intro">
        Kies één of meer onderwerpen en start een oefensessie.
      </p>

      <div className="home__topics">
        {topicIds.map((id) => {
          const t = topics[id];
          const s = stats[id];
          const checked = selectedTopics.has(id);
          return (
            <label
              key={id}
              className={`topic ${checked ? 'topic--checked' : ''}`}
              style={{ borderColor: checked ? t.color : 'transparent' }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleTopic(id)}
              />
              <span className="topic__dot" style={{ background: t.color }} />
              <span className="topic__label">{t.label}</span>
              <span className="topic__counts">
                {s.known}/{s.total} geleerd · {s.practice} nog oefenen
              </span>
            </label>
          );
        })}
      </div>

      <button
        className="btn btn--primary"
        onClick={onStart}
        disabled={selectedCount === 0}
      >
        Start oefenen ({selectedCount} kaarten)
      </button>

      <button className="btn btn--secondary" onClick={handleReset}>
        Reset voortgang
      </button>

      {!storageAvailable && (
        <p className="home__warning">
          Voortgang wordt niet bewaard (browser-instelling blokkeert opslag).
        </p>
      )}
    </div>
  );
}
```

Note: the import of `topics` / `flashcards` from `../data/flashcards.js` is removed; all data now arrives via props.

- [ ] **Step 3: Add segmented control CSS in `src/App.css`**

Append the following block at the end of `src/App.css` (just below the existing `/* ─── Done ─── */` section, before the file ends):

```css
/* ─── Mode switch ──────────────────────────────────────── */
.mode-switch {
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  margin: 0 0 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
}
.mode-switch__btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--text-muted);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.mode-switch__btn:hover {
  color: var(--text);
}
.mode-switch__btn--active {
  background: var(--accent);
  color: var(--warning-text);
}
.mode-switch__btn--active:hover {
  color: var(--warning-text);
}
```

- [ ] **Step 4: Build to verify everything compiles**

Run: `npm run build`
Expected: build succeeds, no JSX/import errors, `dist/` is fresh.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/components/Home.jsx src/App.css
git commit -m "$(cat <<'EOF'
feat(home): voeg jargon-modus toe met segmented control

App houdt nu twee onafhankelijke voortgangs-stores aan
(gvb / jargon) en switcht via een tabbed control bovenaan
het home-scherm tussen de twee dekken. Study- en Done-flow
zijn ongewijzigd en werken voor beide modi.
EOF
)"
```

---

## Task 4: Final verification + hand-off

**Files:** none modified.

- [ ] **Step 1: Confirm the working tree is clean and on `main`**

Run: `git status` and `git log --oneline -5`
Expected: clean working tree; the last three commits are the ones from Tasks 1–3 on `main`.

- [ ] **Step 2: Final build**

Run: `npm run build`
Expected: build succeeds.

- [ ] **Step 3: Hand off to the user for manual smoke test**

Tell the user:

> The implementation is on `main` (three commits). You can smoke-test with `npm run dev` and check:
> 1. Home shows a "GVB-vragen | Jargon" toggle at the top; GVB is selected by default and looks identical to before.
> 2. Clicking "Jargon" swaps in 6 new topic rows with their own counts; "Start oefenen ({n} kaarten)" shows ~85 when all are checked.
> 3. A jargon session flips the card, accepts 1 / 2 / → / Esc, and re-queues "nog oefenen" once.
> 4. Marking known/practice in jargon doesn't affect the GVB counts (and vice versa).
> 5. "Reset voortgang" while in jargon mode mentions "Jargon" in the dialog and only wipes jargon progress.
> 6. After Done, "Terug naar home" lands back on the same mode you were studying.

---

## Self-Review Notes

- **Spec coverage:** Task 1 ↔ "Progress / useProgress geparametriseerd". Task 2 ↔ "Data". Task 3 ↔ "App state" + "Home-scherm" + "Study- en Done-flow" (hergebruik). Acceptatiecriteria 1–7 are all observable via the Step-3 hand-off checks.
- **Types:** `MODES[mode]` shape `{ label, cards, topics, storageKey }` is consistent across App.jsx and the props passed to Home.jsx. Progress shape `{ progress, mark, reset, storageAvailable }` matches what Home/Study/Done already consume.
- **No placeholders:** all CSS, JS, and shell commands are concrete.
