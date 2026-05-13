# GVB Flashcard Oefen Tool — Design

**Datum:** 2026-05-13
**Doel:** Interactieve flashcard-tool om te oefenen voor het NGF GVB (Golfvaardigheidsbewijs) examen.

## Scope

Een lokaal draaiende web-app met flashcards over de essentiële GVB-stof. De gebruiker kan oefenen per onderwerp, kaarten markeren als "ken ik" of "nog oefenen", en zijn voortgang wordt bewaard tussen sessies via localStorage.

**Examen:** NGF GVB
**Aantal kaarten:** ~60-100 totaal (15-25 per onderwerp, 4 onderwerpen)

## Stack

- **Build tool:** Vite
- **Framework:** React (JavaScript, geen TypeScript)
- **Styling:** Plain CSS (één `App.css`)
- **Storage:** Browser `localStorage`
- Geen routing, geen state-library, geen UI-library — alles in `useState` + één custom hook.

## Onderwerpen

1. **Etiquette & veiligheid** — veiligheid op de baan, voorrang, tempo, gedragsregels, kleding
2. **Baanregels** — hindernissen (rood/geel), bunkers, green, out of bounds, verloren bal, drop-procedures
3. **Strafslagen & procedures** — wanneer welke straf, onspeelbare bal, provisional bal, identificatie
4. **Handicap & scorekaart** — EGA handicap, stableford, scorekaart invullen, slope/course rating

## Data

Eén bestand `src/data/flashcards.js` exporteert een array van flashcard-objecten:

```js
export const flashcards = [
  {
    id: 'etq-01',
    topic: 'etiquette',
    front: 'Wanneer roep je "Fore"?',
    back: 'Direct wanneer er kans is dat een bal in de richting van andere personen vliegt.'
  },
  // ...
];
```

**Veld-conventies:**
- `id` — uniek, formaat `<topic-prefix>-<nummer>`. Prefixes: `etq`, `baan`, `straf`, `hcp`.
- `topic` — één van: `etiquette`, `baanregels`, `straf`, `handicap`.
- `front` — vraag of stelling (string).
- `back` — antwoord/uitleg (string, mag meerdere zinnen).

**Topic-metadata** wordt apart geëxporteerd:

```js
export const topics = {
  etiquette: { label: 'Etiquette & veiligheid', color: '#...' },
  baanregels: { label: 'Baanregels', color: '#...' },
  straf: { label: 'Strafslagen & procedures', color: '#...' },
  handicap: { label: 'Handicap & scorekaart', color: '#...' },
};
```

## Schermen

De app is een single page met conditionele weergave op basis van een `view`-state (`'home' | 'study' | 'done'`).

### 1. Home / Filter (`view === 'home'`)

- Titel "GVB Oefenen"
- Lijst met de 4 onderwerpen als toggleable chips/checkboxes
- Per onderwerp: totaal aantal kaarten + aantal "ken ik" + aantal "nog oefenen"
- Algemene voortgangsbalk (over geselecteerde onderwerpen)
- Knop **Start oefenen** — disabled als geen onderwerp geselecteerd
- Knop **Reset voortgang** — opent `confirm()` dialoog
- Default: alle onderwerpen geselecteerd

### 2. Studie (`view === 'study'`)

- Voortgangsbalk bovenaan: "`<huidig>` / `<totaal>` — `<geleerd>` geleerd"
- Kruisje (✕) rechtsboven → terug naar home
- **Kaart:**
  - Voorkant: vraag in grote letters, hint "Klik om antwoord te zien" of toets `spatie`
  - Klik of spatie → flip naar achterkant met antwoord
- **Knoppen onder kaart** (alleen zichtbaar nadat kaart geflipt is):
  - **Ken ik** (groen) — markeert kaart als `known`, naar volgende kaart
  - **Nog oefenen** (oranje) — markeert kaart als `practice`, naar volgende kaart
  - **Skip** (grijs, secundair) — naar volgende kaart zonder markeren

### 3. Klaar (`view === 'done'`)

