document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('lista-resumen');
    const subtotalDisplay = document.getElementById('subtotal-precio');
    const shippingDisplays = Array.from(document.querySelectorAll('.shipping-cost-display, #shipping-cost'));
    const totalDisplay = document.getElementById('total-precio');
    const pagarBtn = document.getElementById('btn-pagar');
    const envioRadios = Array.from(document.querySelectorAll('input[name="envio"]'));

    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');

    // Valida los campos obligatorios del formulario de checkout (email, nombre,
    // dirección, ciudad, código postal) y marca visualmente los campos inválidos.
    // Devuelve true si todo el formulario es válido, false en caso contrario.
    const validarFormulario = () => {
        const campos = ['email', 'nombre', 'direccion', 'ciudad', 'postal'];
        let valido = true;

        campos.forEach(id => {
            const input = document.getElementById(id);
            const label = input?.closest('label');
            const errorText = label?.querySelector('.campo-error');

            if (!input?.value?.trim()) {
                input.style.borderColor = '#d9534f';
                if (!errorText) {
                    const mensaje = document.createElement('small');
                    mensaje.className = 'campo-error';
                    mensaje.textContent = 'Este campo es obligatorio.';
                    label.appendChild(mensaje);
                } else {
                    errorText.textContent = 'Este campo es obligatorio.';
                }
                valido = false;
            } else {
                input.style.borderColor = '#d8d8d8';
                if (errorText) {
                    errorText.remove();
                }
            }
        });

        const emailInput = document.getElementById('email');
        const email = emailInput?.value?.trim() || '';
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        if (email && !emailValido) {
            emailInput.style.borderColor = '#d9534f';
            const label = emailInput.closest('label');
            const errorText = label?.querySelector('.campo-error');
            if (!errorText) {
                const mensaje = document.createElement('small');
                mensaje.className = 'campo-error';
                mensaje.textContent = 'Ingresa un correo electrónico válido.';
                label.appendChild(mensaje);
            } else {
                errorText.textContent = 'Ingresa un correo electrónico válido.';
            }
            valido = false;
        }

        return valido;
    };

    if (!carrito.length) {
        lista.innerHTML = '<div class="resumen-item"><div><h3>No hay productos</h3><p class="resumen-meta">Tu carrito está vacío.</p></div></div>';
        subtotalDisplay.textContent = '0.00';
        totalDisplay.textContent = '0.00';
        return;
    }

    let subtotal = 0;

    carrito.forEach(prod => {
        const precioUnitario = Number(prod.price || 0);
        const cantidad = Number(prod.quantity || 1);
        const totalProducto = precioUnitario * cantidad;
        subtotal += totalProducto;

        const item = document.createElement('div');
        item.className = 'resumen-item';
        const imagenHtml = prod.image
            ? `<img class="resumen-imagen" src="${prod.image}" alt="${prod.name || 'Producto'}">`
            : '<div class="resumen-imagen placeholder">IMG</div>';

        item.innerHTML = `
            <div class="resumen-producto">
                ${imagenHtml}
                <div>
                    <h3>${prod.name || 'Producto'}</h3>
                    <p class="resumen-meta">Talla: ${prod.size || 'Única'} · Cantidad: ${cantidad}</p>
                </div>
            </div>
            <div class="resumen-price">S/ ${totalProducto.toFixed(2)}</div>
            <div class="resumen-meta">${prod.description || 'Prenda seleccionada de la tienda WUOLUX.'}</div>`;
        lista.appendChild(item);
    });

    // Recalcula y actualiza en pantalla el costo de envío, el subtotal y el
    // total de la compra en base a la opción de envío seleccionada.
    const updateTotals = () => {
        const shippingCost = Number(document.querySelector('input[name="envio"]:checked')?.value || 0);
        shippingDisplays.forEach(display => display.textContent = shippingCost.toFixed(2));
        if (subtotalDisplay) subtotalDisplay.textContent = subtotal.toFixed(2);
        if (totalDisplay) totalDisplay.textContent = (subtotal + shippingCost).toFixed(2);
    };

    // Muestra un modal de confirmación de compra exitosa. Si el modal ya
    // existe en el DOM, evita crear uno duplicado.
    const mostrarModalExito = () => {
        if (document.getElementById('compra-modal-overlay')) {
            return;
        }

        const overlay = document.createElement('div');
        overlay.id = 'compra-modal-overlay';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-title">
                <h2 id="modal-title">Muchas gracias por su compra</h2>
                <p>Tu pedido fue registrado correctamente. Gracias por elegir WUOLUX.</p>
                <button class="modal-btn" id="modal-aceptar-btn">Aceptar</button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('modal-aceptar-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    };

    envioRadios.forEach(radio => {
        radio.addEventListener('change', updateTotals);
    });

    updateTotals();

    if (pagarBtn) {
        pagarBtn.addEventListener('click', async () => {

            if (!validarFormulario()) {
                return;
            }

            // Se incluye size para que el servidor registre la talla.
            const items = carrito.map(prod => ({
                id: prod.id,
                cantidad: Number(prod.quantity || 1),
                size: prod.size || null
            }));

            if (items.some(item => !item.id)) {
                alert('Uno o más productos no tienen un código válido.');
                return;
            }

            pagarBtn.disabled = true;
            pagarBtn.textContent = 'Registrando pedido...';

            try {
                const respuesta = await fetch('/api/pedidos', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ items: items })
                });

                const resultado = await respuesta.json();

                if (!respuesta.ok) {
                    throw new Error(resultado.mensaje || 'No se pudo registrar el pedido.');
                }

                console.log('Pedido registrado:', resultado);

                localStorage.removeItem('carrito');

                pagarBtn.textContent = 'Compra completada';

                mostrarModalExito();

            } catch (error) {
                console.error('Error al registrar el pedido:', error);

                alert(error.message);

                pagarBtn.disabled = false;
                pagarBtn.textContent = 'Finalizar compra';
            }
        });
    }
});