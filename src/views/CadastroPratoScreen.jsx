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

        {/* Botão Voltar → Home */}
        <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color="#333" />
          <Text style={styles.btnVoltarTexto}>Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.titulo}>Novo Prato</Text>
        <Text style={styles.subtitulo}>Cadastre um item no seu cardápio</Text>

        {/* CARD PRINCIPAL */}
        <View style={styles.card}>

          {/* Foto do Prato — compacta */}
          <Text style={styles.label}>Foto do Prato</Text>
          <TouchableOpacity style={styles.imagemContainer} onPress={ctrl.escolherImagem}>
            {ctrl.imagemUri ? (
              <Image source={{ uri: ctrl.imagemUri }} style={styles.imagemPreview} />
            ) : (
              <View style={styles.imagemPlaceholder}>
                <Ionicons name="camera-outline" size={24} color="#93BD57" />
                <Text style={styles.imagemTexto}>Adicionar foto</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Nome */}
          <Text style={styles.label}>Nome do Prato *</Text>
          <TextInput
            style={styles.input}
            value={ctrl.nome}
            onChangeText={ctrl.setNome}
            placeholder="Ex: Strogonoff de Frango"
          />

          {/* Descrição */}
          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
            value={ctrl.descricao}
            onChangeText={ctrl.setDescricao}
            placeholder="Ingredientes e detalhes..."
            multiline
          />

          {/* Preço e Calorias */}
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Preço (R$) *</Text>
              <TextInput
                style={styles.input}
                value={ctrl.preco}
                onChangeText={ctrl.setPreco}
                placeholder="25,90"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Calorias</Text>
              <TextInput
                style={styles.input}
                value={ctrl.calorias}
                onChangeText={ctrl.setCalorias}
                placeholder="Ex: 350"
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Tags (substitui categoria) */}
          <Text style={styles.label}>Tag (opcional)</Text>
          <Text style={styles.tagHelper}>Selecione uma tag que melhor descreve o prato</Text>
          <View style={styles.tagsContainer}>
            {ctrl.TAGS.map((tag, index) => {
              const selecionado = ctrl.categoria === tag;
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.tagChip, selecionado && styles.tagChipSelecionado]}
                  onPress={() => ctrl.selecionarTag(tag)}
                >
                  <Ionicons
                    name={selecionado ? "checkmark-circle" : "ellipse-outline"}
                    size={18}
                    color={selecionado ? "#FFF" : "#888"}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.tagTexto, selecionado && styles.tagTextoSelecionado]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Botão Salvar — compacto */}
        <TouchableOpacity
          style={[styles.btnSalvar, ctrl.salvando && { backgroundColor: '#c5e1a5' }]}
          onPress={ctrl.salvarPrato}
          disabled={ctrl.salvando}
        >
          {ctrl.salvando ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <View style={styles.btnSalvarContent}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
              <Text style={styles.btnSalvarText}>Salvar Prato</Text>
            </View>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F4F6F8' },
  container: { flex: 1 },
  content: { padding: 24, paddingBottom: 50 },

  btnVoltar: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  btnVoltarTexto: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
    fontWeight: '500',
  },

  titulo: { fontSize: 26, fontWeight: 'bold', color: '#93BD57' },
  subtitulo: { fontSize: 14, color: '#666', marginBottom: 20 },

  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  // Foto compacta
  imagemContainer: {
    width: 120,
    height: 90,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  imagemPreview: { width: '100%', height: '100%' },
  imagemPlaceholder: { alignItems: 'center' },
  imagemTexto: { color: '#93BD57', fontWeight: '600', fontSize: 12, marginTop: 4 },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#333',
  },
  row: { flexDirection: 'row', gap: 12 },
  col: { flex: 1 },

  // Tags
  tagHelper: { fontSize: 12, color: '#999', marginBottom: 10 },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  tagChipSelecionado: {
    backgroundColor: '#93BD57',
    borderColor: '#93BD57',
  },
  tagTexto: { color: '#666', fontSize: 13, fontWeight: '500' },
  tagTextoSelecionado: { color: '#FFF' },

  // Botão salvar compacto
  btnSalvar: {
    backgroundColor: '#93BD57',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 3,
  },
  btnSalvarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});