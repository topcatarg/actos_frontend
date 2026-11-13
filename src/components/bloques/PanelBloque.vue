<script setup lang="ts">
// Vista genérica de un bloque de datos, para los bloques que no tienen un componente propio.
// Los campos salen de la definición del bloque en src/bloques; los datos, de datos.bloques[codigo].
import { computed } from 'vue'
import CampoDato from '@/components/datos/CampoDato.vue'
import SeccionDatos from '@/components/datos/SeccionDatos.vue'
import { pendienteDe } from '@/tramite/pendientes'
import type { PropsPanelBloque } from '@/bloques'

const props = defineProps<PropsPanelBloque>()

const descartado = computed(() => props.datos.bloquesDescartados?.includes(props.def.codigo))
const alcance = computed(() => pendienteDe(props.pendientes, `bloques.${props.def.codigo}.alcance`))

/** Siempre al menos una instancia (vacía) para mostrar qué falta. */
const instancias = computed(() => {
  const lista = props.datos.bloques?.[props.def.codigo] ?? []
  return lista.length ? lista : [{}]
})

function titulo(i: number) {
  return props.def.multiple && instancias.value.length > 1 ? `${props.def.nombre} ${i + 1}` : props.def.nombre
}

function completa(i: number) {
  return !props.pendientes.some((p) => p.campo.startsWith(`bloques.${props.def.codigo}[${i}].`))
}
</script>

<template>
  <div v-if="descartado" class="seccion expanded">
    <p class="datos-vacio">No aplica: se indicó que es en general, no para un {{ def.nombre.toLowerCase() }} específico.</p>
  </div>

  <div v-else-if="alcance" class="datos-pendientes">
    <div class="datos-pendientes-titulo">Primero hay que saber</div>
    <p class="datos-alcance">{{ alcance.detalle }}</p>
    <p class="datos-detalle">Respondelo en el chat.</p>
  </div>

  <template v-else>
    <SeccionDatos v-for="(instancia, i) in instancias" :key="i" :titulo="titulo(i)" :completo="completa(i)">
      <div class="fields-grid datos-grid">
        <CampoDato
          v-for="c in def.campos"
          :key="c.clave"
          :def="c"
          :dato="instancia[c.clave]"
          :pendiente="pendienteDe(pendientes, `bloques.${def.codigo}[${i}].${c.clave}`)"
        />
      </div>
    </SeccionDatos>
    <p v-if="def.multiple" class="datos-detalle datos-mas">Si hay otro, decímelo en el chat y lo agrego.</p>
  </template>
</template>

<style scoped>
.datos-alcance { font-size: 14px; color: #1e293b; margin-bottom: 4px; }
.datos-mas { text-align: center; margin-top: -4px; }
</style>
