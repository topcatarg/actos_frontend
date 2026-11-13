import { capitalizar } from '@/comun/campos'
import type { DefBloque } from './tipos'

export const expediente: DefBloque = {
  codigo: 'expediente',
  nombre: 'Expediente',
  multiple: false,
  campos: [
    { clave: 'numero', etiqueta: 'N° de expediente', obligatorio: true, mitad: true },
    { clave: 'fuero', etiqueta: 'Fuero', obligatorio: true, mitad: true, formato: capitalizar },
    { clave: 'juzgado', etiqueta: 'Juzgado', obligatorio: true },
    { clave: 'caratula', etiqueta: 'Carátula', obligatorio: false },
    { clave: 'jurisdiccion', etiqueta: 'Jurisdicción', obligatorio: false },
  ],
}
