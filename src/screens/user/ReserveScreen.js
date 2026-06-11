import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Divider } from '../../components/UI';
import { colors, font, spacing, radius } from '../../utils/theme';

const VEHICLE_TYPES = ['Carro', 'Moto', 'Caminhonete', 'Van'];

function TimeSlot({ hour, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.slot, selected && styles.slotActive]}
    >
      <Text style={[styles.slotText, selected && styles.slotTextActive]}>{hour}h</Text>
    </TouchableOpacity>
  );
}

export default function ReserveScreen({ navigation, route }) {
  const { parkings, makeReservation } = useAuth();
  const { parkingId } = route.params;
  const parking = parkings.find(p => p.id === parkingId);

  const [hours, setHours]       = useState(1);
  const [plate, setPlate]       = useState('');
  const [vehicle, setVehicle]   = useState('Carro');
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading]   = useState(false);

  if (!parking) return null;

  const total = hours * parking.pricePerHour;
  const fee   = total * 0.05; // 5% service fee
  const grand = total + fee;

  function formatDate(offsetHours = 0) {
    const d = new Date();
    d.setHours(d.getHours() + offsetHours);
    return `${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
  }

  async function handleConfirm() {
    if (!plate.trim()) {
      Alert.alert('Atenção', 'Informe a placa do veículo.'); return;
    }
    if (plate.trim().length < 7) {
      Alert.alert('Atenção', 'Placa inválida.'); return;
    }
    setLoading(true);
    try {
      const reservation = await makeReservation(parkingId, {
        hours,
        plate:       plate.trim().toUpperCase(),
        vehicleType: vehicle,
        totalAmount: grand,
        startTime:   startTime || formatDate(0),
        endTime:     formatDate(hours),
      });
      Alert.alert(
        '✅ Reserva confirmada!',
        `Sua vaga está garantida.\nCódigo: #${reservation.id.slice(-6).toUpperCase()}`,
        [{ text: 'Ver minhas reservas', onPress: () => navigation.navigate('Reservas') }]
      );
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Reservar vaga</Text>
          <Text style={styles.headerSub}>{parking.name}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* duration picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tempo de permanência</Text>
          <View style={styles.slots}>
            {[1, 2, 3, 4, 6, 8, 12, 24].map(h => (
              <TimeSlot key={h} hour={h} selected={hours === h} onPress={() => setHours(h)} />
            ))}
          </View>
          <Text style={styles.durationNote}>
            Entrada: qualquer horário a partir de agora · Saída em até {hours}h
          </Text>
        </View>

        <Divider />

        {/* vehicle info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados do veículo</Text>
          <Input
            label="Placa *"
            value={plate}
            onChangeText={setPlate}
            autoCapitalize="characters"
            maxLength={8}
            placeholder="ABC1D23 ou ABC-1234"
          />
          <Text style={styles.label}>Tipo de veículo</Text>
          <View style={styles.vehicleRow}>
            {VEHICLE_TYPES.map(v => (
              <TouchableOpacity
                key={v}
                onPress={() => setVehicle(v)}
                style={[styles.vehicleChip, vehicle === v && styles.vehicleChipActive]}
              >
                <Text style={[styles.vehicleChipText, vehicle === v && styles.vehicleChipTextActive]}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Divider />

        {/* price summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do pagamento</Text>
          <View style={styles.summaryCard}>
            <Row label={`${hours}h × R$ ${parking.pricePerHour.toFixed(2)}`} value={`R$ ${total.toFixed(2)}`} />
            <Row label="Taxa de serviço (5%)" value={`R$ ${fee.toFixed(2)}`} muted />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>R$ {grand.toFixed(2)}</Text>
            </View>
          </View>
          <Text style={styles.payNote}>💳 Pagamento simulado — integração PIX/cartão em breve</Text>
        </View>

      </ScrollView>

      <View style={styles.cta}>
        <Button
          title={`Confirmar e pagar R$ ${grand.toFixed(2)}`}
          onPress={handleConfirm}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, muted }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, muted && { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.rowValue, muted && { color: colors.textMuted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.offWhite },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.navy, padding: spacing.lg, gap: spacing.md,
  },
  back: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.navyLight, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.white, fontSize: 20 },
  headerTitle: { fontSize: font.lg, fontWeight: '700', color: colors.white },
  headerSub:   { fontSize: font.sm, color: colors.teal },

  body: { padding: spacing.lg },

  section:      { marginBottom: spacing.md },
  sectionTitle: { fontSize: font.md, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },

  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slot: {
    width: 60, height: 48, borderRadius: radius.md,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.white,
  },
  slotActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  slotText:   { fontSize: font.base, fontWeight: '600', color: colors.textSecond },
  slotTextActive: { color: colors.white },
  durationNote: { fontSize: font.sm, color: colors.textMuted, marginTop: spacing.sm },

  label: { fontSize: font.sm, fontWeight: '600', color: colors.textSecond, marginBottom: 8 },
  vehicleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  vehicleChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.white,
  },
  vehicleChipActive: { backgroundColor: colors.navy, borderColor: colors.navy },
  vehicleChipText:   { fontSize: font.sm, fontWeight: '600', color: colors.textSecond },
  vehicleChipTextActive: { color: colors.white },

  summaryCard: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  row:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rowLabel:  { fontSize: font.base, color: colors.textSecond },
  rowValue:  { fontSize: font.base, fontWeight: '600', color: colors.textPrimary },
  totalRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4 },
  totalLabel: { fontSize: font.md, fontWeight: '700', color: colors.textPrimary },
  totalValue: { fontSize: font.lg, fontWeight: '900', color: colors.navy },
  payNote:    { fontSize: font.sm, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },

  cta: { padding: spacing.lg, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border },
});
