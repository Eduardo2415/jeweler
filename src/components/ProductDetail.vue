<template>
  <div class="product-detail-root">
    <!-- Global luxury header -->
    <header class="header flex items-center justify-between px-4 py-3">
      <q-btn flat round class="menu-trigger-btn" @click="$emit('toggle-menu')">
        <div class="hamburger-lines">
          <span class="line line-1"></span>
          <span class="line line-2"></span>
        </div>
      </q-btn>
      <div class="brand font-serif flex items-center gap-2">
        <q-avatar size="28px" class="brand-avatar">
          <q-img src="/logo1.jpeg" />
        </q-avatar>
        <span>JUAN INVERSIONES</span>
      </div>
      <q-btn flat round class="cart-trigger-btn" @click="$emit('open-cart')">
        <q-icon name="shopping_bag" size="20px" />
        <q-badge
          color="accent"
          floating
          rounded
          v-if="cartCount"
          class="custom-cart-badge"
          :class="{ 'badge-pulse': animateBadge }"
          >{{ cartCount }}</q-badge
        >
      </q-btn>
    </header>

    <div class="q-pa-md">
      <q-btn
        flat
        icon="arrow_back"
        label="Volver al Catálogo"
        class="back-btn text-accent q-mb-md"
        @click="$emit('back')"
      />

      <div class="detail-grid q-mt-sm">
        <div class="image-wrap">
          <q-img :src="product.image" alt="" class="detail-qimg" img-class="detail-img" />
        </div>
        <div class="info-content flex flex-column justify-center">
          <div class="category-badge">{{ product.category }}</div>
          <h1 class="name font-serif">{{ product.name }}</h1>
          <p class="desc font-sans">{{ product.description }}</p>
          <div class="price font-serif">
            <span v-if="hasActiveSale(product)" class="regular-price">{{
              formatPrice(product.price)
            }}</span>
            <span>{{ formatPrice(getEffectivePrice(product)) }}</span>
          </div>
          <div :class="['stock-status', { empty: product.stock <= 0 }]">
            {{ product.stock > 0 ? `${product.stock} unidades disponibles` : 'Producto agotado' }}
          </div>

          <!-- Quantity Selector -->
          <div class="qty-select-wrapper flex items-center q-my-lg">
            <span class="qty-label">Cantidad:</span>
            <div class="qty-selector-pill flex items-center justify-between">
              <q-btn flat round size="sm" icon="remove" class="qty-btn" @click="decreaseQty" />
              <span class="qty-val">{{ quantity }}</span>
              <q-btn
                flat
                round
                size="sm"
                icon="add"
                class="qty-btn"
                :disable="quantity >= product.stock"
                @click="increaseQty"
              />
            </div>
          </div>

          <q-btn unelevated class="purchase-btn" :disable="product.stock <= 0" @click="onAddToCart">
            <q-icon name="shopping_bag" class="q-mr-sm" /> Agregar al carrito
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'
import { getEffectivePrice, hasActiveSale } from '../utils/pricing'

const props = defineProps({ product: { type: Object, required: true } })
const emit = defineEmits(['add-to-cart', 'back', 'toggle-menu', 'open-cart'])

const store = useShopStore()
const $q = useQuasar()

const quantity = ref(1)
const animateBadge = ref(false)

// Watch cart length changes to pulse the badge
watch(
  () => store.cart.length,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      animateBadge.value = true
      setTimeout(() => {
        animateBadge.value = false
      }, 350)
    }
  },
)

const cartCount = computed(() => store.cart.length)

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function increaseQty() {
  if (quantity.value < props.product.stock) {
    quantity.value++
  }
}

function decreaseQty() {
  if (quantity.value > 1) {
    quantity.value--
  }
}

function onAddToCart() {
  if (props.product.stock <= 0) return

  const currentQuantity = store.cart.find((item) => item.id === props.product.id)?.quantity || 0
  if (currentQuantity + quantity.value > props.product.stock) {
    $q.notify({
      message: 'Stock insuficiente',
      caption: `Solo hay ${props.product.stock} unidades disponibles.`,
      color: 'negative',
      textColor: 'white',
      icon: 'inventory_2',
    })
    return
  }

  emit('add-to-cart', { product: props.product, qty: quantity.value })
  $q.notify({
    message: 'Pieza agregada al carrito',
    caption: `${quantity.value}x ${props.product.name} ha sido añadida.`,
    position: 'bottom-right',
    timeout: 1800,
    classes: 'luxury-toast',
    icon: 'check_circle',
  })
}
</script>

