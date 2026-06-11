<template>
  <div class="catalog-root">
    <!-- Header (mobile-first, centered brand, luxury-grade) -->
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

    <!-- Hero banner carrusel dinámico -->
    <q-carousel
      v-if="store.banners && store.banners.length > 0"
      animated
      v-model="slide"
      navigation
      infinite
      :autoplay="store.bannerInterval"
      arrows
      transition-prev="slide-right"
      transition-next="slide-left"
      class="hero-carousel"
    >
      <q-carousel-slide
        v-for="(banner, idx) in store.banners"
        :key="banner.id"
        :name="idx"
        class="hero-slide"
        :style="{ backgroundImage: `url(${banner.image})` }"
      >
        <div class="hero-overlay"></div>
        <div class="hero-copy">
          <div class="eyebrow">{{ banner.eyebrow || 'Colección' }}</div>
          <h2 class="hero-title font-serif">{{ banner.title }}</h2>
          <p class="hero-sub font-sans">{{ banner.subtitle }}</p>
          <q-btn
            v-if="banner.button_text"
            unelevated
            class="cta font-sans"
            :label="banner.button_text"
            @click="onBannerClick(banner)"
          />
        </div>
      </q-carousel-slide>
    </q-carousel>

    <!-- Fallback si no hay banners cargados -->
    <section v-else class="hero">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1727784892009-f3cf06199b65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
        class-name="hero-img"
      />
      <div class="container">
        <div class="hero-copy">
          <div class="eyebrow">Colección</div>
          <h2 class="hero-title">RADIANT DIAMOND LAWMI JEWELRY SET</h2>
          <p class="hero-sub">Timeless elegance with a brilliant, modern glow</p>
          <button class="cta" @click="$emit('update:activeCategory', 'Rings')">Ver Colección ›</button>
        </div>
      </div>
    </section>

    <!-- Categories horizontal scroll -->
    <section class="categories">
      <div class="container">
        <div class="row scroll hide-scrollbar">
          <router-link
            v-for="cat in categories"
            :key="cat.value"
            :to="'/categoria/' + cat.value"
            class="cat-item no-decoration"
          >
            <ImageWithFallback
              :src="cat.image"
              :class-name="'cat-img' + (activeCategory === cat.value ? ' active' : '')"
            />
            <div :class="['cat-label', { active: activeCategory === cat.value }]">
              {{ cat.name }}
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Product grid -->
    <main class="grid-wrap">
      <div class="container">
        <div class="grid">
          <router-link
            v-for="product in filteredProducts"
            :key="product.id"
            :to="'/producto/' + product.id"
            class="product-card no-decoration"
          >
            <div class="img-wrap">
              <ImageWithFallback :src="product.image" :alt="product.name" class-name="prod-img" />
              <q-badge v-if="product.stock <= 0" class="stock-badge" color="dark">Agotado</q-badge>
              <button class="fav" @click.stop.prevent="toggleFavorite(product.id)">❤</button>
            </div>
            <div class="info">
              <h3 class="p-name">{{ product.name }}</h3>
              <div class="row-between">
                <div class="price-wrap">
                  <div v-if="hasActiveSale(product)" class="regular-price">
                    {{ formatPrice(product.price) }}
                  </div>
                  <div class="price">{{ formatPrice(getEffectivePrice(product)) }}</div>
                </div>

                <!-- Selector if product has sizes -->
                <div
                  v-if="product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0"
                  class="select-size-link flex items-center text-accent font-sans text-weight-bold"
                  style="cursor: pointer; font-size: 13px;"
                >
                  <span>Ver Tallas</span>
                  <q-icon name="chevron_right" size="16px" class="q-ml-xs" />
                </div>

                <!-- Quantity selector if already in cart -->
                <div
                  v-else-if="getProductQuantity(product.id) > 0"
                  class="qty-selector-pill flex items-center justify-between"
                >
                  <q-btn
                    flat
                    round
                    size="xs"
                    icon="remove"
                    class="qty-btn"
                    @click.stop.prevent="decreaseQuantity(product.id)"
                  />
                  <span class="qty-val">{{ getProductQuantity(product.id) }}</span>
                  <q-btn
                    flat
                    round
                    size="xs"
                    icon="add"
                    class="qty-btn"
                    :disable="getProductQuantity(product.id) >= product.stock"
                    @click.stop.prevent="increaseQuantity(product)"
                  />
                </div>

                <!-- Add button if not in cart -->
                <q-btn
                  v-else
                  flat
                  round
                  dense
                  class="add-btn"
                  icon="add"
                  :disable="product.stock <= 0"
                  @click.stop.prevent="addToCart(product)"
                />
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'
import ImageWithFallback from './ImageWithFallback.vue'
import { getEffectivePrice, hasActiveSale } from '../utils/pricing'

