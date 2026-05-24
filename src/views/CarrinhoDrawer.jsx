import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCarrinhoStore } from "../controllers/useCarrinhoStore";
import { RestauranteModel } from "../models/RestauranteModel";

export function CarrinhoDrawer() {
  const router = useRouter();

  const {
    drawerAberto,
    fecharDrawer,
    itens,
    removerItem,
    adicionarItem,
    restauranteId,
    limparCarrinho,
  } = useCarrinhoStore();

  const [pedidoMinimo, setPedidoMinimo] = useState(0);

  useEffect(() => {
    if (drawerAberto && restauranteId) {
      RestauranteModel.buscarPorId(restauranteId)
        .then((res) => {
          setPedidoMinimo(Number(res?.pedido_minimo || 0));
        })
        .catch((err) => {
          console.error("Erro ao buscar pedido mínimo na gaveta", err);
        });
    }
  }, [drawerAberto, restauranteId]);

  // Soma do prato + adicionais para garantir o valor correto no Drawer
  const valorTotal = itens.reduce((acc, item) => {
    const valorAdicionais = item.adicionais?.reduce((sum, a) => sum + Number(a.preco || 0), 0) || 0;
    return acc + (Number(item.preco) + valorAdicionais) * item.qtd;
  }, 0);

  const totalCalorias = itens.reduce(
    (acc, item) => acc + (Number(item.calorias) || 0) * item.qtd,
    0,
  );

  const isAbaixoMinimo = valorTotal > 0 && valorTotal < pedidoMinimo;
  const faltaParaMinimo = pedidoMinimo - valorTotal;

  const irParaPagamento = () => {
    fecharDrawer();
    router.push("/consumidor/pagamento");
  };

  return (
    <Modal visible={drawerAberto} transparent animationType="fade">
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          onPress={fecharDrawer}
          activeOpacity={1}
        />

        <View style={styles.drawer}>
          <View style={styles.header}>
            <Text style={styles.title}>Seu Pedido</Text>
            <View style={styles.headerAcoes}>
              {itens.length > 0 && (
                <TouchableOpacity onPress={limparCarrinho}>
                  <Text style={styles.btnLimpar}>Limpar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={fecharDrawer}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.lista}>
            {itens.length === 0 ? (
              <View style={styles.carrinhoVazio}>
                <Ionicons name="bag-handle-outline" size={48} color="#CCC" />
                <Text style={styles.carrinhoVazioText}>
                  Seu carrinho está vazio.
                </Text>
              </View>
            ) : (
              itens.map((item) => {
                // Cálculo unitário para exibir na tela (base + extras)
                const valorAdicionais = item.adicionais?.reduce((sum, a) => sum + Number(a.preco || 0), 0) || 0;
                const precoUnitarioTotal = Number(item.preco) + valorAdicionais;

                return (
                  <View key={item.id} style={styles.itemCard}>
                    <Image
                      source={{
                        uri: item.foto || "https://via.placeholder.com/60",
                      }}
                      style={styles.itemFoto}
                    />

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemNome} numberOfLines={2}>
                        {item.nome}
                      </Text>
                      
                      {/* Renderização dos Adicionais escolhidos */}
                      {item.adicionais && item.adicionais.length > 0 && (
                        <View style={styles.adicionaisContainer}>
                          {item.adicionais.map((adc, idx) => (
                            <Text key={adc.id || idx} style={styles.adicionalText}>
                              + {adc.nome} (+ R$ {Number(adc.preco).toFixed(2).replace(".", ",")})
                            </Text>
                          ))}
                        </View>
                      )}

                      <Text style={styles.itemPrecoUnit}>
                        R$ {precoUnitarioTotal.toFixed(2).replace(".", ",")} / un
                      </Text>
                    </View>

                    <View style={styles.itemRight}>
                      <View style={styles.controleQtd}>
                        <TouchableOpacity
                          style={styles.btnQtd}
                          onPress={() => removerItem(item.id)}
                        >
                          <Ionicons
                            name={item.qtd === 1 ? "trash-outline" : "remove"}
                            size={16}
                            color={item.qtd === 1 ? "#E53935" : "#666"}
                          />
                        </TouchableOpacity>

                        <Text style={styles.txtQtd}>{item.qtd}</Text>

                        <TouchableOpacity
                          style={styles.btnQtd}
                          // Passamos o array de adicionais para o Zustand manter a coerência da chave
                          onPress={() => adicionarItem(item, restauranteId, 1, item.adicionais)}
                        >
                          <Ionicons name="add" size={16} color="#93BD57" />
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.itemPrecoTotal}>
                        R$ {(precoUnitarioTotal * item.qtd).toFixed(2).replace(".", ",")}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          <View style={styles.footer}>
            {totalCalorias > 0 && (
              <View style={styles.caloriasRow}>
                <View style={styles.caloriasLabelContainer}>
                  <Ionicons name="flame" size={18} color="#FF9800" />
                  <Text style={styles.caloriasLabel}>Calorias Totais:</Text>
                </View>
                <Text style={styles.caloriasValue}>{totalCalorias} kcal</Text>
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>
                R$ {valorTotal.toFixed(2).replace(".", ",")}
              </Text>
            </View>

            {isAbaixoMinimo && (
              <View style={styles.avisoMinimoContainer}>
                <Ionicons name="alert-circle" size={16} color="#D32F2F" />
                <Text style={styles.avisoMinimoTexto}>
                  Faltam R$ {faltaParaMinimo.toFixed(2).replace(".", ",")} para
                  o pedido mínimo.
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.btnFinalizar,
                (itens.length === 0 || isAbaixoMinimo) &&
                  styles.btnFinalizarInativo,
              ]}
              onPress={irParaPagamento}
              disabled={itens.length === 0 || isAbaixoMinimo}
            >
              <Text style={styles.btnFinalizarText}>Ir para Pagamento</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: "row", backgroundColor: "transparent" },
  backdrop: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.4)" },
  drawer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFF",
    height: "100%",
    shadowColor: "#000",
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#EFEFEF",
  },
  title: { fontFamily: "Nunito", fontSize: 20, fontWeight: "bold", color: "#333" },
  headerAcoes: { flexDirection: "row", alignItems: "center", gap: 15 },
  btnLimpar: { fontFamily: "Nunito", fontSize: 14, color: "#E53935", fontWeight: "600" },
  lista: { flex: 1, padding: 20 },
  carrinhoVazio: { alignItems: "center", justifyContent: "center", marginTop: 40 },
  carrinhoVazioText: { fontFamily: "Nunito", fontSize: 16, color: "#999", marginTop: 10 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
    gap: 12,
  },
  itemFoto: { width: 50, height: 50, borderRadius: 8, backgroundColor: "#F5F5F5" },
  itemInfo: { flex: 1 },
  itemNome: { fontFamily: "Nunito", fontSize: 15, color: "#333", fontWeight: "600", marginBottom: 2 },
  
  adicionaisContainer: { marginBottom: 4 },
  adicionalText: { fontFamily: "Nunito", fontSize: 11, color: "#888", fontStyle: "italic" },
  
  itemPrecoUnit: { fontFamily: "Nunito", fontSize: 12, color: "#777", marginTop: 2 },
  itemRight: { alignItems: "flex-end", gap: 8 },
  controleQtd: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  btnQtd: { padding: 4 },
  txtQtd: { fontFamily: "Nunito", fontSize: 14, fontWeight: "bold", color: "#333", marginHorizontal: 8, minWidth: 16, textAlign: "center" },
  itemPrecoTotal: { fontFamily: "Nunito", fontSize: 16, fontWeight: "bold", color: "#005F02" },
  footer: { padding: 20, borderTopWidth: 1, borderColor: "#EFEFEF", backgroundColor: "#FAFAFA" },
  caloriasRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  caloriasLabelContainer: { flexDirection: "row", alignItems: "center", gap: 6 },
  caloriasLabel: { fontFamily: "Nunito", fontSize: 16, color: "#666" },
  caloriasValue: { fontFamily: "Nunito", fontSize: 18, fontWeight: "bold", color: "#FF9800" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  totalLabel: { fontFamily: "Nunito", fontSize: 18, color: "#666" },
  totalValue: { fontFamily: "Nunito", fontSize: 24, fontWeight: "bold", color: "#005F02" },
  btnFinalizar: { backgroundColor: "#93BD57", padding: 15, borderRadius: 8, alignItems: "center" },
  btnFinalizarInativo: { backgroundColor: "#CCC" },
  btnFinalizarText: { fontFamily: "Nunito", fontSize: 18, fontWeight: "bold", color: "#FFF" },
  avisoMinimoContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE", padding: 10, borderRadius: 8, marginBottom: 12, gap: 8 },
  avisoMinimoTexto: { fontFamily: "Nunito", color: "#D32F2F", fontWeight: "bold", fontSize: 13, flex: 1 },
});