import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, GeoPoint } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Mapa from '../components/Mapa.web';
import { auth, db } from '../src/config/firebase';

export default function EscolherEnderecoScreen() {
  const router = useRouter();
  const [localizacao, setLocalizacao] = useState(null);
  const [enderecoNome, setEnderecoNome] = useState('');
  
  const [apelido, setApelido] = useState('');
  const [cep, setCep] = useState('');
  const [cidade, setCidade] = useState('São Paulo'); 

  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    pegarLocalizacaoAtual();
  }, []);

  // 👉 Função para aplicar a máscara do CEP (00000-000)
  const handleCepChange = (texto) => {
    let formatado = texto.replace(/\D/g, ''); // Remove tudo que não é número
    if (formatado.length > 5) {
      formatado = formatado.replace(/^(\d{5})(\d)/, '$1-$2'); // Coloca o hífen
    }
    setCep(formatado.slice(0, 9)); // Trava no tamanho máximo
  };

  const pegarLocalizacaoAtual = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'web') alert("Permissão de GPS negada.");
        else Alert.alert("Atenção", "Precisamos da permissão de GPS para continuar.");
        setCarregando(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      atualizarPosicaoNoMapa(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.log("Erro ao pegar localização:", error);
      setCarregando(false);
    }
  };

  const atualizarPosicaoNoMapa = async (lat, lng) => {
    setLocalizacao({ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 });

    try {
      if (Platform.OS === 'web') {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
        const response = await fetch(url, { headers: { 'User-Agent': 'FitWayApp' } });
        const data = await response.json();
        
        if (data.address) {
          const rua = data.address.road || data.address.pedestrian || "Rua não encontrada";
          const bairro = data.address.suburb || data.address.neighbourhood || "";
          setEnderecoNome(`${rua}${bairro ? ' - ' + bairro : ''}`);

          setCidade(data.address.city || data.address.town || data.address.village || "São Paulo");
          
          // Aplica a máscara no CEP que vem da API
          let cepApi = data.address.postcode || "";
          let cepLimpo = cepApi.replace(/\D/g, '');
          if (cepLimpo.length > 5) cepLimpo = cepLimpo.replace(/^(\d{5})(\d)/, '$1-$2');
          setCep(cepLimpo.slice(0, 9));
        } else {
          setEnderecoNome("Rua não encontrada na Web");
        }
      } else {
        let resposta = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (resposta.length > 0) {
          let det = resposta[0];
          setEnderecoNome(`${det.street || 'Rua s/n'} - ${det.district || ''}`);

          setCidade(det.subregion || det.city || "São Paulo");
          
          // Aplica a máscara no CEP que vem da API nativa
          let cepApi = det.postalCode || "";
          let cepLimpo = cepApi.replace(/\D/g, '');
          if (cepLimpo.length > 5) cepLimpo = cepLimpo.replace(/^(\d{5})(\d)/, '$1-$2');
          setCep(cepLimpo.slice(0, 9));
        }
      }
    } catch (error) {
      setEnderecoNome("Endereço (nome da rua indisponível)");
    } finally {
      setCarregando(false);
    }
  };

  const handleConfirmarEndereco = async () => {
    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual || !localizacao) return;

    if (!numero.trim()) {
      if (Platform.OS === 'web') alert("Por favor, digite o número do endereço.");
      else Alert.alert("Atenção", "Por favor, digite o número do endereço.");
      return;
    }

    setSalvando(true);
    try {
      const partesEndereco = enderecoNome.split(' - ');
      const ruaExtraida = partesEndereco[0] || enderecoNome;
      const bairroExtraido = partesEndereco[1] || '';

      const novoEndereco = {
        apelido: apelido.trim() || "Casa",
        bairro: bairroExtraido,
        cep: cep,
        cidade: cidade, 
        geolocalizacao: new GeoPoint(localizacao.latitude, localizacao.longitude),
        id_consumidor: doc(db, 'consumidores', usuarioAtual.uid), 
        numero: numero,
        padrão: true,
        rua: ruaExtraida,
        complemento: complemento 
      };

      await addDoc(collection(db, 'enderecos'), novoEndereco);

      if (Platform.OS === 'web') window.alert("Endereço salvo com sucesso!");
      router.back(); 
    } catch (error) {
      console.log("Erro ao salvar no banco de dados:", error);
      alert("Erro ao salvar no banco de dados.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <View style={styles.container}>
      {carregando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#93BD57" />
          <Text style={{marginTop: 10}}>Buscando sua posição...</Text>
        </View>
      ) : (
        <>
          <Mapa localizacao={localizacao} />

          <View style={styles.caixaInfo}>
            <Text style={styles.label}>Local de Entrega (GPS):</Text>
            <Text style={styles.enderecoText}>{enderecoNome}</Text>

            <View style={styles.linhaInputs}>
              <TextInput
                style={[styles.input, { flex: 1.5 }]}
                placeholder="Apelido (ex: Casa)"
                value={apelido}
                onChangeText={setApelido}
              />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="CEP"
                keyboardType="numeric"
                maxLength={9} // 👉 Adicionado o limite de caracteres aqui
                value={cep}
                onChangeText={handleCepChange} // 👉 Trocado o setCep direto pela função
              />
            </View>

            <View style={styles.linhaInputs}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Número *"
                keyboardType="numeric"
                value={numero}
                onChangeText={setNumero}
              />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Complemento (Ap, Bloco)"
                value={complemento}
                onChangeText={setComplemento}
              />
            </View>
          </View>

          <View style={styles.rodape}>
            <TouchableOpacity 
              style={[styles.botaoConfirmar, salvando && { opacity: 0.7 }]} 
              onPress={handleConfirmarEndereco} 
              disabled={salvando}
            >
              {salvando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBotao}>Confirmar Endereço</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.back()} disabled={salvando}>
              <Text style={styles.textoBotaoVoltar}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  caixaInfo: { 
    position: 'absolute', top: 50, left: 20, right: 20, 
    backgroundColor: 'white', padding: 15, borderRadius: 10, 
    elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 
  },
  label: { fontSize: 12, color: '#888', fontWeight: 'bold' },
  enderecoText: { fontSize: 16, color: '#333', marginTop: 3, marginBottom: 10 },
  linhaInputs: { flexDirection: 'row', gap: 10, marginBottom: 10 }, 
  input: { 
    borderWidth: 1, borderColor: '#DDD', borderRadius: 8, 
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, backgroundColor: '#F9F9F9' 
  },
  rodape: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#FFF', padding: 20, borderRadius: 15, elevation: 10 },
  botaoConfirmar: { backgroundColor: '#93BD57', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  textoBotao: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  textoBotaoVoltar: { color: '#666', textAlign: 'center', fontWeight: 'bold', padding: 5 }
});