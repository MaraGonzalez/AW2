import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

async function readJson(name) {
  const full = path.join(dataDir, name);
  const raw = await readFile(full, 'utf8');
  return JSON.parse(raw);
}
async function writeJson(name, data) {
  const full = path.join(dataDir, name);
  await writeFile(full, JSON.stringify(data, null, 2), 'utf8');
}


// SOLICITUDES MÉTODO GET:
// GET /api/productos — LISTAR TODOS LOS PRODUCTOS
router.get('/', async (_req, res) => {
  const productos = await readJson('productos.json');
  res.json(productos);
});

// GET /api/productos/:id — DETALLE DE UN PRODUCTO
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const productos = await readJson('productos.json');
  const producto = productos.find(p => p.id === id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

// ==========================
// SOLICITUDES MÉTODO POST:
// POST /api/productos — CREAR UN NUEVO PRODUCTO
router.post('/', async (req, res) => {
  const { nombre, marca, categoria, precio, stock = 0, disponible = true, desc = '', imagen = '' } = req.body || {};
  if (!nombre || !marca || !categoria || precio === undefined) {
    return res.status(400).json({ error: 'nombre, marca, categoria y precio son requeridos' });
  }

  const productos = await readJson('productos.json');
  const newId = productos.length ? Math.max(...productos.map(p => p.id)) + 1 : 1;
  const nuevo = { id: newId, nombre, marca, categoria, precio, stock, disponible, desc, imagen };
  productos.push(nuevo);
  await writeJson('productos.json', productos);

  res.status(201).json(nuevo);
});

//POST /api/productos/buscar -- BUSCAR PRODUCTOS POR NOMBRE O MARCA
router.post('/buscar', async (req, res) => {
  const { texto } = req.body || {};
  if (!texto) return res.status(400).json({ error: 'Debe ingresar texto a buscar' });

  const productos = await readJson('productos.json');
  const filtro = texto.toLowerCase();
  const resultados = productos.filter(p =>
    p.nombre.toLowerCase().includes(filtro) ||
    p.marca.toLowerCase().includes(filtro)
  );

  if (resultados.length === 0) {
    return res.status(404).json({ mensaje: 'No se encontraron productos que coincidan con la búsqueda' });
  }

  res.json(resultados);
});

// ==========================
// SOLICITUD MÉTODO PUT
// PUT /api/productos/:id — ACTUALIZAR PRDUCTO
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const productos = await readJson('productos.json');

  const p = productos.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Producto no encontrado' });

  const { nombre, precio, stock, disponible, desc, categoria, marca, imagen } = req.body || {};

  if (nombre !== undefined) p.nombre = String(nombre);
  if (precio !== undefined) {
    const n = Number(precio);
    if (Number.isNaN(n) || n < 0) return res.status(400).json({ error: 'precio inválido' });
    p.precio = n;
  }
  if (stock !== undefined) {
    const s = Number(stock);
    if (!Number.isInteger(s) || s < 0) return res.status(400).json({ error: 'stock inválido' });
    p.stock = s;
  }
  if (disponible !== undefined) p.disponible = !!disponible;
  if (desc !== undefined) p.desc = String(desc);
  if (categoria !== undefined) p.categoria = String(categoria);
  if (marca !== undefined) p.marca = String(marca);
  if (imagen !== undefined) p.imagen = String(imagen);

  await writeJson('productos.json', productos);
  res.json(p);
});

// ==========================
// SOLICITUDES MÉTODO DELETE:
// DELETE /api/productos/:id — integridad con ventas
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const [productos, ventas] = await Promise.all([
    readJson('productos.json'),
    readJson('ventas.json'),
  ]);

  const usado = ventas.some(v => Array.isArray(v.productos) && v.productos.some(it => it.id === id));
  if (usado) {
    return res.status(409).json({
      error: 'No se puede eliminar el producto porque está presente en ventas. Elimine o modifique esas ventas primero.',
    });
  }

  const idx = productos.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Producto no encontrado' });

  const [eliminado] = productos.splice(idx, 1);
  await writeJson('productos.json', productos);
  res.json({ eliminado });
});

export default router;