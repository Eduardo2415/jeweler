import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { N8N_API_URL, N8N_API_KEY } = process.env

const client = axios.create({
  baseURL: N8N_API_URL,
  headers: { 'X-N8N-API-KEY': N8N_API_KEY },
  timeout: 15000,
})

async function run() {
  try {
    console.log('🔌 Conectando a n8n para listar ejecuciones...')
    // Get last 20 executions
    const res = await client.get('api/v1/executions', { params: { limit: 20 } })
    const executions = res.data.data || res.data

    console.log(`📥 Se obtuvieron ${executions.length} ejecuciones.\n`)

    const failed = executions.filter(e => e.status !== 'success')
    if (failed.length === 0) {
      console.log('✅ No se encontraron ejecuciones fallidas en las últimas 20.')
      console.log('Aquí están las últimas ejecuciones:')
      executions.forEach(e => console.log(`ID: ${e.id} | Status: ${e.status} | Finished: ${e.finished} | WorkflowID: ${e.workflowId}`))
      return
    }

    console.log(`❌ Se encontraron ${failed.length} ejecuciones fallidas. Mostrando detalles de la última:`)
    const latestFailed = failed[0]
    console.log(`ID: ${latestFailed.id} | WorkflowID: ${latestFailed.workflowId} | Status: ${latestFailed.status}`)

    const detailRes = await client.get(`api/v1/executions/${latestFailed.id}`, { params: { includeData: true } })
    console.log('\n--- DETALLES DE LA EJECUCIÓN ---')
    console.log(JSON.stringify(detailRes.data, null, 2))
  } catch (error) {
    console.error('❌ Error al obtener ejecuciones:', error.response?.data || error.message)
  }
}

run()
