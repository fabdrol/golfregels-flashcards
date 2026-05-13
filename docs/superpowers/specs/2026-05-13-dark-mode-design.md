# Dark Mode (Golfbaan-thema) — Design

**Datum:** 2026-05-13
**Doel:** De GVB-flashcard tool een permanente dark-mode huid geven met golfbaan-sfeer: diep bosgroen als basis, warme cream-tekst, accentgoud, en donkere opgetilde kaarten.

## Scope

Pure her-styling. Geen toggle, geen system-preference detectie, geen light-mode variant. De app is altijd dark.

**Wel:** kleurenpalet, kaart-styling, knop-stijlen, schaduwen, focus-rings, topic-chip kleuren, scrollbar-tint (optioneel native).
**Niet:** layout-veranderingen, nieuwe componenten, animaties, font-changes.

## Kleurenpalet

CSS custom properties gedefinieerd in `:root`. Eén theme nu — variabelen maken een toekomstige toggle een ~30-minuten klus i.p.v. herschrijven.

```css
:root {
  /* Grass deep — basis-achtergrond */
  --bg: #0d1f15;

  /* Surfaces (kaarten, topic-rijen, raised UI) */
  --surface: #19302a;
  --surface-hover: #234037;
  --border: #2c4a3d;

  /* Tekst */
  --text: #f0e8d4;        /* perkament cream */
  --text-muted: #8fa599;  /* muted sage */

  /* Accenten */
  --accent: #d4a557;        /* goud — flag stick / late zon */
  --accent-hover: #e0b870;
  --success: #4caf50;       /* "Ken ik" — verse fairway */
  --warning: #d4a557;       /* "Nog oefenen" — zand/bunker */
  --warning-text: #1a1a1a;  /* donkere tekst op gouden knop */

  /* Topic-kleuren (in flashcards.js zit alleen de hex; deze waarden zijn de bron) */
  --topic-etiquette: #81c784;
  --topic-baanregels: #64b5f6;
  --topic-straf: #ef5350;
  --topic-handicap: #ba68c8;

  /* Storage-warning kleurvlak */
  --warning-bg: rgba(212, 165, 87, 0.12);
  --warning-border: #d4a557;

  /* Schaduw */
  --shadow-card: 0 6px 24px rgba(0, 0, 0, 0.4);
  --shadow-card-hover: 0 10px 30px rgba(0, 0, 0, 0.5);
}
```

## Componenten-stijlwijzigingen

### Body / globaal
- `body` — `background: var(--bg); color: var(--text);`
- Geen verandering aan font-stack of `.app` layout.

### `.card` (de flashcard zelf)
- `background: var(--surface)` (geen wit meer)
- `border: 1px solid var(--border)`
- `box-shadow: var(--shadow-card)`
- Hover: `box-shadow: var(--shadow-card-hover); transform: translateY(-2px);` (zelfde gedrag, andere shadow)
- Focus-visible: `outline: 2px solid var(--accent)` (goud i.p.v. blauw)
- Tekst neemt over van body (cream)

### `.topic` (topic-rijen op home)
- `background: var(--surface)`
- Border kleur: blijft inline gestyled met topic-kleur als checked, anders `transparent`
- Hover: subtiel naar `var(--surface-hover)` (optioneel)

### Knoppen
- `.btn--primary` (Start, Oefen herhalingen) — `background: var(--accent); color: var(--warning-text)` (donkere tekst op goud)
- `.btn--secondary` (Reset, Home) — `color: var(--text-muted)`, transparant
- `.btn--known` — `background: var(--success); color: var(--warning-text)` (groen blijft, alleen donkere tekst i.p.v. wit voor leesbaarheid op de helderder groen)
- `.btn--practice` — `background: var(--warning); color: var(--warning-text)`
- `.btn--skip` — transparant + `border: 1px solid var(--border)`, tekstkleur `var(--text-muted)`
- Disabled: `opacity: 0.4` (was 0.45, iets meer contrast in dark)

### Study-scherm progress bar
- `.study__progress-bar` — `background: var(--border)`
- `.study__progress-fill` — `background: var(--accent)` (goud)

### Exit-knop (✕)
- `color: var(--text-muted)`
- Hover-achtergrond: `var(--surface-hover)`

### Home warning (storage niet beschikbaar)
- `background: var(--warning-bg)`
- `border-left: 4px solid var(--warning-border)`

### Done-scherm
- `.done__stat-num` — `color: var(--accent)` (goud i.p.v. blauw)

## Topic-kleuren update

`src/data/flashcards.js` — alleen de 4 kleuren in `topics`:

| Topic | Oude (light) | Nieuwe (dark) |
|---|---|---|
| etiquette | `#2e7d32` | `#81c784` |
| baanregels | `#1565c0` | `#64b5f6` |
| straf | `#c62828` | `#ef5350` |
| handicap | `#6a1b9a` | `#ba68c8` |

Labels, ids en card-content blijven ongewijzigd.

## Bestanden die wijzigen

```
src/
├── App.css          (volledig herzien — alle componentstijlen + :root variabelen)
└── data/
    └── flashcards.js  (alleen 4 hex-waarden in `topics` aangepast)
```

Geen JSX-veranderingen. Geen nieuwe bestanden. Geen routing/hook-aanpassingen.

## Verificatie

Handmatig in de browser na `npm run dev`:
- Achtergrond is donker bosgroen
- Tekst is cream, leesbaar (WCAG AA voor body-text op bg — `#f0e8d4` op `#0d1f15` heeft contrast ratio ~14:1, ruim genoeg)
- Kaarten zijn opgetilde donkere panelen met soft shadow
- Topic-chips zijn herkenbaar en niet-blendend tegen de donkere bg
- "Start oefenen"-knop is goud met donkere tekst
- "Ken ik"-knop is fris groen
- "Nog oefenen"-knop is amber/goud
- Focus-ring is goud bij keyboard-navigatie
- Geen wit/lichte vlek zichtbaar (geen flash bij refresh)

## Out of scope (YAGNI)

- Light-mode variant
- Toggle in UI
- `prefers-color-scheme` detectie
- Animaties / transitions verder dan al aanwezig
- Custom font (system-stack blijft)
- Iconen / illustraties
