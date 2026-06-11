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
  console.error('Missing N8N credentials in .env')
  process.exit(1)
}

const n8nClient = axios.create({
  baseURL: N8N_API_URL,
  headers: { 'X-N8N-API-KEY': N8N_API_KEY, 'Content-Type': 'application/json' },
  timeout: 15000
})

async function run() {
  try {
    const res = await n8nClient.get('api/v1/workflows', { params: { limit: 250 } })
    const existingWorkflows = res.data.data || res.data

    const PREFIX = '[JI] '
    const workflowDir = path.resolve(__dirname, '../infra/n8n')
    const files = fs.readdirSync(workflowDir).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const filePath = path.join(workflowDir, file)
      const workflow = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const prefixedName = `${PREFIX}${workflow.name}`

      const found = existingWorkflows.find(w => w.name === prefixedName)

      if (found) {
        console.log(`Updating workflow: ${prefixedName} (ID: ${found.id})...`)
        const payload = {
          name: prefixedName,
          nodes: workflow.nodes,
          connections: workflow.connections,
          settings: { executionOrder: 'v1' }
        }
        await n8nClient.put(`api/v1/workflows/${found.id}`, payload)
        console.log(`✅ ${prefixedName} updated successfully.`)
      } else {
        console.log(`ℹ️ ${prefixedName} does not exist yet. You can run deploy-infra.js to create it.`)
      }
    }

    console.log('Update complete!')
  } catch (error) {
    console.error('Error updating workflows:', error.response?.data || error.message)
  }
}

run()
