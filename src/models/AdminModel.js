import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";

export const RelatorioModel = {
  async buscarTodosRestaurantes() {
    const snap = await getDocs(collection(db, "restaurantes"));
    return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  },

  async buscarPedidosFiltrados({ idRestaurante, dataInicial, dataFinal }) {
    let q;

    if (idRestaurante && idRestaurante !== "todos") {
      // Filtra pelo campo id_restaurante (ex: "rest_618143")
      q = query(
        collection(db, "pedidos"),
        where("id_restaurante", "==", idRestaurante),
      );
    } else {
      q = query(collection(db, "pedidos"));
    }

    const snap = await getDocs(q);
    const pedidos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Filtra por data no client-side
    return pedidos.filter((p) => {
      if (!p.data_criacao) return false;
      const dataPedido = p.data_criacao.toDate
        ? p.data_criacao.toDate()
        : new Date(p.data_criacao);
      return dataPedido >= dataInicial && dataPedido <= dataFinal;
    });
  },

  async buscarTodosProdutos(restaurantes) {
    const resultado = [];
    for (const rest of restaurantes) {
      try {
        // Pratos ficam como subcoleção do documento do restaurante (pelo doc ID, não id_restaurante)
        const snap = await getDocs(
          collection(db, "restaurantes", rest.id, "pratos"),
        );
        snap.docs.forEach((doc) => {
          resultado.push({
            ...doc.data(),
            id: doc.id,
            idRestaurante: rest.id_restaurante, // usa o campo customizado
            nomeRestaurante:
              rest.nome_fantasia || rest.razao_social || "Sem nome",
            especialidadeRestaurante: rest.especialidade || "Não informada",
          });
        });
      } catch (e) {
        console.log(`Erro ao buscar pratos de ${rest.id}:`, e);
      }
    }
    return resultado;
  },
};
