require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit'); // 👉 Nova dependência para PDF

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

// =========================================================
// ROTAS DE RECUPERAÇÃO E LOGIN (MANTIDAS)
// =========================================================

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
      codigo: codigo,
      expiraEm: expiraEm,
      criadoEm: new Date()
    });

    const mailOptions = {
      from: '"Equipe FitWay 🥗" <devsystemimpacta@gmail.com>',
      to: email,
      subject: 'Seu código de recuperação - FitWay',
      html: `<div style="font-family: Arial; text-align: center;"><h2 style="color: #8CC63F;">FitWay</h2><p>Código: <b>${codigo}</b></p></div>`
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ sucesso: true });
  } catch (error) {
    return res.status(500).json({ erro: "Erro interno." });
  }
});

app.post('/verificar-codigo', async (req, res) => {
  const { email, codigo } = req.body;
  try {
    const doc = await db.collection('CodigosRecuperacao').doc(email).get();
    if (!doc.exists || doc.data().codigo !== String(codigo)) return res.status(400).json({ message: "Inválido" });
    return res.status(200).json({ message: "OK" });
  } catch (error) { return res.status(500).json({ message: "Erro" }); }
});

app.post('/atualizar-senha', async (req, res) => {
  const { email, novaSenha } = req.body;
  try {
    const userRecord = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(userRecord.uid, { password: novaSenha });
    await db.collection('CodigosRecuperacao').doc(email).delete();
    return res.status(200).json({ message: "Sucesso" });
  } catch (error) { return res.status(500).json({ message: "Erro" }); }
});

app.post('/enviar-codigo-login', async (req, res) => {
  const { email } = req.body;
  try {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    const expiraEm = new Date();
    expiraEm.setMinutes(expiraEm.getMinutes() + 10);
    await db.collection('CodigosLogin').doc(email).set({ codigo, expiraEm });
    await transporter.sendMail({
      from: '"FitWay 🥗"',
      to: email,
      subject: 'Código de Acesso',
      html: `<h1>${codigo}</h1>`
    });
    return res.status(200).json({ sucesso: true });
  } catch (error) { return res.status(500).json({ erro: "Erro" }); }
});

app.post('/verificar-codigo-login', async (req, res) => {
  const { email, codigo } = req.body;
  try {
    const doc = await db.collection('CodigosLogin').doc(email).get();
    if (!doc.exists || doc.data().codigo !== String(codigo)) return res.status(400).json({ erro: "Inválido" });
    const userRecord = await admin.auth().getUserByEmail(email);
    const token = await admin.auth().createCustomToken(userRecord.uid);
    return res.status(200).json({ token });
  } catch (error) { return res.status(500).json({ erro: "Erro" }); }
});

// =========================================================
// ROTA 6: ENVIAR NOTA FISCAL EM PDF
// =========================================================
app.post('/enviar-nota-fiscal', async (req, res) => {
  const { email, itens, subtotal, taxaEntrega, totalFinal, idPedido } = req.body;

  if (!email || !itens) {
    return res.status(400).json({ erro: "Dados insuficientes." });
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
        text: 'Olá! Obrigado por comprar no FitWay. Sua nota fiscal está em anexo.',
        attachments: [
          {
            filename: `NotaFiscal_FitWay_${idPedido.substring(0, 8)}.pdf`,
            content: pdfData
          }
        ]
      };

      await transporter.sendMail(mailOptions);
      console.log(`[PDF ENVIADO] ${email}`);
    });

    // --- DESENHANDO O PDF ---
    doc.fillColor('#8CC63F').fontSize(22).text('FITWAY - RECIBO DE COMPRA', { align: 'center' });
    doc.moveDown();
    
    doc.fillColor('#333').fontSize(10).text(`ID DO PEDIDO: ${idPedido}`);
    doc.text(`DATA: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`);
    doc.moveDown();
    doc.text('----------------------------------------------------------------------------------------------------');
    doc.moveDown();

    // Cabeçalho da Tabela
    doc.fontSize(12).text('Item', 50, doc.y, { continued: true });
    doc.text('Qtd', 350, doc.y, { continued: true });
    doc.text('Preço', 450, doc.y);
    doc.moveDown(0.5);

    // Itens
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

    // Totais
    doc.fontSize(12);
    doc.text(`SUBTOTAL: R$ ${subtotal.toFixed(2)}`, { align: 'right' });
    doc.text(`TAXA ENTREGA: R$ ${taxaEntrega.toFixed(2)}`, { align: 'right' });
    doc.moveDown(0.5);
    doc.fillColor('#8CC63F').fontSize(16).text(`TOTAL FINAL: R$ ${totalFinal.toFixed(2)}`, { align: 'right' });

    doc.moveDown(5);
    doc.fontSize(8).fillColor('#999').text('FitWay Alimentação Saudável LTDA - Documento sem valor fiscal (Simulação Acadêmica)', { align: 'center' });

    doc.end();
    return res.status(200).json({ sucesso: true });

  } catch (error) {
    console.error("Erro PDF:", error);
    return res.status(500).json({ erro: "Erro ao gerar PDF." });
  }
});

// --- INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor FitWay rodando na porta ${PORT} 🥗`);
});