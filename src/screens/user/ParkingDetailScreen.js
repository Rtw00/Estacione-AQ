import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Badge, Divider } from '../../components/UI';
import { colors, font, spacing, radius } from '../../utils/theme';

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ParkingDetailScreen({ navigation, route }) {
  const { parkings } = useAuth();
  const { parkingId } = route.params;
  const parking = parkings.find(p => p.id === parkingId);

  if (!parking) return null;

  const available = parking.availableSpots > 0;
  const occupancy = Math.round(((parking.totalSpots - parking.availableSpots) / parking.totalSpots) * 100);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* hero header */}
      <View style={styles.hero}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.heroIcon}>
          <Text style={{ fontSize: 40 }}>🅿️</Text>
        </View>
        <Text style={styles.heroName}>{parking.name}</Text>
        <Text style={styles.heroAddr}>{parking.address}</Text>
        <View style={styles.heroRow}>
          <Badge
            label={available ? `${parking.availableSpots} vagas disponíveis` : 'Sem vagas disponíveis'}
            color={available ? colors.teal : colors.danger}
          />
          {parking.rating > 0 && (
            <View style={styles.ratingPill}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingText}>{parking.rating.toFixed(1)}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>

        {/* price highlight */}
        <View style={styles.priceCard}>
          <View>
            <Text style={styles.priceLarge}>R$ {parking.pricePerHour.toFixed(2)}</Text>
            <Text style={styles.priceLabel}>por hora</Text>
          </View>
          <View style={styles.priceSamples}>
            <SamplePrice hours={1} rate={parking.pricePerHour} />
            <SamplePrice hours={2} rate={parking.pricePerHour} />
            <SamplePrice hours={4} rate={parking.pricePerHour} />
          </View>
        </View>

        <Divider />

        {/* info */}
        <Text style={styles.section}>Informações</Text>
        <InfoRow icon="🕐" label="Funcionamento" value={parking.openHours} />
        <InfoRow icon="📞" label="Telefone" value={parking.phone} />
        <InfoRow icon="🚘" label="Total de vagas" value={`${parking.totalSpots} vagas`} />
        <InfoRow icon="📊" label="Ocupação atual" value={`${occupancy}%`} />

        <Divider />

        {/* occupancy bar */}
        <Text style={styles.section}>Disponibilidade</Text>
        <View style={styles.barBg}>
          <View style={[
            styles.barFill,
            { width: `${occupancy}%`, backgroundColor: occupancy > 80 ? colors.danger : occupancy > 50 ? colors.warning : colors.teal }
          ]} />
        </View>
        <View style={styles.barLabels}>
          <Text style={styles.barLabel}>{parking.totalSpots - parking.availableSpots} ocupadas</Text>
          <Text style={styles.barLabel}>{parking.availableSpots} livres</Text>
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={styles.cta}>
        <Button
          title={available ? 'Reservar vaga →' : 'Sem vagas disponíveis'}
          onPress={() => available && navigation.navigate('Reserve', { parkingId: parking.id })}
          style={!available && { backgroundColor: colors.border }}
        />
      </View>
    </SafeAreaView>
  );
}

function SamplePrice({ hours, rate }) {
  return (
    <View style={styles.sample}>
      <Text style={styles.sampleHours}>{hours}h</Text>
      <Text style={styles.samplePrice}>R$ {(hours * rate).toFixed(2)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },

  hero: {
    backgroundColor: colors.navy,
    padding: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  back: {
    alignSelf: 'flex-start',
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.navyLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  backText: { color: colors.white, fontSize: 20 },
  heroIcon: { marginBottom: spacing.sm },
  heroName: { fontSize: font.xl, fontWeight: '800', color: colors.white, textAlign: 'center' },
  heroAddr: { fontSize: font.sm, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  heroRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  ratingPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F59E0B22', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3, gap: 4 },
  star: { color: '#F59E0B', fontSize: 13 },
  ratingText: { color: '#F59E0B', fontWeight: '700', fontSize: font.sm },

  body: { padding: spacing.lg },

  priceCard: {
    backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md,
  },
  priceLarge: { fontSize: font.xxl, fontWeight: '900', color: colors.navy },
  priceLabel: { fontSize: font.sm, color: colors.textMuted },
  priceSamples: { flexDirection: 'row', gap: spacing.sm },
  sample: { alignItems: 'center', backgroundColor: colors.offWhite, borderRadius: radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  sampleHours: { fontSize: font.sm, color: colors.textMuted },
  samplePrice: { fontSize: font.sm, fontWeight: '700', color: colors.navy },

  section: { fontSize: font.base, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  infoIcon: { fontSize: 20, width: 28 },
  infoLabel: { fontSize: font.sm, color: colors.textMuted },
  infoValue: { fontSize: font.base, fontWeight: '600', color: colors.textPrimary },

  barBg:   { height: 12, backgroundColor: colors.border, borderRadius: radius.full, overflow: 'hidden', marginBottom: 6 },
  barFill: { height: '100%', borderRadius: radius.full },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel:  { fontSize: font.sm, color: colors.textMuted },

  cta: { padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
});
