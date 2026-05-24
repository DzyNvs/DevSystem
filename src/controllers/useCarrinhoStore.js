import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useCarrinhoStore = create(
  persist(
    (set, get) => ({
      itens: [],
      restauranteId: null,

      // ── Endereço ativo (selecionado na tela de endereços) ────────────────
      enderecoAtivo: null,
      setEnderecoAtivo: (endereco) => set({ enderecoAtivo: endereco }),

      // ── Gaveta (Drawer) ──────────────────────────────────────────────────
      drawerAberto: false,
      abrirDrawer: () => set({ drawerAberto: true }),
      fecharDrawer: () => set({ drawerAberto: false }),

      // ── Carrinho ─────────────────────────────────────────────────────────
      // 👉 ATUALIZADO: Agora recebe os adicionais e gera um ID único
      adicionarItem: (produto, idRestaurante, quantidade = 1, adicionais = []) =>
        set((state) => {
          // Cria uma string única para identificar a combinação exata de prato + adicionais
          const idsAdicionais = adicionais.map((a) => a.id).sort().join("-");
          
          // Preserva o ID original do prato no banco
          const produtoOriginalId = produto.produtoId || produto.id;
          
          // ID final do item no carrinho: "pratoID-adc1-adc2..."
          const cartItemId = idsAdicionais 
            ? `${produtoOriginalId}-${idsAdicionais}` 
            : produtoOriginalId;

          // Se for de outro restaurante, limpa e adiciona o novo com a quantidade escolhida
          if (state.restauranteId && state.restauranteId !== idRestaurante) {
            return {
              itens: [{ 
                ...produto, 
                id: cartItemId, 
                produtoId: produtoOriginalId, 
                qtd: quantidade, 
                adicionais 
              }],
              restauranteId: idRestaurante,
            };
          }

          const itemExistente = state.itens.find(
            (item) => item.id === cartItemId,
          );

          // Se o item (com a mesma configuração de adicionais) já está no carrinho, soma a quantidade
          if (itemExistente) {
            return {
              itens: state.itens.map((item) =>
                item.id === cartItemId
                  ? { ...item, qtd: item.qtd + quantidade }
                  : item,
              ),
              restauranteId: idRestaurante,
            };
          }

          // Se o item não está no carrinho, adiciona
          return {
            itens: [
              ...state.itens, 
              { 
                ...produto, 
                id: cartItemId, 
                produtoId: produtoOriginalId, 
                qtd: quantidade, 
                adicionais 
              }
            ],
            restauranteId: idRestaurante,
          };
        }),

      removerItem: (cartItemId) =>
        set((state) => {
          const itemExistente = state.itens.find(
            (item) => item.id === cartItemId,
          );
          if (itemExistente?.qtd > 1) {
            return {
              itens: state.itens.map((item) =>
                item.id === cartItemId ? { ...item, qtd: item.qtd - 1 } : item,
              ),
            };
          }
          const novosItens = state.itens.filter(
            (item) => item.id !== cartItemId,
          );
          return {
            itens: novosItens,
            restauranteId: novosItens.length === 0 ? null : state.restauranteId,
          };
        }),

      limparCarrinho: () => set({ itens: [], restauranteId: null }),

      // Atualizamos para considerar os adicionais, caso esse método seja chamado externamente
      calcularTotal: () => {
        const { itens } = get();
        return itens.reduce((total, item) => {
          const valorAds = item.adicionais?.reduce((sum, a) => sum + Number(a.preco || 0), 0) || 0;
          return total + (Number(item.preco) + valorAds) * item.qtd;
        }, 0);
      },
    }),
    {
      name: "fitway-carrinho-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        itens: state.itens,
        restauranteId: state.restauranteId,
        enderecoAtivo: state.enderecoAtivo, // persiste o endereço entre sessões
      }),
    },
  ),
);