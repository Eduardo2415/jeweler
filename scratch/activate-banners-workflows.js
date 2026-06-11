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

const workflowIds = [
  'LyLcJVUNho98M30a', // Create Banner
  'mkebFgYJJqQFAPra', // Delete Banner
  'o4kFwTOnHCIWD4eL', // Get Banners
  'K7R43xjNjtkDfscZ', // Update Banner
  'L3cLwSRh4xpDXu6j', // Update Settings
]

async function activateAll() {
  for (const id of workflowIds) {
    try {
      console.log(`Activating workflow ${id}...`)
      await client.post(`api/v1/workflows/${id}/activate`, {})
      console.log(`✅ Workflow ${id} activated!`)
    } catch (error) {
      console.error(`❌ Error activating ${id}:`, error.response?.data || error.message)
    }
  }
}

activateAll()
