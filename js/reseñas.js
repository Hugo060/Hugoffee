document.addEventListener('DOMContentLoaded', async () => {
    let baseProducts = [];
    
    try {
        const response = await fetch('datos/productos.json');
        const data = await response.json();
        baseProducts = data.productos || [];
    } catch (e) {
        try {
            const response2 = await fetch('/datos/productos.json');
            const data2 = await response2.json();
            baseProducts = data2.productos || [];
        } catch (err) {
            baseProducts = [];
        }
    }

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'reviewsModalOverlay';
    modalOverlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(3px); z-index: 9999; display: none; align-items: center; justify-content: center; padding: 20px; opacity: 0; transition: opacity 0.3s ease;';

    const modalContent = document.createElement('div');
    modalContent.id = 'reviewsModalContent';
    modalContent.style.cssText = 'background: var(--color-base, #ffffff); border-radius: 12px; width: 100%; max-width: 500px; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 10px 25px rgba(0,0,0,0.2); transform: scale(0.95); transition: transform 0.3s ease; overflow: hidden;';
    
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const observer = new MutationObserver(() => {
        injectReviewButtons();
    });

    const productsGrid = document.getElementById('productsGrid') || document.getElementById('carouselGrid');
    if (productsGrid) {
        observer.observe(productsGrid, { childList: true, subtree: true });
    }
    
    setTimeout(injectReviewButtons, 100);

    function injectReviewButtons() {
        document.querySelectorAll('.product-card').forEach(card => {
            if (card.querySelector('.btn-reviews')) return;

            const productId = card.getAttribute('data-id');
            const titleEl = card.querySelector('h4');
            const title = titleEl ? titleEl.textContent.trim() : 'Producto';
            const cardFooter = card.querySelector('.card-footer') || card;

            if (productId) {
                const ratingData = getProductRatingSummary(productId);
                
                const reviewBtn = document.createElement('button');
                reviewBtn.className = 'btn-secondary btn-reviews';
                reviewBtn.style.cssText = 'width: 100%; margin-top: 8px; font-size: 13px; padding: 6px 12px; min-height: 36px; display: flex; align-items: center; justify-content: center; gap: 6px;';
                reviewBtn.innerHTML = `<span style="color: #EAB308; font-size: 16px;">★</span> <strong>${ratingData.average}</strong> (${ratingData.count} opiniones)`;

                reviewBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openReviewsModal(productId, title);
                });

                cardFooter.appendChild(reviewBtn);
            }
        });
    }

    function getProductRatingSummary(productId) {
        const key = `hugoffee_reviews_${productId}`;
        let reviews = JSON.parse(localStorage.getItem(key));
        
        if (!reviews) {
            const product = baseProducts.find(p => p.id === productId);
            reviews = product && product.reseñas ? product.reseñas : [];
        }

        if (reviews.length === 0) return { average: '0.0', count: 0 };

        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = (sum / reviews.length).toFixed(1);
        return { average: avg, count: reviews.length };
    }

    function openReviewsModal(productId, productName) {
        renderReviewsContent(productId, productName);
        modalOverlay.style.display = 'flex';
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            modalContent.style.transform = 'scale(1)';
        }, 10);
    }

    function closeReviewsModal() {
        modalOverlay.style.opacity = '0';
        modalContent.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modalOverlay.style.display = 'none';
        }, 300);
    }

    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeReviewsModal();
    });

    function renderReviewsContent(productId, productName) {
        const key = `hugoffee_reviews_${productId}`;
        let reviews = JSON.parse(localStorage.getItem(key));
        
        if (!reviews) {
            const product = baseProducts.find(p => p.id === productId);
            reviews = product && product.reseñas ? product.reseñas : [];
            localStorage.setItem(key, JSON.stringify(reviews));
        }

        const summary = getProductRatingSummary(productId);
        const starsHtml = getStarsHtml(parseFloat(summary.average), productId);

        modalContent.innerHTML = `
            <div style="padding: 20px; border-bottom: 1px solid var(--color-secondary); display: flex; justify-content: space-between; align-items: center; background: var(--color-base);">
                <div>
                    <h3 style="margin: 0; font-size: 20px; color: var(--color-primary);">${productName}</h3>
                    <div style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
                        ${starsHtml}
                        <span style="font-weight: 700; font-size: 16px;">${summary.average}</span>
                        <span style="color: var(--color-muted); font-size: 13px;">(${summary.count} valoraciones)</span>
                    </div>
                </div>
                <button id="closeModalBtn" style="background: none; border: none; font-size: 28px; cursor: pointer; color: var(--color-muted); line-height: 1;">&times;</button>
            </div>

            <div style="padding: 20px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 12px; background: #faf9f7;">
                ${reviews.length === 0 ? '<p style="text-align: center; color: var(--color-muted); padding: 20px 0;">No hay reseñas aún. ¡Sé el primero!</p>' : 
                    reviews.map(r => `
                        <div style="background: #ffffff; padding: 14px; border-radius: 8px; border: 1px solid #eaeaea; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                                <strong style="color: var(--color-primary); font-size: 14px;">${r.name}</strong>
                                <span style="font-size: 12px; color: var(--color-muted);">${r.date}</span>
                            </div>
                            <div style="margin-bottom: 8px;">${getStarsHtml(r.rating, productId + Math.random())}</div>
                            <p style="margin: 0; font-size: 14px; color: var(--color-text-body); line-height: 1.4;">${r.comment}</p>
                        </div>
                    `).join('')}
            </div>

            <form id="addReviewForm" style="padding: 20px; border-top: 1px solid var(--color-secondary); background: var(--color-base); display: flex; flex-direction: column; gap: 12px;">
                <h4 style="margin: 0; font-size: 16px; color: var(--color-primary);">Añadir tu valoración</h4>
                <div style="display: flex; gap: 12px;">
                    <input type="text" id="reviewAuthor" placeholder="Tu nombre" required style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid var(--color-muted); font-family: inherit;" />
                    <select id="reviewRating" required style="padding: 10px; border-radius: 6px; border: 1px solid var(--color-muted); font-family: inherit; font-weight: 600;">
                        <option value="5">5 Estrellas</option>
                        <option value="4">4 Estrellas</option>
                        <option value="3">3 Estrellas</option>
                        <option value="2">2 Estrellas</option>
                        <option value="1">1 Estrella</option>
                    </select>
                </div>
                <textarea id="reviewComment" placeholder="Cuéntanos tu experiencia..." rows="2" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--color-muted); font-family: inherit; resize: vertical;"></textarea>
                <button type="submit" class="btn-primary" style="padding: 10px; font-size: 15px; border-radius: 6px; border: none; cursor: pointer;">Publicar Reseña</button>
            </form>
        `;

        document.getElementById('closeModalBtn').addEventListener('click', closeReviewsModal);

        document.getElementById('addReviewForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reviewAuthor').value.trim();
            const rating = parseInt(document.getElementById('reviewRating').value);
            const comment = document.getElementById('reviewComment').value.trim();

            if (!name || !comment) return;

            const newReview = {
                name,
                rating,
                comment,
                date: new Date().toISOString().split('T')[0]
            };

            reviews.unshift(newReview);
            localStorage.setItem(key, JSON.stringify(reviews));

            renderReviewsContent(productId, productName);
            updateGridButton(productId);
        });
    }

    function updateGridButton(productId) {
        const card = document.querySelector(`.product-card[data-id="${productId}"]`);
        if (card) {
            const btn = card.querySelector('.btn-reviews');
            const ratingData = getProductRatingSummary(productId);
            if (btn) {
                btn.innerHTML = `<span style="color: #EAB308; font-size: 16px;">★</span> <strong>${ratingData.average}</strong> (${ratingData.count} opiniones)`;
            }
        }
    }

    function getStarsHtml(rating, uniqueId) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += `<svg width="18" height="18" viewBox="0 0 24 24" fill="#EAB308" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
                const gradId = `halfStar-${uniqueId}-${i}`.replace(/[^a-zA-Z0-9-]/g, '');
                stars += `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="${gradId}"><stop offset="50%" stop-color="#EAB308" /><stop offset="50%" stop-color="transparent" /></linearGradient></defs><polygon fill="url(#${gradId})" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            } else {
                stars += `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
            }
        }
        return `<div style="display: flex; gap: 2px; align-items: center;">${stars}</div>`;
    }
});