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
    const res = await client.get('api/v1/executions', { params: { limit: 10 } })
    const executions = res.data.data || res.data
    const executionId = '13765'
    const detailRes = await client.get(`api/v1/executions/${executionId}`, { params: { includeData: true } })
    const runData = detailRes.data.data?.resultData?.runData || {}

    console.log(`Execution ID: ${executionId} | Workflow ID: ${detailRes.data.workflowId}`)
    console.log('\nNodes Executed:')

    for (const [nodeName, nodeExecs] of Object.entries(runData)) {
      const exec = nodeExecs[0]
      const hasError = exec?.error !== undefined
      console.log(`- ${nodeName}: ${hasError ? '❌ ERROR' : '✅ SUCCESS'}`)
      if (hasError) {
        console.log('  Error details:', JSON.stringify(exec.error, null, 2))
      }
    }
  } catch (error) {
    console.error('Error:', error.message)
  }
}

run()
