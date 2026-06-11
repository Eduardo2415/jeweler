<template>
  <q-page class="admin-banners-page q-pa-lg">
    <!-- Header Area -->
    <div class="row items-center justify-between q-mb-xl font-sans">
      <div>
        <h1 class="page-title font-serif">Gestión de Banners</h1>
        <p class="page-subtitle">Administra los slides publicitarios del carrusel y configura la velocidad de transición</p>
      </div>
      <q-btn
        unelevated
        class="btn-new-banner"
        label="Nuevo Banner"
        icon="add"
        @click="openCreateDialog"
      />
    </div>

    <!-- Autoplay Interval Settings Card -->
    <q-card class="settings-card q-pa-lg q-mb-xl font-sans" flat bordered>
      <div class="row items-center justify-between gap-4">
        <div class="col-grow">
          <h3 class="card-title font-serif q-mb-xs">Velocidad del Carrusel</h3>
          <p class="card-subtitle text-grey-7 q-mb-none">
            Define el intervalo de tiempo que dura una imagen en cambiar a otra automáticamente (en segundos).
          </p>
        </div>
        <div class="flex items-center gap-3">
          <q-input
            v-model.number="tempIntervalSeconds"
            type="number"
            outlined
            dense
            color="accent"
            suffix="segundos"
            class="interval-input"
            :rules="[
              (val) => val > 0 || 'Debe ser mayor a 0',
              (val) => Number.isInteger(val) || 'Debe ser un número entero',
            ]"
            hide-bottom-space
          />
          <q-btn
            unelevated
            class="btn-save-settings"
            label="Guardar Velocidad"
            icon="save"
            @click="saveAutoplayInterval"
            :loading="savingSettings"
          />
        </div>
      </div>
    </q-card>

    <!-- Banners Table -->
    <div class="table-container font-sans">
      <q-table
        flat
        class="bg-transparent custom-table"
        :rows="store.banners"
        :columns="columns"
        row-key="id"
        :pagination="initialPagination"
        no-data-label="No hay banners registrados"
      >
        <!-- Custom Image column -->
        <template v-slot:body-cell-image="props">
          <q-td :props="props">
            <div class="banner-thumb-wrap">
              <q-img :src="props.row.image" class="banner-thumb" />
            </div>
          </q-td>
        </template>

        <!-- Custom Link column -->
        <template v-slot:body-cell-button_link="props">
          <q-td :props="props">
            <div class="text-caption" v-if="props.row.button_text">
              <q-badge color="accent" outline>{{ props.row.button_text }}</q-badge>
              <div class="text-grey-6 text-xs q-mt-xs">{{ props.row.button_link || 'Sin link' }}</div>
            </div>
            <span v-else class="text-grey-6">Sin botón</span>
          </q-td>
        </template>

        <!-- Custom Active status column -->
        <template v-slot:body-cell-active="props">
          <q-td :props="props">
            <q-badge
              :color="props.row.active ? 'positive' : 'grey-6'"
              class="cursor-pointer"
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
              class="action-btn-edit"
              @click="openEditDialog(props.row)"
            >
              <q-tooltip class="bg-dark text-white">Editar Banner</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              class="action-btn-delete"
              @click="deleteBanner(props.row)"
            >
              <q-tooltip class="bg-dark text-white">Eliminar Banner</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Banner Dialog Form -->
    <q-dialog v-model="bannerDialogOpen" persistent backdrop-filter="blur(10px)">
      <q-card class="create-card q-pa-lg font-sans">
        <div class="dialog-header flex items-center justify-between q-mb-md">
          <h3 class="dialog-title font-serif">
            {{ isEditing ? 'Editar Banner' : 'Añadir Nuevo Banner' }}
          </h3>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="close-btn"
            @click="bannerDialogOpen = false"
          />
        </div>

        <q-form @submit.prevent="submitBanner" class="create-form flex flex-column gap-3">
          <q-input
            v-model="newBanner.title"
            outlined
            label="Título Principal (Grande)"
            color="accent"
            dense
            :rules="[(val) => !!val || 'El título es obligatorio']"
          />

          <q-input
            v-model="newBanner.subtitle"
            outlined
            type="textarea"
            label="Subtítulo / Descripción"
            color="accent"
            dense
            rows="2"
          />

          <div class="row gap-3">
            <q-input
              v-model="newBanner.eyebrow"
              outlined
              label="Antetítulo (Pequeño, ej: Colección)"
              color="accent"
              dense
              class="col"
            />
            <q-input
              v-model.number="newBanner.order"
              type="number"
              outlined
              label="Orden de diapositiva"
              color="accent"
              dense
              class="col"
              :rules="[(val) => val !== null && val !== '' || 'El orden es obligatorio']"
            />
          </div>

          <div class="row gap-3">
            <q-input
              v-model="newBanner.button_text"
              outlined
              label="Texto del botón (opcional)"
              color="accent"
              dense
              class="col"
            />
            <q-input
              v-model="newBanner.button_link"
              outlined
              label="Enlace del botón (Categoría o URL)"
              color="accent"
              dense
              class="col"
              placeholder="Ej: Rings, Chains o URL completa"
            />
          </div>

          <div class="flex items-center justify-start q-py-xs">
            <q-toggle
              v-model="newBanner.active"
              label="Banner Activo"
              color="accent"
            />
          </div>

          <!-- Photo Uploader with Canvas Resize to 1600x600 -->
          <div class="uploader-section flex flex-column gap-2 q-mt-sm">
            <span class="uploader-label flex items-center justify-between">
              <span>Imagen de Banner Apaisada</span>
              <span class="text-caption text-grey-7">Se ajustará a 1600x600px automáticamente</span>
            </span>

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
                  <q-icon name="aspect_ratio" size="24px" class="q-mr-xs text-accent" />
                  <div class="col">
                    <div class="q-uploader__title">Optimizador Carrusel (16:6)</div>
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
            class="btn-submit-banner q-mt-lg"
            :label="isEditing ? 'Guardar Cambios' : 'Crear Banner'"
            type="submit"
          />
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useShopStore } from '../stores/shop'
import api from '../services/api'

