import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useLoginController } from '../controllers/useLoginController';

import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAuth,
  signInWithCredential
} from 'firebase/auth';

import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

const logo = require('../../assets/images/logo.png');
const vector = require('../../assets/images/vector.png');
const store = require('../../assets/images/store.png');
const capa = require('../../assets/images/capa.png');
const google = require('../../assets/images/google.png');
const facebook = require('../../assets/images/facebook.png');

WebBrowser.maybeCompleteAuthSession();

export function LoginScreen() {
  const ctrl = useLoginController();
  const router = useRouter();
  
  const [highlightRestaurante, setHighlightRestaurante] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  // --- AQUI ESTÁ A ALTERAÇÃO DO GOOGLE ---
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    webClientId: '613129940263-4fru73eq4rs6coio3ano7gao3nn96ave.apps.googleusercontent.com',
    clientId: '613129940263-4fru73eq4rs6coio3ano7gao3nn96ave.apps.googleusercontent.com',
    prompt: 'select_account',
  });

  const [fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: '1241106417521930',
  });

  // --- LOGIN COM GOOGLE ---
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const auth = getAuth();
      const credential = GoogleAuthProvider.credential(id_token);

      signInWithCredential(auth, credential)
        .then(async (resultado) => {
          const user = resultado.user;
          
          let userRef = doc(db, 'consumidores', user.uid);
          let userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            userRef = doc(db, 'restaurantes', user.uid);
            userSnap = await getDoc(userRef);
          }

          if (userSnap.exists()) {
            const dadosUsuario = userSnap.data();
            alert(`Bem-vindo de volta, ${resultado.user.displayName}! 🥗`);

            // NOVA REGRA AQUI (GOOGLE)
            if (dadosUsuario.tipoConta === 'restaurante') {
              if (dadosUsuario.onboardingConcluido || (dadosUsuario.endereco && dadosUsuario.endereco.rua)) {
                router.replace('/home-restaurante-screen');
              } else {
                router.replace('/onboarding-restaurante');
              }
            } else {
              router.replace('/home-consumidor-screen');
            }

          } else {
            const telaDestino = highlightRestaurante ? '/completar-cadastro-restaurante' : '/completar-cadastro';
            
            router.push({
              pathname: telaDestino,
              params: { uid: user.uid, nome: user.displayName, email: user.email }
            });
          }
        })
        .catch((erro) => {
          console.error(erro);
          ctrl.setErro('Erro ao entrar com o Google.');
        });
    }
  }, [response]);

  // --- LOGIN COM FACEBOOK ---
  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const { access_token } = fbResponse.params;
      const auth = getAuth();
      const credential = FacebookAuthProvider.credential(access_token);

      signInWithCredential(auth, credential)
        .then(async (resultado) => {
          const user = resultado.user;
          
          let userRef = doc(db, 'consumidores', user.uid);
          let userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            userRef = doc(db, 'restaurantes', user.uid);
            userSnap = await getDoc(userRef);
          }

          if (userSnap.exists()) {
            const dadosUsuario = userSnap.data();
            alert(`Bem-vindo de volta, ${resultado.user.displayName}! 🥗`);

            // NOVA REGRA AQUI (FACEBOOK)
            if (dadosUsuario.tipoConta === 'restaurante') {
              if (dadosUsuario.onboardingConcluido || (dadosUsuario.endereco && dadosUsuario.endereco.rua)) {
                router.replace('/home-restaurante-screen');
              } else {
                router.replace('/onboarding-restaurante');
              }
            } else {
              router.replace('/home-consumidor-screen');
            }

          } else {
            const telaDestino = highlightRestaurante ? '/completar-cadastro-restaurante' : '/completar-cadastro';
            
            router.push({
              pathname: telaDestino,
              params: { uid: user.uid, nome: user.displayName, email: user.email }
            });
          }
        })
        .catch((erro) => {
          console.error(erro);
          ctrl.setErro('Erro ao entrar com o Facebook.');
        });
    }
  }, [fbResponse]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F2E3BB" barStyle="dark-content" />

      <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
        <View style={styles.headerContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          
          {isSmallScreen ? (
            <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
              <Ionicons name="menu" size={30} color="#555" />
            </TouchableOpacity>
          ) : (
            <View style={styles.rightItems}>
              <TouchableOpacity
                style={[
                  styles.restauranteGroup,
                  highlightRestaurante && styles.restauranteAtivo,
                ]}
                onPress={() => setHighlightRestaurante(!highlightRestaurante)}
              >
                <Image source={store} style={styles.storeIcon} resizeMode="contain" />
                <Text
                  style={[
                    styles.restauranteText,
                    highlightRestaurante && styles.restauranteTextAtivo,
                  ]}
                >
                  Sou restaurante
                </Text>
              </TouchableOpacity>
              <View style={styles.ambienteGroup}>
                <Image source={vector} style={styles.vectorIcon} resizeMode="contain" />
                <Text style={styles.ambienteText}>Ambiente 100% seguro</Text>
              </View>
            </View>
          )}
        </View>
      </View>

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

            <TouchableOpacity
              style={[
                styles.modalItem,
                highlightRestaurante && styles.restauranteAtivo,
              ]}
              onPress={() => {
                setHighlightRestaurante(!highlightRestaurante);
                setMenuVisible(false);
              }}
            >
              <Image source={store} style={styles.storeIcon} resizeMode="contain" />
              <Text
                style={[
                  styles.modalItemText,
                  highlightRestaurante && styles.restauranteTextAtivo,
                ]}
              >
                Sou restaurante
              </Text>
            </TouchableOpacity>

            <View style={styles.modalItem}>
              <Image source={vector} style={styles.vectorIcon} resizeMode="contain" />
              <Text style={styles.modalItemText}>Ambiente 100% seguro</Text>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.mainContainer}>
        <ScrollView
          contentContainerStyle={[
            styles.leftColumn,
            isSmallScreen && styles.leftColumnFull,
            { flexGrow: 1, justifyContent: 'center' }
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.tituloAcessar}>Acessar conta</Text>
            
            {/* --- TEXTOS DINÂMICOS BASEADOS NA ETAPA --- */}
            {ctrl.etapa === 'email' ? (
              <Text style={styles.subtitulo}>Entre com seu e-mail ou telefone para receber um código de acesso seguro</Text>
            ) : (
              <Text style={styles.subtitulo}>Insira o código de 6 dígitos que enviamos para o seu e-mail</Text>
            )}

            {ctrl.erro ? <Text style={styles.erroTexto}>{ctrl.erro}</Text> : null}

            {/* --- FORMULÁRIO DINÂMICO --- */}
            {ctrl.etapa === 'email' ? (
              <>
                <Text style={styles.label}>E-mail ou Telefone</Text>
                <TextInput
                  style={styles.input}
                  value={ctrl.identificador}
                  onChangeText={ctrl.setIdentificador}
                  keyboardType="default" 
                  autoCapitalize="none"
                  placeholder="seu@email.com ou (11) 99999-9999"
                  placeholderTextColor="#A0A0A0"
                />

                {ctrl.carregando ? (
                  <ActivityIndicator size="large" color="#93BD57" style={styles.loader} />
                ) : (
                  <TouchableOpacity style={styles.botaoEntrar} onPress={ctrl.handleSolicitarCodigo}>
                    <Text style={styles.textoBotaoEntrar}>Receber Código de Acesso</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.divisorContainer}>
                  <View style={styles.linhaDivisor} />
                  <Text style={styles.textoDivisor}>OU</Text>
                  <View style={styles.linhaDivisor} />
                </View>

                <TouchableOpacity 
                  style={styles.botaoSocialGoogle} 
                  onPress={() => promptAsync()}
                  disabled={!request}
                >
                  <Image source={google} style={styles.socialIcon} resizeMode="contain" />
                  <Text style={styles.textoSocialGoogle}>Continuar com Google</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.botaoSocialFacebook}
                  onPress={() => fbPromptAsync()}
                  disabled={!fbRequest}
                >
                  <Image source={facebook} style={styles.socialIcon} resizeMode="contain" />
                  <Text style={styles.textoSocialFacebook}>Continuar com Facebook</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={ctrl.irParaCadastro} style={styles.cadastroLink}>
                  <Text style={styles.cadastroTexto}>
                    Não tem uma conta? <Text style={styles.cadastroTextoBold}>Cadastre-se</Text>
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.label}>Código de 6 dígitos</Text>
                <TextInput
                  style={styles.inputCodigo}
                  value={ctrl.codigo}
                  onChangeText={ctrl.setCodigo}
                  keyboardType="numeric"
                  maxLength={6}
                  placeholder="000000"
                  placeholderTextColor="#A0A0A0"
                />

                {ctrl.carregando ? (
                  <ActivityIndicator size="large" color="#93BD57" style={styles.loader} />
                ) : (
                  <TouchableOpacity style={styles.botaoEntrar} onPress={ctrl.handleLogin}>
                    <Text style={styles.textoBotaoEntrar}>Entrar no Aplicativo</Text>
                  </TouchableOpacity>
                )}

                {/* BOTÃO VOLTAR PARA A ETAPA DE EMAIL */}
                <TouchableOpacity style={styles.botaoVoltarEtapa} onPress={() => ctrl.setEtapa('email')}>
                  <Text style={styles.textoBotaoVoltarEtapa}>Usar outro e-mail ou telefone</Text>
                </TouchableOpacity>
              </>
            )}
            
          </View>
        </ScrollView>

        {!isSmallScreen && (
          <View style={styles.rightColumn}>
            <Image source={capa} style={styles.capaImage} resizeMode="cover" />
          </View>
        )}
      </View>
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
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  leftColumnFull: {
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  tituloAcessar: {
    color: '#2A2D34',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 44,
    fontStyle: 'italic',
    fontWeight: '800',
    lineHeight: 50,
    letterSpacing: -0.25,
    marginBottom: 4,
  },
  subtitulo: {
    color: '#2A2D34',
    textAlign: 'center',
    fontFamily: 'Nunito',
    fontSize: 18,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 20,
  },
  label: {
    color: '#2A2D34',
    fontFamily: 'Nunito',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 2,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    marginBottom: 15,
  },
  inputCodigo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingVertical: 15,
    fontSize: 28,
    letterSpacing: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    marginBottom: 20,
  },
  loader: {
    marginVertical: 8,
  },
  botaoEntrar: {
    backgroundColor: '#93BD57',
    height: 48,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 5,
  },
  textoBotaoEntrar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoVoltarEtapa: {
    alignItems: 'center',
    marginTop: 15,
    padding: 10,
  },
  textoBotaoVoltarEtapa: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  divisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  linhaDivisor: {
    flex: 1,
    height: 1,
    backgroundColor: '#A0A6B6',
  },
  textoDivisor: {
    marginHorizontal: 12,
    color: '#A0A6B6',
    fontFamily: 'Nunito',
    fontSize: 14,
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
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  textoSocialGoogle: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontFamily: 'Nunito',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
  },
  botaoSocialFacebook: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1877F2',
    borderRadius: 5,
    height: 48,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  textoSocialFacebook: {
    color: '#FFFFFF',
    fontFamily: 'Nunito',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
  },
  socialIcon: {
    width: 22,
    height: 22,
  },
  cadastroLink: {
    alignItems: 'center',
    marginTop: 5,
    padding: 10,
  },
  cadastroTexto: {
    color: '#666666',
    fontSize: 15,
  },
  cadastroTextoBold: {
    fontWeight: 'bold',
    color: '#93BD57',
  },
  rightColumn: {
    flex: 1,
    backgroundColor: '#F2E3BB',
  },
  capaImage: {
    width: '100%',
    height: '100%',
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
});