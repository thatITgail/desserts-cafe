# Frontend Mentor - Product list with cart solution

This is a solution to the [Product list with cart challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/product-list-with-cart-5MmqLVAp_d). Frontend Mentor challenges help you improve your coding skills by building realistic projects. 

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
- [Author](#author)

## Overview

### The challenge

Users should be able to:

- Add items to the cart and remove them
- Increase/decrease the number of items in the cart
- See an order confirmation modal when they click "Confirm Order"
- Reset their selections when they click "Start New Order"
- View the optimal layout for the interface depending on their device's screen size
- See hover and focus states for all interactive elements on the page

### Screenshot

![](./preview.jpg)

### Links

- Solution URL: [Add solution URL here](https://your-solution-url.com)
- Live Site URL: [Add live site URL here](https://your-live-site-url.com)

## My process

### Built with

- Semantic HTML5 markup
- CSS custom properties
- Flexbox
- CSS Grid
- Mobile-first workflow
- Vanilla JavaScript

### What I learned

- The use of fetch method to make an API request(in this case a data.json file) and display the fetched data(desserts).

```js
  const menuContainer = document.querySelector(".menu-wrapper");
  let desserts = [];
  let cart = [];

  fetch("./public/data.json")
  .then((res) => res.json())
  .then((data) => {
    desserts = data;
    loadFromstorage();
    renderMenu();
  })
  .catch((error) => {
    consol.log("Error Loading Menu", error);
    menuContainer.innerHTMl = `<p>Sorry, the menu could not be loaded.</p>`
  })
```

- The difference between forEach() and map() methods.forEach() performs an action on each item of an array and doesn't return a new array while map() returns a new array after peforming a specified action. Also,join("") is used to concatenate all the strings in the array into a single array without any separator(not needed in JSX though).

```js
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
  });

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
```
-In Vanilla JS, you can't directly use an if/else statement or tenary logic within a template literal.The solution is to wrap it in a variable and use the variable name within the template literal.

```js
   function dynamicBtnDisplay(product){
    const inCart = cart.find(item => item.name === product.name);
    const btn = incart ? 
    `<div class="flex">
      <button class="increase-btn" ${product.name}>
        <span>plus icon</span>
        ${inCart.quantity}
      </button>
      <button class="reduce-btn" ${product.name}>
        <span>minus icon</span>
        ${inCart.quantity}
      </button>
    </div>`
    : 
    `<button class="add-to-cart" ${product.name}>Add to cart </button>`
    return btn;
   }

   function renderMenu(){
      desserts.forEach((dessert) => {
        productCard.innerHTML = `
        //  other displayed item
        ${dynamicBtnDisplay(dessert)}
       `
     });
    }
```
- The use of toFixed() to format a number to a specified number of decimal places. Note: It returns a string.

```js
  `<span class="item-price">@ $${(item.price).toFixed(2)}</span>`
```
- The use of reduce method to calculate the sum total of ordered items in the cart

```js
  const total = cart.reduce(sum, product => sum + product.quantity * product.price, 0);
```
- The use of insertBefore() to add an element before another specified element within the same parent container;

```js
  const itemsList = documnent.querySelector("ul");
  itemsLis.innerHTML = cart.map(item => `<li>${item}<li>`.join(""));
  const reference = container.lastElementChild;
  container.insertBefore(itemsList, reference)
```

- How to save, remove and load items from the local storage.

```js
   function loadCartFromStorage(){
    const storedCartItems = localStorage.getItem("cart");
    if(storedCart){
      cart = JSON.parse(storedCart);
      upadetcartUI(); //To reload the cart
    }
   }

   function saveCartToStorage(){
    localStorage.setItem("cart", JSON.stringify(cart));
    if(cart.length === 0){
      localStorage.removeItem("cart");
    }
   };

```
## Author

- Website - [Michelle Dim](https://www.your-site.com)
- Twitter - [@Mich_ellene](https://www.twitter.com/Mich_ellene)

