import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export function RestauranteCard({ restaurante, onPress }) {
  // 👉 Verifica o valor da taxa para exibir corretamente formatado
  const valorTaxa = Number(restaurante.taxaEntrega);
  const textoTaxa =
    valorTaxa === 0
      ? "Entrega Grátis"
      : `Taxa R$ ${valorTaxa.toFixed(2).replace(".", ",")}`;

  // 👉 NOVO: Verifica o valor do pedido mínimo para exibir formatado
  const valorPedidoMinimo = Number(restaurante.pedidoMinimo);
  const textoPedidoMinimo =
    valorPedidoMinimo === 0
      ? "Sem mínimo"
      : `Min. R$ ${valorPedidoMinimo.toFixed(2).replace(".", ",")}`;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: restaurante.foto }} style={styles.foto} />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#F5A623" />
          <Text style={styles.ratingText}>
            {restaurante.avaliacao.toFixed(1)}
          </Text>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.nome} numberOfLines={1}>
          {restaurante.nome}
        </Text>
        <Text style={styles.descricao} numberOfLines={2}>
          {restaurante.descricao}
        </Text>

        {/* 👉 Taxa de Entrega e Pedido Mínimo no rodapé do card */}
        <View style={styles.footerRow}>
          <View style={styles.footerItem}>
            <Ionicons
              name="bicycle-outline"
              size={14}
              color="#777"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.detalhes}>{textoTaxa}</Text>
          </View>

          <View style={styles.footerItem}>
            <Ionicons
              name="wallet-outline"
              size={14}
              color="#777"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.detalhes}>{textoPedidoMinimo}</Text>
          </View>
        </View>
      </View>{" "}
      {/* 👉 AQUI ESTAVA FALTANDO ESSE FECHAMENTO! */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "23%",
    minWidth: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 24,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: { position: "relative" },
  foto: { width: "100%", height: 140 },
  ratingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  ratingText: { fontSize: 12, fontWeight: "bold", color: "#333" },
  infoContainer: { padding: 16 },
  nome: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 6 },
  descricao: {
    fontSize: 12,
    color: "#777",
    marginBottom: 12,
    lineHeight: 16,
    height: 32,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    flexWrap: "wrap",
    gap: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detalhes: {
    fontSize: 12,
    color: "#777",
    fontWeight: "500",
  },
});
