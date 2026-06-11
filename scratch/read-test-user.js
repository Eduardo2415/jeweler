import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN } = process.env

async function readTestUser() {
  try {
    const client = axios.create({
      baseURL: DIRECTUS_URL,
      headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` },
    })

    console.log('Reading test user...')
    const response = await client.get('items/ji_usuarios_admin/1')
    console.log('Record details:', response.data.data)
  } catch (error) {
    console.error('Error reading test user:', error.response ? error.response.data : error.message)
  }
}

readTestUser()
