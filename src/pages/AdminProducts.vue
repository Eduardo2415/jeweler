<template>
  <q-page class="admin-products-page q-pa-lg">
    <!-- Header Area -->
    <div class="row items-center justify-between q-mb-xl font-sans">
      <div>
        <h1 class="page-title font-serif">Gestión de Inventario</h1>
        <p class="page-subtitle">Añade y administra la colección de joyas exclusivas</p>
      </div>
      <q-btn
        unelevated
        class="btn-new-product"
        label="Nuevo Producto"
        icon="add"
        @click="openCreateDialog"
      />
    </div>

    <!-- Inventory Table -->
    <div class="table-container font-sans">
      <q-table
        flat
        class="bg-transparent custom-table"
        :rows="store.products"
        :columns="columns"
        row-key="id"
        :pagination="initialPagination"
        no-data-label="No hay piezas registradas en la colección"
      >
        <!-- Custom Image column -->
        <template v-slot:body-cell-image="props">
          <q-td :props="props">
            <div class="prod-thumb-wrap">
              <q-img :src="props.row.image" class="prod-thumb" />
            </div>
          </q-td>
        </template>

        <!-- Custom Price column -->
        <template v-slot:body-cell-price="props">
          <q-td :props="props" class="font-serif text-accent">
            {{ formatPrice(props.row.price) }}
          </q-td>
        </template>

        <template v-slot:body-cell-sale-price="props">
          <q-td :props="props">
            <q-badge v-if="hasActiveSale(props.row)" color="positive" rounded>
              {{ formatPrice(props.row.sale_price) }}
            </q-badge>
            <span v-else class="text-grey-6">Sin oferta</span>
          </q-td>
        </template>

        <template v-slot:body-cell-stock="props">
          <q-td :props="props">
            <q-badge :color="props.row.stock > 0 ? 'positive' : 'grey-6'" rounded>
              {{ props.row.stock }} unidades
            </q-badge>
          </q-td>
        </template>

        <!-- Custom Category column -->
        <template v-slot:body-cell-category="props">
          <q-td :props="props">
            <q-badge outline color="accent" class="category-badge">
              {{ getCategoryName(props.row.categoryId) }}
            </q-badge>
          </q-td>
        </template>

        <!-- Custom Rating column -->
        <template v-slot:body-cell-rating="props">
          <q-td :props="props">
            <div class="flex items-center text-amber gap-1">
              <q-icon name="star" size="16px" />
              <span>{{ props.row.rating || '5.0' }}</span>
            </div>
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
              class="action-btn-edit"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip class="bg-dark text-white">Editar Producto</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="inventory_2"
              class="action-btn-stock"
              @click="editStock(props.row)"
            >
              <q-tooltip class="bg-dark text-white">Actualizar Stock</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              class="action-btn-delete"
              @click="deleteProduct(props.row.id)"
            >
              <q-tooltip class="bg-dark text-white">Eliminar Pieza</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Product Dialog Form -->
    <q-dialog v-model="productDialogOpen" persistent backdrop-filter="blur(10px)">
      <q-card class="create-card q-pa-lg font-sans">
        <div class="dialog-header flex items-center justify-between q-mb-md">
          <h3 class="dialog-title font-serif">
            {{ isEditing ? 'Editar Pieza' : 'Añadir Nueva Pieza' }}
          </h3>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="close-btn"
            @click="productDialogOpen = false"
          />
        </div>

        <q-form @submit.prevent="submitProduct" class="create-form flex flex-column gap-3">
          <q-input
            v-model="newProduct.name"
            outlined
            label="Nombre de la Joya"
            color="accent"
            dense
            :rules="[(val) => !!val || 'El nombre es obligatorio']"
          />

          <div class="row gap-3">
            <q-select
              v-model="newProduct.categoryId"
              outlined
              label="Colección / Categoría"
              color="accent"
              :options="categoryOptions"
              emit-value
              map-options
              dense
              class="col"
              :rules="[(val) => !!val || 'La categoría es obligatoria']"
            />
            <q-input
              v-model.number="newProduct.price"
              type="number"
              outlined
              label="Precio (USD)"
              color="accent"
              dense
              class="col"
              :rules="[
                (val) => !!val || 'El precio es obligatorio',
                (val) => val > 0 || 'El precio debe ser mayor a 0',
              ]"
            />
          </div>

          <q-input
            v-model.number="newProduct.sale_price"
            type="number"
            outlined
            label="Precio de oferta (opcional)"
            hint="Debe ser menor que el precio regular"
            color="accent"
            dense
            clearable
            :rules="[
              (val) => val === null || val === '' || val > 0 || 'La oferta debe ser mayor a 0',
              (val) =>
                val === null ||
                val === '' ||
                val < newProduct.price ||
                'La oferta debe ser menor que el precio regular',
            ]"
          />

          <q-input
            v-model.number="newProduct.stock"
            type="number"
            outlined
            label="Cantidad disponible"
            hint="Usa 0 para marcar el producto como agotado"
            color="accent"
            dense
            :rules="[
              (val) => Number.isInteger(val) || 'La cantidad debe ser un número entero',
              (val) => val >= 0 || 'La cantidad no puede ser negativa',
            ]"
          />

          <q-input
            v-model="newProduct.description"
            type="textarea"
            outlined
            label="Descripción del Artículo"
            color="accent"
            dense
            rows="3"
            :rules="[(val) => !!val || 'La descripción es obligatoria']"
          />

          <!-- Photo Uploader ready for MinIO -->
          <div class="uploader-section flex flex-column gap-2">
            <span class="uploader-label">Imagen del Producto</span>

            <q-uploader
              ref="uploaderRef"
              flat
              bordered
              color="accent"
              accept="image/*"
              class="custom-uploader full-width"
              @added="onFileAdded"
              @removed="onFileRemoved"
              hide-upload-btn
            >
              <template v-slot:header="scope">
                <div class="row no-wrap items-center q-pa-sm q-gutter-xs">
                  <q-icon name="cloud_upload" size="24px" class="q-mr-xs text-accent" />
                  <div class="col">
                    <div class="q-uploader__title">Carga de Imagen Premium</div>
                    <div class="q-uploader__subtitle">{{ scope.uploadSizeLabel }}</div>
                  </div>
                  <q-btn v-if="scope.canAddFiles" type="button" icon="add_box" flat round dense>
                    <q-uploader-add-trigger />
                  </q-btn>
                </div>
              </template>
            </q-uploader>
          </div>

          <q-btn
            unelevated
            class="btn-submit-product q-mt-md"
            :label="isEditing ? 'Guardar Cambios' : 'Incorporar al Catálogo'"
            type="submit"
          />
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'
import api from '../services/api'
import { hasActiveSale } from '../utils/pricing'

