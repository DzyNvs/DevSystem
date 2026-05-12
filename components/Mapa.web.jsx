import { useEffect, useRef } from 'react';
import { Dimensions, View } from 'react-native';

const API_KEY = 'AIzaSyAwE_WjnG8kjV0buRje-Pm9zRduMJjp5-I';

/**
 * Componente de mapa para Web.
 * Usa a Maps JavaScript API (não o iframe Embed) para ter suporte
 * a marcador arrastável e retorno de coordenadas.
 *
 * Props:
 *  - localizacao: { latitude, longitude }
 *  - onLocationChange(lat, lng): chamado quando o usuário move o pin.
 */
export default function Mapa({ localizacao, onLocationChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  // Injeta o script da Maps JavaScript API apenas uma vez
  useEffect(() => {
    if (scriptLoadedRef.current || typeof window === 'undefined') return;
    if (document.getElementById('google-maps-script')) {
      scriptLoadedRef.current = true;
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&language=pt-BR&region=BR`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoadedRef.current = true;
      initMap();
    };
    document.head.appendChild(script);
  }, []);

  // Inicializa o mapa assim que o script carrega e o container está no DOM
  const initMap = () => {
    if (!mapContainerRef.current || !window.google) return;

    const center = {
      lat: localizacao?.latitude ?? -23.5505,
      lng: localizacao?.longitude ?? -46.6333,
    };

    const map = new window.google.maps.Map(mapContainerRef.current, {
      center,
      zoom: 16,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
      ],
    });

    const marker = new window.google.maps.Marker({
      position: center,
      map,
      title: 'Local de entrega',
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#93BD57',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 14,
      },
    });

    // Arrastar o pin
    marker.addListener('dragend', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      onLocationChange?.(lat, lng);
    });

    // Clicar no mapa move o pin
    map.addListener('click', (e) => {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      marker.setPosition({ lat, lng });
      map.panTo({ lat, lng });
      onLocationChange?.(lat, lng);
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  };

  // Sincroniza o mapa quando a prop localizacao muda externamente (GPS inicial)
  useEffect(() => {
    if (!localizacao?.latitude || !localizacao?.longitude) return;

    const lat = localizacao.latitude;
    const lng = localizacao.longitude;

    if (mapInstanceRef.current && markerRef.current) {
      const pos = { lat, lng };
      mapInstanceRef.current.panTo(pos);
      markerRef.current.setPosition(pos);
      return;
    }

    // Script ainda carregando: tenta inicializar quando o window.google estiver pronto
    if (scriptLoadedRef.current && window.google) {
      initMap();
    }
  }, [localizacao]);

  const height = Dimensions.get('window').height;

  if (!localizacao || !localizacao.latitude) {
    return (
      <View
        style={{
          width: '100%',
          height,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        {/* Placeholder enquanto o GPS é obtido */}
        <div style={{ color: '#888', fontSize: 15 }}>Aguardando sinal do GPS...</div>
      </View>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height }}
    />
  );
}
