import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCadastroPratoController } from '../controllers/useCadastroPratoController';
import { HeaderRestaurante } from './HeaderRestaurante';

export function CadastroPratoScreen() {
  const ctrl = useCadastroPratoController();
  const router = useRouter(); 

  return (
    <View style={styles.mainContainer}>
      <HeaderRestaurante />
      
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        
        {/*Botão voltar */}
        <TouchableOpacity 
          style={styles.btnVoltar} 
          onPress={() => router.push('/restaurante/cardapio')}
        >
          <Ionicons name="arrow-back" size={20} color="#005F02" />
          <Text style={styles.btnVoltarTexto}>Voltar para Meu Cardápio</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Novo Prato</Text>
        <Text style={styles.subtitulo}>Cadastre um item no seu cardápio</Text>

        <TouchableOpacity style={styles.imagemContainer} onPress={ctrl.escolherImagem}>
          {ctrl.imagemUri ? (
            <Image source={{ uri: ctrl.imagemUri }} style={styles.imagemPreview} />
          ) : (
            <View style={styles.imagemPlaceholder}>
              <Text style={styles.imagemTexto}>+ Adicionar Foto do Prato</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.form}>
          <Text style={styles.label}>Nome do Prato *</Text>
          <TextInput style={styles.input} value={ctrl.nome} onChangeText={ctrl.setNome} placeholder="Ex: Strogonoff de Frango" />

          <Text style={styles.label}>Descrição</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={ctrl.descricao} onChangeText={ctrl.setDescricao} placeholder="Ingredientes e detalhes..." multiline />

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput style={styles.input} value={ctrl.preco} onChangeText={ctrl.setPreco} placeholder="25,90" keyboardType="numeric" />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Calorias</Text>
              <TextInput style={styles.input} value={ctrl.calorias} onChangeText={ctrl.setCalorias} placeholder="Ex: 350" keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.label}>Categoria</Text>
          <TextInput style={styles.input} value={ctrl.categoria} onChangeText={ctrl.setCategoria} placeholder="Ex: Prato Principal" />
        </View>

        <TouchableOpacity 
          style={[styles.btnSalvar, ctrl.salvando && { backgroundColor: '#A5D6A7' }]} 
          onPress={ctrl.salvarPrato}
          disabled={ctrl.salvando}
        >
          {ctrl.salvando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.btnSalvarText}>Salvar Prato</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F7F6F2' },
  container: { flex: 1 },
  content: { padding: 24 },
  btnVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },
  btnVoltarTexto: {
    fontSize: 14,
    color: '#005F02',
    marginLeft: 5,
    fontWeight: '500',
    fontFamily: 'Nunito',
  },
  titulo: { fontSize: 28, fontWeight: 'bold', color: '#005F02', fontFamily: 'Nunito' },
  subtitulo: { fontSize: 16, color: '#666', marginBottom: 20, fontFamily: 'Nunito' },
  imagemContainer: { 
    width: '100%', 
    height: 200, 
    backgroundColor: '#FFF', 
    borderRadius: 12, 
    overflow: 'hidden', 
    marginBottom: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#EAEAEA', 
    borderStyle: 'dashed' 
  },
  imagemPreview: { width: '100%', height: '100%' },
  imagemPlaceholder: { alignItems: 'center' },
  imagemTexto: { color: '#005F02', fontWeight: 'bold', fontSize: 16 },
  form: { width: '100%', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 10, fontFamily: 'Nunito' },
  input: { 
    backgroundColor: '#FFF', 
    borderWidth: 1, 
    borderColor: '#EAEAEA', 
    borderRadius: 8, 
    padding: 12, 
    fontSize: 16,
    fontFamily: 'Nunito'
  },
  row: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  btnSalvar: { backgroundColor: '#005F02', padding: 16, borderRadius: 8, alignItems: 'center' },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 18, fontFamily: 'Nunito' }
});