const store = useShopStore()
const $q = useQuasar()

const productDialogOpen = ref(false)
const editingProductId = ref(null)
const uploaderRef = ref(null)
const selectedFile = ref(null)
const isEditing = computed(() => editingProductId.value !== null)

const newProduct = ref({
  name: '',
  categoryId: null,
  price: null,
  sale_price: null,
  stock: 0,
  description: '',
  image: '',
})

const initialPagination = {
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 10,
}

const columns = [
  { name: 'image', label: 'Pieza', align: 'left', field: 'image' },
  { name: 'name', label: 'Nombre', align: 'left', field: 'name', sortable: true },
  { name: 'category', label: 'Categoría', align: 'left', field: 'categoryId', sortable: true },
  { name: 'price', label: 'Precio', align: 'left', field: 'price', sortable: true },
  { name: 'sale-price', label: 'Oferta', align: 'left', field: 'sale_price', sortable: true },
  { name: 'stock', label: 'Stock', align: 'left', field: 'stock', sortable: true },
  { name: 'rating', label: 'Valoración', align: 'left', field: 'rating', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'right' },
]

const categoryOptions = [
  { label: 'Anillos', value: 1 },
  { label: 'Cadenas', value: 2 },
  { label: 'Relojes', value: 3 },
  { label: 'Pulseras', value: 4 },
  { label: 'Pendientes', value: 5 },
  { label: 'Collares', value: 6 },
]

