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

    if (!cart || cart.length === 0) {
        window.location.href = 'menu.html';
        return;
    }

    const unselectedMilkItem = cart.find(item => item.permiteLeche && !item.tipoLeche);
    if (unselectedMilkItem) {
        alert("Hay productos que requieren selección de leche. Serás redirigido al menú/carrito.");
        window.location.href = 'menu.html';
        return;
    }

    const fechaPedido = document.getElementById('fechaPedido');
    const resumenProgramacion = document.getElementById('resumenProgramacion');
    const resumenEntrega = document.getElementById('resumenEntrega');
    const horaAyuda = document.getElementById('horaAyuda');
    const scheduleRadios = document.querySelectorAll('input[name="opcionHorario"]');
    const dateChips = document.querySelectorAll('.checkout-date-chip');
    const horarioDia = document.getElementById('horarioDia');
    const tiempoPreparacion = document.getElementById('tiempoPreparacion');
    const detallePreparacion = document.getElementById('detallePreparacion');
    const diasAntelacion = 7;
    const minutosIntervalo = 15;
    const aperturaPorDia = [9 * 60, 8 * 60, 8 * 60, 8 * 60, 8 * 60, 8 * 60, 9 * 60];
    const cierrePorDia = [18 * 60, 20 * 60, 20 * 60, 20 * 60, 20 * 60, 20 * 60, 20 * 60];
    let productosCatalogo = [];

    const money = n => Number(n).toFixed(2).replace('.', ',');
    const numeroProductos = () => cart.reduce((total, item) => total + Math.max(1, Number(item.quantity) || 1), 0);
    const esDomicilio = () => document.querySelector('input[name="tipoEntrega"]:checked')?.value === 'domicilio';
    const formatoHora = minutos => `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;

    function fechaLocal(date) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function parseFechaLocal(value) {
        const parts = value.split('-').map(Number);
        return new Date(parts[0], parts[1] - 1, parts[2]);
    }

    function fechaLegible(date) {
        return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
    }

    function perfilProducto(item) {
        const producto = productosCatalogo.find(p => p.id === item.id);
        const id = String(item.id || '').toLowerCase();
        const texto = `${item.title || ''} ${producto?.nombre || ''}`.toLowerCase();
        const categoria = producto?.categoria || '';
        const subcategoria = producto?.subcategoria || '';
        if (categoria === 'granos' || /granos|bolsa.*café|café.*bolsa/.test(texto)) return 1.5;
        if (/agua-fria|agua mineral|botella de agua/.test(id + ' ' + texto)) return 0.5;
        if (/frapp|batido|smoothie|zumo natural/.test(id + ' ' + texto)) return 4.5;
        if (/tostada|sandwich|sándwich|bocadillo|panini|bagel/.test(id + ' ' + texto)) return 6;
        if (categoria === 'comida' || /croissant|cruasán|tarta|brownie|bizcocho|galleta|napolitana/.test(texto)) return subcategoria === 'salado' ? 5 : 2;
        if (/solo|espresso|expresso|americano/.test(id + ' ' + texto)) return 2;
        if (/latte|capuchino|cappuccino|moca|macchiato|bombón|leche|chai|chocolate/.test(id + ' ' + texto)) return 3.5;
        return 3;
    }

    function estimarPreparacion() {
        const unidades = numeroProductos();
        const trabajo = cart.reduce((suma, item) => suma + perfilProducto(item) * Math.max(1, Number(item.quantity) || 1), 0);
        const minutos = Math.ceil((2 + trabajo * 0.85 + Math.max(0, unidades - 1) * 0.35) / 5) * 5;
        return Math.max(5, minutos);
    }

    function estimarTotal() {
        return estimarPreparacion() + (esDomicilio() ? 15 : 0);
    }

    function horarioDe(date) {
        const indice = date.getDay();
        return { apertura: aperturaPorDia[indice], cierre: cierrePorDia[indice] };
    }

    function actualizarLimites() {
        const hoy = new Date();
        const max = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + diasAntelacion);
        fechaPedido.min = fechaLocal(hoy);
        fechaPedido.max = fechaLocal(max);
    }

    function obtenerFechaProgramada() {
        if (!fechaPedido.value || !horaSelect.value) return null;
        const [h, m] = horaSelect.value.split(':').map(Number);
        const date = parseFechaLocal(fechaPedido.value);
        date.setHours(h, m, 0, 0);
        return date;
    }

    function obtenerHorasValidas() {
        if (!fechaPedido.value) return [];
        const fecha = parseFechaLocal(fechaPedido.value);
        const hoy = new Date();
        const minFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const maxFecha = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + diasAntelacion);
        if (fecha < minFecha || fecha > maxFecha) return [];
        const horario = horarioDe(fecha);
        const minimo = hoy.getTime() + (estimarTotal() + 5) * 60000;
        const opciones = [];
        for (let minutos = Math.ceil((horario.apertura + estimarTotal()) / minutosIntervalo) * minutosIntervalo; minutos <= horario.cierre - 15; minutos += minutosIntervalo) {
            const fechaHora = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), Math.floor(minutos / 60), minutos % 60);
            if (fechaHora.getTime() >= minimo) opciones.push(formatoHora(minutos));
        }
        return opciones;
    }

    function generarHoras() {
        const anterior = horaSelect.value;
        actualizarLimites();
        horaSelect.replaceChildren();
        horaSelect.disabled = true;
        const placeholder = document.createElement('option');
        placeholder.value = '';
        placeholder.textContent = fechaPedido.value ? 'Selecciona una hora' : 'Selecciona primero una fecha';
        horaSelect.appendChild(placeholder);
        if (!fechaPedido.value) {
            horaAyuda.textContent = 'Selecciona primero el día de tu pedido.';
            horarioDia.textContent = 'Selecciona una fecha';
            actualizarVistaHorario();
            return;
        }
        const fecha = parseFechaLocal(fechaPedido.value);
        const horario = horarioDe(fecha);
        horarioDia.textContent = `${formatoHora(horario.apertura)} – ${formatoHora(horario.cierre)}`;
        const horas = obtenerHorasValidas();
        horas.forEach(hora => {
            const opcion = document.createElement('option');
            opcion.value = hora;
            opcion.textContent = hora;
            horaSelect.appendChild(opcion);
        });
        horaSelect.disabled = horas.length === 0;
        if (horas.includes(anterior)) horaSelect.value = anterior;
        else horaSelect.value = '';
        placeholder.textContent = horas.length ? 'Selecciona una hora' : 'Sin horarios disponibles';
        horaAyuda.textContent = horas.length ? `${horas.length} franjas disponibles en intervalos de 15 minutos.` : 'No hay franjas disponibles para ese día con el tiempo necesario para preparar tu pedido. Elige otra fecha.';
        actualizarVistaHorario();
    }

    horaSelect.addEventListener('change', actualizarVistaHorario);

    function actualizarVistaHorario() {
        const programado = tipoProgramacion.value === 'programar';
        const duracion = estimarPreparacion();
        const adicional = esDomicilio() ? 15 : 0;
        tiempoPreparacion.textContent = `${duracion} min${adicional ? ` + ${adicional} min de reparto` : ''}`;
        detallePreparacion.textContent = `Estimación orientativa para ${numeroProductos()} ${numeroProductos() === 1 ? 'producto' : 'productos'}. Puede variar según la carga de trabajo de la cafetería.`;
        const date = obtenerFechaProgramada();
        const texto = programado
            ? date ? `Tu pedido está programado para el ${fechaLegible(date)} a las ${horaSelect.value}.` : 'Selecciona una fecha y una hora disponible.'
            : `Tu pedido estará listo aproximadamente en ${estimarTotal()} minutos${esDomicilio() ? ' para su entrega' : ' para recoger'}.`;
        resumenProgramacion.lastElementChild.textContent = texto;
        const envio = esDomicilio() ? 'Envío a domicilio' : 'Recogida en tienda';
        resumenEntrega.textContent = `${envio} · ${programado ? (date ? `${fechaLegible(date)} · ${horaSelect.value}` : 'Pendiente de elegir horario') : `Estimación: ${estimarTotal()} min`}`;
        dateChips.forEach(chip => {
            const target = new Date();
            target.setDate(target.getDate() + Number(chip.dataset.day));
            chip.classList.toggle('active', fechaPedido.value === fechaLocal(target));
        });
    }

    function cambiarProgramacion(value) {
        tipoProgramacion.value = value;
        horaProgramadaRow.hidden = value !== 'programar';
        fechaPedido.required = value === 'programar';
        document.querySelectorAll('.checkout-time-choice').forEach(c => c.classList.toggle('is-selected', c.querySelector('input').value === value));
        if (value === 'programar' && !fechaPedido.value) fechaPedido.value = fechaLocal(new Date());
        if (value === 'programar') generarHoras();
        actualizarVistaHorario();
    }

    actualizarLimites();
    scheduleRadios.forEach(r => r.addEventListener('change', () => cambiarProgramacion(r.value)));
    dateChips.forEach(chip => chip.addEventListener('click', () => {
        const target = new Date();
        target.setDate(target.getDate() + Number(chip.dataset.day));
        fechaPedido.value = fechaLocal(target);
        generarHoras();
    }));
    fechaPedido.addEventListener('change', generarHoras);
    radiosEntrega.forEach(radio => radio.addEventListener('change', (e) => {
        const domicilio = e.target.value === 'domicilio';
        direccionRow.style.display = domicilio ? 'block' : 'none';
        direccionInput.required = domicilio;
        renderSummary();
        generarHoras();
    }));
    cambiarProgramacion('ahora');

    fetch('/datos/productos.json').then(r => r.ok ? r.json() : Promise.reject()).then(data => {
        productosCatalogo = Array.isArray(data.productos) ? data.productos : [];
        generarHoras();
    }).catch(() => {});

    setInterval(() => {
        if (tipoProgramacion.value === 'programar') generarHoras();
    }, 60000);

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
            itemEl.style.justifyContent = 'space-between';
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
            supEl.style.justifyContent = 'space-between';
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
                    <span>Envío a domicilio (desde 20 €)</span>
                    <strong>Gratis</strong>
                `;
            }
            summaryContainer.appendChild(supEl);
        }

        const totalFinal = subtotalProductos + getSuplementoDomicilio();
        totalElement.textContent = totalFinal.toFixed(2).replace('.', ',') + ' €';
    }

    renderSummary();

    function showNotification(message, isError = false) {
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
            <h3 style="margin-bottom: 10px; font-size: 22px; font-weight: 700;">${isError ? 'Atención' : '¡Pedido Exitoso!'}</h3>
            <p style="font-size: 15px; color: var(--color-primary); opacity: 0.85; margin-bottom: 20px;">${message}</p>
            <div style="font-size: 13px; font-weight: 600; color: var(--color-accent);">${isError ? 'Redirigiendo al menú...' : 'Redirigiendo a tus compras...'}</div>
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
            if (!cart || cart.length === 0) {
                showNotification('Tu carrito está vacío.', true);
                setTimeout(() => {
                    window.location.href = 'menu.html';
                }, 1500);
                return;
            }

            const tipoEntrega = document.querySelector('input[name="tipoEntrega"]:checked').value;
            let horaElegida = `Lo antes posible (aprox. ${estimarTotal()} min)`;
            let fechaProgramada = null;
            let fechaHoraProgramada = null;

            if (tipoProgramacion.value === 'programar') {
                actualizarLimites();
                generarHoras();
                const seleccion = obtenerFechaProgramada();
                if (!seleccion || !obtenerHorasValidas().includes(horaSelect.value) ||
                    fechaPedido.value < fechaPedido.min || fechaPedido.value > fechaPedido.max) {
                    horaAyuda.textContent = 'Selecciona una fecha y una hora futuras válidas antes de confirmar.';
                    fechaPedido.focus();
                    return;
                }
                fechaProgramada = fechaPedido.value;
                fechaHoraProgramada = `${fechaPedido.value}T${horaSelect.value}:00`;
                horaElegida = `${fechaLegible(seleccion)} a las ${horaSelect.value}`;
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
                fechaProgramada,
                fechaHoraProgramada,
                tiempoPreparacionEstimado: estimarPreparacion(),
                tiempoRepartoEstimado: esDomicilio() ? 15 : 0,
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
            sessionStorage.removeItem('hugoffee_cart_guest');

            showNotification('Tu pedido se ha guardado en el historial. ¡Gracias por elegir Hugoffee!');
            setTimeout(() => {
                window.location.href = 'compras.html';
            }, 1800);
        });
    }
});