import { Button, StyleSheet, Text, View } from 'react-native';
import { useHomeController } from '../controllers/useHomeController';

export function HomeRestauranteScreen() {
  const ctrl = useHomeController();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bem Vindo Restaurante</Text>
      
      <View style={styles.botaoContainer}>
        <Button title="Fazer Logoff" onPress={ctrl.handleLogoff} color="#ff4444" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#000000', marginBottom: 30 },
  botaoContainer: { width: '100%', paddingHorizontal: 40 }
});