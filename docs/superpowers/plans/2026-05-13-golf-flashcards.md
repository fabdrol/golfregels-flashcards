# GVB Flashcard Oefen Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bouw een lokaal draaiende React+Vite flashcard-tool om voor het NGF GVB-examen te oefenen, met filteren per onderwerp, "ken ik"/"nog oefenen"-markering en localStorage-persistentie.

**Architecture:** Single-page React-app met conditionele view (home / study / done). Geen routing, geen state-library. Alle kaartdata in één JS-bestand. Eén custom hook (`useProgress`) abstraheert localStorage. Eenvoudig "weighted retry"-algoritme voor herhaling binnen één sessie.

**Tech Stack:** Vite 5, React 18, JavaScript (geen TypeScript), plain CSS, browser localStorage. Geen testing framework — handmatige verificatiestappen via dev-server in browser.

---

## File Structure

```
golfregels/
├── .gitignore
├── package.json
├── vite.config.js
├── index.html
├── README.md
├── docs/superpowers/
│   ├── specs/2026-05-13-golf-flashcards-design.md   (bestaat al)
│   └── plans/2026-05-13-golf-flashcards.md          (dit bestand)
└── src/
    ├── main.jsx                  # React entrypoint, mount op #root
    ├── App.jsx                   # View-router, top-level state
    ├── App.css                   # Alle styling
    ├── data/flashcards.js        # Kaartdata + topic-metadata
    ├── hooks/useProgress.js      # localStorage wrapper
    └── components/
        ├── Home.jsx              # Filter-scherm
        ├── Study.jsx             # Studie-scherm (kaart + knoppen + toetsen)
        ├── Card.jsx              # Eén flip-bare kaart
        └── Done.jsx              # Eind-scherm
```

**Responsibilities:**
- `App.jsx` — view-state, sessie-state (pool, currentIndex), routing tussen schermen
- `useProgress.js` — leest/schrijft `golfregels.progress.v1` in localStorage met in-memory fallback
- `flashcards.js` — pure data, geen logica
- `Home.jsx` / `Study.jsx` / `Done.jsx` — presentational, krijgen alles via props
- `Card.jsx` — flip-animatie en flipped/non-flipped weergave

---

## Task 1: Project setup (Vite + React)

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `.gitignore`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/App.css`

- [ ] **Step 1: Maak `.gitignore`**

Create `.gitignore`:
```
node_modules/
dist/
.DS_Store
*.log
.vite/
```

- [ ] **Step 2: Maak `package.json`**

Create `package.json`:
```json
{
  "name": "golfregels",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "vite": "^5.4.10"
  }
}
```

- [ ] **Step 3: Maak `vite.config.js`**

Create `vite.config.js`:
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Maak `index.html`**

Create `index.html`:
```html
<!doctype html>
<html lang="nl">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GVB Oefenen</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Maak `src/main.jsx`**

Create `src/main.jsx`:
```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './App.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 6: Maak placeholder `src/App.jsx`**

Create `src/App.jsx`:
```jsx
export default function App() {
  return <div className="app"><h1>GVB Oefenen</h1><p>Setup werkt.</p></div>;
}
```

- [ ] **Step 7: Maak minimale `src/App.css`**

Create `src/App.css`:
```css
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #f5f7fa;
  color: #1a2332;
}
.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
```

- [ ] **Step 8: Installeer dependencies en start dev-server**

Run: `npm install`
Then run: `npm run dev`

Expected output: `Local:   http://localhost:5173/` (or similar)
Open de URL in de browser. Verwacht: "GVB Oefenen" titel en "Setup werkt." tekst.
Stop dev-server met Ctrl+C voordat je verder gaat.

- [ ] **Step 9: Commit**

```bash
git add .gitignore package.json package-lock.json vite.config.js index.html src/
git commit -m "feat: scaffold Vite+React project"
```

---

## Task 2: Flashcard data — Etiquette & veiligheid

**Files:**
- Create: `src/data/flashcards.js`

- [ ] **Step 1: Maak `src/data/flashcards.js` met topics + etiquette-kaarten**

