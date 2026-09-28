const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const products = [
  {
    id: "quadro",
    name: "Quadro de Lótus",
    description: "Um quadro pintado pela Balle",
    price: 210,
    category: "Fisico",
    image: "./images/quadro.jpg"
  },
  {
    id: "quebra",
    name: "Quebra Cabeça",
    description: "Um quebra cabeça de 1000 peças de uma arte do Yoshitomo Nara",
    price: 420,
    category: "Fisico",
    image: "./images/quebra.jpg.jpg"
  },
  {
    id: "luz",
    name: "Luminária Cogumelo",
    description: "Uma luminária de mesa pra decorar a sua sala",
    price: 990,
    category: "Fisico",
    image: "./images/luz.jpg"
  }
];

app.get("/api/products", (req, res) => {
  res.json(products);
});

app.post("/api/create-checkout", async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Carrinho vazio." });
  }

  const normalizedItems = items.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) throw new Error(`Produto inválido: ${item.id}`);

    return {
      quantity: Math.max(1, Number(item.quantity) || 1),
      price: product.price,
      description: product.name
    };
  });

  const total = normalizedItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  res.json({
    demo: true,
    total,
    message: "Checkout preparado. Conecte aqui a API real da InfinitePay.",
    items: normalizedItems
  });
});

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Balle Shop rodando em http://localhost:${PORT}`);
});