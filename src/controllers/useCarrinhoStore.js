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
      adicionarItem: (produto, idRestaurante, quantidade = 1) =>
        set((state) => {
          // Se for de outro restaurante, limpa e adiciona o novo com a quantidade escolhida
          if (state.restauranteId && state.restauranteId !== idRestaurante) {
            return {
              itens: [{ ...produto, qtd: quantidade }],
              restauranteId: idRestaurante,
            };
          }

          const itemExistente = state.itens.find(
            (item) => item.id === produto.id,
          );

          // Se o item já está no carrinho, soma a quantidade atual com a quantidade nova
          if (itemExistente) {
            return {
              itens: state.itens.map((item) =>
                item.id === produto.id
                  ? { ...item, qtd: item.qtd + quantidade }
                  : item,
              ),
              restauranteId: idRestaurante,
            };
          }

          // Se o item não está no carrinho, adiciona com a quantidade escolhida
          return {
            itens: [...state.itens, { ...produto, qtd: quantidade }],
            restauranteId: idRestaurante,
          };
        }),

      removerItem: (produtoId) =>
        set((state) => {
          const itemExistente = state.itens.find(
            (item) => item.id === produtoId,
          );
          if (itemExistente?.qtd > 1) {
            return {
              itens: state.itens.map((item) =>
                item.id === produtoId ? { ...item, qtd: item.qtd - 1 } : item,
              ),
            };
          }
          const novosItens = state.itens.filter(
            (item) => item.id !== produtoId,
          );
          return {
            itens: novosItens,
            restauranteId: novosItens.length === 0 ? null : state.restauranteId,
          };
        }),

      limparCarrinho: () => set({ itens: [], restauranteId: null }),

      calcularTotal: () => {
        const { itens } = get();
        return itens.reduce((total, item) => total + item.preco * item.qtd, 0);
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
