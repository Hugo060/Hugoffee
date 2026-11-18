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
  const sortProductsSelect = document.getElementById("sortProductsSelect");
  const excludedAllergens = document.querySelectorAll(".filter-allergen");
  const resetAdvancedFiltersBtn = document.getElementById(
    "resetAdvancedFilters",
  );
  const filterResultsCount = document.getElementById("filterResultsCount");

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
          dot.setAttribute("aria-current", String(i === index));
        });
      }
    }

    let carouselPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setInterval(() => {
      if (carouselPaused || document.hidden) return;
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }, 5000);
    const heroSection = document.querySelector(".hero-section");
    if (heroSection) {
      heroSection.addEventListener("mouseenter", () => { carouselPaused = true; });
      heroSection.addEventListener("mouseleave", () => {
        carouselPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      });
      heroSection.addEventListener("focusin", () => { carouselPaused = true; });
      heroSection.addEventListener("focusout", (event) => {
        if (!heroSection.contains(event.relatedTarget)) {
          carouselPaused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });
  }

  function showCustomModal(title, message) {
    const existingModal = document.getElementById("customAlertOverlay");
    if (existingModal) existingModal.remove();

    const overlay = document.createElement("div");
    overlay.id = "customAlertOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "99999";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.25s ease";

    const modal = document.createElement("div");
    modal.style.backgroundColor = "var(--color-base, #ffffff)";
    modal.style.color = "var(--color-primary, #4B3621)";
    modal.style.padding = "24px 28px";
    modal.style.borderRadius = "16px";
    modal.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
    modal.style.maxWidth = "420px";
    modal.style.width = "90%";
    modal.style.position = "relative";
    modal.style.transform = "scale(0.85)";
    modal.style.transition = "transform 0.25s ease";

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "customAlertTitle");
    modal.innerHTML = `
      <button id="closeModalX" type="button" aria-label="Cerrar aviso" style="position: absolute; top: 14px; right: 16px; background: none; border: none; font-size: 20px; font-weight: bold; cursor: pointer; color: var(--color-primary, #4B3621); opacity: 0.7;">✕</button>
      <h3 id="customAlertTitle" style="margin-top: 0; margin-bottom: 12px; font-size: 20px; font-weight: 700; padding-right: 20px;">${escapeProductHtml(title)}</h3>
      <p style="font-size: 14px; line-height: 1.5; color: var(--color-muted, #555); margin-bottom: 20px;">${escapeProductHtml(message)}</p>
      <button id="closeModalBtn" class="btn-primary" style="width: 100%; padding: 10px 16px; border-radius: 8px; font-weight: 600; cursor: pointer;">Entendido</button>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = "1";
      modal.style.transform = "scale(1)";
    }, 10);

    const closeModal = () => {
      overlay.style.opacity = "0";
      modal.style.transform = "scale(0.85)";
      setTimeout(() => {
        overlay.remove();
        if (previouslyFocused && previouslyFocused.isConnected) previouslyFocused.focus();
      }, 250);
    };

    const previouslyFocused = document.activeElement;
    modal.querySelector("#closeModalX").focus();
    modal.querySelector("#closeModalX").addEventListener("click", closeModal);
    modal.querySelector("#closeModalBtn").addEventListener("click", closeModal);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
      }
      if (event.key === "Tab") {
        const controls = [...modal.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])')];
        if (!controls.length) return;
        if (event.shiftKey && document.activeElement === controls[0]) {
          event.preventDefault();
          controls[controls.length - 1].focus();
        } else if (!event.shiftKey && document.activeElement === controls[controls.length - 1]) {
          event.preventDefault();
          controls[0].focus();
        }
      }
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

  // Meta visual de compra: no es un mínimo obligatorio ni una promoción.
  const CART_GOAL = 20;
  const formatCartEuro = (value) =>
    `${Number(value).toFixed(2).replace(".", ",")} €`;

  function buildCartExtras() {
    if (!cartDrawer) return;
    const footer = cartDrawer.querySelector(".cart-footer");
    if (!footer) return;
    if (!document.getElementById("cartSmartGoal")) {
      const goal = document.createElement("div");
      goal.id = "cartSmartGoal";
      goal.className = "cart-smart-goal";
      goal.setAttribute("aria-live", "polite");
      const total = footer.querySelector(".cart-total");
      if (total) total.before(goal);
      else footer.prepend(goal);
    }
    if (!document.getElementById("cartSmartRecommendations")) {
      const recommendations = document.createElement("section");
      recommendations.id = "cartSmartRecommendations";
      recommendations.className = "cart-smart-recommendations";
      recommendations.setAttribute(
        "aria-label",
        "Productos para acompañar tu pedido",
      );
      if (cartItemsContainer) cartItemsContainer.after(recommendations);
      else return;
    }
  }

  function updateCartSuggestions() {
    const container = document.getElementById("cartSmartRecommendations");
    if (!container) return;
    const items = cart.filter((item) => item.quantity > 0);
    if (!items.length || !allProducts.length) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }
    const selectedIds = new Set(items.map((item) => item.id));
    const cartHasDrinks = items.some((item) =>
      allProducts.some((p) => p.id === item.id && p.categoria === "bebida"),
    );
    const preferredCategory = cartHasDrinks ? "comida" : "bebida";
    const possible = allProducts.filter(
      (p) =>
        !selectedIds.has(p.id) &&
        Number.isFinite(Number(p.precio)) &&
        Number(p.precio) > 0,
    );
    const suggestions = [
      ...possible.filter((p) => p.categoria === preferredCategory),
      ...possible.filter((p) => p.categoria !== preferredCategory),
    ].slice(0, 2);
    if (!suggestions.length) {
      container.hidden = true;
      container.innerHTML = "";
      return;
    }
    container.hidden = false;
    container.innerHTML = `
      <h4 class="cart-smart-heading">Combina tu pedido</h4>
      <p class="cart-smart-explainer">Quizá te apetezca acompañarlo con…</p>
      <div class="cart-smart-list">${suggestions
        .map(
          (p) => `
        <article class="cart-smart-suggestion">
          <img src="${escapeProductHtml(p.imagen || "")}" alt="${escapeProductHtml(p.nombre)}" loading="lazy" />
          <div class="cart-smart-suggestion-info">
            <span class="cart-smart-suggestion-name">${escapeProductHtml(p.nombre)}</span>
            <span class="cart-smart-suggestion-price">${formatCartEuro(p.precio)}</span>
          </div>
          <button type="button" class="cart-smart-add" data-id="${escapeProductHtml(p.id)}"
            data-title="${escapeProductHtml(p.nombre)}" data-price="${Number(p.precio)}"
            data-permite-leche="${p.permiteLeche === true}" aria-label="Añadir ${escapeProductHtml(p.nombre)} al carrito">Añadir</button>
        </article>`,
        )
        .join("")}</div>`;
  }

  function updateCartGoal(total) {
    const goal = document.getElementById("cartSmartGoal");
    if (!goal) return;
    if (!cart.length) {
      goal.hidden = true;
      goal.innerHTML = "";
      return;
    }
    goal.hidden = false;
    const progress = Math.min(100, Math.round((total / CART_GOAL) * 100));
    const remaining = Math.max(0, CART_GOAL - total);
    const message =
      remaining > 0
        ? `Te faltan <strong>${formatCartEuro(remaining)}</strong> para llegar a tu objetivo.`
        : `¡Has alcanzado tu objetivo de ${formatCartEuro(CART_GOAL)}!`;
    goal.innerHTML = `
      <div class="cart-smart-goal-label"><span>Objetivo de compra</span><strong>${formatCartEuro(CART_GOAL)}</strong></div>
      <div class="cart-smart-progress" role="progressbar" aria-label="Progreso del objetivo de compra" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress}">
        <span style="width: ${progress}%"></span>
      </div>
      <p class="cart-smart-goal-message">${message}</p>
      <small>Importe orientativo. Puedes comprar por cualquier cantidad.</small>`;
  }

  buildCartExtras();
  if (cartDrawer) {
    cartDrawer.addEventListener("click", (event) => {
      const button = event.target.closest(".cart-smart-add");
      if (button) handleAddToCart(button);
    });
  }

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
      if (checkoutBtn) {
        checkoutBtn.style.opacity = "0.5";
        checkoutBtn.style.cursor = "not-allowed";
      }
    } else {
      if (checkoutBtn) {
        checkoutBtn.style.opacity = "1";
        checkoutBtn.style.cursor = "pointer";
      }
      cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const itemEl = document.createElement("div");
        itemEl.className = "cart-item";

        const milkOptionsHtml = item.permiteLeche
          ? `
            <div style="margin-top: 6px;">
                <label for="milk-${escapeProductHtml(item.id)}" style="font-size: 12px; font-weight: 600; display: block; margin-bottom: 2px;">Tipo de leche para ${escapeProductHtml(item.title)}:</label>
                <select id="milk-${escapeProductHtml(item.id)}" class="cart-milk-select" aria-label="Tipo de leche para ${escapeProductHtml(item.title)}" data-id="${escapeProductHtml(item.id)}" style="padding: 4px 8px; font-size: 12px; border-radius: 6px; border: 1px solid ${!item.tipoLeche ? "#c92a2a" : "var(--color-muted)"}; background: var(--color-base); color: var(--color-primary);">
                    <option value="" disabled ${!item.tipoLeche ? "selected" : ""}>Selecciona tipo de leche...</option>
                    <option value="Entera" ${item.tipoLeche === "Entera" ? "selected" : ""}>Leche Entera</option>
                    <option value="Semidesnatada" ${item.tipoLeche === "Semidesnatada" ? "selected" : ""}>Leche Semidesnatada</option>
                    <option value="Desnatada" ${item.tipoLeche === "Desnatada" ? "selected" : ""}>Leche Desnatada</option>
                    <option value="Avena" ${item.tipoLeche === "Avena" ? "selected" : ""}>Bebida de Avena</option>
                    <option value="Soja" ${item.tipoLeche === "Soja" ? "selected" : ""}>Bebida de Soja</option>
                    <option value="Sin lactosa" ${item.tipoLeche === "Sin lactosa" ? "selected" : ""}>Sin lactosa</option>
                </select>
            </div>
        `
          : "";

        itemEl.innerHTML = `
                    <div class="cart-item-details" style="width: 100%;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
                            <div>
                                <h4 class="cart-item-title">${item.title}</h4>
                                <span class="cart-item-price">${item.price.toFixed(2).replace(".", ",")} € x ${item.quantity}</span>
                            </div>
                            <div class="cart-item-actions">
                                <div class="cart-quantity-controls">
                                    <button class="cart-qty-btn decrease" type="button" aria-label="Quitar una unidad de ${item.title}" data-id="${item.id}">-</button>
                                    <span class="cart-qty-value">${item.quantity}</span>
                                    <button class="cart-qty-btn increase" type="button" aria-label="Añadir una unidad de ${item.title}" data-id="${item.id}">+</button>
                                </div>
                                <button class="cart-delete-btn" type="button" aria-label="Eliminar ${item.title} del carrito" data-id="${item.id}">
                                    <svg aria-hidden="true" focusable="false" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    updateCartGoal(total);
    updateCartSuggestions();
  }

  const toggleCart = () => {
    if (cartDrawer && cartOverlay) {
      const opening = !cartDrawer.classList.contains("active");
      cartDrawer.classList.toggle("active", opening);
      cartOverlay.classList.toggle("active", opening);
      cartDrawer.setAttribute("aria-hidden", String(!opening));
      cartDrawer.toggleAttribute("inert", !opening);
      if (cartButton) cartButton.setAttribute("aria-expanded", String(opening));
      if (opening) {
        const close = cartDrawer.querySelector("#closeCart");
        if (close) close.focus();
      } else if (cartButton) {
        cartButton.focus();
      }
    }
  };

  if (cartButton) cartButton.addEventListener("click", toggleCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", toggleCart);
  if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);
  if (cartDrawer) {
    cartDrawer.addEventListener("keydown", (event) => {
      if (!cartDrawer.classList.contains("active")) return;
      if (event.key === "Escape") {
        event.preventDefault();
        toggleCart();
      }
      if (event.key === "Tab") {
        const controls = [...cartDrawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])')].filter(el => !el.hidden && el.getClientRects().length);
        if (!controls.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

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
        tipoLeche: null,
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
      btn.classList.toggle("active", isFav);
      btn.setAttribute("aria-pressed", String(isFav));
      btn.setAttribute("aria-label", `${isFav ? "Quitar de favoritos" : "Añadir a favoritos"}: ${name}`);
    });
  }

  function attachGlobalEvents() {
    document.querySelectorAll(".product-image-container img").forEach((img) => {
      if (img.dataset.errorHandlerAdded) return;
      img.dataset.errorHandlerAdded = "true";
      img.addEventListener(
        "error",
        () => {
          img.parentElement.classList.add("image-error");
        },
        { once: true },
      );
      if (img.complete && img.naturalWidth === 0) {
        img.parentElement.classList.add("image-error");
      }
    });
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

  function escapeProductHtml(value) {
    return String(value ?? "").replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  }

  function productDetailImageUrl(value) {
    const fallback =
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80";
    try {
      const url = new URL(value || fallback, document.baseURI);
      return ["http:", "https:"].includes(url.protocol) ? url.href : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function productDetailDate(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      return "";
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  }

  function getProductReviews(product) {
    const base = Array.isArray(product.reseñas) ? product.reseñas : [];
    const legacyKey = `hugoffee_reviews_${product.id}`;
    const ownKey = `hugoffee_user_reviews_${product.id}`;
    const safeRead = (key) => {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
      } catch (_) {
        return [];
      }
    };
    const legacy = safeRead(legacyKey);
    const own = safeRead(ownKey);
    // La versión antigua de reseñas.js guardaba una copia de las reseñas del JSON
    // junto con las enviadas por el visitante. No añadimos esa copia dos veces.
    const key = (review) =>
      [review.name, review.rating, review.comment, review.date].join("|");
    const baseKeys = new Set(base.map(key));
    const extra = [...legacy.filter((r) => !baseKeys.has(key(r))), ...own];
    const seen = new Set();
    return [...extra, ...base].filter((review) => {
      if (!review || typeof review !== "object") return false;
      const value = key(review);
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  }

  function openProductDetails(productId, trigger) {
    const product = allProducts.find((item) => item.id === productId);
    if (!product) return;

    const existing = document.getElementById("productDetailOverlay");
    if (existing) existing.remove();

    const reviews = getProductReviews(product);
    const totalRating = reviews.reduce(
      (sum, item) => sum + (Number(item.rating) || 0),
      0,
    );
    const average = reviews.length
      ? (totalRating / reviews.length).toFixed(1).replace(".", ",")
      : null;
    const favorite = getSavedFavs().includes(product.nombre);
    const labels = {
      gluten: "Gluten",
      lacteos: "Lácteos",
      frutos_secos: "Frutos secos",
      huevos: "Huevos",
    };
    const allergens = Array.isArray(product.alergenos) ? product.alergenos : [];
    const ingredientText = Array.isArray(product.ingredientes)
      ? product.ingredientes.join(", ")
      : typeof product.ingredientes === "string"
        ? product.ingredientes
        : "";
    const ratingsText = average
      ? `<div class="product-detail-rating" aria-label="Valoración media de ${average} sobre 5, basada en ${reviews.length} opiniones"><span aria-hidden="true">★</span> <strong>${average}/5</strong><span>${reviews.length} ${reviews.length === 1 ? "opinión" : "opiniones"}</span></div>`
      : `<p class="product-detail-no-reviews">Todavía no hay opiniones.</p>`;

    const reviewsHtml = reviews.length
      ? reviews
          .map((review) => {
            const score = Math.max(
              0,
              Math.min(5, Math.round(Number(review.rating) || 0)),
            );
            const date = productDetailDate(review.date);
            return `<article class="product-detail-review">
            <div class="product-detail-review-heading">
              <strong>${escapeProductHtml(review.name || "Cliente")}</strong>
              <span class="product-detail-stars" aria-label="${score} de 5 estrellas">${"★".repeat(score)}<span class="product-detail-stars-empty">${"☆".repeat(5 - score)}</span></span>
            </div>
            ${date ? `<time class="product-detail-review-date" datetime="${escapeProductHtml(review.date)}">${escapeProductHtml(date)}</time>` : ""}
            <p>${escapeProductHtml(review.comment || "")}</p>
          </article>`;
          })
          .join("")
      : `<p class="product-detail-no-reviews">Sé el primero en opinar sobre este producto.</p>`;

    const overlay = document.createElement("div");
    overlay.id = "productDetailOverlay";
    overlay.className = "product-detail-overlay";
    overlay.innerHTML = `
      <section class="product-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="productDetailTitle" aria-describedby="productDetailDescription" tabindex="-1">
        <div class="product-detail-topbar">
          <span>HUGOFFEE <span aria-hidden="true">·</span> NUESTRA CARTA</span>
          <button type="button" class="product-detail-close" aria-label="Cerrar detalles del producto" title="Cerrar">
            <svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div class="product-detail-layout">
          <div class="product-detail-photo">
            <img src="${escapeProductHtml(productDetailImageUrl(product.imagen))}" alt="${escapeProductHtml(product.nombre)}" />
          </div>
          <div class="product-detail-info">
            ${product.badge ? `<span class="product-detail-badge">${escapeProductHtml(product.badge)}</span>` : ""}
            <h2 id="productDetailTitle">${escapeProductHtml(product.nombre)}</h2>
            <p class="product-detail-subtitle">${escapeProductHtml(product.subtitulo || "")}</p>
            ${ratingsText}
            <p id="productDetailDescription" class="product-detail-description">${escapeProductHtml(product.descripcion || "")}</p>
            ${ingredientText ? `<div class="product-detail-facts"><h3>Ingredientes</h3><p>${escapeProductHtml(ingredientText)}</p></div>` : ""}
            <div class="product-detail-facts">
              <h3>Información sobre alérgenos</h3>
              ${allergens.length ? `<div class="product-detail-allergens">${allergens.map((item) => `<span>${escapeProductHtml(labels[item] || item)}</span>`).join("")}</div>` : `<p>No se indican alérgenos para este producto.</p>`}
            </div>
            ${product.permiteLeche ? `<p class="product-detail-milk-note">Puedes elegir el tipo de leche desde el carrito.</p>` : ""}
            <div class="product-detail-purchase">
              <strong class="product-detail-price">${Number(product.precio).toFixed(2).replace(".", ",")} €</strong>
              <button type="button" class="product-detail-add" data-id="${escapeProductHtml(product.id)}" data-title="${escapeProductHtml(product.nombre)}" data-price="${Number(product.precio)}" data-permite-leche="${!!product.permiteLeche}">Añadir al carrito</button>
              <button type="button" class="product-detail-favorite ${favorite ? "active" : ""}" data-name="${escapeProductHtml(product.nombre)}" aria-pressed="${favorite}" aria-label="${favorite ? "Quitar de favoritos" : "Añadir a favoritos"}">
                <svg aria-hidden="true" focusable="false" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
              </button>
            </div>
          </div>
        </div>
        <div class="product-detail-reviews" aria-label="Opiniones de clientes">
          <h3>Opiniones de clientes <span>(${reviews.length})</span></h3>
          <div class="product-detail-review-grid">${reviewsHtml}</div>
          <form class="product-detail-review-form" id="productDetailReviewForm">
            <h3>Escribe tu valoración</h3>
            <div class="product-detail-review-fields">
              <label for="reviewAuthor">Nombre y apellido (obligatorio)
                <input id="reviewAuthor" name="author" type="text" autocomplete="name" maxlength="80" placeholder="Tu nombre y apellido" aria-describedby="reviewFeedback" required />
              </label>
              <label for="reviewRating">Tu puntuación (obligatorio)
                <select id="reviewRating" name="rating" aria-describedby="reviewFeedback" required>
                  <option value="" selected disabled>Elige las estrellas</option>
                  <option value="5">★★★★★ (5)</option>
                  <option value="4">★★★★☆ (4)</option>
                  <option value="3">★★★☆☆ (3)</option>
                  <option value="2">★★☆☆☆ (2)</option>
                  <option value="1">★☆☆☆☆ (1)</option>
                </select>
              </label>
            </div>
            <label for="reviewComment">Tu opinión (obligatorio)
              <textarea id="reviewComment" name="comment" rows="3" maxlength="1000" placeholder="Cuéntanos qué te ha parecido..." aria-describedby="reviewFeedback" required></textarea>
            </label>
            <button class="product-detail-add" type="submit">Publicar valoración</button>
            <p class="product-detail-review-help">Escribe tu nombre y al menos un apellido. Tu opinión se guarda en este navegador.</p>
            <p id="reviewFeedback" class="product-detail-review-feedback" role="status" aria-live="polite"></p>
          </form>
        </div>
      </section>`;

    const previousOverflow = document.body.style.overflow;
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    const dialog = overlay.querySelector(".product-detail-dialog");
    const closeButton = overlay.querySelector(".product-detail-close");
    const image = overlay.querySelector(".product-detail-photo img");
    image.addEventListener(
      "error",
      () => image.parentElement.classList.add("image-error"),
      { once: true },
    );
    if (image.complete && image.naturalWidth === 0)
      image.parentElement.classList.add("image-error");

    const closeDetails = () => {
      document.removeEventListener("keydown", handleModalKeys);
      document.body.style.overflow = previousOverflow;
      overlay.remove();
      if (trigger && document.contains(trigger)) trigger.focus();
    };

    const handleModalKeys = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDetails();
      }
      if (event.key === "Tab") {
        const buttons = [...dialog.querySelectorAll("a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])")];
        if (!buttons.length) return;
        const first = buttons[0];
        const last = buttons[buttons.length - 1];
        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !dialog.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !dialog.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    overlay.addEventListener("click", (event) => {
      if (
        event.target === overlay ||
        event.target.closest(".product-detail-close")
      ) {
        closeDetails();
        return;
      }
      const addButton = event.target.closest(".product-detail-purchase .product-detail-add");
      if (addButton) {
        handleAddToCart(addButton);
        return;
      }
      const favoriteButton = event.target.closest(".product-detail-favorite");
      if (favoriteButton) {
        handleFavClick(favoriteButton);
        const nowFavorite = getSavedFavs().includes(product.nombre);
        favoriteButton.classList.toggle("active", nowFavorite);
        favoriteButton.setAttribute("aria-pressed", String(nowFavorite));
        favoriteButton.setAttribute(
          "aria-label",
          nowFavorite ? "Quitar de favoritos" : "Añadir a favoritos",
        );
      }
    });

    const reviewForm = overlay.querySelector("#productDetailReviewForm");
    reviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = reviewForm.elements.author.value.trim().replace(/\s+/g, " ");
      const rating = Number(reviewForm.elements.rating.value);
      const comment = reviewForm.elements.comment.value.trim();
      const feedback = reviewForm.querySelector(
        ".product-detail-review-feedback",
      );
      reviewForm.elements.author.removeAttribute("aria-invalid");
      reviewForm.elements.rating.removeAttribute("aria-invalid");
      reviewForm.elements.comment.removeAttribute("aria-invalid");
      if (name.split(" ").length < 2) {
        feedback.textContent = "Escribe tu nombre y al menos un apellido.";
        reviewForm.elements.author.setAttribute("aria-invalid", "true");
        reviewForm.elements.author.focus();
        return;
      }
      if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
        feedback.textContent =
          "Selecciona una puntuación y escribe tu opinión.";
        const invalidField = !Number.isInteger(rating) || rating < 1 || rating > 5
          ? reviewForm.elements.rating : reviewForm.elements.comment;
        invalidField.setAttribute("aria-invalid", "true");
        invalidField.focus();
        return;
      }
      const key = `hugoffee_user_reviews_${product.id}`;
      let saved = [];
      try {
        const stored = JSON.parse(localStorage.getItem(key));
        if (Array.isArray(stored)) saved = stored;
        localStorage.setItem(
          key,
          JSON.stringify([
            {
              name,
              rating,
              comment,
              date: new Date().toISOString().slice(0, 10),
            },
            ...saved,
          ]),
        );
      } catch (error) {
        feedback.textContent =
          "No se ha podido guardar la opinión en este navegador.";
        return;
      }
      // Actualizar las tarjetas y la ficha sin cambiar los demás controles.
      if (carouselGrid) renderOtonoCarousel();
      if (productsGrid) filterProducts();
      closeDetails();
      openProductDetails(product.id, trigger);
      const heading = document.querySelector(
        "#productDetailOverlay .product-detail-reviews h3",
      );
      if (heading)
        heading.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });

    document.addEventListener("keydown", handleModalKeys);
    closeButton.focus();
  }

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".product-details-open");
    if (!button) return;
    openProductDetails(button.dataset.productId, button);
  });

  function renderCoffeeOfTheMonth() {
    const section = document.getElementById("cafe-del-mes");
    if (!section) return;

    const product = allProducts.find(
      (item) => item.id === "pumpkin-spice-latte",
    );
    if (!product) {
      section.hidden = true;
      return;
    }

    const image = document.getElementById("coffeeMonthImage");
    const button = document.getElementById("coffeeMonthButton");
    document.getElementById("coffeeMonthName").textContent = product.nombre;
    document.getElementById("coffeeMonthDescription").textContent =
      product.descripcion || product.subtitulo || "";
    document.getElementById("coffeeMonthPrice").textContent =
      Number(product.precio).toFixed(2).replace(".", ",") + " €";
    button.dataset.productId = product.id;
    image.alt = product.nombre;
    image.src = productDetailImageUrl(product.imagen);
    image.addEventListener(
      "error",
      () => section.classList.add("coffee-month-image-error"),
      { once: true },
    );
    section.hidden = false;
  }

  async function fetchProducts() {
    try {
      let response = await fetch("datos/productos.json");
      if (!response.ok) {
        response = await fetch("/datos/productos.json");
      }
      if (!response.ok)
        throw new Error(`No se pudo cargar el catálogo (${response.status})`);
      const data = await response.json();
      if (!Array.isArray(data.productos))
        throw new Error("El catálogo no contiene una lista de productos");
      allProducts = data.productos;
      updateCartSuggestions();
      renderCoffeeOfTheMonth();

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
      console.error("Error cargando productos de Hugoffee:", error);
      if (productsGrid) {
        productsGrid.innerHTML =
          '<p class="no-products">No se ha podido cargar la carta. Comprueba que datos/productos.json existe y que estás usando un servidor local.</p>';
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

  function renderCardRating(product) {
    const reviews = getProductReviews(product);
    const valid = reviews.filter(
      (review) =>
        Number.isFinite(Number(review.rating)) &&
        Number(review.rating) >= 1 &&
        Number(review.rating) <= 5,
    );
    if (!valid.length) return "";
    const average =
      valid.reduce((sum, review) => sum + Number(review.rating), 0) /
      valid.length;
    const formatted = average.toFixed(1).replace(".", ",");
    const count = valid.length;
    return `<button type="button" class="card-rating product-details-open" data-product-id="${escapeProductHtml(product.id)}" aria-label="Ver ${count} ${count === 1 ? "opinión" : "opiniones"} de ${escapeProductHtml(product.nombre)}: ${formatted} sobre 5"><span class="card-rating-star" aria-hidden="true">★</span> ${formatted} (${count} ${count === 1 ? "opinión" : "opiniones"})</button>`;
  }

  function renderOtonoCarousel() {
    if (!carouselGrid || allProducts.length === 0) return;

    const productosOtono = allProducts.filter(
      (producto) => producto.badge === "OTOÑO",
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

      const permiteLecheAttr = product.permiteLeche
        ? 'data-permite-leche="true"'
        : "";

      card.innerHTML = `
          <div class="badge-container">
              <span class="badge" style="background-color: #8C4000; color: #ffffff;">${product.badge}</span>
          </div>
          <div class="product-image-container">
              <img src="${product.imagen || "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80"}" alt="${escapeProductHtml(product.nombre)}" loading="lazy" decoding="async" />
              <button type="button" class="product-details-open product-details-image-button" data-product-id="${escapeProductHtml(product.id)}" aria-label="Ver detalles de ${escapeProductHtml(product.nombre)}" title="Ver detalles de ${escapeProductHtml(product.nombre)}"><span>Ver detalles</span></button>
          </div>
          <h3><button type="button" class="product-details-open product-details-title-button" data-product-id="${escapeProductHtml(product.id)}">${escapeProductHtml(product.nombre)}</button></h3>
          <p class="product-card-subtitle">${escapeProductHtml(product.subtitulo || "")}</p>
          <p class="product-card-description">${escapeProductHtml(product.descripcion || "")}</p>
          ${renderAllergens(product.alergenos)}
          <div class="card-footer">
              <p class="product-price">${product.precio.toFixed(2).replace(".", ",")} €</p>
              <div class="card-actions">                    
                  <button type="button" class="btn-add" data-id="${product.id}" data-title="${product.nombre}" data-price="${product.precio}" ${permiteLecheAttr}>Añadir</button>
                  <button type="button" class="btn-fav ${isFav ? "active" : ""}" aria-label="${isFav ? "Quitar de favoritos" : "Añadir a favoritos"}: ${escapeProductHtml(product.nombre)}" aria-pressed="${isFav}" data-name="${escapeProductHtml(product.nombre)}">
                      <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                      </svg>
                  </button>
              </div>
          </div>
          ${renderCardRating(product)}
      `;
      carouselGrid.appendChild(card);
    });

    if (carouselDotsContainer) {
      carouselDotsContainer.innerHTML = "";
      productosOtono.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = index === 0 ? "dot active" : "dot";
        dot.setAttribute("aria-label", `Mostrar producto de otoño ${index + 1}`);
        dot.setAttribute("aria-current", String(index === 0));
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
        dot.setAttribute("aria-current", String(idx === activeIndex));
      });
    });

    window.addEventListener("resize", updateDotsVisibility);
  }

  function renderProducts(products) {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";

    const query = searchInput ? searchInput.value.trim() : "";
    if (products.length === 0) {
      if (
        query ||
        currentMainCategory ||
        (sortProductsSelect && sortProductsSelect.value !== "default") ||
        Array.from(excludedAllergens).some((input) => input.checked)
      ) {
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

      const permiteLecheAttr = product.permiteLeche
        ? 'data-permite-leche="true"'
        : "";

      card.innerHTML = `
            <div class="badge-container">
                ${product.badge ? `<span class="badge">${product.badge}</span>` : ""}
            </div>
            <div class="product-image-container">
                <img src="${product.imagen || "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=600&q=80"}" alt="${escapeProductHtml(product.nombre)}" loading="lazy" decoding="async" />
                <button type="button" class="product-details-open product-details-image-button" data-product-id="${escapeProductHtml(product.id)}" aria-label="Ver detalles de ${escapeProductHtml(product.nombre)}" title="Ver detalles de ${escapeProductHtml(product.nombre)}"><span>Ver detalles</span></button>
            </div>
            <h3><button type="button" class="product-details-open product-details-title-button" data-product-id="${escapeProductHtml(product.id)}">${escapeProductHtml(product.nombre)}</button></h3>
            <p class="product-card-subtitle">${escapeProductHtml(product.subtitulo || "")}</p>
            <p class="product-card-description">${escapeProductHtml(product.descripcion || "")}</p>
            ${renderAllergens(product.alergenos)}
            <div class="card-footer">
                <p class="product-price">${product.precio.toFixed(2).replace(".", ",")} €</p>
                <div class="card-actions">                    
                    <button type="button" class="btn-add" data-id="${product.id}" data-title="${product.nombre}" data-price="${product.precio}" ${permiteLecheAttr}>Añadir al carrito</button>
                    <button type="button" class="btn-fav ${isFav ? "active" : ""}" aria-label="${isFav ? "Quitar de favoritos" : "Añadir a favoritos"}: ${escapeProductHtml(product.nombre)}" aria-pressed="${isFav}" data-name="${escapeProductHtml(product.nombre)}">
                        <svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                        </svg>
                    </button>
                </div>
            </div>
            ${renderCardRating(product)}
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

  function productRating(product) {
    const reviews = getProductReviews(product);
    const valid = reviews.filter((review) =>
      Number.isFinite(Number(review.rating)),
    );
    if (!valid.length) return null;
    return (
      valid.reduce((sum, review) => sum + Number(review.rating), 0) /
      valid.length
    );
  }

  function filterProducts() {
    if (!productsSection || allProducts.length === 0) return;

    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const sort = sortProductsSelect ? sortProductsSelect.value : "default";
    const excluded = Array.from(excludedAllergens)
      .filter((input) => input.checked)
      .map((input) => input.value);
    const hasAdvancedFilters = sort !== "default" || excluded.length > 0;
    const isBrowsing = Boolean(
      query || currentMainCategory || hasAdvancedFilters,
    );

    if (resetAdvancedFiltersBtn)
      resetAdvancedFiltersBtn.disabled = !hasAdvancedFilters;
    if (filterResultsCount) {
      filterResultsCount.hidden = !isBrowsing;
      if (!isBrowsing) filterResultsCount.textContent = "";
    }

    // Mantener la carta vacía hasta elegir una categoría, buscar o aplicar filtros.
    if (!isBrowsing) {
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
      const allergens = Array.isArray(product.alergenos)
        ? product.alergenos
        : [];
      const matchesAllergens = excluded.every(
        (allergen) => !allergens.includes(allergen),
      );
      return (
        matchesSearch &&
        matchesCategory &&
        matchesSubcategory &&
        matchesAllergens
      );
    });

    if (sort === "price-asc") {
      filtered.sort((a, b) => Number(a.precio) - Number(b.precio));
    } else if (sort === "price-desc") {
      filtered.sort((a, b) => Number(b.precio) - Number(a.precio));
    } else if (sort === "rating-desc") {
      filtered.sort(
        (a, b) => (productRating(b) ?? -1) - (productRating(a) ?? -1),
      );
    } else if (sort === "name-asc") {
      filtered.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    }

    if (filterResultsCount) {
      const total = filtered.length;
      filterResultsCount.textContent = `${total} ${total === 1 ? "producto encontrado" : "productos encontrados"}`;
    }
    renderProducts(filtered);
  }

  if (sortProductsSelect)
    sortProductsSelect.addEventListener("change", filterProducts);
  excludedAllergens.forEach((input) =>
    input.addEventListener("change", filterProducts),
  );
  if (resetAdvancedFiltersBtn) {
    resetAdvancedFiltersBtn.addEventListener("click", () => {
      if (sortProductsSelect) sortProductsSelect.value = "default";
      excludedAllergens.forEach((input) => {
        input.checked = false;
      });
      filterProducts();
    });
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
            group.classList.remove("active"),
          );
        } else {
          currentMainCategory = cat;
          mainCategoryBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");

          subcategoryGroups.forEach((group) => {
            group.classList.toggle(
              "active",
              group.id === `subcategories-${cat}`,
            );
          });
        }

        currentSubcategory = "todos";
        document.querySelectorAll(".sub-cat-btn").forEach((subBtn) => {
          subBtn.classList.toggle(
            "active",
            subBtn.getAttribute("data-subcategory") === "todos",
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

      cart = getSavedCart();
      if (!cart || cart.length === 0) {
        showCustomModal(
          "Tu carrito está vacío",
          "Añade algún producto al carrito antes de tramitar tu pedido.",
        );
        return;
      }

      const session =
        typeof getValidSession === "function" ? getValidSession() : null;

      if (!session) {
        localStorage.setItem("redirectAfterLogin", "compra.html");
        window.location.href = "inicioSesion.html";
        return;
      }

      const unselectedMilkItem = cart.find(
        (item) => item.permiteLeche && !item.tipoLeche,
      );
      if (unselectedMilkItem) {
        showCustomModal(
          "Selecciona el tipo de leche",
          "Por favor, selecciona un tipo de leche para todos los cafés del carrito antes de tramitar el pedido.",
        );
        return;
      }

      window.location.href = "compra.html";
    });
  }

  if (suggestionForm) {
    suggestionForm.addEventListener("submit", (e) => {
      e.preventDefault();

      suggestionCategory.removeAttribute("aria-invalid");
      suggestionText.removeAttribute("aria-invalid");
      suggestionMessage.style.display = "";
      const category = suggestionCategory.value;
      const text = suggestionText.value.trim();
      const email = suggestionEmail.value.trim();

      if (!category) {
        suggestionMessage.textContent =
          "Por favor, selecciona una categoría para tu sugerencia.";
        suggestionMessage.className = "suggestion-message error";
        suggestionMessage.setAttribute("role", "alert");
        suggestionCategory.setAttribute("aria-invalid", "true");
        suggestionCategory.focus();
        return;
      }

      if (!text) {
        suggestionMessage.textContent =
          "Por favor, escribe el contenido de tu sugerencia.";
        suggestionMessage.className = "suggestion-message error";
        suggestionMessage.setAttribute("role", "alert");
        suggestionText.setAttribute("aria-invalid", "true");
        suggestionText.focus();
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
        JSON.stringify(storedSuggestions),
      );

      suggestionMessage.textContent =
        "¡Muchas gracias por tu idea! La hemos registrado para el equipo de Hugoffee.";
      suggestionMessage.className = "suggestion-message success";
      suggestionMessage.setAttribute("role", "status");

      suggestionForm.reset();

      suggestionMessage.style.display = "block";
    });
  }

  const privacyBtn = document.getElementById("privacyPolicyBtn");

  if (privacyBtn && !document.getElementById("privacyModal")) {
    const modalOverlay = document.createElement("div");
    modalOverlay.id = "privacyModal";
    modalOverlay.className = "privacy-modal-overlay";
    modalOverlay.innerHTML = `
      <div class="privacy-modal-content" role="dialog" aria-modal="true" aria-labelledby="privacyModalHeading" tabindex="-1">
        <button id="closePrivacyModalX" type="button" aria-label="Cerrar información de privacidad" class="privacy-close-x">✕</button>
        <h3 id="privacyModalHeading">Política de Privacidad</h3>
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

  const privacyModal = document.getElementById("privacyModal");
  const closePrivacyX = document.getElementById("closePrivacyModalX");
  const closePrivacyBtn = document.getElementById("closePrivacyModalBtn");

  if (privacyBtn) {
    privacyBtn.addEventListener("click", (e) => {
      e.preventDefault();
      privacyModal.classList.add("active");
      privacyModal.querySelector("#closePrivacyModalX").focus();
    });
  }

  const hidePrivacyModal = () => {
    privacyModal.classList.remove("active");
  };

  if (closePrivacyX) closePrivacyX.addEventListener("click", hidePrivacyModal);
  if (closePrivacyBtn)
    closePrivacyBtn.addEventListener("click", hidePrivacyModal);
  if (privacyModal) {
    privacyModal.addEventListener("click", (e) => {
      if (e.target === privacyModal) hidePrivacyModal();
    });
  }

  attachGlobalEvents();
  fetchProducts();
  updateCartUI();
  syncFavButtonsUI();
});
