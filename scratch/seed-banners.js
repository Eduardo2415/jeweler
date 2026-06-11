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

async function seedBanners() {
  try {
    // 1. Seed settings in ji_ajustes
    console.log('Checking if settings exist in ji_ajustes...')
    const checkAjustes = await client.get('items/ji_ajustes', { params: { limit: 1 } })
    if (checkAjustes.data.data && checkAjustes.data.data.length > 0) {
      console.log('Settings already exist. Skipping ajustes seed.')
    } else {
      console.log('Seeding settings in ji_ajustes...')
      await client.post('items/ji_ajustes', {
        id: 1,
        banner_interval: 5000,
      })
      console.log('✅ Settings seeded successfully!')
    }

    // 2. Seed initial banner in ji_banners
    console.log('Checking if banners exist in ji_banners...')
    const checkBanners = await client.get('items/ji_banners', { params: { limit: 1 } })
    if (checkBanners.data.data && checkBanners.data.data.length > 0) {
      console.log('Banners already exist. Skipping banners seed.')
    } else {
      console.log('Seeding initial banner in ji_banners...')
      await client.post('items/ji_banners', {
        id: 1,
        title: 'RADIANT DIAMOND LAWMI JEWELRY SET',
        subtitle: 'Timeless elegance with a brilliant, modern glow',
        eyebrow: 'Colección',
        image: 'https://images.unsplash.com/photo-1727784892009-f3cf06199b65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600',
        button_text: 'Ver Colección ›',
        button_link: 'Rings',
        active: true,
        order: 0,
      })
      console.log('✅ Initial banner seeded successfully!')
    }
    console.log('🎉 Seeding finished successfully!')
  } catch (error) {
    console.error('Error seeding banners:', error.response ? error.response.data : error.message)
  }
}

seedBanners()
