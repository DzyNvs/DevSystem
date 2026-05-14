import { collection, doc, getDoc, getDocs, increment, limit, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const FITCOINS_POR_AVALIACAO = 30;
const FITCOINS_POR_DESCONTO = 100;

export const AvaliacaoModel = {

  async avaliarPedido(idPedido, idConsumidor, nota, comentario = '') {
    await updateDoc(doc(db, 'pedidos', idPedido), {
      avaliacao: nota,
      comentario_avaliacao: comentario.trim(),
      avaliado: true,
    });

    const refConsumidor = doc(db, 'consumidores', idConsumidor);
    await setDoc(refConsumidor, { fit_coins: increment(FITCOINS_POR_AVALIACAO) }, { merge: true });
  },

  async recalcularMediaRestaurante(idRestaurante) {
    try {
      // 1. Acha o ID real do documento no Firestore (igual ao buscarPorId do RestauranteModel)
      const qRestaurante = query(
        collection(db, 'restaurantes'),
        where('id_restaurante', '==', idRestaurante),
        limit(1)
      );
      const snapRestaurante = await getDocs(qRestaurante);
      if (snapRestaurante.empty) {
        console.warn('Restaurante não encontrado para recalcular média:', idRestaurante);
        return;
      }
      const docIdReal = snapRestaurante.docs[0].id; // ID real do documento Firestore

      // 2. Busca todos os pedidos avaliados deste restaurante
      const qPedidos = query(
        collection(db, 'pedidos'),
        where('id_restaurante', '==', idRestaurante),
        where('avaliado', '==', true)
      );
      const snapPedidos = await getDocs(qPedidos);
      if (snapPedidos.empty) return;

      const notas = snapPedidos.docs
        .map(d => d.data().avaliacao)
        .filter(n => typeof n === 'number');

      if (notas.length === 0) return;

      const media = notas.reduce((acc, n) => acc + n, 0) / notas.length;

      // 3. Atualiza usando o ID real do documento
      await updateDoc(doc(db, 'restaurantes', docIdReal), {
        avaliacao: parseFloat(media.toFixed(1)),
        total_avaliacoes: notas.length,
      });
    } catch (error) {
      console.error('Erro ao recalcular média do restaurante:', error);
    }
  },

  async buscarFitCoins(idConsumidor) {
    const snap = await getDoc(doc(db, 'consumidores', idConsumidor));
    if (snap.exists()) return snap.data().fit_coins || 0;
    return 0;
  },

  async usarDesconto(idConsumidor) {
    const refConsumidor = doc(db, 'consumidores', idConsumidor);
    await setDoc(
      refConsumidor,
      { fit_coins: increment(-FITCOINS_POR_DESCONTO) },
      { merge: true }
    );
  },

  calcularDesconto(fitCoins) {
    const blocos = Math.floor(fitCoins / FITCOINS_POR_DESCONTO);
    return blocos * 15;
  },
};