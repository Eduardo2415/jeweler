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
    name: '[JI] API - Update Settings',
    localFile: '../infra/n8n/update-settings.json'
  },
  {
    name: '[JI] API - Get Banners',
    localFile: '../infra/n8n/get-banners.json'
  },
  {
    name: '[JI] API - Get Bank Accounts',
    localFile: '../infra/n8n/get-bank-accounts.json'
  },
  {
    name: '[JI] API - Create Bank Account',
    localFile: '../infra/n8n/create-bank-account.json'
  },
  {
    name: '[JI] API - Update Bank Account',
    localFile: '../infra/n8n/update-bank-account.json'
  }
]

const workflowsToActivate = [
  '[JI] API - Update Settings',
  '[JI] API - Get Banners',
  '[JI] API - Get Bank Accounts',
  '[JI] API - Create Bank Account',
  '[JI] API - Update Bank Account',
  '[JI] API - Delete Bank Account'
]

async function run() {
  try {
    console.log('🔌 Conectando con la API de n8n para actualizar/activar flujos...')
    const res = await client.get('api/v1/workflows', { params: { limit: 200 } })
    const workflows = res.data.data || res.data

    // 1. Update existing workflows
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

    // 2. Activate all relevant workflows
    console.log('⚡ Activando flujos en producción...')
    const updatedRes = await client.get('api/v1/workflows', { params: { limit: 200 } })
    const updatedWorkflows = updatedRes.data.data || updatedRes.data

    for (const name of workflowsToActivate) {
      const target = updatedWorkflows.find(w => w.name === name)
      if (!target) {
        console.error(`❌ No se encontró el flujo "${name}" para activar.`)
        continue
      }

      try {
        console.log(`🔌 Activando flujo "${name}" (${target.id})...`)
        await client.post(`api/v1/workflows/${target.id}/activate`, {})
        console.log(`✅ Flujo "${name}" activado con éxito.\n`)
      } catch (activationError) {
        console.error(`❌ Error al activar flujo "${name}":`, activationError.response?.data || activationError.message)
      }
    }

    console.log('🎉 Despliegue y activación de flujos de configuración/cuentas completado.')
  } catch (error) {
    console.error('❌ Error general durante el despliegue:')
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error.message)
    }
  }
}

run()
