<template>
  <div class="navigation-root">
    <!-- Overlay with backdrop blur -->
    <transition name="fade">
      <div v-if="open" class="menu-overlay" @click="$emit('close')"></div>
    </transition>

    <!-- Side Drawer -->
    <transition name="slide-drawer">
      <aside v-if="open" class="menu-drawer flex flex-column no-wrap">
        <!-- Drawer Header -->
        <div class="drawer-header flex items-center justify-between q-px-md q-py-sm">
          <span class="logo font-serif">JUAN INVERSIONES</span>
          <q-btn flat round dense icon="close" class="close-btn" @click="$emit('close')" />
        </div>

        <!-- Scrollable content area -->
        <div class="drawer-scroll-area flex-1 overflow-auto q-px-lg q-py-md">
          <!-- Quick Links (General) -->
          <div class="nav-section animate-fade-in" style="animation-delay: 0.05s">
            <span class="section-title">Explorar</span>
            <ul class="quick-links">
              <li>
                <a href="#" @click.prevent="navigateScreen('catalog')" class="quick-link-item">
                  <q-icon name="dashboard" size="20px" class="q-mr-sm text-accent-color" />
                  Catálogo Completo
                </a>
              </li>
              <li>
                <a href="#" @click.prevent="navigateScreen('orders')" class="quick-link-item">
                  <q-icon name="receipt_long" size="20px" class="q-mr-sm text-accent-color" />
                  {{ store.currentUser ? 'Mis Pedidos / Cuenta' : 'Mis Pedidos (Transferencias)' }}
                </a>
              </li>
            </ul>
          </div>

          <q-separator class="q-my-md custom-separator" />

          <!-- Visual Categories Grid -->
          <div class="nav-section animate-fade-in" style="animation-delay: 0.15s">
            <span class="section-title">Colecciones Exclusivas</span>
            <div class="categories-grid">
              <button
                v-for="(cat, idx) in categories"
                :key="cat.value"
                class="category-card"
                :class="{ active: activeCategory === cat.value }"
                @click="navigateCategory(cat.value)"
                :style="{ animationDelay: `${0.2 + idx * 0.05}s` }"
              >
                <div class="img-container">
                  <q-img :src="cat.image" class="cat-thumb" />
                  <div class="active-ring" v-if="activeCategory === cat.value"></div>
                </div>
                <span class="cat-name">{{ cat.name }}</span>
              </button>
            </div>
          </div>

          <!-- Premium WhatsApp CTA Card -->
          <div class="premium-cta-card q-mt-lg animate-fade-in" style="animation-delay: 0.5s">
            <div class="card-bg-glow"></div>
            <div class="card-content">
              <div class="flex items-center q-mb-xs">
                <q-icon name="chat" size="24px" class="q-mr-sm" />
                <span class="premium-badge">SERVICIO EXCLUSIVO</span>
              </div>
              <h4 class="card-title">Asesoría Personalizada</h4>
              <p class="card-desc">
                Conéctate directamente con nuestro Concierge para una atención a medida.
              </p>
              <q-btn unelevated class="btn-whatsapp-premium full-width" @click="openWhatsApp">
                <q-icon name="whatsapp" size="20px" class="q-mr-sm" />
                Contactar Asesor
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Drawer Footer -->
        <div class="drawer-footer q-pa-md bg-cream-dark flex flex-column items-center">
          <div class="footer-logo font-serif q-mb-xs">JUAN INVERSIONES</div>
          <div class="footer-hours q-mb-md">Atención: Lun - Sáb: 10:00 - 20:00</div>
          <div class="social-row flex justify-center gap-4">
            <a href="https://instagram.com" target="_blank" class="social-link">
              <q-icon name="camera_alt" size="20px" />
            </a>
            <a href="https://wa.me/5491112345678" target="_blank" class="social-link">
              <q-icon name="whatsapp" size="20px" />
            </a>
            <a href="mailto:info@juaninversiones.com" class="social-link">
              <q-icon name="mail_outline" size="20px" />
            </a>
          </div>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { useShopStore } from '../stores/shop'

const { open, categories, activeCategory } = defineProps({
  open: { type: Boolean, default: false },
  categories: { type: Array, default: () => [] },
  activeCategory: { type: String, default: '' },
})

const emit = defineEmits(['select-category', 'select-screen', 'close'])
const store = useShopStore()

const navigateCategory = (categoryValue) => {
  emit('select-category', categoryValue)
}

const navigateScreen = (screenName) => {
  emit('select-screen', screenName)
}

