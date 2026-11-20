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
            <p style="font-size: 14px; color: var(--color-primary); opacity: 0.9; margin-bottom: 24px;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="modalCancelBtn" style="padding: 10px 20px; background: transparent; color: var(--color-primary, #4B3621); border: 1.5px solid var(--color-primary, #4B3621); border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">Cancelar</button>
                <button id="modalConfirmBtn" style="padding: 10px 20px; background: #c92a2a; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;">Eliminar</button>
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

    const currency = value => `${(Number(value) || 0).toFixed(2).replace('.', ',')} €`;
    const safeText = value => String(value == null ? '' : value);

    function descargarTicket(order) {
        if (window.jspdf && window.jspdf.jsPDF) {
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
            const width = 210;
            const margin = 20;
            const right = width - margin;
            let y = 25;
            const ensureSpace = (height = 8) => {
                if (y + height > 272) {
                    pdf.addPage();
                    y = 23;
                }
            };
            const line = (text, options = {}) => {
                const lines = pdf.splitTextToSize(safeText(text), 168);
                const size = options.size || 10;
                ensureSpace(lines.length * (size * 0.48) + 4);
                pdf.setFont('helvetica', options.bold ? 'bold' : 'normal');
                pdf.setFontSize(size);
                pdf.setTextColor(...(options.muted ? [105, 91, 80] : [75, 54, 33]));
                pdf.text(lines, margin, y);
                y += lines.length * (size * 0.48) + 4;
            };
            pdf.setFillColor(75, 54, 33);
            pdf.rect(0, 0, width, 12, 'F');
            line('HUGOFFEE', { bold: true, size: 22 });
            line('Resumen del pedido - Documento informativo', { muted: true, size: 10 });
            pdf.setDrawColor(225, 214, 204);
            pdf.line(margin, y, right, y);
            y += 8;
            line(`Pedido #${safeText(order.id)}`, { bold: true, size: 13 });
            const fecha = new Date(order.date);
            line(`Fecha: ${Number.isNaN(fecha.getTime()) ? 'No disponible' : fecha.toLocaleString('es-ES')}`);
            line(`Modalidad: ${safeText(order.tipoEntrega || 'Recogida en tienda')}`);
            line(`Programacion: ${safeText(order.programacion || 'Lo antes posible')}`);
            const envio = order.envio || {};
            line(`Cliente: ${safeText(envio.nombre)}`);
            if (envio.telefono) line(`Telefono: ${safeText(envio.telefono)}`);
            if (envio.direccion) line(`Destino: ${safeText(envio.direccion)}`);
            if (envio.notas) line(`Observaciones: ${safeText(envio.notas)}`);
            y += 3;
            pdf.setDrawColor(225, 214, 204);
            pdf.line(margin, y, right, y);
            y += 9;
            line('PRODUCTOS', { bold: true, size: 12 });
            (Array.isArray(order.items) ? order.items : []).forEach(item => {
                const qty = Number(item.quantity) || 1;
                line(`${qty} x ${safeText(item.title || item.nombre || 'Producto')} - ${currency(Number(item.price || 0) * qty)}`);
                if (item.tipoLeche) line(`  Leche: ${safeText(item.tipoLeche)}`, { muted: true, size: 9 });
            });
            y += 2;
            ensureSpace(22);
            pdf.setDrawColor(225, 214, 204);
            pdf.line(margin, y, right, y);
            y += 9;
            line(`TOTAL DEL PEDIDO: ${currency(order.total)}`, { bold: true, size: 14 });
            y += 8;
            line('Pedido registrado localmente. No acredita un pago real ni constituye factura fiscal.', { muted: true, size: 9 });
            pdf.save(`Hugoffee_ticket_${safeText(order.id).replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`);
            return;
        }
        imprimirTicket(order);
    }

    function imprimirTicket(order) {
        const escapeHtml = value => safeText(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
        const fecha = new Date(order.date);
        const fechaTexto = Number.isNaN(fecha.getTime()) ? 'No disponible' : fecha.toLocaleString('es-ES');
        const rows = (Array.isArray(order.items) ? order.items : []).map(item => `<tr><td>${escapeHtml(item.quantity || 1)} x ${escapeHtml(item.title || item.nombre || 'Producto')}${item.tipoLeche ? `<small>Leche: ${escapeHtml(item.tipoLeche)}</small>` : ''}</td><td>${escapeHtml(currency(Number(item.price || 0) * (Number(item.quantity) || 1)))}</td></tr>`).join('');
        const envio = order.envio || {};
        const popup = window.open('', '_blank', 'width=760,height=800');
        if (!popup) {
            alert('Permite las ventanas emergentes para imprimir o guardar el ticket como PDF.');
            return;
        }
        popup.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Ticket Hugoffee</title><style>body{font:15px Arial,sans-serif;color:#4b3621;max-width:670px;margin:32px auto;padding:0 20px}header{border-bottom:3px solid #536224;padding-bottom:20px}h1{font-size:30px;margin:0 0 6px}p{line-height:1.5}table{width:100%;border-collapse:collapse;margin:20px 0}td{padding:11px 6px;border-bottom:1px solid #ddd}td:last-child{text-align:right}small{display:block;color:#777}strong.total{font-size:22px}footer{font-size:12px;color:#666;margin-top:40px}@media print{body{margin:15mm auto}}</style></head><body><header><h1>HUGOFFEE</h1><div>Resumen del pedido · Documento informativo</div></header><h2>Pedido #${escapeHtml(order.id)}</h2><p><b>Fecha:</b> ${escapeHtml(fechaTexto)}<br><b>Modalidad:</b> ${escapeHtml(order.tipoEntrega || 'Recogida en tienda')}<br><b>Programación:</b> ${escapeHtml(order.programacion || 'Lo antes posible')}<br><b>Cliente:</b> ${escapeHtml(envio.nombre)}<br><b>Teléfono:</b> ${escapeHtml(envio.telefono)}<br><b>Destino:</b> ${escapeHtml(envio.direccion)}</p>${envio.notas ? `<p><b>Notas:</b> ${escapeHtml(envio.notas)}</p>` : ''}<table>${rows}</table><p><strong class="total">Total del pedido: ${escapeHtml(currency(order.total))}</strong></p><footer>Pedido registrado localmente. No acredita un pago real ni constituye factura fiscal.</footer><script>window.addEventListener('load',()=>window.print())<\/script></body></html>`);
        popup.document.close();
    }

    function renderOrders() {
        if (orders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="story-box" style="text-align: center; padding: 40px;">
                    <h3>No tienes ningún pedido todavía</h3>
                    <p style="color: var(--color-primary); opacity: 0.85; margin: 15px 0;">Explora nuestro menú y disfruta de un buen café o repostería artesanal.</p>
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
                        <span style="font-size: 13px; color: var(--color-primary); opacity: 0.85;">${orderDate}</span>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: inline-block; padding: 4px 10px; background: var(--color-accent); color: var(--color-base); border-radius: 20px; font-size: 12px; font-weight: 700;">${order.tipoEntrega || 'Recogida en tienda'}</span>
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

                <div class="hugoffee-order-actions">
                    <button class="btn-ticket-order" type="button" data-id="${order.id}" style="padding: 8px 16px; background: var(--color-primary); color: var(--color-base); border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">Descargar ticket PDF</button>
                    <button class="btn-repeat-order" data-id="${order.id}" style="padding: 8px 16px; background: var(--color-primary); color: var(--color-base); border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">Repetir compra</button>
                    <button class="btn-delete-order" data-id="${order.id}">Eliminar</button>
                </div>
            `;

            ordersContainer.appendChild(orderCard);
        });

        attachOrderActions();
    }

    function attachOrderActions() {
        document.querySelectorAll('.btn-ticket-order').forEach(button => {
            button.addEventListener('click', () => {
                const orderToDownload = orders.find(order => String(order.id) === button.dataset.id);
                if (orderToDownload) descargarTicket(orderToDownload);
            });
        });

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