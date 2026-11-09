document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const mainCategoryBtns = document.querySelectorAll(".main-cat-btn");
  const subcategoryGroups = document.querySelectorAll(".subcategories-group");
  const productsSection = document.getElementById("productsSection");
  const productsGrid = document.getElementById("productsGrid");
  const cartCount = document.getElementById("cartCount");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const carouselGrid = document.getElementById("carouselGrid");
  const carouselDotsContainer = document.getElementById("carouselDots");
  const checkoutBtn = document.querySelector(".cart-checkout-btn");

  const cartButton =
    document.getElementById("cartButton") ||
    document.querySelector(".cart-button");
  const closeCartBtn =
    document.getElementById("closeCart") ||
    document.querySelector(".cart-close") ||
    document.querySelector(".close-cart");
  const cartDrawer = document.getElementById("cartDrawer");
  const cartOverlay = document.getElementById("cartOverlay");
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");

  const suggestionForm = document.getElementById("suggestionForm");
  const suggestionCategory = document.getElementById("suggestionCategory");
  const suggestionEmail = document.getElementById("suggestionEmail");
  const suggestionText = document.getElementById("suggestionText");
  const suggestionMessage = document.getElementById("suggestionMessage");

  let currentMainCategory = null;
  let currentSubcategory = "todos";
  let allProducts = [];

  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");

  if (slides.length > 0) {
    let currentSlide = 0;

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
      if (dots.length > 0) {
        dots.forEach((dot, i) => {
          dot.classList.toggle("active", i === index);
        });
      }
    }

    setInterval(() => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });
  }

  function showCustomModal(title, message) {
    const existingModal = document.getElementById('customAlertOverlay');
    if (existingModal) existingModal.remove();

    const overlay = document.createElement('div');
    overlay.id = 'customAlertOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '99999';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.25s ease';

    const modal = document.createElement('div');
    modal.style.backgroundColor = 'var(--color-base, #ffffff)';
    modal.style.color = 'var(--color-primary, #4B3621)';
    modal.style.padding = '24px 28px';
    modal.style.borderRadius = '16px';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.25)';
    modal.style.maxWidth = '420px';
    modal.style.width = '90%';
    modal.style.position = 'relative';
    modal.style.transform = 'scale(0.85)';
    modal.style.transition = 'transform 0.25s ease';

    modal.innerHTML = `
      <button id="closeModalX" style="position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; color: var(--color-primary, #4B3621); opacity: 0.7;">✕</button>
      <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: 700; padding-right: 20px;">${title}</h3>
      <p style="font-size: 14px; line-height: 1.5; color: var(--color-muted, #555); margin-bottom: 20px;">${message}</p>
      <button id="closeModalBtn" class="btn-primary" style="width: 100%; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">Entendido</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = '1';
      modal.style.transform = 'scale(1)';
    }, 10);

    const closeModal = () => {
      overlay.style.opacity = '0';
      modal.style.transform = 'scale(0.85)';
      setTimeout(() => overlay.remove(), 250);
    };

    modal.querySelector('#closeModalX').addEventListener('click', closeModal);
    modal.querySelector('#closeModalBtn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
  }

  function renderAllergens(allergenList) {
    if (
      !allergenList ||
      !Array.isArray(allergenList) ||
      allergenList.length === 0
    ) {
      return "";
    }

    const config = {
      gluten: { icon: "🌾", label: "Contiene Gluten", class: "gluten" },
      lacteos: { icon: "🥛", label: "Contiene Lácteos", class: "lacteos" },
      frutos_secos: {
        icon: "🥜",
        label: "Contiene Frutos secos",
        class: "frutos_secos",
      },
      huevos: { icon: "🥚", label: "Contiene Huevo", class: "huevos" },
    };

    const badgesHtml = allergenList
      .map((type) => {
        const item = config[type];
        if (!item) return "";
        return `<span class="allergen-badge ${item.class}" title="${item.label}" aria-label="${item.label}">${item.icon}</span>`;
      })
      .join("");

    return `<div class="allergens-container">${badgesHtml}</div>`;
  }

  function getCurrentUserId() {
    if (typeof getValidSession === "function") {
      const session = getValidSession();
      if (session && session.user && session.user.id) {
        return session.user.id;
      }
    }
    return "guest";
  }

  function isUserLoggedIn() {
    return getCurrentUserId() !== "guest";
  }

  function getUserStorageKey(type) {
    const userId = getCurrentUserId();
    return `hugoffee_${type}_${userId}`;
  }

  function getSavedCart() {
    const userId = getCurrentUserId();
    if (userId === "guest") {
      return JSON.parse(sessionStorage.getItem("hugoffee_cart_guest")) || [];
    }
    return JSON.parse(localStorage.getItem(getUserStorageKey("cart"))) || [];
  }

  function saveCart(cartData) {
    const userId = getCurrentUserId();
    if (userId === "guest") {
      sessionStorage.setItem("hugoffee_cart_guest", JSON.stringify(cartData));
    } else {
      localStorage.setItem(getUserStorageKey("cart"), JSON.stringify(cartData));
    }
  }

  function getSavedFavs() {
    return JSON.parse(localStorage.getItem(getUserStorageKey("favs"))) || [];
  }

  function saveFavs(favsData) {
    localStorage.setItem(getUserStorageKey("favs"), JSON.stringify(favsData));
  }

  let cart = getSavedCart();
  let favorites = getSavedFavs();

  function updateCartUI() {
    cart = getSavedCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;

    if (!cartItemsContainer || !cartTotalElement) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
                <div class="cart-empty-container">
                    <p class="cart-empty">Tu carrito está vacío</p>
                </div>
            `;
      cartTotalElement.textContent = "0,00 €";
    } else {
      cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";
        
        const milkOptionsHtml = item.permiteLeche ? `
            <div style="margin-top: 6px;">
                <label style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 2px;">Tipo de leche:</label>
                <select class="cart-milk-select" data-id="${item.id}" style="padding: 4px 8px; font-size: 12px; border-radius: 6px; border: 1px solid ${!item.tipoLeche ? '#c92a2a' : 'var(--color-muted)'}; background: var(--color-base); color: var(--color-primary);">
                    <option value="" disabled ${!item.tipoLeche ? 'selected' : ''}>Selecciona tipo de leche...</option>
                    <option value="Entera" ${item.tipoLeche === 'Entera' ? 'selected' : ''}>Leche Entera</option>
                    <option value="Semidesnatada" ${item.tipoLeche === 'Semidesnatada' ? 'selected' : ''}>Leche Semidesnatada</option>
                    <option value="Desnatada" ${item.tipoLeche === 'Desnatada' ? 'selected' : ''}>Leche Desnatada</option>
                    <option value="Avena" ${item.tipoLeche === 'Avena' ? 'selected' : ''}>Bebida de Avena</option>
                    <option value="Soja" ${item.tipoLeche === 'Soja' ? 'selected' : ''}>Bebida de Soja</option>
                    <option value="Sin lactosa" ${item.tipoLeche === 'Sin lactosa' ? 'selected' : ''}>Sin lactosa</option>
                </select>
            </div>
        ` : '';

        itemEl.innerHTML = `
                    <div class="cart-item-details" style="width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                            <div>
                                <h4 class="cart-item-title">${item.title}</h4>
                                <span class="cart-item-price">${item.price.toFixed(2).replace(".", ",")} € x ${item.quantity}</span>
                            </div>
                            <div class="cart-item-actions">
                                <div class="cart-quantity-controls">
                                    <button class="cart-qty-btn decrease" data-id="${item.id}">-</button>
                                    <span class="cart-qty-value">${item.quantity}</span>
                                    <button class="cart-qty-btn increase" data-id="${item.id}">+</button>
                                </div>
                                <button class="cart-delete-btn" data-id="${item.id}">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        ${milkOptionsHtml}
                    </div>
                `;
        cartItemsContainer.appendChild(itemEl);
      });

      cartTotalElement.textContent = `${total.toFixed(2).replace(".", ",")} €`;
    }
  }

  const toggleCart = () => {
    if (cartDrawer && cartOverlay) {
      cartDrawer.classList.toggle("active");
      cartOverlay.classList.toggle("active");
    }
  };

  if (cartButton) cartButton.addEventListener("click", toggleCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", toggleCart);
  if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);

  function handleAddToCart(btn) {
    const id = btn.getAttribute("data-id");
    const title = btn.getAttribute("data-title");
    const price = parseFloat(btn.getAttribute("data-price")) || 0;
    const permiteLeche = btn.getAttribute("data-permite-leche") === "true";

    cart = getSavedCart();
    const existingIndex = cart.findIndex((item) => item.id === id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        id,
        title,
        price,
        quantity: 1,
        permiteLeche,
        tipoLeche: null
      });
    }

    saveCart(cart);
    updateCartUI();

    const originalText = btn.textContent;
    btn.textContent = "¡Añadido!";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 1000);
  }

  function handleFavClick(btn) {
    if (!isUserLoggedIn()) {
      localStorage.setItem("redirectAfterLogin", window.location.href);
      window.location.href = "inicioSesion.html";
      return;
    }

    const name = btn.getAttribute("data-name");
    if (!name) return;

    favorites = getSavedFavs();
    const isCurrentlyFav = favorites.includes(name);

    if (isCurrentlyFav) {
      favorites = favorites.filter((fav) => fav !== name);
    } else {
      favorites.push(name);
    }

    saveFavs(favorites);
    syncFavButtonsUI();
  }

  function syncFavButtonsUI() {
    favorites = getSavedFavs();
    document.querySelectorAll(".btn-fav").forEach((btn) => {
      const name = btn.getAttribute("data-name");
      if (!name) return;

      const isFav = favorites.includes(name);
      if (isFav) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  function attachGlobalEvents() {
    document.querySelectorAll(".btn-add").forEach((button) => {
      button.removeEventListener("click", button._cartHandler);
      button._cartHandler = () => handleAddToCart(button);
      button.addEventListener("click", button._cartHandler);
    });

    document.querySelectorAll(".btn-fav").forEach((button) => {
      button.removeEventListener("click", button._favHandler);
      button._favHandler = () => handleFavClick(button);
      button.addEventListener("click", button._favHandler);
    });
  }

  async function fetchProducts() {
    try {
      let response;
      try {
        response = await fetch("/datos/productos.json");
      } catch (e) {
        response = await fetch("datos/productos.json");
      }

      const data = await response.json();
      allProducts = data.productos;

      if (productsGrid) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchParam = urlParams.get("search");
        if (searchParam && searchInput) {
          searchInput.value = searchParam;
        }
        filterProducts();
      }

      if (carouselGrid) {
        renderOtonoCarousel();
      }

      syncFavButtonsUI();
    } catch (error) {
      if (productsGrid) {
        productsGrid.innerHTML =
          '<p class="no-products">Error al cargar los productos. Intenta más tarde.</p>';
      }
    }
  }

  function getScrollStep() {
    const card = carouselGrid.querySelector(".product-card");
    if (!card) return 300;
    const style = window.getComputedStyle(carouselGrid);
    const gap = parseFloat(style.gap) || 20;
    return card.offsetWidth + gap;
  }

  function updateDotsVisibility() {
    if (!carouselGrid || !carouselDotsContainer) return;
    const step = getScrollStep();
    const maxScroll = carouselGrid.scrollWidth - carouselGrid.clientWidth;
    const maxIndex = Math.round(maxScroll / step);
    
    const dots = carouselDotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, idx) => {
      dot.style.display = idx <= maxIndex ? "inline-block" : "none";
    });
  }

  function renderOtonoCarousel() {
    if (!carouselGrid || allProducts.length === 0) return;

    const productosOtono = allProducts.filter(
      (producto) => producto.badge === "OTOÑO"
    );

    carouselGrid.innerHTML = "";

    if (productosOtono.length === 0) {
      carouselGrid.innerHTML =
        '<p class="no-products" style="grid-column: 1/-1; text-align:center;">Próximamente novedades de temporada.</p>';
      return;
    }

    productosOtono.forEach((product) => {
      const isFav = favorites.includes(product.nombre);
      const card = document.createElement("article");
      card.className = "product-card";
      card.setAttribute("data-id", product.id);

      let avgRating = 0;
      let reviewCount = 0;
      if (product.reseñas && product.reseñas.length > 0) {
        reviewCount = product.reseñas.length;
        const sum = product.reseñas.reduce((acc, r) => acc + r.rating, 0);
        avgRating = (sum / reviewCount).toFixed(1);
      }

      const permiteLecheAttr = product.permiteLeche ? 'data-permite-leche="true"' : '';

      card.innerHTML = `
          <div class="badge-container">
              <span class="badge" style="background-color: #d97736; color: white;">${product.badge}</span>
          </div>
          <div class="product-image-container" style="width: 100%; height: 180px; overflow: hidden; border-radius: 8px; margin-bottom: 12px; background: #f5f0eb;">
              <img src="${product.imagen || "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80"}" alt="${product.nombre}" style="width: 100%; height: 100%; object-fit: cover;" />
          </div>
          <!-- CAMBIAMOS LOS NIVELES DE ENCABEZADO A H3, H4, H5 -->
          <h3>${product.nombre}</h3>
          <h4>${product.subtitulo}</h4>
          <h5>${product.descripcion}</h5>
          ${renderAllergens(product.alergenos)}
          <div class="card-footer">
              <p class="product-price">${product.precio.toFixed(2).replace(".", ",")} €</p>
              <div class="card-actions">                    
                  <button class="btn-add" data-id="${product.id}" data-title="${product.nombre}" data-price="${product.precio}" ${permiteLecheAttr}>Añadir</button>
                  <button class="btn-fav ${isFav ? "active" : ""}" aria-label="Añadir a favoritos" data-name="${product.nombre}">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                  </button>
              </div>
          </div>
          ${
            reviewCount > 0
              ? `<div class="card-rating" style="margin-top: 8px; font-size: 0.85rem; color: #666; text-align: center; cursor: pointer;" data-name="${product.nombre}"><span style="color: #f59e0b;">★</span> ${avgRating} (${reviewCount} opiniones)</div>`
              : ""
          }
      `;
      carouselGrid.appendChild(card);
    });

    if (carouselDotsContainer) {
      carouselDotsContainer.innerHTML = "";
      productosOtono.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.className = index === 0 ? "dot active" : "dot";
        carouselDotsContainer.appendChild(dot);
      });

      const newDots = carouselDotsContainer.querySelectorAll(".dot");
      newDots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
          const step = getScrollStep();
          carouselGrid.scrollTo({ left: step * index, behavior: "smooth" });
        });
      });
    }

    attachGlobalEvents();
    
    setTimeout(updateDotsVisibility, 100);
  }

  if (carouselGrid) {
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        carouselGrid.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        carouselGrid.scrollBy({ left: getScrollStep(), behavior: "smooth" });
      });
    }

    carouselGrid.addEventListener("scroll", () => {
      const activeDots = document.querySelectorAll("#carouselDots .dot");
      if (activeDots.length === 0) return;

      const step = getScrollStep();
      const scrollLeft = carouselGrid.scrollLeft;
      const activeIndex = Math.round(scrollLeft / step);

      activeDots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === activeIndex);
      });
    });
    
    window.addEventListener("resize", updateDotsVisibility);
  }

  function renderProducts(products) {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";

    const query = searchInput ? searchInput.value.trim() : "";
    if (products.length === 0) {
      if (query || currentMainCategory) {
        productsGrid.innerHTML =
          '<p class="no-products">No se encontraron productos.</p>';
      }
      return;
    }

    products.forEach((product) => {
      const isFav = favorites.includes(product.nombre);
      const card = document.createElement("article");
      card.className = "product-card";
      card.setAttribute("data-id", product.id);
      card.setAttribute("data-category", product.categoria);
      card.setAttribute("data-subcategory", product.subcategoria);

      const permiteLecheAttr = product.permiteLeche ? 'data-permite-leche="true"' : '';

      card.innerHTML = `
            <div class="badge-container">
                ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
            </div>
            <div class="product-image-container" style="width: 100%; height: 180px; overflow: hidden; border-radius: 8px; margin-bottom: 12px; background: #f5f0eb;">
                <img src="${product.imagen || "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80"}" alt="${product.nombre}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <!-- CAMBIAMOS LOS NIVELES DE ENCABEZADO A H3, H4, H5 -->
            <h3>${product.nombre}</h3>
            <h4>${product.subtitulo}</h4>
            <h5>${product.descripcion}</h5>
            ${renderAllergens(product.alergenos)}
            <div class="card-footer">
                <p class="product-price">${product.precio.toFixed(2).replace(".", ",")} €</p>
                <div class="card-actions">                    
                    <button class="btn-add" data-id="${product.id}" data-title="${product.nombre}" data-price="${product.precio}" ${permiteLecheAttr}>Añadir al carrito</button>
                    <button class="btn-fav ${isFav ? "active" : ""}" aria-label="Añadir a favoritos" data-name="${product.nombre}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

      productsGrid.appendChild(card);
    });

    attachGlobalEvents();
  }

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const id = btn.getAttribute("data-id");
      if (!id) return;

      cart = getSavedCart();
      const itemIndex = cart.findIndex((item) => item.id === id);
      if (itemIndex === -1) return;

      if (btn.classList.contains("increase")) {
        cart[itemIndex].quantity += 1;
      } else if (btn.classList.contains("decrease")) {
        if (cart[itemIndex].quantity > 1) {
          cart[itemIndex].quantity -= 1;
        } else {
          cart.splice(itemIndex, 1);
        }
      } else if (btn.classList.contains("cart-delete-btn")) {
        cart.splice(itemIndex, 1);
      }

      saveCart(cart);
      updateCartUI();
    });

    cartItemsContainer.addEventListener("change", (e) => {
      if (e.target.classList.contains("cart-milk-select")) {
        const id = e.target.getAttribute("data-id");
        const selectedMilk = e.target.value;
        cart = getSavedCart();
        const item = cart.find((i) => i.id === id);
        if (item) {
          item.tipoLeche = selectedMilk;
          saveCart(cart);
          updateCartUI();
        }
      }
    });
  }

  function filterProducts() {
    if (!productsSection || allProducts.length === 0) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    if (!query && !currentMainCategory) {
      renderProducts([]);
      return;
    }

    const filtered = allProducts.filter((product) => {
      const matchesSearch =
        !query ||
        product.nombre.toLowerCase().includes(query) ||
        product.descripcion.toLowerCase().includes(query) ||
        product.subtitulo.toLowerCase().includes(query) ||
        (product.badge && product.badge.toLowerCase().includes(query));

      const matchesCategory =
        !currentMainCategory || product.categoria === currentMainCategory;
      const matchesSubcategory =
        currentSubcategory === "todos" ||
        product.subcategoria === currentSubcategory;

      return matchesSearch && matchesCategory && matchesSubcategory;
    });

    renderProducts(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      if (
        !productsSection &&
        window.location.pathname.indexOf("menu.html") === -1
      ) {
        window.location.href = `menu.html?search=${encodeURIComponent(searchInput.value)}`;
      } else {
        filterProducts();
      }
    });
  }

  if (mainCategoryBtns.length > 0) {
    mainCategoryBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-category");

        if (currentMainCategory === cat) {
          currentMainCategory = null;
          btn.classList.remove("active");
          subcategoryGroups.forEach((group) =>
            group.classList.remove("active")
          );
        } else {
          currentMainCategory = cat;
          mainCategoryBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          subcategoryGroups.forEach((group) => {
            group.classList.toggle(
              "active",
              group.id === `subcategories-${cat}`
            );
          });
        }

        currentSubcategory = "todos";
        document.querySelectorAll(".sub-cat-btn").forEach((subBtn) => {
          subBtn.classList.toggle(
            "active",
            subBtn.getAttribute("data-subcategory") === "todos"
          );
        });

        filterProducts();
      });
    });
  }

  if (subcategoryGroups.length > 0) {
    subcategoryGroups.forEach((group) => {
      const subBtns = group.querySelectorAll(".sub-cat-btn");
      subBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          subBtns.forEach((sb) => sb.classList.remove("active"));
          btn.classList.add("active");

          currentSubcategory = btn.getAttribute("data-subcategory");
          filterProducts();
        });
      });
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const session =
        typeof getValidSession === "function" ? getValidSession() : null;

      if (!session) {
        localStorage.setItem("redirectAfterLogin", "compra.html");
        window.location.href = "inicioSesion.html";
        return;
      }

      cart = getSavedCart();
      const unselectedMilkItem = cart.find(item => item.permiteLeche && !item.tipoLeche);
      if (unselectedMilkItem) {
        showCustomModal(
          "Selecciona el tipo de leche",
          "Por favor, selecciona un tipo de leche para todos los cafés del carrito antes de tramitar el pedido."
        );
        return;
      }

      window.location.href = "compra.html";
    });
  }

  if (suggestionForm) {
    suggestionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const category = suggestionCategory.value;
      const text = suggestionText.value.trim();
      const email = suggestionEmail.value.trim();

      if (!category) {
        suggestionMessage.textContent =
          "Por favor, selecciona una categoría para tu sugerencia.";
        suggestionMessage.className = "suggestion-message error";
        return;
      }

      if (!text) {
        suggestionMessage.textContent =
          "Por favor, escribe el contenido de tu sugerencia.";
        suggestionMessage.className = "suggestion-message error";
        return;
      }

      const newSuggestion = {
        id: "sug_" + Date.now(),
        categoria: category,
        texto: text,
        email: email || "Anónimo",
        fecha: new Date().toISOString(),
      };

      const storedSuggestions =
        JSON.parse(localStorage.getItem("hugoffee_suggestions")) || [];
      storedSuggestions.push(newSuggestion);
      localStorage.setItem(
        "hugoffee_suggestions",
        JSON.stringify(storedSuggestions)
      );

      suggestionMessage.textContent =
        "¡Muchas gracias por tu idea! La hemos registrado para el equipo de Hugoffee.";
      suggestionMessage.className = "suggestion-message success";

      suggestionForm.reset();

      setTimeout(() => {
        suggestionMessage.style.display = "none";
      }, 5000);
    });
  }

  const privacyBtn = document.getElementById('privacyPolicyBtn');
  
  if (!document.getElementById('privacyModal')) {
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'privacyModal';
    modalOverlay.className = 'privacy-modal-overlay';
    modalOverlay.innerHTML = `
      <div class="privacy-modal-content">
        <button id="closePrivacyModalX" class="privacy-close-x">✕</button>
        <h3>Política de Privacidad</h3>
        <p>En <strong>Hugoffee</strong> nos tomamos muy en serio la privacidad de tus datos. Esta política describe cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestra plataforma web.</p>
        <h4>1. Información que recopilamos</h4>
        <p>Recopilamos datos básicos de registro (nombre, correo electrónico) y datos de tus pedidos e historial de compras para facilitarte una mejor experiencia en nuestra cafetería en Arnedo.</p>
        <h4>2. Uso de los datos</h4>
        <p>Tus datos son empleados exclusivamente para procesar tus pedidos de café y repostería, gestionar tus favoritos y enviarte notificaciones sobre el estado de tus compras.</p>
        <h4>3. Seguridad y Almacenamiento</h4>
        <p>Toda la información local se almacena de forma segura en tu navegador mediante estándares protegidos. No compartimos tus datos con terceros con fines comerciales.</p>
        <button id="closePrivacyModalBtn" class="btn-primary" style="width: 100%; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">Entendido</button>
      </div>
    `;
    document.body.appendChild(modalOverlay);
  }

  const privacyModal = document.getElementById('privacyModal');
  const closePrivacyX = document.getElementById('closePrivacyModalX');
  const closePrivacyBtn = document.getElementById('closePrivacyModalBtn');

  if (privacyBtn) {
    privacyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      privacyModal.classList.add('active');
    });
  }

  const hidePrivacyModal = () => {
    privacyModal.classList.remove('active');
  };

  if (closePrivacyX) closePrivacyX.addEventListener('click', hidePrivacyModal);
  if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', hidePrivacyModal);
  if (privacyModal) {
    privacyModal.addEventListener('click', (e) => {
      if (e.target === privacyModal) hidePrivacyModal();
    });
  }

  attachGlobalEvents();
  fetchProducts();
  updateCartUI();
  syncFavButtonsUI();
});