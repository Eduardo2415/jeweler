<template>
  <div class="orders-root">
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
      <!-- Profile Header -->
      <div class="profile-header flex items-center justify-between q-pa-md q-mb-lg font-sans">
        <div class="flex items-center gap-2">
          <q-icon name="account_circle" size="48px" class="text-accent" />
          <div class="flex flex-column">
            <span class="profile-title font-serif">Mi Cuenta</span>
            <span class="profile-email">{{
              store.currentUser ? store.currentUser.email : 'Invitado'
            }}</span>
          </div>
        </div>
        <q-btn
          v-if="store.currentUser"
          flat
          dense
          icon="logout"
          label="Cerrar Sesión"
          class="btn-logout text-accent"
          @click="handleLogout"
        />
      </div>

      <!-- Main Portal Body -->
      <div class="orders-body">
        <h3 class="section-title font-serif q-mb-lg">Historial de Pedidos</h3>

        <!-- Empty State -->
        <div
          v-if="store.orders.length === 0"
          class="empty-state flex flex-column items-center justify-center q-py-xl text-center font-sans"
        >
          <q-icon name="receipt_long" size="64px" class="text-accent-light q-mb-md" />
          <h4 class="empty-title font-serif">No tienes pedidos registrados</h4>
          <p class="empty-desc">
            Una vez que realices una compra, aparecerá en esta sección de manera automática.
          </p>
          <q-btn
            unelevated
            class="btn-primary q-mt-lg"
            label="Ir a la Tienda"
            @click="$emit('back')"
          />
        </div>

        <!-- Orders List -->
        <div v-else class="orders-list flex flex-column gap-4">
          <div v-for="order in store.orders" :key="order.id" class="order-card q-pa-md font-sans">
            <!-- Order Header info -->
            <div class="order-card-header flex justify-between items-start wrap gap-2 q-mb-md">
              <div class="flex flex-column">
                <span class="order-id font-serif">{{ order.id }}</span>
                <span class="order-date">{{ order.date }}</span>
              </div>
              <div class="flex flex-column items-end">
                <span class="order-total font-serif">{{ formatPrice(order.total) }}</span>
                <span :class="['status-badge', getStatusClass(order.status)]">
                  {{ order.status }}
                </span>
              </div>
            </div>

            <!-- Items summary inside order -->
            <div class="order-items-grid q-mb-md q-pa-sm">
              <div
                v-for="(item, idx) in order.items"
                :key="idx"
                class="order-item flex items-center q-py-xs"
              >
                <q-avatar rounded size="36px" class="q-mr-sm border-light">
                  <q-img :src="item.image" />
                </q-avatar>
                <div class="flex-1">
                  <span class="item-name font-serif text-sm">{{ item.name }}</span>
                  <span class="item-qty text-xs text-muted q-ml-sm">x{{ item.quantity }}</span>
                </div>
                <span class="item-price text-sm">{{
                  formatPrice(item.price * item.quantity)
                }}</span>
              </div>
            </div>

            <!-- Admin Notes / Rejection Comment -->
            <div v-if="order.adminNotes" class="admin-notes-banner q-mb-md q-pa-md">
              <div class="flex items-center text-red font-weight-bold text-sm q-mb-xs">
                <q-icon name="warning" size="18px" class="q-mr-xs" />
                Nota del Asesor:
              </div>
              <p class="admin-notes-text font-sans text-xs text-dark q-mb-none">
                {{ order.adminNotes }}
              </p>
            </div>

            <!-- Receipt upload verification (only for Transfer payment method) -->
            <div v-if="order.paymentMethod === 'transfer'" class="receipt-section q-mt-md q-pa-md">
              <div
                v-if="!order.receiptImage"
                class="flex flex-column items-center text-center gap-2"
              >
                <q-icon name="cloud_upload" size="32px" class="text-accent" />
                <h5 class="receipt-title font-serif">Comprobante de Transferencia</h5>
                <p class="receipt-desc">
                  Sube una foto o captura de tu comprobante de pago para validar la orden en
                  administración.
                </p>

                <q-btn
                  unelevated
                  class="btn-primary"
                  label="Subir Comprobante"
                  @click="triggerFileSelect(order.id)"
                />
                <input
                  type="file"
                  :id="'file-input-' + order.id"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileChange($event, order.id)"
                />
              </div>

              <div v-else class="receipt-loaded flex items-center wrap gap-4">
                <div class="receipt-preview-wrap">
                  <q-img :src="order.receiptImage" class="receipt-preview" />
                </div>
                <div class="receipt-info flex-1 flex flex-column gap-1">
                  <div class="flex items-center text-green font-weight-bold text-sm">
                    <q-icon name="check_circle_outline" size="18px" class="q-mr-xs" />
                    Comprobante Cargado
                  </div>
                  <p class="receipt-subtext">
                    Nuestros asesores están revisando el depósito bancario. Se te notificará cuando
                    se valide la transacción.
                  </p>
                  <q-btn
                    flat
                    dense
                    size="sm"
                    label="Cambiar imagen"
                    class="btn-change-receipt text-accent self-start"
                    @click="triggerFileSelect(order.id)"
                  />
                  <input
                    type="file"
                    :id="'file-input-' + order.id"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileChange($event, order.id)"
                  />
                </div>
              </div>
            </div>

            <div v-else class="receipt-section whatsapp-section q-mt-md q-pa-sm flex items-center">
              <q-icon name="whatsapp" size="20px" class="text-green q-mr-sm" />
              <span class="text-xs text-muted"
                >Compra gestionada externamente a través de WhatsApp.</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'

