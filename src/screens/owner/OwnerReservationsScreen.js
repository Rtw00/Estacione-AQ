import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  StatusBar, TouchableOpacity, Modal, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, Badge } from '../../components/UI';
import { colors, font, spacing, radius } from '../../utils/theme';

const STATUS_COLORS = {
  confirmed:       colors.teal,
  arrived_pending: colors.warning,
  active:          '#6366f1',
  finished:        colors.textMuted,
  cancelled:       colors.danger,
};
const STATUS_LABELS = {
  confirmed:       'Confirmada',
  arrived_pending: '📍 Cliente chegou!',
  active:          'Em uso',
  finished:        'Finalizada',
  cancelled:       'Cancelada',
};

export default function OwnerReservationsScreen() {
  const { parkings, user, confirmArrival } = useAuth();
  const myParkings = parkings.filter(p => p.ownerId === user.id);

  const [arrivalModal, setArrivalModal] = useState({ visible: false, reservation: null, parkingName: '' });

  const allReservations = myParkings
    .flatMap(p => p.reservations.map(r => ({ ...r, parkingName: p.name })))
    .sort((a, b) => {
      // arrived_pending first
      if (a.status === 'arrived_pending' && b.status !== 'arrived_pending') return -1;
      if (b.status === 'arrived_pending' && a.status !== 'arrived_pending') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const pendingArrivals = allReservations.filter(r => r.status === 'arrived_pending');
  const confirmed = allReservations.filter(r => r.status === 'confirmed').length;
  const active    = allReservations.filter(r => r.status === 'active').length;
  const revenue   = allReservations.filter(r => ['active','finished'].includes(r.status))
                      .reduce((s, r) => s + (r.totalAmount || 0), 0);

  function handleConfirmArrival() {
    const { reservation } = arrivalModal;
    setArrivalModal({ visible: false, reservation: null, parkingName: '' });
    confirmArrival(reservation.id);
    Alert.alert('✅ Acesso liberado!', `Timer iniciado para ${reservation.userName}.`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Reservas recebidas</Text>
        <View style={styles.headerStats}>
          <Pill label={`${confirmed} aguardando`} color={colors.teal} />
          <Pill label={`${active} em uso`}        color="#6366f1" />
          <Pill label={`R$ ${revenue.toFixed(0)}`} color={colors.warning} />
        </View>
      </View>

      {/* pending arrivals banner */}
      {pendingArrivals.length > 0 && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>
            📍 {pendingArrivals.length} cliente{pendingArrivals.length > 1 ? 's' : ''} aguardando confirmação de chegada!
          </Text>
        </View>
      )}

      <FlatList
        data={allReservations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <BookingCard
            reservation={item}
            onConfirmArrival={item.status === 'arrived_pending'
              ? () => setArrivalModal({ visible: true, reservation: item, parkingName: item.parkingName })
              : null}
          />
        )}
        ListEmptyComponent={
          <EmptyState icon="📭" title="Sem reservas ainda"
            message="Quando motoristas reservarem suas vagas, elas aparecerão aqui." />
        }
      />

      {/* Arrival confirmation modal */}
      <Modal transparent animationType="slide" visible={arrivalModal.visible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalEmoji}>📍</Text>
            <Text style={styles.modalTitle}>Cliente chegou!</Text>
            <Text style={styles.modalSub}>
              <Text style={{ fontWeight: '700' }}>{arrivalModal.reservation?.userName}</Text>
              {'\n'}está no estacionamento {arrivalModal.parkingName}.
              {'\n'}Confirme para iniciar o timer da vaga.
            </Text>
            <View style={styles.modalInfo}>
              <InfoRow icon="🚘" text={`${arrivalModal.reservation?.vehicleType} · ${arrivalModal.reservation?.plate}`} />
              <InfoRow icon="⏱" text={`${arrivalModal.reservation?.hours}h reservadas`} />
              <InfoRow icon="💰" text={`R$ ${arrivalModal.reservation?.totalAmount?.toFixed(2)}`} />
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmArrival}>
              <Text style={styles.confirmBtnText}>✅ Liberar acesso e iniciar timer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.denyBtn}
              onPress={() => setArrivalModal({ visible: false, reservation: null, parkingName: '' })}
            >
              <Text style={styles.denyBtnText}>Verificar depois</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function BookingCard({ reservation, onConfirmArrival }) {
  const isArrived = reservation.status === 'arrived_pending';
  return (
    <View style={[styles.card, isArrived && styles.cardHighlight]}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.userName}>{reservation.userName || 'Cliente'}</Text>
          <Text style={styles.parkingName}>{reservation.parkingName}</Text>
        </View>
        <Badge
          label={STATUS_LABELS[reservation.status] || reservation.status}
          color={STATUS_COLORS[reservation.status] || colors.textMuted}
        />
      </View>
      <View style={styles.details}>
        <Detail icon="🚘" text={`${reservation.vehicleType} · ${reservation.plate}`} />
        <Detail icon="⏱"  text={`${reservation.hours}h`} />
        <Detail icon="📅" text={reservation.startTime} />
        <Detail icon="💰" text={`R$ ${reservation.totalAmount?.toFixed(2)}`} bold />
      </View>
      {onConfirmArrival && (
        <TouchableOpacity style={styles.arrivalBtn} onPress={onConfirmArrival}>
          <Text style={styles.arrivalBtnText}>📍 Confirmar chegada</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function Detail({ icon, text, bold }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={[styles.detailText, bold && { fontWeight: '700', color: colors.navy }]}>{text}</Text>
    </View>
  );
}

function InfoRow({ icon, text }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function Pill({ label, color }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.offWhite },
  header: { backgroundColor: colors.navy, padding: spacing.lg },
  title:  { fontSize: font.xl, fontWeight: '800', color: colors.white, marginBottom: spacing.sm },
  headerStats: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  pill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, borderWidth: 1 },
  pillText: { fontSize: font.sm, fontWeight: '600' },

  alertBanner: {
    backgroundColor: colors.warning + '22', borderLeftWidth: 4, borderLeftColor: colors.warning,
    padding: spacing.md,
  },
  alertText: { fontSize: font.base, color: colors.warning, fontWeight: '700' },

  list: { padding: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardHighlight: { borderColor: colors.warning, borderWidth: 2 },
  cardTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardLeft:    {},
  userName:    { fontSize: font.md, fontWeight: '700', color: colors.textPrimary },
  parkingName: { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },

  details: { gap: 6, marginBottom: spacing.sm },
  detail:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailIcon: { fontSize: 13, width: 18 },
  detailText: { fontSize: font.sm, color: colors.textSecond },

  arrivalBtn: {
    backgroundColor: colors.warning, borderRadius: radius.md,
    padding: spacing.sm, alignItems: 'center',
  },
  arrivalBtnText: { color: colors.white, fontWeight: '700', fontSize: font.base },

  // modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: spacing.xl, paddingBottom: 40,
  },
  modalEmoji: { fontSize: 48, textAlign: 'center', marginBottom: spacing.sm },
  modalTitle: { fontSize: font.xl, fontWeight: '800', color: colors.textPrimary, textAlign: 'center' },
  modalSub:   { fontSize: font.base, color: colors.textSecond, textAlign: 'center', marginTop: 8, lineHeight: 22, marginBottom: spacing.md },

  modalInfo: { backgroundColor: colors.offWhite, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg },
  infoRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 6 },
  infoIcon:  { fontSize: 16 },
  infoText:  { fontSize: font.base, color: colors.textPrimary, fontWeight: '500' },

  confirmBtn: {
    backgroundColor: colors.teal, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.sm,
  },
  confirmBtnText: { color: colors.white, fontWeight: '700', fontSize: font.md },

  denyBtn: { alignItems: 'center', padding: spacing.sm },
  denyBtnText: { color: colors.textMuted, fontSize: font.base },
});
