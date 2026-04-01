import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';

export const useHeaderRestauranteController = () => {
  const [nomeRestaurante, setNomeRestaurante] = useState("Carregando...");
  const [menuAberto, setMenuAberto] = useState(false);

  useEffect(() => {
    const carregarNomeRestaurante = async () => {
      const user = auth.currentUser;
      
      if (user) {
        try {
          const docRef = doc(db, 'restaurantes', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const dados = docSnap.data();
            setNomeRestaurante(dados.nome_fantasia || "Meu Restaurante");
          }
        } catch (error) {
          console.error("Erro ao buscar nome do restaurante:", error);
          setNomeRestaurante("Restaurante");
        }
      } else {
        setNomeRestaurante("Visitante");
      }
    };

    carregarNomeRestaurante();
  }, []);

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
    setMenuAberto,
    handleLogout
  };
};