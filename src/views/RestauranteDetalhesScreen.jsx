import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
// 👉 Importei o TextInput aqui!
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useRestauranteDetalhesController } from "../controllers/useRestauranteDetalhesController";
import { HeaderConsumidor } from "./HeaderConsumidor";
import { PratoCard } from "./PratoCard";
import { PratoDetalhesModal } from "./PratoDetalhesModal";

export function RestauranteDetalhesScreen() {
  const ctrl = useRestauranteDetalhesController();

  if (ctrl.carregandoRestaurante) {
    return (
      <View style={styles.mainContainer}>
        <HeaderConsumidor />
        <ActivityIndicator
          size="large"
          color="#4CAF50"
          style={{ marginTop: 50 }}
        />
      </View>
    );
  }

  // 👉 Lógica de Filtragem por Calorias
  // Se o campo estiver vazio, assumimos 0 pro mínimo e infinito pro máximo
  const min = ctrl.minCal ? parseInt(ctrl.minCal, 10) : 0;
  const max = ctrl.maxCal ? parseInt(ctrl.maxCal, 10) : Infinity;

  // Primeiro filtramos os produtos baseados no input do usuário
  const produtosFiltrados = ctrl.produtos.filter((produto) => {
    if (!produto.disponivel) return false;
    const caloriasProduto = produto.calorias || 0;
    return caloriasProduto >= min && caloriasProduto <= max;
  });

  // Depois agrupamos APENAS os produtos que passaram no filtro
  const produtosPorCategoria = produtosFiltrados.reduce((acc, produto) => {
    const categoria = produto.categoria || "FIT";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(produto);
    return acc;
  }, {});

  const listaCategorias = Object.entries(produtosPorCategoria);

  return (
    <View style={styles.mainContainer}>
      <HeaderConsumidor />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner do Restaurante */}
        <ImageBackground
          source={{ uri: ctrl.restaurante?.banner }}
          style={styles.bannerImage}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.bannerOverlay}>
            <View style={styles.restaurantInfoCard}>
              {ctrl.restaurante?.logo && (
                <Image
                  source={{ uri: ctrl.restaurante.logo }}
                  style={styles.logoRestaurante}
                />
              )}

              <View style={styles.headerRow}>
                <Text style={styles.nomeRestaurante} numberOfLines={1}>
                  {ctrl.restaurante?.nome_fantasia ||
                    ctrl.restaurante?.razao_social ||
                    "Restaurante"}
                </Text>
                <View style={styles.avaliacaoBadge}>
                  <Text style={styles.avaliacaoText}>
                    {ctrl.restaurante?.avaliacao?.toFixed(1).replace(".", ",")}
                  </Text>
                  <Ionicons name="star" size={16} color="#FBC02D" />
                </View>
              </View>
              <Text style={styles.especialidade} numberOfLines={1}>
                {ctrl.restaurante?.especialidade || "Alimentação Saudável"}
              </Text>

              <View style={styles.detailsRow}>
                <View style={styles.detailCol}>
                  <Ionicons name="cash-outline" size={16} color="#777" />
                  {/* 👉 Verificação adicionada: se for 0, mostra Grátis em destaque, senão mostra o valor */}
                  <Text
                    style={[
                      styles.detailText,
                      ctrl.restaurante?.taxaEntrega === 0 && {
                        color: "#2E7D32",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    Taxa:{" "}
                    {ctrl.restaurante?.taxaEntrega === 0
                      ? "Grátis"
                      : `R$ ${ctrl.restaurante?.taxaEntrega?.toFixed(2).replace(".", ",")}`}
                  </Text>
                </View>
                {/* 👉 NOVO: Coluna do Pedido Mínimo */}
                <View style={styles.detailCol}>
                  <Ionicons name="wallet-outline" size={16} color="#777" />
                  <Text style={styles.detailText}>
                    Mínimo:{" "}
                    {ctrl.restaurante?.pedidoMinimo === 0
                      ? "Sem mínimo"
                      : `R$ ${ctrl.restaurante?.pedidoMinimo?.toFixed(2).replace(".", ",")}`}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Cardápio e Filtros */}
        <View style={styles.listContainer}>
          {/* 👉 NOVO: Container de Filtro de Calorias */}
          <View style={styles.filterContainer}>
            <View style={styles.filterHeader}>
              <Ionicons name="flame-outline" size={18} color="#FF9800" />
              <Text style={styles.filterTitle}>
                Filtrar por Calorias (kcal)
              </Text>
            </View>
            <View style={styles.filterRow}>
              <TextInput
                style={styles.filterInput}
                placeholder="Mínimo"
                keyboardType="numeric"
                value={ctrl.minCal}
                onChangeText={ctrl.setMinCal}
                maxLength={4}
              />
              <Text style={styles.filterSeparator}>até</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Máximo"
                keyboardType="numeric"
                value={ctrl.maxCal}
                onChangeText={ctrl.setMaxCal}
                maxLength={4}
              />
            </View>
          </View>

          {/* Listagem de Produtos */}
          {ctrl.carregandoProdutos ? (
            <ActivityIndicator
              size="large"
              color="#4CAF50"
              style={{ marginTop: 50 }}
            />
          ) : listaCategorias.length === 0 ? (
            <Text style={styles.textoVazio}>
              Nenhum prato disponível com estes filtros no momento.
            </Text>
          ) : (
            listaCategorias.map(([categoria, pratos]) => (
              <View key={categoria} style={styles.sectionCategory}>
                <Text style={styles.sectionTitleCategory}>
                  {categoria.toUpperCase()}
                </Text>
                <FlatList
                  data={pratos}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <PratoCard
                      prato={item}
                      onPress={() => ctrl.abrirPratoModal(item)}
                    />
                  )}
                  scrollEnabled={false}
                />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Modal invisível até clicar no prato */}
      <PratoDetalhesModal
        visible={ctrl.modalVisivel}
        onClose={ctrl.fecharPratoModal}
        prato={ctrl.pratoSelecionado}
        // 👉 Agora recebemos o prato e a quantidade
        onAddToCart={(prato, quantidade) =>
          ctrl.handleAdicionarItem(prato, quantidade)
        }
      />

      {/* 👉 NOVO: O nosso aviso (Toast) flutuante bonitinho */}
      {ctrl.toastVisivel && (
        <View style={styles.toastContainer}>
          <Ionicons name="checkmark-circle" size={22} color="#FFF" />
          <Text style={styles.toastText}>Item adicionado ao carrinho!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FAF9F2" },
  container: { flex: 1 },
  bannerImage: {
    width: "100%",
    height: 280,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
    borderRadius: 24,
    zIndex: 10,
  },
  bannerOverlay: { alignItems: "center", width: "100%", paddingHorizontal: 16 },

  restaurantInfoCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 800,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: -40,
    zIndex: 5,
  },

  logoRestaurante: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 3,
    borderColor: "#FFF",
    backgroundColor: "#FFF",
    marginTop: -54,
    marginBottom: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nomeRestaurante: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111",
    flex: 1,
    marginRight: 16,
  },
  avaliacaoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9C4",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  avaliacaoText: { fontSize: 14, fontWeight: "bold", color: "#F9A825" },
  especialidade: {
    fontSize: 14,
    color: "#2E7D32",
    fontStyle: "italic",
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderColor: "#EEE",
    paddingTop: 12,
    gap: 24,
  },
  detailCol: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 14, color: "#777", fontWeight: "500" },

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 40,
    width: "100%",
    maxWidth: 800,
    alignSelf: "center",
  },

  // 👉 NOVO ESTILO: Estilos do filtro
  filterContainer: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "#FAFAFA",
  },
  filterSeparator: {
    marginHorizontal: 12,
    fontSize: 14,
    color: "#777",
    fontWeight: "600",
  },

  sectionCategory: { marginBottom: 24 },
  sectionTitleCategory: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    fontStyle: "italic",
    marginVertical: 16,
    marginLeft: 16,
  },
  textoVazio: {
    textAlign: "center",
    marginTop: 30,
    color: "#777",
    fontSize: 16,
    fontStyle: "italic",
  },

  // 👉 NOVOS ESTILOS: Caixinha do Aviso (Toast) Flutuante
  toastContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#2E7D32", // Verde escuro combinando com seu app
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 9999, // Garante que fica por cima de toda a interface
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
