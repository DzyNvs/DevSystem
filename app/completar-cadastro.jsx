import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { db } from '../src/config/firebase';

const logo = require('../assets/images/logo.png');
const vector = require('../assets/images/vector.png');
const store = require('../assets/images/store.png');
const capa3 = require('../assets/images/capa3.png');

export default function CompletarCadastroScreen() {
  const router = useRouter();
  const { uid, nome, email } = useLocalSearchParams(); 

  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState(''); 
  const [carregando, setCarregando] = useState(false);

  const [highlightRestaurante, setHighlightRestaurante] = useState(false);
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  const aplicarMascaraData = (texto) => {
    const numeros = texto.replace(/\D/g, '');
    const limitados = numeros.slice(0, 8);
    let formatado = '';
    for (let i = 0; i < limitados.length; i++) {
      if (i === 2 || i === 4) formatado += '/';
      formatado += limitados[i];
    }
    setDataNascimento(formatado);
  };

  const handleCpfChange = (texto) => {
    let formatado = texto.replace(/\D/g, ''); 
    if (formatado.length > 11) formatado = formatado.slice(0, 11);
    
    formatado = formatado.replace(/(\d{3})(\d)/, '$1.$2');
    formatado = formatado.replace(/(\d{3})(\d)/, '$1.$2');
    formatado = formatado.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(formatado);
  };

  const handleTelefoneChange = (texto) => {
    let formatado = texto.replace(/\D/g, ''); 
    if (formatado.length > 11) formatado = formatado.slice(0, 11);

    formatado = formatado.replace(/^(\d{2})(\d)/g, '($1) $2');
    formatado = formatado.replace(/(\d{5})(\d)/, '$1-$2');
    setTelefone(formatado);
  };

  const handleFinalizar = async () => {
    if (!cpf || !dataNascimento || !telefone) {
      alert("Por favor, preencha todos os campos para continuar.");
      return;
    }

    setCarregando(true);

    try {
      const numeroAleatorio = Math.floor(100000 + Math.random() * 900000);
      const id_consumidor_gerado = `cons_${numeroAleatorio}`;

      await setDoc(doc(db, 'consumidores', uid), {
        nome: nome,
        email: email,
        cpf: cpf,
        data_nascimento: dataNascimento, 
        telefone: telefone, 
        tipoConta: 'consumidor', 
        id_consumidor: id_consumidor_gerado, 
        data_criacao: new Date()
      });

      alert("Cadastro finalizado com sucesso! 🥗");
      router.replace('/home-consumidor-screen'); 
      
    } catch (error) {
      console.error("Erro ao salvar dados finais:", error);
      alert("Erro ao finalizar o cadastro. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F2E3BB" barStyle="dark-content" />

      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <View style={styles.headerContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={styles.rightItems}>
            {!isSmallScreen && (
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
            )}
            <View style={styles.ambienteGroup}>
              <Image source={vector} style={styles.vectorIcon} resizeMode="contain" />
              <Text style={styles.ambienteText}>Ambiente 100% seguro</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={[
            styles.leftColumn,
            isSmallScreen && styles.leftColumnFull,
            { flexGrow: 1, justifyContent: 'center' }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            
            {/* 👉 AQUI ESTÁ A CORREÇÃO: Forçando a volta para o Login '/' */}
            <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.replace('cadastroscreen')}>
              <Ionicons name="arrow-back" size={24} color="#333" />
              <Text style={styles.textoVoltar}>Voltar ao Login</Text>
            </TouchableOpacity>

            <Text style={styles.titulo}>Falta pouco!</Text>
            <Text style={styles.subtitulo}>
              Olá {nome}, precisamos só de mais alguns dados para finalizar sua conta FitWay.
            </Text>

            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              value={cpf}
              onChangeText={handleCpfChange} 
              keyboardType="numeric"
              placeholder="000.000.000-00"
              placeholderTextColor="#A0A0A0"
              maxLength={14} 
            />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={styles.input}
              value={dataNascimento}
              onChangeText={aplicarMascaraData} 
              keyboardType="numeric"
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#A0A0A0"
              maxLength={10}
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              value={telefone}
              onChangeText={handleTelefoneChange} 
              keyboardType="phone-pad"
              placeholder="(00) 00000-0000"
              placeholderTextColor="#A0A0A0"
              maxLength={15} 
            />

            {carregando ? (
              <ActivityIndicator size="large" color="#93BD57" style={styles.loader} />
            ) : (
              <TouchableOpacity style={styles.botao} onPress={handleFinalizar}>
                <Text style={styles.textoBotao}>Finalizar Cadastro</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {!isSmallScreen && (
          <View style={styles.rightColumn}>
            <Image source={capa3} style={styles.capaImage} resizeMode="cover" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 75,
    backgroundColor: '#F2E3BB',
    paddingHorizontal: 40,
    justifyContent: 'center', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerSmall: { paddingHorizontal: 20 },
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
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  leftColumnFull: {},
  formContainer: {
    width: '100%',
    maxWidth: 587,
    alignSelf: 'center',
  },
  botaoVoltar: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 10 }, 
  textoVoltar: { fontSize: 16, color: '#333', marginLeft: 8, fontWeight: '600' },
  titulo: {
    fontSize: 44,
    fontWeight: '800',
    fontStyle: 'italic',
    color: '#000',
    textAlign: 'center',
    marginBottom: 0, 
  },
  subtitulo: {
    fontSize: 16, 
    fontStyle: 'italic',
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20, 
  },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 4, color: '#2A2D34' }, 
  input: {
    backgroundColor: '#FAF8F3',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333',
    width: '100%',
    marginBottom: 30, 
    borderWidth: 0,
  },
  botao: {
    backgroundColor: '#93BD57',
    height: 48,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 },
  rightColumn: { flex: 1, backgroundColor: '#F2E3BB' },
  capaImage: { width: '100%', height: '100%' },
});