import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'
import { getEffectivePrice } from '../utils/pricing'

export const useShopStore = defineStore('shop', () => {
  // State
  const categories = ref([
    { id: 1, name: 'Anillos', icon: 'diamond' },
    { id: 2, name: 'Cadenas', icon: 'link' },
    { id: 3, name: 'Relojes', icon: 'schedule' },
    { id: 4, name: 'Pulseras', icon: 'wrist' },
    { id: 5, name: 'Pendientes', icon: 'diamond' },
    { id: 6, name: 'Collares', icon: 'jewelry' },
  ])

  const products = ref([
    // Anillos (id: 1)
    {
      id: 1,
      name: 'Anillo Diamante Clásico',
      categoryId: 1,
      price: 2500,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
      description: 'Elegante anillo de oro blanco con diamante de 1.5 quilates',
      rating: 4.9,
    },
    {
      id: 2,
      name: 'Anillo Zafiro Real',
      categoryId: 1,
      price: 1800,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
      description: 'Anillo de platino con zafiro natural azul',
      rating: 4.8,
    },
    {
      id: 3,
      name: 'Anillo Minimalista Oro',
      categoryId: 1,
      price: 850,
      image: 'https://images.unsplash.com/photo-1515562141207-6811bcb0e7fb?w=400&h=400&fit=crop',
      description: 'Sencillo y elegante anillo de oro 18k',
      rating: 4.7,
    },
    // Cadenas (id: 2)
    {
      id: 4,
      name: 'Cadena Oro Macizo 50cm',
      categoryId: 2,
      price: 1200,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
      description: 'Cadena de oro macizo 18k, peso 8 gramos',
      rating: 4.9,
    },
    {
      id: 5,
      name: 'Cadena Plata Esterlina',
      categoryId: 2,
      price: 350,
      image: 'https://images.unsplash.com/photo-1511629214669-13d82dbb97f4?w=400&h=400&fit=crop',
      description: 'Cadena tejida en plata esterlina de 45cm',
      rating: 4.6,
    },
    {
      id: 6,
      name: 'Cadena Acero Inoxidable',
      categoryId: 2,
      price: 150,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
      description: 'Resistente cadena de acero inoxidable quirúrgico',
      rating: 4.5,
    },
    // Relojes (id: 3)
    {
      id: 7,
      name: 'Reloj de Lujo Suizo',
      categoryId: 3,
      price: 8500,
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop',
      description: 'Reloj mecánico suizo, caja de acero quirúrgico',
      rating: 5.0,
    },
    {
      id: 8,
      name: 'Reloj Automático Premium',
      categoryId: 3,
      price: 4200,
      image: 'https://images.unsplash.com/photo-1579869847514-7b1f2534d30e?w=400&h=400&fit=crop',
      description: 'Reloj automático con cristal de zafiro',
      rating: 4.8,
    },
    {
      id: 9,
      name: 'Reloj Clásico Elegante',
      categoryId: 3,
      price: 1500,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop',
      description: 'Diseño minimalista, movimiento de cuarzo suizo',
      rating: 4.7,
    },
    // Pulseras (id: 4)
    {
      id: 10,
      name: 'Pulsera Oro Blanco',
      categoryId: 4,
      price: 950,
      image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop',
      description: 'Pulsera articulada de oro blanco 18k',
      rating: 4.8,
    },
    {
      id: 11,
      name: 'Pulsera Perlas de Agua Dulce',
      categoryId: 4,
      price: 680,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
      description: 'Pulsera con perlas auténticas de agua dulce',
      rating: 4.6,
    },
    // Pendientes (id: 5)
    {
      id: 12,
      name: 'Pendientes Diamante',
      categoryId: 5,
      price: 1800,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
      description: 'Par de pendientes con diamantes certificados',
      rating: 4.9,
    },
    {
      id: 13,
      name: 'Pendientes Oro Clásicos',
      categoryId: 5,
      price: 450,
      image: 'https://images.unsplash.com/photo-1511629214669-13d82dbb97f4?w=400&h=400&fit=crop',
      description: 'Elegantes pendientes de oro 18k',
      rating: 4.7,
    },
    // Collares (id: 6)
    {
      id: 14,
      name: 'Collar Oro con Colgante',
      categoryId: 6,
      price: 1350,
      image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop',
      description: 'Collar de oro con colgante de diamante',
      rating: 4.8,
    },
    {
      id: 15,
      name: 'Collar Perla Negra',
      categoryId: 6,
      price: 890,
      image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&h=400&fit=crop',
      description: 'Collar con perla negra de Tahití',
      rating: 4.9,
    },
  ])

  const cart = ref([])
  const selectedCategoryId = ref(null)
  const currentUser = ref(null)
  const orders = ref([])
  const banners = ref([])
  const bannerInterval = ref(5000)
  const bankAccounts = ref([])
  const whatsappNumber = ref('5491112345678')
  const socialFacebook = ref(null)
  const socialInstagram = ref(null)
  const socialTiktok = ref(null)
  const socialYoutube = ref(null)

  // Computed
  const filteredProducts = computed(() => {
    if (!selectedCategoryId.value) return products.value
    return products.value.filter((p) => p.categoryId === selectedCategoryId.value)
  })

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  // Actions
  const addToCart = (product, qty = 1, selectedSize = null) => {
    const cartId = `${product.id}-${selectedSize || 'nosize'}`
    const existingItem = cart.value.find((item) => item.cartId === cartId)
    const currentQuantity = existingItem?.quantity || 0

    let stock = Number(product.stock) || 0
    if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && selectedSize) {
      const sizeObj = product.sizes.find(s => s.size === selectedSize)
      stock = sizeObj ? Number(sizeObj.stock) || 0 : 0
    }

    if (qty <= 0 || currentQuantity + qty > stock) {
      return false
    }

    if (existingItem) {
      existingItem.quantity += qty
    } else {
      cart.value.push({
        ...product,
        cartId,
        selectedSize,
        regular_price: product.price,
        price: getEffectivePrice(product),
        quantity: qty,
      })
    }

    return true
  }

  const removeFromCart = (cartId) => {
    const index = cart.value.findIndex((item) => item.cartId === cartId)
    if (index !== -1) {
      cart.value.splice(index, 1)
    }
  }

  const updateQuantity = (cartId, quantity) => {
    const item = cart.value.find((item) => item.cartId === cartId)
    if (item) {
      let stock = Number(item.stock) || 0
      if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 && item.selectedSize) {
        const sizeObj = item.sizes.find(s => s.size === item.selectedSize)
        stock = sizeObj ? Number(sizeObj.stock) || 0 : 0
      }

      if (quantity <= 0) {
        removeFromCart(cartId)
        return true
      } else if (quantity <= stock) {
        item.quantity = quantity
        return true
      }
    }

    return false
  }

  const clearCart = () => {
    cart.value = []
  }

  const setSelectedCategory = (categoryId) => {
    selectedCategoryId.value = categoryId
  }

  const loginUser = (email, provider = 'email') => {
    currentUser.value = { email, provider }
    fetchOrders()
  }

  const logoutUser = () => {
    currentUser.value = null
    orders.value = []
  }

  const fetchOrders = async () => {
    try {
      if (!currentUser.value) {
        orders.value = []
        return
      }
      const response = await api.post('/get-orders', {
        user_email: currentUser.value.email,
      })
      const responseData = response.data?.data ?? response.data
      if (Array.isArray(responseData)) {
        orders.value = responseData.map(o => ({
          id: o.order_id,
          items: o.items,
          total: o.total,
          paymentMethod: o.payment_method,
          bankName: o.bank_name,
          status: o.status,
          date: o.date,
          receiptImage: o.receipt_image,
          user_email: o.user_email,
          adminNotes: o.admin_notes
        }))
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener el historial de pedidos:', error.message)
    }
  }

  const createOrder = async (paymentMethod, bankName = null) => {
    const orderId = `JI-${Math.floor(10000 + Math.random() * 90000)}`
    const newOrder = {
      id: orderId,
      items: [...cart.value],
      total: cartTotal.value,
      paymentMethod,
      bankName,
      status: paymentMethod === 'whatsapp' ? 'Completado (WhatsApp)' : 'Pendiente de Pago',
      date: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      receiptImage: null,
      user_email: currentUser.value ? currentUser.value.email : null,
    }

    try {
      await api.post('/create-order', {
        order_id: newOrder.id,
        items: newOrder.items,
        total: newOrder.total,
        payment_method: newOrder.paymentMethod,
        bank_name: newOrder.bankName,
        status: newOrder.status,
        date: newOrder.date,
        receipt_image: newOrder.receiptImage,
        user_email: newOrder.user_email
      })
    } catch (error) {
      console.error('Error al persistir el pedido en n8n:', error.message)
    }

    orders.value.unshift(newOrder)
    clearCart()
    return newOrder
  }

  const uploadReceipt = async (orderId, file) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (!order) return false

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'comprobantes')

      const uploadResponse = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (uploadResponse.data && uploadResponse.data.url) {
        const url = uploadResponse.data.url
        const updateRes = await api.post('/update-order', {
          order_id: orderId,
          receipt_image: url
        })

        if (updateRes.data?.status === 'success') {
          order.receiptImage = url
          order.status = 'Pendiente de Verificación'
          return true
        }
      }
      return false
    } catch (error) {
      console.error('Error al subir comprobante:', error.message)
      throw error
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/get-products')
      const responseData = response.data?.data ?? response.data?.products ?? response.data

      if (Array.isArray(responseData)) {
        products.value = responseData
        cart.value = cart.value
          .map((item) => {
            const product = responseData.find((current) => current.id === item.id)
            if (!product || product.stock <= 0) return null

            return {
              ...item,
              stock: product.stock,
              quantity: Math.min(item.quantity, product.stock),
            }
          })
          .filter(Boolean)
      }
    } catch (error) {
      console.warn(
        '⚠️ No se pudo obtener el catálogo de n8n, se mantendrán los productos locales:',
        error.message,
      )
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/get-categories')
      const responseData = response.data?.data ?? response.data?.categories ?? response.data

      if (Array.isArray(responseData)) {
        categories.value = responseData
      }
    } catch (error) {
      console.warn(
        '⚠️ No se pudo obtener las categorías de n8n, se mantendrán las locales:',
        error.message,
      )
    }
  }

  const fetchBanners = async () => {
    try {
      const response = await api.get('/get-banners')
      const responseData = response.data?.data ?? response.data?.banners ?? response.data
      if (Array.isArray(responseData)) {
        banners.value = responseData
      }
      if (response.data?.banner_interval) {
        bannerInterval.value = Number(response.data.banner_interval)
      }
      if (response.data?.whatsapp_number) {
        whatsappNumber.value = response.data.whatsapp_number
      }
      if (response.data?.social_facebook !== undefined) {
        socialFacebook.value = response.data.social_facebook
      }
      if (response.data?.social_instagram !== undefined) {
        socialInstagram.value = response.data.social_instagram
      }
      if (response.data?.social_tiktok !== undefined) {
        socialTiktok.value = response.data.social_tiktok
      }
      if (response.data?.social_youtube !== undefined) {
        socialYoutube.value = response.data.social_youtube
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener los banners de n8n:', error.message)
    }
  }

  const updateSettings = async (settings) => {
    try {
      const response = await api.post('/update-settings', {
        admin_token: localStorage.getItem('ji_admin_token'),
        ...settings,
      })
      if (response.data?.status === 'success') {
        if (settings.banner_interval !== undefined) {
          bannerInterval.value = Number(settings.banner_interval)
        }
        if (settings.whatsapp_number !== undefined) {
          whatsappNumber.value = settings.whatsapp_number
        }
        if (settings.social_facebook !== undefined) {
          socialFacebook.value = settings.social_facebook
        }
        if (settings.social_instagram !== undefined) {
          socialInstagram.value = settings.social_instagram
        }
        if (settings.social_tiktok !== undefined) {
          socialTiktok.value = settings.social_tiktok
        }
        if (settings.social_youtube !== undefined) {
          socialYoutube.value = settings.social_youtube
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Error al actualizar los ajustes:', error.message)
      throw error
    }
  }

  const fetchBankAccounts = async () => {
    try {
      const response = await api.get('/get-bank-accounts')
      const responseData = response.data?.data ?? response.data?.bank_accounts ?? response.data
      if (Array.isArray(responseData)) {
        bankAccounts.value = responseData
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener las cuentas bancarias de n8n:', error.message)
    }
  }

  const linkGuestOrder = async (orderId, email) => {
    try {
      const response = await api.post('/update-order', {
        order_id: orderId,
        user_email: email,
      })
      if (response.data?.status === 'success') {
        const order = orders.value.find((o) => o.id === orderId)
        if (order) {
          order.user_email = email
        }
        await fetchOrders()
        return true
      }
      return false
    } catch (error) {
      console.error('Error al vincular pedido de invitado:', error.message)
      return false
    }
  }

  // Trigger initial fetch
  fetchCategories()
  fetchProducts()
  fetchBanners()
  fetchBankAccounts()

  return {
    // State
    categories,
    products,
    cart,
    selectedCategoryId,
    currentUser,
    orders,
    banners,
    bannerInterval,
    bankAccounts,
    whatsappNumber,
    socialFacebook,
    socialInstagram,
    socialTiktok,
    socialYoutube,

    // Computed
    filteredProducts,
    cartTotal,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setSelectedCategory,
    loginUser,
    logoutUser,
    createOrder,
    uploadReceipt,
    fetchProducts,
    fetchCategories,
    fetchBanners,
    updateSettings,
    fetchBankAccounts,
    fetchOrders,
    linkGuestOrder,
  }
})
