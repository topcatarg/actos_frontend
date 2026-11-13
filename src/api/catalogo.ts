import { http } from './http'
import type { Clausula } from '@/types/catalogo'

export const catalogoApi = {
  clausulas: () => http<Clausula[]>('/api/catalogo/clausulas'),
}
