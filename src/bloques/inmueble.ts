import { defineAsyncComponent } from 'vue'
import { capitalizar } from '@/comun/campos'
import type { DefBloque } from './tipos'

/** Inmueble básico: lo mínimo para identificarlo (ej. un poder para vender). */
export const inmueble: DefBloque = {
  codigo: 'inmueble',
  nombre: 'Inmueble',
  multiple: false,
  campos: [
    { clave: 'direccion', etiqueta: 'Dirección', obligatorio: true },
    { clave: 'localidad', etiqueta: 'Localidad', obligatorio: true, mitad: true },
    { clave: 'provincia', etiqueta: 'Provincia', obligatorio: true, mitad: true },
    { clave: 'tipo', etiqueta: 'Tipo', obligatorio: false, mitad: true, formato: capitalizar },
    { clave: 'superficie', etiqueta: 'Superficie', obligatorio: false, mitad: true },
    { clave: 'matricula', etiqueta: 'Matrícula', obligatorio: false, mitad: true },
    { clave: 'nomenclatura', etiqueta: 'Nomenclatura catastral', obligatorio: false },
  ],
  componente: defineAsyncComponent(() => import('@/components/bloques/PanelInmueble.vue')),
}
