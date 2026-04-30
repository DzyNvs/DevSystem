import { router } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore'; 
import { useEffect, useState } from 'react';
import { Platform } from 'react-native'; 
import { auth, db } from '../config/firebase';
import { useCarrinhoStore } from './useCarrinhoStore';

export const useHeaderConsumidorController = () => {
  const [nomeUsuario, setNomeUsuario] = useState("Carregando...");
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Estados da Notificação do Consumidor
  const [temNotificacao, setTemNotificacao] = useState(false);
  const [alerta, setAlerta] = useState({ mostrar: false, titulo: '', mensagem: '' });

  const itens = useCarrinhoStore((state) => state.itens);
  const abrirDrawer = useCarrinhoStore((state) => state.abrirDrawer);

  const totalItens = itens.reduce((acc, item) => acc + item.qtd, 0);
  const valorTotal = itens.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  useEffect(() => {
    let unsubscribePedidos = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'consumidores', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().nome) {
            const nomeCompleto = docSnap.data().nome;
            const primeiroNome = nomeCompleto.split(' ')[0];
            setNomeUsuario(primeiroNome);
          } else {
            console.log("Documento não existe na coleção 'consumidores' ou não tem o campo 'nome'");
            setNomeUsuario("Visitante");
          }

          // OUVINTE DE STATUS DO PEDIDO PARA O CONSUMIDOR
          const q = query(
            collection(db, 'pedidos'),
            where('id_consumidor', '==', user.uid)
          );

          let initialLoad = true;

          unsubscribePedidos = onSnapshot(q, (snapshot) => {
            if (!initialLoad) {
              snapshot.docChanges().forEach((change) => {
                if (change.type === 'modified') {
                  const statusNovo = change.doc.data().status;
                  dispararNotificacaoAtualizacao(statusNovo);
                }
              });
            }
            initialLoad = false;
          });

        } catch (error) {
          console.error("Erro ao buscar nome do consumidor:", error);
          setNomeUsuario("Visitante");
        }
      } else {
        setNomeUsuario("Visitante");
        unsubscribePedidos();
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePedidos();
    };
  }, []);

  // Função que exibe o aviso bonito na tela dependendo do status
  const dispararNotificacaoAtualizacao = (status) => {
    const mensagens = {
      confirmado: { titulo: 'Pedido Aceito!', desc: 'O restaurante confirmou seu pedido e logo começará a prepará-lo.' },
      preparando: { titulo: 'Em Preparo!', desc: 'Seu pedido já está na cozinha sendo preparado com carinho.' },
      saiu_entrega: { titulo: 'Saiu para Entrega!', desc: 'O entregador já está a caminho do seu endereço!' },
      entregue: { titulo: 'Pedido Entregue!', desc: 'Bom apetite! Aproveite sua refeição.' },
      recusado: { titulo: 'Pedido Cancelado', desc: 'Infelizmente o restaurante não pôde aceitar seu pedido.' },
    };

    const msg = mensagens[status];
    if (!msg) return; // Se for um status não mapeado, ignora

    setTemNotificacao(true); // Acende a bolinha vermelha no menu
    setAlerta({ mostrar: true, titulo: msg.titulo, mensagem: msg.desc });

    // Toca o som de notificação se for no navegador
    try {
      if (Platform.OS === 'web') {
        const som = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3');
        som.play().catch(() => {});
      }
    } catch (e) {}

    // Esconde o cardzinho depois de 8 segundos
    setTimeout(() => {
      setAlerta(prev => ({ ...prev, mostrar: false }));
    }, 8000);
  };

  const fecharAlerta = () => setAlerta({ ...alerta, mostrar: false });

  const irParaCarrinho = () => {
    if (totalItens === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    abrirDrawer(); 
  };

  const irParaMeusPedidos = () => {
    setTemNotificacao(false); // Apaga a bolinha vermelha ao clicar
    setMenuAberto(false);
    fecharAlerta();
    router.push('/consumidor/meus-pedidos');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setMenuAberto(false);
      router.replace('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  return { 
    nomeUsuario, 
    totalItens, 
    valorTotal, 
    irParaCarrinho, 
    menuAberto, 
    setMenuAberto, 
    handleLogout,
    alerta,             
    fecharAlerta,       
    temNotificacao,     
    irParaMeusPedidos   
  };
};