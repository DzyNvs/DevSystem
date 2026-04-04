import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
import { usePerfilRestauranteController } from '../controllers/usePerfilRestauranteController';

export function PerfilRestauranteScreen() {
  const ctrl = usePerfilRestauranteController();

  const escolherImagem = async (tipo) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      const msg = 'Precisamos de acesso à sua galeria para alterar as fotos.';
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert('Permissão necessária', msg);
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
        ctrl.setLogo(result.assets[0].uri);
        ctrl.setErros(prev => ({ ...prev, logo: null }));
      } else {
        ctrl.setCapa(result.assets[0].uri);
      }
    }
  };

  const nomesDias = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const labelsPagamentos = {
    pix: 'PIX', cartao_credito: 'Cartão de Crédito', cartao_debito: 'Cartão de Débito',
    dinheiro: 'Dinheiro', vale_refeicao: 'Vale Refeição', vale_alimentacao: 'Vale Alimentação'
  };

  if (ctrl.carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#93BD57" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

        {/* HEADER */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={ctrl.voltar} style={styles.botaoVoltar}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>Perfil da Loja</Text>
            <Text style={styles.subtitulo}>Atualize as informações do seu estabelecimento.</Text>
          </View>
        </View>

        {/* CARD 1: IDENTIDADE VISUAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Identidade Visual</Text>
          <Text style={styles.label}>Logo da Loja *</Text>
          <View style={styles.imageUploadContainer}>
            <TouchableOpacity style={[styles.boxLogo, ctrl.erros.logo && styles.inputErro]} onPress={() => escolherImagem('logo')}>
              {ctrl.logo ? (
                <Image source={{ uri: ctrl.logo }} style={styles.imagemPrevia} />
              ) : (
                <Ionicons name="camera-outline" size={32} color={ctrl.erros.logo ? "#E53E3E" : "#A0A0A0"} />
              )}
            </TouchableOpacity>
            <Text style={styles.imageHelperText}>Toque para alterar a logo.</Text>
          </View>
          {ctrl.erros.logo && <Text style={styles.textoErro}>{ctrl.erros.logo}</Text>}

          <Text style={[styles.label, { marginTop: 20 }]}>Foto de Capa (Opcional)</Text>
          <View style={styles.imageUploadContainer}>
            <TouchableOpacity style={styles.boxCapa} onPress={() => escolherImagem('capa')}>
              {ctrl.capa ? (
                <Image source={{ uri: ctrl.capa }} style={styles.imagemPrevia} />
              ) : (
                <Ionicons name="image-outline" size={32} color="#A0A0A0" />
              )}
            </TouchableOpacity>
            <Text style={styles.imageHelperText}>Essa foto fica no topo do seu cardápio.</Text>
          </View>
        </View>

        {/* CARD 2: INFORMAÇÕES BÁSICAS */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Informações Básicas</Text>
          <Text style={styles.label}>Nome Fantasia *</Text>
          <TextInput
            style={[styles.input, ctrl.erros.nomeFantasia && styles.inputErro]}
            value={ctrl.nomeFantasia}
            onChangeText={(texto) => { ctrl.setNomeFantasia(texto); ctrl.setErros(prev => ({ ...prev, nomeFantasia: null })); }}
            placeholder="Nome da sua loja"
          />
          {ctrl.erros.nomeFantasia && <Text style={styles.textoErro}>{ctrl.erros.nomeFantasia}</Text>}

          <Text style={styles.label}>Especialidade Principal *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            persistentScrollbar={true}
            style={styles.chipScroll}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {ctrl.CATEGORIAS.map((cat, index) => {
              const selecionado = ctrl.especialidade === cat;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.chip, selecionado && styles.chipSelecionado, ctrl.erros.especialidade && styles.chipErro]}
                  onPress={() => { ctrl.setEspecialidade(cat); ctrl.setErros(prev => ({ ...prev, especialidade: null })); }}
                >
                  <Text style={[styles.chipTexto, selecionado && styles.chipTextoSelecionado]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {ctrl.erros.especialidade && <Text style={styles.textoErro}>{ctrl.erros.especialidade}</Text>}
        </View>

        {/* CARD 3: ENDEREÇO */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Endereço da Loja</Text>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>CEP *</Text>
            {ctrl.buscandoCep && <ActivityIndicator size="small" color="#93BD57" style={{ marginLeft: 10, marginTop: 10 }} />}
          </View>
          <TextInput
            style={[styles.input, ctrl.erros.cep && styles.inputErro]}
            value={ctrl.endereco.cep}
            onChangeText={(texto) => ctrl.handleEnderecoChange('cep', texto)}
            placeholder="00000-000"
            keyboardType="numeric"
            maxLength={9}
          />
          {ctrl.erros.cep && <Text style={styles.textoErro}>{ctrl.erros.cep}</Text>}

          <Text style={styles.label}>Rua / Avenida *</Text>
          <TextInput style={[styles.input, ctrl.erros.rua && styles.inputErro]} value={ctrl.endereco.rua} onChangeText={(texto) => ctrl.handleEnderecoChange('rua', texto)} placeholder="Ex: Av. Paulista" />

          <View style={styles.linhaDupla}>
            <View style={styles.metade}>
              <Text style={styles.label}>Número *</Text>
              <TextInput style={[styles.input, ctrl.erros.numero && styles.inputErro]} value={ctrl.endereco.numero} onChangeText={(texto) => ctrl.handleEnderecoChange('numero', texto)} placeholder="Ex: 1000" keyboardType="numeric" />
            </View>
            <View style={styles.metade}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput style={styles.input} value={ctrl.endereco.complemento} onChangeText={(texto) => ctrl.handleEnderecoChange('complemento', texto)} placeholder="Loja 2" />
            </View>
          </View>

          <Text style={styles.label}>Bairro *</Text>
          <TextInput style={[styles.input, ctrl.erros.bairro && styles.inputErro]} value={ctrl.endereco.bairro} onChangeText={(texto) => ctrl.handleEnderecoChange('bairro', texto)} placeholder="Bairro" />

          <View style={styles.linhaDupla}>
            <View style={[styles.metade, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.label}>Cidade *</Text>
              <TextInput style={[styles.input, ctrl.erros.cidade && styles.inputErro]} value={ctrl.endereco.cidade} onChangeText={(texto) => ctrl.handleEnderecoChange('cidade', texto)} placeholder="Cidade" />
            </View>
            <View style={[styles.metade, { flex: 1 }]}>
              <Text style={styles.label}>UF *</Text>
              <TextInput style={[styles.input, ctrl.erros.estado && styles.inputErro]} value={ctrl.endereco.estado} onChangeText={(texto) => ctrl.handleEnderecoChange('estado', texto)} placeholder="SP" maxLength={2} autoCapitalize="characters" />
            </View>
          </View>
        </View>

        {/* CARD 4: PAGAMENTOS */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Formas de Pagamento *</Text>
          {ctrl.erros.pagamentos && <Text style={styles.textoErro}>{ctrl.erros.pagamentos}</Text>}
          <View style={styles.gridPagamentos}>
            {Object.keys(ctrl.pagamentos).map((chave) => (
              <TouchableOpacity key={chave} style={styles.checkboxContainer} onPress={() => ctrl.togglePagamento(chave)}>
                <Ionicons name={ctrl.pagamentos[chave] ? "checkbox" : "square-outline"} size={24} color={ctrl.pagamentos[chave] ? "#93BD57" : "#A0A0A0"} />
                <Text style={styles.textoCheckbox}>{labelsPagamentos[chave]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* CARD 5: HORÁRIOS */}
        <View style={styles.card}>
          <Text style={styles.cardTitulo}>Dias e Horários *</Text>
          {ctrl.erros.horarios && <Text style={styles.textoErro}>{ctrl.erros.horarios}</Text>}
          {nomesDias.map((dia) => (
            <View key={dia} style={styles.itemDia}>
              <View style={styles.linhaDiaTopo}>
                <Text style={styles.nomeDiaTexto}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</Text>
                <Switch
                  trackColor={{ false: "#E0E0E0", true: "#c5e1a5" }}
                  thumbColor={ctrl.horarios[dia].funciona ? "#93BD57" : "#f4f3f4"}
                  onValueChange={() => ctrl.toggleDia(dia)}
                  value={ctrl.horarios[dia].funciona}
                />
              </View>
              {ctrl.horarios[dia].funciona && (
                <View style={styles.linhaHoras}>
                  <View style={styles.colunaHora}>
                    <Text style={styles.labelHora}>Abre às:</Text>
                    <TextInput style={styles.inputHora} value={ctrl.horarios[dia].abertura} onChangeText={(texto) => ctrl.handleHoraChange(dia, 'abertura', texto)} keyboardType="numeric" maxLength={5} />
                  </View>
                  <View style={styles.colunaHora}>
                    <Text style={styles.labelHora}>Fecha às:</Text>
                    <TextInput style={styles.inputHora} value={ctrl.horarios[dia].fechamento} onChangeText={(texto) => ctrl.handleHoraChange(dia, 'fechamento', texto)} keyboardType="numeric" maxLength={5} />
                  </View>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* BOTÃO SALVAR */}
        <TouchableOpacity style={[styles.botao, ctrl.salvando && { backgroundColor: '#c5e1a5' }]} onPress={ctrl.handleSalvar} disabled={ctrl.salvando}>
          {ctrl.salvando ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.textoBotao}>Salvar Alterações</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6F8' },
  scrollContainer: { paddingHorizontal: 70, paddingTop: 20, paddingBottom: 50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F8' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  botaoVoltar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginRight: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
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
  chipScroll: { flexDirection: 'row', marginTop: 10, paddingBottom: 15 },
  chip: { backgroundColor: '#F0F0F0', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E0E0E0' },
  chipSelecionado: { backgroundColor: '#93BD57', borderColor: '#93BD57' },
  chipErro: { borderColor: '#E53E3E' },
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
  textoBotao: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});