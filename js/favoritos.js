document.addEventListener('DOMContentLoaded', async () => {
    const favoritesGrid = document.getElementById('favoritesGrid');
    if (!favoritesGrid) return;

    const session = typeof getValidSession === 'function' ? getValidSession() : null;
    const user = session ? (session.user || session) : null;

    if (!user || (!user.id && !user.email && !user.name && !user.nombre)) {
        localStorage.setItem('redirectAfterLogin', 'favoritos.html');
        window.location.href = 'inicioSesion.html';
        return;
    }

    const userId = user.id || user.email || user.name || user.nombre || 'default_user';
    
    let favKey = `hugoffee_favs_${userId}`;
    let favoriteNames = JSON.parse(localStorage.getItem(favKey)) || [];
    
    if (favoriteNames.length === 0 && user.id) {
        favKey = `hugoffee_favs_usr_001`;
        favoriteNames = JSON.parse(localStorage.getItem(favKey)) || [];
    }

    let allProducts = [];
    try {
        const response = await fetch('datos/productos.json');
        const data = await response.json();
        allProducts = data.productos || [];
    } catch (error) {
        try {
            const response2 = await fetch('/datos/productos.json');
            const data2 = await response2.json();
            allProducts = data2.productos || [];
        } catch (e) {
            allProducts = [];
        }
    }

    function renderFavorites() {
        if (!favoriteNames || favoriteNames.length === 0 || allProducts.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="story-box" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>Aún no tienes productos favoritos</h3>
                    <p style="color: var(--color-muted); margin: 15px 0;">Navega por nuestro menú y pulsa en el corazón de tus cafés o postres preferidos.</p>
                    <a href="menu.html" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 10px 20px;">Explorar Menú</a>
                </div>
            `;
            return;
        }

        const favoriteProducts = allProducts.filter(p => favoriteNames.includes(p.nombre));

        if (favoriteProducts.length === 0) {
            favoritesGrid.innerHTML = `
                <div class="story-box" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                    <h3>Aún no tienes productos favoritos</h3>
                    <p style="color: var(--color-muted); margin: 15px 0;">Navega por nuestro menú y pulsa en el corazón de tus cafés o postres preferidos.</p>
                    <a href="menu.html" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 10px 20px;">Explorar Menú</a>
                </div>
            `;
            return;
        }

        favoritesGrid.innerHTML = '';

        favoriteProducts.forEach(product => {
            const card = document.createElement('article');
            card.className = 'product-card';

            const priceNum = parseFloat(product.precio || 0);
            const priceFormatted = priceNum.toFixed(2).replace('.', ',');
            const title = product.nombre;
            const subtitle = product.subtitulo || 'Selección de la casa';
            const description = product.descripcion || '';
            const image = product.imagen;

            const productImage = image ? 
                `<div class="product-image-container" style="width: 100%; height: 180px; overflow: hidden; border-radius: 8px; margin-bottom: 12px; background: #f5f0eb;"><img src="${image}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" /></div>` : 
                `<div class="product-image-placeholder"></div>`;

            card.innerHTML = `
                <div class="badge-container">
                    ${product.badge ? `<span class="badge">${product.badge}</span>` : '<span class="badge">FAVORITO</span>'}
                </div>
                ${productImage}
                <!-- APLICADOS LOS CAMBIOS DE JERARQUÍA DE ENCABEZADOS -->
                <h3>${title}</h3>
                <h4>${subtitle}</h4>
                <h5>${description}</h5>
                <div class="card-footer">
                    <p class="product-price">${priceFormatted} €</p>
                    <div class="card-actions">
                        <button class="btn-add btn-add-fav" data-id="${product.id}" data-title="${title}" data-price="${priceNum}">
                            Añadir al carrito
                        </button>
                        <button class="btn-fav active btn-remove-fav" data-name="${title}" aria-label="Quitar de favoritos" title="Quitar de favoritos">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;

            favoritesGrid.appendChild(card);
        });

        attachActions();
    }

    function attachActions() {
        document.querySelectorAll('.btn-add-fav').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const id = btn.getAttribute('data-id');
                const title = btn.getAttribute('data-title');
                const price = parseFloat(btn.getAttribute('data-price'));

                if (typeof window.addToCart === 'function') {
                    window.addToCart(id, title, price);
                } else {
                    const cartKey = `hugoffee_cart_${userId}`;
                    let cart = [];
                    try {
                        cart = JSON.parse(localStorage.getItem(cartKey)) || [];
                    } catch (err) {
                        cart = [];
                    }
                    const existing = cart.find(item => item.id === id);
                    if (existing) {
                        existing.quantity += 1;
                    } else {
                        cart.push({ id, title, price, quantity: 1 });
                    }
                    localStorage.setItem(cartKey, JSON.stringify(cart));
                }
            });
        });

        document.querySelectorAll('.btn-remove-fav').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.currentTarget;
                const name = btn.getAttribute('data-name');
                favoriteNames = favoriteNames.filter(item => item !== name);
                localStorage.setItem(favKey, JSON.stringify(favoriteNames));
                renderFavorites();
            });
        });
    }

    renderFavorites();
});