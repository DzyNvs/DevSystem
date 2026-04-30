require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

// --- INICIALIZAÇÃO DO FIREBASE ---
const serviceAccount = require('./firebase-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();

app.use(cors());
app.use(express.json());

// --- CONFIGURAÇÃO DO NODEMAILER ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'devsystemimpacta@gmail.com', 
    pass: 'lcnyxzrlxymbumjz'      
  }
});

// --- TEMPLATE VISUAL PARA E-MAILS DE CÓDIGO ---
const gerarEmailTemplate = (codigo, mensagem) => `
  <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; color: #333; padding: 40px; background-color: #f9f9f9;">
    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <h1 style="color: #2E7D32; margin-bottom: 5px; font-size: 32px;">FitWay</h1>
      <p style="font-size: 16px; color: #666; margin-bottom: 25px;">${mensagem}</p>
      
      <div style="background-color: #F4FBF4; border: 2px dashed #8CC63F; border-radius: 10px; padding: 20px; display: inline-block; margin-bottom: 25px;">
        <span style="font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #111;">
          ${codigo}
        </span>
      </div>
      
      <p style="font-size: 13px; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
        Este código expira em <b>10 minutos</b>.<br>
        Se você não solicitou este acesso, apenas ignore este e-mail.
      </p>
    </div>
  </div>
`;

// =========================================================
// ROTAS DE RECUPERAÇÃO E LOGIN
// =========================================================

// 1. Enviar código para Recuperação de Senha
app.post('/esqueci-senha', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ erro: "E-mail não fornecido." });

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
      codigo,
      expiraEm,
      criadoEm: new Date()
    });

    await transporter.sendMail({
      from: '"Equipe FitWay 🥗" <devsystemimpacta@gmail.com>',
      to: email,
      subject: 'Seu código de recuperação - FitWay',
      html: gerarEmailTemplate(codigo, 'Seu código de acesso seguro para <b>recuperar sua senha</b> é:')
    });

    return res.status(200).json({ sucesso: true });
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno ao processar recuperação." });
  }
});

// 2. Verificar código de recuperação
app.post('/verificar-codigo', async (req, res) => {
  const { email, codigo } = req.body;
  try {
    const doc = await db.collection('CodigosRecuperacao').doc(email).get();
    if (!doc.exists || doc.data().codigo !== String(codigo)) {
      return res.status(400).json({ message: "Código inválido ou expirado." });
    }
    return res.status(200).json({ message: "OK" });
  } catch (error) { 
    return res.status(500).json({ message: "Erro ao verificar código." }); 
  }
});

// 3. Atualizar Senha Final
app.post('/atualizar-senha', async (req, res) => {
  const { email, novaSenha } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, { password: novaSenha });
    await db.collection('CodigosRecuperacao').doc(email).delete();
    return res.status(200).json({ message: "Senha atualizada com sucesso!" });
  } catch (error) { 
    return res.status(500).json({ message: "Erro ao atualizar senha." }); 
  }
});

// 4. Enviar código de Login (Acesso Rápido)
app.post('/enviar-codigo-login', async (req, res) => {
  const { email } = req.body;
  try {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date();
    expiraEm.setMinutes(expiraEm.getMinutes() + 10);
    
    await db.collection('CodigosLogin').doc(email).set({ codigo, expiraEm });
    
    await transporter.sendMail({
      from: '"FitWay 🥗" <devsystemimpacta@gmail.com>',
      to: email,
      subject: 'Código de Acesso - FitWay',
      html: gerarEmailTemplate(codigo, 'Seu código de acesso seguro para <b>entrar no aplicativo</b> é:')
    });
    
    return res.status(200).json({ sucesso: true });
  } catch (error) { 
    return res.status(500).json({ erro: "Erro ao enviar código de login." }); 
  }
});

// 5. Verificar código de Login e gerar Token
app.post('/verificar-codigo-login', async (req, res) => {
  const { email, codigo } = req.body;
  try {
    const doc = await db.collection('CodigosLogin').doc(email).get();
    if (!doc.exists || doc.data().codigo !== String(codigo)) {
      return res.status(400).json({ erro: "Código inválido." });
    }
    const userRecord = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(userRecord.uid);
    return res.status(200).json({ token });
  } catch (error) { 
    return res.status(500).json({ erro: "Erro na autenticação." }); 
  }
});

// =========================================================
// ROTA DE NOTA FISCAL (PDF)
// =========================================================

app.post('/enviar-nota-fiscal', async (req, res) => {
  const { email, itens, subtotal, taxaEntrega, totalFinal, idPedido } = req.body;

  if (!email || !itens) {
    return res.status(400).json({ erro: "Dados insuficientes para gerar nota." });
  }

  try {
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    doc.on('end', async () => {
      const pdfData = Buffer.concat(buffers);

      const mailOptions = {
        from: '"FitWay 🥗 - Financeiro" <devsystemimpacta@gmail.com>',
        to: email,
        subject: `Nota Fiscal - Pedido #${idPedido.substring(0, 8)}`,
        text: 'Olá! Sua nota fiscal do FitWay já chegou. Ela está anexada a este e-mail em formato PDF.',
        attachments: [
          {
            filename: `NotaFiscal_FitWay_${idPedido.substring(0, 8)}.pdf`,
            content: pdfData
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      console.log(`[NF ENVIADA] Destinatário: ${email}`);
    });

    // --- CONSTRUÇÃO DO PDF ---
    doc.fillColor('#2E7D32').fontSize(22).text('FITWAY - RECIBO DE COMPRA', { align: 'center' });
    doc.moveDown();
    
    doc.fillColor('#333').fontSize(10).text(`ID DO PEDIDO: ${idPedido}`);
    doc.text(`DATA: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`);
    doc.moveDown();
    doc.text('----------------------------------------------------------------------------------------------------');
    doc.moveDown();

    // Cabeçalho
    doc.fontSize(12).text('Item', 50, doc.y, { continued: true });
    doc.text('Qtd', 350, doc.y, { continued: true });
    doc.text('Preço', 450, doc.y);
    doc.moveDown(0.5);

    // Itens da lista
    itens.forEach(item => {
      doc.fontSize(10).fillColor('#555');
      const y = doc.y;
      doc.text(item.nome, 50, y);
      doc.text(item.qtd.toString(), 350, y);
      doc.text(`R$ ${(item.preco * item.qtd).toFixed(2)}`, 450, y);
      doc.moveDown(0.5);
    });

    doc.moveDown();
    doc.fillColor('#333').text('----------------------------------------------------------------------------------------------------');
    doc.moveDown();

    // Resumo de valores
    doc.fontSize(12);
    doc.text(`SUBTOTAL: R$ ${subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`TAXA ENTREGA: R$ ${taxaEntrega.toFixed(2)}`, { align: 'right' });
    doc.moveDown(0.5);
    doc.fillColor('#2E7D32').fontSize(16).text(`TOTAL FINAL: R$ ${totalFinal.toFixed(2)}`, { align: 'right' });

    doc.moveDown(5);
    doc.fontSize(8).fillColor('#999').text('FitWay Alimentação Saudável LTDA - Documento sem valor fiscal (Simulação Acadêmica)', { align: 'center' });

    doc.end();
    return res.status(200).json({ sucesso: true });

  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return res.status(500).json({ erro: "Erro ao gerar nota fiscal." });
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`
  🥗 SERVIDOR FITWAY RODANDO NA PORTA ${PORT}
  `);
});