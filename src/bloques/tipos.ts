import type { Component } from 'vue'
import type { DefCampo } from '@/comun/campos'

/**
 * Un bloque de datos visto desde el front. El back tiene su propia definición del mismo bloque
 * (actos_backend/Bloques); lo común es el código y las claves de los campos.
 */
export interface DefBloque {
  /** Referencia común con el back y con actos_partes.bloque. */
  codigo: string
  /** Para títulos: "Vehículo", "Inmueble". */
  nombre: string
  /** Si puede haber varios (ej. vehículos). */
  multiple: boolean
  campos: DefCampo[]
  /**
   * Componente propio del bloque. Si no tiene, se usa el genérico (PanelBloque).
   * Recibe las props de PropsPanelBloque.
   */
  componente?: Component
}

/** Props que recibe cualquier panel de bloque (el genérico o uno propio). */
export interface PropsPanelBloque {
  def: DefBloque
  datos: import('@/types/comun').DatosActo
  pendientes: import('@/types/comun').Pendiente[]
}
