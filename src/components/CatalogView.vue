<template>
  <div class="catalog-root">
    <!-- Header (mobile-first, centered brand) -->
    <header class="header flex items-center justify-between px-4 py-3">
      <q-btn flat round dense icon="menu" @click="$emit('toggle-menu')" />
      <div class="brand">
        JUAN INVERSIONES
        <q-img src="" class="logo-placeholder" />
      </div>
      <q-btn flat round dense icon="shopping_bag" @click="$emit('open-cart')">
        <q-badge color="accent" floating rounded v-if="cartCount">{{ cartCount }}</q-badge>
      </q-btn>
    </header>

    <!-- Hero banner full-bleed -->
    <section class="hero">
      <ImageWithFallback
        src="https://images.unsplash.com/photo-1727784892009-f3cf06199b65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
        class-name="hero-img"
      />
      <div class="container">
        <div class="hero-copy">
          <div class="eyebrow">Colección</div>
          <h2 class="hero-title">RADIANT DIAMOND LAWMI JEWELRY SET</h2>
          <p class="hero-sub">Timeless elegance with a brilliant, modern glow</p>
          <button class="cta">Ver Colección ›</button>
        </div>
      </div>
    </section>

    <!-- Categories horizontal scroll -->
    <section class="categories">
      <div class="container">
        <div class="row scroll">
          <div
            v-for="cat in categories"
            :key="cat.name"
            class="cat-item"
            @click="selectedCategory = cat.name"
          >
            <ImageWithFallback :src="cat.image" class-name="cat-img" />
            <div :class="['cat-label', { active: selectedCategory === cat.name }]">
              {{ cat.name }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Product grid -->
    <main class="grid-wrap">
      <div class="container">
        <div class="grid">
          <article
            v-for="product in filteredProducts"
            :key="product.id"
            class="product-card"
            @click="open(product)"
          >
            <div class="img-wrap">
              <ImageWithFallback :src="product.image" :alt="product.name" class-name="prod-img" />
              <button class="fav" @click.stop="toggleFavorite(product.id)">❤</button>
            </div>
            <div class="info">
              <h3 class="p-name">{{ product.name }}</h3>
              <div class="row-between">
                <div class="price">{{ product.price }}</div>
                <button class="add" @click.stop="addToCart(product)">＋</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useShopStore } from '../stores/shop'
import ImageWithFallback from './ImageWithFallback.vue'

const emit = defineEmits(['view-product', 'toggle-menu', 'open-cart'])
const store = useShopStore()

const categories = ref([
  { name: 'Rings', image: 'https://images.unsplash.com/photo-1499899833954-5ecd9439d17f?w=500' },
  { name: 'Chains', image: 'https://images.unsplash.com/photo-1596213411964-ee96819a396c?w=500' },
  {
    name: 'Bracelets',
    image: 'https://images.unsplash.com/photo-1612437830721-4f8eab90c5a9?w=500',
  },
  { name: 'Earrings', image: 'https://images.unsplash.com/photo-1704957205327-9fbd44d683b7?w=500' },
  { name: 'Relojes', image: 'https://images.unsplash.com/photo-1519741495165-61d2d3dd0a2a?w=500' },
  {
    name: 'Compromiso',
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500',
  },
])

const selectedCategory = ref('Rings')
const favorites = ref(new Set())

// Local mock products (temporary replacement for store.products)
const products = ref([
  {
    id: 1,
    name: 'Eternal Solitaire Ring',
    price: '$3,850',
    image: 'https://images.unsplash.com/photo-1499899833954-5ecd9439d17f?w=1080',
    category: 'Rings',
    description: 'A timeless 18k gold solitaire ring featuring a brilliant-cut diamond.',
  },
  {
    id: 2,
    name: 'Diamond Cascade Necklace',
    price: '$8,200',
    image: 'https://images.unsplash.com/photo-1596213411964-ee96819a396c?w=1080',
    category: 'Chains',
    description: 'An exquisite diamond necklace that gracefully adorns the neckline.',
  },
  {
    id: 3,
    name: 'Heritage Gold Bracelet',
    price: '$2,950',
    image: 'https://images.unsplash.com/photo-1612437830721-4f8eab90c5a9?w=1080',
    category: 'Bracelets',
    description: 'A luxurious 22k gold bracelet with intricate detailing.',
  },
  {
    id: 4,
    name: 'Pearl Elegance Earrings',
    price: '$1,680',
    image: 'https://images.unsplash.com/photo-1704957205327-9fbd44d683b7?w=1080',
    category: 'Earrings',
    description: 'Refined pearl earrings set in white gold.',
  },
])

const cartCount = computed(() => store.cart.length)

const filteredProducts = computed(() => {
  if (!selectedCategory.value) return products.value
  return products.value.filter((p) => p.category === selectedCategory.value)
})

function toggleFavorite(id) {
  if (favorites.value.has(id)) favorites.value.delete(id)
  else favorites.value.add(id)
}

function addToCart(product) {
  store.addToCart(product)
}

function open(product) {
  emit('view-product', product)
}
</script>

<style scoped>
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
}
.icon-btn {
  background: transparent;
  border: 0;
  font-size: 20px;
}
.brand {
  font-family: 'Playfair Display', serif;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.logo-placeholder {
  width: 36px;
  height: 36px;
  margin-left: 8px;
  background: transparent;
}
.badge {
  background: #b47f60;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 6px;
}

/* Hero — mobile: bottom-rounded; desktop: fully rounded with slight top margin */
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
  top: 40%;
  color: white;
  max-width: 520px;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}
.hero-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  margin: 8px 0;
}
.hero-sub {
  margin-bottom: 16px;
}
.cta {
  background: #b47f60;
  color: white;
  border-radius: 24px;
  padding: 10px 16px;
  border: 0;
}

/* Categories and grid respect the root padding; container inside catalog-root removes its extra horizontal padding */
.catalog-root .container {
  padding: 0;
}
.categories .scroll {
  display: flex;
  gap: 24px;
  padding: 18px 0;
  overflow-x: auto;
  justify-content: center;
  align-items: center;
}
.cat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 92px;
}
.cat-img {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
}
.cat-label {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
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
.add {
  background: #f7f2ee;
  border-radius: 50%;
  border: 0;
  width: 36px;
  height: 36px;
}

@media (min-width: 900px) {
  .catalog-root {
    padding: 0 32px;
  }
  .grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .hero {
    height: 500px;
    border-radius: 24px;
    margin-top: 16px;
  }
  .hero-title {
    font-size: 40px;
  }
}
</style>
