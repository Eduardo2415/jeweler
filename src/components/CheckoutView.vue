<template>
  <div class="checkout-root">
    <!-- Header -->
    <header class="header flex items-center justify-between px-4 py-3">
      <q-btn flat round dense icon="arrow_back" class="back-btn" @click="$emit('back')" />
      <div class="brand font-serif flex items-center gap-2">
        <q-avatar size="28px" class="brand-avatar">
          <q-img src="/logo1.jpeg" />
        </q-avatar>
        <span>JUAN INVERSIONES</span>
      </div>
      <div style="width: 42px"></div>
      <!-- Spacer for symmetry -->
    </header>

    <div class="q-pa-md">
      <!-- Success / Confirmation Screen -->
      <div
        v-if="completedOrder"
        class="success-screen flex flex-column items-center justify-center text-center q-py-xl"
      >
        <q-icon name="check_circle" size="72px" class="text-accent q-mb-md" />
        <h2 class="success-title font-serif">¡Pedido Registrado!</h2>
        <p class="success-desc font-sans q-px-md">
          Tu orden ha sido registrada en el sistema de JUAN INVERSIONES.
        </p>

        <div class="order-ref-card q-ma-lg q-pa-md flex flex-column items-center">
          <span class="ref-label font-sans">REFERENCIA DE DEPÓSITO</span>
          <span class="ref-code font-serif">{{ completedOrder.id }}</span>
          <p class="ref-instruction font-sans">
            Coloca este código exacto en el concepto de tu transferencia bancaria.
          </p>
        </div>

        <div class="next-steps-card q-pa-md q-mb-lg font-sans">
          <h4 class="steps-title text-accent">Pasos a Seguir:</h4>
          <ol class="steps-list">
            <li>
              Transfiere el total de <strong>{{ formatPrice(completedOrder.total) }}</strong> a una
              de nuestras cuentas.
            </li>
            <li v-if="store.currentUser">
              Ve a <strong>Mis Pedidos</strong> y sube el comprobante para validar tu pago.
            </li>
            <li v-else>Guarda tu código de referencia y envía el comprobante a nuestro asesor.</li>
          </ol>
        </div>

        <div class="flex justify-center gap-4 full-width font-sans">
          <q-btn
            v-if="store.currentUser"
            unelevated
            class="btn-primary"
            label="Ir a Mis Pedidos"
            @click="$emit('navigate', 'orders')"
          />
          <q-btn
            v-else
            unelevated
            class="btn-primary"
            label="Registrarse / Crear Cuenta"
            @click="authDialogOpen = true"
          />
          <q-btn
            flat
            class="btn-flat text-accent"
            label="Volver al Catálogo"
            @click="$emit('back')"
          />
        </div>
      </div>

      <!-- Main Checkout Layout -->
      <div v-else class="checkout-grid q-mt-md">
        <!-- Order Summary (Left Column) -->
        <div class="summary-column">
          <h3 class="section-title font-serif q-mb-md">Resumen de Orden</h3>
          <div class="summary-card q-pa-md">
            <!-- Items list -->
            <div class="summary-items flex flex-column gap-3 q-mb-md">
              <div v-for="item in store.cart" :key="item.cartId" class="summary-item flex items-center">
                <q-img :src="item.image" class="item-thumb q-mr-sm" />
                <div class="item-details flex-1">
                  <h4 class="item-name font-serif">{{ item.name }}</h4>
                  <div class="flex items-center gap-3">
                    <span class="item-qty font-sans">Cantidad: {{ item.quantity }}</span>
                    <q-badge v-if="item.selectedSize" color="accent" outline dense class="text-xs">
                      Talla: {{ item.selectedSize }}
                    </q-badge>
                  </div>
                </div>
                <div class="item-price font-serif">
                  {{ formatPrice(item.price * item.quantity) }}
                </div>
              </div>
            </div>

            <q-separator class="q-my-md custom-separator" />

            <!-- Subtotal / Total -->
            <div class="summary-rows font-sans">
              <div class="summary-row flex justify-between q-mb-sm">
                <span>Subtotal</span>
                <span>{{ formatPrice(store.cartTotal) }}</span>
              </div>
              <div class="summary-row flex justify-between q-mb-md">
                <span>Envío Asegurado</span>
                <span class="text-accent font-weight-bold">Gratis</span>
              </div>
              <q-separator class="q-my-sm" />
              <div class="total-row flex justify-between font-serif q-mt-md">
                <span>Total</span>
                <span class="text-accent">{{ formatPrice(store.cartTotal) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Payment and Authentication (Right Column) -->
        <div class="payment-column flex flex-column gap-4">
          <h3 class="section-title font-serif">Método de Pago</h3>

          <!-- Payment Options Toggle -->
          <div class="payment-methods-grid">
            <button
              class="payment-method-card"
              :class="{ active: paymentMethod === 'whatsapp' }"
              @click="paymentMethod = 'whatsapp'"
            >
              <q-icon name="whatsapp" size="28px" class="q-mb-xs" />
              <span class="method-title font-serif">Asesor WhatsApp</span>
              <span class="method-desc font-sans">Pedido rápido vía chat</span>
            </button>

            <button
              class="payment-method-card"
              :class="{ active: paymentMethod === 'transfer' }"
              @click="paymentMethod = 'transfer'"
            >
              <q-icon name="account_balance" size="28px" class="q-mb-xs" />
              <span class="method-title font-serif">Transferencia</span>
              <span class="method-desc font-sans">Cuentas bancarias directas</span>
            </button>
          </div>

          <!-- Flow A: WhatsApp Checkout -->
          <div v-if="paymentMethod === 'whatsapp'" class="method-flow-card q-pa-md font-sans">
            <p class="flow-desc text-center">
              Al finalizar, serás redirigido a WhatsApp con un mensaje pre-formateado que contiene
              tu pedido para que un asesor personal valide tu compra.
            </p>
            <q-btn unelevated class="btn-primary full-width q-py-sm" @click="checkoutWhatsApp">
              <q-icon name="whatsapp" size="20px" class="q-mr-sm" />
              Finalizar Pedido en WhatsApp
            </q-btn>
          </div>

          <!-- Flow B: Bank Transfer Checkout -->
          <div v-else class="method-flow-card q-pa-md flex flex-column gap-4 font-sans">
            <!-- State 1: Ask for authentication (if not logged in and not continuing as guest) -->
            <div
              v-if="!store.currentUser && !guestCheckout"
              class="auth-prompt flex flex-column items-center text-center gap-3 q-py-md"
            >
              <q-icon name="lock_outline" size="40px" class="text-accent" />
              <h4 class="auth-prompt-title font-serif">Registro Requerido para Historial</h4>
              <p class="auth-prompt-desc">
                Inicia sesión para poder subir tu comprobante de pago y consultar el estado de tu
                pedido posteriormente. O continúa como invitado sin historial.
              </p>

              <div class="flex flex-column gap-2 full-width">
                <q-btn
                  unelevated
                  class="btn-primary full-width"
                  label="Iniciar Sesión / Registrarse"
                  @click="authDialogOpen = true"
                />
                <q-btn
                  flat
                  class="btn-flat text-accent full-width"
                  label="Continuar como Invitado"
                  @click="guestCheckout = true"
                />
              </div>
            </div>

            <!-- State 2: Show deposit accounts (if logged in or guestCheckout is true) -->
            <div v-else-if="activeBankAccounts.length > 0" class="deposit-details flex flex-column gap-3">
              <div class="flex justify-between items-center">
                <span class="step-label">1. Elige un banco para transferir:</span>
                <span v-if="store.currentUser" class="user-badge flex items-center">
                  <q-icon name="account_circle" size="16px" class="q-mr-xs" />
                  {{ store.currentUser.email }}
                </span>
              </div>

              <!-- Bank selector -->
              <div class="bank-selector flex gap-3 flex-wrap">
                <button
                  v-for="bank in activeBankAccounts"
                  :key="bank.id"
                  class="bank-card flex-1 min-width-120"
                  :class="{ active: selectedBankId === bank.id }"
                  @click="selectedBankId = bank.id"
                >
                  <span class="bank-name font-serif">{{ bank.banco }}</span>
                </button>
              </div>

              <!-- Bank data card -->
              <div v-if="currentBankData" class="bank-details-card q-pa-md">
                <div class="bank-field flex items-center justify-between q-py-xs">
                  <div class="field-info flex flex-column">
                    <span class="field-label text-uppercase">Banco</span>
                    <span class="field-value">{{ currentBankData.banco }}</span>
                  </div>
                  <q-btn flat round dense size="sm" icon="content_copy" class="copy-btn" @click="copyText(currentBankData.banco, 'Banco')" />
                </div>
                <div class="bank-field flex items-center justify-between q-py-xs">
                  <div class="field-info flex flex-column">
                    <span class="field-label text-uppercase">Cuenta</span>
                    <span class="field-value">{{ currentBankData.cuenta }}</span>
                  </div>
                  <q-btn flat round dense size="sm" icon="content_copy" class="copy-btn" @click="copyText(currentBankData.cuenta, 'Cuenta')" />
                </div>
                <div class="bank-field flex items-center justify-between q-py-xs">
                  <div class="field-info flex flex-column">
                    <span class="field-label text-uppercase">Titular</span>
                    <span class="field-value">{{ currentBankData.titular }}</span>
                  </div>
                  <q-btn flat round dense size="sm" icon="content_copy" class="copy-btn" @click="copyText(currentBankData.titular, 'Titular')" />
                </div>
                <div class="bank-field flex items-center justify-between q-py-xs">
                  <div class="field-info flex flex-column">
                    <span class="field-label text-uppercase">Tipo de Cuenta</span>
                    <span class="field-value">{{ currentBankData.tipo_cuenta }}</span>
                  </div>
                  <q-btn flat round dense size="sm" icon="content_copy" class="copy-btn" @click="copyText(currentBankData.tipo_cuenta, 'Tipo de Cuenta')" />
                </div>
                <div v-if="currentBankData.documento" class="bank-field flex items-center justify-between q-py-xs">
                  <div class="field-info flex flex-column">
                    <span class="field-label text-uppercase">Cédula / RNC</span>
                    <span class="field-value">{{ currentBankData.documento }}</span>
                  </div>
                  <q-btn flat round dense size="sm" icon="content_copy" class="copy-btn" @click="copyText(currentBankData.documento, 'Cédula o RNC')" />
                </div>
              </div>

              <div class="premium-notice flex items-center q-pa-sm">
                <q-icon name="info_outline" size="18px" class="q-mr-xs text-accent" />
                <span class="notice-text">
                  Transfiere exactamente el total y guarda el comprobante de pago.
                </span>
              </div>

              <q-btn
                unelevated
                class="btn-primary full-width q-py-sm"
                label="Registrar Pedido por Transferencia"
                @click="finalizeTransferOrder"
              />
            </div>

            <!-- Fallback when no bank accounts are active -->
            <div v-else class="auth-prompt flex flex-column items-center text-center gap-3 q-py-md">
              <q-icon name="warning" size="40px" class="text-warning" />
              <h4 class="auth-prompt-title font-serif">Transferencia No Disponible</h4>
              <p class="auth-prompt-desc">
                Las transferencias bancarias directas están temporalmente deshabilitadas. Por favor, selecciona "Asesor WhatsApp" para coordinar tu pago.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Login Modal Integration -->
    <AuthDialog v-model="authDialogOpen" @success="onAuthSuccess" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'
import AuthDialog from './AuthDialog.vue'

const emit = defineEmits(['back', 'navigate'])
const store = useShopStore()
const $q = useQuasar()

const paymentMethod = ref('whatsapp')
const guestCheckout = ref(false)
const selectedBankId = ref(null)
const authDialogOpen = ref(false)
const completedOrder = ref(null)

const activeBankAccounts = computed(() => {
  return store.bankAccounts.filter(acc => acc.active)
})

watch(activeBankAccounts, (newVal) => {
  if (newVal.length > 0 && selectedBankId.value === null) {
    selectedBankId.value = newVal[0].id
  }
}, { immediate: true })

const currentBankData = computed(() => {
  if (activeBankAccounts.value.length === 0) return null
  const bank = activeBankAccounts.value.find(acc => acc.id === selectedBankId.value)
  return bank || activeBankAccounts.value[0]
})

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function copyText(text, fieldName) {
  navigator.clipboard.writeText(text).then(() => {
    $q.notify({
      message: 'Copiado al Portapapeles',
      caption: `El campo ${fieldName.toUpperCase()} ha sido copiado.`,
      color: 'white',
      textColor: 'dark',
      classes: 'luxury-toast',
      icon: 'content_copy',
      timeout: 1500,
    })
  })
}

async function onAuthSuccess() {
  guestCheckout.value = false
  if (completedOrder.value && store.currentUser) {
    await store.linkGuestOrder(completedOrder.value.id, store.currentUser.email)
  }
}

async function checkoutWhatsApp() {
  let message =
    'Hola JUAN INVERSIONES, deseo finalizar mi pedido de las siguientes piezas de joyería de ultra-lujo:\n\n'
  message += '💍 DETALLES DEL PEDIDO:\n'

  store.cart.forEach((item) => {
    const sizeDetails = item.selectedSize ? ` (Talla ${item.selectedSize})` : ''
    message += `• ${item.quantity}x ${item.name}${sizeDetails} (${formatPrice(item.price)} c/u) - Total: ${formatPrice(item.price * item.quantity)}\n`
  })

  message += `\n💵 TOTAL ESTIMADO: ${formatPrice(store.cartTotal)}\n`
  message += '📦 Envío: Express Asegurado Sin Costo\n\n'
  message += 'Por favor, indíquenme los pasos para coordinar la entrega en showroom o domicilio.'

  // Registrar orden en local también
  await store.createOrder('whatsapp')

  const whatsappNum = store.whatsappNumber ? store.whatsappNumber.replace(/[^0-9]/g, '') : '5491112345678'
  const url = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
  emit('back')
}

async function finalizeTransferOrder() {
  if (!currentBankData.value) return
  const bankName = currentBankData.value.banco
  $q.loading.show({ message: 'Procesando tu pedido en JUAN INVERSIONES...' })
  try {
    const order = await store.createOrder('transfer', bankName)
    completedOrder.value = order

    $q.notify({
      message: 'Pedido Creado',
      caption: `Número de pedido generado: ${order.id}`,
      color: 'white',
      textColor: 'dark',
      classes: 'luxury-toast',
      icon: 'check_circle',
      timeout: 3000,
    })
  } catch (error) {
    $q.notify({
      message: 'No se pudo registrar el pedido',
      caption: error.message || 'Error al conectar con el servidor.',
      color: 'negative',
    })
  } finally {
    $q.loading.hide()
  }
}
</script>

<style scoped lang="scss">
.checkout-root {
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
.back-btn {
  color: #333333;
}
.brand {
  font-family: 'Playfair Display', serif;
  font-size: 19px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  color: #333333;
}
.brand-avatar {
  border: 1px solid rgba(180, 127, 96, 0.2);
  background: #ffffff;
}

.checkout-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 900px) {
  .checkout-grid {
    grid-template-columns: 1.2fr 1.3fr;
    gap: 32px;
  }
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #333333;
  margin: 0;
}

.summary-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  box-shadow: 0 8px 24px rgba(180, 127, 96, 0.03);
}

.summary-items {
  max-height: 300px;
  overflow-y: auto;

  .item-thumb {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    border: 1px solid rgba(180, 127, 96, 0.1);
    background-color: #fafafa;
  }
  .item-name {
    font-size: 14px;
    font-weight: 700;
    color: #333333;
    margin: 0 0 2px 0;
  }
  .item-qty {
    font-size: 12px;
    color: #666666;
  }
  .item-price {
    font-size: 14px;
    font-weight: 600;
    color: #b47f60;
  }
}

.custom-separator {
  background-color: rgba(180, 127, 96, 0.12);
}

.summary-rows {
  font-size: 13px;
  color: #666666;
  .total-row {
    font-size: 18px;
    font-weight: 700;
    color: #333333;
  }
}

.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.payment-method-card {
  background: #ffffff;
  border: 1px solid rgba(180, 127, 96, 0.15);
  border-radius: 20px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  outline: none;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  color: #666666;

  &:hover {
    border-color: rgba(180, 127, 96, 0.4);
    transform: translateY(-2px);
  }

  &.active {
    border-color: #b47f60;
    background: #f7f2ee; // light accent fill
    color: #b47f60;
    box-shadow: 0 6px 18px rgba(180, 127, 96, 0.08);
  }

  .method-title {
    font-size: 14px;
    font-weight: 700;
    margin: 4px 0 2px 0;
  }

  .method-desc {
    font-size: 10px;
    color: #999999;
  }
}

.method-flow-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  box-shadow: 0 8px 24px rgba(180, 127, 96, 0.03);

  .flow-desc {
    font-size: 13px;
    color: #666666;
    line-height: 1.6;
    margin-bottom: 20px;
  }
}

