import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

// Imports do Firebase (Firestore e Auth)
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ⚠️ ATENÇÃO: Ajuste o caminho do seu Firebase aqui se necessário:
import { auth, db } from '../src/config/firebase.js';

export default function OnboardingRestauranteScreen() {
  const router = useRouter();

  const [logo, setLogo] = useState(null);
  const [capa, setCapa] = useState(null);
  const [fazendoUpload, setFazendoUpload] = useState(false); 

  const [nomeFantasia, setNomeFantasia] = useState(''); 
  const [especialidade, setEspecialidade] = useState('');
  const [endereco, setEndereco] = useState({
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: ''
  });
  const [pagamentos, setPagamentos] = useState({
    pix: false, cartao_credito: false, cartao_debito: false,
    dinheiro: false, vale_refeicao: false, vale_alimentacao: false
  });
  const [horarios, setHorarios] = useState({
    segunda: { funciona: false, abertura: '08:00', fechamento: '18:00' },
    terca:   { funciona: false, abertura: '08:00', fechamento: '18:00' },
    quarta:  { funciona: false, abertura: '08:00', fechamento: '18:00' },
    quinta:  { funciona: false, abertura: '08:00', fechamento: '18:00' },
    sexta:   { funciona: false, abertura: '08:00', fechamento: '18:00' },
    sabado:  { funciona: false, abertura: '08:00', fechamento: '18:00' },
    domingo: { funciona: false, abertura: '08:00', fechamento: '18:00' },
  });

  const [coordenadas, setCoordenadas] = useState({ lat: null, lng: null });
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erros, setErros] = useState({}); 

  const CATEGORIAS = [
    'Marmitas', 'Bowls', 'Saladas', 'Wraps', 'Poke', 
    'Vegano', 'Bebidas', 'Açaí & Sorvetes', 'Doces & Bolos', 'Refeição Livre'
  ];

  // --- 1. BUSCAR DADOS INICIAIS (CORRIGIDO PARA O ERRO 400) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioAtual) => {
      if (usuarioAtual) {
        try {
          const docRef = doc(db, 'restaurantes', usuarioAtual.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const dadosDb = docSnap.data();
            if (dadosDb.nome_fantasia || dadosDb.nomeFantasia) {
              setNomeFantasia(dadosDb.nome_fantasia || dadosDb.nomeFantasia);
            }
          }
        } catch (error) {
          console.log("Erro ao buscar dados do restaurante:", error);
        }
      }
    });

    return () => unsubscribe(); // Limpa o escutador ao sair da tela
  }, []); 

  const escolherImagem = async (tipo) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      if (Platform.OS === 'web') {
        window.alert('Precisamos de acesso para adicionar as fotos.');
      } else {
        Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para adicionar as fotos da loja.');
      }
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: tipo === 'logo' ? [1, 1] : [16, 9], 
      quality: 0.7, 
    });

    if (!result.canceled) {
      if (tipo === 'logo') {
        setLogo(result.assets[0].uri);
        setErros(prev => ({ ...prev, logo: null }));
      } else {
        setCapa(result.assets[0].uri);
      }
    }
  };

  const uploadParaCloudinary = async (imagemUri) => {
    const CLOUD_NAME = 'damevu18u'; 
    const UPLOAD_PRESET = 'kea9xf8r'; 

    const data = new FormData();

    if (Platform.OS === 'web') {
      const responseBlob = await fetch(imagemUri);
      const blob = await responseBlob.blob();
      data.append('file', blob);
    } else {
      data.append('file', {
        uri: imagemUri,
        type: 'image/jpeg', 
        name: 'foto_upload.jpg',
      });
    }

    data.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });
      const dados = await response.json();
      
      if (dados.error) return null;
      return dados.secure_url; 
    } catch (error) {
      console.log("Erro no upload:", error);
      return null;
    }
  };

  const buscarCEP = async (cepLimpo) => {
    setBuscandoCep(true);
    setErros(prev => ({ ...prev, cep: null }));
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (data.erro) {
        setErros(prev => ({ ...prev, cep: 'CEP não encontrado.' }));
        setBuscandoCep(false);
        return;
      }

      setEndereco(prev => ({
        ...prev,
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }));

      setErros(prev => ({ ...prev, rua: null, bairro: null, cidade: null, estado: null }));
      buscarCoordenadas(data.logradouro, data.localidade, data.uf);
    } catch (error) {
      setErros(prev => ({ ...prev, cep: 'Erro ao buscar o CEP.' }));
    } finally {
      setBuscandoCep(false);
    }
  };

  // --- BUSCAR COORDENADAS (CORRIGIDO PARA NÃO DAR ERRO NA WEB) ---
  const buscarCoordenadas = async (rua, cidade, estado) => {
    try {
      const query = `${rua}, ${cidade}, ${estado}, Brazil`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const response = await fetch(url); 

      if (!response.ok) return;

      const data = await response.json();

      if (data && data.length > 0) {
        setCoordenadas({ lat: data[0].lat, lng: data[0].lon });
      }
    } catch (error) {
      console.log("Erro silencioso ao buscar coordenadas:", error);
    }
  };

  const handleEnderecoChange = (campo, valor) => {
    let texto = valor;
    setErros(prev => ({ ...prev, [campo]: null }));

    if (campo === 'cep') {
      texto = texto.replace(/\D/g, '');
      if (texto.length > 5) texto = texto.replace(/^(\d{5})(\d)/, '$1-$2');
      if (texto.length > 9) texto = texto.slice(0, 9);
      
      setEndereco(prev => ({ ...prev, [campo]: texto }));

      const cepApenasNumeros = texto.replace(/\D/g, '');
      if (cepApenasNumeros.length === 8) buscarCEP(cepApenasNumeros);
    } else {
      setEndereco(prev => ({ ...prev, [campo]: texto }));
    }
  };

  const togglePagamento = (chave) => {
    setErros(prev => ({ ...prev, pagamentos: null }));
    setPagamentos(prev => ({ ...prev, [chave]: !prev[chave] }));
  };

  const toggleDia = (dia) => {
    setErros(prev => ({ ...prev, horarios: null }));
    setHorarios(prev => ({ ...prev, [dia]: { ...prev[dia], funciona: !prev[dia].funciona } }));
  };

  const handleHoraChange = (dia, campo, valor) => {
    setErros(prev => ({ ...prev, horarios: null }));
    let formatado = valor.replace(/\D/g, ''); 
    if (formatado.length > 4) formatado = formatado.slice(0, 4);
    if (formatado.length > 2) formatado = formatado.replace(/^(\d{2})(\d)/, '$1:$2');
    setHorarios(prev => ({ ...prev, [dia]: { ...prev[dia], [campo]: formatado } }));
  };

  const validarFormulario = () => {
    let novosErros = {};

    if (!logo) novosErros.logo = "Por favor, adicione a Logo da sua loja."; 
    if (!nomeFantasia.trim()) novosErros.nomeFantasia = "Informe o Nome Fantasia.";
    if (!especialidade) novosErros.especialidade = "Selecione uma especialidade.";
    if (!endereco.cep) novosErros.cep = "CEP é obrigatório.";
    if (!endereco.rua) novosErros.rua = "Rua é obrigatória.";
    if (!endereco.numero) novosErros.numero = "Número é obrigatório.";
    if (!endereco.bairro) novosErros.bairro = "Bairro é obrigatório.";
    if (!endereco.cidade) novosErros.cidade = "Cidade é obrigatória.";
    if (!endereco.estado) novosErros.estado = "UF é obrigatória.";

    const selecionouPagamento = Object.values(pagamentos).some(v => v);
    if (!selecionouPagamento) novosErros.pagamentos = "Selecione pelo menos uma forma de pagamento.";

    const diasAtivos = Object.keys(horarios).filter(dia => horarios[dia].funciona);
    if (diasAtivos.length === 0) {
      novosErros.horarios = "Selecione pelo menos um dia de funcionamento.";
    } else {
      for (let dia of diasAtivos) {
        if (horarios[dia].abertura.length < 5 || horarios[dia].fechamento.length < 5) {
          novosErros.horarios = "Preencha os horários corretamente (ex: 08:00).";
          break;
        }
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    const usuarioAtual = auth.currentUser;
    if (!usuarioAtual) {
      if (Platform.OS === 'web') {
        window.alert("Você precisa estar logado para salvar esses dados.");
      } else {
        Alert.alert("Erro", "Você precisa estar logado para salvar esses dados.");
      }
      return;
    }

    setFazendoUpload(true);

    try {
      const urlLogo = await uploadParaCloudinary(logo);
      if (!urlLogo) throw new Error("Falha no upload da Logo");

      let urlCapa = null;
      if (capa) {
        urlCapa = await uploadParaCloudinary(capa);
      }

      const dadosRestaurante = {
        imagens: {
          logoUrl: urlLogo,
          capaUrl: urlCapa
        },
        nome_fantasia: nomeFantasia,
        especialidade,
        endereco,
        coordenadas,
        pagamentos,
        horarios,
        onboardingConcluido: true 
      };

      // SALVANDO NO FIREBASE SEM APAGAR OS DADOS DO REGISTRO
      await setDoc(doc(db, 'restaurantes', usuarioAtual.uid), dadosRestaurante, { merge: true });

      // --- NAVEGAÇÃO CORRIGIDA PARA WEB E ROTA CORRETA ---
      if (Platform.OS === 'web') {
        window.alert('Sua loja foi configurada com sucesso!');
        router.replace('/home-restaurante-screen'); 
      } else {
        Alert.alert('Sucesso!', 'Sua loja foi configurada com sucesso!', [
          { 
            text: 'OK', 
            onPress: () => {
              router.replace('/home-restaurante-screen'); 
            }
          }
        ]);
      }

    } catch (error) {
      console.error("Erro no Firebase:", error);
      if (Platform.OS === 'web') {
        window.alert("Ocorreu um erro ao salvar os dados. Tente novamente.");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao salvar os dados. Tente novamente.");
      }
    } finally {
      setFazendoUpload(false);
    }
  };

  const nomesDias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const labelsPagamentos = {
    pix: 'PIX', cartao_credito: 'Cartão de Crédito', cartao_debito: 'Cartão de Débito',
    dinheiro: 'Dinheiro', vale_refeicao: 'Vale Refeição', vale_alimentacao: 'Vale Alimentação'
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.titulo}>Complete sua Loja</Text>
          <Text style={styles.subtitulo}>Configure as informações que seus clientes irão ver.</Text>
        </View>

        {/* --- CARD 0: IDENTIDADE VISUAL --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>1. Identidade Visual</Text>
          
          <Text style={styles.label}>Logo da Loja *</Text>
          <View style={styles.imageUploadContainer}>
            <TouchableOpacity 
              style={[styles.boxLogo, erros.logo && styles.inputErro]} 
              onPress={() => escolherImagem('logo')}
            >
              {logo ? (
                <Image source={{ uri: logo }} style={styles.imagemPrevia} />
              ) : (
                <Ionicons name="camera-outline" size={32} color={erros.logo ? "#E53E3E" : "#A0A0A0"} />
              )}
            </TouchableOpacity>
            <Text style={styles.imageHelperText}>Toque para escolher uma foto quadrada.</Text>
          </View>
          {erros.logo && <Text style={styles.textoErro}>{erros.logo}</Text>}

          <Text style={[styles.label, { marginTop: 20 }]}>Foto de Capa (Opcional)</Text>
          <View style={styles.imageUploadContainer}>
            <TouchableOpacity 
              style={styles.boxCapa} 
              onPress={() => escolherImagem('capa')}
            >
              {capa ? (
                <Image source={{ uri: capa }} style={styles.imagemPrevia} />
              ) : (
                <Ionicons name="image-outline" size={32} color="#A0A0A0" />
              )}
            </TouchableOpacity>
            <Text style={styles.imageHelperText}>Essa foto fica no topo do seu cardápio.</Text>
          </View>
        </View>

        {/* --- CARD 1: DADOS PRINCIPAIS --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>2. Informações Básicas</Text>
          
          <Text style={styles.label}>Nome Fantasia *</Text>
          <TextInput
            style={[styles.input, erros.nomeFantasia && styles.inputErro]}
            value={nomeFantasia}
            onChangeText={(texto) => { setNomeFantasia(texto); setErros(prev => ({...prev, nomeFantasia: null})) }}
            placeholder="Nome da sua loja"
          />
          {erros.nomeFantasia && <Text style={styles.textoErro}>{erros.nomeFantasia}</Text>}

          <Text style={styles.label}>Especialidade Principal *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {CATEGORIAS.map((cat, index) => {
              const selecionado = especialidade === cat;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.chip, selecionado && styles.chipSelecionado, erros.especialidade && styles.chipErro]}
                  onPress={() => { setEspecialidade(cat); setErros(prev => ({...prev, especialidade: null})) }}
                >
                  <Text style={[styles.chipTexto, selecionado && styles.chipTextoSelecionado]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {erros.especialidade && <Text style={styles.textoErro}>{erros.especialidade}</Text>}
        </View>

        {/* --- CARD 2: ENDEREÇO --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>3. Endereço da Loja</Text>
          
          <View style={styles.labelContainer}>
            <Text style={styles.label}>CEP *</Text>
            {buscandoCep && <ActivityIndicator size="small" color="#93BD57" style={{ marginLeft: 10, marginTop: 10 }} />}
          </View>
          <TextInput
            style={[styles.input, erros.cep && styles.inputErro]}
            value={endereco.cep}
            onChangeText={(texto) => handleEnderecoChange('cep', texto)}
            placeholder="00000-000"
            keyboardType="numeric"
            maxLength={9}
          />
          {erros.cep && <Text style={styles.textoErro}>{erros.cep}</Text>}

          <Text style={styles.label}>Rua / Avenida *</Text>
          <TextInput
            style={[styles.input, erros.rua && styles.inputErro]}
            value={endereco.rua}
            onChangeText={(texto) => handleEnderecoChange('rua', texto)}
            placeholder="Ex: Av. Paulista"
          />
          {erros.rua && <Text style={styles.textoErro}>{erros.rua}</Text>}

          <View style={styles.linhaDupla}>
            <View style={styles.metade}>
              <Text style={styles.label}>Número *</Text>
              <TextInput
                style={[styles.input, erros.numero && styles.inputErro]}
                value={endereco.numero}
                onChangeText={(texto) => handleEnderecoChange('numero', texto)}
                placeholder="Ex: 1000"
                keyboardType="numeric"
              />
              {erros.numero && <Text style={styles.textoErro}>{erros.numero}</Text>}
            </View>
            <View style={styles.metade}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                value={endereco.complemento}
                onChangeText={(texto) => handleEnderecoChange('complemento', texto)}
                placeholder="Loja 2"
              />
            </View>
          </View>

          <Text style={styles.label}>Bairro *</Text>
          <TextInput
            style={[styles.input, erros.bairro && styles.inputErro]}
            value={endereco.bairro}
            onChangeText={(texto) => handleEnderecoChange('bairro', texto)}
            placeholder="Bairro"
          />
          {erros.bairro && <Text style={styles.textoErro}>{erros.bairro}</Text>}

          <View style={styles.linhaDupla}>
            <View style={[styles.metade, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.label}>Cidade *</Text>
              <TextInput
                style={[styles.input, erros.cidade && styles.inputErro]}
                value={endereco.cidade}
                onChangeText={(texto) => handleEnderecoChange('cidade', texto)}
                placeholder="Cidade"
              />
              {erros.cidade && <Text style={styles.textoErro}>{erros.cidade}</Text>}
            </View>
            <View style={[styles.metade, { flex: 1 }]}>
              <Text style={styles.label}>UF *</Text>
              <TextInput
                style={[styles.input, erros.estado && styles.inputErro]}
                value={endereco.estado}
                onChangeText={(texto) => handleEnderecoChange('estado', texto)}
                placeholder="SP"
                maxLength={2}
                autoCapitalize="characters"
              />
              {erros.estado && <Text style={styles.textoErro}>{erros.estado}</Text>}
            </View>
          </View>
        </View>

        {/* --- CARD 3: FORMAS DE PAGAMENTO --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>4. Formas de Pagamento *</Text>
          {erros.pagamentos && <Text style={[styles.textoErro, { marginBottom: 10 }]}>{erros.pagamentos}</Text>}
          <View style={styles.gridPagamentos}>
            {Object.keys(pagamentos).map((chave) => (
              <TouchableOpacity 
                key={chave} 
                style={styles.checkboxContainer} 
                onPress={() => togglePagamento(chave)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={pagamentos[chave] ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={pagamentos[chave] ? "#93BD57" : (erros.pagamentos ? "#E53E3E" : "#A0A0A0")} 
                />
                <Text style={styles.textoCheckbox}>{labelsPagamentos[chave]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- CARD 4: HORÁRIOS --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>5. Dias e Horários *</Text>
          {erros.horarios && <Text style={[styles.textoErro, { marginBottom: 15 }]}>{erros.horarios}</Text>}
          {nomesDias.map((dia) => (
            <View key={dia} style={styles.itemDia}>
              <View style={styles.linhaDiaTopo}>
                <Text style={styles.nomeDiaTexto}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</Text>
                <Switch
                  trackColor={{ false: "#E0E0E0", true: "#c5e1a5" }}
                  thumbColor={horarios[dia].funciona ? "#93BD57" : "#f4f3f4"}
                  onValueChange={() => toggleDia(dia)}
                  value={horarios[dia].funciona}
                />
              </View>

              {horarios[dia].funciona && (
                <View style={styles.linhaHoras}>
                  <View style={styles.colunaHora}>
                    <Text style={styles.labelHora}>Abre às:</Text>
                    <TextInput
                      style={[styles.inputHora, erros.horarios && horarios[dia].abertura.length < 5 && styles.inputErro]}
                      value={horarios[dia].abertura}
                      onChangeText={(texto) => handleHoraChange(dia, 'abertura', texto)}
                      keyboardType="numeric"
                      placeholder="00:00"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.colunaHora}>
                    <Text style={styles.labelHora}>Fecha às:</Text>
                    <TextInput
                      style={[styles.inputHora, erros.horarios && horarios[dia].fechamento.length < 5 && styles.inputErro]}
                      value={horarios[dia].fechamento}
                      onChangeText={(texto) => handleHoraChange(dia, 'fechamento', texto)}
                      keyboardType="numeric"
                      placeholder="00:00"
                      maxLength={5}
                    />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.botao, fazendoUpload && { backgroundColor: '#c5e1a5' }]} 
          onPress={handleSalvar}
          disabled={fazendoUpload} 
        >
          {fazendoUpload ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.textoBotao}>Salvar e Continuar</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  scrollContainer: { padding: 20, paddingBottom: 50 },
  header: { marginBottom: 20 },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#93BD57', marginBottom: 5 },
  subtitulo: { fontSize: 15, color: '#666' },
  
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 18, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  cardTitulo: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 8 },
  
  imageUploadContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  boxLogo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed' },
  boxCapa: { width: 120, height: 70, borderRadius: 8, backgroundColor: '#F0F0F0', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: '#DDD', borderStyle: 'dashed' },
  imagemPrevia: { width: '100%', height: '100%' },
  imageHelperText: { flex: 1, marginLeft: 15, fontSize: 13, color: '#888' },

  labelContainer: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', color: '#555', marginBottom: 6, marginTop: 10 },
  
  input: { backgroundColor: '#F9FAFB', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#E5E7EB', fontSize: 15, color: '#333' },
  inputErro: { borderColor: '#E53E3E', backgroundColor: '#FFF5F5' },
  textoErro: { color: '#E53E3E', fontSize: 12, marginTop: 4, fontWeight: '500' },
  
  linhaDupla: { flexDirection: 'row', justifyContent: 'space-between' },
  metade: { flex: 1, marginRight: 5 }, 
  
  chipScroll: { flexDirection: 'row', marginBottom: 5, marginTop: 5 },
  chip: { backgroundColor: '#F0F0F0', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  chipSelecionado: { backgroundColor: '#93BD57', borderColor: '#93BD57' },
  chipErro: { borderColor: '#E53E3E', borderWidth: 1 },
  chipTexto: { color: '#666', fontWeight: '600' },
  chipTextoSelecionado: { color: '#FFF' },

  gridPagamentos: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', width: '48%', marginBottom: 15 },
  textoCheckbox: { marginLeft: 8, fontSize: 14, color: '#444' },

  itemDia: { marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  linhaDiaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nomeDiaTexto: { fontSize: 16, fontWeight: '600', color: '#444' },
  linhaHoras: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  colunaHora: { width: '48%' },
  labelHora: { fontSize: 12, color: '#888', marginBottom: 5 },
  inputHora: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 6, padding: 10, textAlign: 'center', fontSize: 15, fontWeight: 'bold', color: '#333' },

  botao: { backgroundColor: '#93BD57', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 10, elevation: 3 },
  textoBotao: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});