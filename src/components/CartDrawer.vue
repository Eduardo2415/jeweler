<template>
  <div class="cart-drawer-root">
    <!-- Overlay with backdrop blur -->
    <transition name="fade">
      <div v-if="open" class="cart-overlay" @click="$emit('close')"></div>
    </transition>

    <!-- Right Drawer -->
    <transition name="slide-drawer">
      <aside v-if="open" class="cart-drawer flex flex-column no-wrap">
        <!-- Drawer Header -->
        <div class="drawer-header flex items-center justify-between q-px-md q-py-sm">
          <div class="flex items-center">
            <q-icon name="shopping_bag" size="22px" class="q-mr-xs text-accent" />
            <span class="logo font-serif">Tu Carrito</span>
          </div>
          <q-btn flat round dense icon="close" class="close-btn" @click="$emit('close')" />
        </div>

        <!-- Scrollable content area -->
        <div class="drawer-scroll-area flex-1 overflow-auto q-px-md q-py-md">
          <!-- Empty State -->
          <div
            v-if="store.cart.length === 0"
            class="empty-state flex flex-column items-center justify-center q-py-xl text-center"
          >
            <q-icon name="shopping_bag" size="64px" class="text-accent-light q-mb-md" />
            <h3 class="empty-title font-serif">El carrito está vacío</h3>
            <p class="empty-desc">
              Explora nuestras colecciones exclusivas para añadir piezas extraordinarias.
            </p>
            <q-btn
              unelevated
              class="btn-continue-shopping q-mt-lg"
              label="Ver Colecciones"
              @click="$emit('close')"
            />
          </div>

          <!-- Items List -->
          <div v-else class="items-list flex flex-column gap-3">
            <div
              v-for="item in store.cart"
              :key="item.cartId"
              class="cart-item-card flex items-center q-pa-sm"
            >
              <!-- Thumbnail -->
              <div class="thumb-wrap q-mr-sm">
                <q-img :src="item.image" class="item-thumb" />
              </div>

              <!-- Info -->
              <div class="item-info flex-1">
                <div class="item-category">{{ item.category }}</div>
                <h4 class="item-name font-serif">{{ item.name }}</h4>
                <div v-if="item.selectedSize" class="text-caption text-accent font-sans q-mt-xs">
                  Talla: <strong>{{ item.selectedSize }}</strong>
                </div>
                <div class="item-price">{{ formatPrice(item.price) }}</div>
              </div>

              <!-- Controls / Trash -->
              <div class="item-actions flex flex-column items-end justify-between height-full">
                <q-btn
                  flat
                  round
                  dense
                  size="xs"
                  icon="delete_outline"
                  class="delete-btn q-mb-sm"
                  @click="removeItem(item.cartId)"
                />

                <div class="qty-control flex items-center">
                  <q-btn
                    flat
                    round
                    size="xs"
                    icon="remove"
                    class="qty-btn"
                    @click="decreaseQty(item.cartId)"
                  />
                  <span class="qty-val">{{ item.quantity }}</span>
                  <q-btn
                    flat
                    round
                    size="xs"
                    icon="add"
                    class="qty-btn"
                    :disable="item.quantity >= getAvailableStock(item)"
                    @click="increaseQty(item.cartId)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Drawer Footer Summary (only if cart is not empty) -->
        <div v-if="store.cart.length > 0" class="drawer-footer q-pa-lg">
          <div class="summary-row flex justify-between q-mb-sm">
            <span class="summary-label">Subtotal</span>
            <span class="summary-value">{{ formatPrice(store.cartTotal) }}</span>
          </div>
          <div class="summary-row flex justify-between q-mb-md">
            <span class="summary-label">Envío</span>
            <span class="summary-value text-accent font-weight-bold">Express Gratis</span>
          </div>

          <q-separator class="q-my-md custom-separator" />

          <div class="total-row flex justify-between q-mb-lg">
            <span class="total-label font-serif">Total Estimado</span>
            <span class="total-value font-serif">{{ formatPrice(store.cartTotal) }}</span>
          </div>

          <div class="premium-notice flex items-center q-mb-md q-pa-sm">
            <q-icon name="verified_user" size="18px" class="q-mr-xs text-accent" />
            <span class="notice-text">Entrega asegurada y discreta en showroom.</span>
          </div>

          <q-btn unelevated class="btn-checkout-whatsapp full-width" @click="goToCheckout">
            <q-icon name="shopping_cart_checkout" size="22px" class="q-mr-sm" />
            Iniciar Checkout
          </q-btn>
        </div>
      </aside>
    </transition>
  </div>
</template>

<script setup>
import { useShopStore } from '../stores/shop'

