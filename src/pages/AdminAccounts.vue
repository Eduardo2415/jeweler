<template>
  <q-page class="admin-page-padding font-sans">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-xl">
      <div>
        <h1 class="text-h4 font-serif text-dark q-mb-xs">Cuentas Bancarias</h1>
        <p class="text-subtitle2 text-grey-6 font-sans">
          Administra las cuentas para transferencias que los usuarios verán al pagar.
        </p>
      </div>
      <q-btn
        unelevated
        class="btn-primary"
        label="Añadir Cuenta"
        icon="add"
        @click="openCreateDialog"
      />
    </div>

    <!-- Accounts Table -->
    <div class="table-container shadow-card">
      <q-table
        :rows="store.bankAccounts"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="initialPagination"
        no-data-label="No hay cuentas registradas"
        class="luxury-table"
      >
        <!-- Custom Bank Column -->
        <template v-slot:body-cell-banco="props">
          <q-td :props="props">
            <div class="flex items-center gap-2">
              <q-icon name="account_balance" size="18px" class="text-accent" />
              <span class="text-weight-bold text-dark">{{ props.row.banco }}</span>
            </div>
          </q-td>
        </template>

        <!-- Custom Documento Column (Handle empty optionally) -->
        <template v-slot:body-cell-documento="props">
          <q-td :props="props">
            <span v-if="props.row.documento" class="text-dark">{{ props.row.documento }}</span>
            <span v-else class="text-grey-5 font-italic">No especificado</span>
          </q-td>
        </template>

        <!-- Custom Active status column -->
        <template v-slot:body-cell-active="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.active ? 'positive' : 'grey-6'"
              class="cursor-pointer font-sans text-xs q-py-xs q-px-sm"
              style="border-radius: 6px"
              @click="toggleActiveStatus(props.row)"
              rounded
            >
              {{ props.row.active ? 'Activo' : 'Inactivo' }}
              <q-tooltip class="bg-dark text-white">Click para alternar estado</q-tooltip>
            </q-badge>
          </q-td>
        </template>

        <!-- Actions column -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" class="text-right">
            <q-btn
              flat
              round
              dense
              icon="edit"
              class="action-btn-edit text-grey-7"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip class="bg-dark text-white">Editar Cuenta</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              class="action-btn-delete text-red"
              @click="deleteAccount(props.row)"
            >
              <q-tooltip class="bg-dark text-white">Eliminar Cuenta</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Account Dialog Form -->
    <q-dialog v-model="accountDialogOpen" persistent backdrop-filter="blur(10px)">
      <q-card class="create-card q-pa-lg font-sans">
        <div class="dialog-header flex items-center justify-between q-mb-md">
          <h3 class="dialog-title font-serif">
            {{ isEditing ? 'Editar Cuenta Bancaria' : 'Añadir Nueva Cuenta' }}
          </h3>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="close-btn"
            @click="accountDialogOpen = false"
          />
        </div>

        <q-form @submit.prevent="submitAccount" class="create-form flex flex-column gap-3">
          <q-input
            v-model="newAccount.banco"
            outlined
            label="Nombre del Banco"
            color="accent"
            dense
            :rules="[(val) => !!val || 'El nombre del banco es obligatorio']"
          />

          <q-input
            v-model="newAccount.cuenta"
            outlined
            label="Número de Cuenta"
            color="accent"
            dense
            :rules="[(val) => !!val || 'El número de cuenta es obligatorio']"
          />

          <q-input
            v-model="newAccount.titular"
            outlined
            label="Titular de la Cuenta"
            color="accent"
            dense
            :rules="[(val) => !!val || 'El titular es obligatorio']"
          />

          <div class="row gap-3">
            <q-input
              v-model="newAccount.tipo_cuenta"
              outlined
              label="Tipo de Cuenta (ej: Ahorros, Corriente)"
              color="accent"
              dense
              class="col"
              :rules="[(val) => !!val || 'El tipo de cuenta es obligatorio']"
            />
            <q-input
              v-model="newAccount.documento"
              outlined
              label="Cédula o RNC (opcional)"
              color="accent"
              dense
              class="col"
              placeholder="001-XXXXXXX-X o RNC"
            />
          </div>

          <div class="flex items-center gap-2 q-py-sm">
            <q-checkbox v-model="newAccount.active" color="accent" label="Cuenta Bancaria Activa" />
          </div>

          <q-card-actions align="right" class="q-px-none q-pt-md">
            <q-btn
              flat
              label="Cancelar"
              color="dark"
              class="btn-flat"
              @click="accountDialogOpen = false"
            />
            <q-btn
              unelevated
              type="submit"
              color="accent"
              class="btn-primary"
              :label="isEditing ? 'Guardar Cambios' : 'Añadir Cuenta'"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'
import api from '../services/api'

const store = useShopStore()
const $q = useQuasar()

const accountDialogOpen = ref(false)
const editingAccountId = ref(null)
const isEditing = computed(() => editingAccountId.value !== null)

const newAccount = ref({
  banco: '',
  cuenta: '',
  titular: '',
  tipo_cuenta: '',
  documento: '',
  active: true,
})

const initialPagination = {
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
}

const columns = [
  { name: 'banco', label: 'Banco', align: 'left', field: 'banco', sortable: true },
  { name: 'cuenta', label: 'Cuenta', align: 'left', field: 'cuenta' },
  { name: 'titular', label: 'Titular', align: 'left', field: 'titular', sortable: true },
  { name: 'tipo_cuenta', label: 'Tipo', align: 'left', field: 'tipo_cuenta', sortable: true },
  { name: 'documento', label: 'Cédula / RNC', align: 'left', field: 'documento' },
  { name: 'active', label: 'Estado', align: 'left', field: 'active', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'right' },
]

