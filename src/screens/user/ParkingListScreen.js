import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, SafeAreaView,
  StatusBar, TextInput, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { colors, font, spacing, radius } from '../../utils/theme';
import { Badge } from '../../components/UI';

function ParkingCard({ parking, onPress }) {
  const available = parking.availableSpots > 0;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>{parking.name}</Text>
          <Text style={styles.cardAddr} numberOfLines={1}>{parking.address}</Text>
        </View>
        <View style={styles.priceBlock}>
          <Text style={styles.priceValue}>R$ {parking.pricePerHour.toFixed(2)}</Text>
          <Text style={styles.priceLabel}>/hora</Text>
        </View>
      </View>

      <View style={styles.cardBottom}>
        <Badge
          label={available ? `${parking.availableSpots} vagas livres` : 'Sem vagas'}
          color={available ? colors.teal : colors.danger}
        />
        <View style={styles.ratingRow}>
          <Text style={styles.star}>★</Text>
          <Text style={styles.ratingVal}>{parking.rating > 0 ? parking.rating.toFixed(1) : '—'}</Text>
        </View>
        <Text style={styles.hours}>{parking.openHours}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ParkingListScreen({ navigation }) {
  const { parkings, user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | available

  const filtered = useMemo(() => {
    let list = parkings.filter(p => p.ownerId !== user.id); // drivers don't see own
    if (filter === 'available') list = list.filter(p => p.availableSpots > 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    }
    return list;
  }, [parkings, search, filter, user.id]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, {user.name.split(' ')[0]} 👋</Text>
        <Text style={styles.title}>Estacionamentos</Text>
      </View>

      {/* search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou endereço..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* filter chips */}
      <View style={styles.chips}>
        {[['all', 'Todos'], ['available', 'Com vagas']].map(([val, label]) => (
          <TouchableOpacity
            key={val}
            onPress={() => setFilter(val)}
            style={[styles.chip, filter === val && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === val && styles.chipTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.count}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</Text>
      </View>

      {/* list */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ParkingCard
            parking={item}
            onPress={() => navigation.navigate('ParkingDetail', { parkingId: item.id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🅿️</Text>
            <Text style={styles.emptyText}>Nenhum estacionamento encontrado</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colors.offWhite },

  header:  { backgroundColor: colors.navy, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg },
  greeting:{ color: colors.teal, fontSize: font.sm, fontWeight: '600' },
  title:   { color: colors.white, fontSize: font.xl, fontWeight: '800', marginTop: 2 },

  searchRow: { backgroundColor: colors.navy, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.white, borderRadius: radius.full,
    paddingHorizontal: spacing.md, gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, height: 44, fontSize: font.base, color: colors.textPrimary },
  clearBtn:   { fontSize: 14, color: colors.textMuted, paddingHorizontal: 4 },

  chips: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm, backgroundColor: colors.offWhite },
  chip:  { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.border },
  chipActive: { backgroundColor: colors.navy },
  chipText:   { fontSize: font.sm, color: colors.textSecond, fontWeight: '600' },
  chipTextActive: { color: colors.white },
  count: { marginLeft: 'auto', fontSize: font.sm, color: colors.textMuted },

  list: { padding: spacing.md },

  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop:  { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  cardInfo: { flex: 1, marginRight: spacing.sm },
  cardName: { fontSize: font.md, fontWeight: '700', color: colors.textPrimary },
  cardAddr: { fontSize: font.sm, color: colors.textSecond, marginTop: 3 },
  priceBlock: { alignItems: 'flex-end' },
  priceValue: { fontSize: font.lg, fontWeight: '800', color: colors.navy },
  priceLabel: { fontSize: font.sm, color: colors.textMuted },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  ratingRow:  { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star:       { color: '#F59E0B', fontSize: 14 },
  ratingVal:  { fontSize: font.sm, color: colors.textSecond, fontWeight: '600' },
  hours:      { fontSize: font.sm, color: colors.textMuted, marginLeft: 'auto' },

  empty:     { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { fontSize: 48 },
  emptyText: { fontSize: font.md, color: colors.textMuted, marginTop: spacing.md },
});