Create `src/data/flashcards.js`:
```js
export const topics = {
  etiquette: { label: 'Etiquette & veiligheid', color: '#2e7d32' },
  baanregels: { label: 'Baanregels', color: '#1565c0' },
  straf: { label: 'Strafslagen & procedures', color: '#c62828' },
  handicap: { label: 'Handicap & scorekaart', color: '#6a1b9a' },
};

export const flashcards = [
  // ─── Etiquette & veiligheid ───────────────────────────────
  {
    id: 'etq-01',
    topic: 'etiquette',
    front: 'Wanneer roep je "Fore"?',
    back: 'Direct en luid wanneer er kans bestaat dat je bal richting andere personen vliegt. Beter te vaak dan te weinig.'
  },
  {
    id: 'etq-02',
    topic: 'etiquette',
    front: 'Wie heeft als eerste de eer (eerst slaan) op de afslagplaats van hole 1?',
    back: 'Volgens loting of afspraak. Daarna heeft op elke volgende hole de speler met de laagste score op de vorige hole de eer.'
  },
  {
    id: 'etq-03',
    topic: 'etiquette',
    front: 'Mag je op de baan in elke kleding spelen?',
    back: 'Nee. Vrijwel alle banen vereisen golfkleding: kraagshirt of golfpolo, geen jeans of T-shirts. Golfschoenen met soft spikes zijn standaard.'
  },
  {
    id: 'etq-04',
    topic: 'etiquette',
    front: 'Wat doe je met een plag (divot) na je slag op de fairway?',
    back: 'Leg de plag terug en druk hem aan, of vul het gat met het zand-zaadmengsel dat in karretjes/tassen meegegeven wordt.'
  },
  {
    id: 'etq-05',
    topic: 'etiquette',
    front: 'Wat doe je met een pitchmark op de green?',
    back: 'Repareer hem met een pitchfork: prik rond de rand en duw naar binnen, niet omhoog wippen. Tik daarna glad met de putter.'
  },
  {
    id: 'etq-06',
    topic: 'etiquette',
    front: 'Mag je over de puttinglijn van een medespeler lopen?',
    back: 'Nee. Loop er altijd omheen. Lopen over iemands puttinglijn kan de green beschadigen en is een ernstige etiquette-overtreding.'
  },
  {
    id: 'etq-07',
    topic: 'etiquette',
    front: 'Wanneer moet je een flight achter je laten doorlopen ("doorlaten")?',
    back: 'Als je een gat hebt op de flight voor je en je houdt de flight achter je op, of als je een bal zoekt en niet binnen redelijke tijd verder kunt.'
  },
  {
    id: 'etq-08',
    topic: 'etiquette',
    front: 'Hoe gedraag je je terwijl een medespeler slaat?',
    back: 'Stilstaan, stil zijn, en buiten zijn gezichtsveld blijven. Niet bewegen, niet praten, geen schaduw op zijn bal of lijn.'
  },
  {
    id: 'etq-09',
    topic: 'etiquette',
    front: 'Hoe egaliseer je een bunker na je slag?',
    back: 'Hark de bunker glad — eerst je voetafdrukken en de plek waar je sloeg, daarna langs de rand. Hark op de juiste plek terug (volgens lokale regel: in of net naast de bunker).'
  },
  {
    id: 'etq-10',
    topic: 'etiquette',
    front: 'Wat is "ready golf"?',
    back: 'De speler die er klaar voor is, slaat eerst — ongeacht wie het verst van de hole ligt. Versnelt het spel. Wel veilig: nooit slaan als iemand binnen bereik staat.'
  },
  {
    id: 'etq-11',
    topic: 'etiquette',
    front: 'Mag je je mobiele telefoon gebruiken op de baan?',
    back: 'Op stil. Bellen alleen in noodgevallen en uit de buurt van andere spelers. Veel clubs verbieden actief telefoongebruik tijdens het spel.'
  },
  {
    id: 'etq-12',
    topic: 'etiquette',
    front: 'Wat is een redelijk speeltempo voor 18 holes?',
    back: 'Ongeveer 4 uur tot 4 uur 15 minuten voor een 4-bal. Houd de flight voor je in zicht; ontstaat er een gat, versnel je tempo.'
  },
  {
    id: 'etq-13',
    topic: 'etiquette',
    front: 'Mag je een buggy of trolley op de green zetten?',
    back: 'Nee. Trolleys en buggies blijven op de paden of net naast de green. Loop altijd via de kortste route van green naar de volgende tee.'
  },
  {
    id: 'etq-14',
    topic: 'etiquette',
    front: 'Wat doe je als je een verloren bal moet zoeken?',
    back: 'Maximaal 3 minuten zoeken. Wenk de flight achter je door om door te laten als zoeken langer duurt.'
  },
  {
    id: 'etq-15',
    topic: 'etiquette',
    front: 'Wat is de regel voor schaduw op de green?',
    back: 'Zorg dat je schaduw niet over de bal of puttinglijn van een medespeler valt terwijl hij/zij put. Ga indien nodig opzij staan.'
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/flashcards.js
git commit -m "feat: add etiquette flashcards"
```

---

## Task 3: Flashcard data — Baanregels

**Files:**
- Modify: `src/data/flashcards.js`

- [ ] **Step 1: Voeg baanregel-kaarten toe aan flashcards-array**

