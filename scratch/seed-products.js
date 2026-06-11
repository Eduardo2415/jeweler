import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { DIRECTUS_URL, DIRECTUS_ADMIN_TOKEN } = process.env

const products = [
  {
    name: 'Anillo Diamante Clásico',
    categoryId: 1,
    price: 2500,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    description: 'Elegante anillo de oro blanco con diamante de 1.5 quilates',
    rating: 4.9
  },
  {
    name: 'Anillo Zafiro Real',
    categoryId: 1,
    price: 1800,
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
    description: 'Anillo de platino con zafiro natural azul',
    rating: 4.8
  },
  {
    name: 'Anillo Minimalista Oro',
    categoryId: 1,
    price: 850,
    image: 'https://images.unsplash.com/photo-1515562141207-6811bcb0e7fb?w=400&h=400&fit=crop',
    description: 'Sencillo y elegante anillo de oro 18k',
    rating: 4.7
  },
  {
    name: 'Cadena Oro Macizo 50cm',
    categoryId: 2,
    price: 1200,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    description: 'Cadena de oro macizo 18k, peso 8 gramos',
    rating: 4.9
  },
  {
    name: 'Cadena Plata Esterlina',
    categoryId: 2,
    price: 350,
    image: 'https://images.unsplash.com/photo-1511629214669-13d82dbb97f4?w=400&h=400&fit=crop',
    description: 'Cadena tejida en plata esterlina de 45cm',
    rating: 4.6
  },
  {
    name: 'Cadena Acero Inoxidable',
    categoryId: 2,
    price: 150,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
    description: 'Resistente cadena de acero inoxidable quirúrgico',
    rating: 4.5
  },
  {
    name: 'Reloj de Lujo Suizo',
    categoryId: 3,
    price: 8500,
    image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop',
    description: 'Reloj mecánico suizo, caja de acero quirúrgico',
    rating: 5.0
  },
  {
    name: 'Reloj Automático Premium',
    categoryId: 3,
    price: 4200,
    image: 'https://images.unsplash.com/photo-1579869847514-7b1f2534d30e?w=400&h=400&fit=crop',
    description: 'Reloj automático con cristal de zafiro',
    rating: 4.8
  },
  {
    name: 'Reloj Clásico Elegante',
    categoryId: 3,
    price: 1500,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
    description: 'Diseño minimalista, movimiento de cuarzo suizo',
    rating: 4.7
  }
]

async function seedProducts() {
  try {
    const client = axios.create({
      baseURL: DIRECTUS_URL,
      headers: { Authorization: `Bearer ${DIRECTUS_ADMIN_TOKEN}` }
    })

    console.log('Checking if products already exist in ji_productos...')
    const checkRes = await client.get('items/ji_productos', { params: { limit: 1 } })

    if (checkRes.data.data && checkRes.data.data.length > 0) {
      console.log('Products already exist. Skipping seed.')
      return
    }

    console.log('Seeding products...')
    for (const p of products) {
      await client.post('items/ji_productos', p)
      console.log(`✅ Seeded: ${p.name}`)
    }
    console.log('🎉 Seeding finished successfully!')
  } catch (error) {
    console.error('Error seeding products:', error.response ? error.response.data : error.message)
  }
}

seedProducts()
