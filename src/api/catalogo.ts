import { http } from './http'
import type { Clausula } from '@/types/catalogo'

export const catalogoApi = {
  /** Facultades y condiciones del acto (cada acto tiene su catálogo). */
  clausulas: (acto: string) => http<Clausula[]>(`/api/catalogo/clausulas?acto=${encodeURIComponent(acto)}`),
}