- "Goed gedaan!" + samenvatting: aantal geleerd, aantal nog te oefenen
- Knop **Oefen herhalingen** — start nieuwe sessie met alleen `practice`-kaarten (disabled als 0)
- Knop **Terug naar home**

## Volgorde-algoritme

Bij `Start oefenen`:
1. Filter alle kaarten op geselecteerde onderwerpen → `pool`
2. Shuffle `pool` (Fisher-Yates)
3. Loop door `pool`. Als gebruiker een kaart als `practice` markeert: voeg de kaart één keer achter in de huidige `pool` toe (max één extra herhaling per sessie, om eindeloze loops te voorkomen — track met een Set van card-ids die al opnieuw zijn ingepland).
4. Als `pool` leeg is → `view = 'done'`.

Geen volwaardige spaced repetition. Eenvoudige "weighted retry" volstaat voor een examen-oefen-tool.

## State & persistence

**App-state (in-memory, in `App.jsx`):**
- `view`: `'home' | 'study' | 'done'`
- `selectedTopics`: `Set<string>` (default: alle 4)
- `pool`: `string[]` — kaart-ids in huidige studiesessie
- `currentIndex`: `number`
- `flipped`: `boolean`
- `sessionStats`: `{ learned: number, practice: number }`

**Persistente state (localStorage via `useProgress` hook):**
- Key: `golfregels.progress.v1`
- Waarde: `{ [cardId: string]: 'known' | 'practice' }`
- Hook API: `const { progress, mark, reset } = useProgress()`
  - `mark(cardId, status)` — set status, schrijf weg
  - `reset()` — wis localStorage en in-memory state

Versie-suffix `.v1` in de key zodat we later kunnen migreren zonder oude data te corrumperen.

**LocalStorage fallback:** Als `localStorage` gooit (privé-modus, quota), val terug op een in-memory object voor de sessie. Toon één kleine waarschuwing onderaan home: "Voortgang wordt niet bewaard (browser-instelling)."

## Bestandsstructuur

```
golfregels/
├── index.html
├── package.json
├── vite.config.js
├── .gitignore
├── README.md
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-13-golf-flashcards-design.md   (deze file)
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── data/
    │   └── flashcards.js
    ├── components/
    │   ├── Home.jsx
    │   ├── Study.jsx
    │   ├── Card.jsx
    │   └── Done.jsx
    └── hooks/
        └── useProgress.js
```

## Edge cases

- **Geen onderwerpen geselecteerd** → "Start oefenen" disabled.
- **Reset voortgang** → `window.confirm('Weet je zeker dat je alle voortgang wilt wissen?')` voordat geleegd wordt.
- **LocalStorage niet beschikbaar** → in-memory fallback + waarschuwing op home.
- **Lege practice-pool op done-scherm** → "Oefen herhalingen" disabled.
- **Toetsenbord:** Spatie = flip, `1` = Ken ik, `2` = Nog oefenen, `→` = Skip, `Esc` = terug naar home. (Alleen actief op studie-scherm.)

## Testing

Handmatige verificatie (geen unit tests in deze scope — single-developer leertool):
- Start sessie met alle onderwerpen, verifieer dat shuffle willekeurig lijkt
- Markeer een kaart als "nog oefenen", check dat hij later in dezelfde sessie terugkomt
- Markeer als "ken ik", check dat hij niet terugkomt
- Refresh browser, check dat "ken ik"-status behouden is op home
- Reset voortgang, check dat alle counts naar 0 gaan
- Test in incognito-modus (localStorage geblokkeerd) → fallback werkt

## Out of scope (YAGNI)

- Multiple-choice quiz / examensimulatie met tijd
- Accounts, sync tussen apparaten
- Kaarten zelf toevoegen of bewerken via UI
- Spaced repetition met intervallen over dagen
- Statistieken/grafieken over tijd
- Mobiele swipe-gestures (klik/toetsen volstaat)
- Internationalisatie — alles in het Nederlands

Als de tool nuttig blijkt en je wil quiz-modus of mobiele optimalisatie, breiden we het uit. Tot die tijd: minimal viable leertool.
