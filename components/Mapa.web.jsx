import { Dimensions, Text, View } from 'react-native';

export default function Mapa({ localizacao }) {
  if (!localizacao || !localizacao.latitude || !localizacao.longitude) {
    return (
      <View style={{ width: '100%', height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
        <Text style={{ color: '#666', fontSize: 16 }}>Aguardando sinal do GPS...</Text>
      </View>
    );
  }

  const apiKey = "AIzaSyAwE_WjnG8kjV0buRje-Pm9zRduMJjp5-I"; 
  const url = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${localizacao.latitude},${localizacao.longitude}&zoom=16`;

  return (
    <View style={{ width: '100%', height: Dimensions.get('window').height }}>
      <iframe
        title="Google Maps"
        src={url}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      />
    </View>
  );
}