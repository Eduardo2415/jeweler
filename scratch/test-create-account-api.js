import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN, VITE_N8N_WEBHOOK_URL } = process.env

const directusClient = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` },
  timeout: 15000,
})

const n8nUrl = VITE_N8N_WEBHOOK_URL || 'https://n8n.em-cloud.top/webhook'
const api = axios.create({
  baseURL: n8nUrl,
  timeout: 15000,
})

async function run() {
  try {
    console.log('🔌 Buscando sesión administrativa activa en Directus...')
    const sessionsRes = await directusClient.get('items/ji_sesiones_admin', {
      params: {
        filter: { estado_activo: { _eq: true } },
        limit: 1,
        sort: '-id'
      }
    })

    const session = sessionsRes.data?.data?.[0]
    if (!session) {
      console.error('❌ No se encontró ninguna sesión administrativa activa en Directus.')
      return
    }

    const token = session.admin_token
    console.log(`✅ Token encontrado: ${token.substring(0, 10)}... (ID sesión: ${session.id})`)

    const payload = {
      admin_token: token,
      banco: 'Banco Test',
      cuenta: 'Ahorros 111-22222-3',
      titular: 'Juan Pérez',
      tipo_cuenta: 'Ahorros',
      documento: '402-1234567-8',
      active: true,
    }

    console.log('⚙️ Enviando petición a n8n /create-bank-account...')
    const apiRes = await api.post('/create-bank-account', payload)

    console.log('\n--- RESPUESTA DE LA API ---')
    console.log('Status Code:', apiRes.status)
    console.log(JSON.stringify(apiRes.data, null, 2))
  } catch (error) {
    console.error('\n❌ Error al llamar a la API:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Data:', JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error.message)
    }
  }
}

run()
