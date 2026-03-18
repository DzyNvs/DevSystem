import { collection, query, where, getDocs, doc } from 'firebase/firestore';
import { db } from '../config/firebase'; // Verifique se o caminho está certo!

export const PedidoModel = {
  async buscarPedidosDoRestaurante(idDaLoja) {
    try {
      // Como no seu banco o id_restaurante é uma "Reference", 
      // precisamos criar uma referência da coleção restaurantes antes de buscar
      const restauranteRef = doc(db, 'restaurantes', idDaLoja);

      // Monta a query: "Busque na coleção pedidos ONDE o id_restaurante for igual a essa referência"
      const q = query(
        collection(db, 'pedidos'),
        where('id_restaurante', '==', restauranteRef)
      );

      const snapshot = await getDocs(q);
      const pedidos = [];

      snapshot.forEach((docSnap) => {
        pedidos.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      return pedidos;
    } catch (error) {
      console.error("Erro ao buscar pedidos no Model:", error);
      throw error;
    }
  }
};