<style scoped lang="scss">
.product-detail-root {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 90;
  background: rgba(247, 242, 238, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(180, 127, 96, 0.08);
  padding: 12px 16px;
}
.menu-trigger-btn {
  width: 42px;
  height: 42px;
  min-height: 42px;
  padding: 0;
  color: #333333;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(180, 127, 96, 0.15);
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: rgba(180, 127, 96, 0.08);
    border-color: #b47f60;
  }
}
.hamburger-lines {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 18px;
  height: 10px;
  margin: 0 auto;
}
.line {
  display: block;
  height: 1.5px;
  width: 100%;
  background-color: #333333;
  border-radius: 1px;
  transition: all 0.25s ease;
}
.line-2 {
  width: 65%;
  align-self: flex-start;
}
.menu-trigger-btn:hover .line-2 {
  width: 100%;
}
.brand {
  font-family: 'Playfair Display', serif;
  font-size: 19px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  color: #333333;
  display: flex;
  align-items: center;
  gap: 8px;
}
.brand-avatar {
  border: 1px solid rgba(180, 127, 96, 0.2);
  background: #ffffff;
}
.cart-trigger-btn {
  width: 42px;
  height: 42px;
  min-height: 42px;
  padding: 0;
  color: #333333;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(180, 127, 96, 0.15);
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: rgba(180, 127, 96, 0.08);
    border-color: #b47f60;
    color: #b47f60;
  }
}
.custom-cart-badge {
  background-color: #b47f60 !important;
  color: #ffffff;
  top: -2px;
  right: -2px;
  padding: 3px 6px;
  font-size: 10px;
  font-weight: 700;
  border: 1.5px solid #f7f2ee;
  border-radius: 10px;
}

.back-btn {
  font-size: 14px;
  font-weight: 600;
  text-transform: none;
  border-radius: 16px;
  padding: 6px 12px;
  &:hover {
    background: rgba(180, 127, 96, 0.08);
  }
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}
.image-wrap {
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 24px;
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(180, 127, 96, 0.15);
  padding: 8px;
}
.detail-qimg {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  overflow: hidden;
}
.detail-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.category-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 6px 14px;
  background: #ffffff;
  border: 1px solid rgba(180, 127, 96, 0.2);
  border-radius: 12px;
  color: #b47f60;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.name {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #333333;
  line-height: 1.2;
}
.desc {
  font-size: 15px;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 16px;
}
.price {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 28px;
  font-weight: 700;
  color: #b47f60;
  border-top: 1px solid rgba(180, 127, 96, 0.12);
  padding-top: 16px;
}
.regular-price {
  color: #999999;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 500;
  text-decoration: line-through;
}
.stock-status {
  color: #2e7d32;
  font-size: 13px;
  font-weight: 600;
  margin-top: 10px;
}
.stock-status.empty {
  color: #9e4f3f;
}

.qty-select-wrapper {
  .qty-label {
    font-size: 14px;
    font-weight: 600;
    color: #666666;
    margin-right: 16px;
  }
}

.qty-selector-pill {
  background-color: #ffffff;
  border-radius: 24px;
  height: 42px;
  padding: 0 6px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(180, 127, 96, 0.2);
  min-width: 110px;
}
.qty-btn {
  color: #b47f60;
  padding: 0;
  min-width: 30px;
  min-height: 30px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  &:hover {
    background-color: rgba(180, 127, 96, 0.08);
  }
}
.qty-val {
  font-size: 15px;
  font-weight: 600;
  color: #333333;
  min-width: 20px;
  text-align: center;
}

.purchase-btn {
  background-color: #b47f60 !important;
  color: white !important;
  padding: 14px 28px !important;
  font-size: 16px !important;
  border-radius: 30px !important;
  font-weight: 600 !important;
  text-transform: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  border: 1px solid #b47f60;
  width: 100%;
  max-width: 350px;
  box-shadow: 0 6px 20px rgba(180, 127, 96, 0.15);

  &:hover {
    background-color: transparent !important;
    color: #b47f60 !important;
    box-shadow: none;
  }
}

@media (min-width: 900px) {
  .detail-grid {
    grid-template-columns: 50% 50%;
    gap: 40px;
    align-items: center;
  }
  .name {
    font-size: 40px;
  }
  .image-wrap {
    padding: 12px;
  }
}

.flex-column {
  display: flex;
  flex-direction: column;
}
</style>
