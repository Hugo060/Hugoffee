document.addEventListener('DOMContentLoaded', () => {
    const summaryContainer = document.getElementById('checkoutSummaryItems');
    const totalElement = document.getElementById('checkoutTotal');
    const checkoutForm = document.getElementById('checkoutForm');
    const radiosEntrega = document.getElementsByName('tipoEntrega');
    const direccionRow = document.getElementById('direccionRow');
    const direccionInput = document.getElementById('direccionEnvio');
    const tipoProgramacion = document.getElementById('tipoProgramacion');
    const horaProgramadaRow = document.getElementById('horaProgramadaRow');
    const horaSelect = document.getElementById('horaPedido');

    const session = typeof getValidSession === 'function' ? getValidSession() : null;
    const user = session ? (session.user || session) : null;

    if (!user || (!user.id && !user.email && !user.name && !user.nombre)) {
        localStorage.setItem('redirectAfterLogin', 'compra.html');
        window.location.href = 'inicioSesion.html';
        return;
    }

    const userId = user.id || user.email || 'default_user';
    const cartKey = `hugoffee_cart_${userId}`;
    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    if (cart.length === 0) {
        cart = JSON.parse(localStorage.getItem('hugoffee_cart')) || JSON.parse(sessionStorage.getItem('hugoffee_cart_guest')) || [];
    }

    const unselectedMilkItem = cart.find(item => item.permiteLeche && !item.tipoLeche);
    if (unselectedMilkItem) {
        alert("Hay productos que requieren selección de leche. Serás redirigido al menú/carrito.");
        window.location.href = 'menu.html';
        return;
    }

    function populateTimeSlots() {
        if (!horaSelect) return;
        horaSelect.innerHTML = '<option value="" disabled selected>Selecciona una hora...</option>';
        for (let h = 8; h <= 21; h++) {
            const hourStr = String(h).padStart(2, '0');
            
            const option00 = document.createElement('option');
            option00.value = `${hourStr}:00`;
            option00.textContent = `${hourStr}:00`;
            horaSelect.appendChild(option00);

            if (h < 21) {
                const option30 = document.createElement('option');
                option30.value = `${hourStr}:30`;
                option30.textContent = `${hourStr}:30`;
                horaSelect.appendChild(option30);
            }
        }
    }

    populateTimeSlots();

    radiosEntrega.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'domicilio') {
                direccionRow.style.display = 'block';
                direccionInput.setAttribute('required', 'true');
            } else {
                direccionRow.style.display = 'none';
                direccionInput.removeAttribute('required');
            }
            renderSummary();
        });
    });

    tipoProgramacion.addEventListener('change', (e) => {
        if (e.target.value === 'programar') {
            horaProgramadaRow.style.display = 'block';
            horaSelect.setAttribute('required', 'true');
        } else {
            horaProgramadaRow.style.display = 'none';
            horaSelect.removeAttribute('required');
        }
    });

    function getSubtotalProductos() {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    function getSuplementoDomicilio() {
        const domicilioRadio = document.querySelector('input[name="tipoEntrega"][value="domicilio"]');
        if (!domicilioRadio || !domicilioRadio.checked) return 0.00;
        const subtotal = getSubtotalProductos();
        return subtotal >= 20.00 ? 0.00 : 2.00;
    }

    function renderSummary() {
        if (!summaryContainer || !totalElement) return;
        if (cart.length === 0) {
            summaryContainer.innerHTML = '<p style="text-align: center; color: var(--color-muted);">Tu carrito está vacío.</p>';
            totalElement.textContent = '0,00 €';
            return;
        }

        summaryContainer.innerHTML = '';
        let subtotalProductos = 0;

        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            subtotalProductos += subtotal;

            const milkLabel = item.permiteLeche && item.tipoLeche ? `<br><small style="color: var(--color-accent);">Leche: ${item.tipoLeche}</small>` : '';

            const itemEl = document.createElement('div');
            itemEl.style.display = 'flex';
            itemEl.style.justify = 'space-between';
            itemEl.style.marginBottom = '8px';
            itemEl.style.fontSize = '14px';
            itemEl.innerHTML = `
                <div><span>${item.quantity}x ${item.title}</span>${milkLabel}</div>
                <strong>${subtotal.toFixed(2).replace('.', ',')} €</strong>
            `;
            summaryContainer.appendChild(itemEl);
        });

        const domicilioRadio = document.querySelector('input[name="tipoEntrega"][value="domicilio"]');
        if (domicilioRadio && domicilioRadio.checked) {
            const suplemento = getSuplementoDomicilio();
            const supEl = document.createElement('div');
            supEl.style.display = 'flex';
            supEl.style.justify = 'space-between';
            supEl.style.marginBottom = '8px';
            supEl.style.fontSize = '14px';
            supEl.style.color = 'var(--color-accent)';
            if (suplemento > 0) {
                supEl.innerHTML = `
                    <span>Suplemento envío a casa</span>
                    <strong>+${suplemento.toFixed(2).replace('.', ',')} €</strong>
                `;
            } else {
                supEl.innerHTML = `
                    <span>Envío a domicilio (Pedido &gt; 20€)</span>
                    <strong>Gratis</strong>
                `;
            }
            summaryContainer.appendChild(supEl);
        }

        const totalFinal = subtotalProductos + getSuplementoDomicilio();
        totalElement.textContent = totalFinal.toFixed(2).replace('.', ',') + ' €';
    }

    renderSummary();

    function showNotification(message) {
        const existingOverlay = document.getElementById('toastOverlay');
        if (existingOverlay) existingOverlay.remove();

        const overlay = document.createElement('div');
        overlay.id = 'toastOverlay';
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
            <div style="font-size: 48px; margin-bottom: 15px;">🎉</div>
            <h3 style="margin-bottom: 10px; font-size: 22px; font-weight: 700;">¡Pedido Exitoso!</h3>
            <p style="font-size: 15px; color: var(--color-muted, #666); margin-bottom: 20px;">${message}</p>
            <div style="font-size: 13px; font-weight: 600; color: var(--color-accent);">Redirigiendo a tus compras...</div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'scale(1)';
        }, 10);

        setTimeout(() => {
            overlay.style.opacity = '0';
            modal.style.transform = 'scale(0.8)';
            setTimeout(() => overlay.remove(), 300);
        }, 2200);
    }

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (cart.length === 0) {
                showNotification('Tu carrito está vacío.');
                return;
            }

            const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;
            let horaElegida = 'Lo antes posible';

            if (tipoProgramacion.value === 'programar') {
                const horaVal = horaSelect.value;
                if (!horaVal) {
                    showNotification('Por favor, selecciona una hora para programar tu pedido.');
                    return;
                }
                horaElegida = horaVal;
            }

            let subtotal = getSubtotalProductos();
            const suplemento = getSuplementoDomicilio();
            const total = subtotal + suplemento;

            const newOrder = {
                id: Date.now().toString().slice(-6),
                date: new Date().toISOString(),
                items: cart,
                total: total,
                tipoEntrega: tipoEntrega === 'domicilio' ? 'Envío a domicilio' : 'Recogida en tienda',
                programacion: horaElegida,
                envio: {
                    nombre: document.getElementById('nombreEnvio').value,
                    telefono: document.getElementById('telefonoEnvio').value,
                    direccion: tipoEntrega === 'domicilio' ? direccionInput.value : 'Recogida en local (Paseo Constitución, Arnedo)',
                    notas: document.getElementById('notasEnvio').value
                }
            };

            const ordersKey = `hugoffee_orders_${userId}`;
            const existingOrders = JSON.parse(localStorage.getItem(ordersKey)) || [];
            
            existingOrders.unshift(newOrder);
            localStorage.setItem(ordersKey, JSON.stringify(existingOrders));

            localStorage.removeItem(cartKey);
            localStorage.removeItem('hugoffee_cart');

            showNotification('¡Tu pedido se ha realizado con éxito!');
            setTimeout(() => {
                window.location.href = 'compras.html';
            }, 1800);
        });
    }
});