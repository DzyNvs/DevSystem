# 🥗 FitWay - Conectando Saúde e Sabor

O FitWay é uma plataforma que conecta consumidores em busca de uma vida saudável a restaurantes especializados em alimentação equilibrada. Desenvolvido com foco em performance e escalabilidade, o projeto utiliza o que há de mais moderno no desenvolvimento atual.

---

## 🛠️ Tecnologias e Arquitetura

O projeto foi construído utilizando uma arquitetura MVC (Model-View-Controller) para garantir organização e facilidade de manutenção.

- Frontend: React Native com Expo (SDK 51+)
- Navegação: Expo Router (File-based routing)
- Backend & Auth: Firebase (Authentication, Firestore e Storage)
- Estilização: StyleSheet nativo

---

## 🚀 Como Rodar o Projeto

Certifique-se de ter o Node.js instalado na sua máquina.

### 1. Instalar dependências

npm install

### 2. ⚠️ Configuração de Segurança (Firebase Credentials)

Por motivos de segurança, o arquivo firebase-credentials.json localizado na pasta fitway-backend NÃO está incluído no repositório (está no .gitignore).

O projeto não funcionará sem esse arquivo.

### 3. Iniciar a aplicação

npm start

Após rodar o comando:

- Pressione "a" para Android
- Pressione "i" para iOS
- Pressione "w" para Web
- Ou escaneie o QR Code com o Expo Go

---

## 📂 Estrutura de Pastas

- app/ → Rotas (Expo Router)
- src/controllers/ → Lógica de negócio
- src/models/ → Dados e integração com banco
- src/views/ → Interface (UI)
- src/config/ → Configurações (Firebase)
- components/ → Componentes reutilizáveis
- fitway-backend/ → Backend Node.js + credenciais

---

Desenvolvido pela equipe DevSystem 💚