In `src/data/flashcards.js`, append within the `flashcards` array (after `etq-15`):
```js
  // ─── Baanregels ───────────────────────────────────────────
  {
    id: 'baan-01',
    topic: 'baanregels',
    front: 'Wat betekenen rode palen of lijnen langs een hindernis?',
    back: 'Een laterale hindernis (rode hindernis). Je krijgt extra ontwijkopties: binnen 2 stoklengtes van waar de bal de rand kruiste, of aan de overkant op gelijke afstand.'
  },
  {
    id: 'baan-02',
    topic: 'baanregels',
    front: 'Wat betekenen gele palen of lijnen?',
    back: 'Een gele hindernis (sinds 2019: gele penalty-area). Ontwijken: 1 strafslag, en droppen op de lijn tussen vlag en het punt waar de bal het laatst de rand kruiste, zo ver achter als je wilt.'
  },
  {
    id: 'baan-03',
    topic: 'baanregels',
    front: 'Wat betekenen witte palen?',
    back: 'Out of bounds (buiten de baan). Je mag daar niet spelen. Sla je hem out: 1 strafslag en sla opnieuw vanaf de plek van je vorige slag (slag-en-afstand).'
  },
  {
    id: 'baan-04',
    topic: 'baanregels',
    front: 'Hoe lang mag je zoeken naar een verloren bal?',
    back: '3 minuten (regelwijziging 2019, was 5). Daarna is de bal verloren en moet je teruggaan onder slag-en-afstand (1 strafslag).'
  },
  {
    id: 'baan-05',
    topic: 'baanregels',
    front: 'Hoe drop je een bal volgens de regels sinds 2019?',
    back: 'Vanaf kniehoogte (eerder schouderhoogte). De bal moet vallen in en blijven liggen in de ontwijkzone.'
  },
  {
    id: 'baan-06',
    topic: 'baanregels',
    front: 'Wat is de ontwijkzone bij ontwijken van een abnormaal terrein (bv. casual water)?',
    back: 'Eén stoklengte vanaf het dichtstbijzijnde punt van volledige ontwijking, niet dichter bij de hole, zonder strafslag.'
  },
  {
    id: 'baan-07',
    topic: 'baanregels',
    front: 'Mag je in een bunker je club laten rusten op het zand voor je slag?',
    back: 'Nee. Je mag de grond in de bunker niet aanraken met je club voor de slag (oefenswing of plaatsen). Wel mag je leunend op je club staan buiten de bunker.'
  },
  {
    id: 'baan-08',
    topic: 'baanregels',
    front: 'Mag je losse natuurlijke voorwerpen (blad, takje) wegnemen in een bunker?',
    back: 'Ja, sinds 2019. Losse natuurlijke voorwerpen mag je overal verwijderen, ook in bunkers en penalty-areas, zolang je bal niet beweegt.'
  },
  {
    id: 'baan-09',
    topic: 'baanregels',
    front: 'Mag de vlaggenstok in de hole blijven staan tijdens het putten?',
    back: 'Ja, sinds 2019. Je krijgt geen straf meer als je bal de stok raakt vanaf de green.'
  },
  {
    id: 'baan-10',
    topic: 'baanregels',
    front: 'Wat doe je als je bal op de green ligt en je wil hem oppakken om te merken?',
    back: 'Markeer eerst (muntje/marker direct achter de bal), pak hem op, en leg hem op exact dezelfde plek terug voor je slag.'
  },
  {
    id: 'baan-11',
    topic: 'baanregels',
    front: 'Mag je een geweerd kuiltje (oude pitchmark of green-imperfectie) op je puttinglijn repareren?',
    back: 'Ja, sinds 2019 mag je alle schade op de green repareren (pitchmarks, spike marks, dierschade), behalve natuurlijke imperfecties.'
  },
  {
    id: 'baan-12',
    topic: 'baanregels',
    front: 'Wat is "ground under repair" (GUR)?',
    back: 'Een door de commissie gemarkeerd gebied (vaak wit gemarkeerd of \'GUR\'-bord) waaruit je gratis mag ontwijken. Eén stoklengte, niet dichter bij de hole.'
  },
  {
    id: 'baan-13',
    topic: 'baanregels',
    front: 'Wat is een immovable obstruction?',
    back: 'Een vast kunstmatig voorwerp (sproeierdeksel, paaltje, schuilhut). Gratis ontwijken: dichtstbijzijnde punt van volledige ontwijking + één stoklengte, niet dichter bij de hole.'
  },
  {
    id: 'baan-14',
    topic: 'baanregels',
    front: 'Wat doe je als je bal in een waterhindernis (gele penalty-area) ligt?',
    back: 'Drie opties: (1) spelen zoals hij ligt, (2) slag-en-afstand met strafslag, (3) op de lijn vlag-kruisingspunt droppen met 1 strafslag.'
  },
  {
    id: 'baan-15',
    topic: 'baanregels',
    front: 'Wat is een "preferred lie" of "winterregel"?',
    back: 'Plaatselijke regel: op de fairway mag je de bal binnen een vastgestelde afstand (vaak 15 cm) verplaatsen om bescherming van de baan in winterperiode. Geen straf.'
  },
  {
    id: 'baan-16',
    topic: 'baanregels',
    front: 'Mag je een bal identificeren door hem op te pakken in de rough?',
    back: 'Ja, na markeren mag je hem oppakken om te identificeren. Daarna terugleggen op exact dezelfde plek. Geen straf als de procedure correct is.'
  },
  {
    id: 'baan-17',
    topic: 'baanregels',
    front: 'Wat is de "back-on-the-line" ontwijkprocedure?',
    back: 'Droppen op de denkbeeldige lijn van vlag door de plek waar je bal de rand kruiste/lag, zo ver achter als je wilt. Ontwijkzone: 1 stoklengte vanaf het gekozen referentiepunt.'
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/data/flashcards.js
git commit -m "feat: add baanregels flashcards"
```

---

## Task 4: Flashcard data — Strafslagen & Handicap

**Files:**
- Modify: `src/data/flashcards.js`

- [ ] **Step 1: Voeg straf- en handicap-kaarten toe**

