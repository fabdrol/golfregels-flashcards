import { jargonCards } from '../data/jargon.js';

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PAREN_STOPWORDS = new Set(['peg', 'exact', 'score', 'scorer']);

function buildLookupTerms(jargonCard) {
  const front = jargonCard.front;
  const parenMatch = front.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const base = parenMatch[1].trim();
    const paren = parenMatch[2].trim();
    if (PAREN_STOPWORDS.has(paren.toLowerCase())) return [base];
    return [base, paren];
  }
  return [front];
}

const JARGON_INDEX = jargonCards.map((card) => ({
  card,
  patterns: buildLookupTerms(card)
    .filter((t) => t.length >= 3)
    .map((t) => new RegExp(`\\b${escapeRegex(t)}\\b`, 'i')),
}));

export function findRelatedJargon(card) {
  if (!card) return [];
  const text = `${card.front} ${card.back}`;
  const hits = [];
  for (const entry of JARGON_INDEX) {
    if (entry.card.id === card.id) continue;
    let earliest = Infinity;
    for (const re of entry.patterns) {
      const m = text.match(re);
      if (m && m.index < earliest) earliest = m.index;
    }
    if (earliest < Infinity) {
      hits.push({ card: entry.card, position: earliest });
    }
  }
  hits.sort((a, b) => a.position - b.position);
  return hits.map((h) => h.card);
}
