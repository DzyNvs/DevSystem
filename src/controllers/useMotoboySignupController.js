import { useState } from 'react';
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

export const useMotoboySignupController = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const cadastrarMotoboy = async (dados) => {
    setLoading(true);
    try {
      // 1. Cria o usuário no Auth
      const userCredential = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
      const user = userCredential.user;

      // 2. Atualiza o nome no perfil do Auth
      await updateProfile(user, { displayName: dados.nome });

      // 3. Salva os dados na coleção específica de entregadores
      await setDoc(doc(db, 'entregadores', user.uid), {
        nome: dados.nome,
        email: dados.email,
        cpf: dados.cpf,
        placa: dados.placa,
        tipo: 'motoboy', // Chave fundamental para o redirecionamento
        status_online: false,
        criadoEm: new Date()
      });

      alert("Cadastro realizado com sucesso! Boa jornada.");
      router.replace('/motoboy/home'); // Vai para a home do entregador
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return { cadastrarMotoboy, loading };
};