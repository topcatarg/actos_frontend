// Reparto de los pendientes entre las pestañas (actos_partes), para cualquier acto.
// Se guía por el bloque de cada pestaña, no por su código: así sirve igual para un poder o una compraventa.
import type { DatosActo, EstadoDatos, Pendiente } from '@/types/comun'
import type { ParteActo } from '@/types/actos'

/** Datos con personas (cada una con su rol): el poder hoy, la compraventa mañana. */
type ConPersonas = DatosActo & { partes?: { rol: { valor: string | null } }[] }

const RE_PERSONA = /^partes\[(\d+)\]/
const RE_BLOQUE = /^bloques\.([a-z_]+)/
const RE_ROL = /^partes\.([a-z_]+)$/ // "falta el otorgante": partes.otorgante

/** A qué pestaña va un pendiente. Si el acto no tiene una pestaña para eso, va a la de revisión. */
export function parteDePendiente(p: Pendiente, datos: ConPersonas, partes: ParteActo[]): string {
  const porBloque = (bloque: string, rol?: string | null) =>
    (rol !== undefined ? partes.find((x) => x.bloque === bloque && x.rol === rol) : undefined) ??
    partes.find((x) => x.bloque === bloque)
  const revision = porBloque('revision')?.codigo ?? 'revision'

  const bloque = RE_BLOQUE.exec(p.campo) ?? RE_BLOQUE.exec(p.grupo)
  if (bloque) return porBloque(bloque[1]!)?.codigo ?? revision

  const persona = RE_PERSONA.exec(p.campo) ?? RE_PERSONA.exec(p.grupo)
  if (persona) return porBloque('persona', datos.partes?.[Number(persona[1])]?.rol.valor ?? null)?.codigo ?? revision

  const rol = RE_ROL.exec(p.campo)
  if (rol) return porBloque('persona', rol[1])?.codigo ?? revision

  if (p.grupo === 'facultades' || p.grupo === 'condiciones') return porBloque(p.grupo)?.codigo ?? revision
  return revision
}

/** Pendientes agrupados por código de pestaña. */
export function pendientesPorParte(estado: EstadoDatos, datos: ConPersonas, partes: ParteActo[]) {
  const mapa = new Map<string, Pendiente[]>(partes.map((p) => [p.codigo, []]))
  for (const p of estado.pendientes) {
    const destino = parteDePendiente(p, datos, partes)
    mapa.set(destino, [...(mapa.get(destino) ?? []), p])
  }
  return mapa
}

/** El pendiente de un campo puntual (ej. "partes[0].dni"), el más grave si hay varios. */
export function pendienteDe(pendientes: Pendiente[], campo: string): Pendiente | undefined {
  const gravedad = { inconsistente: 0, confirmar: 1, falta: 2 } as const
  return pendientes.filter((p) => p.campo === campo).sort((a, b) => gravedad[a.tipo] - gravedad[b.tipo])[0]
}
