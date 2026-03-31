import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getApiUrl = () => {
  // 1. Se for Web, é localhost e ponto final.
  if (Platform.OS === 'web') return 'http://localhost:3000';

  // 2. A MÁGICA: Pega o IP que o Expo Go está usando para se conectar ao PC
  const hostUri = Constants.expoConfig?.hostUri;
  
  if (hostUri) {
    // O hostUri vem num formato tipo "192.168.15.160:8081"
    // Nós cortamos no ":" e pegamos só a primeira parte (o IP) e botamos a porta 3000 do Node
    const ipDaMaquina = hostUri.split(':')[0];
    return `http://${ipDaMaquina}:3000`;
  }

  // 3. Fallback de emergência (só se der algum bug bizarro)
  return 'http://192.168.15.160:3000';
};

export const API_URL = getApiUrl();