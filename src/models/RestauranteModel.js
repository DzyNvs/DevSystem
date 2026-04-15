import { collection, getDocs, limit, query, where } from 'firebase/firestore';
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

  // 👉 Função ATUALIZADA: Busca pelo CAMPO 'id_restaurante' (Ex: "rest_960389") em vez do nome do documento
  async buscarPorId(idRestaurante) {
    try {
      // Cria a pesquisa: varre a tabela onde 'id_restaurante' seja igual ao ID que o app está passando
      const q = query(
        collection(db, 'restaurantes'), 
        where('id_restaurante', '==', idRestaurante),
        limit(1) // Como só existe um, mandamos parar de procurar depois de achar o primeiro
      );
      
      const querySnapshot = await getDocs(q);

      // Se ele não voltar vazio, pegamos o primeiro resultado
      if (!querySnapshot.empty) {
        const docEncontrado = querySnapshot.docs[0];
        return { id: docEncontrado.id, ...docEncontrado.data() };
      }
      
      return null;
    } catch (error) {
      console.error("Erro ao buscar restaurante por ID:", error);
      throw error;
    }
  }
};