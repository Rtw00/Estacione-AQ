import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { colors, font, spacing, radius } from '../../utils/theme';

export default function RegisterUserScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  function set(key, val) { setForm(p => ({ ...p, [key]: val })); }

  async function handleRegister() {
    if (!form.name || !form.email || !form.password) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios.'); return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.'); return;
    }
    if (form.password.length < 6) {
      Alert.alert('Atenção', 'Senha deve ter pelo menos 6 caracteres.'); return;
    }
    setLoading(true);
    try {
      await register({
        name:  form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: 'user',
      });
    } catch (e) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.header}>
          <Text style={styles.emoji}>🚗</Text>
          <Text style={styles.title}>Criar conta de motorista</Text>
          <Text style={styles.sub}>Busque e reserve vagas em segundos</Text>
        </View>

        <View style={styles.form}>
          <Input label="Nome completo *" value={form.name} onChangeText={v => set('name', v)} placeholder="João Silva" />
          <Input label="E-mail *" value={form.email} onChangeText={v => set('email', v)} keyboardType="email-address" autoCapitalize="none" placeholder="joao@email.com" />
          <Input label="Telefone" value={form.phone} onChangeText={v => set('phone', v)} keyboardType="phone-pad" placeholder="(46) 99999-9999" />
          <Input label="Senha *" value={form.password} onChangeText={v => set('password', v)} secureTextEntry placeholder="Mínimo 6 caracteres" />
          <Input label="Confirmar senha *" value={form.confirmPassword} onChangeText={v => set('confirmPassword', v)} secureTextEntry placeholder="Repita a senha" />
          <Button title="Criar conta" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta?{' '}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Entrar</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.navy },
  scroll: { flexGrow: 1, padding: spacing.lg },
  topBar: { marginBottom: spacing.lg },
  back:   { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.navyLight, alignItems: 'center', justifyContent: 'center' },
  backText: { color: colors.white, fontSize: 20 },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  emoji:  { fontSize: 48, marginBottom: spacing.sm },
  title:  { fontSize: font.xl, fontWeight: '800', color: colors.white, textAlign: 'center' },
  sub:    { fontSize: font.base, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
  form:   { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.textMuted, fontSize: font.base },
  footerLink: { color: colors.teal, fontWeight: '700', fontSize: font.base },
});
