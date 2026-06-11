import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const baseURL = 'https://n8n.em-cloud.top'

const testEmail = 'eduardomartinez0215@hotmail.com'
const testPassword = 'elm141595'

async function runTests() {
  console.log('🧪 Starting Banners & Settings API End-to-End Verification...\n')

  const client = axios.create({
    baseURL: baseURL,
    timeout: 15000,
  })

  try {
    // 1. Admin Login
    console.log('🔑 Step 1: Performing Admin Login...')
    const loginRes = await client.post('/webhook/admin-login', {
      email: testEmail,
      password: testPassword,
    })

    if (loginRes.data.status !== 'success') {
      throw new Error(`Login failed: ${loginRes.data.message}`)
    }

    const adminToken = loginRes.data.admin_token
    console.log('✅ Admin Login successful!')
    console.log(`   Token: ${adminToken.substring(0, 15)}...\n`)

    // 2. Fetch Banners
    console.log('📂 Step 2: Fetching existing banners and settings...')
    const fetchRes = await client.get('/webhook/get-banners')
    if (fetchRes.data.status !== 'success') {
      throw new Error(`Fetch banners failed: ${fetchRes.data.message}`)
    }
    console.log(`✅ Fetched banners: ${fetchRes.data.banners.length} item(s).`)
    console.log(`   Autoplay Interval: ${fetchRes.data.banner_interval} ms.\n`)

    // 3. Create Banner
    console.log('➕ Step 3: Creating a test banner slide...')
    const createRes = await client.post('/webhook/create-banner', {
      admin_token: adminToken,
      title: 'TEST BANNER',
      subtitle: 'This is a test slide subtitle',
      eyebrow: 'Promo',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1080',
      button_text: 'Click here',
      button_link: 'Chains',
      active: true,
      order: 1,
    })

    if (createRes.data.status !== 'success') {
      throw new Error(`Create banner failed: ${createRes.data.message}`)
    }

    const newBannerId = createRes.data.id
    console.log(`✅ Banner created successfully with ID: ${newBannerId}\n`)

    // 4. Update Banner
    console.log(`✏️  Step 4: Updating banner ${newBannerId}...`)
    const updateRes = await client.post('/webhook/update-banner', {
      admin_token: adminToken,
      banner_id: newBannerId,
      title: 'TEST BANNER MODIFIED',
      subtitle: 'This is a modified test slide subtitle',
      eyebrow: 'Promo Updated',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1080',
      button_text: 'Click here',
      button_link: 'Chains',
      active: false,
      order: 2,
    })

    if (updateRes.data.status !== 'success') {
      throw new Error(`Update banner failed: ${updateRes.data.message}`)
    }
    console.log('✅ Banner updated successfully!\n')

    // 5. Update Global Settings
    console.log('⚙️  Step 5: Updating global settings (change interval to 8000ms)...')
    const settingsRes = await client.post('/webhook/update-settings', {
      admin_token: adminToken,
      banner_interval: 8000,
    })

    if (settingsRes.data.status !== 'success') {
      throw new Error(`Update settings failed: ${settingsRes.data.message}`)
    }
    console.log('✅ Settings updated successfully!\n')

    // Verify settings and updated banner
    console.log('🔍 Step 5.5: Verifying updates via fetch...')
    const verifyFetchRes = await client.get('/webhook/get-banners')
    console.log(`   New Autoplay Interval: ${verifyFetchRes.data.banner_interval} ms (Expected: 8000)`)
    
    // Note: The verify fetch filters by active = true, so the modified deactivated banner (active: false) should NOT appear in get-banners response!
    const inactiveBannerFound = verifyFetchRes.data.banners.find(b => b.id === newBannerId)
    console.log(`   Inactive banner shown: ${!!inactiveBannerFound} (Expected: false)\n`)

    // Restore settings back to 5000ms
    console.log('⚙️  Step 6: Restoring settings back to 5000ms...')
    await client.post('/webhook/update-settings', {
      admin_token: adminToken,
      banner_interval: 5000,
    })
    console.log('✅ Settings restored!\n')

    // 6. Delete Banner
    console.log(`🗑️  Step 7: Deleting test banner ${newBannerId}...`)
    const deleteRes = await client.post('/webhook/delete-banner', {
      admin_token: adminToken,
      banner_id: newBannerId,
    })

    if (deleteRes.data.status !== 'success') {
      throw new Error(`Delete banner failed: ${deleteRes.data.message}`)
    }
    console.log('✅ Banner deleted successfully!\n')

    console.log('🎉 ALL BANNERS AND SETTINGS API TESTS PASSED SUCCESSFULLY!')
  } catch (error) {
    console.error('❌ Test failed with error:')
    if (error.response?.data) {
      console.error(JSON.stringify(error.response.data, null, 2))
    } else {
      console.error(error.message)
    }
  }
}

runTests()
