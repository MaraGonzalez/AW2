# 1° Etapa de trabajo practico
Este repositorio contiene **estructuras JSON interrelacionadas** como parte de una entrega académica.  
El contexto elegido es un **Pet Shop online en Rosario**, que vende alimentos, accesorios y arenas sanitarias para mascotas.

## Archivos incluidos

- **usuarios.json**  
  Contiene la lista de usuarios registrados (clientes).  
  Cada usuario incluye:
  - `id`, `nombre`, `apellido`, `email`, `contraseña` (hash ficticio)
  - `telefono`
  - `mascotas` (array con especie y nombre de cada mascota)

- **productos.json**  
  Contiene un catálogo de **30 productos** organizados en categorías:  
  - 5 alimentos para perros (Purina Dog Chow, Pro Plan, Royal Canin, Vitalcan, Sieger)  
  - 5 alimentos para gatos (Whiskas, Purina Cat Chow, Pro Plan, Royal Canin, Vitalcan)  
  - 5 alimentos para otros animales (hámsters, conejos, aves, peces)  
  - 10 accesorios (camas, correas, peceras, jaulas, transportines, mochilas, rascadores)  
  - 5 arenas/piedritas sanitarias  
  Cada producto incluye `id`, `nombre`, `desc`, `precio`, `imagen`, `stock`, `disponible`, `categoria`, `marca` y `destacado`.

- **ventas.json**  
  Contiene **7 ventas realizadas**.  
  Cada venta incluye:
  - `id`, `id_usuario` (relación con usuarios.json)  
  - `fecha` en formato `DD-MM-YYYY, HH:MM:SS`  
  - `direccion` (todas en Rosario)  
  - `metodo_pago` (`tarjeta`, `efectivo`, `transferencia`, `mercado_pago`)  
  - `productos` (array con objetos: `id`, `nombre`, `precio_unitario`, `cantidad`, `subtotal`)  
  - `costo_envio` y `total` (calculado automáticamente)

## Notas

- Los datos son de **ejemplo**.  
- Los precios, stocks e IDs son simulados, pero las marcas de alimentos corresponden a las que se comercializan en Argentina.  
- Las contraseñas son *hashes ficticios* (no reales).  
- Las direcciones son inventadas de Rosario, Santa Fe.

## Cómo usar

1. Descargar o clonar este repositorio.  

2. Validar los JSON en **Windows PowerShell**:  
   ```powershell
   Get-Content usuarios.json  | ConvertFrom-Json | Out-Null; Write-Output "Usuarios OK"
   Get-Content productos.json | ConvertFrom-Json | Out-Null; Write-Output "Productos OK"
   Get-Content ventas.json    | ConvertFrom-Json | Out-Null; Write-Output "Ventas OK"

---

**Licencia:** Uso educativo