In `src/data/flashcards.js`, append within the `flashcards` array (after `baan-17`):
```js
  // ─── Strafslagen & procedures ─────────────────────────────
  {
    id: 'straf-01',
    topic: 'straf',
    front: 'Hoeveel strafslagen krijg je als je bal out of bounds gaat?',
    back: '1 strafslag. Je speelt opnieuw vanaf de plek van je vorige slag (slag-en-afstand). De slag + de strafslag betekent dat je effectief 2 slagen verliest.'
  },
  {
    id: 'straf-02',
    topic: 'straf',
    front: 'Wat is een provisional bal en wanneer speel je er een?',
    back: 'Een voorlopige bal die je speelt als je vermoedt dat je bal verloren of OB is (niet in een penalty-area). Bespaart tijd. Kondig duidelijk aan: "Ik speel een provisional".'
  },
  {
    id: 'straf-03',
    topic: 'straf',
    front: 'Wat is een onspeelbare bal en hoeveel strafslagen kost dat?',
    back: 'Je verklaart zelf dat je bal onspeelbaar is — overal op de baan behalve in een penalty-area. 1 strafslag. Drie opties: slag-en-afstand, back-on-the-line, of 2 stoklengtes niet dichter bij de hole.'
  },
  {
    id: 'straf-04',
    topic: 'straf',
    front: 'Wat is de straf als je de verkeerde bal speelt?',
    back: '2 strafslagen in strokeplay (verlies van hole in matchplay). Daarna moet je de juiste bal spelen. Slagen met de verkeerde bal tellen niet.'
  },
  {
    id: 'straf-05',
    topic: 'straf',
    front: 'Wat is de straf als je bal je eigen lichaam, uitrusting of caddie raakt?',
    back: 'Sinds 2019: geen straf meer. Je speelt de bal waar hij ligt. Voor 2019 was dit 1 of 2 strafslagen.'
  },
  {
    id: 'straf-06',
    topic: 'straf',
    front: 'Wat gebeurt er als je per ongeluk je bal beweegt tijdens het zoeken?',
    back: 'Sinds 2019: geen straf. Leg de bal terug op zijn oorspronkelijke plek (geschat als nodig).'
  },
  {
    id: 'straf-07',
    topic: 'straf',
    front: 'Hoeveel slagen heb je gespeeld na een mulligan op hole 1 die niemand telt?',
    back: 'Strikt regeltechnisch: een mulligan is geen officiële regel. In een wedstrijd of qualifying ronde mag het niet — dan is de eerste slag de slag.'
  },
  {
    id: 'straf-08',
    topic: 'straf',
    front: 'Wat is "general penalty"?',
    back: 'De standaardstraf voor de meeste overtredingen sinds 2019: 2 strafslagen in strokeplay, verlies van hole in matchplay.'
  },
  {
    id: 'straf-09',
    topic: 'straf',
    front: 'Mag je je bal schoonmaken na opnemen op de fairway?',
    back: 'Alleen als de regel het toestaat. Bij ontwijken van abnormale terreinomstandigheden of vrije drop: ja. Bij identificeren in rough: alleen voor zover nodig om te identificeren.'
  },
  {
    id: 'straf-10',
    topic: 'straf',
    front: 'Wat doe je als je niet zeker weet of een bal van jou is in de rough?',
    back: 'Markeer de plek, pak op om te identificeren. Niet zonder markeren oppakken. Als blijkt dat het toch niet jouw bal is, leg dezelfde bal terug en zoek verder.'
  },
  {
    id: 'straf-11',
    topic: 'straf',
    front: 'Wat is de straf voor te veel clubs in je tas (>14)?',
    back: '2 strafslagen per overtreden hole, met maximum van 4 strafslagen per ronde in strokeplay. In matchplay: aftrek van 1 hole per overtreden hole, max 2 holes.'
  },
  {
    id: 'straf-12',
    topic: 'straf',
    front: 'Mag je advies vragen tijdens een ronde?',
    back: 'Alleen aan je caddie of partner (in foursomes/vierbal). Aan tegenstanders/medespelers: 2 strafslagen. Vragen naar "publieke" informatie (afstanden uit een boekje) mag wel.'
  },
  {
    id: 'straf-13',
    topic: 'straf',
    front: 'Wat is de procedure als je bal in een boom blijft hangen en je hem niet kunt identificeren?',
    back: 'De bal is verloren (kan niet aantonen dat het jouw bal is). Slag-en-afstand: 1 strafslag, opnieuw spelen vanaf vorige plek.'
  },
  // ─── Handicap & scorekaart ────────────────────────────────
  {
    id: 'hcp-01',
    topic: 'handicap',
    front: 'Wat is een handicap?',
    back: 'Een getal dat aangeeft hoeveel slagen een speler boven par speelt op een gemiddelde ronde. Hoe lager, hoe beter. Sinds 2021: World Handicap System (WHS).'
  },
  {
    id: 'hcp-02',
    topic: 'handicap',
    front: 'Wat is het verschil tussen handicap index en playing handicap?',
    back: 'Handicap index is je persoonlijke getal (bv. 18,5). Playing handicap is wat je op een specifieke baan krijgt, berekend met course rating, slope en par.'
  },
  {
    id: 'hcp-03',
    topic: 'handicap',
    front: 'Wat betekent slope rating?',
    back: 'Maat voor moeilijkheid van een baan voor een bogey-speler t.o.v. een scratch-speler. Gemiddelde slope = 113. Hogere slope = relatief moeilijker voor minder ervaren spelers.'
  },
  {
    id: 'hcp-04',
    topic: 'handicap',
    front: 'Wat is course rating?',
    back: 'De verwachte score van een scratch-speler op de baan onder normale omstandigheden. Bijv. 71,2 — dichtbij par maar net iets makkelijker of moeilijker.'
  },
  {
    id: 'hcp-05',
    topic: 'handicap',
    front: 'Hoe wordt playing handicap berekend?',
    back: 'Playing Handicap = Handicap Index × (Slope / 113) + (Course Rating − Par). Afgerond op heel getal. Dit is het aantal extra slagen dat je krijgt.'
  },
  {
    id: 'hcp-06',
    topic: 'handicap',
    front: 'Wat is stableford?',
    back: 'Scoresysteem waarbij je punten krijgt: bogey net = 1, par net = 2, birdie net = 3, eagle net = 4, dubbelbogey of slechter = 0. "Net" = na aftrek van je handicapslagen op die hole.'
  },
  {
    id: 'hcp-07',
    topic: 'handicap',
    front: 'Hoeveel stableford-punten heb je als je par speelt op een hole waar je 1 handicapslag krijgt?',
    back: '3 punten. Je netto score is birdie (par − 1 slag), wat 3 stableford-punten oplevert.'
  },
  {
    id: 'hcp-08',
    topic: 'handicap',
    front: 'Welke holes krijg je extra slagen op?',
    back: 'Op de holes met de laagste stroke index (SI). SI 1 is de moeilijkste hole, SI 18 de makkelijkste. Bij playing handicap 9 krijg je dus slagen op SI 1 t/m 9.'
  },
  {
    id: 'hcp-09',
    topic: 'handicap',
    front: 'Wat is een "qualifying" kaart?',
    back: 'Een ronde gespeeld onder competitievoorwaarden (volgens regels, met marker, op gequalificeerde baan) die meetelt voor je handicap. Tegenwoordig kan dat ook in een Exact Daily Score (EDS) ronde zijn.'
  },
  {
    id: 'hcp-10',
    topic: 'handicap',
    front: 'Wie moet een scorekaart ondertekenen?',
    back: 'De speler en de marker (medespeler die de score noteerde). Beide handtekeningen voor inlevering. Onjuiste/niet-ondertekende kaart = diskwalificatie.'
  },
  {
    id: 'hcp-11',
    topic: 'handicap',
    front: 'Wat gebeurt er als je een te lage score op een hole noteert?',
    back: 'Diskwalificatie. Bij een te hoge score: die hogere score blijft staan, geen DSQ. Daarom: liever wat hoger noteren bij twijfel.'
  },
  {
    id: 'hcp-12',
    topic: 'handicap',
    front: 'Wat is een buffer en is die er nog?',
    back: 'Onder het oude EGA-systeem (vóór WHS 2021) was er een buffer: bij scores rond je handicap ging je niet omhoog. Onder WHS is er geen buffer meer — je 8 laagste van laatste 20 ronden bepalen je index.'
  },
  {
    id: 'hcp-13',
    topic: 'handicap',
    front: 'Wat is de maximale score per hole onder WHS voor handicap-doeleinden?',
    back: 'Net double bogey: par + 2 + handicapslagen op die hole. Hogere scores worden voor de handicapberekening teruggebracht tot deze waarde.'
  },
  {
    id: 'hcp-14',
    topic: 'handicap',
    front: 'Wat zijn de "geel/wit/rood/blauw" gemarkeerde tees?',
    back: 'Verschillende afslagplaatsen met verschillende lengte. Traditioneel: wit = heren wedstrijd, geel = heren dagelijks, rood = dames, blauw = back-tees (kampioenschap). Elk heeft eigen course/slope rating.'
  },
  {
    id: 'hcp-15',
    topic: 'handicap',
    front: 'Wat is de hoogste handicap waarmee je het GVB haalt?',
    back: 'Het GVB wordt verleend bij handicap 54 of lager (sinds 2021). Daarmee mag je qualifying rondes spelen en is je handicap erkend.'
  },
];
```

