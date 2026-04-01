import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { auth } from '../config/firebase';
import { PerfilRestauranteModel } from '../models/PerfilRestauranteModel';

export const usePerfilRestauranteController = () => {
  const router = useRouter();

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [logo, setLogo] = useState(null);
  const [logoOriginal, setLogoOriginal] = useState(null);
  const [capa, setCapa] = useState(null);
  const [capaOriginal, setCapaOriginal] = useState(null);

  const [nomeFantasia, setNomeFantasia] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [endereco, setEndereco] = useState({
    cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: ''
  });
  const [coordenadas, setCoordenadas] = useState({ lat: null, lng: null });
  const [pagamentos, setPagamentos] = useState({
    pix: false, cartao_credito: false, cartao_debito: false,
    dinheiro: false, vale_refeicao: false, vale_alimentacao: false
  });
  const [horarios, setHorarios] = useState({
    segunda: { funciona: false, abertura: '08:00', fechamento: '18:00' },
    terca:   { funciona: false, abertura: '08:00', fechamento: '18:00' },
    quarta:  { funciona: false, abertura: '08:00', fechamento: '18:00' },
    quinta:  { funciona: false, abertura: '08:00', fechamento: '18:00' },
    sexta:   { funciona: false, abertura: '08:00', fechamento: '18:00' },
    sabado:  { funciona: false, abertura: '08:00', fechamento: '18:00' },
    domingo: { funciona: false, abertura: '08:00', fechamento: '18:00' },
  });

  const [buscandoCep, setBuscandoCep] = useState(false);
  const [erros, setErros] = useState({});

  const CATEGORIAS = [
    'Marmitas', 'Bowls', 'Saladas', 'Wraps', 'Poke',
    'Vegano', 'Bebidas', 'Açaí & Sorvetes', 'Doces & Bolos', 'Refeição Livre'
  ];

  // --- CARREGAR DADOS VIA MODEL ---
  useEffect(() => {
    const carregarDados = async () => {
      const usuario = auth.currentUser;
      if (!usuario) return;

      try {
        const d = await PerfilRestauranteModel.buscarPerfil(usuario.uid);

        if (d) {
          if (d.imagens?.logoUrl) { setLogo(d.imagens.logoUrl); setLogoOriginal(d.imagens.logoUrl); }
          if (d.imagens?.capaUrl) { setCapa(d.imagens.capaUrl); setCapaOriginal(d.imagens.capaUrl); }
          if (d.nome_fantasia) setNomeFantasia(d.nome_fantasia);
          if (d.especialidade) setEspecialidade(d.especialidade);
          if (d.endereco) setEndereco(prev => ({ ...prev, ...d.endereco }));
          if (d.coordenadas) setCoordenadas(d.coordenadas);
          if (d.pagamentos) setPagamentos(prev => ({ ...prev, ...d.pagamentos }));
          if (d.horarios) setHorarios(prev => ({ ...prev, ...d.horarios }));
        }
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  // --- HANDLERS ---
  const handleEnderecoChange = (campo, valor) => {
    let texto = valor;
    setErros(prev => ({ ...prev, [campo]: null }));

    if (campo === 'cep') {
      texto = texto.replace(/\D/g, '');
      if (texto.length > 5) texto = texto.replace(/^(\d{5})(\d)/, '$1-$2');
      if (texto.length > 9) texto = texto.slice(0, 9);
      setEndereco(prev => ({ ...prev, [campo]: texto }));

      const cepNumeros = texto.replace(/\D/g, '');
      if (cepNumeros.length === 8) {
        handleBuscarCep(cepNumeros);
      }
    } else {
      setEndereco(prev => ({ ...prev, [campo]: texto }));
    }
  };

  const handleBuscarCep = async (cepLimpo) => {
    setBuscandoCep(true);
    setErros(prev => ({ ...prev, cep: null }));

    const resultado = await PerfilRestauranteModel.buscarCEP(cepLimpo);

    if (resultado.erro) {
      setErros(prev => ({ ...prev, cep: resultado.erro }));
    } else {
      setEndereco(prev => ({
        ...prev,
        rua: resultado.logradouro || '',
        bairro: resultado.bairro || '',
        cidade: resultado.localidade || '',
        estado: resultado.uf || ''
      }));

      const coords = await PerfilRestauranteModel.buscarCoordenadas(resultado.logradouro, resultado.localidade, resultado.uf);
      if (coords) setCoordenadas(coords);
    }

    setBuscandoCep(false);
  };

  const togglePagamento = (chave) => {
    setErros(prev => ({ ...prev, pagamentos: null }));
    setPagamentos(prev => ({ ...prev, [chave]: !prev[chave] }));
  };

  const toggleDia = (dia) => {
    setErros(prev => ({ ...prev, horarios: null }));
    setHorarios(prev => ({ ...prev, [dia]: { ...prev[dia], funciona: !prev[dia].funciona } }));
  };

  const handleHoraChange = (dia, campo, valor) => {
    setErros(prev => ({ ...prev, horarios: null }));
    let formatado = valor.replace(/\D/g, '');
    if (formatado.length > 4) formatado = formatado.slice(0, 4);
    if (formatado.length > 2) formatado = formatado.replace(/^(\d{2})(\d)/, '$1:$2');
    setHorarios(prev => ({ ...prev, [dia]: { ...prev[dia], [campo]: formatado } }));
  };

  // --- VALIDAÇÃO ---
  const validarFormulario = () => {
    let novosErros = {};

    if (!logo) novosErros.logo = "A Logo é obrigatória.";
    if (!nomeFantasia.trim()) novosErros.nomeFantasia = "Informe o Nome Fantasia.";
    if (!especialidade) novosErros.especialidade = "Selecione uma especialidade.";
    if (!endereco.cep) novosErros.cep = "CEP é obrigatório.";
    if (!endereco.rua) novosErros.rua = "Rua é obrigatória.";
    if (!endereco.numero) novosErros.numero = "Número é obrigatório.";
    if (!endereco.bairro) novosErros.bairro = "Bairro é obrigatório.";
    if (!endereco.cidade) novosErros.cidade = "Cidade é obrigatória.";
    if (!endereco.estado) novosErros.estado = "UF é obrigatória.";

    const selecionouPagamento = Object.values(pagamentos).some(v => v);
    if (!selecionouPagamento) novosErros.pagamentos = "Selecione pelo menos uma forma de pagamento.";

    const diasAtivos = Object.keys(horarios).filter(dia => horarios[dia].funciona);
    if (diasAtivos.length === 0) {
      novosErros.horarios = "Selecione pelo menos um dia de funcionamento.";
    } else {
      for (let dia of diasAtivos) {
        if (horarios[dia].abertura.length < 5 || horarios[dia].fechamento.length < 5) {
          novosErros.horarios = "Preencha os horários corretamente (ex: 08:00).";
          break;
        }
      }
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  // --- SALVAR (UPDATE) VIA MODEL ---
  const handleSalvar = async () => {
    if (!validarFormulario()) return;

    const usuario = auth.currentUser;
    if (!usuario) {
      const msg = "Você precisa estar logado.";
      Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Erro", msg);
      return;
    }

    setSalvando(true);

    try {
      const plataforma = Platform.OS;

      let urlLogo = logo;
      if (logo !== logoOriginal) {
        urlLogo = await PerfilRestauranteModel.uploadParaCloudinary(logo, plataforma);
        if (!urlLogo) throw new Error("Falha no upload da Logo");
      }

      let urlCapa = capa;
      if (capa && capa !== capaOriginal) {
        urlCapa = await PerfilRestauranteModel.uploadParaCloudinary(capa, plataforma);
      }

      const dadosAtualizados = {
        imagens: { logoUrl: urlLogo, capaUrl: urlCapa || null },
        nome_fantasia: nomeFantasia,
        especialidade,
        endereco,
        coordenadas,
        pagamentos,
        horarios,
      };

      await PerfilRestauranteModel.atualizarPerfil(usuario.uid, dadosAtualizados);

      const msgSucesso = 'Perfil atualizado com sucesso!';
      Platform.OS === 'web' ? window.alert(msgSucesso) : Alert.alert('Sucesso!', msgSucesso);

    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      const msgErro = "Erro ao salvar as alterações. Tente novamente.";
      Platform.OS === 'web' ? window.alert(msgErro) : Alert.alert("Erro", msgErro);
    } finally {
      setSalvando(false);
    }
  };

  return {
    carregando, salvando, erros,
    logo, setLogo, capa, setCapa,
    nomeFantasia, setNomeFantasia,
    especialidade, setEspecialidade,
    endereco, coordenadas,
    pagamentos, horarios,
    buscandoCep,
    CATEGORIAS,
    handleEnderecoChange, togglePagamento, toggleDia, handleHoraChange,
    handleSalvar, setErros,
    voltar: () => router.back(),
  };
};