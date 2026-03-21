import { collection, addDoc, doc, query, where, getDocs, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const ProdutoModel = {
  
  async cadastrar(dadosPrato, imagemBase64) { 
    try {
      // Salva o id_restaurante como texto direto, facilitando as buscas depois
      const docRef = await addDoc(collection(db, 'produtos'), {
        id_restaurante: dadosPrato.id_restaurante, 
        nome: dadosPrato.nome,
        descricao: dadosPrato.descricao || "", 
        preco: dadosPrato.preco,
        categoria: dadosPrato.categoria || "",
        calorias: dadosPrato.calorias || 0,
        foto: imagemBase64 || "", 
        disponivel: true, 
      });
      return docRef.id; 
    } catch (error) {
      console.error("Erro no ProdutoModel:", error);
      throw error;
    }
  },

  async buscarPorRestaurante(idRestaurante) {
    try {
      // Busca usando a string do ID
      const q = query(collection(db, 'produtos'), where('id_restaurante', '==', idRestaurante));
      const snapshot = await getDocs(q);
      
      const produtos = [];
      snapshot.forEach((docSnap) => {
        produtos.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      return produtos;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error;
    }
  },

  async deletar(idProduto) {
    try {
      const produtoRef = doc(db, 'produtos', idProduto);
      await deleteDoc(produtoRef);
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      throw error;
    }
  },

  async buscarPorId(idProduto) {
    try {
      const docRef = doc(db, 'produtos', idProduto);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar prato por ID:", error);
      throw error;
    }
  },

  async atualizar(idProduto, dadosAtualizados) {
    try {
      const produtoRef = doc(db, 'produtos', idProduto);
      await updateDoc(produtoRef, {
        nome: dadosAtualizados.nome,
        descricao: dadosAtualizados.descricao || "",
        preco: dadosAtualizados.preco,
        categoria: dadosAtualizados.categoria || "",
        calorias: dadosAtualizados.calorias || 0,
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  }
};