const emit = defineEmits(['back'])
const store = useShopStore()
const $q = useQuasar()

onMounted(() => {
  store.fetchOrders()
})

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function handleLogout() {
  store.logoutUser()
  $q.notify({
    message: 'Sesión Cerrada',
    caption: 'Esperamos verte de vuelta en JUAN INVERSIONES.',
    color: 'white',
    textColor: 'dark',
    classes: 'luxury-toast',
    icon: 'info',
    timeout: 2000,
  })
  emit('back')
}

function getStatusClass(status) {
  if (status === 'Pendiente de Pago') return 'status-pending-pay'
  if (status === 'Pendiente de Verificación') return 'status-verifying'
  if (status.includes('Completado')) return 'status-completed'
  return 'status-pending'
}

function triggerFileSelect(orderId) {
  const fileInput = document.getElementById(`file-input-${orderId}`)
  if (fileInput) fileInput.click()
}

function handleFileChange(event, orderId) {
  const file = event.target.files[0]
  if (!file) return

  $q.loading.show({ message: 'Subiendo comprobante de pago...' })
  store.uploadReceipt(orderId, file)
    .then((success) => {
      if (success) {
        $q.notify({
          message: 'Comprobante Registrado',
          caption: 'El comprobante ha sido subido correctamente y está en revisión.',
          color: 'white',
          textColor: 'dark',
          classes: 'luxury-toast',
          icon: 'cloud_done',
          timeout: 2500,
        })
      } else {
        $q.notify({
          message: 'Error al subir',
          caption: 'No se pudo vincular el comprobante al pedido.',
          color: 'negative',
          timeout: 3000,
        })
      }
    })
    .catch((error) => {
      $q.notify({
        message: 'Fallo en la subida',
        caption: error.message || 'Error al enviar comprobante.',
        color: 'negative',
        timeout: 3000,
      })
    })
    .finally(() => {
      $q.loading.hide()
    })
}
</script>

<style scoped lang="scss">
.orders-root {
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

.profile-header {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.15);

  .profile-title {
    font-size: 18px;
    font-weight: 700;
    color: #333333;
    line-height: 1.2;
  }
  .profile-email {
    font-size: 12px;
    color: #666666;
  }

  .btn-logout {
    font-size: 12px;
    text-transform: none;
    font-weight: 600;
    border-radius: 12px;
    padding: 6px 12px;
    &:hover {
      background: rgba(180, 127, 96, 0.06);
    }
  }
}

.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #333333;
  margin: 0;
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
    max-width: 280px;
    line-height: 1.5;
  }
}

.btn-primary {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 24px;
  font-weight: 600;
  text-transform: none;
  font-size: 14px;
  padding: 10px 24px;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.15);
  border: 1px solid #b47f60;

  &:hover {
    background: transparent !important;
    color: #b47f60 !important;
    box-shadow: none;
  }
}

.order-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  box-shadow: 0 8px 24px rgba(180, 127, 96, 0.02);

  .order-id {
    font-size: 18px;
    font-weight: 700;
    color: #333333;
  }
  .order-date {
    font-size: 11px;
    color: #999999;
  }

  .order-total {
    font-size: 16px;
    font-weight: 700;
    color: #b47f60;
  }
}

.status-badge {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 3px 10px;
  border-radius: 12px;
  margin-top: 4px;
}

.status-pending-pay {
  background-color: rgba(242, 192, 55, 0.08);
  color: #e2a812;
  border: 1px solid rgba(242, 192, 55, 0.2);
}

.status-verifying {
  background-color: rgba(180, 127, 96, 0.08);
  color: #b47f60;
  border: 1px solid rgba(180, 127, 96, 0.2);
}

.status-completed {
  background-color: rgba(33, 186, 69, 0.08);
  color: #21ba45;
  border: 1px solid rgba(33, 186, 69, 0.2);
}

.order-items-grid {
  background: #faf9f7;
  border-radius: 16px;
  border: 1px solid rgba(180, 127, 96, 0.08);

  .order-item {
    border-bottom: 1px solid rgba(180, 127, 96, 0.05);
    &:last-child {
      border-bottom: none;
    }
  }
}

.border-light {
  border: 1px solid rgba(180, 127, 96, 0.1);
  background-color: #ffffff;
}

.receipt-section {
  background-color: #fafcfb;
  border-radius: 16px;
  border: 1px solid rgba(180, 127, 96, 0.15);

  .receipt-title {
    font-size: 14px;
    font-weight: 700;
    color: #333333;
    margin: 0;
  }
  .receipt-desc {
    font-size: 11px;
    color: #666666;
    line-height: 1.4;
    max-width: 260px;
    margin: 0;
  }
}

.whatsapp-section {
  background-color: #f7faf8;
  border-color: rgba(33, 186, 69, 0.12);
  border-style: dashed;
}

.admin-notes-banner {
  background-color: rgba(219, 40, 40, 0.04);
  border: 1px solid rgba(219, 40, 40, 0.15);
  border-radius: 16px;
  
  .text-red {
    color: #db2828 !important;
  }
}

.receipt-preview-wrap {
  width: 90px;
  height: 110px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(180, 127, 96, 0.2);
  background-color: #ffffff;
  padding: 2px;
}

.receipt-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}

.receipt-subtext {
  font-size: 11px;
  color: #666666;
  line-height: 1.5;
  margin: 4px 0;
}

.btn-change-receipt {
  text-transform: none;
  font-weight: 600;
  padding: 0;
}

.hidden {
  display: none;
}

.flex-column {
  display: flex;
  flex-direction: column;
}
.flex-1 {
  flex: 1;
}
.wrap {
  flex-wrap: wrap;
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
