document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filters .filter-btn');
    const products = document.querySelectorAll('.shop-grid .product-card');
    let currentSearchQuery = '';

    // Mapeo nombre → ID del catálogo del servidor (P001…P016).
    // Sirve para que selectedProduct siempre lleve un id válido,
    // sin depender de que Cantidad_Producto.js lo resuelva por nombre.
    const productNameToId = {
        'Polo Haver': 'P001',
        'Polo Mayoral': 'P002',
        'Chompa casual': 'P003',
        'Polo Puma': 'P004',
        'Casaca premium': 'P005',
        'Pantalón clásico': 'P006',
        'Chompa urbana': 'P007',
        'Polo Cars': 'P008',
        'Casaca casual': 'P009',
        'Pantalón sport': 'P010',
        'Polo astral': 'P011',
        'Chompa elegante': 'P012',
        'Casaca invierno': 'P013',
        'Polo Mickey Mouse': 'P014',
        'Pantalón casual': 'P015',
        'Chompa premium': 'P016'
    };

    // Muestra u oculta las tarjetas de producto según la categoría activa
    // (botón de filtro) y el texto de búsqueda actual.
    function applyFilter(filter) {
        const activeFilter = filter || 'all';
        const q = currentSearchQuery.trim().toLowerCase();

        products.forEach(card => {
            const cat = card.dataset.category;
            const title = (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || '';
            const matchesCategory = !activeFilter || activeFilter === 'all' || cat === activeFilter;
            const matchesSearch = !q || title.toLowerCase().includes(q);

            if (matchesCategory && matchesSearch) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    }

    const bannerContainer = document.querySelector('.header-banner');

    // Actualiza el atributo data-category del banner superior según el
    // filtro de categoría seleccionado.
    function updateBanner(filter) {
        if (!bannerContainer) return;
        bannerContainer.dataset.category = filter || 'all';
    }

    // Al hacer clic en un botón de filtro, lo marca como activo, filtra
    // los productos por esa categoría y actualiza el banner.
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            applyFilter(filter);
            updateBanner(filter);
        });
    });

    // NOTA: el buscador visible en tienda.html (id="home-search") lo maneja
    // js/modificaciones.js. Este archivo no debe duplicar ese listener.
    const searchInput = document.getElementById('shop-search');
    const suggestionsBox = document.getElementById('search-suggestions');
    const productCards = Array.from(products);
    const productIndex = productCards.map(card => {
        const name = (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || '';
        const imgEl = card.querySelector('img.prod-img');
        const img = imgEl ? imgEl.getAttribute('src') : '';
        return { name, img, card };
    });

    // Obtiene el filtro de categoría actualmente activo (botón con clase 'active').
    function getActiveFilter() {
        const activeBtn = document.querySelector('.filters .filter-btn.active');
        return activeBtn ? activeBtn.dataset.filter : 'all';
    }

    // Renderiza la lista de sugerencias de búsqueda en el cuadro desplegable.
    function showSuggestions(matches) {
        if (!matches.length) {
            suggestionsBox.style.display = 'none';
            suggestionsBox.innerHTML = '';
            return;
        }
        suggestionsBox.innerHTML = matches.map(m => {
            const thumb = m.img ? `<img src="${m.img}" alt="${m.name}" class="suggestion-thumb">` : '';
            return `<div class="suggestion-item" role="option">${thumb}<span class="suggestion-name">${m.name}</span></div>`;
        }).join('');
        suggestionsBox.style.display = 'block';
        suggestionsBox.querySelectorAll('.suggestion-item').forEach((el, idx) => {
            el.addEventListener('click', () => selectProduct(matches[idx].name));
        });
    }

    // Busca el producto por nombre en el índice de la tienda, arma el objeto
    // de producto seleccionado con su precio real (leído de la tarjeta) y su
    // ID del catálogo, y redirige a la página de detalle.
    function selectProduct(name) {
        const match = productIndex.find(p => p.name === name);
        if (!match) return;

        const card = match.card;
        const priceText = (card.querySelector('.price') && card.querySelector('.price').textContent.trim()) || '0';
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

        const selectedProduct = {
            id: productNameToId[match.name] || '',
            name: match.name,
            price,
            image: match.img,
            category: card.dataset.category || 'general',
            description: `Prenda seleccionada: ${match.name}. Ideal para complementar tu estilo.`
        };

        localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
        window.location.href = 'Productos.html';
    }

    // Limpia la búsqueda actual y vuelve a aplicar solo el filtro de categoría activo.
    function resetToFilter() {
        currentSearchQuery = '';
        applyFilter(getActiveFilter());
    }

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const q = e.target.value.trim().toLowerCase();
            currentSearchQuery = e.target.value.trim();
            if (!q) {
                resetToFilter();
                return;
            }
            const matches = productIndex.filter(p => p.name.toLowerCase().includes(q)).slice(0, 6);
            applyFilter(getActiveFilter());
            showSuggestions(matches);
        });

        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const first = productIndex.find(p => p.name.toLowerCase().includes(searchInput.value.trim().toLowerCase()));
                if (first) selectProduct(first.name);
            } else if (e.key === 'Escape') {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
            }
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
            }
        });
    }

    // Al hacer clic en "Comprar" de una tarjeta, arma selectedProduct con su
    // ID, nombre, precio, imagen, categoría y descripción, y redirige al detalle.
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            if (!card) return;

            const title = (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || 'Producto';
            const priceText = (card.querySelector('.price') && card.querySelector('.price').textContent.trim()) || '0';
            const imgEl = card.querySelector('img.prod-img');
            const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

            const selectedProduct = {
                id: productNameToId[title] || '',
                name: title,
                price,
                image: imgEl ? imgEl.getAttribute('src') : '',
                category: card.dataset.category || 'general',
                description: `Prenda seleccionada: ${title}. Ideal para complementar tu estilo.`
            };

            localStorage.setItem('selectedProduct', JSON.stringify(selectedProduct));
            window.location.href = 'Productos.html';
        });
    });
});