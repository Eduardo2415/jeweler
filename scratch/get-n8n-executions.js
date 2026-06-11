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

const workflowId = 'cYoxR2hcCNwQaeWZ' // Get Categories

async function getExecutions() {
  try {
    const res = await client.get('api/v1/executions/13175')
    console.log('Execution details status:', res.status)
    console.log(JSON.stringify(res.data, null, 2))
  } catch (error) {
    console.error('Error fetching executions:', error.response?.data || error.message)
  }
}

getExecutions()