.btn-primary {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 24px;
  font-weight: 600;
  text-transform: none;
  font-size: 15px;
  padding: 12px 24px;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.15);
  border: 1px solid #b47f60;

  &:hover {
    background: transparent !important;
    color: #b47f60 !important;
    box-shadow: none;
  }
}

.btn-flat {
  text-transform: none;
  font-weight: 600;
}

.auth-prompt {
  .auth-prompt-title {
    font-size: 18px;
    font-weight: 700;
    color: #333333;
    margin: 0;
  }
  .auth-prompt-desc {
    font-size: 12px;
    color: #666666;
    line-height: 1.5;
  }
}

.deposit-details {
  .step-label {
    font-size: 13px;
    font-weight: 600;
    color: #666666;
  }
  .user-badge {
    font-size: 11px;
    background-color: rgba(180, 127, 96, 0.08);
    color: #b47f60;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 500;
  }
}

.bank-selector {
  .bank-card {
    background: #ffffff;
    border: 1px solid rgba(180, 127, 96, 0.15);
    border-radius: 12px;
    padding: 10px;
    cursor: pointer;
    outline: none;
    transition: all 0.25s ease;

    .bank-name {
      font-size: 12px;
      font-weight: 600;
      color: #666666;
    }

    &:hover {
      border-color: rgba(180, 127, 96, 0.3);
    }

    &.active {
      background: #f7f2ee;
      border-color: #b47f60;
      .bank-name {
        color: #b47f60;
      }
    }
  }
}

