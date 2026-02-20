import React from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useAuthController } from '../controllers/useAuthController';

export function CadastroScreen() {
  const ctrl = useAuthController(); // Puxa toda a inteligência do Controller

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Cadastro FitWay</Text>

      {/* Switch: Consumidor vs Restaurante */}
      <View style={styles.switchContainer}>
        <Text style={!ctrl.isRestaurante ? styles.textoAtivo : styles.textoInativo}>Sou Consumidor</Text>
        <Switch
          value={ctrl.isRestaurante}
          onValueChange={ctrl.setIsRestaurante}
        />
        <Text style={ctrl.isRestaurante ? styles.textoAtivo : styles.textoInativo}>Sou Restaurante</Text>
      </View>

      {/* Mensagem de Erro (Se houver) */}
      {ctrl.erro ? <Text style={styles.erro}>{ctrl.erro}</Text> : null}

      {/* --- CAMPOS ESPECÍFICOS --- */}
      {!ctrl.isRestaurante ? (
        // FORMULÁRIO CONSUMIDOR
        <>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput style={styles.input} value={ctrl.nome} onChangeText={ctrl.setNome} />
          
          <Text style={styles.label}>CPF</Text>
          <TextInput style={styles.input} value={ctrl.cpf} onChangeText={ctrl.setCpf} keyboardType="numeric" />
          
          <Text style={styles.label}>Telefone</Text>
          <TextInput style={styles.input} value={ctrl.telefone} onChangeText={ctrl.setTelefone} keyboardType="phone-pad" />
          
          <Text style={styles.label}>Data de Nascimento</Text>
          <TextInput 
            style={styles.input} 
            value={ctrl.dataNascimento} 
            onChangeText={ctrl.setDataNascimento} 
            placeholder="DD/MM/AAAA" 
            placeholderTextColor="#999" // Cor do texto de dica
          />
        </>
      ) : (
        // FORMULÁRIO RESTAURANTE
        <>
          <Text style={styles.label}>Nome Fantasia</Text>
          <TextInput style={styles.input} value={ctrl.nomeFantasia} onChangeText={ctrl.setNomeFantasia} />
          
          <Text style={styles.label}>Razão Social</Text>
          <TextInput style={styles.input} value={ctrl.razaoSocial} onChangeText={ctrl.setRazaoSocial} />
          
          <Text style={styles.label}>CNPJ</Text>
          <TextInput style={styles.input} value={ctrl.cnpj} onChangeText={ctrl.setCnpj} keyboardType="numeric" />
        </>
      )}

      {/* --- CAMPOS COMUNS (Sempre aparecem) --- */}
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
        secureTextEntry // Esconde a senha com bolinhas
      />

      {/* Botão de Envio */}
      <View style={styles.botaoContainer}>
        {ctrl.carregando ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button title="Realizar Cadastro" onPress={ctrl.handleCadastro} />
        )}
      </View>
    </ScrollView>
  );
}

// Estilos Crus e Funcionais
const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    flexGrow: 1, 
    justifyContent: 'center',
    backgroundColor: '#FFFFFF' // <--- FORÇA O FUNDO BRANCO
  },
  titulo: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 20,
    color: '#000000' // <--- FORÇA O TÍTULO PRETO
  },
  label: {
    color: '#000000', // <--- FORÇA OS LABELS PRETOS
    marginBottom: 5,
    fontWeight: 'bold',
    fontSize: 16
  },
  switchContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20 
  },
  textoAtivo: { 
    fontWeight: 'bold', 
    marginHorizontal: 10, 
    color: '#000000' 
  },
  textoInativo: { 
    marginHorizontal: 10, 
    color: '#A9A9A9' 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ccc', 
    padding: 10, 
    marginBottom: 15, 
    borderRadius: 5,
    color: '#000000', // <--- GARANTE QUE O TEXTO DIGITADO SEJA PRETO
    backgroundColor: '#F9F9F9' // Fundo levemente cinza no input para destacar
  },
  botaoContainer: { 
    marginTop: 10 
  },
  erro: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: 15, 
    fontWeight: 'bold' 
  }
});