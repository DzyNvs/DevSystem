import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function Mapa({ localizacao }) {
  // 🛡️ Trava de segurança
  if (!localizacao || !localizacao.latitude) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#93BD57" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.mapa}
      initialRegion={localizacao}
      showsUserLocation={true}
    >
      <Marker
        coordinate={{ latitude: localizacao.latitude, longitude: localizacao.longitude }}
        title="Você está aqui"
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  mapa: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
});