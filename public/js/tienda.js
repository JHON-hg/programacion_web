document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.filters .filter-btn');
    const products = document.querySelectorAll('.shop-grid .product-card');
    let currentSearchQuery = '';

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
        // Al hacer clic en una sugerencia, selecciona ese producto.
        suggestionsBox.querySelectorAll('.suggestion-item').forEach((el, idx) => {
            el.addEventListener('click', () => selectProduct(matches[idx].name));
        });
    }

    // Busca el producto por nombre en el índice de la tienda, arma el objeto
    // de producto seleccionado con su precio real (leído de la tarjeta) y
    // redirige a la página de detalle del producto.
    function selectProduct(name) {
        const match = productIndex.find(p => p.name === name);
        if (!match) return;

        const card = match.card;
        const priceText = (card.querySelector('.price') && card.querySelector('.price').textContent.trim()) || '0';
        const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

        const selectedProduct = {
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
        // Al escribir en el buscador, filtra la grilla y muestra sugerencias
        // que coincidan con el texto ingresado.
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

        // Maneja las teclas Enter (ir directo al primer producto que coincide)
        // y Escape (cerrar sugerencias).
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

        // Cierra el cuadro de sugerencias al hacer clic fuera del buscador.
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-wrapper')) {
                suggestionsBox.innerHTML = '';
                suggestionsBox.style.display = 'none';
            }
        });
    }

    // Al hacer clic en "Comprar" de una tarjeta de producto, arma el objeto
    // de producto seleccionado y redirige a la página de detalle.
    document.querySelectorAll('.buy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.product-card');
            if (!card) return;

            const title = (card.querySelector('h3') && card.querySelector('h3').textContent.trim()) || 'Producto';
            const priceText = (card.querySelector('.price') && card.querySelector('.price').textContent.trim()) || '0';
            const imgEl = card.querySelector('img.prod-img');
            const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

            const selectedProduct = {
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