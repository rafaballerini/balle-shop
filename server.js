const express = require("express");
const path = require("path");
require('dotenv').config();

const app = express();
const PORT = 3000;;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

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

app.post("/api/create-checkout", async (req, res) => {
  try {
    const { items} = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Carrinho vazio." });
    }

    const normalizedItems = items
  .map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return null;

    return {
      quantity: Math.max(1, Number(item.quantity) || 1),
      price: Math.round(product.price * 100),
      description: product.name
    };
  })
  .filter(Boolean);

if (normalizedItems.length === 0) {
  return res.status(400).json({ error: "Nenhum produto válido no carrinho." });
}

    // Montagem do payload da API da InfinitePay
    const payload = {
      handle: "rafaella-ballerini",
      items: normalizedItems
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

app.post("/api/webhooks/infinitepay", (req, res) => {
  const notification = req.body;

  console.log("Notificação recebida da InfinitePay:", notification);

  res.status(200).send("OK");
});

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Balle Shop rodando em http://localhost:${PORT}`);
});