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
  try {
    const response = await fetch("/api/products");
    products = await response.json();
    renderProducts();
    renderCart();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
  }
}

function renderProducts() {
  productsEl.innerHTML = products.map((product) => `
    <article class="product">
      <div class="product-art">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <div class="product-bottom">
        <span class="price">${money(product.price * 100)}</span>
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
  // Ignora do carrinho qualquer item que não exista mais na lista oficial de produtos
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
  cartTotalEl.textContent = money(total * 100);
  checkoutButton.disabled = detailedCart.length === 0;

  if (detailedCart.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty">Seu carrinho está vazio.<br>Escolha alguma coisa para continuar.</p>`;
    return;
  }

  cartItemsEl.innerHTML = detailedCart.map(item => `
    <div class="cart-item">
      <div>
        <strong>${item.product.name}</strong><br>
        <small>${money(item.product.price * 100)} cada</small>
        <div class="quantity">
          <button onclick="changeQuantity('${item.id}', -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <strong>${money(item.product.price * item.quantity * 100)}</strong>
    </div>
  `).join("");
}

async function createCheckout() {
  if (cart.length === 0) return;

  checkoutButton.disabled = true;
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

    // A InfinitePay pode retornar o link em 'url', 'checkout_url' ou 'link'
    const redirectUrl = data.url || data.checkout_url || data.link;

    if (redirectUrl) {
      checkoutMessage.textContent = "Redirecionando para o pagamento...";
      // Limpa o carrinho ao avançar para o pagamento
      localStorage.removeItem("balle-cart");
      window.location.href = redirectUrl;
      return;
    }

    throw new Error("URL de pagamento não encontrada na resposta.");
  } catch (error) {
    console.error("Erro no checkout:", error);
    checkoutMessage.textContent = error.message;
    checkoutButton.disabled = false;
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