- [ ] **Step 2: Verifieer kaartdata door console-check**

Run: `node -e "import('./src/data/flashcards.js').then(m => { console.log('Total:', m.flashcards.length); console.log('Per topic:', Object.keys(m.topics).map(t => t + '=' + m.flashcards.filter(c => c.topic === t).length).join(', ')); })"`

Expected output: `Total: 60` and counts per topic ~15 each: `etiquette=15, baanregels=17, straf=13, handicap=15`.

- [ ] **Step 3: Commit**

```bash
git add src/data/flashcards.js
git commit -m "feat: add straf en handicap flashcards"
```

---

## Task 5: useProgress hook met localStorage

**Files:**
- Create: `src/hooks/useProgress.js`

- [ ] **Step 1: Maak `src/hooks/useProgress.js`**

Create `src/hooks/useProgress.js`:
```js
import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'golfregels.progress.v1';

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function writeStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function useProgress() {
  const [progress, setProgress] = useState(() => readStorage());
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
      writeStorage(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setProgress({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { progress, mark, reset, storageAvailable };
}
```

- [ ] **Step 2: Handmatige test in browser-console**

Start dev-server: `npm run dev`
Open browser op `http://localhost:5173/`. Open DevTools console.

Run in console:
```js
localStorage.setItem('golfregels.progress.v1', JSON.stringify({'etq-01': 'known'}));
location.reload();
```
Daarna in console: `localStorage.getItem('golfregels.progress.v1')` — verwacht dat de string terugkomt.

Run: `localStorage.removeItem('golfregels.progress.v1')` om op te ruimen.

