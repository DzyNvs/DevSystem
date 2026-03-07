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

export default function CompletarCadastroRestauranteScreen() {
  const router = useRouter();
  const { uid, nome, email } = useLocalSearchParams(); 

  const [nomeFantasia, setNomeFantasia] = useState(nome || '');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState(''); 
  const [carregando, setCarregando] = useState(false);

  const aplicarMascaraCNPJ = (texto) => {
    let formatado = texto.replace(/\D/g, ''); 
    if (formatado.length > 14) formatado = formatado.slice(0, 14);

    formatado = formatado.replace(/^(\d{2})(\d)/, '$1.$2');
    formatado = formatado.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
    formatado = formatado.replace(/\.(\d{3})(\d)/, '.$1/$2');
    formatado = formatado.replace(/(\d{4})(\d)/, '$1-$2');
    setCnpj(formatado);
  };

  const handleTelefoneChange = (texto) => {
    let formatado = texto.replace(/\D/g, ''); 
    if (formatado.length > 11) formatado = formatado.slice(0, 11);

    formatado = formatado.replace(/^(\d{2})(\d)/g, '($1) $2');
    formatado = formatado.replace(/(\d{5})(\d)/, '$1-$2');
    setTelefone(formatado);
  };

  const handleFinalizar = async () => {
    if (!nomeFantasia || !razaoSocial || !cnpj || !telefone) {
      alert("Por favor, preencha todos os campos para continuar.");
      return;
    }

    setCarregando(true);

    try {
      await setDoc(doc(db, 'restaurantes', uid), {
        nomeFantasia: nomeFantasia,
        razaoSocial: razaoSocial,
        email: email,
        cnpj: cnpj,
        telefone: telefone, 
        tipoConta: 'restaurante', 
        dataCriacao: new Date()
      });

      alert("Restaurante parceiro cadastrado com sucesso! 🥗");
      router.replace('/home-restaurante-screen'); 
      
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

        <Text style={styles.titulo}>Seja nosso Parceiro!</Text>
        <Text style={styles.subtitulo}>
          Precisamos dos dados da sua empresa para finalizar o cadastro no FitWay.
        </Text>

        <Text style={styles.label}>Nome Fantasia</Text>
        <TextInput
          style={styles.input}
          value={nomeFantasia}
          onChangeText={setNomeFantasia}
          placeholder="Nome do seu restaurante"
          placeholderTextColor="#A0A0A0"
          maxLength={100} 
        />

        <Text style={styles.label}>Razão Social</Text>
        <TextInput
          style={styles.input}
          value={razaoSocial}
          onChangeText={setRazaoSocial}
          placeholder="Razão Social da empresa"
          placeholderTextColor="#A0A0A0"
          maxLength={100} 
        />

        <Text style={styles.label}>CNPJ</Text>
        <TextInput
          style={styles.input}
          value={cnpj}
          onChangeText={aplicarMascaraCNPJ} 
          keyboardType="numeric"
          placeholder="00.000.000/0000-00"
          placeholderTextColor="#A0A0A0"
          maxLength={18} 
        />

        <Text style={styles.label}>Telefone de Contato</Text>
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
            <Text style={styles.textoBotao}>Finalizar Cadastro do Restaurante</Text>
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
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  botao: { backgroundColor: '#93BD57', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 }
});