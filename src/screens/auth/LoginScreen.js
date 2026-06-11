import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  StatusBar, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/UI';
import { colors, font, spacing, radius } from '../../utils/theme';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
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
          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.sub}>Entre na sua conta</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="seu@email.com"
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
          <Button title="Entrar" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta?{' '}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.navy },
  scroll: { flexGrow: 1, padding: spacing.lg },

  topBar: { marginBottom: spacing.xl },
  back:   {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.navyLight,
    alignItems: 'center', justifyContent: 'center',
  },
  backText: { color: colors.white, fontSize: 20 },

  header: { marginBottom: spacing.xl },
  title:  { fontSize: font.xl, fontWeight: '800', color: colors.white },
  sub:    { fontSize: font.md, color: colors.textMuted, marginTop: 6 },

  form:   { backgroundColor: colors.white, borderRadius: radius.xl, padding: spacing.lg },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { color: colors.textMuted, fontSize: font.base },
  footerLink: { color: colors.teal, fontWeight: '700', fontSize: font.base },
});
