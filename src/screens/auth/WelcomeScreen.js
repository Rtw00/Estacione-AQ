import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, StatusBar,
} from 'react-native';
import { colors, font, spacing, radius } from '../../utils/theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>

        {/* logo area */}
        <View style={styles.logoBlock}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoP}>🅿</Text>
          </View>
          <Text style={styles.appName}>EstacioneAq</Text>
          <Text style={styles.tagline}>Sua vaga, na hora certa.</Text>
        </View>

        {/* role selection */}
        <View style={styles.cardsRow}>
          <RoleCard
            icon="🚗"
            title="Sou motorista"
            sub="Busco e reservo vagas"
            onPress={() => navigation.navigate('RegisterUser')}
          />
          <RoleCard
            icon="🏢"
            title="Sou dono"
            sub="Cadastro meu estacionamento"
            onPress={() => navigation.navigate('RegisterOwner')}
          />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Já tenho conta →</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

function RoleCard({ icon, title, sub, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={styles.roleCard}>
      <Text style={styles.roleIcon}>{icon}</Text>
      <Text style={styles.roleTitle}>{title}</Text>
      <Text style={styles.roleSub}>{sub}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.navy },
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },

  logoBlock: { alignItems: 'center', marginBottom: spacing.xl * 1.5 },
  logoCircle: {
    width: 88, height: 88, borderRadius: radius.full,
    backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoP:    { fontSize: 44 },
  appName:  { fontSize: font.xxl, fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  tagline:  { fontSize: font.md, color: colors.teal, marginTop: 6 },

  cardsRow:  { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  roleCard:  {
    flex: 1,
    backgroundColor: colors.navyLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.navyMid,
  },
  roleIcon:  { fontSize: 36, marginBottom: 8 },
  roleTitle: { fontSize: font.base, fontWeight: '700', color: colors.white, textAlign: 'center' },
  roleSub:   { fontSize: font.sm, color: colors.textMuted, textAlign: 'center', marginTop: 4 },

  loginLink: { alignItems: 'center', padding: spacing.md },
  loginLinkText: { fontSize: font.base, color: colors.teal, fontWeight: '600' },
});
