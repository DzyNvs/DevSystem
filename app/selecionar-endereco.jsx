import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Platform, ScrollView,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { auth, db } from '../src/config/firebase';
import { useCarrinhoStore } from '../src/controllers/useCarrinhoStore';

// Ícone por apelido
const getIcone = (apelido = '') => {
  const a = apelido.toLowerCase();
  if (a.includes('casa') || a.includes('home'))     return 'home-outline';
  if (a.includes('trabalho') || a.includes('job'))  return 'briefcase-outline';
  if (a.includes('academia') || a.includes('gym'))  return 'barbell-outline';
  if (a.includes('faculdade') || a.includes('esc')) return 'school-outline';
  return 'location-outline';
};

export default function SelecionarEnderecoScreen() {
  const router   = useRouter();
  const [enderecos, setEnderecos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  // Salva endereço ativo no store do carrinho para o header exibir
  const setEnderecoAtivo = useCarrinhoStore((s) => s.setEnderecoAtivo);
  const enderecoAtivo    = useCarrinhoStore((s) => s.enderecoAtivo);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'enderecos'),
      where('id_consumidor', '==', doc(db, 'consumidores', user.uid))
    );

    const unsub = onSnapshot(q, (snap) => {
      const lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEnderecos(lista);
      // Marca o endereço ativo que já estava salvo
      if (enderecoAtivo) setSelecionado(enderecoAtivo.id);
      setCarregando(false);
    });

    return () => unsub();
  }, []);

  const handleSelecionar = async (endereco) => {
    setSelecionado(endereco.id);
    // Salva no Zustand para o header mostrar
    setEnderecoAtivo(endereco);

    // Marca como padrão no Firestore (opcional)
    try {
      // Remove padrão dos outros
      for (const e of enderecos) {
        if (e.id !== endereco.id && e.padrao) {
          await updateDoc(doc(db, 'enderecos', e.id), { padrao: false });
        }
      }
      await updateDoc(doc(db, 'enderecos', endereco.id), { padrao: true });
    } catch (e) { console.log(e); }

    router.back();
  };

  const handleExcluir = (endereco) => {
    const confirmar = () => {
      deleteDoc(doc(db, 'enderecos', endereco.id)).catch(console.log);
      if (enderecoAtivo?.id === endereco.id) setEnderecoAtivo(null);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir "${endereco.apelido}"?`)) confirmar();
    } else {
      Alert.alert('Excluir endereço', `Deseja excluir "${endereco.apelido}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: confirmar },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.btnVoltar}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.titulo}>Endereço de entrega</Text>
      </View>

      {carregando ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#93BD57" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>

          {/* Lista de endereços salvos */}
          {enderecos.length === 0 && (
            <Text style={styles.vazio}>Nenhum endereço cadastrado ainda.</Text>
          )}

          {enderecos.map((end) => {
            const ativo = selecionado === end.id;
            return (
              <TouchableOpacity
                key={end.id}
                style={[styles.card, ativo && styles.cardAtivo]}
                onPress={() => handleSelecionar(end)}
                activeOpacity={0.8}
              >
                {/* Ícone */}
                <View style={[styles.iconBox, ativo && styles.iconBoxAtivo]}>
                  <Ionicons name={getIcone(end.apelido)} size={22}
                    color={ativo ? '#FFF' : '#93BD57'} />
                </View>

                {/* Texto */}
                <View style={styles.cardTexto}>
                  <View style={styles.cardTopo}>
                    <Text style={[styles.apelido, ativo && styles.apelidoAtivo]}>
                      {end.apelido || 'Endereço'}
                    </Text>
                    {ativo && (
                      <View style={styles.badgeAtivo}>
                        <Text style={styles.badgeTexto}>Ativo</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.enderecoTexto} numberOfLines={1}>
                    {end.rua}{end.numero ? `, ${end.numero}` : ''}
                    {end.bairro ? ` – ${end.bairro}` : ''}
                  </Text>
                  <Text style={styles.cidadeTexto} numberOfLines={1}>
                    {end.cidade}{end.cep ? ` • ${end.cep}` : ''}
                  </Text>
                </View>

                {/* Botão excluir */}
                <TouchableOpacity onPress={() => handleExcluir(end)} style={styles.btnExcluir}>
                  <Ionicons name="trash-outline" size={18} color="#CCC" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}

          {/* Botão adicionar novo */}
          <TouchableOpacity
            style={styles.btnNovo}
            onPress={() => router.push('/escolher-endereco')}
          >
            <View style={styles.iconBoxNovo}>
              <Ionicons name="add" size={22} color="#93BD57" />
            </View>
            <Text style={styles.btnNovoTexto}>Adicionar novo endereço</Text>
            <Ionicons name="chevron-forward" size={18} color="#93BD57" />
          </TouchableOpacity>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loading:   { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', paddingHorizontal: 16,
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#EEE',
    elevation: 2,
  },
  btnVoltar: { marginRight: 12, padding: 4 },
  titulo:    { fontSize: 18, fontWeight: '700', color: '#2C3E50' },

  lista: { padding: 16, gap: 12 },
  vazio: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 14,
    padding: 14, borderWidth: 1.5, borderColor: '#EEE',
    elevation: 1,
  },
  cardAtivo: { borderColor: '#93BD57', backgroundColor: '#FAFFF5' },

  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EAF3DE',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 12,
  },
  iconBoxAtivo: { backgroundColor: '#93BD57' },

  cardTexto: { flex: 1 },
  cardTopo:  { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  apelido:       { fontSize: 15, fontWeight: '700', color: '#2C3E50' },
  apelidoAtivo:  { color: '#3B6D11' },
  badgeAtivo:    { backgroundColor: '#93BD57', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2, marginLeft: 8 },
  badgeTexto:    { fontSize: 10, color: '#FFF', fontWeight: '700' },
  enderecoTexto: { fontSize: 13, color: '#555', marginBottom: 1 },
  cidadeTexto:   { fontSize: 12, color: '#999' },

  btnExcluir: { padding: 8 },

  btnNovo: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 14,
    padding: 14, borderWidth: 1.5, borderColor: '#93BD57',
    borderStyle: 'dashed',
  },
  iconBoxNovo: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EAF3DE',
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  btnNovoTexto: { flex: 1, fontSize: 15, fontWeight: '600', color: '#93BD57' },
});
