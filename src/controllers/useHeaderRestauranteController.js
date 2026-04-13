import { router } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, doc, getDoc, onSnapshot, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase';

export const useHeaderRestauranteController = () => {
  const [nomeRestaurante, setNomeRestaurante] = useState("Carregando...");
  
  // Controles de Menu
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacoesAbertas, setNotificacoesAbertas] = useState(false);
  
  // Controles de Pedidos e Alertas
  const [pedidosPendentes, setPedidosPendentes] = useState(0);
  const [mostrarAlertaPedido, setMostrarAlertaPedido] = useState(false);

  useEffect(() => {
    let unsubscribePedidos = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'restaurantes', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const dados = docSnap.data();
            setNomeRestaurante(dados.nome_fantasia || dados.nomeFantasia || "Meu Restaurante");
            
            const idRestauranteReal = dados.id_restaurante;

            // 👉 INICIA O OUVINTE NA HEADER PARA RODAR EM TODAS AS TELAS
            if (idRestauranteReal) {
              const q = query(
                collection(db, 'pedidos'),
                where('id_restaurante', '==', idRestauranteReal),
                where('status', '==', 'pendente') 
              );

              let initialLoad = true; 

              unsubscribePedidos = onSnapshot(q, (snapshot) => {
                setPedidosPendentes(snapshot.docs.length);

                if (!initialLoad) {
                  snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                      dispararAlertaInterno();
                    }
                  });
                }
                initialLoad = false;
              });
            }
          } else {
            setNomeRestaurante("Restaurante");
          }
        } catch (error) {
          console.error("Erro ao buscar nome do restaurante:", error);
          setNomeRestaurante("Restaurante");
        }
      } else {
        setNomeRestaurante("Visitante");
        unsubscribePedidos(); // Para de ouvir se deslogar
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePedidos();
    };
  }, []);

  const dispararAlertaInterno = () => {
    setMostrarAlertaPedido(true); 

    try {
      if (Platform.OS === 'web') {
        const somDeNotificacao = new Audio('https://www.soundjay.com/buttons/sounds/button-10.mp3'); 
        somDeNotificacao.play().catch(erro => console.log('Som bloqueado', erro));
      }
    } catch (e) {}

    setTimeout(() => {
      setMostrarAlertaPedido(false);
    }, 8000);
  };

  const fecharAlerta = () => setMostrarAlertaPedido(false);

  const irParaPedidos = () => {
    fecharAlerta();
    setNotificacoesAbertas(false);
    router.push('/restaurante/pedidos');
  };

  const toggleMenuPerfil = () => {
    setNotificacoesAbertas(false);
    setMenuAberto(!menuAberto);
  };

  const toggleNotificacoes = () => {
    setMenuAberto(false);
    setNotificacoesAbertas(!notificacoesAbertas);
  };

  const handlePerfilClick = () => {
    setMenuAberto(false);
    router.push('/restaurante/perfil'); 
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
    nomeRestaurante, 
    handlePerfilClick,
    menuAberto,
    toggleMenuPerfil,
    handleLogout,
    notificacoesAbertas,
    toggleNotificacoes,
    pedidosPendentes,
    mostrarAlertaPedido,
    fecharAlerta,
    irParaPedidos
  };
};