import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useHeaderRestauranteController = () => {
  const [nomeRestaurante, setNomeRestaurante] = useState("Carregando..."); 

  useEffect(() => {
    // Função para buscar o nome de quem logou
    const carregarNomeRestaurante = async () => {
      const user = auth.currentUser;
      
      if (user) {
        try {
          // Busca o documento deste restaurante específico no Firebase
          const docRef = doc(db, 'restaurantes', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const dados = docSnap.data();
            // Pega o nome fantasia (ou "Meu Restaurante" caso esteja vazio)
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
    router.push('/restaurante/perfil'); 
  };

  return { 
    nomeRestaurante, 
    handlePerfilClick
  };
};