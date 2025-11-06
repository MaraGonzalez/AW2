import { Router } from 'express';
import { readJson, writeJson } from '../lib/fsjson.js';
import { fileURLToPath } from 'url';
import path from 'path';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SOLICITUDES MÉTODO GET: 
//GET /api/usuarios -- LISTAR TODOS LOS USUARIOS OCULTANDO LA CONTRASEÑA
router.get('/', async (_req, res) => {
  const usuarios = await readJson('usuarios.json');
  const safe = usuarios.map(({ contraseña, ...u }) => u);
  res.json(safe);
});

//GET /api/usuarios/:id -- DEVUELVE EL DETALLE DE UN USUARIO POR ID SIN PW
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const usuarios = await readJson('usuarios.json');
  const user = usuarios.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { contraseña, ...safe } = user;
  res.json(safe);
});

//================================
//SOLICITUDES MÉTODO POST:
// POST /api/usuarios -- CREA UN NUEVO USUARIO
router.post('/', async (req, res) => {
  const { nombre, apellido, email, contraseña, telefono, mascotas = [] } = req.body || {};
  if (!nombre || !apellido || !email || !contraseña) {
    return res.status(400).json({ error: 'nombre, apellido, email y contraseña son requeridos' });
  }
  const usuarios = await readJson('usuarios.json');
  if (usuarios.some(u => u.email === email)) {
    return res.status(409).json({ error: 'Email ya registrado' });
  }
  const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
  const nuevo = { id: newId, nombre, apellido, email, contraseña, telefono, mascotas };
  usuarios.push(nuevo);
  await writeJson('usuarios.json', usuarios);
  const { contraseña: _omit, ...safe } = nuevo;
  res.status(201).json(safe);
});

// POST /api/usuarios/login -- AUTENTICACIÓN DE USUARIO
router.post('/login', async (req, res) => {
  const { email, contraseña } = req.body || {};
  if (!email || !contraseña) {
    return res.status(400).json({ error: 'email y contraseña son requeridos' });
  }

  const usuarios = await readJson('usuarios.json');
  const user = usuarios.find(u => u.email === email && u.contraseña === contraseña);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  const { contraseña: _omit, ...safe } = user;
  const token = 'demo-token';

  return res.json({ token, user: safe });
});


//=================================
// SOLICITUDES MÉTODO PUT:
// PUT /api/usuarios/:id -- ACTUALIZA UN USUARIO POR ID

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const usuarios = await readJson('usuarios.json');

  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { nombre, apellido, email, telefono, mascotas } = req.body || {};

  if (nombre !== undefined) usuario.nombre = String(nombre);
  if (apellido !== undefined) usuario.apellido = String(apellido);
  if (email !== undefined) usuario.email = String(email);
  if (telefono !== undefined) usuario.telefono = String(telefono);
  if (Array.isArray(mascotas)) usuario.mascotas = mascotas;

  await writeJson('usuarios.json', usuarios);

  res.json({ actualizado: usuario });
});

// ================================
// SOLICITUD MÉTODO DELETE:
// DELETE /api/usuarios/:id (integridad con ventas)
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const [usuarios, ventas] = await Promise.all([
    readJson('usuarios.json'),
    readJson('ventas.json'),
  ]);
  const tieneVentas = ventas.some(v => v.id_usuario === id); // ventas.json: id_usuario
  if (tieneVentas) {
    return res.status(409).json({
      error: 'No se puede eliminar el usuario porque tiene ventas asociadas. Elimine o reasigne esas ventas primero.',
    });
  }
  const idx = usuarios.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Usuario no encontrado' });
  const [eliminado] = usuarios.splice(idx, 1);
  await writeJson('usuarios.json', usuarios);
  const { contraseña, ...safe } = eliminado;
  res.json({ eliminado: safe });
});

export default router;
