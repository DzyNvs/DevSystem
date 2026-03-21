import { collection, getDocs, query, where } from 'firebase/firestore';
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
  }
};