import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Home({
  mode,
  onModeChange,
  modes,
  topics,
  cards,
  selectedTopics,
  onToggleTopic,
  onStart,
  progress,
  onReset,
  storageAvailable,
}) {
  const topicIds = Object.keys(topics);

  const stats = topicIds.reduce((acc, id) => {
    const topicCards = cards.filter((c) => c.topic === id);
    const known = topicCards.filter((c) => progress[c.id] === 'known').length;
    const practice = topicCards.filter((c) => progress[c.id] === 'practice').length;
    acc[id] = { total: topicCards.length, known, practice };
    return acc;
  }, {});

  const selectedCount = cards.filter((c) => selectedTopics.has(c.topic)).length;

  const handleReset = () => {
    const label = modes[mode].label;
    Alert.alert(
      'Voortgang wissen',
      `Weet je zeker dat je alle voortgang van "${label}" wilt wissen?`,
      [
        { text: 'Annuleer', style: 'cancel' },
        { text: 'Wissen', style: 'destructive', onPress: onReset },
      ]
    );
  };

  const modeIds = Object.keys(modes);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>GVB Oefenen</Text>

      <View style={styles.modeSwitch} accessibilityRole="radiogroup">
        {modeIds.map((id) => {
          const active = mode === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              onPress={() => onModeChange(id)}
              style={[styles.modeBtn, active && styles.modeBtnActive]}
            >
              <Text style={[styles.modeBtnText, active && styles.modeBtnTextActive]}>
                {modes[id].label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.intro}>
        Kies één of meer onderwerpen en start een oefensessie.
      </Text>

      <View style={styles.topics}>
        {topicIds.map((id) => {
          const t = topics[id];
          const s = stats[id];
          const checked = selectedTopics.has(id);
          return (
            <Pressable
              key={id}
              onPress={() => onToggleTopic(id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              style={[
                styles.topic,
                { borderColor: checked ? t.color : 'transparent' },
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  checked && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
              >
                {checked && <Text style={styles.checkboxTick}>✓</Text>}
              </View>
              <View style={[styles.topicDot, { backgroundColor: t.color }]} />
              <View style={styles.topicTextWrap}>
                <Text style={styles.topicLabel}>{t.label}</Text>
                <Text style={styles.topicCounts}>
                  {s.known}/{s.total} geleerd · {s.practice} nog oefenen
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onStart}
        disabled={selectedCount === 0}
        style={({ pressed }) => [
          styles.btn,
          styles.btnPrimary,
          selectedCount === 0 && styles.btnDisabled,
          pressed && selectedCount > 0 && styles.btnPressed,
        ]}
      >
        <Text style={styles.btnPrimaryText}>
          Start oefenen ({selectedCount} kaarten)
        </Text>
      </Pressable>

      <Pressable
        onPress={handleReset}
        style={({ pressed }) => [
          styles.btn,
          styles.btnSecondary,
          pressed && styles.btnSecondaryPressed,
        ]}
      >
        <Text style={styles.btnSecondaryText}>Reset voortgang</Text>
      </Pressable>

      {!storageAvailable && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            Voortgang wordt niet bewaard (opslag is geblokkeerd).
          </Text>
        </View>
      )}
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
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  modeSwitch: {
    flexDirection: 'row',
    padding: 4,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    gap: 4,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.accent,
  },
  modeBtnText: {
    color: colors.textMuted,
    fontWeight: '600',
  },
  modeBtnTextActive: {
    color: colors.warningText,
  },
  intro: {
    color: colors.textMuted,
    marginBottom: 20,
  },
  topics: {
    gap: 10,
    marginBottom: 24,
  },
  topic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTick: {
    color: colors.warningText,
    fontWeight: '900',
    fontSize: 14,
    lineHeight: 16,
  },
  topicDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  topicTextWrap: {
    flex: 1,
  },
  topicLabel: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 15,
  },
  topicCounts: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  btn: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnPrimary: {
    backgroundColor: colors.accent,
  },
  btnPrimaryText: {
    color: colors.warningText,
    fontWeight: '700',
    fontSize: 16,
  },
  btnSecondary: {
    backgroundColor: 'transparent',
  },
  btnSecondaryText: {
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
  btnDisabled: {
    opacity: 0.4,
  },
  warning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: colors.warningBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warningBorder,
    borderRadius: 4,
  },
  warningText: {
    color: colors.text,
    fontSize: 14,
  },
});
