<script setup lang="ts">
import { computed } from 'vue'
import CampoDato from './CampoDato.vue'
import SeccionDatos from './SeccionDatos.vue'
import { CAMPOS_PERSONA, personasDeRol, tieneValor } from '@/actos/poder'
import { capitalizar } from '@/comun/campos'
import { pendienteDe } from '@/tramite/pendientes'
import type { Pendiente, PersonaPoder, Poder } from '@/types/poder'

const props = defineProps<{
  datos: Poder
  /** Rol que muestra la pestaña (otorgante, apoderado, vendedor...). */
  rol: string | null
  /** La primera pestaña de personas también muestra a las que todavía no tienen rol. */
  incluirSinRol: boolean
  pendientes: Pendiente[]
}>()

const titulo = computed(() => capitalizar(props.rol ?? 'Persona'))

const personas = computed(() =>
  personasDeRol(props.datos, props.rol, props.incluirSinRol).map(({ persona, indice }) => {
    const ruta = `partes[${indice}]`
    const conValor = CAMPOS_PERSONA.filter((c) => tieneValor(persona[c.clave]))
    const faltantes = CAMPOS_PERSONA.filter((c) => c.obligatorio && !tieneValor(persona[c.clave]))
    const identidad = pendienteDe(props.pendientes, `${ruta}.identidad`)
    // "Datos completos" solo en verde si ninguno de esos datos tiene algo para confirmar o revisar
    const completosOk = conValor.every((c) => !pendienteDe(props.pendientes, `${ruta}.${c.clave}`))
    return { persona, indice, ruta, conValor, faltantes, identidad, completosOk }
  }),
)

const varias = computed(() => personas.value.length > 1)

function rolInferido(p: PersonaPoder) {
  return !p.rol.valor || p.rol.origen === 'inferido'
}
</script>

<template>
  <div v-if="!personas.length" class="seccion expanded">
    <p class="datos-vacio">Todavía no hay {{ titulo.toLowerCase() }} en el pedido.</p>
  </div>

  <div v-for="(x, n) in personas" :key="x.indice" class="datos-persona">
    <div class="datos-persona-header">
      <h3>{{ titulo }}{{ varias ? ` ${n + 1}` : '' }}<span v-if="x.persona.nombreCompleto.valor"> · {{ x.persona.nombreCompleto.valor }}</span></h3>
      <div class="datos-chips">
        <span v-if="rolInferido(x.persona)" class="datos-chip pend-confirmar" title="Confirmalo en el chat">Rol a confirmar</span>
        <span v-if="x.persona.pfId" class="datos-chip origen-base" title="Identificado en el registro de personas">En la base</span>
        <span v-else-if="x.persona.personaNueva" class="datos-chip origen-respuesta">Persona nueva</span>
      </div>
    </div>

    <!-- Hay homónimos en la base: primero hay que decir quién es -->
    <SeccionDatos v-if="x.identidad && x.persona.candidatos.length" titulo="¿Quién es?">
      <p class="datos-detalle">Encontré estas personas en la base. Decime en el chat cuál es, o si es una persona nueva.</p>
      <ul class="datos-candidatos">
        <li v-for="c in x.persona.candidatos" :key="c.pfId">
          <strong>{{ c.nombreCompleto }}</strong>
          <span>DNI {{ c.dni ?? 'sin DNI' }}</span>
        </li>
      </ul>
    </SeccionDatos>

    <SeccionDatos v-if="x.conValor.length" titulo="Datos completos" :completo="x.completosOk">
      <div class="fields-grid datos-grid">
        <CampoDato
          v-for="c in x.conValor"
          :key="c.clave"
          :def="c"
          :dato="x.persona[c.clave]"
          :pendiente="pendienteDe(pendientes, `${x.ruta}.${c.clave}`)"
        />
      </div>
    </SeccionDatos>

    <SeccionDatos v-if="x.faltantes.length" titulo="Datos faltantes">
      <div class="fields-grid datos-grid">
        <CampoDato
          v-for="c in x.faltantes"
          :key="c.clave"
          :def="c"
          :dato="x.persona[c.clave]"
          :pendiente="pendienteDe(pendientes, `${x.ruta}.${c.clave}`)"
        />
      </div>
    </SeccionDatos>
  </div>
</template>
