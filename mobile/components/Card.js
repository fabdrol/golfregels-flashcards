import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Card({ card, topic, flipped, onFlip }) {
  return (
    <Pressable
      onPress={onFlip}
      accessibilityRole="button"
      accessibilityState={{ selected: flipped }}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={[styles.topicBadge, { backgroundColor: topic.color }]}>
        <Text style={styles.topicBadgeText}>{topic.label}</Text>
      </View>
      <View style={styles.content}>
        {flipped ? (
          <Text style={styles.back}>{card.back}</Text>
        ) : (
          <Text style={styles.front}>{card.front}</Text>
        )}
      </View>
      <Text style={styles.hint}>
        {flipped ? ' ' : 'Tik op de kaart voor het antwoord'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: 320,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  cardPressed: {
    transform: [{ translateY: -2 }],
  },
  topicBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  topicBadgeText: {
    color: colors.warningText,
    fontSize: 12,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    minHeight: 200,
  },
  front: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
  },
  back: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    minHeight: 16,
  },
});
