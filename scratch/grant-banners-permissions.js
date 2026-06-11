import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN } = process.env

const client = axios.create({
  baseURL: DIRECTUS_URL,
  headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` },
  timeout: 15000,
})

const policyId = 'c901617a-7895-4147-85cb-16105dfa3dae' // Permisos_N8N

const newPermissions = [
  // Banners
  {
    collection: 'ji_banners',
    action: 'read',
    fields: ['*'],
    policy: policyId,
  },
  {
    collection: 'ji_banners',
    action: 'create',
    fields: ['*'],
    policy: policyId,
  },
  {
    collection: 'ji_banners',
    action: 'update',
    fields: ['*'],
    policy: policyId,
  },
  {
    collection: 'ji_banners',
    action: 'delete',
    fields: ['id'],
    policy: policyId,
  },
  // Ajustes
  {
    collection: 'ji_ajustes',
    action: 'read',
    fields: ['*'],
    policy: policyId,
  },
  {
    collection: 'ji_ajustes',
    action: 'create',
    fields: ['*'],
    policy: policyId,
  },
  {
    collection: 'ji_ajustes',
    action: 'update',
    fields: ['*'],
    policy: policyId,
  },
]

async function grantPermissions() {
  try {
    console.log('Granting permissions for ji_banners and ji_ajustes in Directus...')
    for (const p of newPermissions) {
      const response = await client.post('permissions', p)
      console.log(`✅ Granted permission: ${p.action} on ${p.collection} (ID: ${response.data.data.id})`)
    }
    console.log('🎉 All permissions granted successfully!')
  } catch (error) {
    console.error('Error granting permissions:', error.response?.data || error.message)
  }
}

grantPermissions()
