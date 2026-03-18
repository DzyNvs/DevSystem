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
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [highlightRestaurante, setHighlightRestaurante] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
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
            <Text style={styles.subtitulo}>Entre com seus dados para entrar em sua conta</Text>

            {ctrl.erro ? <Text style={styles.erroTexto}>{ctrl.erro}</Text> : null}

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

            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                value={ctrl.senha}
                onChangeText={ctrl.setSenha}
                secureTextEntry={!mostrarSenha}
                placeholder="••••••••"
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

            <TouchableOpacity style={styles.esqueciSenha} onPress={() => router.push('/esqueci-senha')}>
              <Text style={styles.esqueciSenhaTexto}>Esqueceu sua senha?</Text>
            </TouchableOpacity>

            {ctrl.carregando ? (
              <ActivityIndicator size="large" color="#93BD57" style={styles.loader} />
            ) : (
              <TouchableOpacity style={styles.botaoEntrar} onPress={ctrl.handleLogin}>
                <Text style={styles.textoBotaoEntrar}>Entrar</Text>
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
    fontSize: 20,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 12,
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
    marginBottom: 4,
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#333',
  },
  eyeIconContainer: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  esqueciSenha: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  esqueciSenhaTexto: {
    color: '#93BD57',
    fontFamily: 'Nunito',
    fontSize: 13,
    fontWeight: '600',
  },
  loader: {
    marginVertical: 8,
  },
  botaoEntrar: {
    backgroundColor: '#93BD57',
    height: 44,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  textoBotaoEntrar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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
    height: 44,
    marginBottom: 6,
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
    height: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
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
    marginTop: 4,
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
    marginBottom: 8,
    fontWeight: 'bold',
    backgroundColor: '#f8d7da',
    padding: 6,
    borderRadius: 6,
  },
});