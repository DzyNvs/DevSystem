import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { auth, db } from '../config/firebase'; // 👉 Importamos o auth e o db
import { doc, getDoc } from 'firebase/firestore';
import { LoginModel } from '../models/LoginModel';
import { PedidoModel } from '../models/PedidoModel';

export const useHomeRestauranteController = () => {
  const [resumo, setResumo] = useState({ totalPedidos: 0, totalVendas: 0 });
  const [carregandoResumo, setCarregandoResumo] = useState(true);

  useEffect(() => {
    carregarResumoDiario();
  }, []);

  const carregarResumoDiario = async () => {
    try {
      setCarregandoResumo(true);
      
      // 1. Descobre quem está logado
      const user = auth.currentUser;
      if (!user) {
        console.error("Nenhum usuário logado!");
        return;
      }

      // 2. Vai na tabela de restaurantes e pega o documento do usuário logado
      const docRef = doc(db, 'restaurantes', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const dadosRestaurante = docSnap.data();
        // 3. Puxa o ID personalizado correto (ex: rest_12345)
        const idRestauranteReal = dadosRestaurante.id_restaurante; 

        if (!idRestauranteReal) {
           console.error("Este usuário não tem um id_restaurante salvo no banco.");
           return;
        }

        // 4. Agora sim, busca os pedidos com o ID correto!
        const pedidos = await PedidoModel.buscarPedidosDoRestaurante(idRestauranteReal);

        const qtdPedidos = pedidos.length;
        const valorTotal = pedidos.reduce((acumulador, pedido) => {
          return acumulador + (pedido.total_final || 0);
        }, 0);

        setResumo({
          totalPedidos: qtdPedidos,
          totalVendas: valorTotal
        });
      }
    } catch (error) {
      console.error("Erro ao carregar resumo na home:", error);
    } finally {
      setCarregandoResumo(false);
    }
  };

  const handleLogoff = async () => {
    try {
      await LoginModel.sair();
      router.replace('/'); 
    } catch (error) {
      alert("Erro ao tentar sair da conta.");
    }
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
    carregandoResumo 
  };
};