const store = useShopStore()
const $q = useQuasar()

const bannerDialogOpen = ref(false)
const editingBannerId = ref(null)
const uploaderRef = ref(null)
const selectedFile = ref(null)
const isEditing = computed(() => editingBannerId.value !== null)

const tempIntervalSeconds = ref(5)
const savingSettings = ref(false)

const newBanner = ref({
  title: '',
  subtitle: '',
  eyebrow: 'Colección',
  image: '',
  button_text: '',
  button_link: '',
  active: true,
  order: 0,
})

// Initialize temp autoplay interval from store
watch(
  () => store.bannerInterval,
  (newVal) => {
    tempIntervalSeconds.value = Math.round(newVal / 1000)
  },
  { immediate: true }
)

const initialPagination = {
  sortBy: 'order',
  descending: false,
  page: 1,
  rowsPerPage: 10,
}

const columns = [
  { name: 'image', label: 'Slide', align: 'left', field: 'image' },
  { name: 'title', label: 'Título', align: 'left', field: 'title', sortable: true },
  { name: 'order', label: 'Orden', align: 'left', field: 'order', sortable: true },
  { name: 'button_link', label: 'Acción Botón', align: 'left', field: 'button_link' },
  { name: 'active', label: 'Estado', align: 'left', field: 'active', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'right' },
]

async function saveAutoplayInterval() {
  if (tempIntervalSeconds.value <= 0) return

  savingSettings.value = true
  try {
    const msValue = tempIntervalSeconds.value * 1000
    const success = await store.updateSettings(msValue)
    if (success) {
      $q.notify({
        message: 'Ajuste Guardado',
        caption: `El carrusel cambiará automáticamente cada ${tempIntervalSeconds.value} segundos.`,
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'check_circle',
      })
    }
  } catch (e) {
    $q.notify({
      message: 'No se pudo guardar la configuración',
      caption: e.message,
      color: 'negative',
    })
  } finally {
    savingSettings.value = false
  }
}

