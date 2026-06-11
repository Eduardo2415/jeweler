import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN } = process.env

async function createTestUser() {
  try {
    const client = axios.create({
      baseURL: DIRECTUS_URL,
      headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` },
    })

    console.log('Checking if test user already exists...')
    const checkRes = await client.get('items/ji_usuarios_admin', {
      params: {
        filter: {
          email: { _eq: 'eduardomartinez0215@hotmail.com' },
        },
      },
    })

    if (checkRes.data.data && checkRes.data.data.length > 0) {
      console.log('Test user already exists:', checkRes.data.data[0])
      return
    }

    console.log('Creating test user...')
    const response = await client.post('items/ji_usuarios_admin', {
      nombre: 'Eduardo Martínez',
      email: 'eduardomartinez0215@hotmail.com',
      password: 'elm141595',
      estado_activo: true,
    })
    console.log('✅ Test user created successfully!')
    console.log('Record details:', response.data.data)
  } catch (error) {
    console.error('Error creating test user:', error.response ? error.response.data : error.message)
  }
}

createTestUser()