defineProps({
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['close', 'checkout'])
const store = useShopStore()

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getAvailableStock(item) {
  if (item.sizes && Array.isArray(item.sizes) && item.sizes.length > 0 && item.selectedSize) {
    const sizeObj = item.sizes.find(s => s.size === item.selectedSize)
    return sizeObj ? Number(sizeObj.stock) || 0 : 0
  }
  return Number(item.stock) || 0
}

function increaseQty(cartId) {
  const item = store.cart.find((i) => i.cartId === cartId)
  if (item) {
    store.updateQuantity(cartId, item.quantity + 1)
  }
}

function decreaseQty(cartId) {
  const item = store.cart.find((i) => i.cartId === cartId)
  if (item) {
    store.updateQuantity(cartId, item.quantity - 1)
  }
}

function removeItem(cartId) {
  store.removeFromCart(cartId)
}

function goToCheckout() {
  emit('close')
  emit('checkout')
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
  transform: translateX(100%);
}

.cart-drawer-root {
  font-family: 'Inter', sans-serif;
}

.cart-overlay {
  position: fixed;
  inset: 0;
  background: rgba(51, 51, 51, 0.4);
  backdrop-filter: blur(8px);
  z-index: 100;
}

.cart-drawer {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 85%;
  max-width: 380px;
  background: #ffffff; // Premium pure white for items contrast
  z-index: 110;
  border-radius: 32px 0 0 32px;
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.08);
  height: 100%;
}

.drawer-header {
  border-bottom: 1px solid rgba(180, 127, 96, 0.12);
  height: 64px;
  background-color: #f7f2ee; // Warm header
  border-radius: 32px 0 0 0;

  .logo {
    font-size: 19px;
    font-weight: 700;
    color: #333333;
    letter-spacing: 0.5px;
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
  background-color: #ffffff;
}

.empty-state {
  .text-accent-light {
    color: rgba(180, 127, 96, 0.3);
  }
  .empty-title {
    font-size: 20px;
    font-weight: 700;
    color: #333333;
    margin: 0 0 8px 0;
  }
  .empty-desc {
    font-size: 13px;
    color: #888888;
    max-width: 250px;
    line-height: 1.5;
  }
  .btn-continue-shopping {
    background-color: #b47f60;
    color: white;
    border-radius: 20px;
    text-transform: none;
    font-weight: 600;
    padding: 8px 20px;
  }
}

.cart-item-card {
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  transition: all 0.25s ease;
  box-shadow: 0 4px 12px rgba(180, 127, 96, 0.02);

  &:hover {
    box-shadow: 0 6px 16px rgba(180, 127, 96, 0.06);
    border-color: rgba(180, 127, 96, 0.3);
  }
}

.thumb-wrap {
  width: 70px;
  height: 70px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(180, 127, 96, 0.1);
  background-color: #fafafa;
}

.item-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  .item-category {
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #999999;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .item-name {
    font-size: 14px;
    font-weight: 700;
    color: #333333;
    margin: 0 0 4px 0;
    line-height: 1.2;
  }
  .item-price {
    font-size: 13px;
    color: #b47f60;
    font-weight: 600;
  }
}

.item-actions {
  .delete-btn {
    color: #999999;
    transition: color 0.2s ease;
    &:hover {
      color: #c10015;
    }
  }
}

.qty-control {
  background-color: #f7f2ee;
  border-radius: 16px;
  height: 30px;
  padding: 0 2px;
  border: 1px solid rgba(180, 127, 96, 0.1);

  .qty-btn {
    color: #b47f60;
    padding: 0;
    min-width: 20px;
    min-height: 20px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    &:hover {
      background-color: rgba(180, 127, 96, 0.1);
    }
  }

  .qty-val {
    font-size: 13px;
    font-weight: 600;
    color: #333333;
    min-width: 14px;
    text-align: center;
  }
}

.drawer-footer {
  background-color: #f7f2ee; // Luxury Cream contrast
  border-top: 1px solid rgba(180, 127, 96, 0.12);
  border-radius: 0 0 0 32px;

  .summary-row {
    font-size: 13px;
    .summary-label {
      color: #666666;
    }
    .summary-value {
      color: #333333;
      font-weight: 600;
    }
  }

  .custom-separator {
    background-color: rgba(180, 127, 96, 0.12);
  }

  .total-row {
    font-size: 18px;
    font-weight: 700;
    color: #333333;
    .total-label {
      letter-spacing: 0.5px;
    }
    .total-value {
      color: #b47f60;
    }
  }

  .premium-notice {
    background: rgba(180, 127, 96, 0.06);
    border-radius: 12px;
    border: 1px dashed rgba(180, 127, 96, 0.15);

    .notice-text {
      font-size: 10px;
      color: #666666;
      font-weight: 500;
      letter-spacing: 0.2px;
    }
  }

  .btn-checkout-whatsapp {
    background: #b47f60;
    color: #ffffff;
    border-radius: 24px;
    font-weight: 600;
    text-transform: none;
    font-size: 15px;
    padding: 12px 0;
    transition: all 0.3s ease;
    border: 1px solid #b47f60;
    box-shadow: 0 6px 20px rgba(180, 127, 96, 0.15);

    &:hover {
      background: transparent;
      color: #b47f60;
      box-shadow: none;
    }
  }
}

// Layout utilities
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
.height-full {
  height: 100%;
}
.gap-3 {
  gap: 12px;
}
</style>
