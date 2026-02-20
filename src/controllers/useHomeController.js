import { router } from 'expo-router';
import { LoginModel } from '../models/LoginModel';

export const useHomeController = () => {
  const handleLogoff = async () => {
    try {
      await LoginModel.sair();
      // Ao deslogar, substitui a tela atual (replace) pela tela de Login '/'
      router.replace('/'); 
    } catch (error) {
      console.error("Erro ao deslogar:", error);
      alert("Erro ao tentar sair da conta.");
    }
  };

  return { handleLogoff };
};