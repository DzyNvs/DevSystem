import { router } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'; // 👉 onSnapshot voltou
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { LoginModel } from '../models/LoginModel';
import { PedidoModel } from '../models/PedidoModel';

export const useHomeRestauranteController = () => {
  const [resumo, setResumo] = useState({ totalPedidos: 0, totalVendas: 0 });
  const [carregandoResumo, setCarregandoResumo] = useState(true);
  const [nomeRestaurante, setNomeRestaurante] = useState("");
  const [mediaAvaliacao, setMediaAvaliacao] = useState(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  
  // 👉 Estado para a bolinha vermelha do botão
  const [pedidosPendentes, setPedidosPendentes] = useState(0);

  useEffect(() => {
    let unsubscribe = () => {};

    const carregarDadosIniciais = async () => {
      try {
        setCarregandoResumo(true);
        const user = auth.currentUser;
        if (!user) return;

        const docRef = doc(db, 'restaurantes', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dadosRestaurante = docSnap.data();
          const idRestauranteReal = dadosRestaurante.id_restaurante; 
          
          if (dadosRestaurante.nomeFantasia) {
            setNomeRestaurante(dadosRestaurante.nomeFantasia);
          }

          // Lê a média de avaliação já calculada pelo AvaliacaoModel
          if (typeof dadosRestaurante.avaliacao === 'number') {
            setMediaAvaliacao(dadosRestaurante.avaliacao);
          }
          if (typeof dadosRestaurante.total_avaliacoes === 'number') {
            setTotalAvaliacoes(dadosRestaurante.total_avaliacoes);
          }

          if (!idRestauranteReal) return;

          // Busca o resumo de vendas
          const pedidos = await PedidoModel.buscarPedidosDoRestaurante(idRestauranteReal);
          const qtdPedidos = pedidos.length;
          const valorTotal = pedidos.reduce((acumulador, pedido) => acumulador + (pedido.total_final || 0), 0);

          setResumo({ totalPedidos: qtdPedidos, totalVendas: valorTotal });

          // 👉 Ouve os pedidos APENAS para atualizar o número da bolinha na tela Home (silencioso)
          const q = query(
            collection(db, 'pedidos'),
            where('id_restaurante', '==', idRestauranteReal),
            where('status', '==', 'pendente') 
          );

          unsubscribe = onSnapshot(q, (snapshot) => {
            setPedidosPendentes(snapshot.docs.length);
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados na home:", error);
      } finally {
        setCarregandoResumo(false);
      }
    };

    carregarDadosIniciais();
    
    return () => unsubscribe();
  }, []);

  const handleLogoff = async () => {
    try {
      await LoginModel.sair();
      router.replace('/'); 
    } catch (error) {}
  };

  const irParaCadastroRestaurante = () => router.push('/restaurante/perfil'); 
  const irParaPedidos = () => router.push('/restaurante/pedidos');
  const irParaNovoPrato = () => router.push('/restaurante/pratos');
  const irParaCardapio = () => router.push('/restaurante/cardapio');

  return { 
    handleLogoff, 
    irParaCadastroRestaurante, 
    irParaPedidos,
    irParaNovoPrato,
    irParaCardapio,
    resumo, 
    carregandoResumo,
    nomeRestaurante,
    pedidosPendentes,
    mediaAvaliacao,
    totalAvaliacoes,
  };
};