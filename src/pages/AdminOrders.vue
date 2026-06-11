<template>
  <q-page class="admin-page-padding font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h1 class="text-h4 font-serif text-dark q-mb-xs">Gestión de Pedidos</h1>
        <p class="text-subtitle2 text-grey-6 font-sans">
          Valida los comprobantes de transferencias bancarias y realiza seguimiento de las órdenes de ultra-lujo.
        </p>
      </div>
    </div>

    <!-- Dashboard Metrics -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- Total Revenue -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="metric-card shadow-card q-pa-md flex items-center justify-between">
          <div>
            <div class="text-caption text-grey-6 text-uppercase text-weight-bold tracking-wider">Ventas Totales</div>
            <div class="text-h5 text-weight-bold font-serif text-accent q-mt-xs">{{ formatPrice(stats.totalRevenue) }}</div>
          </div>
          <q-avatar rounded color="amber-2" text-color="accent" icon="monetization_on" size="48px" />
        </div>
      </div>
      
      <!-- Pending Verification -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="metric-card shadow-card q-pa-md flex items-center justify-between">
          <div>
            <div class="text-caption text-grey-6 text-uppercase text-weight-bold tracking-wider">Por Verificar</div>
            <div class="text-h5 text-weight-bold font-serif text-dark q-mt-xs">{{ stats.pendingVerification }}</div>
          </div>
          <q-avatar rounded color="orange-2" text-color="orange-9" icon="verified_user" size="48px" />
        </div>
      </div>

      <!-- Total Orders -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="metric-card shadow-card q-pa-md flex items-center justify-between">
          <div>
            <div class="text-caption text-grey-6 text-uppercase text-weight-bold tracking-wider">Pedidos Totales</div>
            <div class="text-h5 text-weight-bold font-serif text-dark q-mt-xs">{{ stats.totalOrders }}</div>
          </div>
          <q-avatar rounded color="blue-2" text-color="blue-9" icon="shopping_bag" size="48px" />
        </div>
      </div>

      <!-- Channel Split -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="metric-card shadow-card q-pa-md flex items-center justify-between">
          <div>
            <div class="text-caption text-grey-6 text-uppercase text-weight-bold tracking-wider">WhatsApp / Transf.</div>
            <div class="text-subtitle1 text-weight-bold text-dark q-mt-xs">
              <span class="text-green">{{ stats.whatsappPct }}%</span>
              <span class="text-grey-4 q-mx-xs">/</span>
              <span class="text-accent">{{ stats.transferPct }}%</span>
            </div>
          </div>
          <q-avatar rounded color="green-2" text-color="green-9" icon="swap_horiz" size="48px" />
        </div>
      </div>
    </div>

    <!-- Filters & Search Toolbar -->
    <div class="shadow-card q-pa-md q-mb-lg bg-white flex items-center justify-between wrap gap-3">
      <!-- Tabs by Status -->
      <q-tabs
        v-model="currentTab"
        dense
        active-color="accent"
        indicator-color="accent"
        align="left"
        class="text-grey-7 font-sans"
        no-caps
      >
        <q-tab name="all" label="Todos" />
        <q-tab name="pending_payment" label="Pendientes de Pago" />
        <q-tab name="pending_verification" label="En Verificación" />
        <q-tab name="completed" label="Completados" />
        <q-tab name="cancelled" label="Cancelados" />
      </q-tabs>

      <!-- Search Bar -->
      <q-input
        v-model="searchQuery"
        outlined
        dense
        placeholder="Buscar por código o correo..."
        color="accent"
        class="search-input"
        bg-color="white"
      >
        <template v-slot:append>
          <q-icon name="search" color="grey-6" />
        </template>
      </q-input>
    </div>

    <!-- Orders Table -->
    <div class="table-container shadow-card">
      <q-table
        :rows="filteredOrders"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="initialPagination"
        no-data-label="No hay pedidos que coincidan con los filtros"
        class="luxury-table"
        :loading="loading"
      >
        <!-- Custom Reference Column -->
        <template v-slot:body-cell-order_id="props">
          <q-td :props="props">
            <span class="text-weight-bold text-dark font-serif text-md">{{ props.row.order_id }}</span>
          </q-td>
        </template>

        <!-- Custom Date Column -->
        <template v-slot:body-cell-date="props">
          <q-td :props="props">
            <span class="text-grey-7 text-xs">{{ props.row.date }}</span>
          </q-td>
        </template>

        <!-- Custom Customer Column -->
        <template v-slot:body-cell-user_email="props">
          <q-td :props="props">
            <div v-if="props.row.user_email" class="flex items-center gap-1">
              <q-icon name="account_circle" size="16px" class="text-accent" />
              <span class="text-dark">{{ props.row.user_email }}</span>
            </div>
            <div v-else>
              <q-badge color="grey-3" text-color="grey-8" class="font-sans text-xs q-py-xs q-px-sm" rounded>
                <q-icon name="person_outline" size="14px" class="q-mr-xs" />
                Invitado
              </q-badge>
            </div>
          </q-td>
        </template>

        <!-- Custom Payment Method Column -->
        <template v-slot:body-cell-payment_method="props">
          <q-td :props="props">
            <div class="flex items-center gap-1">
              <q-icon
                :name="props.row.payment_method === 'whatsapp' ? 'whatsapp' : 'account_balance'"
                size="16px"
                :class="props.row.payment_method === 'whatsapp' ? 'text-green' : 'text-accent'"
              />
              <span class="text-capitalize text-weight-medium text-xs">
                {{ props.row.payment_method === 'whatsapp' ? 'WhatsApp' : 'Transferencia' }}
              </span>
            </div>
            <div v-if="props.row.bank_name" class="text-xxs text-grey-5 font-italic q-mt-xs">
              {{ props.row.bank_name }}
            </div>
          </q-td>
        </template>

        <!-- Custom Total Column -->
        <template v-slot:body-cell-total="props">
          <q-td :props="props">
            <span class="text-weight-bold text-accent font-serif">{{ formatPrice(props.row.total) }}</span>
          </q-td>
        </template>

        <!-- Custom Receipt Column -->
        <template v-slot:body-cell-receipt_image="props">
          <q-td :props="props">
            <div v-if="props.row.receipt_image" class="receipt-thumbnail-wrap cursor-pointer" @click="openReceiptZoom(props.row.receipt_image, props.row.order_id)">
              <q-img :src="props.row.receipt_image" class="receipt-thumbnail" />
              <q-tooltip class="bg-dark text-white">Click para ampliar comprobante</q-tooltip>
            </div>
            <div v-else>
              <span v-if="props.row.payment_method === 'whatsapp'" class="text-grey-5 text-xs font-italic">
                Gestionado por chat
              </span>
              <span v-else class="text-grey-4 text-xs font-italic">
                Sin comprobante
              </span>
            </div>
          </q-td>
        </template>

        <!-- Custom Status Column -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge
              :class="['status-badge font-sans text-xxs text-weight-bold q-py-xs q-px-sm', getStatusClass(props.row.status)]"
              rounded
            >
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>

        <!-- Actions Column -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <div class="row items-center justify-end gap-1">
              <!-- View Detail -->
              <q-btn
                flat
                round
                dense
                icon="visibility"
                class="action-btn-edit text-grey-7"
                @click="openDetailsDialog(props.row)"
              >
                <q-tooltip class="bg-dark text-white">Ver Detalle del Pedido</q-tooltip>
              </q-btn>

              <!-- Approve Payment -->
              <q-btn
                v-if="props.row.status !== 'Completado' && props.row.status !== 'Cancelado'"
                flat
                round
                dense
                icon="check_circle"
                class="text-green"
                @click="updateStatus(props.row.order_id, 'Completado')"
              >
                <q-tooltip class="bg-dark text-white">Aprobar Pago (Completar)</q-tooltip>
              </q-btn>

              <!-- Cancel / Reject Payment -->
              <q-btn
                v-if="props.row.status !== 'Cancelado' && props.row.status !== 'Completado'"
                flat
                round
                dense
                icon="cancel"
                class="text-red"
                @click="confirmCancelOrder(props.row.order_id)"
              >
                <q-tooltip class="bg-dark text-white">Rechazar / Cancelar Pedido</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Receipt Zoom Dialog -->
    <q-dialog v-model="zoomDialogOpen" backdrop-filter="blur(15px)">
      <q-card class="zoom-card q-pa-md font-sans">
        <div class="dialog-header flex items-center justify-between q-mb-md">
          <h3 class="dialog-title font-serif">Comprobante Pedido {{ zoomOrderId }}</h3>
          <q-btn flat round dense icon="close" class="close-btn" @click="zoomDialogOpen = false" />
        </div>
        <div class="flex justify-center items-center overflow-auto max-height-zoom">
          <q-img :src="zoomImageUrl" class="zoomed-image" />
        </div>
      </q-card>
    </q-dialog>

    <!-- Details Dialog -->
    <q-dialog v-model="detailsDialogOpen" persistent backdrop-filter="blur(10px)">
      <q-card class="details-card q-pa-lg font-sans">
        <div class="dialog-header flex items-center justify-between q-mb-md">
          <h3 class="dialog-title font-serif">Detalle del Pedido {{ activeOrder?.order_id }}</h3>
          <q-btn flat round dense icon="close" class="close-btn" @click="detailsDialogOpen = false" />
        </div>

        <q-separator class="q-my-md custom-separator" />

        <div v-if="activeOrder" class="details-body flex flex-column gap-3">
          <!-- Information Rows -->
          <div class="row gap-4 font-sans text-xs">
            <div class="col">
              <span class="text-uppercase text-grey-5 font-bold text-xxs tracking-wider">Fecha:</span>
              <div class="text-dark font-medium text-sm q-mt-xxs">{{ activeOrder.date }}</div>
            </div>
            <div class="col">
              <span class="text-uppercase text-grey-5 font-bold text-xxs tracking-wider">Cliente:</span>
              <div class="text-dark font-medium text-sm q-mt-xxs">
                {{ activeOrder.user_email || 'Invitado (Sin cuenta registrada)' }}
              </div>
            </div>
          </div>

          <div class="row gap-4 font-sans text-xs">
            <div class="col">
              <span class="text-uppercase text-grey-5 font-bold text-xxs tracking-wider">Método de Pago:</span>
              <div class="text-dark font-medium text-sm q-mt-xxs text-capitalize">
                {{ activeOrder.payment_method === 'whatsapp' ? 'WhatsApp' : 'Transferencia Bancaria' }}
                <span v-if="activeOrder.bank_name" class="text-grey-6 text-xs font-normal">({{ activeOrder.bank_name }})</span>
              </div>
            </div>
            <div class="col">
              <span class="text-uppercase text-grey-5 font-bold text-xxs tracking-wider">Estado Actual:</span>
              <div class="q-mt-xxs">
                <q-badge
                  :class="['status-badge font-sans text-xxs text-weight-bold q-py-xs q-px-sm', getStatusClass(activeOrder.status)]"
                  rounded
                >
                  {{ activeOrder.status }}
                </q-badge>
              </div>
            </div>
          </div>

          <q-separator class="q-my-sm" />

          <!-- Items list -->
          <div>
            <span class="text-uppercase text-grey-5 font-bold text-xxs tracking-wider q-mb-sm block">Artículos Comprados:</span>
            <div class="order-items-container flex flex-column gap-2">
              <div v-for="(item, idx) in activeOrder.items" :key="idx" class="order-item-row flex items-center q-pa-sm bg-custom-beige">
                <q-avatar rounded size="42px" class="q-mr-md border-light">
                  <q-img :src="item.image" />
                </q-avatar>
                <div class="flex-1 flex flex-column">
                  <span class="font-serif text-weight-bold text-dark text-sm">{{ item.name }}</span>
                  <div class="flex items-center gap-2 q-mt-xxs">
                    <span class="text-grey-6 text-xs">Cantidad: {{ item.quantity }}</span>
                    <q-badge v-if="item.selectedSize" color="accent" outline dense class="text-xxs">
                      Talla: {{ item.selectedSize }}
                    </q-badge>
                  </div>
                </div>
                <div class="text-right">
                  <span class="text-xs text-grey-6 block">{{ formatPrice(item.price) }} c/u</span>
                  <span class="font-serif text-weight-bold text-accent">{{ formatPrice(item.price * item.quantity) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Summary -->
          <div class="flex justify-between items-center q-pa-md bg-grey-1 total-box rounded-xl">
            <span class="font-sans text-dark font-bold text-sm">Monto Total del Pedido:</span>
            <span class="font-serif text-weight-bold text-accent text-lg">{{ formatPrice(activeOrder.total) }}</span>
          </div>

          <!-- Admin Notes if any -->
          <div v-if="activeOrder.admin_notes" class="admin-notes-box q-pa-md q-mb-sm">
            <span class="text-uppercase text-red-5 font-bold text-xxxs tracking-wider block q-mb-xs">Nota de Rechazo / Comentario de Asesor:</span>
            <div class="text-dark font-medium text-xs">{{ activeOrder.admin_notes }}</div>
          </div>

          <!-- Receipt preview Zoom if any -->
          <div v-if="activeOrder.receipt_image" class="receipt-section-detail bg-grey-1 q-pa-md rounded-xl text-center">
            <span class="text-uppercase text-grey-5 font-bold text-xxs tracking-wider block q-mb-sm">Comprobante de Pago Subido:</span>
            <div class="flex justify-center">
              <q-img
                :src="activeOrder.receipt_image"
                class="receipt-large-preview cursor-pointer"
                @click="openReceiptZoom(activeOrder.receipt_image, activeOrder.order_id)"
              />
            </div>
            <span class="text-xxs text-grey-6 q-mt-xs block font-italic">Haz clic en la imagen para ampliarla</span>
          </div>
        </div>

        <q-card-actions align="right" class="q-px-none q-pt-md">
          <!-- Direct Quick status operations -->
          <div v-if="activeOrder && activeOrder.status !== 'Completado' && activeOrder.status !== 'Cancelado'" class="flex gap-2">
            <q-btn
              unelevated
              color="green"
              icon="check"
              label="Aprobar Pago"
              class="btn-primary"
              @click="updateStatus(activeOrder.order_id, 'Completado'); detailsDialogOpen = false"
            />
            <q-btn
              outline
              color="red"
              icon="close"
              label="Rechazar Pago"
              class="btn-flat"
              @click="confirmCancelOrder(activeOrder.order_id); detailsDialogOpen = false"
            />
          </div>
          <q-space />
          <q-btn
            flat
            label="Cerrar"
            color="dark"
            class="btn-flat"
            @click="detailsDialogOpen = false"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Rejection / Cancellation Dialog -->
    <q-dialog v-model="cancelDialogOpen" persistent backdrop-filter="blur(10px)">
      <q-card class="details-card q-pa-lg font-sans">
        <div class="dialog-header flex items-center justify-between q-mb-md">
          <h3 class="dialog-title font-serif text-red">Rechazar / Cancelar Pedido</h3>
          <q-btn flat round dense icon="close" class="close-btn" @click="cancelDialogOpen = false" />
        </div>

        <q-separator class="q-my-md custom-separator" />

        <div class="q-mb-md">
          <p class="text-body2 text-grey-7">
            ¿Estás seguro de que deseas cancelar el pedido <strong>{{ orderToCancel }}</strong>?
          </p>
          <p class="text-caption text-grey-5">
            Opcional: Escribe el motivo del rechazo o cancelación. El cliente podrá ver esta nota en su historial de pedidos para corregir el comprobante o saber la razón del rechazo.
          </p>
        </div>

        <q-input
          v-model="cancelReason"
          type="textarea"
          outlined
          rows="3"
          placeholder="Ej: El comprobante no coincide con el monto, o el número de transacción es inválido..."
          color="red"
          bg-color="white"
          class="q-mb-md"
        />

        <q-card-actions align="right" class="q-px-none q-pt-md">
          <q-btn
            flat
            label="Atrás"
            color="dark"
            class="btn-flat"
            @click="cancelDialogOpen = false"
          />
          <q-space />
          <q-btn
            unelevated
            color="red"
            label="Confirmar Cancelación"
            class="btn-primary-red"
            @click="submitCancelOrder"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'

const $q = useQuasar()
const loading = ref(false)
const orders = ref([])
const currentTab = ref('all')
const searchQuery = ref('')

// Dialog controls
const zoomDialogOpen = ref(false)
const zoomImageUrl = ref('')
const zoomOrderId = ref('')

const detailsDialogOpen = ref(false)
const activeOrder = ref(null)

// Rejection / Cancel dialog controls
const cancelDialogOpen = ref(false)
const cancelReason = ref('')
const orderToCancel = ref('')

// Dashboard metrics stats
const stats = computed(() => {
  const completedOrders = orders.value.filter(o => o.status && o.status.includes('Completado'))
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const pendingVerification = orders.value.filter(o => o.status === 'Pendiente de Verificación').length
  const totalOrders = orders.value.length

  const whatsappOrders = orders.value.filter(o => o.payment_method === 'whatsapp').length
  const transferOrders = orders.value.filter(o => o.payment_method !== 'whatsapp').length
  const whatsappPct = totalOrders > 0 ? Math.round((whatsappOrders / totalOrders) * 100) : 0
  const transferPct = totalOrders > 0 ? Math.round((transferOrders / totalOrders) * 100) : 0

  return {
    totalRevenue,
    pendingVerification,
    totalOrders,
    whatsappPct,
    transferPct
  }
})

const initialPagination = {
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 15,
}

const columns = [
  { name: 'order_id', label: 'Referencia', align: 'left', field: 'order_id', sortable: true },
  { name: 'date', label: 'Fecha', align: 'left', field: 'date', sortable: true },
  { name: 'user_email', label: 'Cliente', align: 'left', field: 'user_email', sortable: true },
  { name: 'payment_method', label: 'Método / Canal', align: 'left', field: 'payment_method', sortable: true },
  { name: 'total', label: 'Total', align: 'left', field: 'total', sortable: true },
  { name: 'receipt_image', label: 'Comprobante', align: 'left' },
  { name: 'status', label: 'Estado', align: 'left', field: 'status', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'right' },
]

async function fetchAllOrders() {
  loading.value = true
  try {
    const adminToken = localStorage.getItem('ji_admin_token')
    if (!adminToken) {
      throw new Error('Token administrativo no encontrado. Por favor inicia sesión.')
    }
    const response = await api.post('/get-orders', { admin_token: adminToken })
    if (response.data?.status === 'success') {
      orders.value = response.data.data || []
    } else {
      throw new Error(response.data?.message || 'Error al obtener pedidos.')
    }
  } catch (error) {
    $q.notify({
      message: 'Error de Conexión',
      caption: error.message,
      color: 'negative',
      icon: 'error_outline',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAllOrders()
})

const filteredOrders = computed(() => {
  let list = orders.value

  // 1. Filter by status Tab
  if (currentTab.value === 'pending_payment') {
    list = list.filter(o => o.status === 'Pendiente de Pago')
  } else if (currentTab.value === 'pending_verification') {
    list = list.filter(o => o.status === 'Pendiente de Verificación')
  } else if (currentTab.value === 'completed') {
    list = list.filter(o => o.status.includes('Completado'))
  } else if (currentTab.value === 'cancelled') {
    list = list.filter(o => o.status === 'Cancelado')
  }

  // 2. Search filter
  const query = searchQuery.value.trim().toLowerCase()
  if (query) {
    list = list.filter(o => {
      const refMatch = o.order_id?.toLowerCase().includes(query)
      const emailMatch = o.user_email?.toLowerCase().includes(query)
      const totalMatch = String(o.total).includes(query)
      const bankMatch = o.bank_name?.toLowerCase().includes(query)
      return refMatch || emailMatch || totalMatch || bankMatch
    })
  }

  return list
})

async function updateStatus(orderId, newStatus, adminNotes = null) {
  $q.loading.show({ message: `Actualizando pedido ${orderId} a "${newStatus}"...` })
  try {
    const adminToken = localStorage.getItem('ji_admin_token')
    const response = await api.post('/update-order', {
      admin_token: adminToken,
      order_id: orderId,
      status: newStatus,
      admin_notes: adminNotes || undefined
    })

    if (response.data?.status === 'success') {
      $q.notify({
        message: 'Pedido Actualizado',
        caption: `El pedido ${orderId} ahora está "${newStatus}".`,
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'check_circle',
        timeout: 2500,
      })
      await fetchAllOrders()
    } else {
      throw new Error(response.data?.message || 'Error al actualizar pedido.')
    }
  } catch (error) {
    $q.notify({
      message: 'Error al actualizar estado',
      caption: error.message,
      color: 'negative',
      icon: 'error_outline',
    })
  } finally {
    $q.loading.hide()
  }
}

function confirmCancelOrder(orderId) {
  orderToCancel.value = orderId
  cancelReason.value = ''
  cancelDialogOpen.value = true
}

async function submitCancelOrder() {
  cancelDialogOpen.value = false
  await updateStatus(orderToCancel.value, 'Cancelado', cancelReason.value)
}

function openReceiptZoom(imageUrl, orderId) {
  zoomImageUrl.value = imageUrl
  zoomOrderId.value = orderId
  zoomDialogOpen.value = true
}

function openDetailsDialog(order) {
  activeOrder.value = order
  detailsDialogOpen.value = true
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getStatusClass(status) {
  if (status === 'Pendiente de Pago') return 'status-pending-pay'
  if (status === 'Pendiente de Verificación') return 'status-verifying'
  if (status.includes('Completado')) return 'status-completed'
  return 'status-pending'
}
</script>

<style scoped lang="scss">
.admin-page-padding {
  padding: 40px;
  max-width: 1280px;
  margin: 0 auto;
}

.shadow-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.08);
  box-shadow: 0 10px 40px rgba(180, 127, 96, 0.03);
  overflow: hidden;
}

.search-input {
  width: 320px;
  ::v-deep(.q-field__control) {
    border-radius: 14px !important;
  }
}

.table-container {
  margin-top: 8px;
}

.luxury-table {
  background: #ffffff;
  :deep(.q-table__title) {
    font-family: 'Playfair Display', serif;
    font-weight: 700;
  }
  :deep(thead tr) {
    background-color: #faf7f5;
    border-bottom: 2px solid rgba(180, 127, 96, 0.1);
  }
  :deep(thead th) {
    font-weight: 700;
    color: #666666;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 1px;
    padding: 16px;
  }
  :deep(tbody tr) {
    transition: background-color 0.2s ease;
    &:hover {
      background-color: rgba(180, 127, 96, 0.015);
    }
  }
  :deep(tbody td) {
    padding: 16px;
    border-bottom: 1px solid rgba(180, 127, 96, 0.05);
    font-size: 13px;
    color: #555555;
  }
}

.status-badge {
  font-size: 9px;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  text-transform: uppercase;
}

.status-pending-pay {
  background-color: rgba(242, 192, 55, 0.08) !important;
  color: #d89600 !important;
  border: 1px solid rgba(242, 192, 55, 0.2) !important;
}

.status-verifying {
  background-color: rgba(180, 127, 96, 0.08) !important;
  color: #b47f60 !important;
  border: 1px solid rgba(180, 127, 96, 0.2) !important;
}

.status-completed {
  background-color: rgba(33, 186, 69, 0.08) !important;
  color: #21ba45 !important;
  border: 1px solid rgba(33, 186, 69, 0.2) !important;
}

.status-pending {
  background-color: rgba(0, 0, 0, 0.05) !important;
  color: #666666 !important;
}

.receipt-thumbnail-wrap {
  width: 50px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(180, 127, 96, 0.15);
  padding: 1px;
  background: #ffffff;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: scale(1.08);
    border-color: #b47f60;
  }
}

.receipt-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.btn-primary {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  font-size: 13px;
  padding: 8px 16px;
  border: 1px solid #b47f60;
  transition: all 0.3s ease;

  &:hover {
    background: transparent !important;
    color: #b47f60 !important;
    box-shadow: none;
  }
}

.btn-flat {
  text-transform: none;
  font-weight: 600;
  border-radius: 20px;
  font-size: 13px;
}

// Dialog cards
.zoom-card {
  width: 100%;
  max-width: 500px;
  border-radius: 24px !important;
}

.max-height-zoom {
  max-height: 70vh;
}

.zoomed-image {
  width: 100%;
  height: auto;
  border-radius: 12px;
}

.details-card {
  width: 100%;
  max-width: 600px;
  border-radius: 28px !important;
}

.dialog-header {
  .dialog-title {
    font-size: 20px;
    font-weight: 700;
    color: #333333;
    margin: 0;
  }
  .close-btn {
    color: #999999;
    transition: color 0.2s ease;
    &:hover {
      color: #b47f60;
    }
  }
}

.custom-separator {
  background-color: rgba(180, 127, 96, 0.1);
}

.order-items-container {
  max-height: 200px;
  overflow-y: auto;
}

.bg-custom-beige {
  background-color: #fcfbfa;
  border: 1px solid rgba(180, 127, 96, 0.05);
  border-radius: 14px;
}

.border-light {
  border: 1px solid rgba(180, 127, 96, 0.1);
}

.total-box {
  border-radius: 16px;
  background-color: #f7f2ee;
  border: 1px dashed rgba(180, 127, 96, 0.2);
}

.receipt-large-preview {
  width: 150px;
  height: 200px;
  border-radius: 12px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  object-fit: cover;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.03);
  }
}

.text-xxs {
  font-size: 10px;
}
.text-accent {
  color: #b47f60;
}
.text-dark {
  color: #333333;
}
.block {
  display: block;
}
.rounded-xl {
  border-radius: 16px;
}
.bg-grey-1 {
  background-color: #faf9f8;
}
.flex-column {
  display: flex;
  flex-direction: column;
}

.metric-card {
  height: 90px;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(180, 127, 96, 0.08);
  box-shadow: 0 10px 30px rgba(180, 127, 96, 0.02);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 35px rgba(180, 127, 96, 0.06);
    border-color: rgba(180, 127, 96, 0.2);
  }
}

.admin-notes-box {
  background-color: rgba(193, 27, 23, 0.04);
  border: 1px solid rgba(193, 27, 23, 0.1);
  border-radius: 12px;
}

.btn-primary-red {
  background-color: #db2828 !important;
  color: #ffffff !important;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  font-size: 13px;
  padding: 8px 16px;
  border: 1px solid #db2828;
  transition: all 0.3s ease;

  &:hover {
    background: transparent !important;
    color: #db2828 !important;
    box-shadow: none;
  }
}

.text-xxxs {
  font-size: 9px;
}
</style>
