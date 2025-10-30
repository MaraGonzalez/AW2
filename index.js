import express from 'express';
import dayjs from 'dayjs';
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import {log} from 'console';
import ventasRouter from './routes/ventas.routes.js';
import usuariosRouter from './routes/usuarios.routes.js';
import productosRouter from './routes/productos.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

export async function readJson(name) {
  const full = path.join(dataDir, name);
  const raw = await readFile(full, 'utf8');
  return JSON.parse(raw);
}

export async function writeJson(name, data) {
  const full = path.join(dataDir, name);
  await writeFile(full, JSON.stringify(data, null, 2), 'utf8');
}

const app = express();                         
const PORT = 3000;                             
const now = dayjs().format('YYYY-MM-DD HH:mm:ss'); 
app.use(express.json()); 

app.use('/api', ventasRouter); 
app.use('/api', usuariosRouter);
app.use('/api', productosRouter);          

app.listen(PORT, () => {
  console.log('=============================');
  console.log(`Server is alive on ${PORT}`);
  console.log('=============================');
  console.log(`Server started at ${now}`);
  console.log('=============================');  
});