Stop dev-server met Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useProgress.js
git commit -m "feat: useProgress hook met localStorage fallback"
```

---

## Task 6: Card-component (flip-bare kaart)

**Files:**
- Create: `src/components/Card.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Maak `src/components/Card.jsx`**

Create `src/components/Card.jsx`:
```jsx
import { topics } from '../data/flashcards.js';

export default function Card({ card, flipped, onFlip }) {
  const topic = topics[card.topic];

  return (
    <button
      type="button"
      className={`card ${flipped ? 'card--flipped' : ''}`}
      onClick={onFlip}
      aria-pressed={flipped}
    >
      <span className="card__topic" style={{ background: topic.color }}>
        {topic.label}
      </span>
      <div className="card__content">
        {flipped ? (
          <p className="card__back">{card.back}</p>
        ) : (
          <p className="card__front">{card.front}</p>
        )}
      </div>
      <span className="card__hint">
        {flipped ? '' : 'Klik of druk op spatie voor antwoord'}
      </span>
    </button>
  );
}
```

- [ ] **Step 2: Voeg kaart-CSS toe aan `src/App.css`**

In `src/App.css`, append:
```css
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 320px;
  padding: 1.5rem;
  border: none;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.12);
}
.card:focus-visible {
  outline: 2px solid #1565c0;
  outline-offset: 2px;
}
.card__topic {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  align-self: flex-start;
}
.card__content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
}
.card__front {
  font-size: 1.4rem;
  font-weight: 500;
  text-align: center;
  margin: 0;
}
.card__back {
  font-size: 1.05rem;
  line-height: 1.5;
  margin: 0;
}
.card__hint {
  text-align: center;
  font-size: 0.8rem;
  color: #6b7a8e;
  min-height: 1.2em;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Card.jsx src/App.css
git commit -m "feat: Card component met flip-weergave"
```

---

## Task 7: Home-component (filter-scherm)

**Files:**
- Create: `src/components/Home.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Maak `src/components/Home.jsx`**

Create `src/components/Home.jsx`:
```jsx
import { topics, flashcards } from '../data/flashcards.js';

