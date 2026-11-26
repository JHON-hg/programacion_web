document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registroForm');
    const successMsg = document.getElementById('successMsg');

    // Marca un campo como inválido o válido (agrega/quita la clase 'invalid')
    // según el resultado de la validación recibida.
    function validateField(id, isValid) {
        const field = document.getElementById(id);
        field.classList.toggle('invalid', !isValid);
        return isValid;
    }

    if (form) {
        // Al enviar el formulario de registro: valida email, nombre y teléfono;
        // si todo es válido, muestra el mensaje de éxito y resetea el formulario.
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            successMsg.style.display = 'none';

            const email = document.getElementById('email').value.trim();
            const nombre = document.getElementById('nombre').value.trim();
            const telefono = document.getElementById('telefono').value.trim();

            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            const nombreOk = nombre.length >= 3;
            const telefonoOk = /^[0-9+\s-]{7,15}$/.test(telefono);

            const v1 = validateField('emailField', emailOk);
            const v2 = validateField('nombreField', nombreOk);
            const v3 = validateField('telefonoField', telefonoOk);

            if (v1 && v2 && v3) {
                successMsg.style.display = 'block';
                form.reset();
                document.querySelectorAll('.field').forEach(f => f.classList.remove('invalid'));
            }
        });

        // Al escribir en cada campo, quita el estado de error y oculta el
        // mensaje de éxito previo.
        ['email', 'nombre', 'telefono'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                document.getElementById(id + 'Field').classList.remove('invalid');
                successMsg.style.display = 'none';
            });
        });
    }

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
    // página de detalle.
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