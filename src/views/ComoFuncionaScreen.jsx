import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HeaderConsumidor } from './HeaderConsumidor';

export function ComoFuncionaScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Cabeçalho */}
        <View style={styles.sectionBranca}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#93BD57" />
            <Text style={styles.btnVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
          
          <Text style={styles.superTitulo}>Como Funciona</Text>
          <Text style={styles.paragrafo}>
            O FitWay é um ecossistema desenvolvido para conectar dois pilares fundamentais: pessoas que buscam uma vida equilibrada e estabelecimentos que entregam comida de verdade. Nossa tecnologia serve como o elo de confiança entre a sua saúde e a sua próxima refeição.
          </Text>
        </View>

        {/* Lado do Consumidor */}
        <View style={styles.sectionCinza}>
          <Text style={styles.tituloSecundario}>Para quem consome</Text>
          <Text style={styles.paragrafo}>
            A experiência do usuário é baseada em transparência. Ao abrir o FitWay, você não encontra apenas um cardápio, mas uma seleção curada de pratos com informações claras sobre ingredientes e valores nutricionais.
          </Text>
          <Text style={styles.paragrafo}>
            O processo é simples: escolha o restaurante que se alinha aos seus objetivos, personalize seu pedido e acompanhe tudo em tempo real. Nossa plataforma garante que a praticidade de um delivery não comprometa a qualidade da sua dieta.
          </Text>
        </View>

        {/* Lado do Restaurante */}
        <View style={styles.sectionVerde}>
          <Text style={styles.tituloSecundario}>Para quem produz</Text>
          <Text style={styles.paragrafo}>
            Restaurantes parceiros encontram no FitWay um canal de vendas especializado em um público de alto valor. Oferecemos uma interface de gestão robusta, permitindo que o estabelecimento foque no que faz de melhor: cozinhar com excelência.
          </Text>
          <Text style={styles.paragrafo}>
            Através da nossa arquitetura MVC e integração com Firebase, o restaurante recebe e processa pedidos com precisão técnica, garantindo agilidade na cozinha e uma logística de entrega otimizada. É a tecnologia trabalhando para escalar o seu negócio de alimentação saudável.
          </Text>
        </View>

        {/* Rodapé Final */}
        <View style={styles.sectionBranca}>
          <View style={styles.divisor} />
          <Text style={styles.assinatura}>FitWay</Text>
          <Text style={styles.rodapeTexto}>Unindo saúde e tecnologia em cada pedido.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFF' },
  scrollView: { flex: 1 },
  sectionBranca: { padding: 32, backgroundColor: '#FFFFFF' },
  sectionCinza: {
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionVerde: { padding: 40, backgroundColor: '#F7FAF2' },
  btnVoltar: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  btnVoltarTexto: { fontSize: 16, color: '#93BD57', marginLeft: 8, fontWeight: '600' },
  superTitulo: { fontSize: 48, fontWeight: '800', color: '#93BD57', marginBottom: 24, letterSpacing: -1.5 },
  tituloSecundario: { fontSize: 32, fontWeight: '700', color: '#93BD57', marginBottom: 20 },
  paragrafo: { fontSize: 18, color: '#333', lineHeight: 30, marginBottom: 20, textAlign: 'left', maxWidth: 900 },
  divisor: { height: 1, backgroundColor: '#EEE', width: '100%', marginBottom: 24 },
  assinatura: { fontSize: 22, fontWeight: 'bold', color: '#93BD57' },
  rodapeTexto: { fontSize: 16, color: '#666', marginTop: 4 },
});
