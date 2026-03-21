import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const useHeaderConsumidorController = () => {
  const [nomeUsuario, setNomeUsuario] = useState("Carregando...");

  useEffect(() => {
    const carregarNomeUsuario = async () => {
      const user = auth.currentUser;
      
      if (user) {
        try {
          // Busca o documento deste consumidor específico
          const docRef = doc(db, 'consumidores', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists() && docSnap.data().nome) {
            // Pega o nome completo e separa só o primeiro nome
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

  return { nomeUsuario };
};