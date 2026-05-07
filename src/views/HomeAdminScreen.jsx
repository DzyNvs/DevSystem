import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as FileSystem from "expo-file-system";
import { useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { signOut } from "firebase/auth";
import { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../config/firebase";
import { useRelatoriosAdminController } from "../controllers/useRelatoriosAdminController";

const logo = require("../../assets/images/logo.png");

// ===== EXPORTAR CSV =====
const gerarCSV = (dados, tipo) => {
  if (!dados || dados.length === 0) return null;

  let cabecalho = "";
  let linhas = "";

  if (tipo === "vendas") {
    cabecalho = "Restaurante;Pedidos;Faturamento;Ticket Medio\n";
    linhas = dados
      .map(
        (d) =>
          `${d.nomeRestaurante};${d.qtdPedidos};${d.faturamento.toFixed(2)};${d.ticketMedio.toFixed(2)}`,
      )
      .join("\n");
  } else if (tipo === "cancelamento") {
    cabecalho = "Restaurante;Total Pedidos;Recusados;% Cancelamento\n";
    linhas = dados
      .map(
        (d) =>
          `${d.nomeRestaurante};${d.totalPedidos};${d.recusados};${d.percentualCancelamento.toFixed(1)}`,
      )
      .join("\n");
  } else if (tipo === "produto") {
    cabecalho = "Restaurante;Especialidade;Produto;Categoria;Qtd;Valor Total\n";
    linhas = dados
      .map(
        (d) =>
          `${d.nomeRestaurante};${d.especialidade};${d.produtoNome};${d.categoriaProduto};${d.qtdVendida};${d.valorTotal.toFixed(2)}`,
      )
      .join("\n");
  }

  return cabecalho + linhas;
};

const exportarRelatorio = async (dados, tipo) => {
  const csv = gerarCSV(dados, tipo);
  if (!csv) {
    alert("Nenhum dado para exportar.");
    return;
  }

  if (Platform.OS === "web") {
    // Web: download direto
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio_${tipo}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  } else {
    // Mobile: salva e compartilha
    const path = `${FileSystem.documentDirectory}relatorio_${tipo}.csv`;
    await FileSystem.writeAsStringAsync(path, "\uFEFF" + csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    await Sharing.shareAsync(path);
  }
};

export const HomeAdminScreen = () => {
  const router = useRouter();
  const {
    restaurantes,
    filtroRestaurante,
    setFiltroRestaurante,
    txtDataInicial,
    setTxtDataInicial,
    txtDataFinal,
    setTxtDataFinal,
    dadosVendas,
    dadosCancelamento,
    dadosProduto,
    carregando,
    ordenacao,
    gerarRelatorio,
    ordenar,
  } = useRelatoriosAdminController();

  const [abaAtiva, setAbaAtiva] = useState("vendas");

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/");
  };

  const iconeOrdenacao = (campo) => {
    if (ordenacao.campo !== campo) return "swap-vertical-outline";
    return ordenacao.direcao === "asc" ? "arrow-up" : "arrow-down";
  };

  const abas = [
    { key: "vendas", label: "📊 Vendas" },
    { key: "cancelamento", label: "🚫 Cancelamento" },
    { key: "produto", label: "📦 Produtos" },
  ];

  const dadosAbaAtiva =
    abaAtiva === "vendas"
      ? dadosVendas
      : abaAtiva === "cancelamento"
        ? dadosCancelamento
        : dadosProduto;

  return (
    <View style={styles.tela}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.headerNome}>Olá, Admin</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="#c0392b" />
            <Text style={styles.logoutTexto}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* ===== FILTROS ===== */}
        <View style={styles.filtroContainer}>
          <Text style={styles.secaoTitulo}>Filtros</Text>
          <Text style={styles.label}>Restaurante:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={filtroRestaurante}
              onValueChange={setFiltroRestaurante}
              style={styles.picker}
            >
              <Picker.Item label="Todos" value="todos" />
              {restaurantes.map((r) => (
                <Picker.Item
                  key={r.id}
                  label={r.nome_fantasia || r.razao_social || r.id}
                  value={r.id_restaurante}
                />
              ))}
            </Picker>
          </View>

          <View style={styles.datasRow}>
            <View style={styles.dataInput}>
              <Text style={styles.label}>Data Inicial:</Text>
              <TextInput
                style={styles.input}
                value={txtDataInicial}
                onChangeText={setTxtDataInicial}
                placeholder="DD/MM/AAAA"
              />
            </View>
            <View style={styles.dataInput}>
              <Text style={styles.label}>Data Final:</Text>
              <TextInput
                style={styles.input}
                value={txtDataFinal}
                onChangeText={setTxtDataFinal}
                placeholder="DD/MM/AAAA"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.botaoGerar} onPress={gerarRelatorio}>
            <Text style={styles.botaoGerarTexto}>Gerar Relatórios</Text>
          </TouchableOpacity>
        </View>

        {carregando && (
          <ActivityIndicator
            size="large"
            color="#93BD57"
            style={{ marginVertical: 20 }}
          />
        )}

        {/* ===== ABAS ===== */}
        <View style={styles.abasContainer}>
          {abas.map((aba) => (
            <TouchableOpacity
              key={aba.key}
              style={[styles.aba, abaAtiva === aba.key && styles.abaAtiva]}
              onPress={() => setAbaAtiva(aba.key)}
            >
              <Text
                style={[
                  styles.abaTexto,
                  abaAtiva === aba.key && styles.abaTextoAtivo,
                ]}
              >
                {aba.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ===== BOTÃO EXPORTAR ===== */}
        {dadosAbaAtiva.length > 0 && (
          <TouchableOpacity
            style={styles.botaoExportar}
            onPress={() => exportarRelatorio(dadosAbaAtiva, abaAtiva)}
          >
            <Ionicons name="download-outline" size={18} color="#fff" />
            <Text style={styles.botaoExportarTexto}>Exportar CSV</Text>
          </TouchableOpacity>
        )}

        {/* ===== ABA VENDAS ===== */}
        {abaAtiva === "vendas" &&
          (dadosVendas.length > 0 ? (
            <View style={styles.tabela}>
              <View style={[styles.linha, styles.cabecalho]}>
                <TouchableOpacity
                  style={[styles.celula, { flex: 2 }]}
                  onPress={() => ordenar("vendas", "nomeRestaurante")}
                >
                  <Text style={styles.cabTexto}>Restaurante</Text>
                  <Ionicons
                    name={iconeOrdenacao("nomeRestaurante")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() => ordenar("vendas", "qtdPedidos")}
                >
                  <Text style={styles.cabTexto}>Pedidos</Text>
                  <Ionicons
                    name={iconeOrdenacao("qtdPedidos")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() => ordenar("vendas", "faturamento")}
                >
                  <Text style={styles.cabTexto}>Faturamento</Text>
                  <Ionicons
                    name={iconeOrdenacao("faturamento")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() => ordenar("vendas", "ticketMedio")}
                >
                  <Text style={styles.cabTexto}>Ticket Médio</Text>
                  <Ionicons
                    name={iconeOrdenacao("ticketMedio")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
              {dadosVendas.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.linha,
                    styles.linhaBorda,
                    i % 2 === 0 ? styles.linhaClara : styles.linhaEscura,
                  ]}
                >
                  <Text style={[styles.celTxt, { flex: 2 }]}>
                    {item.nomeRestaurante}
                  </Text>
                  <Text style={styles.celTxt}>{item.qtdPedidos}</Text>
                  <Text style={styles.celTxt}>
                    R$ {item.faturamento.toFixed(2)}
                  </Text>
                  <Text style={styles.celTxt}>
                    R$ {item.ticketMedio.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            !carregando && (
              <Text style={styles.semDados}>
                Nenhum dado de vendas encontrado.
              </Text>
            )
          ))}

        {/* ===== ABA CANCELAMENTO ===== */}
        {abaAtiva === "cancelamento" &&
          (dadosCancelamento.length > 0 ? (
            <View style={styles.tabela}>
              <View style={[styles.linha, styles.cabecalho]}>
                <TouchableOpacity
                  style={[styles.celula, { flex: 2 }]}
                  onPress={() => ordenar("cancelamento", "nomeRestaurante")}
                >
                  <Text style={styles.cabTexto}>Restaurante</Text>
                  <Ionicons
                    name={iconeOrdenacao("nomeRestaurante")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() => ordenar("cancelamento", "totalPedidos")}
                >
                  <Text style={styles.cabTexto}>Pedidos</Text>
                  <Ionicons
                    name={iconeOrdenacao("totalPedidos")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() => ordenar("cancelamento", "recusados")}
                >
                  <Text style={styles.cabTexto}>Recusados</Text>
                  <Ionicons
                    name={iconeOrdenacao("recusados")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() =>
                    ordenar("cancelamento", "percentualCancelamento")
                  }
                >
                  <Text style={styles.cabTexto}>% Cancel.</Text>
                  <Ionicons
                    name={iconeOrdenacao("percentualCancelamento")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
              {dadosCancelamento.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.linha,
                    styles.linhaBorda,
                    i % 2 === 0 ? styles.linhaClara : styles.linhaEscura,
                  ]}
                >
                  <Text style={[styles.celTxt, { flex: 2 }]}>
                    {item.nomeRestaurante}
                  </Text>
                  <Text style={styles.celTxt}>{item.totalPedidos}</Text>
                  <Text style={styles.celTxt}>{item.recusados}</Text>
                  <Text
                    style={[
                      styles.celTxt,
                      item.percentualCancelamento > 30 && {
                        color: "#c0392b",
                        fontWeight: "bold",
                      },
                    ]}
                  >
                    {item.percentualCancelamento.toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            !carregando && (
              <Text style={styles.semDados}>
                Nenhum dado de cancelamento encontrado.
              </Text>
            )
          ))}

        {/* ===== ABA PRODUTOS ===== */}
        {abaAtiva === "produto" &&
          (dadosProduto.length > 0 ? (
            <View style={styles.tabela}>
              <View style={[styles.linha, styles.cabecalho]}>
                <TouchableOpacity
                  style={[styles.celula, { flex: 1.5 }]}
                  onPress={() => ordenar("produto", "nomeRestaurante")}
                >
                  <Text style={styles.cabTexto}>Restaurante</Text>
                  <Ionicons
                    name={iconeOrdenacao("nomeRestaurante")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() => ordenar("produto", "especialidade")}
                >
                  <Text style={styles.cabTexto}>Especialidade</Text>
                  <Ionicons
                    name={iconeOrdenacao("especialidade")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.celula, { flex: 1.5 }]}
                  onPress={() => ordenar("produto", "produtoNome")}
                >
                  <Text style={styles.cabTexto}>Produto</Text>
                  <Ionicons
                    name={iconeOrdenacao("produtoNome")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() => ordenar("produto", "categoriaProduto")}
                >
                  <Text style={styles.cabTexto}>Categoria</Text>
                  <Ionicons
                    name={iconeOrdenacao("categoriaProduto")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.celula, { flex: 0.6 }]}
                  onPress={() => ordenar("produto", "qtdVendida")}
                >
                  <Text style={styles.cabTexto}>Qtd</Text>
                  <Ionicons
                    name={iconeOrdenacao("qtdVendida")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.celula}
                  onPress={() => ordenar("produto", "valorTotal")}
                >
                  <Text style={styles.cabTexto}>Valor Total</Text>
                  <Ionicons
                    name={iconeOrdenacao("valorTotal")}
                    size={14}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
              {dadosProduto.map((item, i) => (
                <View
                  key={i}
                  style={[
                    styles.linha,
                    styles.linhaBorda,
                    i % 2 === 0 ? styles.linhaClara : styles.linhaEscura,
                  ]}
                >
                  <Text style={[styles.celTxt, { flex: 1.5 }]}>
                    {item.nomeRestaurante}
                  </Text>
                  <Text style={styles.celTxt}>{item.especialidade}</Text>
                  <Text style={[styles.celTxt, { flex: 1.5 }]}>
                    {item.produtoNome}
                  </Text>
                  <Text style={styles.celTxt}>{item.categoriaProduto}</Text>
                  <Text style={[styles.celTxt, { flex: 0.6 }]}>
                    {item.qtdVendida}
                  </Text>
                  <Text style={styles.celTxt}>
                    R$ {item.valorTotal.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            !carregando && (
              <Text style={styles.semDados}>
                Nenhum dado de produtos encontrado.
              </Text>
            )
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: "#E8E0D0" },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 70,
    height: 80,
    backgroundColor: "#F2E3BB",
    borderBottomWidth: 2,
    borderColor: "#C9B88A",
    zIndex: 10,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  logo: { width: 110, height: 55 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 16 },
  headerNome: { fontWeight: "bold", fontSize: 14, color: "#333" },
  logoutBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  logoutTexto: { color: "#c0392b", fontWeight: "600" },

  // CONTEÚDO
  container: { flex: 1, paddingHorizontal: 70, paddingTop: 16 },

  // FILTROS
  filtroContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  secaoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 4 },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: { height: 50 },
  datasRow: { flexDirection: "row", gap: 12 },
  dataInput: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  botaoGerar: {
    backgroundColor: "#4A7C12",
    borderRadius: 8,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  botaoGerarTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // EXPORTAR
  botaoExportar: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#2E7D32",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
    marginBottom: 10,
  },
  botaoExportarTexto: { color: "#fff", fontWeight: "600", fontSize: 13 },

  // ABAS
  abasContainer: { flexDirection: "row", marginBottom: 12, gap: 6 },
  aba: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
  },
  abaAtiva: { backgroundColor: "#4A7C12" },
  abaTexto: { fontSize: 13, fontWeight: "600", color: "#555" },
  abaTextoAtivo: { color: "#fff" },

  // TABELAS
  tabela: {
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    marginBottom: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "#999",
  },
  linha: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  linhaBorda: {
    borderTopWidth: 1,
    borderColor: "#aaa",
  },
  cabecalho: {
    backgroundColor: "#4A7C12",
    borderBottomWidth: 2,
    borderColor: "#2E5A0C",
  },
  cabTexto: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  celula: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 3,
  },
  celTxt: { flex: 1, fontSize: 12, color: "#333", paddingHorizontal: 3 },
  linhaClara: { backgroundColor: "#fff" },
  linhaEscura: { backgroundColor: "#eef5e0" },
  semDados: { textAlign: "center", color: "#888", marginTop: 20, fontSize: 14 },
});
