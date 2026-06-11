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
    const res = await client.get('api/v1/executions', { params: { limit: 200 } })
    const executions = res.data.data || res.data
    
    if (executions.length === 0) {
      console.log('No executions found.')
      return
    }

    const latest = executions.find(e => e.workflowId === 'iEiLqkf6yY86RNgB')
    if (!latest) {
      console.log('No executions found for this workflow.')
      return
    }
    console.log(`🔎 Latest Execution ID: ${latest.id} | Workflow ID: ${latest.workflowId} | Status: ${latest.status}`)

    const detailRes = await client.get(`api/v1/executions/${latest.id}`, { params: { includeData: true } })
    const runData = detailRes.data.data?.resultData?.runData || {}

    console.log('\nNodes Executed:')
    for (const [nodeName, nodeExecs] of Object.entries(runData)) {
      const exec = nodeExecs[0]
      const hasError = exec?.error !== undefined
      console.log(`- ${nodeName}: ${hasError ? '❌ ERROR' : '✅ SUCCESS'}`)
      if (hasError) {
        console.log('  Error details:', JSON.stringify(exec.error, null, 2))
      } else if (exec?.data?.main?.[0]?.[0]?.json) {
        console.log('  Output sample:', JSON.stringify(exec.data.main[0][0].json, null, 2))
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

run()
