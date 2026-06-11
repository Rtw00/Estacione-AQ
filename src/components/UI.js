import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet,
} from 'react-native';
import { colors, radius, spacing, font } from '../utils/theme';

// ---------- Button ----------
export function Button({ title, onPress, variant = 'primary', loading, style }) {
  const bg  = variant === 'primary' ? colors.teal : variant === 'danger' ? colors.danger : 'transparent';
  const col = variant === 'outline' ? colors.teal : colors.white;
  const brd = variant === 'outline' ? { borderWidth: 1.5, borderColor: colors.teal } : {};
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.82}
      style={[styles.btn, { backgroundColor: bg }, brd, style]}
    >
      {loading
        ? <ActivityIndicator color={col} />
        : <Text style={[styles.btnText, { color: col }]}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

// ---------- Input ----------
export function Input({ label, error, style, ...props }) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && { borderColor: colors.danger }, style]}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

// ---------- Card ----------
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ---------- ScreenHeader ----------
export function ScreenHeader({ title, subtitle, onBack, navigation }) {
  return (
    <View style={styles.header}>
      {onBack || navigation ? (
        <TouchableOpacity onPress={onBack || (() => navigation.goBack())} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      ) : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{title}</Text>
        {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

// ---------- Badge ----------
export function Badge({ label, color = colors.teal }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
}

// ---------- Divider ----------
export function Divider() {
  return <View style={styles.divider} />;
}

// ---------- EmptyState ----------
export function EmptyState({ icon = '🅿️', title, message }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      {message ? <Text style={styles.emptyMsg}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  btnText: { fontSize: font.md, fontWeight: '700', letterSpacing: 0.3 },

  label: { fontSize: font.sm, fontWeight: '600', color: colors.textSecond, marginBottom: 6 },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    fontSize: font.base,
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  errorText: { fontSize: font.sm, color: colors.danger, marginTop: 4 },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.navy,
    gap: spacing.sm,
  },
  headerTitle: { fontSize: font.lg, fontWeight: '700', color: colors.white },
  headerSub:   { fontSize: font.sm, color: colors.teal, marginTop: 2 },
  backBtn: {
    width: 36, height: 36, borderRadius: radius.full,
    backgroundColor: colors.navyLight,
    alignItems: 'center', justifyContent: 'center',
    marginRight: spacing.sm,
  },
  backIcon: { color: colors.white, fontSize: 18 },

  badge: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: radius.full, borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: font.sm, fontWeight: '600' },

  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  empty: { alignItems: 'center', paddingVertical: 60, paddingHorizontal: spacing.xl },
  emptyIcon:  { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: font.lg, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  emptyMsg:   { fontSize: font.base, color: colors.textSecond, textAlign: 'center', marginTop: 8, lineHeight: 22 },
});
