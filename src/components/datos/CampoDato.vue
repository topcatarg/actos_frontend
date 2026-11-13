<script setup lang="ts">
import { computed } from 'vue'
import type { DefCampo } from '@/comun/campos'
import type { Dato, Origen, Pendiente } from '@/types/comun'

const props = defineProps<{
  def: DefCampo
  dato: Dato | null | undefined
  pendiente?: Pendiente
}>()

const ORIGENES: Record<Origen, { texto: string; ayuda: string }> = {
  texto: { texto: 'Del pedido', ayuda: 'Está escrito en el pedido' },
  inferido: { texto: 'Inferido', ayuda: 'La IA lo dedujo del contexto: conviene confirmarlo' },
  respuesta: { texto: 'Respuesta', ayuda: 'Lo respondiste en el chat' },
  confirmado: { texto: 'Confirmado', ayuda: 'Lo confirmaste en el chat' },
  base: { texto: 'De la base', ayuda: 'Sale del registro de personas' },
  default: { texto: 'Por defecto', ayuda: 'Lo puso el sistema por regla' },
}

const valor = computed(() => {
  const v = props.dato?.valor?.trim()
  if (!v) return null
  return props.def.formato ? props.def.formato(v) : v
})

const origen = computed(() => (props.dato?.origen ? ORIGENES[props.dato.origen] : null))

const estado = computed(() => {
  const p = props.pendiente
  if (!p) return null
  if (p.tipo === 'inconsistente') return { texto: 'Revisar', clase: 'pend-inconsistente' }
  if (p.tipo === 'confirmar') return { texto: 'Confirmar', clase: 'pend-confirmar' }
  // Hay valor pero falta una parte (ej. el apellido)
  if (valor.value) return { texto: 'Incompleto', clase: 'pend-falta' }
  return { texto: 'Obligatorio', clase: 'pend-falta' }
})

const titulo = computed(() => {
  const partes = []
  if (props.dato?.fragmento) partes.push(`En el pedido: “${props.dato.fragmento}”`)
  if (origen.value) partes.push(origen.value.ayuda)
  return partes.join('\n') || undefined
})
</script>

<template>
  <div class="field" :class="{ half: def.mitad }">
    <div class="field-header">
      <div class="field-label">
        {{ def.etiqueta }} <span v-if="def.obligatorio" class="field-required">*</span>
      </div>
      <div class="datos-campo-estado">
        <span v-if="valor && origen && dato?.origen" class="datos-origen" :class="`origen-${dato.origen}`" :title="origen.ayuda">
          {{ origen.texto }}
        </span>
        <span v-if="estado" class="datos-chip" :class="estado.clase">{{ estado.texto }}</span>
        <div v-else-if="valor" class="field-check">✓</div>
        <span v-else-if="def.obligatorio" class="datos-chip pend-falta">Obligatorio</span>
      </div>
    </div>
    <div
      class="field-display"
      :class="{
        empty: !valor,
        'datos-confirmar': pendiente?.tipo === 'confirmar',
        'datos-inconsistente': pendiente?.tipo === 'inconsistente',
      }"
      :title="titulo"
    >
      {{ valor ?? 'Completar desde el chat' }}
    </div>
    <div v-if="pendiente?.detalle && (pendiente.tipo !== 'falta' || valor) && pendiente.detalle !== dato?.valor" class="datos-detalle">{{ pendiente.detalle }}</div>
  </div>
</template>
