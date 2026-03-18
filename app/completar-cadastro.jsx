import { Ionicons } from '@expo/vector-icons'; // <-- ADICIONADO: Importação do ícone
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../src/config/firebase';

export default function CompletarCadastroScreen() {
  const router = useRouter();
  const { uid, nome, email } = useLocalSearchParams(); 

  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState(''); 
  const [carregando, setCarregando] = useState(false);

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
      await setDoc(doc(db, 'consumidores', uid), {
        nome: nome,
        email: email,
        cpf: cpf,
        dataNascimento: dataNascimento,
        telefone: telefone, 
        tipoConta: 'consumidor', 
        dataCriacao: new Date()
      });

      alert("Cadastro finalizado com sucesso! 🥗");
      router.replace('/(tabs)'); 
    } catch (error) {
      console.error("Erro ao salvar dados finais:", error);
      alert("Erro ao finalizar o cadastro. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* --- NOVO: BOTÃO DE VOLTAR --- */}
        <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.textoVoltar}>Voltar</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1, padding: 30, justifyContent: 'center', maxWidth: 500, alignSelf: 'center', width: '100%' },
  /* --- ESTILOS DO BOTÃO VOLTAR --- */
  botaoVoltar: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', marginBottom: 20 },
  textoVoltar: { fontSize: 16, color: '#333', marginLeft: 8, fontWeight: '600' },
  /* ------------------------------- */
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#93BD57', marginBottom: 10, textAlign: 'center' },
  subtitulo: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  botao: { backgroundColor: '#93BD57', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 }
});