import { router } from 'expo-router';
import { collection, doc, getDoc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { LoginModel } from '../models/LoginModel';
import { PedidoModel } from '../models/PedidoModel';

const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

const calcularStatusAutomatico = (horarios) => {
  if (!horarios) return false;
  const agora = new Date();
  const dia = diasSemana[agora.getDay()];
  const horario = horarios[dia];
  if (!horario || !horario.funciona) return false;
  const minAtual = agora.getHours() * 60 + agora.getMinutes();
  const [hhAb, mmAb] = (horario.abertura || '00:00').split(':').map(Number);
  const [hhFe, mmFe] = (horario.fechamento || '23:59').split(':').map(Number);
  const minAb = hhAb * 60 + mmAb;
  const minFe = hhFe * 60 + mmFe;
  // Suporte a overnight (ex: 22:00 - 02:00)
  if (minFe <= minAb) return minAtual >= minAb || minAtual < minFe;
  return minAtual >= minAb && minAtual < minFe;
};

export const useHomeRestauranteController = () => {
  const [resumo, setResumo] = useState({ totalPedidos: 0, totalVendas: 0 });
  const [carregandoResumo, setCarregandoResumo] = useState(true);
  const [nomeRestaurante, setNomeRestaurante] = useState("");
  const [mediaAvaliacao, setMediaAvaliacao] = useState(null);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);
  const [lojaAberta, setLojaAberta] = useState(false);
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

          if (typeof dadosRestaurante.avaliacao === 'number') {
            setMediaAvaliacao(dadosRestaurante.avaliacao);
          }
          if (typeof dadosRestaurante.total_avaliacoes === 'number') {
            setTotalAvaliacoes(dadosRestaurante.total_avaliacoes);
          }

          // Calcula o status automático com base nos horários configurados e
          // salva no Firestore para que o consumidor veja em tempo real.
          const statusAuto = calcularStatusAutomatico(dadosRestaurante.horarios);
          setLojaAberta(statusAuto);
          await updateDoc(docRef, { loja_aberta: statusAuto });

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

  // Fechamento/abertura manual: persiste no Firestore para refletir ao consumidor.
  const toggleLojaAberta = async (novoValor) => {
    setLojaAberta(novoValor);
    try {
      const user = auth.currentUser;
      if (!user) return;
      await updateDoc(doc(db, 'restaurantes', user.uid), { loja_aberta: novoValor });
    } catch (error) {
      console.error("Erro ao atualizar status da loja:", error);
    }
  };

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
    lojaAberta,
    toggleLojaAberta,
  };
};