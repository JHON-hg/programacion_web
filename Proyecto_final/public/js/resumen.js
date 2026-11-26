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
            <div class="resumen-meta">${prod.description || ''}</div>
        `;
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

        // Redirige al usuario al inicio al aceptar el modal de compra exitosa.
        document.getElementById('modal-aceptar-btn').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    };

    // Al cambiar la opción de envío elegida, recalcula los totales.
    envioRadios.forEach(radio => {
        radio.addEventListener('change', updateTotals);
    });

    updateTotals();

    if (pagarBtn) {
        // Al hacer clic en "Pagar": valida el formulario, vacía el carrito
        // guardado y muestra el modal de confirmación si todo es correcto.
        pagarBtn.addEventListener('click', () => {
            if (!validarFormulario()) {
                return;
            }

            localStorage.removeItem('carrito');
            pagarBtn.textContent = 'Compra completada';
            pagarBtn.disabled = true;
            mostrarModalExito();
        });
    }

    // ---------- Buscador de productos (mismo catálogo que index) ----------
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('home-search-suggestions');

    const productCatalog = [
        { name: 'Polo Haver', img: 'img/polo1.png', price: 39.99, category: 'polo' },
        { name: 'Polo Mayoral', img: 'img/polo2.png', price: 29.99, category: 'polo' },
        { name: 'Chompa casual', img: 'img/compa1.jpeg', price: 39.99, category: 'chompa' },
        { name: 'Polo Puma', img: 'img/polo3.png', price: 29.99, category: 'polo' },
        { name: 'Casaca premium', img: 'img/casaca1.jpeg', price: 49.99, category: 'casacas' },
        { name: 'Pantalon clásico', img: 'img/pantalon1.png', price: 44.99, category: 'pantalones' },
        { name: 'Chompa urbana', img: 'img/chompa2.jpeg', price: 39.99, category: 'chompa' },
        { name: 'Polo Cars', img: 'img/polo4.png', price: 29.99, category: 'polo' },
        { name: 'Casaca casual', img: 'img/casaca2.jpeg', price: 24.99, category: 'casacas' },
        { name: 'Pantalón sport', img: 'img/pantalon2.png', price: 54.99, category: 'pantalones' },
        { name: 'Polo astral', img: 'img/polo5.jpg', price: 24.99, category: 'polo' },
        { name: 'Chompa elegante', img: 'img/chompa3.jpeg', price: 44.99, category: 'chompa' },
        { name: 'Casaca invierno', img: 'img/casaca4.jpeg', price: 54.99, category: 'casacas' },
        { name: 'Polo Mickey Mouse', img: 'img/polo6.png', price: 29.99, category: 'polo' },
        { name: 'Pantalón casual', img: 'img/pantalon3.jpeg', price: 44.99, category: 'pantalones' },
        { name: 'Chompa premium', img: 'img/chompa4.jpeg', price: 49.99, category: 'chompa' }
    ];

    // Filtra el catálogo según el texto ingresado y muestra hasta 6
    // sugerencias en el cuadro desplegable de búsqueda.
    function showSuggestions(query) {
        if (!suggestionsBox) return;

        const q = query.trim().toLowerCase();
        if (!q) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
            return;
        }

        const matches = productCatalog.filter(item => item.name.toLowerCase().includes(q)).slice(0, 6);
        if (!matches.length) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
            return;
        }

        suggestionsBox.innerHTML = matches.map(item => `
            <div class="suggestion-item" role="option" data-name="${item.name}">
                <img src="${item.img}" alt="${item.name}" class="suggestion-thumb">
                <span class="suggestion-name">${item.name}</span>
            </div>
        `).join('');
        suggestionsBox.style.display = 'block';

        // Al hacer clic en una sugerencia, se busca ese producto.
        suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => searchProducts(item.dataset.name));
        });
    }

    // Busca un producto por nombre exacto o parcial dentro del catálogo y,
    // si lo encuentra, lo guarda como producto seleccionado y redirige a la
    // página de detalle (igual que el botón "Comprar").
    function searchProducts(query) {
        const value = query.trim();
        if (!value) return;

        const product = productCatalog.find(p => p.name.toLowerCase() === value.toLowerCase())
            || productCatalog.find(p => p.name.toLowerCase().includes(value.toLowerCase()));

        if (!product) return;

        const selectedProduct = {
            name: product.name,
            price: product.price,
            image: product.img,
            category: product.category || 'general',
            description: `Prenda seleccionada: ${product.name}. Ideal para complementar tu estilo.`
        };

        localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
        window.location.href = 'Productos.html';
    }

    if (searchInput) {
        // Muestra sugerencias mientras el usuario escribe en el buscador.
        searchInput.addEventListener('input', (e) => {
            showSuggestions(e.target.value);
        });

        // Maneja las teclas Enter (buscar) y Escape (cerrar sugerencias).
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchProducts(searchInput.value);
            } else if (e.key === 'Escape') {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
            }
        });
    }

    // Cierra el cuadro de sugerencias al hacer clic fuera del buscador.
    document.addEventListener('click', (e) => {
        if (suggestionsBox && !e.target.closest('.search-wrapper')) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }
    });
});