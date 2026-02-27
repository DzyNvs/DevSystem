import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useLoginController } from '../controllers/useLoginController';

// Importe as imagens (certifique-se de que os arquivos existem em assets/images/)
const logo = require('../../assets/images/logo.png');
const vector = require('../../assets/images/vector.png');
const store = require('../../assets/images/store.png');
const capa = require('../../assets/images/capa.png');
const google = require('../../assets/images/google.png');
const facebook = require('../../assets/images/facebook.png');

export function LoginScreen() {
  const ctrl = useLoginController();
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const { width } = useWindowDimensions();

  // Largura da metade esquerda (formulário) e direita (imagem)
  const halfWidth = width / 2;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F2E3BB" barStyle="dark-content" />

      {/* Cabeçalho fixo */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <View style={styles.rightItems}>
            <View style={styles.restauranteGroup}>
              <Image source={store} style={styles.storeIcon} resizeMode="contain" />
              <Text style={styles.restauranteText}>Sou restaurante</Text>
            </View>
            <View style={styles.ambienteGroup}>
              <Image source={vector} style={styles.vectorIcon} resizeMode="contain" />
              <Text style={styles.ambienteText}>Ambiente 100% seguro</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Conteúdo principal: duas colunas */}
      <View style={styles.mainContainer}>
        {/* Coluna esquerda: formulário */}
        <View style={[styles.leftColumn, { width: halfWidth }]}>
          <ScrollView 
            contentContainerStyle={styles.formScrollContainer}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formContent}>
              <Text style={styles.tituloAcessar}>Acessar conta</Text>
              <Text style={styles.subtituloDados}>Entre com seus dados para entrar em sua conta</Text>

              {ctrl.erro ? <Text style={styles.erroTexto}>{ctrl.erro}</Text> : null}

              {/* Campo E-mail */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  style={styles.input}
                  value={ctrl.email}
                  onChangeText={ctrl.setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="Digite seu e-mail"
                  placeholderTextColor="#A0A0A0"
                />
              </View>

              {/* Campo Senha */}
              <View style={styles.inputWrapper}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.inputPassword}
                    value={ctrl.senha}
                    onChangeText={ctrl.setSenha}
                    secureTextEntry={!mostrarSenha}
                    placeholder="Digite sua senha"
                    placeholderTextColor="#A0A0A0"
                  />
                  <TouchableOpacity
                    onPress={() => setMostrarSenha(!mostrarSenha)}
                    style={styles.eyeIconContainer}>
                    <Ionicons
                      name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color="#93BD57"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Link Esqueceu sua senha? */}
              <TouchableOpacity
                style={styles.esqueciSenhaContainer}
                onPress={() => router.push('/esqueci-senha')}>
                <Text style={styles.esqueciSenhaTexto}>Esqueceu sua senha?</Text>
              </TouchableOpacity>

              {/* Botão Entrar */}
              <View style={styles.botaoContainer}>
                {ctrl.carregando ? (
                  <ActivityIndicator size="large" color="#93BD57" />
                ) : (
                  <TouchableOpacity style={styles.botaoEntrar} onPress={ctrl.handleLogin}>
                    <Text style={styles.textoBotaoEntrar}>Entrar</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Divisor OU */}
              <View style={styles.divisorContainer}>
                <View style={styles.linhaDivisor} />
                <Text style={styles.textoDivisor}>OU</Text>
                <View style={styles.linhaDivisor} />
              </View>

              {/* Botão Google */}
              <TouchableOpacity style={styles.botaoSocial} onPress={() => {}}>
                <Image source={google} style={styles.socialIcon} resizeMode="contain" />
                <Text style={styles.textoSocialGoogle}>Continuar com Google</Text>
              </TouchableOpacity>

              {/* Botão Facebook */}
              <TouchableOpacity style={[styles.botaoSocial, styles.botaoFacebook]} onPress={() => {}}>
                <Image source={facebook} style={styles.socialIcon} resizeMode="contain" />
                <Text style={styles.textoSocialFacebook}>Continuar com Facebook</Text>
              </TouchableOpacity>

              {/* Link para cadastro */}
              <TouchableOpacity onPress={ctrl.irParaCadastro} style={styles.linkCadastroContainer}>
                <Text style={styles.textoLinkCadastro}>
                  Não tem uma conta? <Text style={styles.textoLinkCadastroBold}>Cadastre-se</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>

        {/* Coluna direita: imagem capa.png */}
        <View style={[styles.rightColumn, { width: halfWidth }]}>
          <Image source={capa} style={styles.capaImage} resizeMode="cover" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2E3BB', // cor de fundo do cabeçalho, mas o conteúdo tem fundo branco
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 120,
    backgroundColor: '#F2E3BB',
    paddingHorizontal: 70,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    width: 120,
    height: 60,
  },
  rightItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 60,
  },
  restauranteGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  restauranteText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '600',
    marginLeft: 8,
  },
  storeIcon: {
    width: 20,
    height: 20,
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
    width: 20,
    height: 20,
  },
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  leftColumn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 40, // espaçamento interno para não colar nas bordas
    justifyContent: 'center',
  },
  formScrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  formContent: {
    width: '100%',
    maxWidth: 587, // largura máxima do formulário conforme especificação
    alignSelf: 'center',
  },
  tituloAcessar: {
    color: '#2A2D34',
    textAlign: 'center',
    fontFamily: 'Inter',
    fontSize: 57,
    fontStyle: 'italic',
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -0.25,
    marginBottom: 45,
  },
  subtituloDados: {
    color: '#2A2D34',
    textAlign: 'center',
    fontFamily: 'Nunito',
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 45,
  },
  inputWrapper: {
    alignSelf: 'stretch',
    marginBottom: 45,
  },
  label: {
    color: '#2A2D34',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    outlineStyle: 'none',
    width: '100%',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    width: '100%',
  },
  inputPassword: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
    outlineStyle: 'none',
  },
  eyeIconContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  esqueciSenhaContainer: {
    alignSelf: 'flex-end',
    marginBottom: 45,
  },
  esqueciSenhaTexto: {
    color: '#93BD57',
    fontFamily: 'Nunito',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  botaoContainer: {
    marginBottom: 45,
    alignItems: 'center',
  },
  botaoEntrar: {
    width: 587,
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    backgroundColor: '#93BD57',
    shadowColor: '#93BD57',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  textoBotaoEntrar: {
    color: '#FFFFFF',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  divisorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 45,
    width: 587,
    alignSelf: 'center',
  },
  linhaDivisor: {
    flex: 1,
    height: 1,
    backgroundColor: '#A0A6B6',
  },
  textoDivisor: {
    color: '#A0A6B6',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
    marginHorizontal: 10,
  },
  botaoSocial: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 587,
    height: 48,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginBottom: 15,
    alignSelf: 'center',
  },
  botaoFacebook: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
    marginBottom: 45,
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  textoSocialGoogle: {
    color: 'rgba(0, 0, 0, 0.54)',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  textoSocialFacebook: {
    color: '#FFFFFF',
    fontFamily: 'Nunito',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  linkCadastroContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  textoLinkCadastro: {
    color: '#666666',
    fontFamily: 'Nunito',
    fontSize: 16,
  },
  textoLinkCadastroBold: {
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
    backgroundColor: '#F2E3BB', // cor de fallback caso a imagem não carregue
  },
  capaImage: {
    width: '100%',
    height: '100%',
  },
});