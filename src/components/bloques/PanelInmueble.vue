<script setup lang="ts">
// Panel propio de los inmuebles (inmueble e inmueble_registral): separa la ubicación de los datos
// registrales. Qué campos hay y cuáles son obligatorios lo dice la definición de cada bloque (prop def).
import { computed } from 'vue'
import CampoDato from '@/components/datos/CampoDato.vue'
import SeccionDatos from '@/components/datos/SeccionDatos.vue'
import { pendienteDe } from '@/tramite/pendientes'
import type { PropsPanelBloque } from '@/bloques'

const props = defineProps<PropsPanelBloque>()

const UBICACION = ['direccion', 'localidad', 'provincia']

const instancia = computed(() => props.datos.bloques?.[props.def.codigo]?.[0] ?? {})

const secciones = computed(() => [
  { titulo: 'Ubicación', campos: props.def.campos.filter((c) => UBICACION.includes(c.clave)) },
  { titulo: 'Datos del inmueble', campos: props.def.campos.filter((c) => !UBICACION.includes(c.clave)) },
].filter((s) => s.campos.length))

const ruta = (clave: string) => `bloques.${props.def.codigo}[0].${clave}`

function completa(claves: string[]) {
  return !props.pendientes.some((p) => claves.some((c) => p.campo === ruta(c)))
}

const descartado = computed(() => props.datos.bloquesDescartados?.includes(props.def.codigo))
</script>

<template>
  <div v-if="descartado" class="seccion expanded">
    <p class="datos-vacio">No aplica para este trámite.</p>
  </div>

  <SeccionDatos
    v-for="s in secciones"
    v-else
    :key="s.titulo"
    :titulo="s.titulo"
    :completo="completa(s.campos.map((c) => c.clave))"
  >
    <div class="fields-grid datos-grid">
      <CampoDato
        v-for="c in s.campos"
        :key="c.clave"
        :def="c"
        :dato="instancia[c.clave]"
        :pendiente="pendienteDe(pendientes, ruta(c.clave))"
      />
    </div>
  </SeccionDatos>
</template>
