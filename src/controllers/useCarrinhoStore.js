import { create } from 'zustand';

// O Zustand cria a memória global instantaneamente
export const useCarrinhoStore = create((set, get) => ({
  itens: [],
  idRestauranteAtual: null,
  
  adicionarItem: (produto, idRestaurante) => {
    const state = get(); // Pega o estado atual
    
    // Trava de segurança: não deixa misturar restaurantes
    if (state.idRestauranteAtual && state.idRestauranteAtual !== idRestaurante) {
      alert("Você só pode adicionar itens de um restaurante por vez. Limpe o carrinho atual para trocar de loja.");
      return;
    }

    const itemExiste = state.itens.find(i => i.id === produto.id);
    
    if (itemExiste) {
      // Já existe, aumenta a quantidade
      set({ 
        itens: state.itens.map(i => i.id === produto.id ? { ...i, qtd: i.qtd + 1 } : i),
        idRestauranteAtual: idRestaurante
      });
    } else {
      // Primeira vez, adiciona na lista
      set({ 
        itens: [...state.itens, { ...produto, qtd: 1 }],
        idRestauranteAtual: idRestaurante
      });
    }
  },

  removerItem: (idProduto) => {
    const state = get();
    const itemExiste = state.itens.find(i => i.id === idProduto);
    
    if (itemExiste && itemExiste.qtd > 1) {
      set({ itens: state.itens.map(i => i.id === idProduto ? { ...i, qtd: i.qtd - 1 } : i) });
    } else {
      const novaLista = state.itens.filter(i => i.id !== idProduto);
      set({ 
        itens: novaLista, 
        idRestauranteAtual: novaLista.length === 0 ? null : state.idRestauranteAtual 
      });
    }
  },

  limparCarrinho: () => set({ itens: [], idRestauranteAtual: null })
}));