const props = defineProps({
  categories: { type: Array, required: true },
  activeCategory: { type: String, required: true },
})

const emit = defineEmits(['view-product', 'toggle-menu', 'open-cart', 'update:activeCategory'])
const store = useShopStore()
const $q = useQuasar()

const slide = ref(0)

function onBannerClick(banner) {
  if (!banner.button_link) return
  
  // Check if link matches a category name or value
  const matchingCategory = props.categories.find(
    c => c.value.toLowerCase() === banner.button_link.toLowerCase() ||
         c.name.toLowerCase() === banner.button_link.toLowerCase()
  )
  
  if (matchingCategory) {
    emit('update:activeCategory', matchingCategory.value)
  } else if (banner.button_link.startsWith('http://') || banner.button_link.startsWith('https://')) {
    window.open(banner.button_link, '_blank')
  } else {
    emit('update:activeCategory', banner.button_link)
  }
}

const favorites = ref(new Set())
const animateBadge = ref(false)

// Local mock products with numeric prices
const products = ref([
  {
    id: 1,
    name: 'Eternal Solitaire Ring',
    price: 3850,
    image: 'https://images.unsplash.com/photo-1499899833954-5ecd9439d17f?w=1080',
    category: 'Rings',
    description: 'A timeless 18k gold solitaire ring featuring a brilliant-cut diamond.',
  },
  {
    id: 2,
    name: 'Diamond Cascade Necklace',
    price: 8200,
    image: 'https://images.unsplash.com/photo-1596213411964-ee96819a396c?w=1080',
    category: 'Chains',
    description: 'An exquisite diamond necklace that gracefully adorns the neckline.',
  },
  {
    id: 3,
    name: 'Heritage Gold Bracelet',
    price: 2950,
    image: 'https://images.unsplash.com/photo-1612437830721-4f8eab90c5a9?w=1080',
    category: 'Bracelets',
    description: 'A luxurious 22k gold bracelet with intricate detailing.',
  },
  {
    id: 4,
    name: 'Pearl Elegance Earrings',
    price: 1680,
    image: 'https://images.unsplash.com/photo-1704957205327-9fbd44d683b7?w=1080',
    category: 'Earrings',
    description: 'Refined pearl earrings set in white gold.',
  },
])

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

const filteredProducts = computed(() => {
  const catalogList = store.products && store.products.length > 0 ? store.products : products.value
  const activeCat = props.activeCategory
  if (!activeCat) return catalogList

  const categoryMap = {
    Rings: 1,
    Chains: 2,
    Relojes: 3,
    Bracelets: 4,
    Earrings: 5,
    Collares: 6,
    Compromiso: 6,
  }
  const numericId = categoryMap[activeCat]

  return catalogList.filter((p) => {
    const matchesString =
      p.category &&
      typeof p.category === 'string' &&
      p.category.toLowerCase() === activeCat.toLowerCase()
    const matchesId = p.categoryId !== undefined && p.categoryId === numericId
    return matchesString || matchesId
  })
})

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getProductQuantity(productId) {
  const item = store.cart.find((i) => i.id === productId)
  return item ? item.quantity : 0
}

function increaseQuantity(product) {
  if (!store.addToCart(product, 1)) {
    notifyStockLimit(product)
  }
}

function decreaseQuantity(productId) {
  const item = store.cart.find((i) => i.id === productId)
  if (item) {
    store.updateQuantity(productId, item.quantity - 1)
  }
}

function toggleFavorite(id) {
  if (favorites.value.has(id)) favorites.value.delete(id)
  else favorites.value.add(id)
}

function addToCart(product) {
  if (!store.addToCart(product, 1)) {
    notifyStockLimit(product)
    return
  }
  $q.notify({
    message: 'Pieza agregada al carrito',
    caption: `${product.name} ha sido añadida.`,
    position: 'bottom-right',
    timeout: 1800,
    classes: 'luxury-toast',
    icon: 'check_circle',
  })
}

function notifyStockLimit(product) {
  $q.notify({
    message: product.stock > 0 ? 'Stock máximo alcanzado' : 'Producto agotado',
    caption:
      product.stock > 0
        ? `Solo hay ${product.stock} unidades disponibles.`
        : 'Esta pieza no tiene unidades disponibles.',
    color: 'negative',
    textColor: 'white',
    icon: 'inventory_2',
  })
}

