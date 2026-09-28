let products = [];
let cart = JSON.parse(localStorage.getItem("balle-cart") || "[]");

const productsEl = document.getElementById("products");
const cartItemsEl = document.getElementById("cartItems");
const cartCountEl = document.getElementById("cartCount");
const cartTotalEl = document.getElementById("cartTotal");
const drawer = document.getElementById("cartDrawer");
const overlay = document.getElementById("overlay");
const checkoutButton = document.getElementById("checkoutButton");
const checkoutMessage = document.getElementById("checkoutMessage");

const money = (cents) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(cents / 100);

async function loadProducts() {
  const response = await fetch("/api/products");
  products = await response.json();
  renderProducts();
  renderCart();
}

function renderProducts() {
  productsEl.innerHTML = products.map((product, index) => `
    <article class="product">
      <div class="product-art">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="product-bottom">
        <span class="price">${money(product.price)}</span>
        <button class="add-button" onclick="addToCart('${product.id}')">
          Adicionar
        </button>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveCart();
  renderCart();
  openCart();
}

function changeQuantity(id, delta) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem("balle-cart", JSON.stringify(cart));
}

function renderCart() {
  const detailedCart = cart.map(item => ({
    ...item,
    product: products.find(product => product.id === item.id)
  })).filter(item => item.product);

  const count = detailedCart.reduce((sum, item) => sum + item.quantity, 0);
  const total = detailedCart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  cartCountEl.textContent = count;
  cartTotalEl.textContent = money(total);
  checkoutButton.disabled = detailedCart.length === 0;

  if (detailedCart.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty">Seu carrinho está vazio.<br>Escolha alguma coisa para continuar.</p>`;
    return;
  }

  cartItemsEl.innerHTML = detailedCart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.product.name}</strong><br>
        <small>${money(item.product.price)} cada</small>
        <div class="quantity">
          <button onclick="changeQuantity('${item.id}', -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <strong>${money(item.product.price * item.quantity)}</strong>
    </div>
  `).join("");
}

async function createCheckout() {
  checkoutMessage.textContent = "Criando checkout...";

  try {
    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: cart })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Não foi possível criar o checkout.");
    }

    if (data.demo) {
      checkoutMessage.textContent =
        "Modo demonstração: o carrinho chegou ao backend. Agora conectaremos a API real da InfinitePay.";
      return;
    }

    window.location.href = data.url;
  } catch (error) {
    checkoutMessage.textContent = error.message;
  }
}

function openCart() {
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  overlay.classList.add("visible");
}

function closeCart() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
  overlay.classList.remove("visible");
}

document.getElementById("cartButton").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
checkoutButton.addEventListener("click", createCheckout);

loadProducts();