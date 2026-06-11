import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN } = process.env

const client = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` },
  timeout: 15000,
})

async function deleteFields() {
  try {
    console.log('🗑️ Eliminando campo "cbu" de la colección ji_cuentas_bancarias...')
    await client.delete('fields/ji_cuentas_bancarias/cbu')
    console.log('✅ Campo "cbu" eliminado.')

    console.log('🗑️ Eliminando campo "cuit" de la colección ji_cuentas_bancarias...')
    await client.delete('fields/ji_cuentas_bancarias/cuit')
    console.log('✅ Campo "cuit" eliminado.')

    console.log('🎉 Campos obsoletos eliminados correctamente de Directus.')
  } catch (error) {
    console.error('❌ Error al eliminar campos de Directus:', error.response?.data || error.message)
  }
}

deleteFields()
