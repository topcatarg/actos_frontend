<script setup lang="ts">
import { computed } from 'vue'
import SeccionDatos from './SeccionDatos.vue'
import { useClausulas } from '@/queries/catalogo'
import { humanizar } from '@/comun/campos'
import type { Origen, Pendiente, Poder } from '@/types/poder'

const props = defineProps<{ datos: Poder; pendientes: Pendiente[] }>()

const clausulas = useClausulas()

const ORIGEN_TEXTO: Record<Origen, string> = {
  texto: 'Del pedido', inferido: 'Inferido', respuesta: 'Respuesta',
  confirmado: 'Confirmado', base: 'De la base', default: 'Por defecto',
}

const seleccionadas = computed(() => new Map(props.datos.facultades.filter((f) => f.valor).map((f) => [f.valor!, f])))

/** Las del catálogo que aplican al tipo de poder (y las elegidas aunque no apliquen), agrupadas por categoría. */
const grupos = computed(() => {
  const tipo = props.datos.tipoPoder.valor
  const facultades = (clausulas.data.value ?? []).filter(
    (c) => c.tipo === 'facultad' && (!tipo || c.aplicableA.includes(tipo) || seleccionadas.value.has(c.codigo)),
  )

  // Elegidas que no están en el catálogo (no debería pasar, pero que no se pierdan)
  const conocidas = new Set(facultades.map((f) => f.codigo))
  const extra = [...seleccionadas.value.keys()].filter((c) => !conocidas.has(c))

  const porCategoria = new Map<string, { codigo: string; nombre: string }[]>()
  for (const f of facultades) porCategoria.set(f.categoria, [...(porCategoria.get(f.categoria) ?? []), f])
  if (extra.length) porCategoria.set('otras', extra.map((codigo) => ({ codigo, nombre: codigo })))
  return [...porCategoria.entries()]
})

const total = computed(() => grupos.value.reduce((n, [, fs]) => n + fs.length, 0))
const avisos = computed(() => props.pendientes.filter((p) => p.campo === 'facultades'))
</script>

<template>
  <SeccionDatos :titulo="`Facultades (${seleccionadas.size}/${total})`" :completo="seleccionadas.size > 0 && !avisos.length">
    <p v-if="clausulas.isLoading.value" class="datos-detalle">Cargando catálogo…</p>
    <p v-else-if="!grupos.length" class="datos-vacio">Todavía no hay facultades.</p>

    <div v-for="[categoria, facultades] in grupos" :key="categoria" class="datos-categoria">
      <div class="field-label datos-categoria-titulo">{{ humanizar(categoria) }}</div>
      <div
        v-for="f in facultades"
        :key="f.codigo"
        class="datos-facultad"
        :class="{ elegida: seleccionadas.has(f.codigo) }"
        :title="seleccionadas.get(f.codigo)?.fragmento ? `En el pedido: “${seleccionadas.get(f.codigo)!.fragmento}”` : undefined"
      >
        <span class="datos-tilde">{{ seleccionadas.has(f.codigo) ? '✓' : '' }}</span>
        <span class="datos-facultad-nombre">{{ f.nombre }}</span>
        <span
          v-if="seleccionadas.get(f.codigo)?.origen"
          class="datos-origen"
          :class="`origen-${seleccionadas.get(f.codigo)!.origen}`"
        >{{ ORIGEN_TEXTO[seleccionadas.get(f.codigo)!.origen!] }}</span>
      </div>
    </div>
  </SeccionDatos>
</template>
