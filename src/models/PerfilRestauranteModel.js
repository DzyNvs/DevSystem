import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const PerfilRestauranteModel = {

  async buscarPerfil(uid) {
    try {
      const docRef = doc(db, 'restaurantes', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar perfil do restaurante:", error);
      throw error;
    }
  },

  async atualizarPerfil(uid, dados) {
    try {
      await setDoc(doc(db, 'restaurantes', uid), dados, { merge: true });
    } catch (error) {
      console.error("Erro ao atualizar perfil do restaurante:", error);
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
      data.append('file', { uri: imagemUri, type: 'image/jpeg', name: 'foto_upload.jpg' });
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
  },

  async buscarCEP(cepLimpo) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      if (data.erro) return { erro: 'CEP não encontrado.' };
      return data;
    } catch (error) {
      return { erro: 'Erro ao buscar o CEP.' };
    }
  },

  async buscarCoordenadas(rua, cidade, estado) {
    try {
      const query = `${rua}, ${cidade}, ${estado}, Brazil`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const response = await fetch(url);
      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.length > 0) {
        return { lat: data[0].lat, lng: data[0].lon };
      }
      return null;
    } catch (error) {
      console.log("Erro ao buscar coordenadas:", error);
      return null;
    }
  }
};