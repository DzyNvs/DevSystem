import { ActivityIndicator, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLoginController } from '../controllers/useLoginController';

export function LoginScreen() {
  const ctrl = useLoginController();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Login FitWay</Text>

      {/* Mensagem de Erro */}
      {ctrl.erro ? <Text style={styles.erro}>{ctrl.erro}</Text> : null}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={ctrl.email}
        onChangeText={ctrl.setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Senha</Text>
      <TextInput
        style={styles.input}
        value={ctrl.senha}
        onChangeText={ctrl.setSenha}
        secureTextEntry
      />

      <View style={styles.botaoContainer}>
        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button title="Entrar" onPress={ctrl.handleLogin} />
        )}
      </View>

      <View style={styles.espaco} />

      {/* Botão secundário para ir para o cadastro */}
      <Button 
        title="Não tem conta? Cadastre-se" 
        onPress={ctrl.irParaCadastro} 
        color="#888888" 
      />
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF'
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#000000'
  },
  label: {
    color: '#000000',
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 16
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    color: '#000000',
    backgroundColor: '#F9F9F9'
  },
  botaoContainer: {
    marginTop: 10
  },
  erro: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold'
  },
  espaco: {
    height: 20 // Apenas para dar um respiro entre os botões
  }
});