require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Inicializando o Firebase Admin
const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DO E-MAIL (NODEMAILER) ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'devsystemimpacta@gmail.com', 
    pass: 'lcnyxzrlxymbumjz'      
  }
});

// --- ROTA 1: SOLICITAR RECUPERAÇÃO DE SENHA ---
app.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: "E-mail não fornecido." });
  }

  try {
    const consSnapshot = await db.collection('consumidores').where('email', '==', email).get();
    const restSnapshot = await db.collection('restaurantes').where('email_rest', '==', email).get();

    if (consSnapshot.empty && restSnapshot.empty) {
      return res.status(404).json({ erro: "Credenciais inválidas, revise seus dados e tente novamente" });
    }

    const codigo = Math.floor(100000 + Math.random() * 900000).toString();

    const expiraEm = new Date();
    expiraEm.setMinutes(expiraEm.getMinutes() + 10);

    await db.collection('CodigosRecuperacao').doc(email).set({
      codigo: codigo,
      expiraEm: expiraEm,
      criadoEm: new Date()
    });

    const mailOptions = {
      from: '"Equipe FitWay 🥗" <devsystemimpacta@gmail.com>',
      to: email,
      subject: 'Seu código de recuperação - FitWay',
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
          <h2 style="color: #8CC63F;">FitWay</h2>
          <p>Você solicitou a redefinição da sua senha.</p>
          <p>Insira o código de 6 dígitos abaixo no aplicativo:</p>
          <h1 style="letter-spacing: 5px; color: #000; background: #F8F9FA; padding: 15px; border-radius: 8px; display: inline-block;">${codigo}</h1>
          <p style="font-size: 12px; color: #999;">Este código expira em 10 minutos.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SUCESSO] Código enviado para ${email}`);

    return res.status(200).json({ sucesso: true, mensagem: "Código gerado com sucesso!" });

  } catch (error) {
    console.error("Erro na rota esqueci-senha:", error);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

// --- ROTA 2: VERIFICAR CÓDIGO DE RECUPERAÇÃO ---
app.post('/verificar-codigo', async (req, res) => {
  const { email, codigo } = req.body;

  // Validação básica
  if (!email || !codigo) {
    return res.status(400).json({ message: "E-mail e código são obrigatórios." });
  }

  try {
    // 1. Busca o documento no Firestore usando o e-mail
    const docRef = db.collection('CodigosRecuperacao').doc(email);
    const doc = await docRef.get();

    // 2. Verifica se o documento existe (se a pessoa realmente pediu um código)
    if (!doc.exists) {
      return res.status(400).json({ message: "Nenhum código encontrado. Volte e solicite um novo." });
    }

    const dadosCodigo = doc.data();

    // 3. Verifica se o código digitado é igual ao do banco
    if (dadosCodigo.codigo !== String(codigo)) {
      return res.status(400).json({ message: "Código inválido. Verifique o e-mail e tente novamente." });
    }

    // 4. Verifica se o tempo de 10 minutos já passou
    const agora = new Date();
    const expiraEm = dadosCodigo.expiraEm.toDate(); // Converte de Firestore para JavaScript Date

    if (agora > expiraEm) {
      return res.status(400).json({ message: "Este código expirou. Solicite um novo." });
    }

    // Sucesso! O código está certo e no prazo.
    return res.status(200).json({ message: "Código validado com sucesso!" });

  } catch (error) {
    console.error("Erro na rota verificar-codigo:", error);
    return res.status(500).json({ message: "Erro interno do servidor ao verificar o código." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor do FitWay rodando na porta ${PORT} 🥗`);
});

// --- ROTA 3: ATUALIZAR A SENHA NO FIREBASE AUTH ---
app.post('/atualizar-senha', async (req, res) => {
  const { email, novaSenha } = req.body;

  if (!email || !novaSenha) {
    return res.status(400).json({ message: "E-mail e nova senha são obrigatórios." });
  }

  try {
    // 1. Busca o usuário diretamente no Firebase Authentication usando o e-mail
    const userRecord = await admin.auth().getUserByEmail(email);

    // 2. Atualiza a senha do usuário usando o UID (ID único) dele
    await admin.auth().updateUser(userRecord.uid, {
      password: novaSenha
    });

    console.log(`[SUCESSO] Senha atualizada no Auth para: ${email}`);

    // 3. Limpeza: Apaga o código de recuperação do Firestore para não ser reusado
    await db.collection('CodigosRecuperacao').doc(email).delete();

    return res.status(200).json({ message: "Senha atualizada com sucesso!" });

  } catch (error) {
    console.error("Erro ao atualizar a senha no Firebase Auth:", error);
    
    // O Firebase é inteligente e avisa se o e-mail não existir na aba de Autenticação
    if (error.code === 'auth/user-not-found') {
      return res.status(404).json({ message: "Nenhum usuário encontrado com este e-mail." });
    }

    return res.status(500).json({ message: "Erro interno ao atualizar a senha." });
  }
});