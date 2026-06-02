import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, GeoPoint, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import Mapa from '../components/Mapa';
import { auth, db } from '../src/config/firebase';

export default function EscolherEnderecoScreen() {
  const router = useRouter();

  const [localizacao, setLocalizacao]         = useState(null);
  const [carregando, setCarregando]           = useState(true);
  const [salvando, setSalvando]               = useState(false);
  const [buscandoNoMapa, setBuscandoNoMapa]   = useState(false);

  const [rua, setRua]               = useState('');
  const [numero, setNumero]         = useState('');
  const [bairro, setBairro]         = useState('');
  const [cidade, setCidade]         = useState('');
  const [cep, setCep]               = useState('');
  const [complemento, setComplemento] = useState('');
  const [apelido, setApelido]       = useState('');

  // Flag: true quando o usuário já começou a digitar manualmente.
  // Quando true, arrastar o pin NÃO sobrescreve os campos.
  const usuarioEditouRef = useRef(false);
  const debounceRef      = useRef(null);

  useEffect(() => { pegarLocalizacaoAtual(); }, []);

  // ── GPS inicial → preenche campos via reverse geocode ──────────────────
  const pegarLocalizacaoAtual = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Atenção', 'Precisamos do GPS para continuar.');
        setCarregando(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      await reverseGeocode(loc.coords.latitude, loc.coords.longitude, true);
    } catch (e) {
      console.log('Erro GPS:', e);
    } finally {
      setCarregando(false);
    }
  };

  // ── Reverse geocode: coords → texto dos campos ──────────────────────────
  // sobrescreverCampos = false quando o usuário já editou manualmente
  const reverseGeocode = async (lat, lng, sobrescreverCampos = false) => {
    setLocalizacao({ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 });

    if (!sobrescreverCampos) return; // só move o mapa, não mexe nos campos

    try {
      if (Platform.OS === 'web') {
        const res  = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          { headers: { 'User-Agent': 'FitWayApp' } }
        );
        const data = await res.json();
        if (data.address) {
          setRua(data.address.road || data.address.pedestrian || '');
          setBairro(data.address.suburb || data.address.neighbourhood || '');
          setCidade(data.address.city || data.address.town || '');
          const cepRaw = (data.address.postcode || '').replace(/\D/g, '');
          setCep(cepRaw.length > 5 ? cepRaw.replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9) : cepRaw);
        }
      } else {
        const [det] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        if (det) {
          setRua(det.street || '');
          setBairro(det.district || '');
          setCidade(det.subregion || det.city || '');
          const cepRaw = (det.postalCode || '').replace(/\D/g, '');
          setCep(cepRaw.length > 5 ? cepRaw.replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9) : cepRaw);
        }
      }
    } catch (e) {
      console.log('Reverse geocode error:', e);
    }
  };

  // ── Forward geocode: campos → move o mapa (sem sobrescrever texto) ──────
  const forwardGeocode = (ruaV, numV, bairroV, cidadeV, cepV) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const temEndereco   = ruaV.length > 3 && cidadeV.length > 2;
    const cepLimpo      = cepV.replace(/\D/g, '');
    const temCepCompleto = cepLimpo.length === 8;

    if (!temEndereco && !temCepCompleto) return;

    debounceRef.current = setTimeout(async () => {
      setBuscandoNoMapa(true);
      try {
        let queryStr = '';

        if (temCepCompleto) {
          // Usa ViaCEP apenas para montar a query de geocoding — NÃO sobrescreve campos
          const resCep  = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
          const dataCep = await resCep.json();
          if (!dataCep.erro) {
            const logradouro = ruaV || dataCep.logradouro || '';
            const bairroQ    = bairroV || dataCep.bairro || '';
            const cidadeQ    = cidadeV || dataCep.localidade || '';
            queryStr = `${logradouro} ${numV}, ${bairroQ}, ${cidadeQ}, Brazil`;

            // Preenche só os campos que estiverem vazios (usa parâmetros, não state)
            if (!ruaV    && dataCep.logradouro) setRua(dataCep.logradouro);
            if (!bairroV && dataCep.bairro)     setBairro(dataCep.bairro);
            if (!cidadeV && dataCep.localidade) setCidade(dataCep.localidade);
          }
        }

        if (!queryStr) queryStr = `${ruaV} ${numV}, ${bairroV}, ${cidadeV}, Brazil`;

        const res     = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryStr)}&limit=1`,
          { headers: { 'User-Agent': 'FitWayApp' } }
        );
        const results = await res.json();
        if (results.length > 0) {
          const lat = parseFloat(results[0].lat);
          const lng = parseFloat(results[0].lon);
          // Atualiza SOMENTE as coordenadas — não mexe nos campos
          setLocalizacao({ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 });
        }
      } catch (e) {
        console.log('Forward geocode error:', e);
      } finally {
        setBuscandoNoMapa(false);
      }
    }, 800);
  };

  // ── Handlers de cada campo ──────────────────────────────────────────────
  const onChange = (setter, campo) => (v) => {
    usuarioEditouRef.current = true; // marca que o usuário está editando
    setter(v);
    const vals = { rua, numero, bairro, cidade, cep, [campo]: v };
    forwardGeocode(vals.rua, vals.numero, vals.bairro, vals.cidade, vals.cep);
  };

  const handleCepChange = (texto) => {
    let f = texto.replace(/\D/g, '');
    if (f.length > 5) f = f.replace(/^(\d{5})(\d)/, '$1-$2');
    const val = f.slice(0, 9);
    usuarioEditouRef.current = true;
    setCep(val);
    forwardGeocode(rua, numero, bairro, cidade, val);
  };

  // ── Callback do mapa (arrastar pin) ────────────────────────────────────
  // Se o usuário editou campos manualmente → só atualiza coordenadas
  // Se ainda não editou (modo GPS puro) → faz reverse geocode completo
  const handleLocationChange = async (lat, lng) => {
    if (usuarioEditouRef.current) {
      // Só move o ponto, não sobrescreve o que o usuário digitou
      setLocalizacao({ latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 });
    } else {
      setBuscandoNoMapa(true);
      await reverseGeocode(lat, lng, true);
      setBuscandoNoMapa(false);
    }
  };

  // Botão "Usar minha localização" — reseta para GPS e sobrescreve campos
  const usarMinhaLocalizacao = async () => {
    setBuscandoNoMapa(true);
    usuarioEditouRef.current = false;
    await pegarLocalizacaoAtual();
    setBuscandoNoMapa(false);
  };

  // ── Salvar no Firestore ─────────────────────────────────────────────────
  const handleConfirmar = async () => {
    const user = auth.currentUser;
    if (!user) return;

    if (!localizacao) {
      Alert.alert('Atenção', 'Não foi possível obter a localização. Ative o GPS ou mova o pin no mapa.');
      return;
    }
    const numeroFinal = numero.trim() || 'S/N';
    // Aceita apenas dígitos puros (ex: 123) ou "S/N". Rejeita 12A, ABC, etc.
    const eSN = /^s\/?n$/i.test(numeroFinal);
    if (!eSN && !/^\d+$/.test(numeroFinal)) {
      Alert.alert('Atenção', 'Número inválido. Use apenas dígitos (ex: 123) ou deixe em branco para S/N.');
      return;
    }
    if (!rua.trim())    { Alert.alert('Atenção', 'Preencha o nome da rua.'); return; }
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length > 0 && cepLimpo.length !== 8) {
      Alert.alert('Atenção', 'CEP inválido. Informe os 8 dígitos (ex: 01310-100).');
      return;
    }

    setSalvando(true);
    try {
      // Verifica se já existe algum endereço para este usuário
      // O primeiro endereço salvo entra como padrão; os demais, não
      const refConsumidor = doc(db, 'consumidores', user.uid);
      const qExistentes = query(
        collection(db, 'enderecos'),
        where('id_consumidor', '==', refConsumidor)
      );
      const snapExistentes = await getDocs(qExistentes);
      const ehPrimeiro = snapExistentes.empty;

      await addDoc(collection(db, 'enderecos'), {
        apelido:        apelido.trim() || 'Casa',
        rua,
        numero:         numeroFinal,
        bairro,
        cidade,
        cep,
        complemento,
        geolocalizacao: new GeoPoint(localizacao.latitude, localizacao.longitude),
        id_consumidor:  refConsumidor,
        padrao:         ehPrimeiro,
      });
      router.back();
    } catch (e) {
      console.log('Erro ao salvar:', e);
      Alert.alert('Erro', 'Não foi possível salvar o endereço.');
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#93BD57" />
        <Text style={{ marginTop: 10, color: '#666' }}>Buscando sua posição...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Mapa localizacao={localizacao} onLocationChange={handleLocationChange} />

      {/* Card flutuante com os campos */}
      <ScrollView style={styles.card} contentContainerStyle={{ paddingBottom: 8 }} keyboardShouldPersistTaps="handled">
        <View style={styles.labelRow}>
          <Text style={styles.labelGPS}>📍 Local de entrega</Text>
          {buscandoNoMapa && <ActivityIndicator size="small" color="#93BD57" style={{ marginLeft: 8 }} />}
          <TouchableOpacity onPress={usarMinhaLocalizacao} style={styles.btnGPS}>
            <Text style={styles.btnGPSTexto}>Usar GPS</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} placeholder="Rua / Avenida *"
          value={rua} onChangeText={onChange(setRua, 'rua')} />

        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Número *"
            keyboardType="numeric" value={numero} onChangeText={onChange(setNumero, 'numero')} />
          <TextInput style={[styles.input, { flex: 1.5, marginLeft: 8 }]} placeholder="CEP"
            keyboardType="numeric" maxLength={9} value={cep} onChangeText={handleCepChange} />
        </View>

        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Bairro"
            value={bairro} onChangeText={onChange(setBairro, 'bairro')} />
          <TextInput style={[styles.input, { flex: 1.5, marginLeft: 8 }]} placeholder="Cidade"
            value={cidade} onChangeText={onChange(setCidade, 'cidade')} />
        </View>

        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1.5 }]} placeholder="Complemento (Ap, Bloco)"
            value={complemento} onChangeText={setComplemento} />
          <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} placeholder="Apelido (Casa)"
            value={apelido} onChangeText={setApelido} />
        </View>

        <Text style={styles.dica}>Toque no mapa ou arraste o pin para ajustar</Text>
      </ScrollView>

      {/* Rodapé */}
      <View style={styles.rodape}>
        <TouchableOpacity style={[styles.btnConfirmar, salvando && { opacity: 0.7 }]}
          onPress={handleConfirmar} disabled={salvando}>
          {salvando
            ? <ActivityIndicator color="#FFF" />
            : <Text style={styles.btnTexto}>Confirmar Endereço</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/selecionar-endereco')} disabled={salvando}>
          <Text style={styles.btnCancelar}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  loading:   { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: {
    position: 'absolute', top: 50, left: 16, right: 16,
    backgroundColor: '#FFF', borderRadius: 14, padding: 14,
    maxHeight: 340, elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 10,
  },
  labelRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  labelGPS:    { fontSize: 12, color: '#888', fontWeight: '600', flex: 1 },
  btnGPS:      { backgroundColor: '#EAF3DE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  btnGPSTexto: { fontSize: 11, color: '#3B6D11', fontWeight: '600' },
  row:         { flexDirection: 'row', marginBottom: 0 },
  input: {
    borderWidth: 1, borderColor: '#DDD', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 8, fontSize: 14,
    backgroundColor: '#F9F9F9', marginBottom: 8,
  },
  dica:    { fontSize: 11, color: '#93BD57', textAlign: 'center', marginTop: 2 },
  rodape: {
    position: 'absolute', bottom: 24, left: 16, right: 16,
    backgroundColor: '#FFF', borderRadius: 14, padding: 16,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10,
  },
  btnConfirmar: { backgroundColor: '#93BD57', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  btnTexto:     { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  btnCancelar:  { color: '#666', textAlign: 'center', fontWeight: '600', padding: 4 },
});