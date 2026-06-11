import React from 'react';
import {
  View, Text, StyleSheet, FlatList,
  SafeAreaView, StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, Badge } from '../../components/UI';
import { colors, font, spacing, radius } from '../../utils/theme';

function ParkingCard({ parking }) {
  const occupancy = parking.totalSpots > 0
    ? Math.round(((parking.totalSpots - parking.availableSpots) / parking.totalSpots) * 100)
    : 0;

  const todayRevenue = parking.reservations
    .filter(r => r.status === 'confirmed')
    .reduce((sum, r) => sum + (r.totalAmount || 0), 0);

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.name}>{parking.name}</Text>
          <Text style={styles.addr}>{parking.address}</Text>
        </View>
        <Badge
          label={parking.availableSpots > 0 ? `${parking.availableSpots} livres` : 'Lotado'}
          color={parking.availableSpots > 0 ? colors.teal : colors.danger}
        />
      </View>

      <View style={styles.statsRow}>
        <Stat label="Total vagas" value={parking.totalSpots} />
        <Stat label="Ocupação"    value={`${occupancy}%`} />
        <Stat label="Reservas"    value={parking.reservations.length} />
        <Stat label="Receita"     value={`R$${todayRevenue.toFixed(0)}`} />
      </View>

      <View style={styles.barBg}>
        <View style={[styles.barFill, {
          width: `${occupancy}%`,
          backgroundColor: occupancy > 80 ? colors.danger : occupancy > 50 ? colors.warning : colors.teal,
        }]} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={styles.barLabel}>Ocupação atual</Text>
        <Text style={styles.barLabel}>{occupancy}%</Text>
      </View>
    </View>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function OwnerDashboardScreen() {
  const { parkings, user } = useAuth();
  const myParkings = parkings.filter(p => p.ownerId === user.id);

  const totalRevenue  = myParkings.flatMap(p => p.reservations).filter(r => r.status === 'confirmed').reduce((s, r) => s + (r.totalAmount || 0), 0);
  const totalReserv   = myParkings.flatMap(p => p.reservations).filter(r => r.status === 'confirmed').length;
  const totalSpots    = myParkings.reduce((s, p) => s + p.totalSpots, 0);
  const totalFree     = myParkings.reduce((s, p) => s + p.availableSpots, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.greeting}>Bem-vindo, {user.name.split(' ')[0]}</Text>
        <Text style={styles.title}>Painel do dono</Text>
      </View>

      {myParkings.length > 0 && (
        <View style={styles.summary}>
          <SummaryCard icon="🏢" value={myParkings.length} label="Estacionamentos" />
          <SummaryCard icon="🚘" value={`${totalSpots - totalFree}/${totalSpots}`} label="Vagas ocupadas" />
          <SummaryCard icon="📋" value={totalReserv} label="Reservas" />
          <SummaryCard icon="💰" value={`R$${totalRevenue.toFixed(0)}`} label="Receita total" />
        </View>
      )}

      <FlatList
        data={myParkings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ParkingCard parking={item} />}
        ListEmptyComponent={
          <EmptyState
            icon="🏗️"
            title="Nenhum estacionamento ainda"
            message="Vá em Adicionar para cadastrar seu primeiro estacionamento."
          />
        }
      />
    </SafeAreaView>
  );
}

function SummaryCard({ icon, value, label }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryIcon}>{icon}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: colors.offWhite },
  header:   { backgroundColor: colors.navy, padding: spacing.lg },
  greeting: { fontSize: font.sm, color: colors.teal, fontWeight: '600' },
  title:    { fontSize: font.xl, fontWeight: '800', color: colors.white, marginTop: 2 },

  summary: { flexDirection: 'row', backgroundColor: colors.navy, paddingHorizontal: spacing.md, paddingBottom: spacing.lg, gap: spacing.sm },
  summaryCard: { flex: 1, backgroundColor: colors.navyLight, borderRadius: radius.md, padding: 10, alignItems: 'center' },
  summaryIcon:  { fontSize: 18, marginBottom: 2 },
  summaryValue: { fontSize: font.md, fontWeight: '800', color: colors.white },
  summaryLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 2 },

  list: { padding: spacing.md },

  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  cardInfo: { flex: 1, marginRight: spacing.sm },
  name:     { fontSize: font.md, fontWeight: '700', color: colors.textPrimary },
  addr:     { fontSize: font.sm, color: colors.textMuted, marginTop: 3 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  stat:     { alignItems: 'center' },
  statValue: { fontSize: font.base, fontWeight: '700', color: colors.navy },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },

  barBg:   { height: 8, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden', marginTop: 8 },
  barFill: { height: '100%', borderRadius: radius.full },
  barLabel: { fontSize: 10, color: colors.textMuted },
});
