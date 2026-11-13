// Bloques de datos que conoce el front, por código (espejo de actos_backend/Bloques/BloquesDefinidos.cs).
// Para agregar uno: su archivo acá, registrarlo abajo, y la clase espejo en el back.
// Cada bloque puede traer su propio componente (DefBloque.componente); si no, se usa PanelBloque.
import { cuentaBancaria } from './cuentaBancaria'
import { expediente } from './expediente'
import { inmueble } from './inmueble'
import { inmuebleRegistral } from './inmuebleRegistral'
import { vehiculo } from './vehiculo'
import type { DefBloque } from './tipos'

export type { DefBloque, PropsPanelBloque } from './tipos'

export const BLOQUES: Record<string, DefBloque> = Object.fromEntries(
  [inmueble, inmuebleRegistral, vehiculo, cuentaBancaria, expediente].map((b) => [b.codigo, b]),
)
