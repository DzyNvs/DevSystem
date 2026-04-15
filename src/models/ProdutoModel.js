import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';

export const ProdutoModel = {

  async cadastrar(dadosPrato) {
    try {
      const docRef = await addDoc(collection(db, 'produtos'), {
        id_restaurante: dadosPrato.id_restaurante,
        nome: dadosPrato.nome,
        descricao: dadosPrato.descricao || "",
        preco: dadosPrato.preco,
        categoria: dadosPrato.categoria || "",
        calorias: dadosPrato.calorias || 0,
        foto: dadosPrato.foto || "",
        disponivel: true,
      });
      return docRef.id;
    } catch (error) {
      console.error("Erro no ProdutoModel:", error);
      throw error;
    }
  },

  async buscarTodos() {
    try {
      const snap = await getDocs(collection(db, 'produtos'));
      const produtos = [];
      snap.forEach((docSnap) => {
        produtos.push({ id: docSnap.id, ...docSnap.data() });
      });
      return produtos;
    } catch (error) {
      console.error("Erro ao buscar todos os produtos:", error);
      throw error;
    }
  },

  async buscarPorRestaurante(idRestaurante) {
    try {
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
        foto: dadosAtualizados.foto || "",
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  },

  async atualizarDisponibilidade(idProduto, disponivel) {
    try {
      const produtoRef = doc(db, 'produtos', idProduto);
      await updateDoc(produtoRef, { disponivel });
    } catch (error) {
      console.error("Erro ao atualizar disponibilidade:", error);
      throw error;
    }
  },

  async uploadParaCloudinary(imagemUri, platform) {
    const CLOUD_NAME = 'damevu18u';
    const UPLOAD_PRESET = 'kea9xf8r';

    const data = new FormData();

    if (platform === 'web') {
      const responseBlob = await fetch(imagemUri);
      const blob = await responseBlob.blob();
      data.append('file', blob);
    } else {
      data.append('file', { uri: imagemUri, type: 'image/jpeg', name: 'foto_prato.jpg' });
    }

    data.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data,
      });
      const dados = await response.json();
      if (dados.error) return null;
      return dados.secure_url;
    } catch (error) {
      console.log("Erro no upload:", error);
      return null;
    }
  }
};