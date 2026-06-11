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

async function checkRoles() {
  try {
    console.log('Fetching roles from Directus...')
    const rolesRes = await client.get('roles')
    console.log('Roles:')
    console.log(JSON.stringify(rolesRes.data.data, null, 2))

    console.log('Fetching policies from Directus...')
    const policiesRes = await client.get('policies')
    console.log('Policies:')
    console.log(JSON.stringify(policiesRes.data.data, null, 2))

    console.log('\nFetching permissions from Directus...')
    const permissionsRes = await client.get('permissions', {
      params: {
        limit: 100,
      }
    })
    console.log('Permissions count:', permissionsRes.data.data.length)
    
    // Log permissions for ji_productos
    const prodPermissions = permissionsRes.data.data.filter(p => p.collection === 'ji_productos')
    console.log('\nPermissions for ji_productos:')
    console.log(JSON.stringify(prodPermissions, null, 2))
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

checkRoles()
