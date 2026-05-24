import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

export default function Done({ stats, onPracticeAgain, onHome, hasPractice }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Goed gedaan!</Text>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{stats.learned}</Text>
          <Text style={styles.statLabel}>geleerd</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>{stats.practice}</Text>
          <Text style={styles.statLabel}>nog oefenen</Text>
        </View>
      </View>

      <Pressable
        onPress={onPracticeAgain}
        disabled={!hasPractice}
        style={({ pressed }) => [
          styles.btn,
          styles.btnPrimary,
          !hasPractice && styles.btnDisabled,
          pressed && hasPractice && styles.btnPressed,
        ]}
      >
        <Text style={styles.btnPrimaryText}>Oefen herhalingen</Text>
      </Pressable>

      <Pressable
        onPress={onHome}
        style={({ pressed }) => [
          styles.btn,
          styles.btnSecondary,
          pressed && styles.btnSecondaryPressed,
        ]}
      >
        <Text style={styles.btnSecondaryText}>Terug naar home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: 16,
    paddingTop: 32,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginBottom: 32,
  },
  stat: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.accent,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
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
});
