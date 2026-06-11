import dotenv from 'dotenv'
import axios from 'axios'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const baseURL = process.env.VITE_N8N_WEBHOOK_URL || 'https://n8n.em-cloud.top/webhook'

async function testUpload() {
  console.log(`Testing upload to n8n webhook: ${baseURL}/upload-image`)
  
  try {
    // Create a 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    )
    
    const formData = new FormData()
    // Convert Buffer to Blob for standard Node.js FormData
    const blob = new Blob([pngBuffer], { type: 'image/png' })
    formData.append('file', blob, 'test-image.png')
    formData.append('folder', 'comprobantes')
    
    const response = await axios.post(`${baseURL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    console.log('Upload successful!')
    console.log('Status:', response.status)
    console.log('Headers:', response.headers)
    console.log('Data:', response.data)
  } catch (error) {
    console.error('Upload failed:')
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Headers:', error.response.headers)
      console.error('Data:', error.response.data)
    } else {
      console.error(error.message)
    }
  }
}

testUpload()
