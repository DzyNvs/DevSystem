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
import { db } from '../src/config/firebase'; // O mesmo caminho do banco

export default function CompletarCadastroRestauranteScreen() {
  const router = useRouter();
  // Resgatando os dados invisíveis que vieram do Google/Facebook
  const { uid, nome, email } = useLocalSearchParams(); 

  // Já deixamos o "nome" do Google como sugestão para o Nome Fantasia, mas ele pode apagar e mudar
  const [nomeFantasia, setNomeFantasia] = useState(nome || '');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [telefone, setTelefone] = useState(''); 
  const [carregando, setCarregando] = useState(false);

  // Máscara inteligente para CNPJ (00.000.000/0000-00)
  const aplicarMascaraCNPJ = (texto) => {
    // Remove tudo que não é número e limita a 14 dígitos
    let limpo = texto.replace(/\D/g, '').slice(0, 14);
    let formatado = limpo;
    
    if (limpo.length > 12) {
      formatado = limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
    } else if (limpo.length > 8) {
      formatado = limpo.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4}).*/, '$1.$2.$3/$4');
    } else if (limpo.length > 5) {
      formatado = limpo.replace(/^(\d{2})(\d{3})(\d{1,3}).*/, '$1.$2.$3');
    } else if (limpo.length > 2) {
      formatado = limpo.replace(/^(\d{2})(\d{1,3}).*/, '$1.$2');
    }
    setCnpj(formatado);
  };

  const handleFinalizar = async () => {
    if (!nomeFantasia || !razaoSocial || !cnpj || !telefone) {
      alert("Por favor, preencha todos os campos para continuar.");
      return;
    }

    setCarregando(true);

    try {
      // Gravando a ficha do Restaurante!
      await setDoc(doc(db, 'restaurantes', uid), {
        nomeFantasia: nomeFantasia,
        razaoSocial: razaoSocial,
        email: email,
        cnpj: cnpj,
        telefone: telefone, 
        tipoConta: 'restaurante', // <-- O SEGREDO ESTÁ AQUI: Definimos como restaurante!
        dataCriacao: new Date()
      });

      alert("Restaurante parceiro cadastrado com sucesso! 🥗");
      
      // Manda direto para a tela de Home do Restaurante
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
        />

        <Text style={styles.label}>Razão Social</Text>
        <TextInput
          style={styles.input}
          value={razaoSocial}
          onChangeText={setRazaoSocial}
          placeholder="Razão Social da empresa"
          placeholderTextColor="#A0A0A0"
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
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          placeholder="(00) 00000-0000"
          placeholderTextColor="#A0A0A0"
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
  titulo: { fontSize: 32, fontWeight: 'bold', color: '#93BD57', marginBottom: 10, textAlign: 'center' },
  subtitulo: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  label: { fontSize: 15, fontWeight: '600', marginBottom: 6, color: '#333' },
  input: { backgroundColor: '#F8F9FA', borderRadius: 8, padding: 15, marginBottom: 16, borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
  botao: { backgroundColor: '#93BD57', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  textoBotao: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loader: { marginTop: 20 }
});