import type { DefBloque } from './tipos'

export const vehiculo: DefBloque = {
  codigo: 'vehiculo',
  nombre: 'Vehículo',
  multiple: true,
  campos: [
    { clave: 'dominio', etiqueta: 'Dominio', obligatorio: true, mitad: true },
    { clave: 'anio', etiqueta: 'Año', obligatorio: true, mitad: true },
    { clave: 'marca', etiqueta: 'Marca', obligatorio: true, mitad: true },
    { clave: 'modelo', etiqueta: 'Modelo', obligatorio: true, mitad: true },
    { clave: 'motor', etiqueta: 'N° de motor', obligatorio: false, mitad: true },
    { clave: 'chasis', etiqueta: 'N° de chasis', obligatorio: false, mitad: true },
  ],
}