.bank-details-card {
  background-color: #fcfbfa;
  border-radius: 16px;
  border: 1px solid rgba(180, 127, 96, 0.1);

  .bank-field {
    border-bottom: 1px dashed rgba(180, 127, 96, 0.1);
    &:last-child {
      border-bottom: none;
    }

    .field-label {
      font-size: 8px;
      letter-spacing: 1px;
      color: #999999;
      font-weight: 700;
      margin-bottom: 2px;
    }
    .field-value {
      font-size: 13px;
      color: #333333;
      font-weight: 600;
    }

    .copy-btn {
      color: #999999;
      &:hover {
        color: #b47f60;
      }
    }
  }
}

.premium-notice {
  background: rgba(180, 127, 96, 0.04);
  border-radius: 12px;
  border: 1px dashed rgba(180, 127, 96, 0.15);

  .notice-text {
    font-size: 10px;
    color: #666666;
    font-weight: 500;
  }
}

// Success Screen Layout
.success-screen {
  .success-title {
    font-size: 28px;
    font-weight: 700;
    color: #333333;
    margin: 0 0 6px 0;
  }
  .success-desc {
    font-size: 14px;
    color: #666666;
    max-width: 320px;
    line-height: 1.5;
  }
}

.order-ref-card {
  background-color: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(180, 127, 96, 0.2);
  width: 100%;
  max-width: 340px;
  box-shadow: 0 10px 30px rgba(180, 127, 96, 0.05);

  .ref-label {
    font-size: 10px;
    letter-spacing: 2px;
    color: #999999;
    font-weight: 700;
  }
  .ref-code {
    font-size: 32px;
    font-weight: 700;
    color: #b47f60;
    margin: 8px 0;
    letter-spacing: 1px;
  }
  .ref-instruction {
    font-size: 11px;
    color: #666666;
    line-height: 1.4;
    text-align: center;
    margin: 0;
  }
}

.next-steps-card {
  background-color: #f7f2ee;
  border-radius: 20px;
  border: 1px solid rgba(180, 127, 96, 0.12);
  width: 100%;
  max-width: 340px;
  text-align: left;

  .steps-title {
    font-size: 14px;
    font-weight: 700;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .steps-list {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    color: #666666;
    li {
      margin-bottom: 6px;
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.flex-column {
  display: flex;
  flex-direction: column;
}
.flex-1 {
  flex: 1;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}
</style>
