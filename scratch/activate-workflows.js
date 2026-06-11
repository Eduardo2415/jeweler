import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
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
  headers: { 'X-N8N-API-KEY': N8N_API_KEY },
  timeout: 15000
})

async function run() {
  try {
    const res = await n8nClient.get('api/v1/workflows', { params: { limit: 250 } })
    const workflows = res.data.data || res.data
    const targets = [
      '[JI] API - Create Order',
      '[JI] API - Get Orders',
      '[JI] API - Update Order'
    ]

    for (const w of workflows) {
      if (targets.includes(w.name)) {
        if (!w.active) {
          console.log(`Activating workflow: ${w.name} (ID: ${w.id})...`)
          await n8nClient.post(`api/v1/workflows/${w.id}/activate`, {}, {
            headers: { 'Content-Type': 'application/json' }
          })
          console.log(`✅ ${w.name} activated.`)
        } else {
          console.log(`ℹ️ ${w.name} is already active.`)
        }
      }
    }
    console.log('Done!')
  } catch (error) {
    console.error('Error activating workflows:', error.response?.data || error.message)
  }
}

run()
