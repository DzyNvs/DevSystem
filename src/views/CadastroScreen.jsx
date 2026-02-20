import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuthController } from '../controllers/useAuthController';

export function CadastroScreen() {
  const ctrl = useAuthController();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#F3EBD3" barStyle="dark-content" />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        <View style={styles.navbar}>
          <Text style={styles.logoText}>FitWay</Text>
          <View style={styles.navbarRight}>
            <Text style={styles.navLink}>🏪 Sou restaurante</Text>
            <Text style={styles.navLink}>🛡️ Ambiente 100% seguro</Text>
          </View>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.tituloPrincipal}>Vamos começar?</Text>
          <Text style={styles.subtitulo}>Complete os dados e crie seu cadastro</Text>

          <View style={styles.switchContainer}>
            <Text style={!ctrl.isRestaurante ? styles.switchTextActive : styles.switchTextInactive}>Consumidor</Text>
            <Switch
              value={ctrl.isRestaurante}
              onValueChange={ctrl.setIsRestaurante}
              trackColor={{ false: "#e0e0e0", true: "#8CC63F" }}
              thumbColor={ctrl.isRestaurante ? "#FFFFFF" : "#f4f3f4"}
            />
            <Text style={ctrl.isRestaurante ? styles.switchTextActive : styles.switchTextInactive}>Restaurante</Text>
          </View>

          {ctrl.erro ? <Text style={styles.erroTexto}>{ctrl.erro}</Text> : null}

          {!ctrl.isRestaurante ? (
            <>
              <TextInput style={styles.inputModerno} value={ctrl.nome} onChangeText={ctrl.setNome} placeholder="Nome completo" placeholderTextColor="#A0A0A0"/>
              <TextInput style={styles.inputModerno} value={ctrl.email} onChangeText={ctrl.setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="E-mail" placeholderTextColor="#A0A0A0"/>
              <TextInput style={styles.inputModerno} value={ctrl.cpf} onChangeText={ctrl.setCpf} keyboardType="numeric" placeholder="CPF" placeholderTextColor="#A0A0A0"/>
              
              <View style={styles.rowContainer}>
                <TextInput style={[styles.inputModerno, styles.inputMetade, { marginRight: 10 }]} value={ctrl.telefone} onChangeText={ctrl.setTelefone} keyboardType="phone-pad" placeholder="Telefone" placeholderTextColor="#A0A0A0"/>
                <TextInput style={[styles.inputModerno, styles.inputMetade]} value={ctrl.dataNascimento} onChangeText={ctrl.setDataNascimento} placeholder="Data de nascimento" placeholderTextColor="#A0A0A0"/>
              </View>
            </>
          ) : (
            <>
              <TextInput style={styles.inputModerno} value={ctrl.nomeFantasia} onChangeText={ctrl.setNomeFantasia} placeholder="Nome Fantasia" placeholderTextColor="#A0A0A0"/>
              <TextInput style={styles.inputModerno} value={ctrl.razaoSocial} onChangeText={ctrl.setRazaoSocial} placeholder="Razão Social" placeholderTextColor="#A0A0A0"/>
              <TextInput style={styles.inputModerno} value={ctrl.cnpj} onChangeText={ctrl.setCnpj} keyboardType="numeric" placeholder="CNPJ" placeholderTextColor="#A0A0A0"/>
              <TextInput style={styles.inputModerno} value={ctrl.email} onChangeText={ctrl.setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="E-mail comercial" placeholderTextColor="#A0A0A0"/>
            </>
          )}

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
              <TouchableOpacity style={styles.botaoVerde} onPress={ctrl.handleCadastro}>
                <Text style={styles.textoBotaoVerde}>Cadastrar</Text>
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

          <TouchableOpacity onPress={ctrl.irParaLogin} style={styles.linkLoginContainer}>
            <Text style={styles.textoLinkLogin}>Já tem uma conta? <Text style={styles.textoLinkLoginBold}>Fazer login</Text></Text>
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
  formContainer: { padding: 30, backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, marginTop: -15 },
  tituloPrincipal: { fontSize: 32, fontWeight: '900', color: '#000000', textAlign: 'center', marginBottom: 10 },
  subtitulo: { fontSize: 16, color: '#666666', textAlign: 'center', marginBottom: 30 },
  switchContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  switchTextActive: { fontWeight: 'bold', marginHorizontal: 10, color: '#8CC63F' },
  switchTextInactive: { marginHorizontal: 10, color: '#A9A9A9' },
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
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  inputMetade: { flex: 1 },
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