function openCreateDialog() {
  editingBannerId.value = null
  selectedFile.value = null
  newBanner.value = {
    title: '',
    subtitle: '',
    eyebrow: 'Colección',
    image: 'https://images.unsplash.com/photo-1727784892009-f3cf06199b65?w=800',
    button_text: 'Ver Colección ›',
    button_link: 'Rings',
    active: true,
    order: store.banners.length,
  }
  bannerDialogOpen.value = true
}

function openEditDialog(banner) {
  editingBannerId.value = banner.id
  selectedFile.value = null
  newBanner.value = {
    title: banner.title,
    subtitle: banner.subtitle || '',
    eyebrow: banner.eyebrow || 'Colección',
    image: banner.image,
    button_text: banner.button_text || '',
    button_link: banner.button_link || '',
    active: banner.active,
    order: banner.order,
  }
  bannerDialogOpen.value = true
}

// Client-side image resizing and wide center-cropping (1600x600)
function resizeImage(file, maxWidth = 1600, maxHeight = 600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = maxWidth
        canvas.height = maxHeight
        const ctx = canvas.getContext('2d')
        
        // Calculate crop rectangle for 8:3 ratio (1600:600)
        const targetAspect = maxWidth / maxHeight
        const imgAspect = img.width / img.height
        
        let sourceWidth, sourceHeight, sourceX, sourceY
        if (imgAspect > targetAspect) {
          sourceHeight = img.height
          sourceWidth = img.height * targetAspect
          sourceX = (img.width - sourceWidth) / 2
          sourceY = 0
        } else {
          sourceWidth = img.width
          sourceHeight = img.width / targetAspect
          sourceX = 0
          sourceY = (img.height - sourceHeight) / 2
        }
        
        ctx.drawImage(
          img,
          sourceX, sourceY, sourceWidth, sourceHeight, // Source
          0, 0, maxWidth, maxHeight                   // Destination
        )
        
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            })
            resolve(resizedFile)
          } else {
            reject(new Error('Canvas conversion to blob failed.'))
          }
        }, 'image/jpeg', 0.86)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

async function onFileAdded(files) {
  if (files && files[0]) {
    try {
      $q.loading.show({ message: 'Redimensionando y optimizando imagen a 1600x600px...' })
      const resized = await resizeImage(files[0], 1600, 600)
      selectedFile.value = resized
      
      const reader = new FileReader()
      reader.readAsDataURL(resized)
      reader.onload = () => {
        newBanner.value.image = reader.result
      }
    } catch (e) {
      console.error(e)
      $q.notify({
        message: 'No se pudo procesar la imagen',
        color: 'negative',
      })
    } finally {
      $q.loading.hide()
    }
  }
}

function onFileRemoved() {
  selectedFile.value = null
  newBanner.value.image = 'https://images.unsplash.com/photo-1727784892009-f3cf06199b65?w=800'
}

