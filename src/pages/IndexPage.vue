<template>
  <q-page class="bg-custom-cream min-h-screen">
    <NavigationMenu
      :open="menuOpen"
      :items="menuItems"
      @close="menuOpen = false"
      @select="onMenuSelect"
    />

    <CatalogView
      v-if="currentScreen === 'catalog'"
      @view-product="openProduct"
      @toggle-menu="menuOpen = true"
      @open-cart="openCart"
    />

    <ProductDetail
      v-else-if="currentScreen === 'detail' && selectedProduct"
      :product="selectedProduct"
      @back="currentScreen = 'catalog'"
      @add-to-cart="
        (p) => {
          addToCart(p)
          currentScreen = 'catalog'
        }
      "
    />

    <SiteFooter />
  </q-page>
</template>


<script setup>
import { ref } from 'vue'
import CatalogView from '../components/CatalogView.vue'
import ProductDetail from '../components/ProductDetail.vue'
import NavigationMenu from '../components/NavigationMenu.vue'
import SiteFooter from '../components/SiteFooter.vue'
import { useShopStore } from '../stores/shop'

const store = useShopStore()

const currentScreen = ref('catalog')
const menuOpen = ref(false)
const selectedProduct = ref(null)

const menuItems = ['Home', 'New Arrivals', 'Rings', 'Necklaces & Chains', 'Bracelets', 'About Us']

const openProduct = (product) => {
  selectedProduct.value = product
  currentScreen.value = 'detail'
}

const addToCart = (product) => {
  store.addToCart(product)
}

const openCart = () => {
  // placeholder: could open a cart drawer or navigate to cart
  console.log('open cart')
}

const onMenuSelect = (item) => {
  menuOpen.value = false
  // basic demo routing behavior
  if (item === 'Home') currentScreen.value = 'onboarding'
  if (item === 'New Arrivals') currentScreen.value = 'catalog'
}
</script>

<style scoped>
/* IMPORTAR FUENTES EXACTAS DE FIGMA */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700&display=swap');

/* TIPOGRAFÍA BASE */
.font-serif {
  font-family: 'Playfair Display', serif;
}
.font-sans {
  font-family: 'Inter', sans-serif;
}
.leading-tight {
  line-height: 1.1;
}
.leading-relaxed {
  line-height: 1.6;
}

/* COLORES EXACTOS */
.bg-custom-cream {
  background-color: #f7f2ee;
}
.bg-accent {
  background-color: #b47f60;
}
.text-accent {
  color: #b47f60;
}
.btn-accent {
  background-color: #b47f60;
  border-radius: 24px;
}
.text-dark {
  color: #333333;
}

/* BORDES Y FORMAS */
.rounded-24 {
  border-radius: 24px;
  overflow: hidden;
}
.rounded-12 {
  border-radius: 12px;
}
.border-radius-bottom {
  border-radius: 0 0 24px 24px;
}
.aspect-square {
  aspect-ratio: 1 / 1;
}
.w-full {
  width: 100%;
}
.h-full {
  height: 100%;
}
.max-w-1440 {
  max-width: 1440px;
}

/* OVERLAYS Y GRADIENTES */
.bg-black-overlay {
  background-color: rgba(0, 0, 0, 0.4);
}
.bg-gradient-hero {
  background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.5));
}
.bg-gradient-banner {
  background: linear-gradient(to right, rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4), transparent);
}
.bg-white-80 {
  background-color: rgba(255, 255, 255, 0.8);
}
.backdrop-blur {
  backdrop-filter: blur(4px);
}

/* UTILIDADES PERSONALIZADAS */
.space-y-4 > * + * {
  margin-top: 1rem;
}
.space-y-6 > * + * {
  margin-top: 1.5rem;
}
.space-y-8 > * + * {
  margin-top: 2rem;
}
.gap-3 {
  gap: 0.75rem;
}
.gap-4 {
  gap: 1rem;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  scrollbar-width: none;
}
.bullet-point {
  width: 6px;
  height: 6px;
  background-color: #b47f60;
  border-radius: 50%;
}

/* ANIMACIONES */
.hover-scale {
  transition: transform 0.3s ease;
}
.hover-scale:hover {
  transform: scale(1.05);
}
.hover-scale-sm {
  transition: transform 0.3s ease;
}
.hover-scale-sm:hover {
  transform: scale(1.02);
}
.hover-opacity {
  transition: opacity 0.3s ease;
}
.hover-opacity:hover {
  opacity: 0.7;
}

/* COMPONENTES DEL MENÚ */
.menu-link {
  font-family: 'Playfair Display', serif;
  font-size: 32px;
  color: #333333;
  text-decoration: none;
  line-height: 1.2;
  transition: color 0.3s ease;
}
.menu-link:hover {
  color: #b47f60;
}
.menu-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #999999;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 12px;
}
.social-icon {
  padding: 12px;
  color: #b47f60;
  transition: opacity 0.3s ease;
}
.social-icon:hover {
  opacity: 0.7;
}

/* CÍRCULOS DE CATEGORÍA */
.cat-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  transition: all 0.3s ease;
}
@media (min-width: 768px) {
  .cat-circle {
    width: 80px;
    height: 80px;
  }
  .md-h-500 {
    height: 500px;
  }
  .md-flex {
    display: flex;
  }
  .md-hidden {
    display: none;
  }
  .md-q-px-xl {
    padding-left: 48px;
    padding-right: 48px;
  }
  .md-q-pa-xl {
    padding: 48px;
  }
  .md-q-mb-none {
    margin-bottom: 0;
  }
}
</style>
