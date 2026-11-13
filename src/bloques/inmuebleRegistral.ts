import { defineAsyncComponent } from 'vue'
import { capitalizar } from '@/comun/campos'
import type { DefBloque } from './tipos'

/**
 * Inmueble con sus datos registrales completos: para escriturar (ej. una compraventa).
 * Es otro bloque (otro código), con su propia definición acá y en el back. Comparte el panel
 * con el inmueble básico porque se ve igual; si necesita algo propio, se le hace su componente.
 */
export const inmuebleRegistral: DefBloque = {
  codigo: 'inmueble_registral',
  nombre: 'Inmueble',
  multiple: false,
  campos: [
    { clave: 'direccion', etiqueta: 'Dirección', obligatorio: true },
    { clave: 'localidad', etiqueta: 'Localidad', obligatorio: true, mitad: true },
    { clave: 'provincia', etiqueta: 'Provincia', obligatorio: true, mitad: true },
    { clave: 'tipo', etiqueta: 'Tipo', obligatorio: true, mitad: true, formato: capitalizar },
    { clave: 'superficie', etiqueta: 'Superficie', obligatorio: true, mitad: true },
    { clave: 'matricula', etiqueta: 'Matrícula', obligatorio: true, mitad: true },
    { clave: 'partida', etiqueta: 'Partida inmobiliaria', obligatorio: false, mitad: true },
    { clave: 'nomenclatura', etiqueta: 'Nomenclatura catastral', obligatorio: true },
  ],
  componente: defineAsyncComponent(() => import('@/components/bloques/PanelInmueble.vue')),
}
