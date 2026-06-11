import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })
const { N8N_API_URL, N8N_API_KEY } = process.env
const client = axios.create({ baseURL: N8N_API_URL, headers: { 'X-N8N-API-KEY': N8N_API_KEY } })
client.get('api/v1/workflows', { params: { limit: 200 } }).then(r => {
  const jiFlows = (r.data.data || r.data).filter(w => w.name.startsWith('[JI]'))
  for (const flow of jiFlows) {
    const webhookNode = flow.nodes?.find(n => n.type === 'n8n-nodes-base.webhook')
    if (webhookNode) {
      const wPath = webhookNode.parameters?.path
      console.log(flow.name, '->', 'https://n8n.em-cloud.top/webhook/' + wPath)
    }
  }
}).catch(e => console.error(e.message))
