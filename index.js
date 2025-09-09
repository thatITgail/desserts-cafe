//selecting elements
window.addEventListener("DOMContentLoaded", (e) => {
  e.preventDefault();
  const menuContainer = document.querySelector(".product-wrapper");
  const veil = document.querySelector(".veil");

  // Initialize cart and product array
  let cart = [];
  let desserts = [];

  // Display cart items from local storage if available
  function loadCartFromStorage(){
    const storedCart = localStorage.getItem("cart");
    if(storedCart){
      cart = JSON.parse(storedCart);
      updateCartUI();
    }
  }

  // Dynamically fetch and display products
  fetch("./public/data.json")
    .then((Response) => Response.json())
    .then((data) => {
      desserts = data;
      loadCartFromStorage();
      renderMenu();
    })
    .catch((error) => {
      console.log("Error Loading Menu", error)
      menuContainer.innerHTML = `<p>Sorry, the menu could not be loaded.</p>`
    })
  
  // Display all menu items
  function renderMenu(){
    menuContainer.innerHTML= "";
    desserts.forEach((dessert) => {
      const productCard = document.createElement("article");
      productCard.classList.add("product");

      const inCart = cart.find((item) => item.name === dessert.name);

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
          <p class="product-price">$${(dessert.price).toFixed(2)}</p>
        </div>
      `
        menuContainer.appendChild(productCard)

      const addBtn = productCard.querySelectorAll(".add-to-cart");
      const incrementBtn = productCard.querySelectorAll(".increment-btn");
      const decrementBtn = productCard.querySelectorAll(".decrement-btn");
      
      addBtn.forEach((btn) => {
        btn.addEventListener("click", () => {
          addToCart(dessert);
          renderMenu();
        })
      });
      incrementBtn.forEach((btn) => {
        btn.addEventListener("click", () => {
          addToCart(dessert);
          renderMenu()
        })
      });
      decrementBtn.forEach((btn) => {
        btn.addEventListener("click", () => {
          decrementFromCart(dessert.name);
          renderMenu();
        })
      })
    })
  };

  // Display product button markup
  function getProductButtonMarkup(product){
    const inCart = cart.find((item) => item.name === product.name);

    // Dynamically display the button fit for the search 
    const displayBtn = inCart ? 
      `<div class="quantity-controls">
        <button class="decrement-btn quantity-btn" data-name="${product.name}">
          <img src="./assets/images/icon-decrement-quantity.svg" class="cart-icon"/>
        </button>  
        <span class="quantity">${inCart.quantity}</span>
        <button class="increment-btn quantity-btn" data-name="${product.name}">
          <img src="./assets/images/icon-increment-quantity.svg" class="cart-icon"/>
        </button>
       </div>
      `
      : 
     `<button class="add-to-cart" data-name="${product.name}">
        <img src="./assets/images/icon-add-to-cart.svg" class="cart-icon"/>
          <span class="btn-text"> Add to cart</span>
      </button>
    `;
    return displayBtn;
  };
  
  // Display cart selections
  function updateCartUI(){
    const emptyCart = document.querySelector(".cart-container");
    const itemsContainer = document.querySelector(".cart-wrapper");
    const cartNum = document.querySelector(".no-of-items");

    // Caculate and display no of items in the cart
    const cartQuantity = cart.reduce((total, product) => total + product.quantity, 0);

    cartNum.textContent = `(${cartQuantity})`;

    // Summary section
    const summary = document.createElement("div");
    summary.classList.add("lower-content");

    
    // Remove initial cart content 
    itemsContainer.innerHTML = "";

    if(cart.length === 0){
      emptyCart.style.display = "block";
      summary.innerHTML = "";
    }else{
      emptyCart.style.display = "none";
      
      const cartItems = document.createElement("ul");
      cartItems.classList.add("cart-selections");

      cartItems.innerHTML = cart
        .map((item) => {
          return `
            <li class="flex">
              <div class="cart-content">
                <p class="item-title">${item.name}</p>
                <span class="no-of-times-selected">${item.quantity}x</span>
                <span class="item-price">@ $${(item.price).toFixed(2)}</span>
                <span class="total">$${(item.quantity * item.price).toFixed(2)}</span>
              </div> 
              <button class="close-btn" data-name="${item.name}">
                <img src="./assets/images/icon-remove-item.svg" class="close-icon"/>
              </button>
            </li>
            <hr>
          `
        }).join("")
      itemsContainer.appendChild(cartItems);

      // Delete items from cart
      const delBtns = cartItems.querySelectorAll(".close-btn");
      
      delBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          const productName = btn.dataset.name;
          deleteItem(productName);
        })
      })

      // order summary
      const netTotal = cart.reduce((total, product) => total + product.quantity * product.price, 0);

      summary.innerHTML = `
        <div class="summary flex">
          <p class="summary-text">Order Total</p>
          <h5 class="net-total">$${(netTotal).toFixed(2)}</h5>
        </div>
        <div class="safety">
          <img src="./assets/images/icon-carbon-neutral.svg" class="img" />
          <p class="safety-text">This is a <em>carbon-neutral</em> delivery</p>
        </div>
        <button class="confirm-order-btn">
          Confirm Order
        </button>
      `;
      itemsContainer.appendChild(summary);

      const confirmBtn = document.querySelector(".confirm-order-btn");

      confirmBtn.addEventListener("click", () => {
        showOrderConfirmation()
      })
    }
  };

  //Add product to cart
  function addToCart(product){
    const existingProduct = cart.find(item => item.name === product.name);

    if(existingProduct){
      existingProduct.quantity++;
    }else{
      cart.push({...product, quantity: 1});
    }
    saveCartToStorage()
    updateCartUI()
  };

  // Decrease no of item from cart or remove from cart
  function decrementFromCart(productName){
    const product = cart.find((item) => item.name === productName);
    if(product){
      product.quantity--;
      if(product.quantity <= 0){
        cart = cart.filter(item => item.name !== productName)
      }
    }
    saveCartToStorage();
    updateCartUI()
  };

  function deleteItem(productName){
    cart = cart.filter(item => item.name !== productName);

    saveCartToStorage();
    updateCartUI();
    renderMenu();
  };

  // Display confirmed Order list
  function showOrderConfirmation(){
    const confirmation = document.querySelector(".order-confirmation");
    const itemsList = confirmation.querySelector(".cart-selections");

    itemsList.innerHTML = cart
      .map((item) => {
       return  `
        <li class="flex order-content">
          <img src=${item.image.thumbnail} class="order-image"/>
          <div class="cart-content order-details">
            <h4 class="item-title">${item.name}</h4>
            <span class="no-of-times-selected">${item.quantity}x</span>
            <span class="item-price">@ $${(item.price).toFixed(2)}</span>
          </div>
          <p class="total">$${(item.quantity * item.price).toFixed(2)}</p>
        </li>
        <hr>
      `
    }).join("");

    const lastChild = confirmation.lastElementChild;

    confirmation.insertBefore(itemsList, lastChild);

    const netTotal = confirmation.querySelector(".net-total");

    const total = cart.reduce((total, product) => total + product.quantity * product.price, 0);

    netTotal.textContent = `$${(total).toFixed(2)}`
    
    confirmation.classList.remove("hidden")
    veil.classList.remove("hidden");
  }

  document.addEventListener("click", (e) => {
    if(e.target.id === "close-btn"){
      document.querySelector(".order-confirmation").classList.add("hidden");
      veil.classList.add("hidden");

      localStorage.removeItem("cart");
      cart = [];
      updateCartUI();
      renderMenu();
    }
  })

  // Add to local storage
  function saveCartToStorage(){
    localStorage.setItem("cart", JSON.stringify(cart))
  }
})
