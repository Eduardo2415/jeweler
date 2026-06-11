import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { N8N_API_URL, N8N_API_KEY } = process.env

if (!N8N_API_URL || !N8N_API_KEY) {
  console.error('Error: N8N_API_URL or N8N_API_KEY not set in .env')
  process.exit(1)
}

const client = axios.create({
  baseURL: N8N_API_URL,
  headers: { 'X-N8N-API-KEY': N8N_API_KEY },
  timeout: 15000,
})

const workflowsToUpdate = [
  {
    name: '[JI] API - Create Product',
    localFile: '../infra/n8n/create-product.json'
  },
  {
    name: '[JI] API - Update Product',
    localFile: '../infra/n8n/update-product.json'
  },
  {
    name: '[JI] API - Get Products',
    localFile: '../infra/n8n/get-products.json'
  }
]

async function run() {
  try {
    console.log('🔌 Conectando con la API de n8n...')
    const res = await client.get('api/v1/workflows', { params: { limit: 200 } })
    const workflows = res.data.data || res.data

    for (const item of workflowsToUpdate) {
      const target = workflows.find(w => w.name === item.name)
      if (!target) {
        console.error(`❌ No se encontró el flujo "${item.name}" en n8n.`)
        continue
      }

      console.log(`🔍 Encontrado flujo "${item.name}" con ID: ${target.id}`)
      const localFilePath = path.resolve(__dirname, item.localFile)
      const localWorkflow = JSON.parse(fs.readFileSync(localFilePath, 'utf-8'))

      const payload = {
        name: item.name,
        nodes: localWorkflow.nodes,
        connections: localWorkflow.connections,
        settings: {
          executionOrder: 'v1'
        }
      }

      console.log(`⚙️  Actualizando flujo "${item.name}"...`)
      await client.put(`api/v1/workflows/${target.id}`, payload)
      console.log(`✅ Flujo "${item.name}" actualizado con éxito.\n`)
    }
    console.log('🎉 Todos los flujos se han actualizado en producción.')
  } catch (error) {
    console.error('❌ Error actualizando flujos:')
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error.message)
    }
  }
}

run()
