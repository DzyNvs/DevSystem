import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { useCarrinhoStore } from './useCarrinhoStore';

export const useHeaderConsumidorController = () => {
  const [nomeUsuario, setNomeUsuario] = useState("Carregando...");
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Puxa a lista de itens direto da memória global (sem precisar de Provider)
  const itens = useCarrinhoStore((state) => state.itens);

  // Calcula os totais em tempo real
  const totalItens = itens.reduce((acc, item) => acc + item.qtd, 0);
  const valorTotal = itens.reduce((acc, item) => acc + (item.preco * item.qtd), 0);

  useEffect(() => {
    const carregarNomeUsuario = async () => {
      const user = auth.currentUser;
      
      if (user) {
        try {
          const docRef = doc(db, 'consumidores', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().nome) {
            const nomeCompleto = docSnap.data().nome;
            const primeiroNome = nomeCompleto.split(' ')[0];
            setNomeUsuario(primeiroNome);
          } else {
            setNomeUsuario("Visitante");
          }
        } catch (error) {
          console.error("Erro ao buscar nome do consumidor:", error);
          setNomeUsuario("Visitante");
        }
      } else {
        setNomeUsuario("Visitante");
      }
    };

    carregarNomeUsuario();
  }, []);

  const irParaCarrinho = () => {
    if (totalItens === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    router.push('/consumidor/carrinho'); 
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

  return { nomeUsuario, totalItens, valorTotal, irParaCarrinho, menuAberto, setMenuAberto, handleLogout };
};