</script>

<style scoped>
.no-decoration {
  text-decoration: none !important;
  color: inherit !important;
}
/* Root boxed layout for catalog */
.catalog-root {
  max-width: 1280px;
  margin: 0 auto;
  width: 100%;
  padding: 0 8px;
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

/* Hero & Carousel Styles */
.hero-carousel {
  position: relative;
  height: 420px;
  border-radius: 0 0 24px 24px;
  background-color: #f7f2ee;
  overflow: hidden;
}
.hero-carousel ::v-deep(.q-carousel__control) {
  z-index: 10 !important;
}
.hero-carousel ::v-deep(.q-carousel__arrow) {
  z-index: 10 !important;
}
.hero-carousel ::v-deep(.q-carousel__navigation) {
  z-index: 10 !important;
}
.hero-slide {
  padding: 0;
  position: relative;
  background-size: cover;
  background-position: center;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.15), rgba(0, 0, 0, 0.55));
  z-index: 1;
}
.hero {
  position: relative;
  height: 420px;
  overflow: hidden;
  border-radius: 0 0 24px 24px;
}
.hero-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-copy {
  position: absolute;
  left: 24px;
  bottom: 40px; /* Aligned from bottom for better fit */
  color: white;
  max-width: 520px;
  z-index: 2;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
  font-weight: 600;
}
.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  margin: 8px 0;
  line-height: 1.2;
}
.hero-sub {
  margin-bottom: 16px;
  font-size: 13px;
  opacity: 0.95;
  line-height: 1.4;
}
.cta {
  background: #b47f60 !important;
  color: white !important;
  border-radius: 24px;
  padding: 10px 24px;
  border: 0;
  text-transform: none;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.25);
  transition: all 0.3s ease;
  font-size: 13px;
  &:hover {
    background: #ffffff !important;
    color: #b47f60 !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.15);
  }
}

/* Categories and grid respect the root padding; container inside catalog-root removes its extra horizontal padding */
.catalog-root .container {
  padding: 0;
}
.categories .scroll {
  display: flex;
  gap: 24px;
  padding: 18px 8px;
  overflow-x: auto;
  justify-content: flex-start;
  align-items: center;
  -webkit-overflow-scrolling: touch;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  scrollbar-width: none;
}
@media (min-width: 768px) {
  .categories .scroll {
    justify-content: center;
  }
}
.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
  cursor: pointer;
}
.cat-img {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(180, 127, 96, 0.15);
  padding: 2px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: #ffffff;
}
.cat-img.active {
  border-color: #b47f60;
  box-shadow: 0 6px 16px rgba(180, 127, 96, 0.25);
  transform: translateY(-2px);
}
.cat-label {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
  font-weight: 500;
  transition: color 0.2s ease;
}
.cat-label.active {
  color: #b47f60;
  font-weight: 600;
}
.grid-wrap {
  padding: 18px 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.product-card {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: none;
}
.img-wrap {
  position: relative;
  background: #fafafa;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
}
.prod-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.fav {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  border: 0;
}
.stock-badge {
  left: 10px;
  position: absolute;
  top: 10px;
  z-index: 2;
}
.info {
  padding: 12px;
}
.p-name {
  font-family: 'Playfair Display', serif;
  font-size: 15px;
  margin: 0 0 8px;
}
.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.price {
  color: #b47f60;
  font-weight: 700;
}
.price-wrap {
  display: flex;
  flex-direction: column;
}
.regular-price {
  color: #999999;
  font-size: 12px;
  text-decoration: line-through;
}
.add-btn {
  background-color: #f7f2ee;
  color: #b47f60;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  min-height: 36px;
  min-width: 36px;
  padding: 0;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  z-index: 5;
  &:hover {
    background-color: #b47f60;
    color: #ffffff;
    transform: scale(1.08);
  }
}

@media (min-width: 900px) {
  .catalog-root {
    padding: 0 32px;
  }
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .hero, .hero-carousel {
    height: 500px;
    border-radius: 24px;
    margin-top: 16px;
  }
  .hero-title {
    font-size: 40px;
  }
}

.qty-selector-pill {
  background-color: #f7f2ee;
  border-radius: 20px;
  height: 36px;
  padding: 0 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  min-width: 96px;
  position: relative;
  z-index: 5;
}
.qty-btn {
  color: #b47f60;
  padding: 0;
  min-width: 26px;
  min-height: 26px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  &:hover {
    background-color: rgba(180, 127, 96, 0.1);
  }
}
.qty-val {
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  min-width: 16px;
  text-align: center;
}
</style>
