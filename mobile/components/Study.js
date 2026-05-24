import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import Card from './Card';
import RelatedJargon from './RelatedJargon';

export default function Study({ pool, cards, topics, onMark, onExit, onComplete }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [extendedPool, setExtendedPool] = useState(pool);
  const [rescheduled, setRescheduled] = useState(() => new Set());
  const [stats, setStats] = useState({ learned: 0, practice: 0 });

  const currentCard = cards.find((c) => c.id === extendedPool[index]);

  const advance = (newPool = extendedPool, newIndex = index + 1, currentStats = stats) => {
    if (newIndex >= newPool.length) {
      onComplete(currentStats);
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
    const newStats = {
      learned: stats.learned + (status === 'known' ? 1 : 0),
      practice: stats.practice + (status === 'practice' ? 1 : 0),
    };
    setStats(newStats);
    advance(newPool, index + 1, newStats);
  };

  const handleSkip = () => advance();
  const handleFlip = () => setFlipped((f) => !f);

  if (!currentCard) return null;

  const total = extendedPool.length;
  const seen = index;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={styles.progress}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${(seen / total) * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {seen + 1} / {total} · {stats.learned} geleerd
          </Text>
        </View>
        <Pressable
          onPress={onExit}
          accessibilityLabel="Sluit oefensessie"
          style={({ pressed }) => [styles.exit, pressed && styles.exitPressed]}
        >
          <Text style={styles.exitText}>✕</Text>
        </Pressable>
      </View>

      <Card
        card={currentCard}
        topic={topics[currentCard.topic]}
        flipped={flipped}
        onFlip={handleFlip}
      />

      <RelatedJargon card={currentCard} />

      <View style={styles.actions}>
        {flipped ? (
          <>
            <Pressable
              onPress={() => handleMark('known')}
              style={({ pressed }) => [
                styles.btn,
                styles.btnKnown,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.btnDarkText}>Ken ik</Text>
            </Pressable>
            <Pressable
              onPress={() => handleMark('practice')}
              style={({ pressed }) => [
                styles.btn,
                styles.btnPractice,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={styles.btnDarkText}>Nog oefenen</Text>
            </Pressable>
            <Pressable
              onPress={handleSkip}
              style={({ pressed }) => [
                styles.btn,
                styles.btnSkip,
                pressed && styles.btnSecondaryPressed,
              ]}
            >
              <Text style={styles.btnSkipText}>Skip</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.hint}>
            Tik op de kaart voor het antwoord.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  progress: {
    flex: 1,
    gap: 6,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  progressText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  exit: {
    padding: 6,
    borderRadius: 6,
  },
  exitPressed: {
    backgroundColor: colors.surfaceHover,
  },
  exitText: {
    color: colors.textMuted,
    fontSize: 22,
    lineHeight: 24,
  },
  actions: {
    marginTop: 20,
    gap: 8,
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnKnown: {
    backgroundColor: colors.success,
  },
  btnPractice: {
    backgroundColor: colors.warning,
  },
  btnSkip: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border,
  },
  btnDarkText: {
    color: colors.warningText,
    fontWeight: '700',
    fontSize: 16,
  },
  btnSkipText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 15,
  },
  btnSecondaryPressed: {
    backgroundColor: colors.surface,
  },
  btnPressed: {
    transform: [{ scale: 0.98 }],
  },
  hint: {
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
});
