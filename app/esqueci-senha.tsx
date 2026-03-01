import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
// Importações do Firebase
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

// Imagens do cabeçalho e capa - Caminhos conforme sua estrutura
const logo = require('../assets/images/logo.png');
const vector = require('../assets/images/vector.png');
const store = require('../assets/images/store.png');
const capa2 = require('../assets/images/capa2.png');

export default function EsqueciSenha() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [highlightRestaurante, setHighlightRestaurante] = useState(false);

  const handleEnviar = async () => {
    if (!email) {
      alert("Por favor, digite seu e-mail.");
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth(); // Pega a instância configurada no seu firebaseConfig

      // O Firebase cuidará de todo o processo de envio do link
      await sendPasswordResetEmail(auth, email);

      // Feedback de sucesso conforme configurado no seu console Firebase
      alert("Sucesso! Um link de redefinição foi enviado para o seu e-mail. Verifique sua caixa de entrada e spam. 🥗");

      // Após o envio, voltamos para a tela de login
      router.replace('/'); 

    } catch (error: any) {
      console.error("Erro Firebase Auth:", error.code);
      
      // Tratamento de erros específicos para o usuário do FitWay
      switch (error.code) {
        case 'auth/user-not-found':
          alert("Este e-mail não está cadastrado no sistema.");
          break;
        case 'auth/invalid-email':
          alert("O formato do e-mail inserido é inválido.");
          break;
        default:
          alert("Erro ao solicitar a recuperação. Tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F2E3BB" barStyle="dark-content" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={styles.rightItems}>
            <TouchableOpacity
              style={[
                styles.restauranteGroup,
                highlightRestaurante && styles.restauranteAtivo,
              ]}
              onPress={() => setHighlightRestaurante(!highlightRestaurante)}
            >
              <Image source={store} style={styles.storeIcon} resizeMode="contain" />
              <Text
                style={[
                  styles.restauranteText,
                  highlightRestaurante && styles.restauranteTextAtivo,
                ]}
              >
                Sou restaurante
              </Text>
            </TouchableOpacity>
            <View style={styles.ambienteGroup}>
              <Image source={vector} style={styles.vectorIcon} resizeMode="contain" />
              <Text style={styles.ambienteText}>Ambiente 100% seguro</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.mainContainer}>
        {/* Coluna do formulário */}
        <View style={styles.leftColumn}>
          <View style={styles.formContainer}>
            <Text style={styles.titulo}>Criar uma nova senha</Text>
            <Text style={styles.subtitulo}>Insira o e-mail cadastrado para continuar</Text>

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              placeholder="Seu e-mail"
              placeholderTextColor="#A0A0A0"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleEnviar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Enviar Link de Recuperação</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buttonVoltar} 
              onPress={() => router.replace('/')}
            >
              <Text style={styles.buttonVoltarText}>Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Coluna imagem */}
        <View style={styles.rightColumn}>
          <Image source={capa2} style={styles.capaImage} resizeMode="cover" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 75,
    backgroundColor: '#F2E3BB',
    paddingHorizontal: 40,
    justifyContent: 'center',
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: { width: 110, height: 55 },
  rightItems: { flexDirection: 'row', alignItems: 'center', gap: 40 },
  restauranteGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  restauranteAtivo: { backgroundColor: '#93BD57' },
  restauranteText: { fontSize: 14, color: '#555', fontWeight: '600', marginLeft: 8 },
  restauranteTextAtivo: { color: '#FFFFFF' },
  storeIcon: { width: 22, height: 22 },
  ambienteGroup: { flexDirection: 'row', alignItems: 'center' },
  ambienteText: { fontSize: 14, color: '#555', fontWeight: '600', marginLeft: 8 },
  vectorIcon: { width: 22, height: 22 },
  mainContainer: { flex: 1, flexDirection: 'row' },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  formContainer: { width: '100%', maxWidth: 500 },
  titulo: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 48, 
    fontStyle: 'italic',
    fontWeight: '800',
    lineHeight: 54,
    letterSpacing: -0.25,
    marginBottom: 16, 
  },
  subtitulo: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Nunito',
    fontSize: 24, 
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 24, 
  },
  label: {
    color: '#2A2D34',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    width: '100%',
    marginBottom: 30, 
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#93BD57',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16, 
  },
  buttonDisabled: { backgroundColor: '#a5d674' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonVoltar: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#A0A6B6', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonVoltarText: { color: '#2A2D34', fontSize: 16, fontWeight: '600' },
  rightColumn: { flex: 1, backgroundColor: '#F2E3BB' },
  capaImage: { width: '100%', height: '100%' },
});