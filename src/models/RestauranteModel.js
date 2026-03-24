import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const RestauranteModel = {
  // Busca TODOS os restaurantes
  async buscarTodos() {
    try {
      const snap = await getDocs(collection(db, 'restaurantes'));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar restaurantes:", error);
      throw error;
    }
  },

  // Busca restaurantes filtrando pelo campo 'especialidade'
  async buscarPorEspecialidade(especialidade) {
    try {
      const q = query(collection(db, 'restaurantes'), where('especialidade', '==', especialidade));
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Erro ao buscar por especialidade:", error);
      throw error;
    }
  },

  // 👉 Função NOVA: Busca um único restaurante pelo ID
  async buscarPorId(idRestaurante) {
    try {
      const docRef = doc(db, 'restaurantes', idRestaurante);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar restaurante por ID:", error);
      throw error;
    }
  }
};