import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HeaderConsumidor } from './HeaderConsumidor';

export function ContatosScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Seção Principal - Contatos Diretos */}
        <View style={styles.sectionBranca}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#93BD57" />
            <Text style={styles.btnVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
          
          <Text style={styles.superTitulo}>Contatos</Text>
          <Text style={styles.paragrafo}>
            Estamos à disposição para ouvir sugestões, dúvidas ou propostas de parceria. No FitWay, acreditamos que a comunicação direta é o que nos ajuda a evoluir a plataforma para atender melhor você.
          </Text>

          <View style={styles.infoDireta}>
            <Text style={styles.contatoItem}>Email: <Text style={styles.link}>contato@fitway.com.br</Text></Text>
            <Text style={styles.contatoItem}>Suporte: <Text style={styles.link}>0800 740 5050</Text></Text>
          </View>
        </View>

        {/* Seção Redes Sociais - Estilo Social Feed */}
        <View style={styles.sectionCinza}>
          <Text style={styles.tituloSecundario}>Acompanhe o FitWay</Text>
          <Text style={styles.paragrafo}>
            Nossas redes sociais são canais ativos de informação sobre nutrição, tecnologia e atualizações da nossa plataforma.
          </Text>

          <View style={styles.feedContainer}>
            
            {/* Post Instagram - Foco em Dica de Prato */}
            <View style={styles.socialCard}>
              <View style={styles.cardHeader}>
                <FontAwesome name="instagram" size={20} color="#E1306C" />
                <Text style={styles.perfilNome}>@fitway_oficial</Text>
              </View>
              
              <Image 
                source={require('../../assets/images/insta-post-prato.png')} 
                style={styles.fotoPost} 
                resizeMode="cover"
              />

              <Text style={styles.cardLegenda}>
                <Text style={styles.bold}>fitway_oficial</Text> A saúde começa nas escolhas que você faz hoje. Aprenda a montar o prato ideal! #FitWay #VidaSaudavel
              </Text>
            </View>

            {/* Post Facebook - Foco em Novo Parceiro */}
            <View style={styles.socialCard}>
              <View style={styles.cardHeader}>
                <FontAwesome name="facebook-square" size={20} color="#1877F2" />
                <Text style={styles.perfilNome}>FitWay Brasil</Text>
              </View>
              
              <Image 
                source={require('../../assets/images/fb-post-parceiro.png')} 
                style={styles.fotoPost} 
                resizeMode="cover"
              />

              <Text style={styles.cardLegenda}>
                <Text style={styles.bold}>Novo Parceiro!</Text> É com muita alegria que recebemos a Salada & Co. em nossa plataforma. Saúde em dobro para você! 🥑🏢
              </Text>
            </View>

            {/* Post Twitter (X) - Foco em Tech */}
            <View style={styles.socialCard}>
              <View style={styles.cardHeader}>
                <FontAwesome name="twitter" size={20} color="#1DA1F2" />
                <Text style={styles.perfilNome}>@fitway_tech</Text>
              </View>
              <div style={styles.tweetContent}>
                <Text style={styles.tweetTexto}>
                  Nossa arquitetura MVC acaba de receber uma atualização para melhorar em 20% o tempo de carregamento dos pedidos. Tecnologia focada no usuário! 🚀
                </Text>
              </div>
            </View>

          </View>
        </View>

        {/* Rodapé Final */}
        <View style={styles.sectionVerde}>
          <Text style={styles.tituloSecundario}>Fale com a Equipe</Text>
          <Text style={styles.paragrafo}>
            Para questões específicas sobre integração de sistemas, nossa equipe técnica está pronta para ajudar.
          </Text>
          <View style={styles.divisor} />
          <Text style={styles.assinatura}>FitWay</Text>
          <Text style={styles.rodapeTexto}>Conectando você ao seu melhor desempenho.</Text>
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
  paragrafo: { fontSize: 18, color: '#333', lineHeight: 30, marginBottom: 20, maxWidth: 900 },
  infoDireta: { marginTop: 10 },
  contatoItem: { fontSize: 18, color: '#444', marginBottom: 10, fontWeight: '500' },
  link: { color: '#93BD57', textDecorationLine: 'underline' },
  feedContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 25, marginTop: 20, justifyContent: 'flex-start' },
  socialCard: {
    backgroundColor: '#FFF',
    width: 320,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  perfilNome: { fontWeight: 'bold', color: '#333', fontSize: 14 },
  fotoPost: { width: '100%', height: 220, borderRadius: 10, marginBottom: 12 },
  cardLegenda: { fontSize: 14, color: '#444', lineHeight: 20 },
  bold: { fontWeight: 'bold' },
  tweetContent: { paddingVertical: 10 },
  tweetTexto: { fontSize: 16, color: '#1A1A1A', lineHeight: 24 },
  divisor: { height: 1, backgroundColor: '#EEE', width: '100%', marginVertical: 24 },
  assinatura: { fontSize: 24, fontWeight: 'bold', color: '#93BD57' },
  rodapeTexto: { fontSize: 16, color: '#777', marginTop: 4 },
});

