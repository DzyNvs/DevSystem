import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router'; // <-- ADICIONADO para navegar após o login
import React, { useEffect, useState } from 'react'; // <-- useEffect ADICIONADO
import {
  ActivityIndicator,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { useAuthController } from '../controllers/useAuthController';

// --- IMPORTAÇÕES DO FIREBASE E SOCIAL AUTH ---
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithCredential
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Removido o setDoc pois a gravação é feita na tela de completar
import { db } from '../config/firebase';

// Imagens
const logo = require('../../assets/images/logo.png');
const vector = require('../../assets/images/vector.png');
const store = require('../../assets/images/store.png');
const capa3 = require('../../assets/images/capa3.png');
const googleIcon = require('../../assets/images/google.png'); // Declarado para evitar erro
const facebookIcon = require('../../assets/images/facebook.png'); // Declarado para evitar erro

// Essencial para o navegador fechar após o login social
WebBrowser.maybeCompleteAuthSession();

export function CadastroScreen() {
  const ctrl = useAuthController();
  const router = useRouter(); // <-- ADICIONADO
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); 

  const { width } = useWindowDimensions(); // <-- ADICIONADO hook
  const isSmallScreen = width < 768; // <-- ADICIONADO breakpoint para mobile

  // --- LÓGICA DO GOOGLE ---
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '613129940263-4fru73eq4rs6coio3ano7gao3nn96ave.apps.googleusercontent.com',
    prompt: 'select_account', // <-- Força a tela de escolher a conta do Google
  });

  // --- LÓGICA DO FACEBOOK ---
  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: '1241106417521930',
  });

  // --- EFEITO GOOGLE: PROCURANDO NAS DUAS TABELAS ---
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(async (resultado) => {
          const user = resultado.user;
          
          // 1. Procura primeiro na tabela de Consumidores
          let userRef = doc(db, 'consumidores', user.uid);
          let userSnap = await getDoc(userRef);

          // 2. Se não achar nos consumidores, procura nos Restaurantes
          if (!userSnap.exists()) {
            userRef = doc(db, 'restaurantes', user.uid);
            userSnap = await getDoc(userRef);
          }

          if (!userSnap.exists()) {
            // NÃO ACHOU EM NENHUMA! É UM USUÁRIO 100% NOVO! 
            // Verifica o botão "Sou Restaurante" para mandar para a tela certa
            const telaDestino = ctrl.isRestaurante ? '/completar-cadastro-restaurante' : '/completar-cadastro';

            router.push({
              pathname: telaDestino,
              params: {
                uid: user.uid,
                nome: user.displayName || 'Usuário FitWay',
                email: user.email
              }
            });
          } else {
            // ACHOU EM ALGUMA DELAS! Lê os dados e manda para a Home certa.
            const dadosUsuario = userSnap.data();
            alert(`Bem-vindo de volta, ${user.displayName}! 🥗`);
            
            if (dadosUsuario.tipoConta === 'restaurante') {
              router.replace('/home-restaurante-screen');
            } else {
              router.replace('/home-consumidor-screen');
            }
          }
        })
        .catch((erro) => {
          console.error(erro);
          ctrl.setErro('Erro ao processar o cadastro com o Google.');
        });
    }
  }, [response]);

  // --- EFEITO FACEBOOK: PROCURANDO NAS DUAS TABELAS ---
  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      const auth = getAuth();
      const credential = FacebookAuthProvider.credential(access_token);

      signInWithCredential(auth, credential)
        .then(async (resultado) => {
          const user = resultado.user;
          
          // 1. Procura primeiro na tabela de Consumidores
          let userRef = doc(db, 'consumidores', user.uid);
          let userSnap = await getDoc(userRef);

          // 2. Se não achar nos consumidores, procura nos Restaurantes
          if (!userSnap.exists()) {
            userRef = doc(db, 'restaurantes', user.uid);
            userSnap = await getDoc(userRef);
          }

          if (!userSnap.exists()) {
            // NÃO ACHOU EM NENHUMA! É UM USUÁRIO 100% NOVO!
            // Verifica o botão "Sou Restaurante" para mandar para a tela certa
            const telaDestino = ctrl.isRestaurante ? '/completar-cadastro-restaurante' : '/completar-cadastro';

            router.push({
              pathname: telaDestino,
              params: {
                uid: user.uid,
                nome: user.displayName || 'Usuário FitWay',
                email: user.email
              }
            });
          } else {
            // ACHOU EM ALGUMA DELAS! Lê os dados e manda para a Home certa.
            const dadosUsuario = userSnap.data();
            alert(`Bem-vindo de volta, ${user.displayName}! 🥗`);
            
            if (dadosUsuario.tipoConta === 'restaurante') {
              router.replace('/home-restaurante-screen');
            } else {
              router.replace('/home-consumidor-screen');
            }
          }
        })
        .catch((erro) => {
          console.error(erro);
          ctrl.setErro('Erro ao processar o cadastro com o Facebook.');
        });
    }
  }, [fbResponse]);

  // Função para aplicar máscara de data (DD/MM/AAAA)
  const aplicarMascaraData = (texto) => {
    // Remove tudo que não for número
    const numeros = texto.replace(/\D/g, '');
    // Limita a 8 dígitos
    const numerosLimitados = numeros.slice(0, 8);

    // Aplica a máscara: DD/MM/AAAA
    let formatado = '';
    for (let i = 0; i < numerosLimitados.length; i++) {
      if (i === 2 || i === 4) {
        formatado += '/';
      }
      formatado += numerosLimitados[i];
    }
    return formatado;
  };

  const handleDataChange = (texto) => {
    const formatado = aplicarMascaraData(texto);
    ctrl.setDataNascimento(formatado);
  };

  // Formata data como DD/MM/AAAA a partir de um objeto Date
  const formatarDataParaString = (date) => {
    if (!date) return '';
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  // Converte string DD/MM/AAAA para Date
  const converterStringParaDate = (dataStr) => {
    if (!dataStr) return new Date();
    const partes = dataStr.split('/');
    if (partes.length === 3) {
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1;
      const ano = parseInt(partes[2], 10);
      // Valida se a data é válida
      if (!isNaN(dia) && !isNaN(mes) && !isNaN(ano)) {
        return new Date(ano, mes, dia);
      }
    }
    return new Date(); // fallback
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      ctrl.setDataNascimento(formatarDataParaString(selectedDate));
    }
  };

  // Alterna entre Consumidor e Restaurante ao clicar em "Sou restaurante"
  const alternarTipo = () => {
    ctrl.setIsRestaurante(!ctrl.isRestaurante);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F2E3BB" barStyle="dark-content" />

      {/* Cabeçalho com menu hamburger em mobile */}
      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <View style={styles.headerContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          
          {isSmallScreen ? (
            // Em telas pequenas, mostra o ícone do menu
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
              <Ionicons name="menu" size={30} color="#555" />
            </TouchableOpacity>
          ) : (
            // Em telas grandes, mostra os itens normalmente
            <View style={styles.rightItems}>
              {/* Grupo "Sou restaurante" clicável com cor de fundo quando ativo */}
              <TouchableOpacity
                style={[
                  styles.restauranteGroup,
                  ctrl.isRestaurante && styles.restauranteAtivo,
                ]}
                onPress={alternarTipo}
              >
                <Image source={store} style={styles.storeIcon} resizeMode="contain" />
                <Text
                  style={[
                    styles.restauranteText,
                    ctrl.isRestaurante && styles.restauranteTextAtivo,
                  ]}
                >
                  Sou restaurante
                </Text>
              </TouchableOpacity>
              {/* Grupo "Ambiente 100% seguro" estático */}
              <View style={styles.ambienteGroup}>
                <Image source={vector} style={styles.vectorIcon} resizeMode="contain" />
                <Text style={styles.ambienteText}>Ambiente 100% seguro</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Menu hamburger */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Opções</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={30} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Item "Sou restaurante" clicável */}
            <TouchableOpacity
              style={[
                styles.modalItem,
                ctrl.isRestaurante && styles.restauranteAtivo,
              ]}
              onPress={() => {
                alternarTipo();
                setMenuVisible(false);
              }}
            >
              <Image source={store} style={styles.storeIcon} resizeMode="contain" />
              <Text
                style={[
                  styles.modalItemText,
                  ctrl.isRestaurante && styles.restauranteTextAtivo,
                ]}
              >
                Sou restaurante
              </Text>
            </TouchableOpacity>

            {/* Item "Ambiente 100% seguro" informativo */}
            <View style={styles.modalItem}>
              <Image source={vector} style={styles.vectorIcon} resizeMode="contain" />
              <Text style={styles.modalItemText}>Ambiente 100% seguro</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Conteúdo principal */}
      <View style={styles.mainContainer}>
        {/* Coluna formulário */}
        <View style={styles.leftColumn}>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContainer}>
              <Text style={styles.titulo}>Vamos começar?</Text>
              <Text style={styles.subtitulo}>Complete os dados e crie seu cadastro</Text>

              {ctrl.erro ? <Text style={styles.erroTexto}>{ctrl.erro}</Text> : null}

              {/* Campos dinâmicos conforme o tipo */}
              {!ctrl.isRestaurante ? (
                // Modo Consumidor
                <>
                  <Text style={styles.label}>Nome completo</Text>
                  <TextInput
                    style={styles.input}
                    value={ctrl.nome}
                    onChangeText={ctrl.setNome}
                    placeholder="Nome completo"
                    placeholderTextColor="#A0A0A0"
                  />

                  <Text style={styles.label}>E-mail</Text>
                  <TextInput
                    style={styles.input}
                    value={ctrl.email}
                    onChangeText={ctrl.setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="E-mail"
                    placeholderTextColor="#A0A0A0"
                  />

                  <Text style={styles.label}>CPF</Text>
                  <TextInput
                    style={styles.input}
                    value={ctrl.cpf}
                    onChangeText={ctrl.setCpf}
                    keyboardType="numeric"
                    placeholder="CPF"
                    placeholderTextColor="#A0A0A0"
                  />

                  <View style={styles.rowContainer}>
                    <View style={styles.halfColumn}>
                      <Text style={styles.label}>Telefone</Text>
                      <TextInput
                        style={styles.input}
                        value={ctrl.telefone}
                        onChangeText={ctrl.setTelefone}
                        keyboardType="phone-pad"
                        placeholder="Telefone"
                        placeholderTextColor="#A0A0A0"
                      />
                    </View>
                    <View style={styles.halfColumn}>
                      <Text style={styles.label}>Data de nascimento</Text>
                      {/* Campo com input e ícone de calendário */}
                      <View style={styles.dateInputContainer}>
                        <TextInput
                          style={styles.dateInputText}
                          value={ctrl.dataNascimento}
                          onChangeText={handleDataChange}
                          placeholder="DD/MM/AAAA"
                          placeholderTextColor="#A0A0A0"
                          keyboardType="numeric"
                          maxLength={10} // DD/MM/AAAA 
                        />
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}
                          style={styles.dateIcon}
                        >
                          <Ionicons name="calendar-outline" size={22} color="#93BD57" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.label}>Senha</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.inputPassword}
                      value={ctrl.senha}
                      onChangeText={ctrl.setSenha}
                      secureTextEntry={!mostrarSenha}
                      placeholder="Senha"
                      placeholderTextColor="#A0A0A0"
                    />
                    <TouchableOpacity
                      onPress={() => setMostrarSenha(!mostrarSenha)}
                      style={styles.eyeIconContainer}
                    >
                      <Ionicons
                        name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#93BD57"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Modo Restaurante
                <>
                  <Text style={styles.label}>Nome Fantasia</Text>
                  <TextInput
                    style={styles.input}
                    value={ctrl.nomeFantasia}
                    onChangeText={ctrl.setNomeFantasia}
                    placeholder="Nome Fantasia"
                    placeholderTextColor="#A0A0A0"
                  />

                  <Text style={styles.label}>Razão Social</Text>
                  <TextInput
                    style={styles.input}
                    value={ctrl.razaoSocial}
                    onChangeText={ctrl.setRazaoSocial}
                    placeholder="Razão Social"
                    placeholderTextColor="#A0A0A0"
                  />

                  <Text style={styles.label}>CNPJ</Text>
                  <TextInput
                    style={styles.input}
                    value={ctrl.cnpj}
                    onChangeText={ctrl.setCnpj}
                    keyboardType="numeric"
                    placeholder="CNPJ"
                    placeholderTextColor="#A0A0A0"
                  />

                  <Text style={styles.label}>E-mail comercial</Text>
                  <TextInput
                    style={styles.input}
                    value={ctrl.email}
                    onChangeText={ctrl.setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholder="E-mail"
                    placeholderTextColor="#A0A0A0"
                  />

                  <Text style={styles.label}>Senha</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.inputPassword}
                      value={ctrl.senha}
                      onChangeText={ctrl.setSenha}
                      secureTextEntry={!mostrarSenha}
                      placeholder="Senha"
                      placeholderTextColor="#A0A0A0"
                    />
                    <TouchableOpacity
                      onPress={() => setMostrarSenha(!mostrarSenha)}
                      style={styles.eyeIconContainer}
                    >
                      <Ionicons
                        name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                        size={22}
                        color="#93BD57"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* Botão Cadastrar */}
              {ctrl.carregando ? (
                <ActivityIndicator size="large" color="#93BD57" style={styles.loader} />
              ) : (
                <TouchableOpacity style={styles.botaoCadastrar} onPress={ctrl.handleCadastro}>
                  <Text style={styles.textoBotaoCadastrar}>Cadastrar</Text>
                </TouchableOpacity>
              )}

              {/* Divisor OU */}
              <View style={styles.divisorContainer}>
                <View style={styles.linhaDivisor} />
                <Text style={styles.textoDivisor}>OU</Text>
                <View style={styles.linhaDivisor} />
              </View>

              {/* Botões sociais (ADICIONADO OS EVENTOS onPress E disabled) */}
              <TouchableOpacity
                style={styles.botaoSocialGoogle}
                onPress={() => promptAsync()}
                disabled={!request}
              >
                <Image source={googleIcon} style={styles.socialIcon} resizeMode="contain" />
                <Text style={styles.textoSocialGoogle}>Continuar com Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.botaoSocialFacebook}
                onPress={() => fbPromptAsync()}
                disabled={!fbRequest}
              >
                <Image source={facebookIcon} style={styles.socialIcon} resizeMode="contain" />
                <Text style={styles.textoSocialFacebook}>Continuar com Facebook</Text>
              </TouchableOpacity>

              {/* Link para login */}
              <TouchableOpacity onPress={ctrl.irParaLogin} style={styles.linkLoginContainer}>
                <Text style={styles.textoLinkLogin}>
                  Já tem uma conta? <Text style={styles.textoLinkLoginBold}>Fazer login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Coluna imagem - escondida em mobile */}
        {!isSmallScreen && (
          <View style={styles.rightColumn}>
            <Image source={capa3} style={styles.capaImage} resizeMode="cover" />
          </View>
        )}
      </View>

      {/* DatePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={converterStringParaDate(ctrl.dataNascimento)}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 75,
    backgroundColor: '#F2E3BB',
    paddingHorizontal: 40,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerSmall: {
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 110,
    height: 55,
  },
  menuButton: {
    padding: 5,
  },
  rightItems: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  restauranteGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  restauranteAtivo: {
    backgroundColor: '#93BD57',
  },
  restauranteText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginLeft: 8,
  },
  restauranteTextAtivo: {
    color: '#FFFFFF',
  },
  storeIcon: {
    width: 22,
    height: 22,
  },
  ambienteGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ambienteText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginLeft: 8,
  },
  vectorIcon: {
    width: 22,
    height: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F2E3BB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2A2D34',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  modalItemText: {
    fontSize: 16,
    color: '#555',
    marginLeft: 12,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 587,
    alignSelf: 'center',
  },
  titulo: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 57,
    fontStyle: 'italic',
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -0.25,
    marginBottom: 20,
  },
  subtitulo: {
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Nunito',
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 30,
  },
  label: {
    color: '#2A2D34',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#FAF8F3',
    borderRadius: 5,
    borderWidth: 0,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    width: '100%',
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 20,
  },
  halfColumn: {
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F3',
    borderRadius: 5,
    borderWidth: 0,
    width: '100%',
  },
  dateInputText: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  dateIcon: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF8F3',
    borderRadius: 5,
    width: '100%',
    marginBottom: 30,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeIconContainer: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginVertical: 20,
  },
  botaoCadastrar: {
    width: '100%',
    height: 48,
    backgroundColor: '#93BD57',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  textoBotaoCadastrar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    width: '100%',
  },
  linhaDivisor: {
    flex: 1,
    height: 1,
    backgroundColor: '#A0A6B6',
  },
  textoDivisor: {
    marginHorizontal: 16,
    color: '#A0A6B6',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '500',
  },
  botaoSocialGoogle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#A0A6B6',
    borderRadius: 5,
    height: 48,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  textoSocialGoogle: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  botaoSocialFacebook: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1877F2',
    borderRadius: 5,
    height: 48,
    marginBottom: 25,
    paddingHorizontal: 16,
  },
  textoSocialFacebook: {
    color: '#FFFFFF',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  linkLoginContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  textoLinkLogin: {
    color: '#000',
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 15,
  },
  textoLinkLoginBold: {
    fontWeight: 'bold',
    color: '#93BD57',
  },
  erroTexto: {
    color: '#d9534f',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 8,
  },
  rightColumn: {
    flex: 1,
    backgroundColor: '#F2E3BB',
  },
  capaImage: {
    width: '100%',
    height: '100%',
  },
});