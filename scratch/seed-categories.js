import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN } = process.env

const initialCategories = [
  {
    id: 1,
    name: 'Anillos',
    value: 'Rings',
    image: 'https://images.unsplash.com/photo-1499899833954-5ecd9439d17f?w=500',
    active: true,
    icon: 'diamond',
  },
  {
    id: 2,
    name: 'Cadenas',
    value: 'Chains',
    image: 'https://images.unsplash.com/photo-1596213411964-ee96819a396c?w=500',
    active: true,
    icon: 'link',
  },
  {
    id: 3,
    name: 'Relojes',
    value: 'Relojes',
    image: 'https://images.unsplash.com/photo-1519741495165-61d2d3dd0a2a?w=500',
    active: true,
    icon: 'schedule',
  },
  {
    id: 4,
    name: 'Brazaletes',
    value: 'Bracelets',
    image: 'https://images.unsplash.com/photo-1612437830721-4f8eab90c5a9?w=500',
    active: true,
    icon: 'wrist',
  },
  {
    id: 5,
    name: 'Aretes',
    value: 'Earrings',
    image: 'https://images.unsplash.com/photo-1704957205327-9fbd44d683b7?w=500',
    active: true,
    icon: 'diamond',
  },
  {
    id: 6,
    name: 'Compromiso',
    value: 'Compromiso',
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500',
    active: true,
    icon: 'jewelry',
  },
]

async function seedCategories() {
  try {
    const client = axios.create({
      baseURL: DIRECTUS_URL,
      headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` },
    })

    console.log('Checking if categories already exist in ji_categorias...')
    const checkRes = await client.get('items/ji_categorias', { params: { limit: 1 } })

    if (checkRes.data.data && checkRes.data.data.length > 0) {
      console.log('Categories already exist. Skipping seed.')
      return
    }

    console.log('Seeding categories...')
    for (const cat of initialCategories) {
      await client.post('items/ji_categorias', cat)
      console.log(`✅ Seeded category: ${cat.name}`)
    }
    console.log('🎉 Category seeding finished successfully!')
  } catch (error) {
    console.error('Error seeding categories:', error.response ? error.response.data : error.message)
  }
}

seedCategories()
