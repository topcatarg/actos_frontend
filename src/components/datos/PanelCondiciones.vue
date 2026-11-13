<script setup lang="ts">
import { computed } from 'vue'
import CampoDato from './CampoDato.vue'
import SeccionDatos from './SeccionDatos.vue'
import { useClausulas } from '@/queries/catalogo'
import { formatoFecha, pendienteDe, type DefCampo } from '@/actos/poder'
import type { Pendiente, Poder } from '@/types/poder'

const props = defineProps<{ poder: Poder; pendientes: Pendiente[] }>()

const clausulas = useClausulas()
const nombre = (v: string) => clausulas.nombre(v)

const campos = computed(() => {
  const lista: { campo: 'sustitucion' | 'vigencia' | 'fechaVigencia' | 'revocabilidad'; def: DefCampo }[] = [
    { campo: 'sustitucion', def: { clave: 'sustitucion', etiqueta: 'Sustitución', obligatorio: true, formato: nombre } },
    { campo: 'vigencia', def: { clave: 'vigencia', etiqueta: 'Vigencia', obligatorio: true, formato: nombre } },
  ]
  if (props.poder.vigencia.valor === 'vigencia_fecha')
    lista.push({ campo: 'fechaVigencia', def: { clave: 'fechaVigencia', etiqueta: 'Vigente hasta', obligatorio: true, formato: formatoFecha } })
  lista.push({ campo: 'revocabilidad', def: { clave: 'revocabilidad', etiqueta: 'Revocabilidad', obligatorio: true, formato: nombre } })
  return lista
})
</script>

<template>
  <SeccionDatos titulo="Condiciones del poder" :completo="!pendientes.length">
    <div class="fields-grid datos-grid">
      <CampoDato
        v-for="c in campos"
        :key="c.campo"
        :def="c.def"
        :dato="poder[c.campo]"
        :pendiente="pendienteDe(pendientes, c.campo)"
      />
    </div>
  </SeccionDatos>
</template>
