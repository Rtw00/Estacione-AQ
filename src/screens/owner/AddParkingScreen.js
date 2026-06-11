import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { colors, font, spacing, radius } from '../../utils/theme';

export default function AddParkingScreen({ navigation }) {
  const { addParking } = useAuth();
  const [form, setForm] = useState({
    name: '', address: '', city: '', phone: '',
    totalSpots: '', pricePerHour: '', openHours: '',
  });
  const [loading, setLoading] = useState(false);

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function handleSubmit() {
    if (!form.name || !form.address || !form.totalSpots || !form.pricePerHour) {
      Alert.alert('Atenção', 'Preencha os campos obrigatórios (*).');
      return;
    }
    const spots = parseInt(form.totalSpots, 10);
    const price = parseFloat(form.pricePerHour.replace(',', '.'));
    if (isNaN(spots) || spots < 1) { Alert.alert('Atenção', 'Número de vagas inválido.'); return; }
    if (isNaN(price) || price <= 0) { Alert.alert('Atenção', 'Valor por hora inválido.'); return; }

    setLoading(true);
    try {
      await addParking({
        ...form,
        totalSpots: spots,
        pricePerHour: price,
      });
      Alert.alert('✅ Estacionamento cadastrado!', 'Já está visível para os motoristas.', [
        { text: 'Ver painel', onPress: () => navigation.navigate('Meus') },
      ]);
      setForm({ name: '', address: '', city: '', phone: '', totalSpots: '', pricePerHour: '', openHours: '' });
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
        <Text style={styles.title}>Cadastrar estacionamento</Text>
        <Text style={styles.sub}>Aparece instantaneamente para motoristas</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <Text style={styles.groupTitle}>📍 Localização</Text>
          <Input label="Nome do estacionamento *" value={form.name} onChangeText={v => set('name', v)} placeholder="Garagem Central" />
          <Input label="Endereço completo *" value={form.address} onChangeText={v => set('address', v)} placeholder="Rua XV de Novembro, 200" />
          <Input label="Cidade" value={form.city} onChangeText={v => set('city', v)} placeholder="Francisco Beltrão" />
        </View>

        <View style={styles.form}>
          <Text style={styles.groupTitle}>🚘 Vagas e preço</Text>
          <Input label="Número total de vagas *" value={form.totalSpots} onChangeText={v => set('totalSpots', v)} keyboardType="numeric" placeholder="30" />
          <Input label="Preço por hora (R$) *" value={form.pricePerHour} onChangeText={v => set('pricePerHour', v)} keyboardType="decimal-pad" placeholder="6,00" />
        </View>

        <View style={styles.form}>
          <Text style={styles.groupTitle}>📞 Contato e horário</Text>
          <Input label="Telefone" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" placeholder="(46) 99999-9999" />
          <Input label="Horário de funcionamento" value={form.openHours} onChangeText={v => set('openHours', v)} placeholder="07:00 – 22:00 (ou 24 horas)" />
        </View>

        {/* preview */}
        {form.name || form.pricePerHour ? (
          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Pré-visualização para motoristas</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewName}>{form.name || 'Nome do estacionamento'}</Text>
              <Text style={styles.previewAddr}>{form.address || 'Endereço'}</Text>
              <View style={styles.previewRow}>
                <Text style={styles.previewPrice}>R$ {form.pricePerHour || '0,00'}/h</Text>
                <Text style={styles.previewSpots}>{form.totalSpots || '0'} vagas</Text>
              </View>
            </View>
          </View>
        ) : null}

        <Button title="Publicar estacionamento" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.offWhite },
  header: { backgroundColor: colors.navy, padding: spacing.lg },
  title:  { fontSize: font.lg, fontWeight: '800', color: colors.white },
  sub:    { fontSize: font.sm, color: colors.textMuted, marginTop: 2 },

  body: { padding: spacing.md },
  form: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  groupTitle: { fontSize: font.md, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },

  preview: { marginBottom: spacing.md },
  previewTitle: { fontSize: font.sm, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  previewCard:  { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, borderWidth: 2, borderColor: colors.teal },
  previewName:  { fontSize: font.md, fontWeight: '700', color: colors.textPrimary },
  previewAddr:  { fontSize: font.sm, color: colors.textMuted, marginTop: 4 },
  previewRow:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  previewPrice: { fontSize: font.md, fontWeight: '700', color: colors.navy },
  previewSpots: { fontSize: font.sm, color: colors.teal, fontWeight: '600' },
});
