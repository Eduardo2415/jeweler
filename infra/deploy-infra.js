import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

// Setup path helpers for ES Modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const {
  DIRECTUS_URL,
  DIRECTUS_ADMIN_TOKEN,
  N8N_API_URL,
  N8N_API_KEY
} = process.env

console.log('💎 [JUAN INVERSIONES] - Inicializando despliegue de infraestructura backend...\n')

async function deployDirectus() {
  console.log('⚙️  [Directus] Iniciando sincronización de colecciones...')
  if (!DIRECTUS_URL || !DIRECTUS_ADMIN_TOKEN) {
    console.warn('⚠️  Directus URL o Token no configurados en el archivo .env.')
    return
  }

  const client = axios.create({
    baseURL: DIRECTUS_URL,
    headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` },
    timeout: 10000
  })

  try {
    console.log(`🔌 Conectando con Directus en: ${DIRECTUS_URL}...`)
    await client.get('server/info')
    console.log('✅ Conexión con Directus exitosa.\n')

    // Read files from infra/directus/
    const schemaDir = path.resolve(__dirname, 'directus')
    const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const filePath = path.join(schemaDir, file)
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const { collection, meta, fields } = content

      console.log(`📦 Procesando colección: ${collection}...`)

      // 1. Get list of collections to check if it exists
      const collectionsRes = await client.get('collections')
      const existingCollections = collectionsRes.data.data.map(c => c.collection)

      if (!existingCollections.includes(collection)) {
        console.log(`   ➕ Creando colección ${collection}...`)
        await client.post('collections', {
          collection,
          meta,
          schema: {}
        })
        console.log(`   ✅ Colección ${collection} creada.`)
      } else {
        console.log(`   ℹ️  La colección ${collection} ya existe.`)
      }

      // 2. Get existing fields in the collection
      const fieldsRes = await client.get(`fields/${collection}`)
      const existingFields = fieldsRes.data.data.map(f => f.field)

      // 3. Create missing fields
      for (const fieldDef of fields) {
        if (!existingFields.includes(fieldDef.field)) {
          console.log(`   ➕ Creando campo [${fieldDef.field}] (${fieldDef.type})...`)
          await client.post(`fields/${collection}`, {
            field: fieldDef.field,
            type: fieldDef.type,
            meta: fieldDef.meta,
            schema: fieldDef.schema
          })
          console.log(`   ✅ Campo [${fieldDef.field}] creado.`)
        } else {
          console.log(`   ℹ️  El campo [${fieldDef.field}] ya existe.`)
        }
      }
      console.log(`   🎉 Sincronización de ${collection} completa.\n`)
    }
  } catch (error) {
    console.error('❌ Error en sincronización con Directus:')
    if (error.response) {
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error.message)
    }
    console.log('   Verifica que Directus esté levantado y que el token sea correcto.\n')
  }
}

async function deployN8N() {
  console.log('⚙️  [n8n] Iniciando sincronización de flujos...')
  if (!N8N_API_URL || !N8N_API_KEY) {
    console.warn('⚠️  n8n API URL o API Key no configuradas en el archivo .env.')
    return
  }

  const PREFIX = '[JI] '

  const n8nClient = axios.create({
    baseURL: N8N_API_URL,
    headers: { 'X-N8N-API-KEY': N8N_API_KEY },
    timeout: 15000
  })

  try {
    console.log(`🔌 Conectando con la API de n8n en: ${N8N_API_URL}...`)

    // 1. Get existing workflows to check for duplicates
    const existingRes = await n8nClient.get('api/v1/workflows', { params: { limit: 200 } })
    const existingWorkflows = existingRes.data.data || existingRes.data
    const existingNames = existingWorkflows.map(w => w.name)
    console.log(`✅ Conexión con n8n exitosa. Flujos existentes: ${existingWorkflows.length}\n`)

    // 2. Read workflow files from infra/n8n/
    const workflowDir = path.resolve(__dirname, 'n8n')
    const files = fs.readdirSync(workflowDir).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const filePath = path.join(workflowDir, file)
      const workflow = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      const prefixedName = `${PREFIX}${workflow.name}`

      console.log(`📦 Procesando flujo: ${prefixedName}...`)

      if (existingNames.includes(prefixedName)) {
        console.log(`   ℹ️  "${prefixedName}" ya existe en n8n. Saltando.\n`)
        continue
      }

      // 3. Upload workflow
      const payload = {
        name: prefixedName,
        nodes: workflow.nodes,
        connections: workflow.connections,
        settings: { executionOrder: 'v1' }
      }

      const response = await n8nClient.post('api/v1/workflows', payload)
      console.log(`   ✅ "${prefixedName}" creado con ID: ${response.data.id}`)
      console.log(`   ⚠️  Actívalo manualmente en n8n para ponerlo en producción.\n`)
    }
  } catch (error) {
    console.error('❌ Error en sincronización con n8n:')
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error.message)
    }
    console.log('   Verifica que n8n esté ejecutándose y que la API Key sea válida.\n')
  }
}

async function run() {
  await deployDirectus()
  await deployN8N()
  console.log('✨ [JUAN INVERSIONES] Sincronización inicial de infraestructura finalizada.')
}

run()
