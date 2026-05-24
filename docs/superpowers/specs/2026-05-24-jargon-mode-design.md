# Jargon-modus — ontwerp

Datum: 2026-05-24

## Doel

Een tweede studie-modus toevoegen aan de app, naast de bestaande GVB-vragen, voor het oefenen van golf-specifiek jargon (Nederlands ↔ Engels + definitie). Bereikbaar via het home-scherm.

## Scope

In scope:

- Nieuwe dataset van ~85 jargon-kaarten in zes onderwerpen.
- Aparte voortgangsopslag per modus (`localStorage`).
- Mode-switch bovenaan het home-scherm; verder geen UX-wijzigingen.
- Hergebruik van bestaande `Study`, `Card`, `Done` componenten.

Buiten scope (expliciet weggelaten):

- Zoekveld of alfabetisch register
- Tweezijdig oefenen (term→definitie én definitie→term)
- Cross-modus "alles oefenen"
- Migratie van bestaande progress-key
- Klikbare "Zie ook"-links

## Architectuur

### Data

Nieuw bestand `src/data/jargon.js`. Zelfde shape als `src/data/flashcards.js`:

```js
export const jargonTopics = {
  baandelen:   { label: 'Baandelen',         color: '#…' },
  slagen:      { label: 'Slagen',            color: '#…' },
  clubs:       { label: 'Clubs & uitrusting', color: '#…' },
  spelvormen:  { label: 'Spelvormen',        color: '#…' },
  score:       { label: 'Score & handicap',  color: '#…' },
  regels:      { label: 'Regels & procedures', color: '#…' },
};

export const jargonCards = [
  {
    id: 'jrg-baan-01',
    topic: 'baandelen',
    front: 'Fairway',
    back: 'Het kort gemaaide deel van de hole tussen tee en green, bedoeld als ideale landingszone. Engels: fairway · Zie ook: rough, semi-rough',
  },
  // …~85 kaarten in totaal
];
```

Conventies:

- Card-ids met prefix `jrg-<topic>-NN` zodat ze nooit botsen met GVB card-ids.
- Back-tekst eindigt met `Engels: <term>` en, waar zinvol, `· Zie ook: <related-term>`.
- Definities ~1–2 zinnen.
- Topic-kleuren zijn duidelijk anders dan de GVB-topic-kleuren.

### Onderwerpen en voorbeelden

| Topic        | Voorbeeldtermen                                                                  |
| ------------ | -------------------------------------------------------------------------------- |
| Baandelen    | fairway, rough, semi-rough, green, fringe, apron, collar, tee, bunker, waterhindernis, dogleg, OOB, GUR, casual water |
| Slagen       | drive, chip, pitch, putt, lob, bunker shot, fade, draw, slice, hook, push, pull, top, shank, mishit, sclaff |
| Clubs        | driver, wood, hybrid, iron, wedge (PW/SW/LW), putter, loft, lie, shaft flex, grip, tee (peg), marker, pitchfork |
| Spelvormen   | strokeplay, matchplay, stableford, foursome, fourball, greensome, scramble, texas scramble |
| Score        | par, birdie, eagle, albatross, bogey, double bogey, ace, handicap, playing handicap, course handicap, stableford-punten, EGA |
| Regels       | drop, relief, nearest point of relief, lateral hazard, provisional ball, lost ball, unplayable, free drop, penalty drop, gimme, ready golf, eer/honour, marker (score) |

### Progress

Aparte `localStorage`-sleutel per modus:

- GVB: `golfregels.progress.v1` (bestaand, ongewijzigd)
- Jargon: `golfregels.jargon.v1` (nieuw)

Beide bewaren dezelfde shape: `{ [cardId]: 'known' | 'practice' }`.

`useProgress` wordt geparametriseerd:

```js
useProgress(storageKey)
```

Bestaande callsite in `App.jsx` wordt expliciet `useProgress('golfregels.progress.v1')`. Tweede instantie wordt `useProgress('golfregels.jargon.v1')`.

### App state

Toevoegen aan `App.jsx`:

- `mode: 'gvb' | 'jargon'` — default `'gvb'`.
- Twee `useProgress`-instanties, één per sleutel.
- Bestaande state (`view`, `selectedTopics`, `pool`, `doneStats`) blijft. `selectedTopics` wordt per modus apart bijgehouden (twee Sets of een `{gvb, jargon}` object) zodat schakelen tussen modi de eerdere selectie behoudt.
- Op basis van `mode` worden de juiste `cards`, `topics`, `progress`, en `mark` naar Home/Study/Done doorgegeven.

Routing blijft een `useState`-switch (`'home' | 'study' | 'done'`); geen router toegevoegd. Na "Terug naar home" blijft de modus geselecteerd.

### Home-scherm

Layout-volgorde van boven naar beneden:

1. `<h1>` titel (bestaande)
2. **Nieuw:** segmented control met twee opties: `GVB-vragen` | `Jargon` — togglet `mode`.
3. Korte introtekst (per modus iets aangepast).
4. Topic-checkboxes (gerenderd vanuit `topics[mode]` met progress per modus).
5. "Start oefenen ({n} kaarten)"-knop.
6. "Reset voortgang"-knop — reset alleen de actieve modus; bevestigingsdialoog noemt de modus expliciet.
7. Storage-warning indien van toepassing.

Visueel volgt het segmented control de bestaande button-/topic-styling. Nieuwe CSS-klasse: `.mode-switch`. Geen wijzigingen aan bestaande klassen.

### Study- en Done-flow

Volledig hergebruikt. Geen prop-wijzigingen aan `Study.jsx`, `Card.jsx`, of `Done.jsx`. `App` geeft simpelweg de cards/topics/mark van de actieve modus door.

## Bestanden

Toegevoegd:

- `src/data/jargon.js`
- `docs/superpowers/specs/2026-05-24-jargon-mode-design.md` (dit document)
- `docs/superpowers/plans/2026-05-24-jargon-mode.md` (komt via writing-plans)

Gewijzigd:

- `src/hooks/useProgress.js` — accepteert `storageKey` parameter
- `src/App.jsx` — `mode` state, tweede progress hook, mode-routering
- `src/components/Home.jsx` — `mode`/`onModeChange` props, segmented control, mode-specifieke render
- `src/App.css` — `.mode-switch` styling

Niet aangeraakt:

- `src/components/Study.jsx`, `src/components/Card.jsx`, `src/components/Done.jsx`
- `vite.config.js`, `deploy.sh`, `index.html`
- Bestaande GVB-data en GVB-progress-sleutel

## Build & deploy

Geen wijzigingen aan `vite.config.js` (`base: '/golf/'` blijft) of `deploy.sh`.

## Acceptatiecriteria

- Op `/golf/` toont het home-scherm een segmented control bovenaan met "GVB-vragen" geselecteerd; topic-lijst en counts identiek aan vóór de wijziging.
- Klik op "Jargon" laat de jargon-topics zien met eigen counts, eigen "Start oefenen"-knop, en eigen reset-bevestiging.
- Een jargon-sessie loopt door de bestaande Study-flow (flip, 1/2/→/Esc, herhaalt "nog oefenen" eenmaal, eindigt op Done).
- "Geleerd" en "nog oefenen" markeringen in jargon raken de GVB-voortgang niet, en omgekeerd.
- `localStorage.golfregels.progress.v1` en `localStorage.golfregels.jargon.v1` worden onafhankelijk geschreven en gelezen.
- "Terug naar home" vanaf Done houdt de modus vast waarin de sessie liep.
- Bij `localStorage`-blokkade verschijnt de bestaande waarschuwing; sessies werken nog steeds (in-memory).
