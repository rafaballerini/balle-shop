const express = require("express");
const path = require("path");
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 1. SUA CONFIGURAÇÃO DA INFINITEPAY
// Substitua pelo seu usuário cadastrado no app da InfinitePay (sem o '$')
const INFINITEPAY_HANDLE = process.env.INFINITEPAY_HANDLE;

const products = [
  {
    id: "quadro",
    name: "Quadro de Lótus",
    description: "Um quadro pintado pela Balle",
    price: 2,
    category: "Fisico",
    image: "./images/quadro.jpg"
  },
  {
    id: "quebra",
    name: "Quebra Cabeça",
    description: "Um quebra cabeça de 1000 peças de uma arte do Yoshitomo Nara",
    price: 4.2,
    category: "Fisico",
    image: "./images/quebra.jpg"
  },
  {
    id: "luz",
    name: "Luminária Cogumelo",
    description: "Uma luminária de mesa pra decorar a sua sala",
    price: 9,
    category: "Fisico",
    image: "./images/luz.jpg"
  }
];

app.get("/api/products", (req, res) => {
  res.json(products);
});

// 2. CRIAÇÃO DO LINK DE CHECKOUT (INTEGRAÇÃO REAL)
app.post("/api/create-checkout", async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio." });
    }

    // Normalização dos itens: a InfinitePay exige o valor em centavos
    const normalizedItems = items
  .map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return null;

    return {
      quantity: Math.max(1, Number(item.quantity) || 1),
      price: product.price,
      description: product.name
    };
  })
  .filter(Boolean);

if (normalizedItems.length === 0) {
  return res.status(400).json({ error: "Nenhum produto válido no carrinho." });
}

    const orderNsu = `ORDER-${Date.now()}`;

    // Montagem do payload da API da InfinitePay
    const payload = {
      handle: INFINITEPAY_HANDLE,
      order_nsu: orderNsu,
      items: normalizedItems,
      ...(customer && { customer })
    };

    // Chamada HTTP para a API da InfinitePay
    const response = await fetch("https://api.checkout.infinitepay.io/links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro InfinitePay:", data);
      return res.status(response.status).json({
        error: "Falha ao gerar checkout na InfinitePay.",
        details: data
      });
    }

    // Retorna os dados com a URL para o frontend redirecionar o cliente
    return res.json(data);
  } catch (error) {
    console.error("Erro interno:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

// 3. ROTA DE WEBHOOK (RECEBE NOTIFICAÇÃO DE PAGAMENTO CONFIRMADO)
app.post("/api/webhooks/infinitepay", (req, res) => {
  const notification = req.body;

  /*
    Exemplo de payload recebido quando o cliente conclui o pagamento:
    {
      invoice_slug: "...",
      amount: 21000,
      paid_amount: 21000,
      capture_method: "credit_card" ou "pix",
      order_nsu: "ORDER-...",
      transaction_nsu: "..."
    }
  */
  console.log("Notificação recebida da InfinitePay:", notification);

  // Aqui você atualizaria o status da compra no seu banco de dados
  // Ex: marcar pedido como "PAGO" usando notification.order_nsu

  // Sempre responda 200 rapidamente
  res.status(200).send("OK");
});

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Balle Shop rodando em http://localhost:${PORT}`);
});