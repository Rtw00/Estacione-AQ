import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  StatusBar, TouchableOpacity, Alert, Modal, AppState,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, Badge, Button } from '../../components/UI';
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
  arrived_pending: 'Aguardando dono',
  active:          'Em uso',
  finished:        'Finalizada',
  cancelled:       'Cancelada',
};

// ---------- countdown hook ----------
function useCountdown(endsAt) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!endsAt) { setRemaining(0); return; }
    function tick() {
      const diff = Math.max(0, new Date(endsAt) - new Date());
      setRemaining(diff);
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return remaining;
}

function formatMs(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':');
}

// ---------- active timer card ----------
function ActiveTimerCard({ reservation, parkingName, onExtend, onFinish }) {
  const remaining = useCountdown(reservation.timerEndsAt);
  const warningShown = useRef(false);
  const expiredShown = useRef(false);

  useEffect(() => {
    if (remaining > 0 && remaining <= 5 * 60 * 1000 && !warningShown.current) {
      warningShown.current = true;
      onExtend('warning');
    }
    if (remaining === 0 && !expiredShown.current) {
      expiredShown.current = true;
      onFinish();
    }
  }, [remaining]);

  const urgent = remaining > 0 && remaining <= 5 * 60 * 1000;

  return (
    <View style={[styles.card, urgent && styles.cardUrgent]}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.parkingName}>{parkingName}</Text>
          <Text style={styles.code}>#{reservation.id.slice(-6).toUpperCase()}</Text>
        </View>
        <Badge label="Em uso" color="#6366f1" />
      </View>

      <View style={[styles.timerBox, urgent && styles.timerBoxUrgent]}>
        <Text style={styles.timerLabel}>{urgent ? '⚠️ Tempo quase esgotado!' : '⏱ Tempo restante'}</Text>
        <Text style={[styles.timerValue, urgent && styles.timerValueUrgent]}>
          {formatMs(remaining)}
        </Text>
      </View>

      <Detail icon="🚘" text={`${reservation.vehicleType} · ${reservation.plate}`} />
      {reservation.extraCharges > 0 && (
        <Detail icon="💸" text={`Cobranças extras: R$ ${reservation.extraCharges.toFixed(2)}`} />
      )}

      <TouchableOpacity onPress={() => onExtend('manual')} style={styles.extendBtn}>
        <Text style={styles.extendText}>+ Estender tempo</Text>
      </TouchableOpacity>
    </View>
  );
}

