const express = require('express');
const path = require('path');

const app = express();

//=============================================================
// MIDDLEWARE
//=============================================================

// Middleware para registrar las solicitudes
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middleware para leer datos JSON
app.use(express.json({ limit: '10kb' }));

//=============================================================
// LISTA DE PRODUCTOS DE WUOLUX
//=============================================================

const productos = [
    { id: "P001", descripcion: "Polo Haver", categoria: "polo", precio: 39.99, imagen: "img/polo1.png" },
    { id: "P002", descripcion: "Polo Mayoral", categoria: "polo", precio: 29.99, imagen: "img/polo2.png" },
    { id: "P003", descripcion: "Chompa casual", categoria: "chompa", precio: 39.99, imagen: "img/compa1.jpeg" },
    { id: "P004", descripcion: "Polo Puma", categoria: "polo", precio: 29.99, imagen: "img/polo3.png" },
    { id: "P005", descripcion: "Casaca premium", categoria: "casacas", precio: 49.99, imagen: "img/casaca1.jpeg" },
    { id: "P006", descripcion: "Pantalón clásico", categoria: "pantalones", precio: 44.99, imagen: "img/pantalon1.png" },
    { id: "P007", descripcion: "Chompa urbana", categoria: "chompa", precio: 39.99, imagen: "img/chompa2.jpeg" },
    { id: "P008", descripcion: "Polo Cars", categoria: "polo", precio: 29.99, imagen: "img/polo4.png" },
    { id: "P009", descripcion: "Casaca casual", categoria: "casacas", precio: 24.99, imagen: "img/casaca2.jpeg" },
    { id: "P010", descripcion: "Pantalón sport", categoria: "pantalones", precio: 54.99, imagen: "img/pantalon2.png" },
    { id: "P011", descripcion: "Polo astral", categoria: "polo", precio: 24.99, imagen: "img/polo5.jpg" },
    { id: "P012", descripcion: "Chompa elegante", categoria: "chompa", precio: 44.99, imagen: "img/chompa3.jpeg" },
    { id: "P013", descripcion: "Casaca invierno", categoria: "casacas", precio: 54.99, imagen: "img/casaca4.jpeg" },
    { id: "P014", descripcion: "Polo Mickey Mouse", categoria: "polo", precio: 29.99, imagen: "img/polo6.png" },
    { id: "P015", descripcion: "Pantalón casual", categoria: "pantalones", precio: 57.99, imagen: "img/pantalon3.jpeg" },
    { id: "P016", descripcion: "Chompa premium", categoria: "chompa", precio: 49.99, imagen: "img/chompa4.jpeg" }
];

//=============================================================
// LISTA DE PEDIDOS
//=============================================================

const pedidos = [];

//=============================================================
// RUTAS GET
//=============================================================

app.get('/api/productos', (req, res) => {
    res.status(200).json(productos);
});

app.get('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const producto = productos.find(p => p.id === id);

    if (!producto) {
        return res.status(404).json({
            mensaje: "Producto no encontrado"
        });
    }

    res.status(200).json(producto);
});

//=============================================================
// RUTA PUT (MODIFICAR PRODUCTO)
//=============================================================

app.put('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    // Buscamos la posición del producto en la lista
    const posicion = productos.findIndex(p => p.id === id);

    // Si findIndex devuelve -1, significa que no lo encontró
    if (posicion === -1) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    // Actualizamos los datos (si el cliente no envía un dato, mantenemos el anterior)
    productos[posicion] = {
        id: id,
        descripcion: req.body.descripcion || productos[posicion].descripcion,
        categoria: req.body.categoria || productos[posicion].categoria,
        precio: req.body.precio || productos[posicion].precio,
        imagen: req.body.imagen || productos[posicion].imagen
    };

    return res.status(200).json({
        mensaje: "Producto modificado correctamente",
        producto: productos[posicion]
    });
});

//=============================================================
// RUTA DELETE (ELIMINAR PRODUCTO)
//=============================================================

app.delete('/api/productos/:id', (req, res) => {
    const id = req.params.id;
    const posicion = productos.findIndex(p => p.id === id);

    if (posicion === -1) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    // splice(posicion, 1) borra 1 elemento desde esa posición
    const productoEliminado = productos.splice(posicion, 1);

    return res.status(200).json({
        mensaje: "Producto eliminado correctamente",
        producto: productoEliminado[0]
    });
});

//=============================================================
// RUTA POST (REGISTRAR PEDIDO)
//=============================================================

app.post('/api/pedidos', (req, res) => {
    const items = req.body.items;

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ mensaje: "El pedido debe contener productos" });
    }

    const productosPedido = [];
    let total = 0;

    for (const item of items) {
        const producto = productos.find(p => p.id === item.id);

        if (!producto) {
            return res.status(404).json({ mensaje: "Producto no encontrado: " + item.id });
        }

        const cantidadRaw = item.cantidad !== undefined ? item.cantidad : item.quantity;
        const cantidad = Number(cantidadRaw);

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({ mensaje: "La cantidad debe ser un número entero positivo" });
        }

        const subtotal = producto.precio * cantidad;

        productosPedido.push({
            id: producto.id,
            descripcion: producto.descripcion,
            talla: item.size || item.talla || null,
            cantidad: cantidad,
            precio: producto.precio,
            subtotal: Number(subtotal.toFixed(2))
        });

        total = total + subtotal;
    }

    const nuevoPedido = {
        id: pedidos.length + 1,
        productos: productosPedido,
        total: Number(total.toFixed(2))
    };

    pedidos.push(nuevoPedido);
    console.log("Nuevo pedido registrado:", JSON.stringify(nuevoPedido, null, 2));

    res.status(201).json({
        mensaje: "Pedido registrado correctamente",
        pedido: nuevoPedido
    });
});

//=============================================================
// ARCHIVOS ESTÁTICOS Y SERVIDOR
//=============================================================

app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});