import { capitalizar } from '@/comun/campos'
import type { DefBloque } from './tipos'

export const cuentaBancaria: DefBloque = {
  codigo: 'cuenta_bancaria',
  nombre: 'Cuenta bancaria',
  multiple: true,
  campos: [
    { clave: 'banco', etiqueta: 'Banco', obligatorio: true },
    { clave: 'tipoCuenta', etiqueta: 'Tipo de cuenta', obligatorio: false, mitad: true, formato: capitalizar },
    { clave: 'numeroCuenta', etiqueta: 'N° de cuenta', obligatorio: false, mitad: true },
    { clave: 'cbu', etiqueta: 'CBU', obligatorio: false },
  ],
}
