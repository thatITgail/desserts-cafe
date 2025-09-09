window.addEventListener("DOMContentLoaded", () => {
  const menuContainer = document.querySelector(".product-wrapper");
  const veil = document.querySelector(".veil");
  let cart = [];
  let desserts = []; // we'll store the fetched products globally for re-rendering

  // Load cart from localStorage if available
  function loadCartFromStorage(){
    const storedCart = localStorage.getItem("cart");
    console.log(storedCart)
    if(storedCart){
      cart = JSON.parse(storedCart);
      updateCartUI();
    }
  }
  // 🔹 Fetch menu
  fetch("./public/data.json")
    .then((response) => response.json())
    .then((data) => {
      desserts = data;
      loadCartFromStorage();
      renderMenu();
    })
    .catch((error) => {
      console.error("Error loading menu:", error);
      menuContainer.innerHTML = `<p>Sorry, the menu could not be loaded.</p>`;
    });

  // 🔹 Build product button markup
  function getProductButtonMarkup(product) {
    const inCart = cart.find((item) => item.name === product.name);
    if (inCart) {
      return `
        <div class="quantity-controls" data-name="${product.name}">
          <button class="decrement-btn quantity-btn">
            <img src="./assets/images/icon-decrement-quantity.svg" class="cart-icon"/>
          </button>  
          <span class="quantity">${inCart.quantity}</span>
          <button class="increment-btn quantity-btn">
            <img src="./assets/images/icon-increment-quantity.svg" class="cart-icon"/>
          </button>
        </div>
      `;
    } else {
      return `
        <button class="add-to-cart" data-name="${product.name}">
          <img src="./assets/images/icon-add-to-cart.svg" class="cart-icon"/>
          <span class="btn-text"> Add to cart</span>
        </button>
      `;
    }
  }

  // 🔹 Render all menu items
  function renderMenu() {
    menuContainer.innerHTML = "";
    desserts.forEach((dessert) => {
      const productCard = document.createElement("product");
      productCard.classList.add("product");

      const inCart = cart.find(item => item.name === dessert.name);

      productCard.innerHTML = `
        <div class="product-image-container ${inCart ? 'selected' : ''}">
          <picture>
            <source media="(min-width: 1024px)" srcset="${dessert.image.desktop}">
            <source media="(min-width: 768px)" srcset="${dessert.image.tablet}">
            <source media="(max-width: 767px)" srcset="${dessert.image.mobile}">
            <img src=${dessert.image.thumbnail} alt="${dessert.name}" class="image">
          </picture>
          ${getProductButtonMarkup(dessert)}
        </div>
        <div class="product-content">
          <p class="product-title">${dessert.name}</p>
          <h2 class="product-description">${dessert.category}</h2>
          <p class="product-price">$${dessert.price.toFixed(2)}</p>
        </div>
      `;

      menuContainer.appendChild(productCard);
      attachProductListeners(productCard, dessert);
    });
  }

  // 🔹 Attach listeners to product buttons
  function attachProductListeners(productCard, product) {
    const addBtn = productCard.querySelector(".add-to-cart");
    const incBtn = productCard.querySelector(".increment-btn");
    const decBtn = productCard.querySelector(".decrement-btn");

    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addToProductCart(product);
        renderMenu(); // refresh product buttons
      });
    }

    if (incBtn) {
      incBtn.addEventListener("click", () => {
        addToProductCart(product);
        renderMenu();
      });
    }

    if (decBtn) {
      decBtn.addEventListener("click", () => {
        decrementFromCart(product.name);
        renderMenu();
      });
    }
  }

  // 🔹 Add product to cart
  function addToProductCart(product) {
    const existingProduct = cart.find((item) => item.name === product.name);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    saveCartToStorage();
    updateCartUI();
  }

  // 🔹 Decrement quantity or remove item
  function decrementFromCart(productName) {
    const product = cart.find((item) => item.name === productName);
    if (product) {
      product.quantity--;
      if (product.quantity <= 0) {
        cart = cart.filter((item) => item.name !== productName);
      }
    }
    saveCartToStorage();
    updateCartUI();
  }

  // 🔹 Update cart UI
  function updateCartUI() {
    const emptyCart = document.querySelector(".cart-container");
    const itemsContainer = document.querySelector(".cart-wrapper");
    const cartHeader = document.querySelector(".cart-header");

    const cartQuantity = cart.reduce(
      (total, product) => total + product.quantity,
      0
    );

    cartHeader.innerHTML = `Your Cart <span class="no-of-items">(${cartQuantity})</span>`;
    itemsContainer.innerHTML = "";

    if (cart.length === 0) {
      emptyCart.style.display = "block";
    } else {
      emptyCart.style.display = "none";

      const cartItems = document.createElement("ul");
      cartItems.classList.add("cart-selections");

      cartItems.innerHTML = cart
        .map((product) => {
          return `
            <li class="flex">
              <div class="cart-content">
                <p class="item-title">${product.name}</p>
                <span class="no-of-times-selected">${product.quantity}x</span>
                <span class="item-price">@ $${product.price.toFixed(2)}</span>
                <span class="total">$${(
                  product.quantity * product.price
                ).toFixed(2)}</span>
              </div>
              <button class="close-btn" data-name="${product.name}">
                <img src="./assets/images/icon-remove-item.svg" class="close-icon"/>
              </button>
            </li>
            <hr>
          `;
        })
        .join("");

      itemsContainer.appendChild(cartItems);

      // delete item buttons
      const delButtons = cartItems.querySelectorAll(".close-btn");
      delButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const productName = button.dataset.name;
          deleteItem(productName);
        });
      });
    }

    // order summary
    const total = cart.reduce(
      (sum, product) => sum + product.quantity * product.price,
      0
    );

    const summary = document.createElement("div");
    summary.classList.add("lower-content");

    summary.innerHTML = `
       <div class="summary flex">
          <p class="summary-text">Order Total</p>
          <h5 class="net-total">$${total.toFixed(2)}</h5>
        </div>
        <div class="safety">
          <img src="./assets/images/icon-carbon-neutral.svg" class="img" />
          <p class="safety-text">This is a <em>carbon-neutral</em> delivery</p>
        </div>
        <button class="confirm-order-btn">
          Confirm Order
        </button>
    `;
    if(cart.length === 0){
      summary.innerHTML = "";
    }
    itemsContainer.appendChild(summary);
    attachOrderConfirmation();
  }

  // 🔹 Delete item completely
  function deleteItem(productName) {
    cart = cart.filter((product) => product.name !== productName);
    saveCartToStorage();
    updateCartUI();
    renderMenu(); // reset product button back to "Add to Cart"
  }

  // Save cart to localStorage whenever it updates
  function saveCartToStorage(){
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  function attachOrderConfirmation() {
  const confirmBtn = document.querySelector(".confirm-order-btn");
  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      showOrderConfirmation();
    });
  }
}

