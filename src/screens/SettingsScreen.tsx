import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { GlassCard } from '../components/GlassCard';
import { useAppTheme } from '../theme/ThemeContext';

export function SettingsScreen() {
  const { theme, themePreference, setThemePreference, unit, setUnit } = useAppTheme();
  const manualDarkEnabled = themePreference === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>Settings</Text>

        <GlassCard>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Appearance</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.textPrimary }]}>Use System Theme</Text>
            <Switch
              value={themePreference === 'system'}
              onValueChange={value => setThemePreference(value ? 'system' : 'light')}
            />
          </View>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.textPrimary }]}>Dark Mode</Text>
            <Switch
              value={manualDarkEnabled}
              onValueChange={value => setThemePreference(value ? 'dark' : 'light')}
              disabled={themePreference === 'system'}
            />
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Preferences</Text>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.colors.textPrimary }]}>Energy Unit</Text>
            <View style={styles.unitControls}>
              <Pressable
                style={[
                  styles.unitButton,
                  { backgroundColor: unit === 'kcal' ? theme.colors.accent : theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                ]}
                onPress={() => setUnit('kcal')}>
                <Text style={[styles.unitText, { color: unit === 'kcal' ? '#FFFFFF' : theme.colors.textPrimary }]}>
                  kcal
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.unitButton,
                  { backgroundColor: unit === 'kJ' ? theme.colors.accent : theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' },
                ]}
                onPress={() => setUnit('kJ')}>
                <Text style={[styles.unitText, { color: unit === 'kJ' ? '#FFFFFF' : theme.colors.textPrimary }]}>
                  kJ
                </Text>
              </Pressable>
            </View>
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>About</Text>
          <Text style={[styles.versionText, { color: theme.colors.textPrimary }]}>ByteCal v0.0.1</Text>
          <Text style={[styles.placeholder, { color: theme.colors.textSecondary }]}>
            Notifications and profile sync are coming soon.
          </Text>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 20,
    paddingBottom: 120,
  },
  placeholder: {
    fontSize: 14,
    marginTop: 6,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  safeArea: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  unitButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  unitControls: {
    flexDirection: 'row',
    gap: 8,
  },
  unitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  versionText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