async function submitBanner() {
  let uploadedImageUrl = newBanner.value.image

  if (selectedFile.value) {
    $q.loading.show({ message: 'Subiendo imagen optimizada del banner a MinIO...' })
    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('folder', 'banners') // Upload to "banners/" folder

      const uploadResponse = await api.post('/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (uploadResponse.data && uploadResponse.data.url) {
        uploadedImageUrl = uploadResponse.data.url
      }
    } catch (error) {
      console.warn('Error uploading image to MinIO:', error.message)
      $q.notify({
        message: 'Advertencia',
        caption: 'Error de subida a S3, se usará base64.',
        color: 'warning',
      })
    } finally {
      $q.loading.hide()
    }
  }

  $q.loading.show({ message: 'Guardando banner...' })
  try {
    const payload = {
      admin_token: localStorage.getItem('ji_admin_token'),
      banner_id: editingBannerId.value,
      title: newBanner.value.title,
      subtitle: newBanner.value.subtitle || '',
      eyebrow: newBanner.value.eyebrow || 'Colección',
      image: uploadedImageUrl,
      button_text: newBanner.value.button_text || '',
      button_link: newBanner.value.button_link || '',
      active: newBanner.value.active,
      order: Number(newBanner.value.order) || 0,
    }

    const endpoint = isEditing.value ? '/update-banner' : '/create-banner'
    const response = await api.post(endpoint, payload)

    if (response.data?.status === 'success') {
      await store.fetchBanners()

      $q.notify({
        message: isEditing.value ? 'Banner Actualizado' : 'Banner Creado',
        caption: `El banner "${newBanner.value.title}" se guardó con éxito.`,
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'check_circle',
        timeout: 3000,
      })
      bannerDialogOpen.value = false
      editingBannerId.value = null
    } else {
      throw new Error(response.data?.message || 'Error al guardar el banner.')
    }
  } catch (error) {
    $q.notify({
      message: 'No se pudo guardar el banner',
      caption: error.response?.data?.message || error.message,
      color: 'negative',
      icon: 'error_outline',
      timeout: 3500,
    })
  } finally {
    $q.loading.hide()
  }
}

async function toggleActiveStatus(banner) {
  $q.loading.show({ message: 'Modificando estado del banner...' })
  try {
    const payload = {
      admin_token: localStorage.getItem('ji_admin_token'),
      banner_id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle || '',
      eyebrow: banner.eyebrow || 'Colección',
      image: banner.image,
      button_text: banner.button_text || '',
      button_link: banner.button_link || '',
      active: !banner.active,
      order: banner.order,
    }

    const response = await api.post('/update-banner', payload)
    if (response.data?.status === 'success') {
      await store.fetchBanners()
      $q.notify({
        message: 'Estado Actualizado',
        caption: `El banner "${banner.title}" ahora está ${!banner.active ? 'activo' : 'inactivo'}.`,
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

function deleteBanner(banner) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar el banner "${banner.title}"?`,
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
    $q.loading.show({ message: 'Eliminando banner...' })
    try {
      const response = await api.post('/delete-banner', {
        admin_token: localStorage.getItem('ji_admin_token'),
        banner_id: banner.id,
      })

      if (response.data?.status === 'success') {
        await store.fetchBanners()
        $q.notify({
          message: 'Banner Eliminado',
          caption: `El banner "${banner.title}" ha sido retirado del carrusel.`,
          color: 'white',
          textColor: 'dark',
          classes: 'luxury-toast',
          icon: 'delete',
          timeout: 2000,
        })
      } else {
        throw new Error(response.data?.message)
      }
    } catch (error) {
      $q.notify({
        message: 'No se pudo eliminar el banner',
        caption: error.response?.data?.message || error.message,
        color: 'negative',
        icon: 'error_outline',
      })
    } finally {
      $q.loading.hide()
    }
  })
}
</script>

<style scoped lang="scss">
.admin-banners-page {
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

.btn-new-banner {
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

.settings-card {
  background-color: #ffffff;
  border-radius: 24px;
  border: 1px solid rgba(180, 127, 96, 0.15);
  box-shadow: 0 8px 24px rgba(180, 127, 96, 0.03);

  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: #333333;
    margin: 0;
  }

  .interval-input {
    width: 130px;
    ::v-deep(.q-field__control) {
      border-radius: 12px;
    }
  }

  .btn-save-settings {
    background-color: #b47f60 !important;
    color: #ffffff !important;
    border-radius: 12px;
    font-weight: 600;
    text-transform: none;
    padding: 10px 16px;
    font-size: 13px;
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

.banner-thumb-wrap {
  width: 100px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(180, 127, 96, 0.15);
  background-color: #fafafa;
}

.banner-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.text-accent {
  color: #b47f60;
}

.action-btn-edit {
  color: #666666;
  transition: color 0.2s ease;
  &:hover {
    color: #b47f60;
  }
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
  max-width: 550px;
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

.btn-submit-banner {
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
