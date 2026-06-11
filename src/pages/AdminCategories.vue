<template>
  <q-page class="admin-categories-page q-pa-lg">
    <!-- Header Area -->
    <div class="row items-center justify-between q-mb-xl font-sans">
      <div>
        <h1 class="page-title font-serif">Gestión de Categorías</h1>
        <p class="page-subtitle">Añade y administra las colecciones y secciones principales de la tienda</p>
      </div>
      <q-btn
        unelevated
        class="btn-new-category"
        label="Nueva Categoría"
        icon="add"
        @click="openCreateDialog"
      />
    </div>

    <!-- Categories Table -->
    <div class="table-container font-sans">
      <q-table
        flat
        class="bg-transparent custom-table"
        :rows="store.categories"
        :columns="columns"
        row-key="id"
        :pagination="initialPagination"
        no-data-label="No hay categorías registradas"
      >
        <!-- Custom Image column -->
        <template v-slot:body-cell-image="props">
          <q-td :props="props">
            <div class="cat-thumb-wrap">
              <q-img :src="props.row.image" class="cat-thumb" />
            </div>
          </q-td>
        </template>

        <!-- Custom Icon column -->
        <template v-slot:body-cell-icon="props">
          <q-td :props="props">
            <div class="flex items-center gap-2">
              <q-icon :name="props.row.icon || 'category'" size="20px" class="text-accent" />
              <span>{{ props.row.icon || 'Sin icono' }}</span>
            </div>
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
              {{ props.row.active ? 'Activa' : 'Desactivada' }}
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
              <q-tooltip class="bg-dark text-white">Editar Categoría</q-tooltip>
            </q-btn>
            <q-btn
              flat
              round
              dense
              icon="delete_outline"
              class="action-btn-delete"
              @click="deleteCategory(props.row)"
            >
              <q-tooltip class="bg-dark text-white">Eliminar Categoría</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Category Dialog Form -->
    <q-dialog v-model="categoryDialogOpen" persistent backdrop-filter="blur(10px)">
      <q-card class="create-card q-pa-lg font-sans">
        <div class="dialog-header flex items-center justify-between q-mb-md">
          <h3 class="dialog-title font-serif">
            {{ isEditing ? 'Editar Categoría' : 'Añadir Nueva Categoría' }}
          </h3>
          <q-btn
            flat
            round
            dense
            icon="close"
            class="close-btn"
            @click="categoryDialogOpen = false"
          />
        </div>

        <q-form @submit.prevent="submitCategory" class="create-form flex flex-column gap-3">
          <q-input
            v-model="newCategory.name"
            outlined
            label="Nombre Comercial (ej. Anillos)"
            color="accent"
            dense
            :rules="[(val) => !!val || 'El nombre es obligatorio']"
            @input="generateValueField"
          />

          <q-input
            v-model="newCategory.value"
            outlined
            label="Valor Identificador / Slug (ej. Rings)"
            color="accent"
            dense
            :rules="[(val) => !!val || 'El identificador es obligatorio']"
            hint="Usado internamente para enlazar productos"
          />

          <div class="row gap-3">
            <q-select
              v-model="newCategory.icon"
              outlined
              label="Icono"
              color="accent"
              :options="iconOptions"
              dense
              class="col"
            />

            <div class="col flex items-center justify-start q-pl-sm">
              <q-toggle
                v-model="newCategory.active"
                label="Categoría Activa"
                color="accent"
              />
            </div>
          </div>

          <!-- Photo Uploader with automatic Canvas Resize -->
          <div class="uploader-section flex flex-column gap-2 q-mt-sm">
            <span class="uploader-label flex items-center justify-between">
              <span>Imagen de Categoría</span>
              <span class="text-caption text-grey-7">Tamaño recomendado: 500x500px</span>
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
                  <q-icon name="photo" size="24px" class="q-mr-xs text-accent" />
                  <div class="col">
                    <div class="q-uploader__title">Optimizador Automático 1:1</div>
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
            class="btn-submit-category q-mt-lg"
            :label="isEditing ? 'Guardar Cambios' : 'Crear Categoría'"
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

const store = useShopStore()
const $q = useQuasar()

const categoryDialogOpen = ref(false)
const editingCategoryId = ref(null)
const uploaderRef = ref(null)
const selectedFile = ref(null)
const isEditing = computed(() => editingCategoryId.value !== null)

const newCategory = ref({
  name: '',
  value: '',
  icon: 'diamond',
  image: '',
  active: true,
})

const initialPagination = {
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 10,
}

const columns = [
  { name: 'image', label: 'Imagen', align: 'left', field: 'image' },
  { name: 'name', label: 'Nombre', align: 'left', field: 'name', sortable: true },
  { name: 'value', label: 'Valor / Slug', align: 'left', field: 'value', sortable: true },
  { name: 'icon', label: 'Icono', align: 'left', field: 'icon', sortable: true },
  { name: 'active', label: 'Estado', align: 'left', field: 'active', sortable: true },
  { name: 'actions', label: 'Acciones', align: 'right' },
]

const iconOptions = ['diamond', 'link', 'schedule', 'wrist', 'jewelry', 'category', 'spa', 'auto_awesome']