export default function Home({
  selectedTopics,
  onToggleTopic,
  onStart,
  progress,
  onReset,
  storageAvailable,
}) {
  const topicIds = Object.keys(topics);

  const stats = topicIds.reduce((acc, id) => {
    const cards = flashcards.filter((c) => c.topic === id);
    const known = cards.filter((c) => progress[c.id] === 'known').length;
    const practice = cards.filter((c) => progress[c.id] === 'practice').length;
    acc[id] = { total: cards.length, known, practice };
    return acc;
  }, {});

  const selectedCount = flashcards.filter((c) =>
    selectedTopics.has(c.topic)
  ).length;

  const handleReset = () => {
    if (window.confirm('Weet je zeker dat je alle voortgang wilt wissen?')) {
      onReset();
    }
  };

  return (
    <div className="home">
      <h1>GVB Oefenen</h1>
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

- [ ] **Step 2: Voeg home-CSS toe aan `src/App.css`**

In `src/App.css`, append:
```css
.home h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
}
.home__intro {
  color: #6b7a8e;
  margin: 0 0 1.5rem;
}
.home__topics {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}
.topic {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid transparent;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: border-color 0.15s ease;
}
.topic input { margin: 0; }
.topic__dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.topic__label {
  font-weight: 600;
  flex: 1;
}
.topic__counts {
  font-size: 0.85rem;
  color: #6b7a8e;
}
.btn {
  display: inline-block;
  width: 100%;
  padding: 0.9rem 1.5rem;
  border: none;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 0.75rem;
  transition: opacity 0.15s ease, transform 0.05s ease;
}
.btn:disabled { opacity: 0.45; cursor: not-allowed; }
.btn:not(:disabled):active { transform: scale(0.98); }
.btn--primary { background: #1565c0; color: white; }
.btn--secondary { background: transparent; color: #6b7a8e; }
.home__warning {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #fff8e1;
  border-left: 4px solid #ffa726;
  font-size: 0.9rem;
  border-radius: 4px;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Home.jsx src/App.css
git commit -m "feat: Home component met topic-filter en voortgang"
```

---

## Task 8: Study-component met toetsenbord en algoritme

**Files:**
- Create: `src/components/Study.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Maak `src/components/Study.jsx`**

Create `src/components/Study.jsx`:
```jsx
import { useEffect, useState } from 'react';
import Card from './Card.jsx';

export default function Study({ pool, cards, onMark, onExit, onComplete }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [extendedPool, setExtendedPool] = useState(pool);
  const [rescheduled, setRescheduled] = useState(() => new Set());
  const [stats, setStats] = useState({ learned: 0, practice: 0 });

  const currentCard = cards.find((c) => c.id === extendedPool[index]);

  const advance = (newPool = extendedPool, newIndex = index + 1) => {
    if (newIndex >= newPool.length) {
      onComplete(stats);
      return;
    }
    setExtendedPool(newPool);
    setIndex(newIndex);
    setFlipped(false);
  };

  const handleMark = (status) => {
    if (!currentCard) return;
    onMark(currentCard.id, status);
    let newPool = extendedPool;
    if (status === 'practice' && !rescheduled.has(currentCard.id)) {
      newPool = [...extendedPool, currentCard.id];
      setRescheduled((s) => new Set(s).add(currentCard.id));
    }
    setStats((s) => ({
      learned: s.learned + (status === 'known' ? 1 : 0),
      practice: s.practice + (status === 'practice' ? 1 : 0),
    }));
    advance(newPool);
  };

  const handleSkip = () => advance();
  const handleFlip = () => setFlipped((f) => !f);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return onExit();
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        return setFlipped((f) => !f);
      }
      if (!flipped) return;
      if (e.key === '1') return handleMark('known');
      if (e.key === '2') return handleMark('practice');
      if (e.key === 'ArrowRight') return handleSkip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!currentCard) {
    return null;
  }

  const total = extendedPool.length;
  const seen = index;

  return (
    <div className="study">
      <div className="study__header">
        <div className="study__progress">
          <div className="study__progress-bar">
            <div
              className="study__progress-fill"
              style={{ width: `${(seen / total) * 100}%` }}
            />
          </div>
          <span className="study__progress-text">
            {seen + 1} / {total} · {stats.learned} geleerd
          </span>
        </div>
        <button
          className="study__exit"
          onClick={onExit}
          aria-label="Sluit oefensessie"
        >
          ✕
        </button>
      </div>

      <Card card={currentCard} flipped={flipped} onFlip={handleFlip} />

      <div className="study__actions">
        {flipped ? (
          <>
            <button
              className="btn btn--known"
              onClick={() => handleMark('known')}
            >
              Ken ik (1)
            </button>
            <button
              className="btn btn--practice"
              onClick={() => handleMark('practice')}
            >
              Nog oefenen (2)
            </button>
            <button className="btn btn--skip" onClick={handleSkip}>
              Skip (→)
            </button>
          </>
        ) : (
          <p className="study__hint">
            Klik op de kaart of druk op spatie voor het antwoord.
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Voeg study-CSS toe aan `src/App.css`**

In `src/App.css`, append:
```css
.study__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.study__progress {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.study__progress-bar {
  width: 100%;
  height: 6px;
  background: #e3e8ef;
  border-radius: 3px;
  overflow: hidden;
}
.study__progress-fill {
  height: 100%;
  background: #1565c0;
  transition: width 0.2s ease;
}
.study__progress-text {
  font-size: 0.85rem;
  color: #6b7a8e;
}
.study__exit {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  color: #6b7a8e;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}
.study__exit:hover { background: #e3e8ef; }
.study__actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
.study__hint {
  text-align: center;
  color: #6b7a8e;
  margin: 1rem 0 0;
}
.btn--known { background: #2e7d32; color: white; }
.btn--practice { background: #ef6c00; color: white; }
.btn--skip { background: transparent; color: #6b7a8e; border: 1px solid #cbd3dd; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Study.jsx src/App.css
git commit -m "feat: Study component met toetsenbord en weighted retry"
```

---

## Task 9: Done-component

**Files:**
- Create: `src/components/Done.jsx`
- Modify: `src/App.css`

- [ ] **Step 1: Maak `src/components/Done.jsx`**

Create `src/components/Done.jsx`:
```jsx
export default function Done({ stats, onPracticeAgain, onHome, hasPractice }) {
  return (
    <div className="done">
      <h2 className="done__title">Goed gedaan!</h2>
      <div className="done__stats">
        <div className="done__stat">
          <span className="done__stat-num">{stats.learned}</span>
          <span className="done__stat-label">geleerd</span>
        </div>
        <div className="done__stat">
          <span className="done__stat-num">{stats.practice}</span>
          <span className="done__stat-label">nog oefenen</span>
        </div>
      </div>

      <button
        className="btn btn--primary"
        onClick={onPracticeAgain}
        disabled={!hasPractice}
      >
        Oefen herhalingen
      </button>
      <button className="btn btn--secondary" onClick={onHome}>
        Terug naar home
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Voeg done-CSS toe aan `src/App.css`**

In `src/App.css`, append:
```css
.done {
  text-align: center;
  padding-top: 2rem;
}
.done__title {
  font-size: 2rem;
  margin: 0 0 2rem;
}
.done__stats {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
}
.done__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.done__stat-num {
  font-size: 3rem;
  font-weight: 700;
  color: #1565c0;
}
.done__stat-label {
  font-size: 0.9rem;
  color: #6b7a8e;
  margin-top: 0.25rem;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Done.jsx src/App.css
git commit -m "feat: Done component voor eind-scherm"
```

---

## Task 10: App-component (view-routing en sessie-state)

**Files:**
- Modify: `src/App.jsx` (vervang volledig)

- [ ] **Step 1: Vervang `src/App.jsx` volledig**

Replace contents of `src/App.jsx`:
```jsx
import { useState } from 'react';
import { flashcards, topics } from './data/flashcards.js';
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

export default function App() {
  const [view, setView] = useState('home');
  const [selectedTopics, setSelectedTopics] = useState(
    () => new Set(Object.keys(topics))
  );
  const [pool, setPool] = useState([]);
  const [doneStats, setDoneStats] = useState({ learned: 0, practice: 0 });

  const { progress, mark, reset, storageAvailable } = useProgress();

  const toggleTopic = (id) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const startSession = () => {
    const ids = flashcards
      .filter((c) => selectedTopics.has(c.topic))
      .map((c) => c.id);
    if (ids.length === 0) return;
    setPool(shuffle(ids));
    setView('study');
  };

  const startPracticeAgain = () => {
    const practiceIds = Object.keys(progress).filter(
      (id) => progress[id] === 'practice'
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

  const hasPractice = Object.values(progress).some((s) => s === 'practice');

  return (
    <div className="app">
      {view === 'home' && (
        <Home
          selectedTopics={selectedTopics}
          onToggleTopic={toggleTopic}
          onStart={startSession}
          progress={progress}
          onReset={reset}
          storageAvailable={storageAvailable}
        />
      )}
      {view === 'study' && (
        <Study
          pool={pool}
          cards={flashcards}
          onMark={mark}
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

- [ ] **Step 2: Start dev-server en test golden path**

Run: `npm run dev`
Open `http://localhost:5173/` in browser.

Verifieer in volgorde:
1. Home toont 4 onderwerpen, allemaal geselecteerd. Knop "Start oefenen (60 kaarten)" zichtbaar.
2. Klik op één topic-checkbox om te deselecteren — kaart-aantal in knop daalt.
3. Klik "Start oefenen". Studie-scherm verschijnt met eerste kaart.
4. Klik op kaart → flipped naar antwoord. Drie knoppen verschijnen.
5. Klik "Ken ik" — volgende kaart toont, voortgangsbalk groeit, "1 geleerd" zichtbaar.
6. Druk spatie om te flippen, druk "2" → markeert als nog oefenen.
7. Druk Escape → terug naar home. Op home zie je counts bijgewerkt voor de gemarkeerde kaarten.
8. Refresh browser (F5). Counts blijven staan.
9. Klik "Reset voortgang" → bevestig dialoog → counts naar 0.

Stop dev-server met Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: App component met view-routing en sessie-state"
```

---

## Task 11: README en finale verificatie

**Files:**
- Create: `README.md`

- [ ] **Step 1: Maak `README.md`**

Create `README.md`:
````markdown
# Golfregels — GVB Oefen Tool

Interactieve flashcard-tool om te oefenen voor het NGF GVB-examen.

## Starten

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` in de browser.

## Bouwen voor productie

```bash
npm run build
npm run preview
```

## Onderwerpen

- Etiquette & veiligheid
- Baanregels
- Strafslagen & procedures
- Handicap & scorekaart

## Bedienen

- **Spatie / Enter / klik** — draai de kaart om
- **1** — Ken ik
- **2** — Nog oefenen
- **→** — Skip (geen markering)
- **Esc** — terug naar home

Voortgang wordt bewaard in `localStorage` per browser.
````

- [ ] **Step 2: Finale end-to-end verificatie**

Run: `npm run dev`
Open browser. Doorloop een volledige sessie:
1. Deselecteer 3 onderwerpen, hou alleen "Strafslagen" over (~13 kaarten).
2. Start oefenen. Markeer afwisselend "Ken ik" en "Nog oefenen" tot het einde.
3. Verifieer: de "Nog oefenen"-kaarten komen opnieuw langs vóór het einde.
4. Eind-scherm toont stats. Klik "Oefen herhalingen" — alleen practice-kaarten verschijnen.
5. Markeer ze allemaal "Ken ik". Eindscherm: "0 nog oefenen".
6. Terug naar home: stats per onderwerp zijn bijgewerkt.

Run: `npm run build`
Expected output: `dist/` directory wordt aangemaakt zonder errors.

Stop dev-server met Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: voeg README toe met startinstructies"
```

---

## Self-Review

**Spec coverage check:**

| Spec-onderdeel | Taak |
|---|---|
| Vite + React stack | Task 1 |
| `flashcards.js` data | Task 2, 3, 4 |
| 4 onderwerpen × 15-20 kaarten | Task 2 (15 etq), Task 3 (17 baan), Task 4 (13 straf + 15 hcp) = 60 totaal |
| `useProgress` hook + localStorage `golfregels.progress.v1` | Task 5 |
| LocalStorage fallback + waarschuwing | Task 5 + Task 7 |
| Card-component met flip | Task 6 |
| Home-scherm met filter + counts + reset | Task 7 |
| Study-scherm met voortgangsbalk + 3 knoppen + Esc | Task 8 |
| Toetsenbord (spatie/1/2/→/Esc) | Task 8 |
| Weighted retry algoritme (max 1 herhaling per sessie) | Task 8 (rescheduled Set) |
| Done-scherm met stats + "Oefen herhalingen" | Task 9 |
| App-routing | Task 10 |
| Edge case: geen topics → start disabled | Task 7 + Task 10 |
| Edge case: reset met confirm | Task 7 |
| Edge case: practice-pool leeg → knop disabled | Task 9 |
| Default: alle onderwerpen geselecteerd | Task 10 |
| Versie-suffix `.v1` in key | Task 5 |
| README | Task 11 |

Alle spec-onderdelen gedekt.

**Placeholder scan:** Geen TBDs, geen "implement later", elk codeblok is compleet.

**Type/naam consistency check:**
- `mark(cardId, status)` met status `'known' | 'practice'` — consistent in Task 5, 8, 10.
- `progress` is `{ [cardId]: 'known' | 'practice' }` — consistent.
- `pool` is `string[]` (kaart-ids) — consistent in Task 8 & 10.
- `topics` keys: `etiquette`, `baanregels`, `straf`, `handicap` — consistent.
- `flashcards` props: `id`, `topic`, `front`, `back` — consistent.

Plan is intern consistent en compleet.
