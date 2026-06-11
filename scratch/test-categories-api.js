import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const baseURL = 'https://n8n.em-cloud.top' // Using production n8n instance

const testEmail = 'eduardomartinez0215@hotmail.com'
const testPassword = 'elm141595'

async function runTests() {
  console.log('🧪 Starting Categories API End-to-End Verification...\n')

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

    // 2. Fetch Categories
    console.log('📂 Step 2: Fetching existing categories...')
    const fetchRes = await client.get('/webhook/get-categories')
    console.log('Response status:', fetchRes.status)
    console.log('Response data:', JSON.stringify(fetchRes.data, null, 2))
    if (fetchRes.data.status !== 'success') {
      throw new Error(`Fetch categories failed: ${fetchRes.data.message}`)
    }
    console.log(`✅ Fetched categories: ${fetchRes.data.categories.length} item(s).\n`)

    // 3. Create Category
    console.log('➕ Step 3: Creating a test category "Broches"...')
    const createRes = await client.post('/webhook/create-category', {
      admin_token: adminToken,
      name: 'Broches',
      value: 'Brooches',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
      icon: 'spa',
      active: true,
    })

    if (createRes.data.status !== 'success') {
      throw new Error(`Create category failed: ${createRes.data.message}`)
    }

    const newCategoryId = createRes.data.id
    console.log(`✅ Category "Broches" created successfully with ID: ${newCategoryId}\n`)

    // 4. Update Category (deactivating it)
    console.log(`✏️  Step 4: Updating category ${newCategoryId} (deactivating it)...`)
    const updateRes = await client.post('/webhook/update-category', {
      admin_token: adminToken,
      category_id: newCategoryId,
      name: 'Broches Modificados',
      value: 'BroochesModified',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
      icon: 'auto_awesome',
      active: false,
    })

    if (updateRes.data.status !== 'success') {
      throw new Error(`Update category failed: ${updateRes.data.message}`)
    }
    console.log('✅ Category updated and deactivated successfully!\n')

    // Verify update status
    console.log('🔍 Step 4.5: Checking categories again to verify the update...')
    const verifyFetchRes = await client.get('/webhook/get-categories')
    const updatedCat = verifyFetchRes.data.categories.find(c => c.id === newCategoryId)
    if (!updatedCat) {
      throw new Error('Could not find updated category in list.')
    }
    console.log(`   Name: ${updatedCat.name} (Expected: "Broches Modificados")`)
    console.log(`   Active: ${updatedCat.active} (Expected: false / 0)`)
    console.log(`   Icon: ${updatedCat.icon} (Expected: "auto_awesome")\n`)

    // 5. Delete Category
    console.log(`🗑️  Step 5: Deleting test category ${newCategoryId}...`)
    const deleteRes = await client.post('/webhook/delete-category', {
      admin_token: adminToken,
      category_id: newCategoryId,
    })

    if (deleteRes.data.status !== 'success') {
      throw new Error(`Delete category failed: ${deleteRes.data.message}`)
    }
    console.log('✅ Category deleted successfully!\n')

    // Verify deletion
    console.log('🔍 Step 5.5: Verifying deletion...')
    const finalFetchRes = await client.get('/webhook/get-categories')
    const deletedCat = finalFetchRes.data.categories.find(c => c.id === newCategoryId)
    if (deletedCat) {
      throw new Error('Category was NOT deleted successfully.')
    }
    console.log('✅ Verified: Category is no longer in the database!\n')

    console.log('🎉 ALL CATEGORY API TESTS PASSED SUCCESSFULLY!')
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
