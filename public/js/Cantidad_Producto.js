document.addEventListener('DOMContentLoaded', () => {
    const qtyValue = document.getElementById('qty-value');
    const btnDecrease = document.getElementById('btn-decrease');
    const btnIncrease = document.getElementById('btn-increase');
    const addToCartBtn = document.querySelector('.add-to-cart-btn');
    const productTitle = document.querySelector('.product-title');
    const productSubtitle = document.querySelector('.product-subtitle');
    const productDescription = document.querySelector('.product-description-box');
    const productPrice = document.querySelector('.product-price');
    const productImagePlaceholder = document.querySelector('.product-image-placeholder');

    let cantidad = 1;

    // Refleja en pantalla el valor actual de la cantidad seleccionada.
    const updateQty = () => {
        if (qtyValue) {
            qtyValue.textContent = cantidad;
        }
    };

    if (btnDecrease) {
        // Disminuye la cantidad (mínimo 1) al hacer clic en el botón "-".
        btnDecrease.addEventListener('click', () => {
            if (cantidad > 1) {
                cantidad--;
                updateQty();
            }
        });
    }

    if (btnIncrease) {
        // Aumenta la cantidad al hacer clic en el botón "+".
        btnIncrease.addEventListener('click', () => {
            cantidad++;
            updateQty();
        });
    }

    const selectedProduct = JSON.parse(localStorage.getItem('selectedProduct') || 'null');

    if (selectedProduct && productTitle && productSubtitle && productDescription && productPrice) {
        productTitle.textContent = selectedProduct.name || 'Producto';
        productSubtitle.textContent = (selectedProduct.category || 'producto').toUpperCase();
        productDescription.textContent = selectedProduct.description || 'Producto destacado para tu compra.';
        productPrice.textContent = `S/ ${Number(selectedProduct.price || 0).toFixed(2)}`;

        if (productImagePlaceholder) {
            productImagePlaceholder.innerHTML = '';
            if (selectedProduct.image) {
                const image = document.createElement('img');
                image.src = selectedProduct.image;
                image.alt = selectedProduct.name;
                image.style.width = '100%';
                image.style.height = '100%';
                image.style.objectFit = 'cover';
                productImagePlaceholder.appendChild(image);
            } else {
                productImagePlaceholder.textContent = 'Imagen';
            }
        }
    }

    
    if (addToCartBtn) {

        addToCartBtn.addEventListener('click', () => {

            const selectedSizeInput = document.querySelector('input[name="talla"]:checked');

            const selectedSize = selectedSizeInput
                ? selectedSizeInput.nextElementSibling?.textContent.trim()
                : 'Única';

            const product = selectedProduct || {
                name: productTitle?.textContent || 'Producto',
                price: parseFloat((productPrice?.textContent || '0').replace(/[^\d.]/g, '')) || 0,
                image: '',
                description: productDescription?.textContent || ''
            };

            // Buscar el producto en nuestro catálogo
            const productoCatalogo = productCatalog.find(p =>
                p.name.toLowerCase() === product.name.toLowerCase()
            );

            // Obtener el ID del producto
            const productId = product.id || productoCatalogo?.id;

            // Comprobar que el producto tenga ID
            if (!productId) {
                alert('No se encontró el código del producto.');
                return;
            }

            // Obtener el carrito actual
            const cart = JSON.parse(localStorage.getItem('carrito') || '[]');

            // Crear el nuevo producto
            const newItem = {
                ...product,
                id: productId,
                size: selectedSize,
                quantity: cantidad,
                price: Number(productoCatalogo ? productoCatalogo.price : product.price)
            };

            // Comprobar si ya existe en el carrito
            const existingItem = cart.find(item =>
                item.id === newItem.id && item.size === newItem.size
            );

            if (existingItem) {
                existingItem.quantity += newItem.quantity;
            } else {
                cart.push(newItem);
            }

            // Guardar el carrito
            localStorage.setItem('carrito', JSON.stringify(cart));

            // Ir al carrito
            window.location.href = 'Carrito.html';
        });
    }

    const searchInput = document.getElementById('home-search');
    const suggestionsBox = document.getElementById('home-search-suggestions');


    const productCatalog = [
        { id: "P001", name: 'Polo Haver', img: 'img/polo1.png', price: 39.99, category: 'polo' },
        { id: "P002", name: 'Polo Mayoral', img: 'img/polo2.png', price: 29.99, category: 'polo' },
        { id: "P003", name: 'Chompa casual', img: 'img/compa1.jpeg', price: 39.99, category: 'chompa' },
        { id: "P004", name: 'Polo Puma', img: 'img/polo3.png', price: 29.99, category: 'polo' },
        { id: "P005", name: 'Casaca premium', img: 'img/casaca1.jpeg', price: 49.99, category: 'casacas' },
        { id: "P006", name: 'Pantalón clásico', img: 'img/pantalon1.png', price: 44.99, category: 'pantalones' },
        { id: "P007", name: 'Chompa urbana', img: 'img/chompa2.jpeg', price: 39.99, category: 'chompa' },
        { id: "P008", name: 'Polo Cars', img: 'img/polo4.png', price: 29.99, category: 'polo' },
        { id: "P009", name: 'Casaca casual', img: 'img/casaca2.jpeg', price: 24.99, category: 'casacas' },
        { id: "P010", name: 'Pantalón sport', img: 'img/pantalon2.png', price: 54.99, category: 'pantalones' },
        { id: "P011", name: 'Polo astral', img: 'img/polo5.jpg', price: 24.99, category: 'polo' },
        { id: "P012", name: 'Chompa elegante', img: 'img/chompa3.jpeg', price: 44.99, category: 'chompa' },
        { id: "P013", name: 'Casaca invierno', img: 'img/casaca4.jpeg', price: 54.99, category: 'casacas' },
        { id: "P014", name: 'Polo Mickey Mouse', img: 'img/polo6.png', price: 29.99, category: 'polo' },
        { id: "P015", name: 'Pantalón casual', img: 'img/pantalon3.jpeg', price: 57.99, category: 'pantalones' },
        { id: "P016", name: 'Chompa premium', img: 'img/chompa4.jpeg', price: 49.99, category: 'chompa' }
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
    // página de detalle.
    function searchProducts(query) {
        const value = query.trim();
        if (!value) return;

        const product = productCatalog.find(p => p.name.toLowerCase() === value.toLowerCase())
            || productCatalog.find(p => p.name.toLowerCase().includes(value.toLowerCase()));

        if (!product) return;

        const newSelectedProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.img,
            category: product.category || 'general',
            description: `Prenda seleccionada: ${product.name}. Ideal para complementar tu estilo.`
        };

        localStorage.setItem('selectedProduct', JSON.stringify(newSelectedProduct));
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