import { useLocalSearchParams } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { useCarrinhoStore } from "./useCarrinhoStore";

export const useRestauranteDetalhesController = () => {
  const { id: idRestaurante } = useLocalSearchParams();

  const [restaurante, setRestaurante] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [carregandoRestaurante, setCarregandoRestaurante] = useState(true);
  const [carregandoProdutos, setCarregandoProdutos] = useState(true);

  const [lojaAberta, setLojaAberta] = useState(true);
  const [pratoSelecionado, setPratoSelecionado] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);

  // 👉 NOVO: Estado para controlar a exibição do aviso de "Item Adicionado" (Toast)
  const [toastVisivel, setToastVisivel] = useState(false);

  // 👉 NOVOS STATES: Guardam os valores digitados no filtro de calorias
  const [minCal, setMinCal] = useState("");
  const [maxCal, setMaxCal] = useState("");

  const adicionarItemAoCarrinho = useCarrinhoStore(
    (state) => state.adicionarItem,
  );

  useEffect(() => {
    if (!idRestaurante) return;

    setCarregandoRestaurante(true);
    setCarregandoProdutos(true);

    // Listener em tempo real do restaurante — atualiza loja_aberta e dados gerais
    const qRest = query(
      collection(db, "restaurantes"),
      where("id_restaurante", "==", idRestaurante)
    );
    const unsubRest = onSnapshot(qRest, (snap) => {
      setCarregandoRestaurante(false);
      if (!snap.empty) {
        const data = snap.docs[0].data();
        setLojaAberta(data.loja_aberta ?? true);
        setRestaurante({
          ...data,
          id: snap.docs[0].id,
          avaliacao: data.avaliacao || 5.0,
          tempoEntrega: data.tempo_entrega || "30-40",
          taxaEntrega:
            data.taxa_entrega !== undefined && data.taxa_entrega !== null
              ? Number(data.taxa_entrega)
              : 0,
          pedidoMinimo:
            data.pedido_minimo !== undefined && data.pedido_minimo !== null
              ? Number(data.pedido_minimo)
              : 0,
          banner:
            data.imagens?.capaUrl ||
            data.banner ||
            "https://images.unsplash.com/photo-1490818387583-1b5ba45227d8?q=80&w=1200",
          logo: data.imagens?.logoUrl || null,
        });
      }
    });

    // Listener em tempo real dos produtos — pausa e exclusão refletem imediatamente
    const qProd = query(
      collection(db, "produtos"),
      where("id_restaurante", "==", idRestaurante)
    );
    const unsubProd = onSnapshot(qProd, (snap) => {
      setCarregandoProdutos(false);
      setProdutos(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubRest();
      unsubProd();
    };
  }, [idRestaurante]);

  const abrirPratoModal = (prato) => {
    setPratoSelecionado(prato);
    setModalVisivel(true);
  };

  const fecharPratoModal = () => {
    setPratoSelecionado(null);
    setModalVisivel(false);
  };

  // 👉 ATUALIZADO: Agora recebe e repassa os adicionaisSelecionados para o Zustand
  const handleAdicionarItem = (prato, quantidade = 1, adicionaisSelecionados = []) => {
    adicionarItemAoCarrinho(prato, idRestaurante, quantidade, adicionaisSelecionados);
    fecharPratoModal();

    // 👉 NOVO: Ativa o Toast e programa para ele sumir em 3 segundos
    setToastVisivel(true);
    setTimeout(() => {
      setToastVisivel(false);
    }, 3000);
  };

  return {
    restaurante,
    produtos,
    lojaAberta,
    carregandoRestaurante,
    carregandoProdutos,
    pratoSelecionado,
    modalVisivel,
    abrirPratoModal,
    fecharPratoModal,
    handleAdicionarItem,
    minCal,
    setMinCal,
    maxCal,
    setMaxCal,
    toastVisivel,
  };
};