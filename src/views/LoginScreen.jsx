import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLoginController } from '../controllers/useLoginController';

export function LoginScreen() {
  const ctrl = useLoginController();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F3EBD3" barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        <View style={styles.navbar}>
          <Text style={styles.logoText}>FitWay</Text>
          <View style={styles.navbarRight}>
            <Text style={styles.navLink}>🛡️ Ambiente 100% seguro</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.tituloPrincipal}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitulo}>Faça login para continuar</Text>

          {ctrl.erro ? <Text style={styles.erroTexto}>{ctrl.erro}</Text> : null}

          <TextInput 
            style={styles.inputModerno} 
            value={ctrl.email} 
            onChangeText={ctrl.setEmail} 
            keyboardType="email-address" 
            autoCapitalize="none"
            placeholder="E-mail"
            placeholderTextColor="#A0A0A0"
          />

          {/* --- CAMPO DE SENHA --- */}
          <View style={styles.passwordContainer}>
             <TextInput 
                style={styles.inputPassword} 
                value={ctrl.senha} 
                onChangeText={ctrl.setSenha} 
                secureTextEntry={!mostrarSenha}
                placeholder="Senha"
                placeholderTextColor="#A0A0A0"
              />
             <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeIconContainer}>
                <Ionicons name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'} size={22} color="#8CC63F" />
             </TouchableOpacity>
          </View>

          <View style={styles.botaoContainer}>
            {ctrl.carregando ? (
              <ActivityIndicator size="large" color="#8CC63F" />
            ) : (
              <TouchableOpacity style={styles.botaoVerde} onPress={ctrl.handleLogin}>
                <Text style={styles.textoBotaoVerde}>Entrar</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.divisorContainer}>
            <View style={styles.linhaDivisor} />
            <Text style={styles.textoDivisor}>ou</Text>
            <View style={styles.linhaDivisor} />
          </View>

          <View style={{ height: 100, justifyContent: 'center', alignItems: 'center', opacity: 0.3 }}>
             <Text>Botões Google/Facebook (Em breve)</Text>
          </View>

          <TouchableOpacity onPress={ctrl.irParaCadastro} style={styles.linkLoginContainer}>
            <Text style={styles.textoLinkLogin}>Não tem uma conta? <Text style={styles.textoLinkLoginBold}>Cadastre-se</Text></Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3EBD3', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContainer: { flexGrow: 1, backgroundColor: '#FFFFFF' },
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F3EBD3', paddingHorizontal: 20, paddingVertical: 15 },
  logoText: { fontSize: 24, fontWeight: 'bold', color: '#8CC63F' },
  navbarRight: { flexDirection: 'row', alignItems: 'center' },
  navLink: { fontSize: 12, marginLeft: 15, color: '#555', fontWeight: '600' },
  formContainer: { padding: 30, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -15, flex: 1 },
  tituloPrincipal: { fontSize: 32, fontWeight: '900', color: '#000000', textAlign: 'center', marginBottom: 10, marginTop: 20 },
  subtitulo: { fontSize: 16, color: '#666666', textAlign: 'center', marginBottom: 40 },
  inputModerno: { 
    backgroundColor: '#F8F9FA', 
    borderRadius: 12, 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    fontSize: 16, 
    color: '#333', 
    marginBottom: 15, 
    borderWidth: 0, 
    outlineStyle: 'none' // Remove a borda de foco preta na Web
  },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 12, marginBottom: 25 },
  inputPassword: { 
    flex: 1, 
    paddingVertical: 15, 
    paddingHorizontal: 20, 
    fontSize: 16, 
    color: '#333',
    outlineStyle: 'none' // Remove a borda de foco preta na Web
  },
  eyeIconContainer: { padding: 15, justifyContent: 'center', alignItems: 'center' }, 
  botaoContainer: { marginTop: 10 },
  botaoVerde: { backgroundColor: '#8CC63F', paddingVertical: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#8CC63F', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  textoBotaoVerde: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  divisorContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  linhaDivisor: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
  textoDivisor: { marginHorizontal: 15, color: '#A0A0A0' },
  linkLoginContainer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  textoLinkLogin: { color: '#666666', fontSize: 16 },
  textoLinkLoginBold: { fontWeight: 'bold', color: '#8CC63F' },
  erroTexto: { color: '#d9534f', textAlign: 'center', marginBottom: 15, fontWeight: 'bold', backgroundColor: '#f8d7da', padding: 10, borderRadius: 8 }
});