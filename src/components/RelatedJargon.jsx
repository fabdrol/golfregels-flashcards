import { findRelatedJargon } from '../lib/relatedJargon.js';

export default function RelatedJargon({ card }) {
  if (!card || card.id.startsWith('jrg-')) return null;
  const related = findRelatedJargon(card);
  if (related.length === 0) return null;

  return (
    <details className="jargon-details">
      <summary className="jargon-details__summary">
        Jargon ({related.length})
      </summary>
      <ul className="jargon-details__list">
        {related.map((j) => (
          <li key={j.id} className="jargon-details__item">
            <span className="jargon-details__term">{j.front}</span>
            <span className="jargon-details__def">{j.back}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
