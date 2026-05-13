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

## Deployen

```bash
./deploy.sh
```

Bouwt, synct naar `s3://video.superyachtapi.com/golf/` (profiel `syt`) en
triggert een CloudFront-invalidation. Live op
<https://video.superyachtapi.com/golf/>.

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
