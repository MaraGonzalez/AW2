import express from 'express';
import dayjs from 'dayjs';
import { fileURLToPath } from 'url';
import path from 'path';
import ventasRouter from './routes/ventas.routes.js';
import usuariosRouter from './routes/usuarios.routes.js';
import productosRouter from './routes/productos.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');


const app = express();                         
const PORT = 3000;                             
const now = dayjs().format('YYYY-MM-DD HH:mm:ss'); 
app.use(express.json()); 

app.use('/api/ventas', ventasRouter); 
app.use('/api/usuarios', usuariosRouter);
app.use('/api/productos', productosRouter);          

app.listen(PORT, () => {
  console.log('=============================');
  console.log(`Server is alive on ${PORT}`);
  console.log('=============================');
  console.log(`Server started at ${now}`);
  console.log('=============================');  
});