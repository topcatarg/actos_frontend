import { http } from './http'
import type { ParteActo } from '@/types/actos'

export const actosApi = {
  partes: (acto: string) => http<ParteActo[]>(`/api/actos/${encodeURIComponent(acto)}/partes`),
}