function formatPrice(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function getCategoryName(categoryId) {
  const opt = categoryOptions.find((c) => c.value === categoryId)
  return opt ? opt.label : 'General'
}

function openCreateDialog() {
  editingProductId.value = null
  selectedFile.value = null
  newProduct.value = {
    name: '',
    categoryId: 1,
    price: null,
    sale_price: null,
    stock: 0,
    description: '',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
  }
  productDialogOpen.value = true
}

function openEditDialog(product) {
  editingProductId.value = product.id
  selectedFile.value = null
  newProduct.value = {
    name: product.name,
    categoryId: product.categoryId,
    price: product.price,
    sale_price: product.sale_price,
    stock: product.stock,
    description: product.description,
    image: product.image,
  }
  productDialogOpen.value = true
}

function onFileAdded(files) {
  if (files && files[0]) {
    selectedFile.value = files[0]
    const reader = new FileReader()
    reader.readAsDataURL(files[0])
    reader.onload = () => {
      newProduct.value.image = reader.result
    }
  }
}

function onFileRemoved() {
  selectedFile.value = null
  newProduct.value.image =
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop'
}

async function submitProduct() {
  let uploadedImageUrl =
    newProduct.value.image ||
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop'

  if (selectedFile.value) {
    $q.loading.show({ message: 'Subiendo imagen a MinIO (vía n8n)...' })
    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('folder', 'productos')

      const uploadResponse = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (uploadResponse.data && uploadResponse.data.url) {
        uploadedImageUrl = uploadResponse.data.url
      }
    } catch (error) {
      console.warn(
        '⚠️ Error de subida a n8n, se utilizará base64 local en prototipo:',
        error.message,
      )
      // Fallback to local Base64 preview
      uploadedImageUrl = newProduct.value.image
    } finally {
      $q.loading.hide()
    }
  }

  $q.loading.show({ message: 'Guardando joya en Directus (vía n8n)...' })
  try {
    const productData = {
      admin_token: localStorage.getItem('ji_admin_token'),
      product_id: editingProductId.value,
      name: newProduct.value.name,
      categoryId: newProduct.value.categoryId,
      price: newProduct.value.price,
      sale_price: newProduct.value.sale_price || null,
      stock: newProduct.value.stock,
      description: newProduct.value.description,
      image: uploadedImageUrl,
    }

    const endpoint = isEditing.value ? '/update-product' : '/create-product'
    const response = await api.post(endpoint, productData)

    // Check response from n8n
    if (response.data?.status === 'success') {
      await store.fetchProducts()

      $q.notify({
        message: isEditing.value ? 'Producto Actualizado' : 'Producto Incorporado',
        caption: isEditing.value
          ? `Los cambios de ${newProduct.value.name} fueron guardados.`
          : `La joya ${newProduct.value.name} ha sido agregada con éxito.`,
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'check_circle',
        timeout: 3000,
      })
      productDialogOpen.value = false
      editingProductId.value = null
    } else {
      throw new Error(response.data?.message || 'No se pudo guardar el producto.')
    }
  } catch (error) {
    $q.notify({
      message: 'No se pudo guardar el producto',
      caption: error.response?.data?.message || error.message || 'Error de conexión con n8n.',
      color: 'negative',
      textColor: 'white',
      icon: 'error_outline',
      timeout: 3500,
    })
  } finally {
    $q.loading.hide()
  }
}

function editStock(product) {
  $q.dialog({
    title: 'Actualizar Stock',
    message: `Indica cuántas unidades hay disponibles de ${product.name}.`,
    prompt: {
      model: String(product.stock ?? 0),
      type: 'number',
      min: 0,
      step: 1,
    },
    cancel: true,
    persistent: true,
  }).onOk(async (value) => {
    const stock = Number(value)

    if (!Number.isInteger(stock) || stock < 0) {
      $q.notify({
        message: 'Cantidad inválida',
        caption: 'El stock debe ser un número entero mayor o igual a cero.',
        color: 'negative',
        textColor: 'white',
      })
      return
    }

    $q.loading.show({ message: 'Actualizando inventario...' })
    try {
      const response = await api.post('/update-product-stock', {
        admin_token: localStorage.getItem('ji_admin_token'),
        product_id: product.id,
        stock,
      })

      if (response.data?.status !== 'success') {
        throw new Error(response.data?.message || 'No se pudo actualizar el stock.')
      }

      await store.fetchProducts()
      $q.notify({
        message: 'Stock Actualizado',
        caption: `${product.name}: ${stock} unidades disponibles.`,
        color: 'positive',
        textColor: 'white',
        icon: 'inventory_2',
      })
    } catch (error) {
      $q.notify({
        message: 'No se pudo actualizar el stock',
        caption: error.response?.data?.message || error.message,
        color: 'negative',
        textColor: 'white',
        icon: 'error_outline',
      })
    } finally {
      $q.loading.hide()
    }
  })
}