const openWhatsApp = () => {
  const message =
    'Hola JUAN INVERSIONES, me gustaría recibir asesoría personalizada sobre sus exclusivas piezas de joyería.'
  const url = `https://wa.me/5491112345678?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
</script>

<style scoped lang="scss">
// Transitions
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-drawer-enter-active,
.slide-drawer-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-drawer-enter-from,
.slide-drawer-leave-to {
  transform: translateX(-100%);
}

.navigation-root {
  font-family: 'Inter', sans-serif;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(51, 51, 51, 0.4);
  backdrop-filter: blur(8px);
  z-index: 100;
}

.menu-drawer {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 85%;
  max-width: 380px;
  background: #f7f2ee; // Luxury Cream
  z-index: 110;
  border-radius: 0 32px 32px 0;
  box-shadow: 10px 0 40px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.drawer-header {
  border-bottom: 1px solid rgba(180, 127, 96, 0.12);
  height: 64px;
  .logo {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #333333;
  }
  .close-btn {
    color: #333333;
    transition: transform 0.2s ease;
    &:hover {
      transform: rotate(90deg);
      color: #b47f60;
    }
  }
}

.drawer-scroll-area {
  background-color: #f7f2ee;
}

.section-title {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #b47f60;
  font-weight: 600;
  margin-bottom: 16px;
}

.quick-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .quick-link-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    background: #ffffff;
    border-radius: 16px;
    color: #333333;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.25s ease;
    border: 1px solid transparent;

    &:hover {
      background: #ffffff;
      border-color: rgba(180, 127, 96, 0.3);
      color: #b47f60;
      transform: translateX(4px);
    }

    .text-accent-color {
      color: #b47f60;
    }
  }
}

.custom-separator {
  background-color: rgba(180, 127, 96, 0.12);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.category-card {
  background: none;
  border: none;
  padding: 8px 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  outline: none;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(15px);
  animation: itemReveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;

  &:hover {
    transform: translateY(-2px);
    .cat-name {
      color: #b47f60;
    }
    .img-container {
      box-shadow: 0 6px 16px rgba(180, 127, 96, 0.25);
    }
  }

  &.active {
    .cat-name {
      color: #b47f60;
      font-weight: 600;
    }
    .img-container {
      box-shadow: 0 4px 12px rgba(180, 127, 96, 0.2);
    }
  }

  .img-container {
    position: relative;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    overflow: visible; // To let active-ring overflow beautifully
    transition: all 0.3s ease;
    background: #ffffff;
    padding: 3px;
    border: 1px solid rgba(180, 127, 96, 0.15);
  }

  .cat-thumb {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }

  .active-ring {
    position: absolute;
    inset: -3px;
    border: 2px solid #b47f60;
    border-radius: 50%;
    pointer-events: none;
  }

  .cat-name {
    font-size: 12px;
    color: #666666;
    font-weight: 500;
    text-align: center;
    transition: color 0.2s ease;
  }
}

.premium-cta-card {
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  padding: 20px;
  overflow: hidden;
  border: 1px solid rgba(180, 127, 96, 0.2);
  box-shadow: 0 10px 30px rgba(180, 127, 96, 0.05);

  .card-bg-glow {
    position: absolute;
    right: -20px;
    bottom: -20px;
    width: 120px;
    height: 120px;
    background: radial-gradient(circle, rgba(180, 127, 96, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .card-content {
    position: relative;
    z-index: 2;
    color: #333333;
  }

  .premium-badge {
    font-size: 10px;
    letter-spacing: 1.5px;
    font-weight: 700;
    color: #b47f60;
    background: rgba(180, 127, 96, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 18px;
    font-weight: 700;
    margin: 8px 0 4px 0;
    color: #333333;
  }

  .card-desc {
    font-size: 12px;
    color: #666666;
    line-height: 1.5;
    margin-bottom: 16px;
  }

  .btn-whatsapp-premium {
    background: #b47f60;
    color: #ffffff;
    border-radius: 20px;
    font-weight: 600;
    text-transform: none;
    font-size: 14px;
    padding: 10px 0;
    transition: all 0.3s ease;
    border: 1px solid #b47f60;

    &:hover {
      background: transparent;
      color: #b47f60;
    }
  }
}

.drawer-footer {
  border-top: 1px solid rgba(180, 127, 96, 0.1);
  background-color: #faf7f4;

  .footer-logo {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #666666;
  }

  .footer-hours {
    font-size: 11px;
    color: #999999;
  }

  .social-row {
    .social-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #ffffff;
      color: #b47f60;
      border: 1px solid rgba(180, 127, 96, 0.15);
      transition: all 0.25s ease;
      text-decoration: none;

      &:hover {
        background: #b47f60;
        color: #ffffff;
        transform: translateY(-2px);
      }
    }
  }
}

// Fade in items animation keyframe
@keyframes itemReveal {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  opacity: 0;
  animation: itemReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

// Layout adjustments
.flex-column {
  display: flex;
  flex-direction: column;
}
.flex-1 {
  flex: 1;
}
.no-wrap {
  flex-wrap: nowrap;
}
.overflow-auto {
  overflow-y: auto;
}
</style>
