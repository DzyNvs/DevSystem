import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { HeaderConsumidor } from './HeaderConsumidor';

export function SobreNosScreen() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Seção Principal - Cabeçalho */}
        <View style={styles.sectionBranca}>
          <TouchableOpacity style={styles.btnVoltar} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={20} color="#93BD57" />
            <Text style={styles.btnVoltarTexto}>Voltar</Text>
          </TouchableOpacity>
          
          <Text style={styles.superTitulo}>Sobre Nós</Text>
          <Text style={styles.paragrafo}>
            O FitWay nasceu do desejo de simplificar o acesso a uma alimentação que realmente respeite o corpo e a rotina de quem busca desempenho. Mais do que um aplicativo de pedidos, somos uma ponte entre a necessidade de praticidade e o compromisso com a saúde.
          </Text>
        </View>

        {/* Seção de Transição - Cinza Suave */}
        <View style={styles.sectionCinza}>
          <Text style={styles.tituloSecundario}>A Essência do FitWay</Text>
          <Text style={styles.paragrafo}>
            Acreditamos que comer bem não deve ser uma tarefa complexa ou um desafio diário. Por isso, o FitWay foi projetado para reunir estabelecimentos que compartilham da nossa visão: oferecer comida de verdade, com transparência nutricional e sabor.
          </Text>
          <Text style={styles.paragrafo}>
            Nosso foco está na curadoria. Selecionamos parceiros que tratam cada ingrediente com rigor, garantindo que o consumidor final receba exatamente o que precisa para manter o equilíbrio, seja no trabalho, em casa ou após o treino.
          </Text>
        </View>

        {/* Seção de Transição - Verde Suave */}
        <View style={styles.sectionVerde}>
          <Text style={styles.tituloSecundario}>Tecnologia e Performance</Text>
          <Text style={styles.paragrafo}>
            Para sustentar esse ecossistema, o FitWay utiliza uma estrutura técnica avançada. Através da arquitetura MVC, conseguimos entregar um sistema rápido e confiável, onde cada funcionalidade foi pensada para otimizar a experiência do usuário.
          </Text>
          <Text style={styles.paragrafo}>
            A integração entre interface e dados ocorre de forma fluida, permitindo que a escolha da sua próxima refeição seja intuitiva e segura. O nosso compromisso é usar a inovação para que a sua única preocupação seja aproveitar o melhor de uma vida saudável.
          </Text>
        </View>

        {/* Rodapé Final */}
        <View style={styles.sectionBranca}>
          <View style={styles.divisor} />
          <Text style={styles.assinatura}>FitWay</Text>
          <Text style={styles.rodapeTexto}>Sua jornada saudável começa aqui.</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FFF' },
  scrollView: { flex: 1 },
  
  sectionBranca: {
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  sectionCinza: {
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  sectionVerde: {
    padding: 40,
    backgroundColor: '#F7FAF2', 
  },

  btnVoltar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30,
  },
  btnVoltarTexto: { fontSize: 16, color: '#93BD57', marginLeft: 8, fontWeight: '600' },

  superTitulo: { 
    fontSize: 48, 
    fontWeight: '800', 
    color: '#93BD57', 
    marginBottom: 24,
    letterSpacing: -1.5
  },
  tituloSecundario: { 
    fontSize: 32, 
    fontWeight: '700', 
    color: '#93BD57', 
    marginBottom: 20,
  },
  paragrafo: { 
    fontSize: 18, 
    color: '#333', 
    lineHeight: 30, 
    marginBottom: 20,
    textAlign: 'left',
    maxWidth: 900,
  },

  divisor: {
    height: 1,
    backgroundColor: '#EEE',
    width: '100%',
    marginBottom: 24,
  },
  assinatura: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#93BD57' 
  },
  rodapeTexto: { 
    fontSize: 16, 
    color: '#666', 
    marginTop: 4 
  },
});
