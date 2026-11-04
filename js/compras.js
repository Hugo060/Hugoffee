document.addEventListener('DOMContentLoaded', () => {
    const ordersContainer = document.getElementById('ordersContainer');

    const session = typeof getValidSession === 'function' ? getValidSession() : null;
    const user = session ? (session.user || session) : null;

    if (!user || (!user.id && !user.email && !user.name && !user.nombre)) {
        localStorage.setItem('redirectAfterLogin', 'compras.html');
        window.location.href = 'inicioSesion.html';
        return;
    }

    const userId = user.id || user.email || 'default_user';
    const ordersKey = `hugoffee_orders_${userId}`;
    const cartKey = `hugoffee_cart_${userId}`;
    let orders = JSON.parse(localStorage.getItem(ordersKey)) || [];

    if (!ordersContainer) return;

    function showConfirmModal(message, onConfirm) {
        const existingOverlay = document.getElementById('modalOverlay');
        if (existingOverlay) existingOverlay.remove();

        const overlay = document.createElement('div');
        overlay.id = 'modalOverlay';
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
        overlay.style.transition = 'opacity 0.3s ease';

        const modal = document.createElement('div');
        modal.style.backgroundColor = 'var(--color-base, #fff)';
        modal.style.color = 'var(--color-primary, #4B3621)';
        modal.style.padding = '30px 40px';
        modal.style.borderRadius = '12px';
        modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
        modal.style.textAlign = 'center';
        modal.style.maxWidth = '400px';
        modal.style.width = '90%';
        modal.style.transform = 'scale(0.8)';
        modal.style.transition = 'transform 0.3s ease';

        modal.innerHTML = `
            <div style="font-size: 42px; margin-bottom: 12px;">⚠️</div>
            <h3 style="margin-bottom: 10px; font-size: 20px; font-weight: 700;">¿Estás seguro?</h3>
            <p style="font-size: 14px; color: var(--color-muted, #666); margin-bottom: 24px;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="modalCancelBtn" style="padding: 10px 20px; background: transparent; color: var(--color-primary, #4B3621); border: 1.5px solid var(--color-muted); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">Cancelar</button>
                <button id="modalConfirmBtn" style="padding: 10px 20px; background: #d9534f; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">Eliminar</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);

        const closeModal = (callback) => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            setTimeout(() => {
                overlay.remove();
                if (callback) callback();
            }, 300);
        };

        document.getElementById('modalCancelBtn').addEventListener('click', () => closeModal());
        document.getElementById('modalConfirmBtn').addEventListener('click', () => {
            closeModal(onConfirm);
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    function renderOrders() {
        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="story-box" style="text-align: center; padding: 40px;">
                    <h3>No tienes ningún pedido todavía</h3>
                    <p style="color: var(--color-muted); margin: 15px 0;">Explora nuestro menú y disfruta de un buen café o repostería artesanal.</p>
                    <a href="menu.html" class="btn-primary" style="display: inline-block; text-decoration: none; padding: 10px 20px;">Ir al Menú</a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = '';

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'story-box';
            orderCard.style.marginBottom = 'var(--space-md)';

            const orderDate = new Date(order.date).toLocaleString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            let itemsHtml = '';
            order.items.forEach(item => {
                const subtotal = (item.price * item.quantity).toFixed(2).replace('.', ',');
                itemsHtml += `
                    <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                        <span>${item.quantity}x ${item.title}</span>
                        <span>&nbsp;</span>
                        <strong>${subtotal} €</strong>
                    </div>
                `;
            });

            orderCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--color-muted); padding-bottom: 12px; margin-bottom: 12px;">
                    <div>
                        <h3 style="margin: 0; font-size: 18px;">Pedido #${order.id}</h3>
                        <span style="font-size: 13px; color: var(--color-muted);">${orderDate}</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: inline-block; padding: 4px 10px; background: var(--color-accent); color: #fff; border-radius: 20px; font-size: 12px; font-weight: 600;">${order.tipoEntrega || 'Recogida en tienda'}</span>
                    </div>
                </div>

                <div style="margin-bottom: 12px;">
                    <p style="font-size: 14px; margin: 4px 0;"><strong>Programación:</strong> ${order.programacion || 'Lo antes posible'}</p>
                    <p style="font-size: 14px; margin: 4px 0;"><strong>Nombre:</strong> ${order.envio.nombre} (${order.envio.telefono})</p>
                    <p style="font-size: 14px; margin: 4px 0;"><strong>Destino:</strong> ${order.envio.direccion}</p>
                    ${order.envio.notas ? `<p style="font-size: 14px; margin: 4px 0;"><strong>Notas:</strong> ${order.envio.notas}</p>` : ''}
                </div>

                <div style="background: var(--color-base); padding: 10px; border-radius: 8px; margin-bottom: 12px;">
                    <span style="font-size: 13px; font-weight: 600; display: block; margin-bottom: 6px; color: var(--color-primary);">Productos:</span>
                    ${itemsHtml}
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: 700; border-top: 1px solid var(--color-muted); padding-top: 10px; margin-bottom: 15px;">
                    <span>Total pagado:</span>
                    <span style="color: var(--color-accent);">${order.total.toFixed(2).replace('.', ',')} €</span>
                </div>

                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button class="btn-repeat-order" data-id="${order.id}" style="padding: 8px 16px; background: var(--color-primary); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">Repetir compra</button>
                    <button class="btn-delete-order" data-id="${order.id}" style="padding: 8px 16px; background: transparent; color: #d9534f; border: 1px solid #d9534f; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">Eliminar</button>
                </div>
            `;

            ordersContainer.appendChild(orderCard);
        });

        attachOrderActions();
    }

    function attachOrderActions() {
        document.querySelectorAll('.btn-repeat-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.getAttribute('data-id');
                const orderToRepeat = orders.find(o => o.id === orderId);
                if (!orderToRepeat) return;

                localStorage.setItem(cartKey, JSON.stringify(orderToRepeat.items));
                window.location.href = 'compra.html';
            });
        });

        document.querySelectorAll('.btn-delete-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.getAttribute('data-id');
                showConfirmModal('¿Estás seguro de que deseas eliminar este pedido del historial?', () => {
                    orders = orders.filter(o => o.id !== orderId);
                    localStorage.setItem(ordersKey, JSON.stringify(orders));
                    renderOrders();
                });
            });
        });
    }

    renderOrders();
});