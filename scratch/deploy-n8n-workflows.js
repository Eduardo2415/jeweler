import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { N8N_API_URL, N8N_API_KEY } = process.env

const PREFIX = '[JI] '

const client = axios.create({
  baseURL: N8N_API_URL,
  headers: { 'X-N8N-API-KEY': N8N_API_KEY },
  timeout: 15000,
})

async function getExistingWorkflows() {
  const response = await client.get('api/v1/workflows', { params: { limit: 200 } })
  return response.data.data || response.data
}

async function deployWorkflows() {
  console.log('🔌 Conectando con n8n...')
  const existing = await getExistingWorkflows()
  const existingNames = existing.map((w) => w.name)

  console.log(`📋 Flujos existentes en n8n: ${existing.length}`)
  console.log()

  const workflowDir = path.resolve(__dirname, '../infra/n8n')
  const files = fs.readdirSync(workflowDir).filter((f) => f.endsWith('.json'))

  for (const file of files) {
    const filePath = path.join(workflowDir, file)
    const workflow = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    // Apply JI prefix to the workflow name
    const prefixedName = `${PREFIX}${workflow.name}`

    if (existingNames.includes(prefixedName)) {
      console.log(`   ℹ️  "${prefixedName}" ya existe en n8n. Saltando.`)
      continue
    }

    console.log(`   ➕ Subiendo flujo: "${prefixedName}"...`)

    try {
      // Build the payload in the format n8n API expects
      const payload = {
        name: prefixedName,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: {
          executionOrder: 'v1',
        },
      }

      const response = await client.post('api/v1/workflows', payload)
      const created = response.data

      console.log(`   ✅ "${prefixedName}" creado con ID: ${created.id}`)
    } catch (error) {
      console.error(`   ❌ Error al subir "${prefixedName}":`)
      if (error.response?.data) {
        console.error('   ', JSON.stringify(error.response.data, null, 2))
      } else {
        console.error('   ', error.message)
      }
    }
  }

  console.log()
  console.log('✨ Despliegue de flujos n8n finalizado.')
  console.log('⚠️  Activa manualmente los flujos en n8n desde la interfaz web.')
}

deployWorkflows().catch((e) => {
  console.error('Error fatal:', e.message)
  process.exit(1)
})
