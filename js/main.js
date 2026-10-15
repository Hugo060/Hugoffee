document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const mainCategoryBtns = document.querySelectorAll('.main-cat-btn');
    const subcategoryGroups = document.querySelectorAll('.subcategories-group');
    const productsSection = document.getElementById('productsSection');
    const productsGrid = document.getElementById('productsGrid');
    const cartCount = document.getElementById('cartCount');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const carouselGrid = document.getElementById('carouselGrid');
    const carouselDots = document.querySelectorAll('#carouselDots .dot');
    const checkoutBtn = document.querySelector('.cart-checkout-btn');

    const cartButton = document.getElementById('cartButton') || document.querySelector('.cart-button');
    const closeCartBtn = document.getElementById('closeCart') || document.querySelector('.cart-close') || document.querySelector('.close-cart');
    const cartDrawer = document.getElementById('cartDrawer');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotal');

    const suggestionForm = document.getElementById('suggestionForm');
    const suggestionCategory = document.getElementById('suggestionCategory');
    const suggestionEmail = document.getElementById('suggestionEmail');
    const suggestionText = document.getElementById('suggestionText');
    const suggestionMessage = document.getElementById('suggestionMessage');

    let currentMainCategory = null;
    let currentSubcategory = 'todos';
    let allProducts = [];

    function getCurrentUserId() {
        if (typeof getValidSession === 'function') {
            const session = getValidSession();
            if (session && session.user && session.user.id) {
                return session.user.id;
            }
        }
        return 'guest';
    }

    function isUserLoggedIn() {
        return getCurrentUserId() !== 'guest';
    }

    function getUserStorageKey(type) {
        const userId = getCurrentUserId();
        return `hugoffee_${type}_${userId}`;
    }

    function getSavedCart() {
        const userId = getCurrentUserId();
        if (userId === 'guest') {
            return JSON.parse(sessionStorage.getItem('hugoffee_cart_guest')) || [];
        }
        return JSON.parse(localStorage.getItem(getUserStorageKey('cart'))) || [];
    }

    function saveCart(cartData) {
        const userId = getCurrentUserId();
        if (userId === 'guest') {
            sessionStorage.setItem('hugoffee_cart_guest', JSON.stringify(cartData));
        } else {
            localStorage.setItem(getUserStorageKey('cart'), JSON.stringify(cartData));
        }
    }

    function getSavedFavs() {
        return JSON.parse(localStorage.getItem(getUserStorageKey('favs'))) || [];
    }

    function saveFavs(favsData) {
        localStorage.setItem(getUserStorageKey('favs'), JSON.stringify(favsData));
    }

    let cart = getSavedCart();
    let favorites = getSavedFavs();

    function updateCartUI() {
        cart = getSavedCart();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;

        if (!cartItemsContainer || !cartTotalElement) return;

        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-container">
                    <p class="cart-empty">Tu carrito está vacío</p>
                </div>
            `;
            cartTotalElement.textContent = '0,00 €';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const itemEl = document.createElement('div');
                itemEl.className = 'cart-item';
                itemEl.innerHTML = `
                    <div class="cart-item-details">
                        <h4 class="cart-item-title">${item.title}</h4>
                        <span class="cart-item-price">${item.price.toFixed(2).replace('.', ',')} € x ${item.quantity}</span>
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
                `;
                cartItemsContainer.appendChild(itemEl);
            });

            cartTotalElement.textContent = `${total.toFixed(2).replace('.', ',')} €`;
        }
    }

    const toggleCart = () => {
        if (cartDrawer && cartOverlay) {
            cartDrawer.classList.toggle('active');
            cartOverlay.classList.toggle('active');
        }
    };

    if (cartButton) cartButton.addEventListener('click', toggleCart);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
    if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

    function handleAddToCart(btn) {
        const id = btn.getAttribute('data-id');
        const title = btn.getAttribute('data-title');
        const price = parseFloat(btn.getAttribute('data-price')) || 0;

        cart = getSavedCart();
        const existingIndex = cart.findIndex(item => item.id === id);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({ id, title, price, quantity: 1 });
        }

        saveCart(cart);
        updateCartUI();

        const originalText = btn.textContent;
        btn.textContent = '¡Añadido!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 1000);
    }

    function handleFavClick(btn) {
        if (!isUserLoggedIn()) {
            localStorage.setItem('redirectAfterLogin', window.location.href);
            window.location.href = 'inicioSesion.html';
            return;
        }

        const name = btn.getAttribute('data-name');
        if (!name) return;

        favorites = getSavedFavs();
        const isCurrentlyFav = favorites.includes(name);

        if (isCurrentlyFav) {
            favorites = favorites.filter(fav => fav !== name);
        } else {
            favorites.push(name);
        }

        saveFavs(favorites);
        syncFavButtonsUI();
    }

    function syncFavButtonsUI() {
        favorites = getSavedFavs();
        document.querySelectorAll('.btn-fav').forEach(btn => {
            const name = btn.getAttribute('data-name');
            if (!name) return;

            const isFav = favorites.includes(name);
            if (isFav) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function attachGlobalEvents() {
        document.querySelectorAll('.btn-add').forEach(button => {
            button.removeEventListener('click', button._cartHandler);
            button._cartHandler = () => handleAddToCart(button);
            button.addEventListener('click', button._cartHandler);
        });

        document.querySelectorAll('.btn-fav').forEach(button => {
            button.removeEventListener('click', button._favHandler);
            button._favHandler = () => handleFavClick(button);
            button.addEventListener('click', button._favHandler);
        });
    }

    async function fetchProducts() {
        if (!productsGrid) return;
        try {
            const response = await fetch('/datos/productos.json');
            const data = await response.json();
            allProducts = data.productos;

            const urlParams = new URLSearchParams(window.location.search);
            const searchParam = urlParams.get('search');
            if (searchParam && searchInput) {
                searchInput.value = searchParam;
            }

            filterProducts();
            syncFavButtonsUI(); 
        } catch (error) {
            console.error('Error al cargar productos:', error);
            productsGrid.innerHTML = '<p class="no-products">Error al cargar los productos. Intenta más tarde.</p>';
        }
    }

    function renderProducts(products) {
        if (!productsGrid) return;
        productsGrid.innerHTML = '';

        const query = searchInput ? searchInput.value.trim() : '';
        if (products.length === 0) {
            if (query || currentMainCategory) {
                productsGrid.innerHTML = '<p class="no-products">No se encontraron productos.</p>';
            }
            return;
        }

        products.forEach(product => {
            const isFav = favorites.includes(product.nombre);
            const card = document.createElement('article');
            card.className = 'product-card';
            card.setAttribute('data-id', product.id);
            card.setAttribute('data-category', product.categoria);
            card.setAttribute('data-subcategory', product.subcategoria);

            card.innerHTML = `
                <div class="badge-container">
                    ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
                </div>
                <div class="product-image-placeholder"></div>
                <h4>${product.nombre}</h4>
                <h5>${product.subtitulo}</h5>
                <h6>${product.descripcion}</h6>
                <div class="card-footer">
                    <p class="product-price">${product.precio.toFixed(2).replace('.', ',')} €</p>
                    <div class="card-actions">                    
                        <button class="btn-add" data-id="${product.id}" data-title="${product.nombre}" data-price="${product.precio}">Añadir al carrito</button>
                        <button class="btn-fav ${isFav ? 'active' : ''}" aria-label="Añadir a favoritos" data-name="${product.nombre}">
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
        cartItemsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const id = btn.getAttribute('data-id');
            if (!id) return;

            cart = getSavedCart();
            const itemIndex = cart.findIndex(item => item.id === id);
            if (itemIndex === -1) return;

            if (btn.classList.contains('increase')) {
                cart[itemIndex].quantity += 1;
            } else if (btn.classList.contains('decrease')) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    cart.splice(itemIndex, 1);
                }
            } else if (btn.classList.contains('cart-delete-btn')) {
                cart.splice(itemIndex, 1);
            }

            saveCart(cart);
            updateCartUI();
        });
    }

    function filterProducts() {
        if (!productsSection || allProducts.length === 0) return;

        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        if (!query && !currentMainCategory) {
            renderProducts([]); 
            return;
        }

        const filtered = allProducts.filter(product => {
            const matchesSearch = !query || 
                product.nombre.toLowerCase().includes(query) ||
                product.descripcion.toLowerCase().includes(query) ||
                product.subtitulo.toLowerCase().includes(query) ||
                (product.badge && product.badge.toLowerCase().includes(query));

            const matchesCategory = !currentMainCategory || product.categoria === currentMainCategory;
            const matchesSubcategory = currentSubcategory === 'todos' || product.subcategoria === currentSubcategory;

            return matchesSearch && matchesCategory && matchesSubcategory;
        });

        renderProducts(filtered);
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (!productsSection && window.location.pathname.indexOf('menu.html') === -1) {
                window.location.href = `menu.html?search=${encodeURIComponent(searchInput.value)}`;
            } else {
                filterProducts();
            }
        });
    }

    if (mainCategoryBtns.length > 0) {
        mainCategoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const cat = btn.getAttribute('data-category');

                if (currentMainCategory === cat) {
                    currentMainCategory = null;
                    btn.classList.remove('active');
                    subcategoryGroups.forEach(group => group.classList.remove('active'));
                } else {
                    currentMainCategory = cat;
                    mainCategoryBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');

                    subcategoryGroups.forEach(group => {
                        group.classList.toggle('active', group.id === `subcategories-${cat}`);
                    });
                }

                currentSubcategory = 'todos';
                document.querySelectorAll('.sub-cat-btn').forEach(subBtn => {
                    subBtn.classList.toggle('active', subBtn.getAttribute('data-subcategory') === 'todos');
                });

                filterProducts();
            });
        });
    }

    if (subcategoryGroups.length > 0) {
        subcategoryGroups.forEach(group => {
            const subBtns = group.querySelectorAll('.sub-cat-btn');
            subBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    subBtns.forEach(sb => sb.classList.remove('active'));
                    btn.classList.add('active');

                    currentSubcategory = btn.getAttribute('data-subcategory');
                    filterProducts();
                });
            });
        });
    }

    if (carouselGrid) {
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                carouselGrid.scrollBy({ left: -300, behavior: 'smooth' });
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                carouselGrid.scrollBy({ left: 300, behavior: 'smooth' });
            });
        }

        if (carouselDots.length > 0) {
            carouselDots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    const scrollAmount = (carouselGrid.scrollWidth / carouselDots.length) * index;
                    carouselGrid.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                });
            });

            carouselGrid.addEventListener('scroll', () => {
                const maxScroll = carouselGrid.scrollWidth - carouselGrid.clientWidth;
                if (maxScroll <= 0) return;
                const scrollRatio = carouselGrid.scrollLeft / maxScroll;
                const activeIndex = Math.min(
                    Math.floor(scrollRatio * carouselDots.length),
                    carouselDots.length - 1
                );
                carouselDots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === activeIndex);
                });
            });
        }
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            const session = typeof getValidSession === 'function' ? getValidSession() : null;

            if (!session) {
                e.preventDefault();
                localStorage.setItem('redirectAfterLogin', 'pago.html');
                window.location.href = 'inicioSesion.html';
                return;
            }

            window.location.href = 'pago.html';
        });
    }

    if (suggestionForm) {
        suggestionForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const category = suggestionCategory.value;
            const text = suggestionText.value.trim();
            const email = suggestionEmail.value.trim();

            if (!category) {
                suggestionMessage.textContent = 'Por favor, selecciona una categoría para tu sugerencia.';
                suggestionMessage.className = 'suggestion-message error';
                return;
            }

            if (!text) {
                suggestionMessage.textContent = 'Por favor, escribe el contenido de tu sugerencia.';
                suggestionMessage.className = 'suggestion-message error';
                return;
            }

            const newSuggestion = {
                id: 'sug_' + Date.now(),
                categoria: category,
                texto: text,
                email: email || 'Anónimo',
                fecha: new Date().toISOString()
            };

            const storedSuggestions = JSON.parse(localStorage.getItem('hugoffee_suggestions')) || [];
            storedSuggestions.push(newSuggestion);
            localStorage.setItem('hugoffee_suggestions', JSON.stringify(storedSuggestions));

            suggestionMessage.textContent = '¡Muchas gracias por tu idea! La hemos registrado para el equipo de Hugoffee.';
            suggestionMessage.className = 'suggestion-message success';

            suggestionForm.reset();

            setTimeout(() => {
                suggestionMessage.style.display = 'none';
            }, 5000);
        });
    }

    attachGlobalEvents();
    fetchProducts();
    updateCartUI();
    syncFavButtonsUI();
});