function deleteProduct(productId) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de que deseas retirar esta pieza extraordinaria del inventario?',
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
    $q.loading.show({ message: 'Retirando pieza del catálogo...' })

    try {
      const response = await api.post('/delete-product', {
        admin_token: localStorage.getItem('ji_admin_token'),
        product_id: productId,
      })

      if (response.data?.status !== 'success') {
        throw new Error(response.data?.message || 'No se pudo eliminar el producto.')
      }

      await store.fetchProducts()

      $q.notify({
        message: 'Producto Retirado',
        caption: 'La pieza ha sido removida del catálogo.',
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'delete',
        timeout: 2000,
      })
    } catch (error) {
      $q.notify({
        message: 'No se pudo retirar el producto',
        caption: error.response?.data?.message || error.message || 'Error de conexión con n8n.',
        color: 'negative',
        textColor: 'white',
        icon: 'error_outline',
        timeout: 3500,
      })
    } finally {
      $q.loading.hide()
    }
  })
}
</script>

<style scoped lang="scss">
.admin-products-page {
  background-color: #f7f2ee;
  min-height: calc(100vh - 64px);
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #333333;
  margin: 0 0 4px 0;
}

.page-subtitle {
  font-size: 13px;
  color: #666666;
  margin: 0;
}

.btn-new-product {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  font-size: 14px;
  padding: 10px 20px;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.15);
  border: 1px solid #b47f60;
  transition: all 0.3s ease;

  &:hover {
    background-color: transparent !important;
    color: #b47f60 !important;
    box-shadow: none;
  }
}

.table-container {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  padding: 16px;
  box-shadow: 0 8px 24px rgba(180, 127, 96, 0.03);
}

.custom-table {
  ::v-deep(th) {
    font-weight: 600 !important;
    font-size: 13px !important;
    color: #999999 !important;
    border-bottom: 1px solid rgba(180, 127, 96, 0.12) !important;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding: 16px !important;
  }

  ::v-deep(td) {
    font-size: 14px !important;
    color: #333333 !important;
    border-bottom: 1px dashed rgba(180, 127, 96, 0.08) !important;
    padding: 16px !important;
  }

  ::v-deep(tr:last-child td) {
    border-bottom: none !important;
  }
}

.prod-thumb-wrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(180, 127, 96, 0.15);
  background-color: #fafafa;
}

.prod-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-accent {
  color: #b47f60;
}

.category-badge {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 4px 10px;
  border-radius: 8px;
}

.action-btn-delete {
  color: #999999;
  transition: color 0.2s ease;
  &:hover {
    color: #c10015;
  }
}

/* Create Dialog Premium Card */
.create-card {
  width: 100%;
  max-width: 500px;
  background-color: #f7f2ee;
  border-radius: 28px !important;
  border: 1px solid rgba(180, 127, 96, 0.2);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
}

.dialog-header {
  .dialog-title {
    font-size: 22px;
    font-weight: 700;
    color: #333333;
    margin: 0;
  }
  .close-btn {
    color: #666666;
    transition: transform 0.2s ease;
    &:hover {
      transform: rotate(90deg);
      color: #b47f60;
    }
  }
}

.create-form {
  ::v-deep(.q-field__control) {
    border-radius: 16px !important;
    background-color: #ffffff;
  }
}

.uploader-section {
  .uploader-label {
    font-size: 13px;
    font-weight: 600;
    color: #666666;
  }
  .custom-uploader {
    border-radius: 16px;
    border: 1px solid rgba(180, 127, 96, 0.2);
    overflow: hidden;
    background-color: #ffffff;

    ::v-deep(.q-uploader__header) {
      background-color: #f7f2ee;
      color: #333333;
    }
  }
}

.btn-submit-product {
  background-color: #b47f60 !important;
  color: #ffffff !important;
  border-radius: 20px;
  font-weight: 600;
  text-transform: none;
  font-size: 15px;
  padding: 12px 0;
  box-shadow: 0 4px 15px rgba(180, 127, 96, 0.15);
  border: 1px solid #b47f60;
  transition: all 0.3s ease;

  &:hover {
    background-color: transparent !important;
    color: #b47f60 !important;
    box-shadow: none;
  }
}

.gap-3 {
  gap: 12px;
}
.flex-column {
  display: flex;
  flex-direction: column;
}
</style>
