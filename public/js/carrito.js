document.addEventListener('DOMContentLoaded', () => {
    const cartTable = document.querySelector('.cart-table');
    const cartTitle = document.querySelector('.cart-title');
    const checkoutBtn = document.getElementById('btn-checkout');

    // Obtiene el carrito guardado en localStorage (o un arreglo vacío si no existe).
    function getCart() {
        return JSON.parse(localStorage.getItem('carrito') || '[]');
    }

    // Guarda el carrito recibido en localStorage.
    function saveCart(cart) {
        localStorage.setItem('carrito', JSON.stringify(cart));
    }

    // Da formato de moneda (soles) a un precio numérico.
    function formatPrice(price) {
        return `S/ ${Number(price || 0).toFixed(2)}`;
    }

    // Renderiza todos los ítems del carrito en la tabla, o un mensaje de
    // carrito vacío si no hay productos. También conecta los botones de
    // cantidad (+/-) y de remover de cada ítem.
    function renderCart() {
        if (!cartTable) return;

        const cart = getCart();

        if (!cart.length) {
            cartTable.innerHTML = '<div class="cart-empty">Tu carrito está vacío. <a href="tienda.html">Volver a la tienda</a></div>';
            if (cartTitle) {
                cartTitle.textContent = 'Tu carrito está vacío';
            }
            if (checkoutBtn) {
                checkoutBtn.disabled = true;
                checkoutBtn.style.opacity = '0.6';
            }
            return;
        }

        if (cartTitle) {
            cartTitle.textContent = 'Mi carrito de compras';
        }

        if (checkoutBtn) {
            checkoutBtn.disabled = false;
            checkoutBtn.style.opacity = '1';
        }

        cartTable.innerHTML = '';

        cart.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'cart-item';
            row.innerHTML = `
                <div class="product-info-block">
                    <div class="product-image-placeholder">${item.image ? `<img src="${item.image}" alt="${item.name}">` : ''}</div>
                    <div class="product-details">
                        <h2 class="product-name">${item.name}</h2>
                        <p class="product-meta">Talla: ${item.size || 'Única'}</p>
                        <span class="product-price-tag">${formatPrice(item.price)}</span>
                    </div>
                </div>
                <div class="product-controls-block">
                    <div class="quantity-control-wrapper">
                        <span class="quantity-label">Cantidad:</span>
                        <div class="quantity-selector">
                            <button class="qty-btn" data-action="decrease" data-index="${index}">-</button>
                            <span class="qty-number">${item.quantity || 1}</span>
                            <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
                        </div>
                    </div>
                    <div class="remove-action-wrapper">
                        <button class="remove-btn" data-index="${index}">Remover</button>
                    </div>
                </div>
            `;
            cartTable.appendChild(row);
        });

        // Al hacer clic en +/- de un ítem, actualiza su cantidad, guarda el
        // carrito y vuelve a renderizar la tabla.
        cartTable.querySelectorAll('.qty-btn').forEach(button => {
            button.addEventListener('click', () => {
                const cartItems = getCart();
                const itemIndex = Number(button.dataset.index);
                const currentItem = cartItems[itemIndex];
                if (!currentItem) return;

                if (button.dataset.action === 'increase') {
                    currentItem.quantity = (currentItem.quantity || 1) + 1;
                } else if (button.dataset.action === 'decrease' && (currentItem.quantity || 1) > 1) {
                    currentItem.quantity = (currentItem.quantity || 1) - 1;
                }

                saveCart(cartItems);
                renderCart();
            });
        });

        // Al hacer clic en "Remover", elimina el ítem del carrito, guarda
        // los cambios y vuelve a renderizar la tabla.
        cartTable.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', () => {
                const cartItems = getCart();
                const itemIndex = Number(button.dataset.index);
                cartItems.splice(itemIndex, 1);
                saveCart(cartItems);
                renderCart();
            });
        });
    }

    renderCart();

    // ---------- Buscador de productos (mismo catálogo que index) ----------
    const searchInput = document.getElementById('home-search');
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
    // Al buscar, si encontramos el producto en el catálogo, vamos directo
    // a su página de detalle (igual que el botón "Comprar").
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