// ---------- main screen ----------
export default function MyReservationsScreen() {
  const { user, parkings, cancelReservation, deleteReservation,
          notifyArrival, extendReservation, finishReservation } = useAuth();

  const [extendModal, setExtendModal] = useState({ visible: false, id: null, mode: 'manual' });
  const [graceModal,  setGraceModal]  = useState({ visible: false, id: null, secondsLeft: 300 });
  const graceTimer = useRef(null);

  const reservations = (user?.reservations || [])
    .map(r => {
      const parking = parkings.find(p => p.id === r.parkingId);
      return { ...r, parkingName: parking?.name || 'Estacionamento', pricePerHour: parking?.pricePerHour || 0 };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  function handleCancel(id) {
    Alert.alert('Cancelar reserva?', 'A vaga será liberada imediatamente.', [
      { text: 'Não' },
      { text: 'Sim, cancelar', style: 'destructive', onPress: () => cancelReservation(id) },
    ]);
  }

  function handleDelete(id) {
    Alert.alert('Excluir?', 'Remover da sua lista de reservas?', [
      { text: 'Não' },
      { text: 'Excluir', style: 'destructive', onPress: () => deleteReservation(id) },
    ]);
  }

  function handleArrival(id) {
    Alert.alert('Confirmar chegada?', 'O dono do estacionamento será notificado para liberar sua vaga.', [
      { text: 'Ainda não' },
      { text: 'Cheguei!', onPress: () => notifyArrival(id) },
    ]);
  }

  // called by timer card when <= 5 min or when reaches 0
  function handleTimerEvent(reservationId, mode) {
    if (mode === 'warning') {
      setExtendModal({ visible: true, id: reservationId, mode: 'warning' });
    } else {
      // time's up — start 5 min grace period
      startGrace(reservationId);
    }
  }

  function startGrace(reservationId) {
    setGraceModal({ visible: true, id: reservationId, secondsLeft: 300 });
    let s = 300;
    graceTimer.current = setInterval(() => {
      s -= 1;
      setGraceModal(prev => ({ ...prev, secondsLeft: s }));
      if (s <= 0) {
        clearInterval(graceTimer.current);
        setGraceModal({ visible: false, id: null, secondsLeft: 0 });
        finishReservation(reservationId);
        Alert.alert('Tempo encerrado', 'Sua reserva foi finalizada.');
      }
    }, 1000);
  }

  function handleExtendChoice(extraHours) {
    clearInterval(graceTimer.current);
    setExtendModal({ visible: false, id: null, mode: 'manual' });
    setGraceModal({ visible: false, id: null, secondsLeft: 0 });
    if (extendModal.id || graceModal.id) {
      const id = extendModal.id || graceModal.id;
      extendReservation(id, extraHours);
    }
  }

  function handleLeave() {
    clearInterval(graceTimer.current);
    const id = graceModal.id;
    setGraceModal({ visible: false, id: null, secondsLeft: 0 });
    finishReservation(id);
  }

  useEffect(() => () => clearInterval(graceTimer.current), []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Minhas reservas</Text>
        <Text style={styles.sub}>{reservations.length} no total</Text>
      </View>

      <FlatList
        data={reservations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.status === 'active') {
            return (
              <ActiveTimerCard
                reservation={item}
                parkingName={item.parkingName}
                onExtend={(mode) => setExtendModal({ visible: true, id: item.id, mode })}
                onFinish={() => startGrace(item.id)}
              />
            );
          }
          return (
            <ReservationCard
              reservation={item}
              onCancel={() => handleCancel(item.id)}
              onDelete={() => handleDelete(item.id)}
              onArrival={() => handleArrival(item.id)}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="📋" title="Nenhuma reserva ainda"
            message="Busque um estacionamento e reserve antes mesmo de sair de casa." />
        }
      />

      {/* Extend modal */}
      <Modal transparent animationType="fade" visible={extendModal.visible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {extendModal.mode === 'warning' ? '⚠️ Restam 5 minutos!' : '+ Estender tempo'}
            </Text>
            <Text style={styles.modalSub}>Por quantas horas deseja estender?</Text>
            <View style={styles.extendOptions}>
              {[1, 2, 3].map(h => (
                <TouchableOpacity key={h} style={styles.extendOption} onPress={() => handleExtendChoice(h)}>
                  <Text style={styles.extendOptionH}>{h}h</Text>
                  <Text style={styles.extendOptionP}>
                    R$ {(h * (reservations.find(r => r.id === extendModal.id)?.pricePerHour || 0)).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setExtendModal({ visible: false, id: null, mode: 'manual' })}
            >
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Grace period modal */}
      <Modal transparent animationType="fade" visible={graceModal.visible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>⏰ Tempo encerrado!</Text>
            <Text style={styles.modalSub}>
              Você tem {formatMs(graceModal.secondsLeft * 1000)} para retirar o veículo ou estender.
            </Text>
            <View style={styles.graceTimer}>
              <Text style={styles.graceTimerText}>{formatMs(graceModal.secondsLeft * 1000)}</Text>
            </View>
            <View style={styles.extendOptions}>
              {[1, 2, 3].map(h => (
                <TouchableOpacity key={h} style={styles.extendOption} onPress={() => handleExtendChoice(h)}>
                  <Text style={styles.extendOptionH}>{h}h</Text>
                  <Text style={styles.extendOptionP}>
                    R$ {(h * (reservations.find(r => r.id === graceModal.id)?.pricePerHour || 0)).toFixed(2)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.modalClose, { borderColor: colors.danger }]} onPress={handleLeave}>
              <Text style={[styles.modalCloseText, { color: colors.danger }]}>Vou retirar o carro</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ReservationCard({ reservation, onCancel, onDelete, onArrival }) {
  const isDeletable = ['cancelled', 'finished'].includes(reservation.status);
  const canArrive   = reservation.status === 'confirmed';
  const isPending   = reservation.status === 'arrived_pending';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardLeft}>
          <Text style={styles.parkingName}>{reservation.parkingName}</Text>
          <Text style={styles.code}>#{reservation.id.slice(-6).toUpperCase()}</Text>
        </View>
        <Badge
          label={STATUS_LABELS[reservation.status] || reservation.status}
          color={STATUS_COLORS[reservation.status] || colors.textMuted}
        />
      </View>

      <View style={styles.details}>
        <Detail icon="🚘" text={`${reservation.vehicleType} · ${reservation.plate}`} />
        <Detail icon="⏱" text={`${reservation.hours}h de permanência`} />
        <Detail icon="📅" text={`Entrada: ${reservation.startTime}`} />
        <Detail icon="💰" text={`R$ ${reservation.totalAmount?.toFixed(2)}`} />
        {reservation.extraCharges > 0 && (
          <Detail icon="💸" text={`Extras: R$ ${reservation.extraCharges.toFixed(2)}`} />
        )}
      </View>

      <View style={styles.actions}>
        {canArrive && (
          <TouchableOpacity onPress={onArrival} style={styles.arrivedBtn}>
            <Text style={styles.arrivedText}>📍 Cheguei!</Text>
          </TouchableOpacity>
        )}
        {isPending && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>⏳ Aguardando confirmação do dono...</Text>
          </View>
        )}
        {canArrive && (
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        )}
        {isDeletable && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>🗑 Excluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function Detail({ icon, text }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.offWhite },
  header: { backgroundColor: colors.navy, padding: spacing.lg },
  title:  { fontSize: font.xl, fontWeight: '800', color: colors.white },
  sub:    { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },
  list:   { padding: spacing.md },

  card: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  cardUrgent: { borderColor: colors.warning, borderWidth: 2 },
  cardTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm },
  cardLeft:   {},
  parkingName:{ fontSize: font.md, fontWeight: '700', color: colors.textPrimary },
  code:       { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },

  timerBox: {
    backgroundColor: '#6366f111', borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
    borderWidth: 1, borderColor: '#6366f133',
  },
  timerBoxUrgent: { backgroundColor: colors.warning + '22', borderColor: colors.warning + '66' },
  timerLabel: { fontSize: font.sm, color: colors.textSecond, marginBottom: 4 },
  timerValue: { fontSize: 36, fontWeight: '900', color: '#6366f1', fontVariant: ['tabular-nums'] },
  timerValueUrgent: { color: colors.warning },

  details: { gap: 6, marginBottom: spacing.sm },
  detail:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailIcon: { fontSize: 14, width: 20 },
  detailText: { fontSize: font.sm, color: colors.textSecond },

  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: 4 },

  arrivedBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, backgroundColor: colors.teal,
  },
  arrivedText: { fontSize: font.sm, color: colors.white, fontWeight: '700' },

  pendingBadge: {
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: radius.full, backgroundColor: colors.warning + '22',
  },
  pendingText: { fontSize: font.sm, color: colors.warning, fontWeight: '600' },

  extendBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: '#6366f1',
  },
  extendText: { fontSize: font.sm, color: '#6366f1', fontWeight: '700' },

  cancelBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.danger,
  },
  cancelText: { fontSize: font.sm, color: colors.danger, fontWeight: '600' },

  deleteBtn: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: radius.full, backgroundColor: colors.surface,
  },
  deleteText: { fontSize: font.sm, color: colors.textSecond, fontWeight: '600' },

  // modals
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.white, borderRadius: radius.xl,
    padding: spacing.lg, width: '100%',
  },
  modalTitle: { fontSize: font.lg, fontWeight: '800', color: colors.textPrimary, textAlign: 'center', marginBottom: 6 },
  modalSub:   { fontSize: font.base, color: colors.textSecond, textAlign: 'center', marginBottom: spacing.lg },

  graceTimer: {
    backgroundColor: colors.danger + '11', borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', marginBottom: spacing.md,
  },
  graceTimerText: { fontSize: 38, fontWeight: '900', color: colors.danger },

  extendOptions: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginBottom: spacing.md },
  extendOption: {
    flex: 1, borderRadius: radius.md, backgroundColor: colors.navy,
    alignItems: 'center', paddingVertical: 14,
  },
  extendOptionH: { fontSize: font.lg, fontWeight: '800', color: colors.white },
  extendOptionP: { fontSize: font.sm, color: colors.teal, marginTop: 2 },

  modalClose: {
    alignItems: 'center', padding: spacing.sm,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border,
  },
  modalCloseText: { fontSize: font.base, color: colors.textSecond, fontWeight: '600' },
});
