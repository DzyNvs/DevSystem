import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLoginController } from '../controllers/useLoginController';

// Imagens
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
  // Estado local para o botão "Sou restaurante" 
  const [highlightRestaurante, setHighlightRestaurante] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F2E3BB" barStyle="dark-content" />

      {/* Cabeçalho com botão "Sou restaurante" clicável */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
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
        </View>
      </View>

      {/* Conteúdo principal */}
      <View style={styles.mainContainer}>
        {/* Coluna formulário */}
        <View style={styles.leftColumn}>
          <View style={styles.formContainer}>
            <Text style={styles.tituloAcessar}>Acessar conta</Text>
            <Text style={styles.subtitulo}>Entre com seus dados para entrar em sua conta</Text>

            {ctrl.erro ? <Text style={styles.erroTexto}>{ctrl.erro}</Text> : null}

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={ctrl.email}
              onChangeText={ctrl.setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="seu@email.com"
              placeholderTextColor="#A0A0A0"
            />

            <Text style={styles.label}>Senha</Text>
            {/* Container do campo de senha com ícone */}
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

            <TouchableOpacity
              style={styles.esqueciSenha}
              onPress={() => router.push('/esqueci-senha')}>
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

            <TouchableOpacity style={styles.botaoSocialGoogle}>
              <Image source={google} style={styles.socialIcon} resizeMode="contain" />
              <Text style={styles.textoSocialGoogle}>Continuar com Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoSocialFacebook}>
              <Image source={facebook} style={styles.socialIcon} resizeMode="contain" />
              <Text style={styles.textoSocialFacebook}>Continuar com Facebook</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={ctrl.irParaCadastro} style={styles.cadastroLink}>
              <Text style={styles.cadastroTexto}>
                Não tem uma conta? <Text style={styles.cadastroTextoBold}>Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Coluna direita - imagem capa */}
        <View style={styles.rightColumn}>
          <Image source={capa} style={styles.capaImage} resizeMode="cover" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
  mainContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#FFFFFF',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
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