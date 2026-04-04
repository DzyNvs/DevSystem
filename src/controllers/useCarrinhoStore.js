import { create } from 'zustand';

export const useCarrinhoStore = create((set, get) => ({
  itens: [],
  restauranteId: null,
  
  // Controle da Gaveta (Drawer)
  drawerAberto: false,
  abrirDrawer: () => set({ drawerAberto: true }),
  fecharDrawer: () => set({ drawerAberto: false }),

  adicionarItem: (produto, idRestaurante) => set((state) => {
    if (state.restauranteId && state.restauranteId !== idRestaurante) {
      return { itens: [{ ...produto, qtd: 1 }], restauranteId: idRestaurante };
    }
    const itemExistente = state.itens.find(item => item.id === produto.id);
    if (itemExistente) {
      return {
        itens: state.itens.map(item =>
          item.id === produto.id ? { ...item, qtd: item.qtd + 1 } : item
        ),
        restauranteId: idRestaurante
      };
    } else {
      return {
        itens: [...state.itens, { ...produto, qtd: 1 }],
        restauranteId: idRestaurante
      };
    }
  }),

  removerItem: (produtoId) => set((state) => {
    const itemExistente = state.itens.find(item => item.id === produtoId);
    if (itemExistente?.qtd > 1) {
      return {
        itens: state.itens.map(item =>
          item.id === produtoId ? { ...item, qtd: item.qtd - 1 } : item
        )
      };
    } else {
      const novosItens = state.itens.filter(item => item.id !== produtoId);
      return {
        itens: novosItens,
        restauranteId: novosItens.length === 0 ? null : state.restauranteId
      };
    }
  }),

  limparCarrinho: () => set({ itens: [], restauranteId: null }),

  calcularTotal: () => {
    const { itens } = get();
    return itens.reduce((total, item) => total + (item.preco * item.qtd), 0);
  }
}));