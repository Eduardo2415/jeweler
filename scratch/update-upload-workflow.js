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

async function run() {
  try {
    console.log('🔌 Conectando con n8n...')
    const res = await client.get('api/v1/workflows', { params: { limit: 200 } })
    const workflows = res.data.data || res.data
    
    const targetName = '[JI] API - Upload Image'
    const target = workflows.find(w => w.name === targetName)
    
    if (!target) {
      console.error(`No se encontró el flujo "${targetName}" en n8n.`)
      return
    }
    
    console.log(`Found workflow "${targetName}" with ID: ${target.id}`)
    
    const localFile = path.resolve(__dirname, '../infra/n8n/upload-image.json')
    const localWorkflow = JSON.parse(fs.readFileSync(localFile, 'utf-8'))
    
    const payload = {
      name: targetName,
      nodes: localWorkflow.nodes,
      connections: localWorkflow.connections,
      settings: {
        executionOrder: 'v1'
      }
    }
    
    console.log(`Updating workflow "${targetName}"...`)
    const updateRes = await client.put(`api/v1/workflows/${target.id}`, payload)
    console.log('✅ Workflow updated successfully!')
    console.log(updateRes.data)
  } catch (error) {
    console.error('Error updating workflow:')
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error.message)
    }
  }
}

run()
