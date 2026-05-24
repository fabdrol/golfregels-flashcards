import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { findRelatedJargon } from '../lib/relatedJargon';

export default function RelatedJargon({ card }) {
  const [open, setOpen] = useState(false);

  if (!card || card.id.startsWith('jrg-')) return null;
  const related = findRelatedJargon(card);
  if (related.length === 0) return null;

  return (
    <View style={styles.box}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={({ pressed }) => [styles.summary, pressed && styles.summaryPressed]}
      >
        <Text style={styles.chevron}>{open ? '▾' : '▸'}</Text>
        <Text style={styles.summaryText}>Jargon ({related.length})</Text>
      </Pressable>
      {open && (
        <View style={styles.list}>
          {related.map((j, idx) => (
            <View
              key={j.id}
              style={[styles.item, idx === related.length - 1 && styles.itemLast]}
            >
              <Text style={styles.term}>{j.front}</Text>
              <Text style={styles.def}>{j.back}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 6,
  },
  summaryPressed: {
    backgroundColor: colors.surfaceHover,
  },
  chevron: {
    color: colors.accent,
    width: 14,
    fontSize: 14,
  },
  summaryText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 14,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 4,
  },
  itemLast: {
    borderBottomWidth: 0,
  },
  term: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  def: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
