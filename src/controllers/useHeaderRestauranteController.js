import { useState } from 'react';
import { router } from 'expo-router';

export const useHeaderRestauranteController = () => {
  // Removi o <string | null> daqui
  const [nomeUsuario, setNomeUsuario] = useState("João"); 
  const [carregando, setCarregando] = useState(false);
  
  const [servicos, setServicos] = useState([
    { id: '1', nome: 'FitWay Centro' },
    { id: '2', nome: 'FitWay Zona Sul' },
  ]);
  
  const [servicoAtivo, setServicoAtivo] = useState(servicos[0]);

  const handleEscolherServico = () => {
    const proximoServico = servicos.find(s => s.id !== servicoAtivo.id) || servicos[0];
    setServicoAtivo(proximoServico);
    alert(`Serviço alterado para: ${proximoServico.nome}`);
  };

  const handlePerfilClick = () => {
    router.push('/restaurante/perfil'); 
  };

  return { 
    nomeUsuario, 
    carregando, 
    servicoAtivo,
    handleEscolherServico,
    handlePerfilClick
  };
};