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
  '0BHHq9E3igQPisy6', // Create Category
  'XEeu530NptJWF5jj', // Delete Category
  'cYoxR2hcCNwQaeWZ', // Get Categories
  'VIMifXztB08ufpuq', // Update Category
]

async function checkStatus() {
  for (const id of workflowIds) {
    try {
      const res = await client.get(`api/v1/workflows/${id}`)
      console.log(`Workflow ${id} ("${res.data.name}"):`)
      console.log(`  Active: ${res.data.active}`)
      const webhookNode = res.data.nodes.find(n => n.type === 'n8n-nodes-base.webhook')
      if (webhookNode) {
        console.log(`  Path: ${webhookNode.parameters.path}`)
        console.log(`  Method: ${webhookNode.parameters.httpMethod || 'GET'}`)
      } else {
        console.log('  No Webhook node found!')
      }
      console.log()
    } catch (error) {
      console.error(`Error checking ${id}:`, error.response?.data || error.message)
    }
  }
}

checkStatus()
