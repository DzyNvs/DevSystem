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
import { db } from '../src/config/firebase'; // Caminho correto que arrumamos!

export default function CompletarCadastroScreen() {
  const router = useRouter();
  // Resgatando os dados invisíveis que vieram da tela de Cadastro
  const { uid, nome, email } = useLocalSearchParams(); 

  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [telefone, setTelefone] = useState(''); // <-- ADICIONADO: Estado do telefone
  const [carregando, setCarregando] = useState(false);

  // Máscara inteligente para a data de nascimento
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

  const handleFinalizar = async () => {
    // Validação garantindo que nenhum campo fique de fora
    if (!cpf || !dataNascimento || !telefone) {
      alert("Por favor, preencha todos os campos para continuar.");
      return;
    }

    setCarregando(true);

    try {
      // Gravando a "ficha completa" na tabela consumidores
      await setDoc(doc(db, 'consumidores', uid), {
        nome: nome,
        email: email,
        cpf: cpf,
        dataNascimento: dataNascimento,
        telefone: telefone, // <-- ADICIONADO: Salvando o telefone
        tipoConta: 'consumidor', // Garantindo o tipo
        dataCriacao: new Date()
      });

      alert("Cadastro finalizado com sucesso! 🥗");
      router.replace('/(tabs)'); // Envia o usuário logado para a Home
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
        <Text style={styles.titulo}>Falta pouco!</Text>
        <Text style={styles.subtitulo}>
          Olá {nome}, precisamos só de mais alguns dados para finalizar sua conta FitWay.
        </Text>

        <Text style={styles.label}>CPF</Text>
        <TextInput
          style={styles.input}
          value={cpf}
          onChangeText={setCpf}
          keyboardType="numeric"
          placeholder="000.000.000-00"
          placeholderTextColor="#A0A0A0"
        />

        <Text style={styles.label}>Data de Nascimento</Text>
        <TextInput
          style={styles.input}
          value={dataNascimento}
          onChangeText={aplicarMascaraData} // Aplicando a máscara aqui
          keyboardType="numeric"
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#A0A0A0"
          maxLength={10}
        />

        {/* --- NOVO CAMPO DE TELEFONE --- */}
        <Text style={styles.label}>Telefone</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          placeholder="(00) 00000-0000"
          placeholderTextColor="#A0A0A0"
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
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#93BD57', marginBottom: 10, textAlign: 'center' },
  subtitulo: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 8, color: '#333' },
  input: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 15, marginBottom: 20, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  botao: { backgroundColor: '#93BD57', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 }
});