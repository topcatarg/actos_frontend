// Contratos de /api/ia (configuración de IA desde el front)

/** Fila de la tabla ia_modelos. */
export interface IaModelo {
  modelo: string // id que se manda al proveedor, ej. 'gemini-3.5-flash-lite'
  nombre: string
  descripcion: string
  nivelRazonamiento: string | null
  activo: boolean
  enUso: boolean
}

/** GET /api/ia/modelos y PUT /api/ia/modelo */
export interface EstadoModelos {
  enUso: string
  /** El de appsettings: se usa si la tabla no tiene ninguno en uso. */
  porDefecto: string
  modelos: IaModelo[]
}

/** Resultado de una prueba de conexión (POST y GET /api/ia/conexion). */
export interface PruebaConexion {
  id: number
  fecha: string
  modelo: string
  ok: boolean
  duracionMs: number
  statusProveedor: number | null
  respuesta: string | null
  error: string | null
  detalle: string | null
}
