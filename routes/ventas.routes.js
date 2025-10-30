import { Router } from 'express';
import dayjs from 'dayjs';
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
// GET /api/ventas — LISTAR TODAS LAS VENTAS
router.get('/', async (req, res) => {
  const ventas = await readJson('ventas.json');
  const offset = Math.max(0, Number(req.query.offset ?? 0));
  const limit = Math.max(0, Number(req.query.limit ?? ventas.length));
  const slice = ventas.slice(offset, offset + limit);
  res.json({
    total: ventas.length,
    offset,
    limit: slice.length,
    data: slice
  });
});

// GET /api/ventas/:id — DETALLE VENTA
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const ventas = await readJson('ventas.json');
  const v = ventas.find(x => x.id === id);
  if (!v) return res.status(404).json({ error: 'Venta no encontrada' });
  res.json(v);
});

// ==========================
// SOLICITUDES MÉTODO POST:
// POST /api/ventas — CREAR VENTA
router.post('/', async (req, res) => {
  const { id_usuario, direccion, metodo_pago, productos } = req.body || {};
  if (!id_usuario || !direccion || !metodo_pago || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({ error: 'id_usuario, direccion, metodo_pago y productos[] son requeridos' });
  }

  const [usuarios, catalogo, ventas] = await Promise.all([
    readJson('usuarios.json'),
    readJson('productos.json'),
    readJson('ventas.json'),
  ]);

  if (!usuarios.some(u => u.id === id_usuario)) {
    return res.status(400).json({ error: 'id_usuario inválido' });
  }

  const detalle = [];
  for (const it of productos) {
    const prod = catalogo.find(p => p.id === Number(it.id));
    if (!prod) return res.status(400).json({ error: `Producto inexistente: ${it.id}` });

    const cant = Number(it.cantidad);
    if (!Number.isInteger(cant) || cant <= 0) {
      return res.status(400).json({ error: `Cantidad inválida para producto ${it.id}` });
    }
    if (prod.stock < cant) {
      return res.status(409).json({ error: `Stock insuficiente para ${prod.nombre}` });
    }

    detalle.push({
      id: prod.id,
      nombre: prod.nombre,
      precio_unitario: prod.precio,
      cantidad: cant,
      subtotal: +(prod.precio * cant).toFixed(2),
    });
  }

  for (const d of detalle) {
    const prod = catalogo.find(p => p.id === d.id);
    prod.stock -= d.cantidad;
  }

  const total = +detalle.reduce((acc, d) => acc + d.subtotal, 0).toFixed(2);
  const newId = ventas.length ? Math.max(...ventas.map(v => v.id)) + 1 : 4001;

  const nueva = {
    id: newId,
    id_usuario,
    fecha: dayjs().format('DD-MM-YYYY, HH:mm:ss'),
    direccion,
    metodo_pago,
    productos: detalle,
    costo_envio: 0.0,
    total,
  };

  ventas.push(nueva);
  await Promise.all([
    writeJson('ventas.json', ventas),
    writeJson('productos.json', catalogo),
  ]);

  res.status(201).json(nueva);
});

// POST /api/ventas/buscar — BUSCAR VENTAS POR CRITERIOS
router.post('/buscar', async (req, res) => {
  const { id_usuario, fecha_desde, fecha_hasta, id_producto } = req.body || {};
  const ventas = await readJson('ventas.json');

  const parseFecha = (s) => {
    const [fecha] = String(s).split(',');
    const [dd, mm, yyyy] = fecha.trim().split('-').map(Number);
    return new Date(yyyy, mm - 1, dd).getTime();
  };

  let result = ventas;

  if (id_usuario !== undefined) {
    const id = Number(id_usuario);
    result = result.filter(v => v.id_usuario === id);
  }

  if (fecha_desde) {
    const from = parseFecha(fecha_desde);
    result = result.filter(v => parseFecha(v.fecha) >= from);
  }

  if (fecha_hasta) {
    const to = parseFecha(fecha_hasta);
    result = result.filter(v => parseFecha(v.fecha) <= to);
  }

  if (id_producto !== undefined) {
    const pid = Number(id_producto);
    result = result.filter(v => Array.isArray(v.productos) && v.productos.some(it => it.id === pid));
  }

  if (result.length === 0) {
    return res.status(404).json({ mensaje: 'No se encontraron ventas con los criterios ingresados' });
  }

  res.json({ total: result.length, data: result });
});

// ==========================
// SOLICITUD MÉTODO PUT:
// PUT /api/ventas/:id — ACTUALIZA DATOS (DIRECCIÓN, MÉTODO DE PAGO)
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const ventas = await readJson('ventas.json');

  const venta = ventas.find(v => v.id === id);
  if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

  const { direccion, metodo_pago } = req.body || {};

  if (direccion !== undefined) venta.direccion = String(direccion);
  if (metodo_pago !== undefined) venta.metodo_pago = String(metodo_pago);

  await writeJson('ventas.json', ventas);
  res.json({ actualizado: venta });
});

// ==========================
// SOLICITUD MÉTODO DELETE:
// DELETE /api/ventas/:id — ELIMINA UNA VENTA (y repone stock)
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const [ventas, catalogo] = await Promise.all([
    readJson('ventas.json'),
    readJson('productos.json'),
  ]);

  const idx = ventas.findIndex(v => v.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Venta no encontrada' });

  const [borrada] = ventas.splice(idx, 1);

  for (const it of (borrada.productos || [])) {
    const prod = catalogo.find(p => p.id === it.id);
    if (prod) prod.stock += Number(it.cantidad) || 0;
  }

  await Promise.all([
    writeJson('ventas.json', ventas),
    writeJson('productos.json', catalogo),
  ]);

  res.json({ eliminado: borrada });
});

export default router;
