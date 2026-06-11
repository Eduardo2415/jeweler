import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN } = process.env

async function listCollections() {
  try {
    const response = await axios.get(`${DIRECTUS_URL}collections`, {
      headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` }
    })
    const custom = response.data.data.filter(c => !c.meta || !c.meta.system)
    console.log(custom.map(c => c.collection))
  } catch (error) {
    console.error('Error fetching collections:', error.response ? error.response.data : error.message)
  }
}

listCollections()
