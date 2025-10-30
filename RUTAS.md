# 📍 RUTAS DE LA API EXPRESS – PET STORE

---

## 🧍‍♀️ USUARIOS (`/api/usuarios`)

| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| **GET** | `/api/usuarios` | Lista todos los usuarios ocultando contraseñas |
| **GET** | `/api/usuarios/:id` | Devuelve un usuario específico por ID |
| **POST** | `/api/usuarios` | Crea un nuevo usuario |
| **POST** | `/api/usuarios/login` | Autenticación con email y contraseña |
| **PUT** | `/api/usuarios/:id` | Actualiza datos de un usuario existente |
| **DELETE** | `/api/usuarios/:id` | Elimina un usuario (solo si no tiene ventas asociadas) |

---

## 🛒 PRODUCTOS (`/api/productos`)

| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| **GET** | `/api/productos` | Lista todos los productos |
| **GET** | `/api/productos/:id` | Devuelve un producto por ID |
| **POST** | `/api/productos` | Crea un nuevo producto |
| **POST** | `/api/productos/buscar` | Busca productos por nombre o marca |
| **PUT** | `/api/productos/:id` | Actualiza un producto existente |
| **DELETE** | `/api/productos/:id` | Elimina un producto (verifica integridad con ventas) |

---

## 💰 VENTAS (`/api/ventas`)

| Método | Endpoint | Descripción |
|--------|-----------|-------------|
| **GET** | `/api/ventas` | Lista todas las ventas (paginación opcional con `?offset=&limit=`) |
| **GET** | `/api/ventas/:id` | Muestra detalle de una venta |
| **POST** | `/api/ventas` | Crea una nueva venta (valida usuario, stock y descuenta unidades) |
| **POST** | `/api/ventas/buscar` | Busca ventas por filtros (usuario, fechas o producto) |
| **PUT** | `/api/ventas/:id` | Actualiza datos básicos (dirección o método de pago) |
| **DELETE** | `/api/ventas/:id` | Elimina una venta y repone stock de productos vendidos |

---

📦 **Estructuras utilizadas**
- `usuarios.json`
- `productos.json`
- `ventas.json`

📁 **Prefijo de todas las rutas:** `http://localhost:3000/api/`
