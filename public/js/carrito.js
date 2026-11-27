document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // LÓGICA DE LA TABLA DEL CARRITO
    // ==========================================
    const cartTable = document.querySelector('.cart-table');
    const cartTitle = document.querySelector('.cart-title');
    const checkoutBtn = document.getElementById('btn-checkout');
    const cartBody = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    function getCart() {
        return JSON.parse(localStorage.getItem('carrito') || '[]');
    }

    function saveCart(cart) {
        localStorage.setItem('carrito', JSON.stringify(cart));
    }

    function formatPrice(price) {
        return `S/ ${Number(price || 0).toFixed(2)}`;
    }

    function renderCart() {
        if (!cartBody) return;

        const cart = getCart();

        if (!cart.length) {
            cartBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        Tu carrito está vacío.
                        <a href="tienda.html">Volver a la tienda</a>
                    </td>
                </tr>
            `;
            if (cartTitle) cartTitle.textContent = 'Tu carrito está vacío';
            if (cartTotal) cartTotal.textContent = 'Total: S/ 0.00';
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        if (cartTitle) cartTitle.textContent = 'Mi carrito de compras';
        if (checkoutBtn) checkoutBtn.disabled = false;

        let total = 0;
        let filas = '';

        cart.forEach((item, index) => {
            const cantidad = Number(item.quantity || 1);
            const precio = Number(item.price || 0);
            const subtotal = cantidad * precio;
            total += subtotal;

            filas += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${item.id || 'Sin ID'}</td>
                    <td>${item.name}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-dark qty-btn" data-action="decrease" data-index="${index}">-</button>
                        <span class="mx-2">${cantidad}</span>
                        <button class="btn btn-sm btn-outline-dark qty-btn" data-action="increase" data-index="${index}">+</button>
                    </td>
                    <td>${formatPrice(precio)}</td>
                    <td>${formatPrice(subtotal)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger remove-btn" data-index="${index}">Remover</button>
                    </td>
                </tr>
            `;
        });

        cartBody.innerHTML = filas;
        if (cartTotal) cartTotal.textContent = `TOTAL: ${formatPrice(total)}`;

        // Botones + / -
        cartBody.querySelectorAll('.qty-btn').forEach(button => {
            button.addEventListener('click', () => {
                const cartItems = getCart();
                const index = Number(button.dataset.index);
                const item = cartItems[index];
                if (!item) return;

                if (button.dataset.action === 'increase') {
                    item.quantity = Number(item.quantity || 1) + 1;
                } else if (button.dataset.action === 'decrease' && Number(item.quantity) > 1) {
                    item.quantity = Number(item.quantity) - 1;
                }

                saveCart(cartItems);
                renderCart();
            });
        });

        // Botones Remover
        cartBody.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', () => {
                const cartItems = getCart();
                const index = Number(button.dataset.index);
                cartItems.splice(index, 1);
                saveCart(cartItems);
                renderCart();
            });
        });
    }

    renderCart();

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
            if (getCart().length === 0) {
                e.preventDefault();
                return;
            }
            window.location.href = 'resumen.html';
        });
    }

    // ==========================================
    // FORMULARIO PARA AÑADIR PRODUCTOS DESDE LA API
    // ==========================================
    const selectProducto = document.getElementById('select-producto');
    const descripcionProducto = document.getElementById('descripcion-producto');
    const precioProducto = document.getElementById('precio-producto');
    const cantidadProducto = document.getElementById('cantidad-producto');
    const mensajeCompra = document.getElementById('mensaje-compra');
    const btnAgregar = document.getElementById('btn-agregar-producto');
    const btnLimpiar = document.getElementById('btn-limpiar-form');

    let productosAPI = [];

    // 1. Cargar productos desde el servidor
    async function cargarProductos() {
        if (!selectProducto) return;

        try {
            const respuesta = await fetch('/api/productos');
            productosAPI = await respuesta.json();

            selectProducto.innerHTML = '<option value="">Selecciona un producto</option>';

            productosAPI.forEach(producto => {
                const opcion = document.createElement('option');
                opcion.value = producto.id;
                // El servidor devuelve "descripcion"
                opcion.textContent = `${producto.id} - ${producto.descripcion}`;
                selectProducto.appendChild(opcion);
            });
        } catch (error) {
            console.error('Error al cargar productos:', error);
            selectProducto.innerHTML = '<option value="">Error al cargar productos</option>';
        }
    }

    // 2. Cuando se selecciona un producto, mostrar su info
    if (selectProducto) {
        selectProducto.addEventListener('change', () => {
            // El servidor devuelve "descripcion" y "precio"
            const productoSeleccionado = productosAPI.find(p => p.id === selectProducto.value);

            if (productoSeleccionado) {
                descripcionProducto.value = productoSeleccionado.descripcion;
                precioProducto.value = `S/ ${productoSeleccionado.precio.toFixed(2)}`;
            } else {
                descripcionProducto.value = '';
                precioProducto.value = '';
            }
        });
    }

    // 3. Botón limpiar
    if (btnLimpiar) {
        btnLimpiar.addEventListener('click', () => {
            selectProducto.value = '';
            descripcionProducto.value = '';
            precioProducto.value = '';
            if (cantidadProducto) cantidadProducto.value = 1;
            if (mensajeCompra) mensajeCompra.textContent = '';
        });
    }

    // 4. Botón añadir al carrito
    if (btnAgregar) {
        btnAgregar.addEventListener('click', () => {
            const id = selectProducto.value;
            const producto = productosAPI.find(p => p.id === id);
            const cantidad = Number(cantidadProducto?.value);

            if (!producto) {
                mensajeCompra.textContent = 'Selecciona un producto.';
                mensajeCompra.className = 'mt-3 text-danger';
                return;
            }

            if (!Number.isInteger(cantidad) || cantidad <= 0) {
                mensajeCompra.textContent = 'Ingresa una cantidad válida.';
                mensajeCompra.className = 'mt-3 text-danger';
                return;
            }

            const cart = getCart();
            // Comprobamos si ya existe por ID (sin talla porque aquí no se elige)
            const existente = cart.find(item => item.id === producto.id && !item.size);

            if (existente) {
                existente.quantity = Number(existente.quantity || 1) + cantidad;
            } else {
                cart.push({
                    id: producto.id,
                    name: producto.descripcion,
                    price: producto.precio,
                    quantity: cantidad
                    // Nota: aquí no se guarda talla porque el formulario rápido no la pide
                });
            }

            saveCart(cart);
            renderCart();

            mensajeCompra.textContent = '¡Producto añadido correctamente!';
            mensajeCompra.className = 'mt-3 text-success';
            
            // Limpiamos el formulario tras añadir
            selectProducto.value = '';
            descripcionProducto.value = '';
            precioProducto.value = '';
            cantidadProducto.value = 1;
        });
    }

    // Iniciar la carga de productos al abrir la página
    cargarProductos();
});