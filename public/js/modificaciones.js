document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.styles-carousel');
    const botonDerecha = document.querySelector('.arrow-right');
    const productCards = Array.from(document.querySelectorAll('.shop-grid .product-card'));

    const searchInput = document.getElementById('home-search');
    const suggestionsBox = document.getElementById('home-search-suggestions');
    const featuredContainer = document.getElementById('featured-products');

    // Catálogo local con IDs alineados al servidor.
    const productCatalog = [
        { id: 'P001', name: 'Polo Haver', img: 'img/polo1.png', price: 39.99, category: 'polo' },
        { id: 'P002', name: 'Polo Mayoral', img: 'img/polo2.png', price: 29.99, category: 'polo' },
        { id: 'P003', name: 'Chompa casual', img: 'img/compa1.jpeg', price: 39.99, category: 'chompa' },
        { id: 'P004', name: 'Polo Puma', img: 'img/polo3.png', price: 29.99, category: 'polo' },
        { id: 'P005', name: 'Casaca premium', img: 'img/casaca1.jpeg', price: 49.99, category: 'casacas' },
        { id: 'P006', name: 'Pantalón clásico', img: 'img/pantalon1.png', price: 44.99, category: 'pantalones' },
        { id: 'P007', name: 'Chompa urbana', img: 'img/chompa2.jpeg', price: 39.99, category: 'chompa' },
        { id: 'P008', name: 'Polo Cars', img: 'img/polo4.png', price: 29.99, category: 'polo' },
        { id: 'P009', name: 'Casaca casual', img: 'img/casaca2.jpeg', price: 24.99, category: 'casacas' },
        { id: 'P010', name: 'Pantalón sport', img: 'img/pantalon2.png', price: 54.99, category: 'pantalones' },
        { id: 'P011', name: 'Polo astral', img: 'img/polo5.jpg', price: 24.99, category: 'polo' },
        { id: 'P012', name: 'Chompa elegante', img: 'img/chompa3.jpeg', price: 44.99, category: 'chompa' },
        { id: 'P013', name: 'Casaca invierno', img: 'img/casaca4.jpeg', price: 54.99, category: 'casacas' },
        { id: 'P014', name: 'Polo Mickey Mouse', img: 'img/polo6.png', price: 29.99, category: 'polo' },
        { id: 'P015', name: 'Pantalón casual', img: 'img/pantalon3.jpeg', price: 57.99, category: 'pantalones' },
        { id: 'P016', name: 'Chompa premium', img: 'img/chompa4.jpeg', price: 49.99, category: 'chompa' }
    ];

    // Resuelve el id de un producto a partir de su nombre.
    function getIdByName(name) {
        const found = productCatalog.find(p => p.name === name);
        return found ? found.id : '';
    }

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

        suggestionsBox.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => searchProducts(item.dataset.name));
        });
    }

    // Busca un producto por nombre en el catálogo y guarda el objeto
    // seleccionado (con id, precio, imagen, categoría) en localStorage.
    function searchProducts(query) {
        const value = query.trim();
        if (!value) return;

        const product = productCatalog.find(p => p.name.toLowerCase() === value.toLowerCase())
            || productCatalog.find(p => p.name.toLowerCase().includes(value.toLowerCase()));

        if (!product) return;

        const selectedProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.img,
            category: product.category || 'general',
            description: `Prenda seleccionada: ${product.name}. Ideal para complementar tu estilo.`
        };

        localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
        window.location.href = 'Productos.html';
    }

    // Devuelve una cantidad aleatoria ('count') de productos, tomándolos de
    // las tarjetas ya presentes en la página si existen, o del catálogo
    // interno como respaldo. Incluye id en todos los casos.
    function getRandomProducts(count) {
        if (productCards.length) {
            const shuffled = [...productCards].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count).map(card => {
                const title = (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || 'Producto';
                const priceText = (card.querySelector('.price') && card.querySelector('.price').textContent.trim()) || '0';
                const imgEl = card.querySelector('img.prod-img');
                const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;
                return {
                    id: getIdByName(title),
                    title,
                    price,
                    image: imgEl ? imgEl.getAttribute('src') : '',
                    category: card.dataset.category || 'general'
                };
            });
        }

        const shuffled = [...productCatalog].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count).map(product => ({
            id: product.id,
            title: product.name,
            price: product.price,
            image: product.img,
            category: product.category || 'general'
        }));
    }

    // Guarda el producto del botón "Comprar" clickeado como producto
    // seleccionado (incluyendo su id) y redirige a la página de detalle.
    function buyProduct(button) {
        const selectedProduct = {
            id: button.dataset.id || '',
            name: button.dataset.title,
            price: Number(button.dataset.price),
            image: button.dataset.image,
            category: button.dataset.category || 'general',
            description: `Prenda seleccionada: ${button.dataset.title}. Ideal para complementar tu estilo.`
        };

        localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
        window.location.href = 'Productos.html';
    }

    // Genera y pinta las tarjetas del carrusel de estilos con productos
    // aleatorios, y conecta cada botón "Comprar" con buyProduct.
    function renderCarouselProducts() {
        if (!carousel) return;

        const products = getRandomProducts(5);
        carousel.innerHTML = products.map(product => `
            <div class="style-card">
                <img src="${product.image}" alt="${product.title}" class="prod-img">
                <p>S/ ${product.price.toFixed(2)}</p>
                <h3>${product.title}</h3>
                <button class="style-btn"
                    data-id="${product.id}"
                    data-title="${product.title}"
                    data-price="${product.price}"
                    data-image="${product.image}"
                    data-category="${product.category}">Comprar</button>
            </div>
        `).join('');

        carousel.querySelectorAll('.style-btn').forEach(button => {
            button.addEventListener('click', () => buyProduct(button));
        });
    }

    // Genera y pinta las tarjetas de la sección de productos destacados con
    // productos aleatorios, y conecta cada botón "Comprar" con buyProduct.
    function renderFeaturedProducts() {
        if (!featuredContainer) return;

        const products = getRandomProducts(3);
        featuredContainer.innerHTML = products.map(product => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.title}" class="prod-img">
                <h3>${product.title}</h3>
                <p class="price">S/ ${product.price.toFixed(2)}</p>
                <button class="buy-btn"
                    data-id="${product.id}"
                    data-title="${product.title}"
                    data-price="${product.price}"
                    data-image="${product.image}"
                    data-category="${product.category}">Comprar</button>
            </div>
        `).join('');

        featuredContainer.querySelectorAll('.buy-btn').forEach(button => {
            button.addEventListener('click', () => buyProduct(button));
        });
    }

    renderCarouselProducts();
    renderFeaturedProducts();

    if (carousel && botonDerecha) {
        const scrollAmount = 232;

        botonDerecha.addEventListener('click', () => {
            const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

            if (carousel.scrollLeft + scrollAmount >= maxScrollLeft) {
                carousel.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            showSuggestions(e.target.value);
        });

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

    document.addEventListener('click', (e) => {
        if (suggestionsBox && !e.target.closest('.search-wrapper')) {
            suggestionsBox.innerHTML = '';
            suggestionsBox.style.display = 'none';
        }
    });

    const btnSuscribirse = document.querySelector('footer button');
    if (btnSuscribirse) {
        btnSuscribirse.addEventListener('click', (e) => {
            e.preventDefault();
            alert("¡Gracias por suscribirte a WUOLUX!");
        });
    }
});