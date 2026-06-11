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
  console.log('🧪 Starting Product Sizes & Variants API End-to-End Verification...\n')

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

    // 2. Create Product with Sizes
    console.log('➕ Step 2: Creating a product with size variations...')
    const testSizes = [
      { size: 'Talla 6', stock: 5 },
      { size: 'Talla 7', stock: 0 },
      { size: 'Talla 8', stock: 12 }
    ]

    const createRes = await client.post('/webhook/create-product', {
      admin_token: adminToken,
      name: 'Anillo Exclusivo de Prueba',
      categoryId: 1, // Anillos
      price: 1500,
      sale_price: 1200,
      stock: 17, // Sum of 5 + 0 + 12
      description: 'Anillo de oro blanco de prueba con tallas dinámicas.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
      sizes: testSizes
    })

    if (createRes.data.status !== 'success') {
      throw new Error(`Create product failed: ${createRes.data.message}`)
    }

    const productId = createRes.data.id
    console.log(`✅ Product created successfully with ID: ${productId}\n`)

    // 3. Fetch products to verify sizes are saved
    console.log('🔍 Step 3: Fetching products and verifying sizes structure...')
    const fetchRes = await client.get('/webhook/get-products')
    const products = fetchRes.data.data ?? fetchRes.data.products ?? fetchRes.data
    const createdProduct = products.find(p => p.id === productId)

    if (!createdProduct) {
      throw new Error('Created product was not found in the catalog list!')
    }

    console.log('✅ Product found in catalog!')
    console.log('   Sizes field:', JSON.stringify(createdProduct.sizes, null, 2))
    
    if (!createdProduct.sizes || createdProduct.sizes.length !== 3) {
      throw new Error('Product sizes count is incorrect or field was not populated!')
    }
    console.log('✅ Sizes verified successfully!\n')

    // 4. Update sizes of the product
    console.log(`✏️  Step 4: Updating product sizes...`)
    const updatedSizes = [
      { size: 'Talla 6', stock: 10 },
      { size: 'Talla 8', stock: 20 }
    ]

    const updateRes = await client.post('/webhook/update-product', {
      admin_token: adminToken,
      product_id: productId,
      name: 'Anillo Exclusivo de Prueba Modificado',
      categoryId: 1,
      price: 1600,
      sale_price: null,
      stock: 30, // 10 + 20
      description: 'Anillo de oro blanco modificado.',
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500',
      sizes: updatedSizes
    })

    if (updateRes.data.status !== 'success') {
      throw new Error(`Update product failed: ${updateRes.data.message}`)
    }
    console.log('✅ Product sizes updated successfully!\n')

    // Verify update
    console.log('🔍 Step 4.5: Verifying product update...')
    const verifyFetchRes = await client.get('/webhook/get-products')
    const verifyProducts = verifyFetchRes.data.data ?? verifyFetchRes.data.products ?? verifyFetchRes.data
    const updatedProduct = verifyProducts.find(p => p.id === productId)

    console.log('   New total stock:', updatedProduct.stock)
    console.log('   New sizes array:', JSON.stringify(updatedProduct.sizes))

    if (updatedProduct.stock !== 30 || updatedProduct.sizes.length !== 2) {
      throw new Error('Verification failed: stock or sizes do not match updated values!')
    }
    console.log('✅ Update verified successfully!\n')

    // 5. Delete test product
    console.log(`🗑️  Step 5: Deleting test product ${productId}...`)
    const deleteRes = await client.post('/webhook/delete-product', {
      admin_token: adminToken,
      product_id: productId,
    })

    if (deleteRes.data.status !== 'success') {
      throw new Error(`Delete product failed: ${deleteRes.data.message}`)
    }
    console.log('✅ Product deleted successfully!\n')

    console.log('🎉 ALL PRODUCT SIZES API TESTS PASSED SUCCESSFULLY!')
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