function generateValueField() {
  if (!isEditing.value && newCategory.value.name) {
    // English translation/fallback equivalent helper (simplified) or simple slug
    const mapping = {
      anillos: 'Rings',
      cadenas: 'Chains',
      relojes: 'Relojes',
      pulseras: 'Bracelets',
      brazaletes: 'Bracelets',
      aretes: 'Earrings',
      pendientes: 'Earrings',
      collares: 'Collares',
      compromiso: 'Compromiso'
    }
    const cleanName = newCategory.value.name.toLowerCase().trim()
    if (mapping[cleanName]) {
      newCategory.value.value = mapping[cleanName]
    } else {
      newCategory.value.value = newCategory.value.name
        .replace(/[^a-zA-Z0-9]/g, '')
        .trim()
    }
  }
}

function openCreateDialog() {
  editingCategoryId.value = null
  selectedFile.value = null
  newCategory.value = {
    name: '',
    value: '',
    icon: 'diamond',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
    active: true,
  }
  categoryDialogOpen.value = true
}

function openEditDialog(category) {
  editingCategoryId.value = category.id
  selectedFile.value = null
  newCategory.value = {
    name: category.name,
    value: category.value,
    icon: category.icon || 'diamond',
    image: category.image,
    active: category.active,
  }
  categoryDialogOpen.value = true
}

// Client-side image resizing and square center-cropping
function resizeImage(file, maxWidth = 500, maxHeight = 500) {
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
        
        // Calculate center square crop
        const size = Math.min(img.width, img.height)
        const sourceX = (img.width - size) / 2
        const sourceY = (img.height - size) / 2
        
        ctx.drawImage(
          img,
          sourceX, sourceY, size, size, // Source
          0, 0, maxWidth, maxHeight    // Destination
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
        }, 'image/jpeg', 0.88)
      }
      img.onerror = (err) => reject(err)
    }
    reader.onerror = (err) => reject(err)
  })
}

async function onFileAdded(files) {
  if (files && files[0]) {
    try {
      $q.loading.show({ message: 'Redimensionando y optimizando imagen a 500x500px...' })
      const resized = await resizeImage(files[0], 500, 500)
      selectedFile.value = resized
      
      const reader = new FileReader()
      reader.readAsDataURL(resized)
      reader.onload = () => {
        newCategory.value.image = reader.result
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
  newCategory.value.image = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop'
}

async function submitCategory() {
  let uploadedImageUrl = newCategory.value.image

  if (selectedFile.value) {
    $q.loading.show({ message: 'Subiendo imagen optimizada a MinIO...' })
    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      formData.append('folder', 'categorias') // Upload to "categorias/" folder

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

  $q.loading.show({ message: 'Guardando categoría...' })
  try {
    const payload = {
      admin_token: localStorage.getItem('ji_admin_token'),
      category_id: editingCategoryId.value,
      name: newCategory.value.name,
      value: newCategory.value.value,
      icon: newCategory.value.icon,
      image: uploadedImageUrl,
      active: newCategory.value.active,
    }

    const endpoint = isEditing.value ? '/update-category' : '/create-category'
    const response = await api.post(endpoint, payload)

    if (response.data?.status === 'success') {
      await store.fetchCategories()

      $q.notify({
        message: isEditing.value ? 'Categoría Actualizada' : 'Categoría Creada',
        caption: `La categoría ${newCategory.value.name} se guardó con éxito.`,
        color: 'white',
        textColor: 'dark',
        classes: 'luxury-toast',
        icon: 'check_circle',
        timeout: 3000,
      })
      categoryDialogOpen.value = false
      editingCategoryId.value = null
    } else {
      throw new Error(response.data?.message || 'Error al guardar categoría.')
    }
  } catch (error) {
    $q.notify({
      message: 'No se pudo guardar la categoría',
      caption: error.response?.data?.message || error.message,
      color: 'negative',
      icon: 'error_outline',
      timeout: 3500,
    })
  } finally {
    $q.loading.hide()
  }
}

async function toggleActiveStatus(category) {
  $q.loading.show({ message: 'Modificando estado de la categoría...' })
  try {
    const payload = {
      admin_token: localStorage.getItem('ji_admin_token'),
      category_id: category.id,
      name: category.name,
      value: category.value,
      icon: category.icon,
      image: category.image,
      active: !category.active,
    }

    const response = await api.post('/update-category', payload)
    if (response.data?.status === 'success') {
      await store.fetchCategories()
      $q.notify({
        message: 'Estado Actualizado',
        caption: `La categoría ${category.name} ahora está ${!category.active ? 'activa' : 'desactivada'}.`,
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

function deleteCategory(category) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: `¿Estás seguro de que deseas eliminar la categoría "${category.name}"? Los productos vinculados a esta categoría podrían quedar sin sección asignada.`,
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
    $q.loading.show({ message: 'Eliminando categoría...' })
    try {
      const response = await api.post('/delete-category', {
        admin_token: localStorage.getItem('ji_admin_token'),
        category_id: category.id,
      })

      if (response.data?.status === 'success') {
        await store.fetchCategories()
        $q.notify({
          message: 'Categoría Eliminada',
          caption: `La colección "${category.name}" ha sido retirada de la base de datos.`,
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
        message: 'No se pudo eliminar la categoría',
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
.admin-categories-page {
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

.btn-new-category {
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

.cat-thumb-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(180, 127, 96, 0.15);
  background-color: #fafafa;
}

.cat-thumb {
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

.btn-submit-category {
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
