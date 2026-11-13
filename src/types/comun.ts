// Tipos comunes a todos los actos (espejo de actos_backend/Comun).

/** De dónde salió un dato. */
export type Origen = 'texto' | 'inferido' | 'respuesta' | 'confirmado' | 'base' | 'default'

export interface Dato {
  valor: string | null
  /** Pedazo literal del texto de donde salió. */
  fragmento: string | null
  inicio: number | null
  origen: Origen | null
}

export type TipoPendiente = 'inconsistente' | 'confirmar' | 'falta'

export interface Pendiente {
  tipo: TipoPendiente
  /** partes[i] | roles | estructura | facultades | condiciones | bloques.{codigo} | generar */
  grupo: string
  /** Ruta del dato: partes[1].dni, sustitucion, bloques.vehiculo[0].dominio, bloques.cuenta_bancaria.alcance... */
  campo: string
  etiqueta: string
  detalle: string | null
}

/** Estado de validación de un trámite (cualquier acto). */
export interface EstadoDatos {
  pendientes: Pendiente[]
  /** Lo que el asistente está preguntando ahora. */
  siguiente: Pendiente[]
  puedeGuardarBorrador: boolean
  listoParaGenerar: boolean
  generarDocumento: boolean
}

/** Una instancia de un bloque: clave del campo → dato. */
export type InstanciaBloque = Record<string, Dato>

/** Lo común a los datos de cualquier acto (espejo de DatosActo). */
export interface DatosActo {
  /** Datos de los bloques (inmueble, vehiculo...), por código de bloque. */
  bloques: Record<string, InstanciaBloque[]>
  /** Pestañas (códigos de actos_partes) que aplican a este trámite. */
  partesActivas: string[]
  bloquesActivos: string[]
  /** Bloques con pregunta de alcance a los que se respondió "es algo específico". */
  bloquesConfirmados: string[]
  /** Bloques con pregunta de alcance a los que se respondió "no aplica / en general". */
  bloquesDescartados: string[]
  generacionConfirmada: boolean
}