function showOrderConfirmation() {
  const confirmation = document.querySelector(".order-confirmation");
  const itemsList = confirmation.querySelector(".order");

  // Fill in cart info
  itemsList.innerHTML = cart
    .map(
      (item) => `
        <li class="flex order-content">
          <img src=${item.image.thumbnail} class="order-image"/>
          <div class="cart-content order-details">
            <h4 class="item-title">${item.name}</h4>
            <span class="no-of-times-selected">${item.quantity}x</span>
            <span class="item-price">@ $${(item.price).toFixed(2)}</span>
          </div>
          <p class="total">$${(item.price * item.quantity).toFixed(2)}</p>
        </li>
        <hr>
      `
    ).join("");

    const totalDisplay = document.createElement("div");
    totalDisplay.classList.add("flex");

  const total = cart.reduce(
    (sum, product) => sum + product.quantity * product.price,
    0
  );
  totalDisplay.innerHTML = `
    <p class="summary-text">Order Total</p>
      <h5 class="net-total" id="order-total">$${(total).toFixed(2)}</h5>
  `;
  itemsList.appendChild(totalDisplay);
  veil.classList.remove("hidden");
  confirmation.classList.remove("hidden");
}

// close confirmation
document.addEventListener("click", (e) => {
  if (e.target.id === "close-btn") {
    document.querySelector(".order-confirmation").classList.add("hidden");
    veil.classList.add("hidden");

    cart = []; // clear cart after order
    localStorage.removeItem("cart");
    updateCartUI();
    renderMenu();
  }
});

});
