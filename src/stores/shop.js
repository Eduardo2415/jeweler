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

  // Computed
  const filteredProducts = computed(() => {
    if (!selectedCategoryId.value) return products.value
    return products.value.filter((p) => p.categoryId === selectedCategoryId.value)
  })

  const cartTotal = computed(() => {
    return cart.value.reduce((total, item) => total + item.price * item.quantity, 0)
  })

  // Actions
  const addToCart = (product, qty = 1) => {
    const existingItem = cart.value.find((item) => item.id === product.id)
    const currentQuantity = existingItem?.quantity || 0
    const stock = Number(product.stock) || 0

    if (qty <= 0 || currentQuantity + qty > stock) {
      return false
    }

    if (existingItem) {
      existingItem.quantity += qty
    } else {
      cart.value.push({
        ...product,
        regular_price: product.price,
        price: getEffectivePrice(product),
        quantity: qty,
      })
    }

    return true
  }

  const removeFromCart = (productId) => {
    const index = cart.value.findIndex((item) => item.id === productId)
    if (index !== -1) {
      cart.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId, quantity) => {
    const item = cart.value.find((item) => item.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeFromCart(productId)
        return true
      } else if (quantity <= item.stock) {
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
  }

  const logoutUser = () => {
    currentUser.value = null
  }

  const createOrder = (paymentMethod, bankName = null) => {
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
    }
    orders.value.unshift(newOrder)
    clearCart()
    return newOrder
  }

  const uploadReceipt = (orderId, receiptImage) => {
    const order = orders.value.find((o) => o.id === orderId)
    if (order) {
      order.receiptImage = receiptImage
      order.status = 'Pendiente de Verificación'
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
    } catch (error) {
      console.warn('⚠️ No se pudo obtener los banners de n8n:', error.message)
    }
  }

  const updateSettings = async (interval) => {
    try {
      const response = await api.post('/update-settings', {
        admin_token: localStorage.getItem('ji_admin_token'),
        banner_interval: interval,
      })
      if (response.data?.status === 'success') {
        bannerInterval.value = Number(interval)
        return true
      }
      return false
    } catch (error) {
      console.error('Error al actualizar los ajustes:', error.message)
      throw error
    }
  }

  // Trigger initial fetch
  fetchCategories()
  fetchProducts()
  fetchBanners()

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
  }
})
