import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Divider } from '../../components/UI';
import { colors, font, spacing, radius } from '../../utils/theme';

function InfoItem({ label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const isOwner = user?.role === 'owner';

  function handleLogout() {
    Alert.alert('Sair da conta?', 'Você precisará fazer login novamente.', [
      { text: 'Cancelar' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{isOwner ? '🏢 Dono de estacionamento' : '🚗 Motorista'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados da conta</Text>
          <Divider />
          <InfoItem label="E-mail"   value={user?.email} />
          <InfoItem label="Telefone" value={user?.phone} />
          {isOwner && <InfoItem label="CPF/CNPJ" value={user?.cpfCnpj} />}
          <InfoItem label="ID"       value={user?.id} />
        </View>

        <View style={styles.statsRow}>
          <StatCard
            icon={isOwner ? '🏢' : '📋'}
            value={isOwner ? '—' : (user?.reservations?.length || 0)}
            label={isOwner ? 'Estacionamentos' : 'Reservas'}
          />
          <StatCard
            icon={isOwner ? '✅' : '✅'}
            value={isOwner
              ? '—'
              : (user?.reservations?.filter(r => r.status === 'confirmed').length || 0)}
            label="Ativas"
          />
        </View>

        <Button
          title="Sair da conta"
          variant="outline"
          onPress={handleLogout}
          style={{ borderColor: colors.danger }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },

  header: { backgroundColor: colors.navy, alignItems: 'center', padding: spacing.xl },
  avatar: {
    width: 80, height: 80, borderRadius: radius.full,
    backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: { fontSize: font.xl, fontWeight: '800', color: colors.navy },
  name:       { fontSize: font.lg, fontWeight: '800', color: colors.white },
  rolePill:   { backgroundColor: colors.navyLight, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 4, marginTop: 8 },
  roleText:   { fontSize: font.sm, color: colors.teal, fontWeight: '600' },

  body: { padding: spacing.lg },

  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: font.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  infoItem:  { paddingVertical: 10 },
  infoLabel: { fontSize: font.sm, color: colors.textMuted },
  infoValue: { fontSize: font.base, color: colors.textPrimary, fontWeight: '500', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  stat: {
    flex: 1, backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
  },
  statIcon:  { fontSize: 28, marginBottom: 4 },
  statValue: { fontSize: font.xl, fontWeight: '800', color: colors.navy },
  statLabel: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
});
