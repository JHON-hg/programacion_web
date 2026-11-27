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
    { id: "P001", descripcion: "Polo Haver", categoria: "polo", precio: 39.99 },
    { id: "P002", descripcion: "Polo Mayoral", categoria: "polo", precio: 29.99 },
    { id: "P003", descripcion: "Chompa casual", categoria: "chompa", precio: 39.99 },
    { id: "P004", descripcion: "Polo Puma", categoria: "polo", precio: 29.99 },
    { id: "P005", descripcion: "Casaca premium", categoria: "casacas", precio: 49.99 },
    { id: "P006", descripcion: "Pantalón clásico", categoria: "pantalones", precio: 44.99 },
    { id: "P007", descripcion: "Chompa urbana", categoria: "chompa", precio: 39.99 },
    { id: "P008", descripcion: "Polo Cars", categoria: "polo", precio: 29.99 },
    { id: "P009", descripcion: "Casaca casual", categoria: "casacas", precio: 24.99 },
    { id: "P010", descripcion: "Pantalón sport", categoria: "pantalones", precio: 54.99 },
    { id: "P011", descripcion: "Polo astral", categoria: "polo", precio: 24.99 },
    { id: "P012", descripcion: "Chompa elegante", categoria: "chompa", precio: 44.99 },
    { id: "P013", descripcion: "Casaca invierno", categoria: "casacas", precio: 54.99 },
    { id: "P014", descripcion: "Polo Mickey Mouse", categoria: "polo", precio: 29.99 },
    { id: "P015", descripcion: "Pantalón casual", categoria: "pantalones", precio: 57.99 },
    { id: "P016", descripcion: "Chompa premium", categoria: "chompa", precio: 49.99 }
];

//=============================================================
// LISTA DE PEDIDOS
//=============================================================

// Aquí guardaremos las compras realizadas
const pedidos = [];

//=============================================================
// RUTAS GET
//=============================================================

// GET: consultar todos los productos
app.get('/api/productos', (req, res) => {
    res.status(200).json(productos);
});

// GET: consultar un producto por su ID
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
// RUTA POST
//=============================================================

// POST: registrar un pedido
app.post('/api/pedidos', (req, res) => {
    const items = req.body.items;

    // Validar que el pedido tenga productos
    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            mensaje: "El pedido debe contener productos"
        });
    }

    const productosPedido = [];
    let total = 0;

    // Recorrer los productos del pedido
    for (const item of items) {
        // Buscar el producto en el catálogo
        const producto = productos.find(p => p.id === item.id);

        // Comprobar que el producto exista
        if (!producto) {
            return res.status(404).json({
                mensaje: "Producto no encontrado: " + item.id
            });
        }

        // Obtener y validar la cantidad (acepta cantidad o quantity)
        const cantidadRaw = item.cantidad !== undefined ? item.cantidad : item.quantity;
        const cantidad = Number(cantidadRaw);

        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({
                mensaje: "La cantidad debe ser un número entero positivo"
            });
        }

        // Calcular el subtotal
        const subtotal = producto.precio * cantidad;

        // Agregar el producto al pedido
        productosPedido.push({
            id: producto.id,
            descripcion: producto.descripcion,
            talla: item.size || item.talla || null,
            cantidad: cantidad,
            precio: producto.precio,
            subtotal: Number(subtotal.toFixed(2))
        });

        // Acumular el total
        total = total + subtotal;
    }

    // Crear el nuevo pedido
    const nuevoPedido = {
        id: pedidos.length + 1,
        productos: productosPedido,
        total: Number(total.toFixed(2))
    };

    // Guardar el pedido
    pedidos.push(nuevoPedido);
    console.log("Nuevo pedido registrado:", JSON.stringify(nuevoPedido, null, 2));

    // Responder que el pedido fue creado
    res.status(201).json({
        mensaje: "Pedido registrado correctamente",
        pedido: nuevoPedido
    });
});

//=============================================================
// ARCHIVOS ESTÁTICOS
//=============================================================

// Mostrar los archivos de la carpeta public
app.use(express.static(path.join(__dirname, 'public')));

//=============================================================
// INICIAR SERVIDOR
//=============================================================

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});