function openCreateDialog() {
  editingAccountId.value = null
  newAccount.value = {
    banco: '',
    cuenta: '',
    titular: '',
    tipo_cuenta: '',
    documento: '',
    active: true,
  }
  accountDialogOpen.value = true
}

function openEditDialog(account) {
  editingAccountId.value = account.id
  newAccount.value = {
    banco: account.banco,
    cuenta: account.cuenta,
    titular: account.titular,
    tipo_cuenta: account.tipo_cuenta,
    documento: account.documento || '',
    active: account.active,
  }
  accountDialogOpen.value = true
}

async function submitAccount() {
  $q.loading.show({ message: 'Guardando cuenta bancaria...' })
  try {
    const payload = {
      admin_token: localStorage.getItem('ji_admin_token'),
      account_id: editingAccountId.value,
      banco: newAccount.value.banco,
      cuenta: newAccount.value.cuenta,
      titular: newAccount.value.titular,
      tipo_cuenta: newAccount.value.tipo_cuenta,
      documento: newAccount.value.documento.trim() || null,
      active: newAccount.value.active,
    }

    const endpoint = isEditing.value ? '/update-bank-account' : '/create-bank-account'
    const response = await api.post(endpoint, payload)

    if (response.data?.status === 'success') {
      await store.fetchBankAccounts()

      $q.notify({
        message: isEditing.value ? 'Cuenta Actualizada' : 'Cuenta Creada',
        caption: `La cuenta del banco "${newAccount.value.banco}" se guardó con éxito.`,
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'check_circle',
        timeout: 3000,
      })
      accountDialogOpen.value = false
      editingAccountId.value = null
    } else {
      throw new Error(response.data?.message || 'Error al guardar la cuenta bancaria.')
    }
  } catch (error) {
    $q.notify({
      message: 'No se pudo guardar la cuenta',
      caption: error.response?.data?.message || error.message,
      color: 'negative',
      icon: 'error_outline',
      timeout: 3500,
    })
  } finally {
    $q.loading.hide()
  }
}

async function toggleActiveStatus(account) {
  $q.loading.show({ message: 'Modificando estado de la cuenta bancaria...' })
  try {
    const payload = {
      admin_token: localStorage.getItem('ji_admin_token'),
      account_id: account.id,
      banco: account.banco,
      cuenta: account.cuenta,
      titular: account.titular,
      tipo_cuenta: account.tipo_cuenta,
      documento: account.documento || null,
      active: !account.active,
    }

    const response = await api.post('/update-bank-account', payload)
    if (response.data?.status === 'success') {
      await store.fetchBankAccounts()
      $q.notify({
        message: 'Estado Actualizado',
        caption: `La cuenta de "${account.banco}" ahora está ${!account.active ? 'activa' : 'inactiva'}.`,
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'info',
        timeout: 2000,
      })
    } else {
      throw new Error(response.data?.message)
    }
  } catch (error) {
    $q.notify({
      message: 'Error al cambiar estado',
      caption: error.message,
      color: 'negative',
    })
  } finally {
    $q.loading.hide()
  }
}

function deleteAccount(account) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar la cuenta de "${account.banco}"? Esta acción es irreversible.`,
    cancel: {
      flat: true,
      color: 'dark',
      label: 'Cancelar',
    },
    ok: {
      unelevated: true,
      color: 'accent',
      label: 'Eliminar',
    },
    persistent: true,
  }).onOk(async () => {
    $q.loading.show({ message: 'Eliminando cuenta bancaria...' })
    try {
      const response = await api.post('/delete-bank-account', {
        admin_token: localStorage.getItem('ji_admin_token'),
        account_id: account.id,
      })

      if (response.data?.status === 'success') {
        await store.fetchBankAccounts()
        $q.notify({
          message: 'Cuenta Eliminada',
          caption: `La cuenta bancaria de "${account.banco}" fue eliminada.`,
          color: 'white',
          textColor: 'dark',
          classes: 'luxury-toast',
          icon: 'check_circle',
          timeout: 3000,
        })
      } else {
        throw new Error(response.data?.message || 'Error al eliminar la cuenta.')
      }
    } catch (error) {
      $q.notify({
        message: 'No se pudo eliminar la cuenta',
        caption: error.response?.data?.message || error.message,
        color: 'negative',
      })
    } finally {
      $q.loading.hide()
    }
  })
}
</script>

<style scoped lang="scss">
.admin-page-padding {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.shadow-card {
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.08);
  box-shadow: 0 10px 40px rgba(180, 127, 96, 0.03);
  overflow: hidden;
}

.table-container {
  margin-top: 24px;
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

.btn-primary {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  font-size: 14px;
  padding: 10px 20px;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.12);
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
}

.create-card {
  width: 100%;
  max-width: 580px;
  border-radius: 28px !important;
  border: 1px solid rgba(180, 127, 96, 0.12);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.1) !important;
}

.dialog-header {
  .dialog-title {
    font-size: 22px;
    font-weight: 700;
    color: #333333;
    margin: 0;
    letter-spacing: 0.5px;
  }
  .close-btn {
    color: #999999;
    transition: color 0.2s ease;
    &:hover {
      color: #b47f60;
    }
  }
}

.create-form {
  display: flex;
  flex-direction: column;
}

.action-btn-edit {
  transition: color 0.2s ease;
  &:hover {
    color: #b47f60 !important;
  }
}

.action-btn-delete {
  transition: color 0.2s ease;
  &:hover {
    color: #d32f2f !important;
  }
}

.text-accent {
  color: #b47f60;
}

.flex-column {
  display: flex;
  flex-direction: column;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
</style>
