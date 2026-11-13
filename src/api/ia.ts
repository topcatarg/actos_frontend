import { http } from './http'
import type { EstadoModelos, PruebaConexion } from '@/types/ia'

export const iaApi = {
  modelos: () => http<EstadoModelos>('/api/ia/modelos'),

  seleccionar: (modelo: string) =>
    http<EstadoModelos>('/api/ia/modelo', { method: 'PUT', body: JSON.stringify({ modelo }) }),

  /** Sin modelo: prueba el que está en uso. */
  probar: (modelo?: string) =>
    http<PruebaConexion>('/api/ia/conexion', { method: 'POST', body: JSON.stringify({ modelo }) }),

  pruebas: (cantidad = 10) => http<PruebaConexion[]>(`/api/ia/conexion?cantidad=${cantidad}`),
}
